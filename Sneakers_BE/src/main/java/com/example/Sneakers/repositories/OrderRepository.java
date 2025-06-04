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
    
    @Query(value = "SELECT * FROM orders o WHERE o.active = true AND (:keyword IS NULL OR :keyword = '' OR " +
            "o.fullname LIKE %:keyword% " +
            "OR o.address LIKE %:keyword% " +
            "OR o.note LIKE %:keyword% " +
            "OR o.email LIKE %:keyword%)", 
            nativeQuery = true)
    Page<Order> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    @Query(value = "SELECT COALESCE(SUM(o.total_money - COALESCE(o.discount_amount, 0)), 0) " +
           "FROM orders o " +
           "WHERE DATE(o.order_date) = :date " +
           "AND o.status IN ('pending', 'shipped', 'delivered') AND o.active = true",
            nativeQuery = true)
    Double getDailyRevenue(@Param("date") LocalDate date);

    @Query(value = "SELECT o.order_date, COALESCE(SUM(o.total_money - COALESCE(o.discount_amount, 0)), 0) " +
           "FROM orders o " +
           "WHERE o.order_date BETWEEN :startDate AND :endDate " +
           "AND o.status IN ('pending', 'shipped', 'delivered') AND o.active = true " +
           "GROUP BY o.order_date " +
           "ORDER BY o.order_date",
           nativeQuery = true)
    List<Object[]> getRevenueByDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query(value = "SELECT YEAR(o.order_date), MONTH(o.order_date), " +
           "COALESCE(SUM(o.total_money - COALESCE(o.discount_amount, 0)), 0) " +
           "FROM orders o " +
           "WHERE o.order_date BETWEEN :startDate AND :endDate " +
           "AND o.status IN ('pending', 'shipped', 'delivered') AND o.active = true " +
           "GROUP BY YEAR(o.order_date), MONTH(o.order_date) " +
           "ORDER BY YEAR(o.order_date), MONTH(o.order_date)",
           nativeQuery = true)
    List<Object[]> getRevenueByMonthRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query(value = "SELECT YEAR(o.order_date), " +
           "COALESCE(SUM(o.total_money - COALESCE(o.discount_amount, 0)), 0) " +
           "FROM orders o " +
           "WHERE YEAR(o.order_date) BETWEEN :startYear AND :endYear " +
           "AND o.status IN ('pending', 'shipped', 'delivered') AND o.active = true " +
           "GROUP BY YEAR(o.order_date) " +
           "ORDER BY YEAR(o.order_date)",
           nativeQuery = true)
    List<Object[]> getRevenueByYearRange(
            @Param("startYear") int startYear,
            @Param("endYear") int endYear);

    // Đếm số đơn hàng trong ngày
    @Query(value = "SELECT COUNT(*) FROM orders WHERE DATE(order_date) = CURRENT_DATE " +
           "AND status IN ('pending', 'shipped', 'delivered') AND active = true",
           nativeQuery = true)
    Long countOrdersToday();

    // Tính tổng doanh thu từ các đơn hàng đã hoàn thành
    @Query(value = "SELECT COALESCE(SUM(total_money - COALESCE(discount_amount, 0)), 0) " +
           "FROM orders WHERE status IN ('pending', 'shipped', 'delivered') AND active = true",
           nativeQuery = true)
    Long calculateTotalRevenue();

    // Đếm tổng số sản phẩm đã bán (từ đơn hàng đã hoàn thành)
    @Query(value = "SELECT COALESCE(SUM(od.number_of_products), 0) " +
           "FROM orders o " +
           "JOIN order_details od ON o.id = od.order_id " +
           "WHERE o.status IN ('pending', 'shipped', 'delivered') AND o.active = true",
           nativeQuery = true)
    Long countTotalProductsSold();
}