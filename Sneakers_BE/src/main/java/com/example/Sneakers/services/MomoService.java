package com.example.Sneakers.services;

import com.example.Sneakers.configurations.MomoConfig;
import com.example.Sneakers.dtos.MomoPaymentResponse;
import com.example.Sneakers.dtos.OrderDTO;
import com.example.Sneakers.exceptions.DataNotFoundException;
import com.example.Sneakers.models.Order;
import com.example.Sneakers.repositories.OrderRepository;
import com.example.Sneakers.utils.MomoSecurity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MomoService implements IMomoService {

    private final MomoConfig momoConfig;
    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public MomoPaymentResponse createPayment(OrderDTO orderDTO) throws Exception {
        String requestId = UUID.randomUUID().toString();
        // Use the internal order ID for MoMo's orderId to ensure uniqueness and trackability
        String orderId = String.valueOf(orderDTO.getId());
        String extraData = String.valueOf(orderDTO.getId()); // Pass internal order ID in extraData

        // Find the order to get the total amount
        Order order = orderRepository.findById(orderDTO.getId())
                .orElseThrow(() -> new DataNotFoundException("Cannot find order with id: " + orderDTO.getId()));

        String orderInfo = "Thanh toán đơn hàng #" + order.getId();
        Long amount = order.getTotalMoney();

        String rawSignature = "accessKey=" + momoConfig.getAccessKey() +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + momoConfig.getIpnUrl() +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + momoConfig.getPartnerCode() +
                "&redirectUrl=" + momoConfig.getRedirectUrl() +
                "&requestId=" + requestId +
                "&requestType=captureWallet";

        String signature = MomoSecurity.signHmacSHA256(rawSignature, momoConfig.getSecretKey());

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("partnerCode", momoConfig.getPartnerCode());
        requestBody.put("accessKey", momoConfig.getAccessKey());
        requestBody.put("requestId", requestId);
        requestBody.put("amount", amount);
        requestBody.put("orderId", orderId);
        requestBody.put("orderInfo", orderInfo);
        requestBody.put("redirectUrl", momoConfig.getRedirectUrl());
        requestBody.put("ipnUrl", momoConfig.getIpnUrl());
        requestBody.put("requestType", "captureWallet");
        requestBody.put("extraData", extraData);
        requestBody.put("lang", "en");
        requestBody.put("signature", signature);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        MomoPaymentResponse momoResponse = restTemplate.postForObject(momoConfig.getApiEndpoint(), entity, MomoPaymentResponse.class);

        if (momoResponse == null || momoResponse.getResultCode() != 0) {
            throw new Exception("Failed to create MoMo payment link");
        }

        return momoResponse;
    }
} 