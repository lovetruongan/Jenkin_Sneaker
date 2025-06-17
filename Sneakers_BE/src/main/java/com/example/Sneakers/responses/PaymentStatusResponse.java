package com.example.Sneakers.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentStatusResponse {
    @JsonProperty("payment_id")
    private Long paymentId;

    @JsonProperty("order_id")
    private Long orderId;

    @JsonProperty("payment_status")
    private String paymentStatus;

    @JsonProperty("transaction_id")
    private String transactionId;

    @JsonProperty("amount")
    private Long amount;

    @JsonProperty("payment_method")
    private String paymentMethod;

    private String message;

    @JsonProperty("is_success")
    private Boolean isSuccess;
}