package com.example.Sneakers.repositories;

import com.example.Sneakers.models.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    //Tìm các đơn hàng của 1 user nào đó
    List<Order> findByUserId(Long userId);
    @Query("SELECT o FROM Order o WHERE o.active = true AND (:keyword IS NULL OR :keyword = '' OR " +
            "o.fullName LIKE %:keyword% " +
            "OR o.address LIKE %:keyword% " +
            "OR o.note LIKE %:keyword% " +
            "OR o.email LIKE %:keyword%)")
    Page<Order> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    // Statistics queries - removed status filter to include all orders with revenue
    @Query("SELECT COALESCE(SUM(o.totalMoney), 0) FROM Order o WHERE o.orderDate = :date AND o.totalMoney > 0")
    Double getDailyRevenue(@Param("date") LocalDate date);

    @Query("SELECT o.orderDate, COALESCE(SUM(o.totalMoney), 0) " +
           "FROM Order o " +
           "WHERE o.orderDate BETWEEN :startDate AND :endDate " +
           "AND o.totalMoney > 0 " +
           "GROUP BY o.orderDate " +
           "ORDER BY o.orderDate")
    List<Object[]> getRevenueByDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT YEAR(o.orderDate), MONTH(o.orderDate), COALESCE(SUM(o.totalMoney), 0) " +
           "FROM Order o " +
           "WHERE o.orderDate BETWEEN :startDate AND :endDate " +
           "AND o.totalMoney > 0 " +
           "GROUP BY YEAR(o.orderDate), MONTH(o.orderDate) " +
           "ORDER BY YEAR(o.orderDate), MONTH(o.orderDate)")
    List<Object[]> getRevenueByMonthRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT YEAR(o.orderDate), COALESCE(SUM(o.totalMoney), 0) " +
           "FROM Order o " +
           "WHERE YEAR(o.orderDate) BETWEEN :startYear AND :endYear " +
           "AND o.totalMoney > 0 " +
           "GROUP BY YEAR(o.orderDate) " +
           "ORDER BY YEAR(o.orderDate)")
    List<Object[]> getRevenueByYearRange(
            @Param("startYear") int startYear,
            @Param("endYear") int endYear);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderDate = :today")
    Long countOrdersToday(@Param("today") java.time.LocalDate today);
}