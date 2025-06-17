// PaymentController.java
package com.example.Sneakers.controllers;

import com.example.Sneakers.dtos.PaymentDTO;
import com.example.Sneakers.dtos.ProcessPaymentDTO;
import com.example.Sneakers.responses.PaymentListResponse;
import com.example.Sneakers.responses.PaymentResponse;
import com.example.Sneakers.responses.PaymentStatusResponse;
import com.example.Sneakers.responses.PaymentUrlResponse;
import com.example.Sneakers.services.IPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final IPaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(
            @Valid @RequestBody PaymentDTO paymentDTO,
            @RequestHeader(value = "Authorization", required = false) String token,
            BindingResult result) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }

            PaymentUrlResponse response = paymentService.createPayment(paymentDTO, token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/process")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> processPayment(
            @Valid @RequestBody ProcessPaymentDTO processPaymentDTO,
            BindingResult result) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }

            PaymentStatusResponse response = paymentService.processPayment(processPaymentDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable Long id) {
        try {
            PaymentResponse response = paymentService.getPaymentById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrderId(@PathVariable Long orderId) {
        try {
            PaymentResponse response = paymentService.getPaymentByOrderId(orderId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getPaymentsByUser(
            @RequestHeader("Authorization") String token) {
        try {
            List<PaymentResponse> payments = paymentService.getPaymentsByUser(token);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? 
                    Sort.Direction.DESC : Sort.Direction.ASC;
            PageRequest pageRequest = PageRequest.of(page, limit, Sort.by(direction, sortBy));
            
            Page<PaymentResponse> payments = paymentService.getAllPayments(pageRequest);
            
            PaymentListResponse response = PaymentListResponse.builder()
                    .payments(payments.getContent())
                    .totalPages(payments.getTotalPages())
                    .totalElements(payments.getTotalElements())
                    .currentPage(page)
                    .build();
                    
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/callback/vnpay")
    public ResponseEntity<?> vnpayCallback(@RequestParam Map<String, String> params) {
        try {
            PaymentStatusResponse response = paymentService.handlePaymentCallback(params);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/callback/momo")
    public ResponseEntity<?> momoCallback(@RequestBody Map<String, String> params) {
        try {
            PaymentStatusResponse response = paymentService.handlePaymentCallback(params);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelPayment(
            @PathVariable Long id,
            @RequestParam String reason,
            @RequestHeader("Authorization") String token) {
        try {
            PaymentResponse response = paymentService.cancelPayment(id, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> refundPayment(
            @PathVariable Long id,
            @RequestParam Long amount,
            @RequestParam String reason) {
        try {
            PaymentResponse response = paymentService.refundPayment(id, amount, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/status/{paymentId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable Long paymentId) {
        try {
            PaymentResponse payment = paymentService.getPaymentById(paymentId);
            
            PaymentStatusResponse response = PaymentStatusResponse.builder()
                    .paymentId(payment.getId())
                    .orderId(payment.getOrderId())
                    .paymentStatus(payment.getPaymentStatus())
                    .transactionId(payment.getTransactionId())
                    .amount(payment.getAmount())
                    .paymentMethod(payment.getPaymentMethod())
                    .isSuccess("COMPLETED".equals(payment.getPaymentStatus()))
                    .message("Payment status retrieved successfully")
                    .build();
                    
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}