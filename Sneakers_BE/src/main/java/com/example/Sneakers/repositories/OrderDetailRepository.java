package com.example.Sneakers.repositories;

import com.example.Sneakers.models.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface OrderDetailRepository extends JpaRepository<OrderDetail,Long> {
    List<OrderDetail> findByOrderId(Long orderId);
    
    @Query(value = "SELECT COALESCE(SUM(od.number_of_products), 0) FROM order_details od " +
           "JOIN orders o ON od.order_id = o.id WHERE o.status = 'delivered'", nativeQuery = true)
    Long countSoldProducts();

    // Best selling products statistics (native SQL)
    @Query(value = "SELECT p.id, p.name, SUM(od.number_of_products) AS total_sold, SUM(od.total_money) AS total_revenue " +
           "FROM order_details od " +
           "JOIN products p ON od.product_id = p.id " +
           "JOIN orders o ON od.order_id = o.id " +
           "WHERE o.status = 'delivered' " +
           "GROUP BY p.id, p.name " +
           "ORDER BY total_sold DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> getBestSellingProductsNative(@Param("limit") int limit);

    // Best selling products with date range
    @Query(value = "SELECT p.id, p.name, SUM(od.number_of_products) AS total_sold, SUM(od.total_money) AS total_revenue " +
           "FROM order_details od " +
           "JOIN products p ON od.product_id = p.id " +
           "JOIN orders o ON od.order_id = o.id " +
           "WHERE o.status = 'delivered' " +
           "AND DATE(o.order_date) BETWEEN :startDate AND :endDate " +
           "GROUP BY p.id, p.name " +
           "ORDER BY total_sold DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> getBestSellingProductsByDateRange(@Param("startDate") String startDate, 
                                                     @Param("endDate") String endDate, 
                                                     @Param("limit") int limit);

    // Best selling brands statistics (native SQL, join with categories, status = 'delivered')
    @Query(value = "SELECT c.id, c.name, SUM(od.number_of_products) AS total_sold, SUM(od.total_money) AS total_revenue " +
           "FROM order_details od " +
           "JOIN products p ON od.product_id = p.id " +
           "JOIN categories c ON p.category_id = c.id " +
           "JOIN orders o ON od.order_id = o.id " +
           "WHERE o.status = 'delivered' " +
           "GROUP BY c.id, c.name " +
           "ORDER BY total_sold DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> getBestSellingBrandsNative(@Param("limit") int limit);

    // Best selling brands with date range
    @Query(value = "SELECT c.id, c.name, SUM(od.number_of_products) AS total_sold, SUM(od.total_money) AS total_revenue " +
           "FROM order_details od " +
           "JOIN products p ON od.product_id = p.id " +
           "JOIN categories c ON p.category_id = c.id " +
           "JOIN orders o ON od.order_id = o.id " +
           "WHERE o.status = 'delivered' " +
           "AND DATE(o.order_date) BETWEEN :startDate AND :endDate " +
           "GROUP BY c.id, c.name " +
           "ORDER BY total_sold DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> getBestSellingBrandsByDateRange(@Param("startDate") String startDate, 
                                                   @Param("endDate") String endDate, 
                                                   @Param("limit") int limit);

    @Query("SELECT od.product.id, p.name, SUM(od.numberOfProducts) " +
           "FROM OrderDetail od " +
           "JOIN od.order o " +
           "JOIN od.product p " +
           "WHERE o.orderDate = :date AND o.totalMoney > 0 " +
           "GROUP BY od.product.id, p.name " +
           "ORDER BY SUM(od.numberOfProducts) DESC")
    List<Object[]> getProductSoldByDate(@Param("date") LocalDate date);

    @Query("SELECT od.product.id, p.name, SUM(od.numberOfProducts) " +
           "FROM OrderDetail od " +
           "JOIN od.order o " +
           "JOIN od.product p " +
           "WHERE YEAR(o.orderDate) = :year AND MONTH(o.orderDate) = :month AND o.totalMoney > 0 " +
           "GROUP BY od.product.id, p.name " +
           "ORDER BY SUM(od.numberOfProducts) DESC")
    List<Object[]> getProductSoldByMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT od.product.id, p.name, SUM(od.numberOfProducts) " +
           "FROM OrderDetail od " +
           "JOIN od.order o " +
           "JOIN od.product p " +
           "WHERE YEAR(o.orderDate) = :year AND o.totalMoney > 0 " +
           "GROUP BY od.product.id, p.name " +
           "ORDER BY SUM(od.numberOfProducts) DESC")
    List<Object[]> getProductSoldByYear(@Param("year") int year);

    @Query("SELECT od.product.id, p.name, SUM(od.numberOfProducts) " +
           "FROM OrderDetail od " +
           "JOIN od.order o " +
           "JOIN od.product p " +
           "WHERE o.totalMoney > 0 " +
           "GROUP BY od.product.id, p.name " +
           "ORDER BY SUM(od.numberOfProducts) DESC")
    List<Object[]> getTopProductSold(Pageable pageable);
}