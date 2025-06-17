package com.example.Sneakers.responses;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ListProductResponse {
    private List<ProductResponse> products;
    private long totalProducts;
}