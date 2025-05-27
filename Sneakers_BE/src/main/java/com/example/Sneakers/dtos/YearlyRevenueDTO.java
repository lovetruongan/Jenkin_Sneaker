package com.example.Sneakers.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class YearlyRevenueDTO {
    private String year;
    private Double revenue;
} 