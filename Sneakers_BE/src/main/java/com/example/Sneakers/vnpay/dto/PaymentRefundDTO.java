package com.example.Sneakers.vnpay.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRefundDTO {

    @NotBlank(message = "Transaction type is required")
    private String transactionType;

    @NotBlank(message = "Transaction reference is required")
    private String txnRef;

    @NotNull(message = "Amount is required")
    @Min(value = 1000, message = "Amount must be at least 1000 VND")
    private Long amount;

    @NotBlank(message = "Transaction date is required")
    private String transDate;

    @NotBlank(message = "User is required")
    private String user;

    private String transactionNo;
}