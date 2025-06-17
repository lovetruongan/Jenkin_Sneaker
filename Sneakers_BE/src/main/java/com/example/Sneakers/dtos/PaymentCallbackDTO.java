package com.example.Sneakers.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.Map;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentCallbackDTO {
    @JsonProperty("payment_id")
    private String paymentId;

    @JsonProperty("transaction_id")
    private String transactionId;

    @JsonProperty("status")
    private String status;

    @JsonProperty("amount")
    private String amount;

    @JsonProperty("message")
    private String message;

    @JsonProperty("signature")
    private String signature;

    @JsonProperty("extra_data")
    private Map<String, Object> extraData;
}