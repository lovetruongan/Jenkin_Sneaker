package com.example.Sneakers.responses;

import com.example.Sneakers.models.Voucher;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VoucherResponse {
    private Long id;
    private String code;
    private String name;
    private String description;

    @JsonProperty("discount_percentage")
    private Integer discountPercentage;

    @JsonProperty("min_order_value")
    private Long minOrderValue;

    @JsonProperty("max_discount_amount")
    private Long maxDiscountAmount;

    private Integer quantity;

    @JsonProperty("remaining_quantity")
    private Integer remainingQuantity;

    @JsonProperty("valid_from")
    private LocalDateTime validFrom;

    @JsonProperty("valid_to")
    private LocalDateTime validTo;

    @JsonProperty("is_active")
    private Boolean isActive;

    @JsonProperty("is_valid")
    private Boolean isValid;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    public static VoucherResponse fromVoucher(Voucher voucher) {
        return VoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .description(voucher.getDescription())
                .discountPercentage(voucher.getDiscountPercentage())
                .minOrderValue(voucher.getMinOrderValue())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .quantity(voucher.getQuantity())
                .remainingQuantity(voucher.getRemainingQuantity())
                .validFrom(voucher.getValidFrom())
                .validTo(voucher.getValidTo())
                .isActive(voucher.getIsActive())
                .isValid(voucher.isValid())
                .createdAt(voucher.getCreatedAt())
                .updatedAt(voucher.getUpdatedAt())
                .build();
    }
}