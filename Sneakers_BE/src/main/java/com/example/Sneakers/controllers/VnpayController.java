package com.example.Sneakers.controllers;

import com.example.Sneakers.dtos.CreateVnpayPaymentDTO;
import com.example.Sneakers.dtos.VnpayRefundRequestDTO;
import com.example.Sneakers.responses.PaymentResponse;
import com.example.Sneakers.services.IOrderService;
import com.example.Sneakers.services.IReturnService;
import com.example.Sneakers.services.IVnPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/vnpay")
@RequiredArgsConstructor
public class VnpayController {
    private final IVnPayService vnPayService;
    private final IOrderService orderService;
    private final IReturnService returnService;

    @PostMapping("/create-payment")
    public ResponseEntity<PaymentResponse> createPayment(
            @RequestBody CreateVnpayPaymentDTO createVnpayPaymentDTO
    ) {
        String paymentUrl = vnPayService.createOrder(
                createVnpayPaymentDTO.getAmount(),
                createVnpayPaymentDTO.getOrderInfo(),
                createVnpayPaymentDTO.getOrderId()
        );
        PaymentResponse paymentResponse = PaymentResponse.builder()
                .status("OK")
                .message("Successfully created VNPAY payment URL.")
                .url(paymentUrl)
                .build();
        return ResponseEntity.ok(paymentResponse);
    }

    @PostMapping("/refund")
    public ResponseEntity<?> refund(
            @RequestBody VnpayRefundRequestDTO vnpayRefundRequestDTO,
            HttpServletRequest request
    ) {
        try {
            Map<String, String> vnPayResponse = vnPayService.refund(vnpayRefundRequestDTO, request);
            String vnpResponseCode = vnPayResponse.get("vnp_ResponseCode");

            if ("00".equals(vnpResponseCode)) {
                // VNPAY refund was successful, now update our internal status
                returnService.processVnpayRefund(vnpayRefundRequestDTO.getReturnRequestId());
                return ResponseEntity.ok(Map.of("message", "Refund successful", "data", vnPayResponse));
            } else {
                // VNPAY refund failed
                return ResponseEntity.badRequest().body(Map.of("message", "Refund failed", "data", vnPayResponse));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/payment-callback")
    public void paymentCallback(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // Instead of processing here, we redirect to a dedicated frontend route
        // that will handle the logic. We pass all the query parameters along.
        String redirectUrl = "http://localhost:4200/vnpay-return?" + request.getQueryString();
        response.sendRedirect(redirectUrl);
    }
} 