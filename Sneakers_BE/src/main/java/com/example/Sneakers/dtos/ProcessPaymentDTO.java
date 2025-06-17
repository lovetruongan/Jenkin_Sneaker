package com.example.Sneakers.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProcessPaymentDTO {
    @NotNull(message = "Payment ID is required")
    @JsonProperty("payment_id")
    private Long paymentId;

    @JsonProperty("transaction_id")
    private String transactionId;

    @JsonProperty("gateway_transaction_id")
    private String gatewayTransactionId;

    @JsonProperty("payment_status")
    private String paymentStatus;

    @JsonProperty("gateway_response")
    private String gatewayResponse;

    @JsonProperty("failure_reason")
    private String failureReason;

    @JsonProperty("gateway_fee")
    private Long gatewayFee;
}