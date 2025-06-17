package com.example.Sneakers.controllers;

import com.example.Sneakers.dtos.CreateVnpayPaymentDTO;
import com.example.Sneakers.dtos.VnpayRefundRequestDTO;
import com.example.Sneakers.models.Order;
import com.example.Sneakers.models.OrderStatus;
import com.example.Sneakers.repositories.OrderRepository;
import com.example.Sneakers.responses.PaymentResponse;
import com.example.Sneakers.services.IOrderService;
import com.example.Sneakers.services.IReturnService;
import com.example.Sneakers.services.IVnPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("${api.prefix}/vnpay")
@RequiredArgsConstructor
@Slf4j
public class VnpayController {
    private final IVnPayService vnPayService;
    private final IOrderService orderService;
    private final IReturnService returnService;
    private final OrderRepository orderRepository;

    @PostMapping("/create-payment")
    public ResponseEntity<PaymentResponse> createPayment(
            @RequestBody CreateVnpayPaymentDTO createVnpayPaymentDTO
    ) {
        log.info("VNPAY Create Payment Request: {}", createVnpayPaymentDTO);
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
        log.info("VNPAY Payment URL created successfully for order: {}", createVnpayPaymentDTO.getOrderId());
        return ResponseEntity.ok(paymentResponse);
    }

    @PostMapping("/refund")
    public ResponseEntity<?> refund(
            @RequestBody VnpayRefundRequestDTO vnpayRefundRequestDTO,
            HttpServletRequest request
    ) {
        log.info("=== VNPAY REFUND REQUEST START ===");
        log.info("Refund request data: {}", vnpayRefundRequestDTO);
        log.info("Request IP: {}", request.getRemoteAddr());
        
        try {
            log.info("Calling VnPayService.refund() with orderId: {}, returnRequestId: {}", 
                    vnpayRefundRequestDTO.getOrderId(), vnpayRefundRequestDTO.getReturnRequestId());
            
            Map<String, String> vnPayResponse = vnPayService.refund(vnpayRefundRequestDTO, request);
            
            log.info("VNPAY API Response: {}", vnPayResponse);
            
            String vnpResponseCode = vnPayResponse.get("vnp_ResponseCode");
            log.info("VNPAY Response Code: {}", vnpResponseCode);

            if ("00".equals(vnpResponseCode)) {
                log.info("VNPAY refund successful, updating internal status for returnRequestId: {}", 
                        vnpayRefundRequestDTO.getReturnRequestId());
                
                returnService.processVnpayRefund(vnpayRefundRequestDTO.getReturnRequestId());
                
                log.info("=== VNPAY REFUND REQUEST SUCCESS ===");
                return ResponseEntity.ok(Map.of("message", "Refund successful", "data", vnPayResponse));
            } else {
                log.warn("VNPAY refund failed with response code: {}, response: {}", vnpResponseCode, vnPayResponse);
                log.info("=== VNPAY REFUND REQUEST FAILED ===");
                return ResponseEntity.badRequest().body(Map.of("message", "Refund failed", "data", vnPayResponse));
            }
        } catch (Exception e) {
            log.error("=== VNPAY REFUND REQUEST ERROR ===");
            log.error("Error during VNPAY refund process: ", e);
            log.error("Error message: {}", e.getMessage());
            log.error("Error class: {}", e.getClass().getSimpleName());
            if (e.getCause() != null) {
                log.error("Root cause: {}", e.getCause().getMessage());
            }
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/payment-callback")
    public void paymentCallback(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String status = request.getParameter("vnp_ResponseCode");
        String txnRef = request.getParameter("vnp_TxnRef");
        String transactionNo = request.getParameter("vnp_TransactionNo");
        
        log.info("VNPAY Payment Callback - Status: {}, TxnRef: {}, TransactionNo: {}", status, txnRef, transactionNo);
        
        String redirectUrl;

        try {
            Optional<Order> orderOptional = orderRepository.findByVnpTxnRef(txnRef);

            if (orderOptional.isPresent()) {
                Order order = orderOptional.get();
                redirectUrl = "http://localhost:4200/order-detail/" + order.getId();

                if ("00".equals(status)) {
                    order.setStatus(OrderStatus.PAID);
                    order.setVnpTransactionNo(transactionNo);
                    log.info("Payment successful for order {}. Status updated to PAID. TransactionNo: {}", order.getId(), transactionNo);
                } else {
                    order.setStatus(OrderStatus.PAYMENT_FAILED);
                    log.warn("Payment failed or was cancelled for order {}. Status updated to PAYMENT_FAILED. VNPAY response code: {}", order.getId(), status);
                }
                orderRepository.save(order);
            } else {
                log.error("Order not found for VNPAY TxnRef: {}", txnRef);
                String errorMessage = URLEncoder.encode("Không tìm thấy đơn hàng với mã giao dịch: " + txnRef, StandardCharsets.UTF_8);
                redirectUrl = "http://localhost:4200/history?payment_status=not_found&error=" + errorMessage;
            }
        } catch (Exception e) {
            log.error("Critical error in VNPAY payment callback for TxnRef: {}. Error: {}", txnRef, e.getMessage(), e);
            String errorMessage = URLEncoder.encode("Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại.", StandardCharsets.UTF_8);
            redirectUrl = "http://localhost:4200/history?payment_status=error&error=" + errorMessage;
        }

        response.sendRedirect(redirectUrl);
    }
} 