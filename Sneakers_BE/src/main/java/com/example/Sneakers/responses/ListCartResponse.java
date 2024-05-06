package com.example.Sneakers.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ListCartResponse {
    private List<CartResponse> carts;
    private long totalCartItems;
}