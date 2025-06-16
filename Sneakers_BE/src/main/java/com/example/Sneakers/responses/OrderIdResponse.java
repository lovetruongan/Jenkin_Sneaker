package com.example.Sneakers.responses;

import com.example.Sneakers.models.Order;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderIdResponse {
    @JsonProperty("id")
    private Long id;

    @JsonProperty("total_money")
    private Long totalMoney;

    public static OrderIdResponse fromOrder(Order order){
        return OrderIdResponse.builder()
                .id(order.getId())
                .totalMoney(order.getTotalMoney())
                .build();
    }
}