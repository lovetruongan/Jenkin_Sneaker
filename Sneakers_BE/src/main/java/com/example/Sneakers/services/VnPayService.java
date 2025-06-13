package com.example.Sneakers.services;

import com.example.Sneakers.components.VNPayConfig;
import com.example.Sneakers.components.VNPayUtil;
import com.example.Sneakers.dtos.VnpayRefundRequestDTO;
import com.example.Sneakers.exceptions.DataNotFoundException;
import com.example.Sneakers.models.Order;
import com.example.Sneakers.repositories.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VnPayService implements IVnPayService {
    private final VNPayConfig vnPayConfig;
    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    @Override
    public String createOrder(long total, String orderInfo, Long orderId) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderInfo = orderInfo;
        String orderType = "other";
        String vnp_TxnRef = VNPayUtil.getRandomNumber(8);
        String vnp_IpAddr = "127.0.0.1";
        String vnp_TmnCode = vnPayConfig.getVnp_TmnCode();
        long amount = total * 100;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnp_ReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String vnp_CreateDate = now.format(formatter);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        LocalDateTime expireDate = now.plusMinutes(15);
        String vnp_ExpireDate = expireDate.format(formatter);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new DataNotFoundException("Cannot find order with id: " + orderId));
            order.setVnpTxnRef(vnp_TxnRef);
            orderRepository.save(order);
        } catch (DataNotFoundException e) {
            // Log or handle the exception as needed
        }

        String queryUrl = vnp_Params.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    try {
                        return URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8.toString()) + "=" +
                               URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString());
                    } catch (UnsupportedEncodingException e) {
                        throw new RuntimeException(e);
                    }
                })
                .collect(Collectors.joining("&"));

        String hashData = queryUrl;
        String vnp_SecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getVnp_HashSecret(), hashData);
        String paymentUrl = vnPayConfig.getVnp_Url() + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;

        return paymentUrl;
    }

    @Override
    public Map<String, String> refund(VnpayRefundRequestDTO vnpayRefundRequestDTO, HttpServletRequest request) throws Exception {
        log.info("=== VnPayService.refund() START ===");
        
        long orderId = vnpayRefundRequestDTO.getOrderId();
        log.info("Step 1: Retrieving order with ID: {}", orderId);
        
        Order order;
        try {
            order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new DataNotFoundException("Cannot find order with id: " + orderId));
            log.info("Step 1: Order found - ID: {}, Status: {}, PaymentMethod: {}, TotalMoney: {}", 
                    order.getId(), order.getStatus(), order.getPaymentMethod(), order.getTotalMoney());
        } catch (DataNotFoundException e) {
            log.error("Step 1: Order not found with ID: {}", orderId);
            throw e;
        }

        log.info("Step 2: Validating VNPAY transaction reference");
        String vnp_TxnRef = order.getVnpTxnRef();
        if (vnp_TxnRef == null || vnp_TxnRef.isEmpty()) {
            log.error("Step 2: vnp_TxnRef is missing - Order was not paid via VNPAY");
            throw new RuntimeException("This order was not paid via VNPAY or vnp_TxnRef is missing.");
        }
        log.info("Step 2: vnp_TxnRef found: {}", vnp_TxnRef);

        log.info("Step 3: Validating VNPAY transaction number");
        String vnp_TransactionNo = order.getVnpTransactionNo();
        if (vnp_TransactionNo == null || vnp_TransactionNo.isEmpty()) {
            log.error("Step 3: vnp_TransactionNo is missing - Cannot process refund");
            throw new RuntimeException("Cannot refund VNPAY order without vnp_TransactionNo.");
        }
        log.info("Step 3: vnp_TransactionNo found: {}", vnp_TransactionNo);

        log.info("Step 4: Preparing refund parameters");
        long amount = (long) (order.getTotalMoney() * 100);
        String vnp_Amount = String.valueOf(amount);
        log.info("Step 4: Refund amount: {} (original: {})", vnp_Amount, order.getTotalMoney());

        // Convert LocalDate to LocalDateTime at start of day to include time components
        String vnp_TransactionDate = order.getOrderDate().atStartOfDay().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        log.info("Step 4: Transaction date: {}", vnp_TransactionDate);

        String vnp_RequestId = VNPayUtil.getRandomNumber(8);
        String vnp_Version = "2.1.0";
        String vnp_Command = "refund";
        String vnp_TmnCode = vnPayConfig.getVnp_TmnCode();
        String vnp_TransactionType = "02"; // Full refund
        String vnp_CreateBy = vnpayRefundRequestDTO.getCreatedBy();
        String vnp_CreateDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String vnp_IpAddr = VNPayUtil.getIpAddress(request);
        String vnp_OrderInfo = "Hoan tien don hang " + orderId;

        log.info("Step 4: Basic parameters - RequestId: {}, TmnCode: {}, CreateBy: {}, IpAddr: {}", 
                vnp_RequestId, vnp_TmnCode, vnp_CreateBy, vnp_IpAddr);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_RequestId", vnp_RequestId);
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_TransactionType", vnp_TransactionType);
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_Amount", vnp_Amount);
        vnp_Params.put("vnp_TransactionNo", vnp_TransactionNo);
        vnp_Params.put("vnp_TransactionDate", vnp_TransactionDate);
        vnp_Params.put("vnp_CreateBy", vnp_CreateBy);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);

        log.info("Step 5: Creating secure hash");
        String hash_Data = String.join("|", vnp_RequestId, vnp_Version, vnp_Command, vnp_TmnCode,
                vnp_TransactionType, vnp_TxnRef, vnp_Amount, vnp_TransactionNo, vnp_TransactionDate,
                vnp_CreateBy, vnp_CreateDate, vnp_IpAddr, vnp_OrderInfo);
        log.info("Step 5: Hash data: {}", hash_Data);

        String vnp_SecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getVnp_HashSecret(), hash_Data);
        vnp_Params.put("vnp_SecureHash", vnp_SecureHash);
        log.info("Step 5: Secure hash created: {}", vnp_SecureHash);

        log.info("Step 6: Preparing HTTP request to VNPAY");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(vnp_Params, headers);

        String vnpayApiUrl = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
        log.info("Step 6: VNPAY API URL: {}", vnpayApiUrl);
        log.info("Step 6: Request payload: {}", vnp_Params);

        try {
            log.info("Step 7: Sending POST request to VNPAY");
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(vnpayApiUrl, entity, Map.class);
            
            Map<String, String> response = responseEntity.getBody();
            log.info("Step 7: VNPAY response received - Status: {}, Body: {}", 
                    responseEntity.getStatusCode(), response);
            
            log.info("=== VnPayService.refund() SUCCESS ===");
            return response;
        } catch (HttpClientErrorException e) {
            String responseBody = e.getResponseBodyAsString();
            log.error("Step 7: HTTP Error from VNPAY - Status: {}, Response: {}", e.getStatusCode(), responseBody);
            log.error("=== VnPayService.refund() HTTP ERROR ===");
            throw new RuntimeException("Failed to process VNPAY refund. Status: " + e.getStatusCode() + ". Response: " + responseBody, e);
        } catch (Exception e) {
            log.error("Step 7: Unexpected error during VNPAY API call: ", e);
            log.error("=== VnPayService.refund() UNEXPECTED ERROR ===");
            throw e;
        }
    }
} 