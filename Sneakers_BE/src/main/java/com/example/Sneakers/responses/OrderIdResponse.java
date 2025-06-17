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
    private Long id;
    public static OrderIdResponse fromOrder(Order order){
        return OrderIdResponse.builder()
                .id(order.getId())
                .build();
    }
}