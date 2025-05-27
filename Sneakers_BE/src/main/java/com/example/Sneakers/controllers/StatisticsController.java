package com.example.Sneakers.controllers;

import com.example.Sneakers.dtos.DailyRevenueDTO;
import com.example.Sneakers.dtos.MonthlyRevenueDTO;
import com.example.Sneakers.dtos.YearlyRevenueDTO;
import com.example.Sneakers.dtos.ProductStatisticsDTO;
import com.example.Sneakers.dtos.BrandSoldStatisticsDTO;
import com.example.Sneakers.dtos.ProductSoldStatisticsDTO;
import com.example.Sneakers.services.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("${api.prefix}/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

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

    @GetMapping("/product-sold-by-date")
    public ResponseEntity<List<ProductSoldStatisticsDTO>> getProductSoldByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(statisticsService.getProductSoldByDate(date));
    }

    @GetMapping("/product-sold-by-month")
    public ResponseEntity<List<ProductSoldStatisticsDTO>> getProductSoldByMonth(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(statisticsService.getProductSoldByMonth(year, month));
    }

    @GetMapping("/product-sold-by-year")
    public ResponseEntity<List<ProductSoldStatisticsDTO>> getProductSoldByYear(
            @RequestParam int year) {
        return ResponseEntity.ok(statisticsService.getProductSoldByYear(year));
    }

    @GetMapping("/top-product-sold")
    public ResponseEntity<List<ProductSoldStatisticsDTO>> getTopProductSold(
            @RequestParam(defaultValue = "10") int topN,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(statisticsService.getTopProductSoldByDateRange(topN, startDate, endDate));
        } else {
            return ResponseEntity.ok(statisticsService.getTopProductSold(topN));
        }
    }

    @GetMapping("/top-brands-sold")
    public ResponseEntity<List<BrandSoldStatisticsDTO>> getTopBrandsSold(
            @RequestParam(defaultValue = "10") int topN,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(statisticsService.getTopBrandsSoldByDateRange(topN, startDate, endDate));
        } else {
            return ResponseEntity.ok(statisticsService.getTopBrandsSold(topN));
        }
    }

    @GetMapping("/orders-today")
    public ResponseEntity<Long> getOrdersToday() {
        return ResponseEntity.ok(statisticsService.getOrdersToday());
    }
} 