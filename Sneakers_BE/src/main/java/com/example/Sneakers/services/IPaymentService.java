package com.example.Sneakers.services;

import com.example.Sneakers.dtos.PaymentDTO;
import com.example.Sneakers.dtos.ProcessPaymentDTO;
import com.example.Sneakers.models.Payment;
import com.example.Sneakers.responses.PaymentResponse;
import com.example.Sneakers.responses.PaymentUrlResponse;
import com.example.Sneakers.responses.PaymentStatusResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface IPaymentService {
    PaymentUrlResponse createPayment(PaymentDTO paymentDTO, String token) throws Exception;
    PaymentStatusResponse processPayment(ProcessPaymentDTO processPaymentDTO) throws Exception;
    PaymentResponse getPaymentById(Long id) throws Exception;
    PaymentResponse getPaymentByOrderId(Long orderId) throws Exception;
    List<PaymentResponse> getPaymentsByUser(String token) throws Exception;
    Page<PaymentResponse> getAllPayments(Pageable pageable);
    PaymentStatusResponse handlePaymentCallback(Map<String, String> params) throws Exception;
    PaymentResponse cancelPayment(Long paymentId, String reason) throws Exception;
    PaymentResponse refundPayment(Long paymentId, Long amount, String reason) throws Exception;
}