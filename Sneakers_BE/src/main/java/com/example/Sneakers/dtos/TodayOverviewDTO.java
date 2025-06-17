package com.example.Sneakers.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TodayOverviewDTO {
    private long ordersToday;
    private double revenueToday;
} 