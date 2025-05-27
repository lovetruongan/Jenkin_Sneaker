package com.example.Sneakers.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSoldStatisticsDTO {
  private Long productId;
  private String productName;
  private Long totalSold;
} 