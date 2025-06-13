package com.example.Sneakers.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VnpayRefundRequestDTO {
    @JsonProperty("return_request_id")
    private Long returnRequestId;

    @JsonProperty("order_id")
    private Long orderId;

    @JsonProperty("amount")
    private Long amount;

    @JsonProperty("order_info")
    private String orderInfo;

    @JsonProperty("created_by")
    private String createdBy;
} 