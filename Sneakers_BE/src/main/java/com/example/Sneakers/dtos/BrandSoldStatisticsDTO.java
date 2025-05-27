package com.example.Sneakers.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrandSoldStatisticsDTO {
    private Long brandId;
    private String brandName;
    private Long totalSold;
    private Double totalRevenue;
} 