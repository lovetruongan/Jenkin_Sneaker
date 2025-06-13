package com.example.Sneakers.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateVnpayPaymentDTO {
    @JsonProperty("amount")
    private Long amount;

    @JsonProperty("order_info")
    private String orderInfo;

    @JsonProperty("order_id")
    private Long orderId;
} 