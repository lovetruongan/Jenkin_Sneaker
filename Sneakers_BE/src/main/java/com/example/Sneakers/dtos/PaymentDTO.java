package com.example.Sneakers.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentDTO {
    @NotNull(message = "Order ID is required")
    @JsonProperty("order_id")
    private Long orderId;

    @NotBlank(message = "Payment method is required")
    @JsonProperty("payment_method")
    private String paymentMethod;

    @NotNull(message = "Amount is required")
    @Min(value = 1000, message = "Amount must be at least 1000 VND")
    private Long amount;

    @JsonProperty("return_url")
    private String returnUrl;

    @JsonProperty("cancel_url")
    private String cancelUrl;

    private String description;
}