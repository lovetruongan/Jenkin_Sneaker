package com.example.Sneakers.dtos;

import com.example.Sneakers.models.ReturnRequest;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReturnRequestResponseDTO {
    private Long id;

    @JsonProperty("order_id")
    private Long orderId;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("customer_name")
    private String customerName;

    private String reason;
    private String status;

    @JsonProperty("refund_amount")
    private BigDecimal refundAmount;

    @JsonProperty("admin_notes")
    private String adminNotes;

    @JsonProperty("requested_at")
    private LocalDateTime requestedAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    public static ReturnRequestResponseDTO fromReturnRequest(ReturnRequest returnRequest) {
        return ReturnRequestResponseDTO.builder()
                .id(returnRequest.getId())
                .orderId(returnRequest.getOrder().getId())
                .userId(returnRequest.getOrder().getUser().getId())
                .customerName(returnRequest.getOrder().getFullName())
                .reason(returnRequest.getReason())
                .status(returnRequest.getStatus())
                .refundAmount(returnRequest.getRefundAmount())
                .adminNotes(returnRequest.getAdminNotes())
                .requestedAt(returnRequest.getRequestedAt())
                .updatedAt(returnRequest.getUpdatedAt())
                .build();
    }
} 