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
public class ApplyVoucherDTO {
    @NotBlank(message = "Voucher code is required")
    @JsonProperty("voucher_code")
    private String voucherCode;

    @NotNull(message = "Order total is required")
    @JsonProperty("order_total")
    private Long orderTotal;
}