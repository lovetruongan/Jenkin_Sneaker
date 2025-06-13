package com.example.Sneakers.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StripePaymentResponseDTO {
    @JsonProperty("payment_intent_id")
    private String paymentIntentId;

    @JsonProperty("client_secret")
    private String clientSecret;

    @JsonProperty("status")
    private String status;

    @JsonProperty("amount")
    private Long amount;

    @JsonProperty("currency")
    private String currency;

    @JsonProperty("order_id")
    private Long orderId;

    @JsonProperty("message")
    private String message;
} 