package com.sneakers.api.repository;

import com.sneakers.api.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT COALESCE(SUM(o.total_money), 0) FROM Order o WHERE DATE(o.order_date) = :date AND o.status = 'COMPLETED'")
    Double getDailyRevenue(@Param("date") LocalDate date);

    @Query("SELECT DATE(o.order_date), COALESCE(SUM(o.total_money), 0) " +
           "FROM Order o " +
           "WHERE DATE(o.order_date) BETWEEN :startDate AND :endDate " +
           "AND o.status = 'COMPLETED' " +
           "GROUP BY DATE(o.order_date) " +
           "ORDER BY DATE(o.order_date)")
    List<Object[]> getRevenueByDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT CONCAT(YEAR(o.order_date), '-', LPAD(MONTH(o.order_date), 2, '0')), COALESCE(SUM(o.total_money), 0) " +
           "FROM Order o " +
           "WHERE o.order_date BETWEEN :startDate AND :endDate " +
           "AND o.status = 'COMPLETED' " +
           "GROUP BY YEAR(o.order_date), MONTH(o.order_date) " +
           "ORDER BY YEAR(o.order_date), MONTH(o.order_date)")
    List<Object[]> getRevenueByMonthRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT YEAR(o.order_date), COALESCE(SUM(o.total_money), 0) " +
           "FROM Order o " +
           "WHERE YEAR(o.order_date) BETWEEN :startYear AND :endYear " +
           "AND o.status = 'COMPLETED' " +
           "GROUP BY YEAR(o.order_date) " +
           "ORDER BY YEAR(o.order_date)")
    List<Object[]> getRevenueByYearRange(
            @Param("startYear") int startYear,
            @Param("endYear") int endYear);
} 