package com.example.Sneakers.services;

import com.example.Sneakers.dtos.StripePaymentRequestDTO;
import com.example.Sneakers.dtos.StripePaymentResponseDTO;
import com.example.Sneakers.exceptions.DataNotFoundException;
import com.example.Sneakers.models.Order;
import com.example.Sneakers.models.OrderStatus;
import com.example.Sneakers.repositories.OrderRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.SetupIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.SetupIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeService implements IStripeService {
    
    private final OrderRepository orderRepository;

    private Long getShippingCost(String shippingMethod) throws Exception {
        return switch (shippingMethod) {
            case "Tiêu chuẩn" -> 30000L;
            case "Nhanh" -> 40000L;
            case "Hỏa tốc" -> 60000L;
            default -> 0L; // Or throw an exception for unknown method
        };
    }

    @Override
    public StripePaymentResponseDTO createPaymentIntent(StripePaymentRequestDTO request) throws Exception {
        try {
            // Verify order exists
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new DataNotFoundException("Order not found with id: " + request.getOrderId()));
            
            Long shippingCost = getShippingCost(order.getShippingMethod());
            Long totalAmount = request.getAmount() + shippingCost;
            // Create payment intent
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(totalAmount) // Amount in VND (base unit)
                    .setCurrency(request.getCurrency())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .putMetadata("orderId", request.getOrderId().toString())
                    .putMetadata("customerEmail", request.getCustomerEmail() != null ? request.getCustomerEmail() : "")
                    .putMetadata("customerName", request.getCustomerName() != null ? request.getCustomerName() : "")
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            return StripePaymentResponseDTO.builder()
                    .paymentIntentId(intent.getId())
                    .clientSecret(intent.getClientSecret())
                    .status(intent.getStatus())
                    .amount(intent.getAmount())
                    .currency(intent.getCurrency())
                    .orderId(request.getOrderId())
                    .message("Payment intent created successfully")
                    .build();

        } catch (StripeException e) {
            log.error("Stripe error creating payment intent: {}", e.getMessage(), e);
            throw new Exception("Failed to create payment intent: " + e.getMessage());
        }
    }

    @Override
    public StripePaymentResponseDTO confirmPayment(String paymentIntentId) throws Exception {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            
            // Update order status if payment is successful
            if ("succeeded".equals(intent.getStatus())) {
                String orderIdStr = intent.getMetadata().get("orderId");
                if (orderIdStr != null) {
                    Long orderId = Long.parseLong(orderIdStr);
                    Order order = orderRepository.findById(orderId)
                            .orElseThrow(() -> new DataNotFoundException("Order not found with id: " + orderId));
                    
                    // Update order status to processing
                    order.setStatus(OrderStatus.PROCESSING);
                    order.setPaymentMethod("Thanh toán thẻ thành công");
                    orderRepository.save(order);
                }
            }

            return StripePaymentResponseDTO.builder()
                    .paymentIntentId(intent.getId())
                    .status(intent.getStatus())
                    .amount(intent.getAmount())
                    .currency(intent.getCurrency())
                    .orderId(intent.getMetadata().get("orderId") != null ? 
                            Long.parseLong(intent.getMetadata().get("orderId")) : null)
                    .message("Payment status retrieved successfully")
                    .build();

        } catch (StripeException e) {
            log.error("Stripe error retrieving payment intent: {}", e.getMessage(), e);
            throw new Exception("Failed to retrieve payment intent: " + e.getMessage());
        }
    }

    @Override
    public String createPaymentMethodClientSecret() throws Exception {
        try {
            SetupIntentCreateParams params = SetupIntentCreateParams.builder()
                    .addPaymentMethodType("card")
                    .build();

            SetupIntent intent = SetupIntent.create(params);
            return intent.getClientSecret();

        } catch (StripeException e) {
            log.error("Stripe error creating setup intent: {}", e.getMessage(), e);
            throw new Exception("Failed to create setup intent: " + e.getMessage());
        }
    }
} 