package com.example.Sneakers.vnpay.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentQueryDTO {

    @NotBlank(message = "Transaction reference is required")
    private String txnRef;

    @NotBlank(message = "Transaction date is required")
    private String transDate;
}