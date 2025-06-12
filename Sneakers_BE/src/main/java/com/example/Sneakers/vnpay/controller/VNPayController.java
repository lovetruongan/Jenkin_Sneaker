package com.example.Sneakers.vnpay.controller;

import com.example.Sneakers.vnpay.dto.*;
import com.example.Sneakers.vnpay.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class VNPayController {

    private final VNPayService vnPayService;

    @PostMapping(value = "/create-payment", produces = "application/json")
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentCreateDTO paymentDTO,
            HttpServletRequest request) {
        log.info("Creating payment for amount: {}", paymentDTO.getAmount());
        PaymentResponse response = vnPayService.createPayment(paymentDTO, request);

        if ("00".equals(response.getCode())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/query")
    public ResponseEntity<String> queryTransaction(
            @Valid @RequestBody PaymentQueryDTO queryDTO,
            HttpServletRequest request) {
        log.info("Querying transaction: {}", queryDTO.getTxnRef());
        String response = vnPayService.queryTransaction(queryDTO, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refund")
    public ResponseEntity<String> refundTransaction(
            @Valid @RequestBody PaymentRefundDTO refundDTO,
            HttpServletRequest request) {
        log.info("Refunding transaction: {} with amount: {}",
                refundDTO.getTxnRef(), refundDTO.getAmount());
        String response = vnPayService.refundTransaction(refundDTO, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<Map<String, String>> vnpayReturn(HttpServletRequest request) {
        log.info("VNPay return callback received");
        Map<String, String> result = vnPayService.handleReturn(request);

        if ("true".equals(result.get("isValid"))) {
            // Handle successful payment
            String responseCode = result.get("vnp_ResponseCode");
            if ("00".equals(responseCode)) {
                log.info("Payment successful for transaction: {}", result.get("vnp_TxnRef"));
                // Update order status in your database
                // You might want to redirect to a success page
            } else {
                log.warn("Payment failed with code: {}", responseCode);
                // Handle failed payment
            }
        } else {
            log.error("Invalid signature in VNPay return");
            // Handle invalid signature
        }

        return ResponseEntity.ok(result);
    }
}