package com.example.Sneakers.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VoucherDTO {
    @NotBlank(message = "Voucher code is required")
    @Size(max = 50, message = "Voucher code must not exceed 50 characters")
    private String code;

    @NotBlank(message = "Voucher name is required")
    @Size(max = 100, message = "Voucher name must not exceed 100 characters")
    private String name;

    private String description;

    @NotNull(message = "Discount percentage is required")
    @Min(value = 1, message = "Discount percentage must be at least 1%")
    @Max(value = 100, message = "Discount percentage cannot exceed 100%")
    @JsonProperty("discount_percentage")
    private Integer discountPercentage;

    @Min(value = 0, message = "Minimum order value must be non-negative")
    @JsonProperty("min_order_value")
    private Long minOrderValue;

    @Min(value = 0, message = "Maximum discount amount must be non-negative")
    @JsonProperty("max_discount_amount")
    private Long maxDiscountAmount;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Valid from date is required")
    @JsonProperty("valid_from")
    private LocalDateTime validFrom;

    @NotNull(message = "Valid to date is required")
    @JsonProperty("valid_to")
    private LocalDateTime validTo;

    @JsonProperty("is_active")
    private Boolean isActive = true;
}