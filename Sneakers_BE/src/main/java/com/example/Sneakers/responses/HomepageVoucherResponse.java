package com.example.Sneakers.responses;

import com.example.Sneakers.models.Voucher;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class HomepageVoucherResponse {
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

    @JsonProperty("remaining_quantity")
    private Integer remainingQuantity;

    @JsonProperty("valid_to")
    private LocalDateTime validTo;

    @JsonProperty("expiration_date_formatted")
    private String expirationDateFormatted;

    @JsonProperty("days_remaining")
    private Long daysRemaining;

    @JsonProperty("is_expiring_soon")
    private Boolean isExpiringSoon;

    @JsonProperty("status_message")
    private String statusMessage;

    public static HomepageVoucherResponse fromVoucher(Voucher voucher) {
        LocalDateTime now = LocalDateTime.now();
        long daysRemaining = ChronoUnit.DAYS.between(now, voucher.getValidTo());
        boolean isExpiringSoon = daysRemaining <= 3 && daysRemaining >= 0;
        
        String statusMessage;
        if (daysRemaining < 0) {
            statusMessage = "Đã hết hạn";
        } else if (daysRemaining == 0) {
            statusMessage = "Hết hạn hôm nay";
        } else if (daysRemaining == 1) {
            statusMessage = "Hết hạn ngày mai";
        } else if (isExpiringSoon) {
            statusMessage = "Còn " + daysRemaining + " ngày";
        } else {
            statusMessage = "Hết hạn " + voucher.getValidTo().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }

        return HomepageVoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .description(voucher.getDescription())
                .discountPercentage(voucher.getDiscountPercentage())
                .minOrderValue(voucher.getMinOrderValue())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .remainingQuantity(voucher.getRemainingQuantity())
                .validTo(voucher.getValidTo())
                .expirationDateFormatted(voucher.getValidTo().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                .daysRemaining(daysRemaining)
                .isExpiringSoon(isExpiringSoon)
                .statusMessage(statusMessage)
                .build();
    }
} 