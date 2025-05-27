package com.sneakers.api.service;

import com.sneakers.api.dto.DailyRevenueDTO;
import com.sneakers.api.dto.MonthlyRevenueDTO;
import com.sneakers.api.dto.YearlyRevenueDTO;
import com.sneakers.api.dto.ProductStatisticsDTO;
import com.sneakers.api.repository.OrderRepository;
import com.sneakers.api.repository.OrderDetailRepository;
import com.sneakers.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private ProductRepository productRepository;

    public DailyRevenueDTO getDailyRevenue(LocalDate date) {
        Double revenue = orderRepository.getDailyRevenue(date);
        return new DailyRevenueDTO(date.toString(), revenue != null ? revenue : 0.0);
    }

    public List<DailyRevenueDTO> getRevenueByDateRange(LocalDate startDate, LocalDate endDate) {
        return orderRepository.getRevenueByDateRange(startDate, endDate)
                .stream()
                .map(result -> new DailyRevenueDTO(
                        result[0].toString(),
                        result[1] != null ? ((Number) result[1]).doubleValue() : 0.0
                ))
                .collect(Collectors.toList());
    }

    public List<MonthlyRevenueDTO> getRevenueByMonthRange(String startMonth, String endMonth) {
        YearMonth start = YearMonth.parse(startMonth);
        YearMonth end = YearMonth.parse(endMonth);
        
        LocalDate startDate = start.atDay(1);
        LocalDate endDate = end.atEndOfMonth();
        
        return orderRepository.getRevenueByMonthRange(startDate, endDate)
                .stream()
                .map(result -> new MonthlyRevenueDTO(
                        result[0].toString(),
                        result[1] != null ? ((Number) result[1]).doubleValue() : 0.0
                ))
                .collect(Collectors.toList());
    }

    public List<YearlyRevenueDTO> getRevenueByYearRange(String startYear, String endYear) {
        return orderRepository.getRevenueByYearRange(
                Integer.parseInt(startYear),
                Integer.parseInt(endYear)
        ).stream()
        .map(result -> new YearlyRevenueDTO(
                result[0].toString(),
                result[1] != null ? ((Number) result[1]).doubleValue() : 0.0
        ))
        .collect(Collectors.toList());
    }

    public ProductStatisticsDTO getProductStatistics() {
        Long totalProducts = productRepository.count();
        Long soldProducts = orderDetailRepository.countSoldProducts();
        Long availableProducts = totalProducts - soldProducts;

        return new ProductStatisticsDTO(
                totalProducts,
                soldProducts,
                availableProducts
        );
    }
} 