package com.example.Sneakers.services;

import com.example.Sneakers.dtos.DailyRevenueDTO;
import com.example.Sneakers.dtos.MonthlyRevenueDTO;
import com.example.Sneakers.dtos.YearlyRevenueDTO;
import com.example.Sneakers.dtos.ProductStatisticsDTO;
import com.example.Sneakers.dtos.BrandSoldStatisticsDTO;
import com.example.Sneakers.dtos.ProductSoldStatisticsDTO;
import com.example.Sneakers.repositories.OrderRepository;
import com.example.Sneakers.repositories.OrderDetailRepository;
import com.example.Sneakers.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ProductRepository productRepository;

    public DailyRevenueDTO getDailyRevenue(LocalDate date) {
        Double revenue = orderRepository.getDailyRevenue(date);
        return new DailyRevenueDTO(date.toString(), revenue != null ? revenue : 0.0);
    }

    public List<DailyRevenueDTO> getRevenueByDateRange(LocalDate startDate, LocalDate endDate) {
        return orderRepository.getRevenueByDateRange(startDate, endDate)
                .stream()
                .map(result -> new DailyRevenueDTO(
                        result[0].toString(),
                        result[1] != null ? ((Number) result[1]).doubleValue() : 0.0))
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
                        String.format("%s-%02d", result[0], result[1]),
                        result[2] != null ? ((Number) result[2]).doubleValue() : 0.0))
                .collect(Collectors.toList());
    }

    public List<YearlyRevenueDTO> getRevenueByYearRange(String startYear, String endYear) {
        return orderRepository.getRevenueByYearRange(
                Integer.parseInt(startYear),
                Integer.parseInt(endYear)).stream()
                .map(result -> new YearlyRevenueDTO(
                        result[0].toString(),
                        result[1] != null ? ((Number) result[1]).doubleValue() : 0.0))
                .collect(Collectors.toList());
    }

    public ProductStatisticsDTO getProductStatistics() {
        Long totalProducts = productRepository.count();
        Long soldProducts = orderDetailRepository.countSoldProducts();
        Long availableProducts = productRepository.sumTotalQuantity();

        return new ProductStatisticsDTO(
                totalProducts,
                soldProducts,
                availableProducts);
    }

    public List<ProductSoldStatisticsDTO> getProductSoldByDate(LocalDate date) {
        return orderDetailRepository.getProductSoldByDate(date)
                .stream()
                .map(obj -> new ProductSoldStatisticsDTO(
                        (Long) obj[0],
                        (String) obj[1],
                        obj[2] != null ? ((Number) obj[2]).longValue() : 0L))
                .collect(Collectors.toList());
    }

    public List<ProductSoldStatisticsDTO> getProductSoldByMonth(int year, int month) {
        return orderDetailRepository.getProductSoldByMonth(year, month)
                .stream()
                .map(obj -> new ProductSoldStatisticsDTO(
                        (Long) obj[0],
                        (String) obj[1],
                        obj[2] != null ? ((Number) obj[2]).longValue() : 0L))
                .collect(Collectors.toList());
    }

    public List<ProductSoldStatisticsDTO> getProductSoldByYear(int year) {
        return orderDetailRepository.getProductSoldByYear(year)
                .stream()
                .map(obj -> new ProductSoldStatisticsDTO(
                        (Long) obj[0],
                        (String) obj[1],
                        obj[2] != null ? ((Number) obj[2]).longValue() : 0L))
                .collect(Collectors.toList());
    }

    public List<ProductSoldStatisticsDTO> getTopProductSold(int topN) {
        try {
            List<Object[]> results = orderDetailRepository.getBestSellingProductsNative(topN);
            if (results == null || results.isEmpty()) {
                return new ArrayList<>();
            }

            return results.stream()
                    .map(obj -> {
                        try {
                            return new ProductSoldStatisticsDTO(
                                    obj[0] != null ? ((Number) obj[0]).longValue() : 0L,
                                    obj[1] != null ? (String) obj[1] : "Unknown",
                                    obj[2] != null ? ((Number) obj[2]).longValue() : 0L);
                        } catch (Exception e) {
                            System.err.println("Error mapping product statistics: " + e.getMessage());
                            return new ProductSoldStatisticsDTO(0L, "Error", 0L);
                        }
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching top products sold: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<ProductSoldStatisticsDTO> getTopProductSoldByDateRange(int topN, String startDate, String endDate) {
        try {
            List<Object[]> results = orderDetailRepository.getBestSellingProductsByDateRange(startDate, endDate, topN);
            if (results == null || results.isEmpty()) {
                return new ArrayList<>();
            }

            return results.stream()
                    .map(obj -> {
                        try {
                            return new ProductSoldStatisticsDTO(
                                    obj[0] != null ? ((Number) obj[0]).longValue() : 0L,
                                    obj[1] != null ? (String) obj[1] : "Unknown",
                                    obj[2] != null ? ((Number) obj[2]).longValue() : 0L);
                        } catch (Exception e) {
                            System.err.println("Error mapping product statistics: " + e.getMessage());
                            return new ProductSoldStatisticsDTO(0L, "Error", 0L);
                        }
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching top products sold by date range: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<BrandSoldStatisticsDTO> getTopBrandsSold(int topN) {
        try {
            List<Object[]> results = orderDetailRepository.getBestSellingBrandsNative(topN);
            if (results == null || results.isEmpty()) {
                return new ArrayList<>();
            }

            return results.stream()
                    .map(obj -> {
                        try {
                            return new BrandSoldStatisticsDTO(
                                    obj[0] != null ? ((Number) obj[0]).longValue() : 0L,
                                    obj[1] != null ? (String) obj[1] : "Unknown",
                                    obj[2] != null ? ((Number) obj[2]).longValue() : 0L,
                                    obj[3] != null ? ((Number) obj[3]).doubleValue() : 0.0);
                        } catch (Exception e) {
                            System.err.println("Error mapping brand statistics: " + e.getMessage());
                            return new BrandSoldStatisticsDTO(0L, "Error", 0L, 0.0);
                        }
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching top brands sold: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<BrandSoldStatisticsDTO> getTopBrandsSoldByDateRange(int topN, String startDate, String endDate) {
        try {
            List<Object[]> results = orderDetailRepository.getBestSellingBrandsByDateRange(startDate, endDate, topN);
            if (results == null || results.isEmpty()) {
                return new ArrayList<>();
            }

            return results.stream()
                    .map(obj -> {
                        try {
                            return new BrandSoldStatisticsDTO(
                                    obj[0] != null ? ((Number) obj[0]).longValue() : 0L,
                                    obj[1] != null ? (String) obj[1] : "Unknown",
                                    obj[2] != null ? ((Number) obj[2]).longValue() : 0L,
                                    obj[3] != null ? ((Number) obj[3]).doubleValue() : 0.0);
                        } catch (Exception e) {
                            System.err.println("Error mapping brand statistics: " + e.getMessage());
                            return new BrandSoldStatisticsDTO(0L, "Error", 0L, 0.0);
                        }
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching top brands sold by date range: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public Long getOrdersToday() {
        return orderRepository.countOrdersToday();
    }
}