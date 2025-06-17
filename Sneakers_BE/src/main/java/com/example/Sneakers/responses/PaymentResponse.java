package com.example.Sneakers.responses;

import com.example.Sneakers.models.Payment;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentResponse {
    private Long id;

    @JsonProperty("order_id")
    private Long orderId;

    @JsonProperty("payment_method")
    private String paymentMethod;

    @JsonProperty("payment_status")
    private String paymentStatus;

    private Long amount;

    @JsonProperty("transaction_id")
    private String transactionId;

    @JsonProperty("gateway_transaction_id")
    private String gatewayTransactionId;

    @JsonProperty("payment_date")
    private LocalDateTime paymentDate;

    @JsonProperty("failure_reason")
    private String failureReason;

    @JsonProperty("gateway_fee")
    private Long gatewayFee;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    public static PaymentResponse fromPayment(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .amount(payment.getAmount())
                .transactionId(payment.getTransactionId())
                .gatewayTransactionId(payment.getGatewayTransactionId())
                .paymentDate(payment.getPaymentDate())
                .failureReason(payment.getFailureReason())
                .gatewayFee(payment.getGatewayFee())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}