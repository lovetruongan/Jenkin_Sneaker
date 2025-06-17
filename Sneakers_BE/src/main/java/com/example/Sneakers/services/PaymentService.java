package com.example.Sneakers.services;
import com.example.Sneakers.dtos.PaymentDTO;
import com.example.Sneakers.dtos.ProcessPaymentDTO;
import com.example.Sneakers.exceptions.DataNotFoundException;
import com.example.Sneakers.models.*;
import com.example.Sneakers.repositories.OrderRepository;
import com.example.Sneakers.repositories.PaymentRepository;
import com.example.Sneakers.repositories.PaymentHistoryRepository;
import com.example.Sneakers.responses.PaymentResponse;
import com.example.Sneakers.responses.PaymentUrlResponse;
import com.example.Sneakers.responses.PaymentStatusResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService implements IPaymentService {
    
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;
    private final UserService userService;
    private final VNPayService vnPayService;
    private final MoMoService moMoService;

    @Override
    @Transactional
    public PaymentUrlResponse createPayment(PaymentDTO paymentDTO, String token) throws Exception {
        // Validate order
        Order order = orderRepository.findById(paymentDTO.getOrderId())
                .orElseThrow(() -> new DataNotFoundException("Order not found"));

        // Check if user owns the order
        if (token != null) {
            String extractedToken = token.substring(7);
            User user = userService.getUserDetailsFromToken(extractedToken);
            if (!order.getUser().getId().equals(user.getId())) {
                throw new Exception("You don't have permission to pay for this order");
            }
        }

        // Check if payment already exists
        if (paymentRepository.findByOrderId(paymentDTO.getOrderId()).isPresent()) {
            throw new Exception("Payment for this order already exists");
        }

        // Validate amount matches order total
        if (!paymentDTO.getAmount().equals(order.getTotalMoney())) {
            throw new Exception("Payment amount does not match order total");
        }

        // Create payment record
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(paymentDTO.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .amount(paymentDTO.getAmount())
                .transactionId(generateTransactionId())
                .build();

        payment = paymentRepository.save(payment);

        // Create payment history
        createPaymentHistory(payment, null, PaymentStatus.PENDING, "Payment created", "SYSTEM");

        // Generate payment URL based on method
        String paymentUrl = "";
        String qrCode = null;

        switch (paymentDTO.getPaymentMethod()) {
            case PaymentMethod.VNPAY:
                paymentUrl = vnPayService.createPaymentUrl(payment, paymentDTO.getReturnUrl());
                break;
            case PaymentMethod.MOMO:
                Map<String, String> momoResponse = moMoService.createPayment(payment, paymentDTO.getReturnUrl());
                paymentUrl = momoResponse.get("payUrl");
                qrCode = momoResponse.get("qrCodeUrl");
                break;
            case PaymentMethod.CASH:
                paymentUrl = "/payment/cash/" + payment.getId();
                break;
            case PaymentMethod.BANKING:
                paymentUrl = "/payment/banking/" + payment.getId();
                break;
            default:
                throw new Exception("Unsupported payment method: " + paymentDTO.getPaymentMethod());
        }

        return PaymentUrlResponse.builder()
                .paymentId(payment.getId())
                .paymentUrl(paymentUrl)
                .qrCode(qrCode)
                .paymentMethod(paymentDTO.getPaymentMethod())
                .message("Payment URL created successfully")
                .expiresAt(LocalDateTime.now().plusMinutes(15).toString())
                .build();
    }

    @Override
    @Transactional
    public PaymentStatusResponse processPayment(ProcessPaymentDTO processPaymentDTO) throws Exception {
        Payment payment = paymentRepository.findById(processPaymentDTO.getPaymentId())
                .orElseThrow(() -> new DataNotFoundException("Payment not found"));

        String oldStatus = payment.getPaymentStatus();
        String newStatus = processPaymentDTO.getPaymentStatus();

        // Update payment
        payment.setPaymentStatus(newStatus);
        payment.setGatewayTransactionId(processPaymentDTO.getGatewayTransactionId());
        payment.setPaymentGatewayResponse(processPaymentDTO.getGatewayResponse());
        payment.setFailureReason(processPaymentDTO.getFailureReason());
        payment.setGatewayFee(processPaymentDTO.getGatewayFee());

        if (PaymentStatus.COMPLETED.equals(newStatus)) {
            payment.setPaymentDate(LocalDateTime.now());
            // Update order status
            Order order = payment.getOrder();
            order.setStatus(OrderStatus.PROCESSING);
            orderRepository.save(order);
        }

        payment = paymentRepository.save(payment);

        // Create payment history
        createPaymentHistory(payment, oldStatus, newStatus, "Payment processed", "SYSTEM");

        return PaymentStatusResponse.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrder().getId())
                .paymentStatus(payment.getPaymentStatus())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .isSuccess(PaymentStatus.COMPLETED.equals(newStatus))
                .message(PaymentStatus.COMPLETED.equals(newStatus) ? 
                        "Payment completed successfully" : "Payment failed")
                .build();
    }

    @Override
    public PaymentResponse getPaymentById(Long id) throws Exception {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Payment not found"));
        return PaymentResponse.fromPayment(payment);
    }

    @Override
    public PaymentResponse getPaymentByOrderId(Long orderId) throws Exception {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new DataNotFoundException("Payment not found for order"));
        return PaymentResponse.fromPayment(payment);
    }

    @Override
    public List<PaymentResponse> getPaymentsByUser(String token) throws Exception {
        String extractedToken = token.substring(7);
        User user = userService.getUserDetailsFromToken(extractedToken);
        
        List<Payment> payments = paymentRepository.findByOrderUserId(user.getId());
        return payments.stream()
                .map(PaymentResponse::fromPayment)
                .collect(Collectors.toList());
    }

    @Override
    public Page<PaymentResponse> getAllPayments(Pageable pageable) {
        Page<Payment> payments = paymentRepository.findAll(pageable);
        return payments.map(PaymentResponse::fromPayment);
    }

    @Override
    @Transactional
    public PaymentStatusResponse handlePaymentCallback(Map<String, String> params) throws Exception {
        String paymentId = params.get("payment_id");
        String status = params.get("status");
        String transactionId = params.get("transaction_id");

        Payment payment = paymentRepository.findById(Long.parseLong(paymentId))
                .orElseThrow(() -> new DataNotFoundException("Payment not found"));

        ProcessPaymentDTO processPaymentDTO = ProcessPaymentDTO.builder()
                .paymentId(payment.getId())
                .paymentStatus(status)
                .gatewayTransactionId(transactionId)
                .gatewayResponse(params.toString())
                .build();

        return processPayment(processPaymentDTO);
    }

    @Override
    @Transactional
    public PaymentResponse cancelPayment(Long paymentId, String reason) throws Exception {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new DataNotFoundException("Payment not found"));

        if (!PaymentStatus.PENDING.equals(payment.getPaymentStatus())) {
            throw new Exception("Can only cancel pending payments");
        }

        String oldStatus = payment.getPaymentStatus();
        payment.setPaymentStatus(PaymentStatus.CANCELLED);
        payment.setFailureReason(reason);
        payment = paymentRepository.save(payment);

        createPaymentHistory(payment, oldStatus, PaymentStatus.CANCELLED, reason, "USER");

        return PaymentResponse.fromPayment(payment);
    }

    @Override
    @Transactional
    public PaymentResponse refundPayment(Long paymentId, Long amount, String reason) throws Exception {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new DataNotFoundException("Payment not found"));

        if (!PaymentStatus.COMPLETED.equals(payment.getPaymentStatus())) {
            throw new Exception("Can only refund completed payments");
        }

        if (amount > payment.getAmount()) {
            throw new Exception("Refund amount cannot exceed payment amount");
        }

        // Process refund logic based on payment method
        // This would integrate with actual payment gateways

        String oldStatus = payment.getPaymentStatus();
        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        payment = paymentRepository.save(payment);

        createPaymentHistory(payment, oldStatus, PaymentStatus.REFUNDED, 
                "Refund: " + amount + " - " + reason, "ADMIN");

        return PaymentResponse.fromPayment(payment);
    }

    private void createPaymentHistory(Payment payment, String oldStatus, String newStatus, 
                                    String notes, String updatedBy) {
        PaymentHistory history = PaymentHistory.builder()
                .payment(payment)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .notes(notes)
                .updatedBy(updatedBy)
                .updatedAt(LocalDateTime.now())
                .build();
        paymentHistoryRepository.save(history);
    }

    private String generateTransactionId() {
        return "TXN_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
}