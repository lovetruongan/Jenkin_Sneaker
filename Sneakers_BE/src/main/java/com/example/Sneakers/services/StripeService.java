package com.example.Sneakers.services;

import com.example.Sneakers.dtos.StripePaymentRequestDTO;
import com.example.Sneakers.dtos.StripePaymentResponseDTO;
import com.example.Sneakers.exceptions.DataNotFoundException;
import com.example.Sneakers.models.Order;
import com.example.Sneakers.models.OrderStatus;
import com.example.Sneakers.repositories.OrderRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.SetupIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
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
            Long totalAmountVND = request.getAmount() + shippingCost;
            
            final long VND_MAX_AMOUNT = 99_999_999L;
            final double USD_VND_EXCHANGE_RATE = 25000.0;

            PaymentIntentCreateParams params;

            if (totalAmountVND > VND_MAX_AMOUNT) {
                // Convert to USD and charge in cents
                long totalAmountUSD = Math.round(totalAmountVND / USD_VND_EXCHANGE_RATE);
                long totalAmountCents = totalAmountUSD * 100;

                params = PaymentIntentCreateParams.builder()
                        .setAmount(totalAmountCents)
                        .setCurrency("usd")
                        .setAutomaticPaymentMethods(
                                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                        .setEnabled(true)
                                        .build()
                        )
                        .putMetadata("orderId", request.getOrderId().toString())
                        .putMetadata("customerEmail", request.getCustomerEmail() != null ? request.getCustomerEmail() : "")
                        .putMetadata("customerName", request.getCustomerName() != null ? request.getCustomerName() : "")
                        .build();
            } else {
                // Use VND for amounts under the limit
                params = PaymentIntentCreateParams.builder()
                        .setAmount(totalAmountVND) // Amount in VND (base unit)
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
            }

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
                    order.setPaymentIntentId(intent.getId());
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
    public void refund(String paymentIntentId) throws Exception {
        try {
            RefundCreateParams params = RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId)
                .build();
            Refund refund = Refund.create(params);
            
            // Optionally, handle different refund statuses
            if (!"succeeded".equals(refund.getStatus())) {
                throw new Exception("Refund did not succeed. Status: " + refund.getStatus());
            }

            // Here you might want to find the associated ReturnRequest and update its status to REFUND_COMPLETED
            // This requires a bit more logic to link paymentIntentId back to a ReturnRequest
            
        } catch (StripeException e) {
            log.error("Stripe error creating refund: {}", e.getMessage(), e);
            throw new Exception("Failed to create refund: " + e.getMessage());
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