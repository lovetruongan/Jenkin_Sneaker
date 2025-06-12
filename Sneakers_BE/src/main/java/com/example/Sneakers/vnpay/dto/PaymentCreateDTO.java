package com.example.Sneakers.vnpay.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentCreateDTO {

    @NotNull(message = "Amount is required")
    @Min(value = 1000, message = "Amount must be at least 1000 VND")
    private Long amount;

    private String bankCode;

    private String language = "vn";

    private String orderInfo;

    private Long orderId; // Reference to order in your system
}