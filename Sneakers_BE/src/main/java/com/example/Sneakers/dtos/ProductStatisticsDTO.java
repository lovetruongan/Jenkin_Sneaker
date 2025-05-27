package com.example.Sneakers.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductStatisticsDTO {
    private Long totalProducts;
    private Long soldProducts;
    private Long availableProducts;
} 