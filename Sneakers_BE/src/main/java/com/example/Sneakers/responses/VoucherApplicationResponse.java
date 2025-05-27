package com.example.Sneakers.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VoucherApplicationResponse {
    @JsonProperty("voucher_code")
    private String voucherCode;

    @JsonProperty("voucher_name")
    private String voucherName;

    @JsonProperty("discount_percentage")
    private Integer discountPercentage;

    @JsonProperty("discount_amount")
    private Long discountAmount;

    @JsonProperty("original_total")
    private Long originalTotal;

    @JsonProperty("final_total")
    private Long finalTotal;

    @JsonProperty("is_applied")
    private Boolean isApplied;

    private String message;
}