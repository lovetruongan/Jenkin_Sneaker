package com.sneakers.api.controller;

import com.sneakers.api.dto.DailyRevenueDTO;
import com.sneakers.api.dto.MonthlyRevenueDTO;
import com.sneakers.api.dto.YearlyRevenueDTO;
import com.sneakers.api.dto.ProductStatisticsDTO;
import com.sneakers.api.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/statistics")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/daily-revenue/{date}")
    public ResponseEntity<DailyRevenueDTO> getDailyRevenue(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(statisticsService.getDailyRevenue(date));
    }

    @GetMapping("/revenue-by-date-range")
    public ResponseEntity<List<DailyRevenueDTO>> getRevenueByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(statisticsService.getRevenueByDateRange(startDate, endDate));
    }

    @GetMapping("/revenue-by-month-range")
    public ResponseEntity<List<MonthlyRevenueDTO>> getRevenueByMonthRange(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") String startMonth,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") String endMonth) {
        return ResponseEntity.ok(statisticsService.getRevenueByMonthRange(startMonth, endMonth));
    }

    @GetMapping("/revenue-by-year-range")
    public ResponseEntity<List<YearlyRevenueDTO>> getRevenueByYearRange(
            @RequestParam String startYear,
            @RequestParam String endYear) {
        return ResponseEntity.ok(statisticsService.getRevenueByYearRange(startYear, endYear));
    }

    @GetMapping("/product-statistics")
    public ResponseEntity<ProductStatisticsDTO> getProductStatistics() {
        return ResponseEntity.ok(statisticsService.getProductStatistics());
    }
} 