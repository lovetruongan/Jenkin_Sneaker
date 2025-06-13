package com.example.Sneakers.responses;

import com.example.Sneakers.models.ReturnRequest;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReturnRequestResponse {
    private Long id;
    @JsonProperty("order_id")
    private Long orderId;
    @JsonProperty("user_id")
    private Long userId;
    @JsonProperty("reason")
    private String reason;
    @JsonProperty("status")
    private String status;
    @JsonProperty("requested_at")
    private LocalDateTime requestedAt;
    @JsonProperty("admin_notes")
    private String adminNotes;
    @JsonProperty("refund_amount")
    private BigDecimal refundAmount;
    @JsonProperty("order_status")
    private String orderStatus;
    @JsonProperty("payment_method")
    private String paymentMethod;

    public static ReturnRequestResponse fromReturnRequest(ReturnRequest returnRequest) {
        return ReturnRequestResponse.builder()
                .id(returnRequest.getId())
                .orderId(returnRequest.getOrder().getId())
                .userId(returnRequest.getOrder().getUser().getId())
                .reason(returnRequest.getReason())
                .status(returnRequest.getStatus())
                .requestedAt(returnRequest.getRequestedAt())
                .adminNotes(returnRequest.getAdminNotes())
                .refundAmount(returnRequest.getRefundAmount())
                .orderStatus(returnRequest.getOrder().getStatus())
                .paymentMethod(returnRequest.getOrder().getPaymentMethod())
                .build();
    }
} 