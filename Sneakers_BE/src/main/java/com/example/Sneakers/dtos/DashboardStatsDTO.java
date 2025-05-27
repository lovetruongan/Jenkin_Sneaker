package com.example.Sneakers.dtos;

public class DashboardStatsDTO {
    private Long totalRevenue;
    private Long todayOrders;
    private Long totalProductsSold;

    public DashboardStatsDTO(Long totalRevenue, Long todayOrders, Long totalProductsSold) {
        this.totalRevenue = totalRevenue;
        this.todayOrders = todayOrders;
        this.totalProductsSold = totalProductsSold;
    }

    // Getters and Setters
    public Long getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Long totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getTodayOrders() {
        return todayOrders;
    }

    public void setTodayOrders(Long todayOrders) {
        this.todayOrders = todayOrders;
    }

    public Long getTotalProductsSold() {
        return totalProductsSold;
    }

    public void setTotalProductsSold(Long totalProductsSold) {
        this.totalProductsSold = totalProductsSold;
    }
} 