package com.example.Sneakers.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StripePaymentRequestDTO {
    @JsonProperty("amount")
    @Min(value = 1, message = "Amount must be greater than 0")
    private Long amount; // Amount in VND cents

    @JsonProperty("currency")
    @NotBlank(message = "Currency is required")
    private String currency = "vnd";

    @JsonProperty("order_id")
    @Min(value = 1, message = "Order ID must be greater than 0")
    private Long orderId;

    @JsonProperty("payment_method_id")
    private String paymentMethodId;

    @JsonProperty("customer_email")
    private String customerEmail;

    @JsonProperty("customer_name")
    private String customerName;
} 