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
    
    @Query("SELECT COUNT(DISTINCT od.product.id) FROM OrderDetail od " +
           "JOIN od.order o WHERE o.status IN ('pending', 'shipped', 'delivered') AND o.active = true")
    Long countSoldProducts();

    // Best selling products statistics (native SQL)
    @Query(value = "SELECT p.id, p.name, SUM(od.number_of_products) AS total_sold, " +
           "SUM(od.total_money) AS total_revenue " +
           "FROM order_details od " +
           "JOIN products p ON od.product_id = p.id " +
           "JOIN orders o ON od.order_id = o.id " +
           "WHERE o.status IN ('pending', 'shipped', 'delivered') AND o.active = true " +
           "GROUP BY p.id, p.name " +
           "HAVING SUM(od.number_of_products) > 0 " +
           "ORDER BY total_sold DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> getBestSellingProductsNative(@Param("limit") int limit);

    // Best selling products with date range
    @Query(value = "SELECT p.id, p.name, SUM(od.number_of_products) AS total_sold, " +
           "SUM(od.total_money) AS total_revenue " +
           "FROM order_details od " +
           "JOIN products p ON od.product_id = p.id " +
           "JOIN orders o ON od.order_id = o.id " +
           "WHERE o.status IN ('pending', 'shipped', 'delivered') AND o.active = true " +
           "AND DATE(o.order_date) BETWEEN :startDate AND :endDate " +
           "GROUP BY p.id, p.name " +
           "HAVING SUM(od.number_of_products) > 0 " +
           "ORDER BY total_sold DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> getBestSellingProductsByDateRange(@Param("startDate") String startDate, 
                                                     @Param("endDate") String endDate, 
                                                     @Param("limit") int limit);

    // Best selling brands statistics (native SQL)
    @Query(value = "SELECT c.id, c.name, SUM(od.number_of_products) AS total_sold, " +
           "SUM(od.total_money) AS total_revenue " +
           "FROM order_details od " +
           "JOIN products p ON od.product_id = p.id " +
           "JOIN categories c ON p.category_id = c.id " +
           "JOIN orders o ON od.order_id = o.id " +
           "WHERE o.status IN ('pending', 'shipped', 'delivered') AND o.active = true " +
           "GROUP BY c.id, c.name " +
           "HAVING SUM(od.number_of_products) > 0 " +
           "ORDER BY total_sold DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> getBestSellingBrandsNative(@Param("limit") int limit);

    // Best selling brands with date range
    @Query(value = "SELECT c.id, c.name, SUM(od.number_of_products) AS total_sold, " +
           "SUM(od.total_money) AS total_revenue " +
           "FROM order_details od " +
           "JOIN products p ON od.product_id = p.id " +
           "JOIN categories c ON p.category_id = c.id " +
           "JOIN orders o ON od.order_id = o.id " +
           "WHERE o.status IN ('pending', 'shipped', 'delivered') AND o.active = true " +
           "AND DATE(o.order_date) BETWEEN :startDate AND :endDate " +
           "GROUP BY c.id, c.name " +
           "HAVING SUM(od.number_of_products) > 0 " +
           "ORDER BY total_sold DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> getBestSellingBrandsByDateRange(@Param("startDate") String startDate, 
                                                   @Param("endDate") String endDate, 
                                                   @Param("limit") int limit);

    @Query(value = "SELECT od.product_id, p.name, SUM(od.number_of_products) " +
           "FROM order_details od " +
           "JOIN orders o ON od.order_id = o.id " +
           "JOIN products p ON od.product_id = p.id " +
           "WHERE DATE(o.order_date) = :date " +
           "AND o.status IN ('pending', 'shipped', 'delivered') AND o.active = true " +
           "GROUP BY od.product_id, p.name " +
           "HAVING SUM(od.number_of_products) > 0 " +
           "ORDER BY SUM(od.number_of_products) DESC", nativeQuery = true)
    List<Object[]> getProductSoldByDate(@Param("date") LocalDate date);

    @Query(value = "SELECT od.product_id, p.name, SUM(od.number_of_products) " +
           "FROM order_details od " +
           "JOIN orders o ON od.order_id = o.id " +
           "JOIN products p ON od.product_id = p.id " +
           "WHERE YEAR(o.order_date) = :year AND MONTH(o.order_date) = :month " +
           "AND o.status IN ('pending', 'shipped', 'delivered') AND o.active = true " +
           "GROUP BY od.product_id, p.name " +
           "HAVING SUM(od.number_of_products) > 0 " +
           "ORDER BY SUM(od.number_of_products) DESC", nativeQuery = true)
    List<Object[]> getProductSoldByMonth(@Param("year") int year, @Param("month") int month);

    @Query(value = "SELECT od.product_id, p.name, SUM(od.number_of_products) " +
           "FROM order_details od " +
           "JOIN orders o ON od.order_id = o.id " +
           "JOIN products p ON od.product_id = p.id " +
           "WHERE YEAR(o.order_date) = :year " +
           "AND o.status IN ('pending', 'shipped', 'delivered') AND o.active = true " +
           "GROUP BY od.product_id, p.name " +
           "HAVING SUM(od.number_of_products) > 0 " +
           "ORDER BY SUM(od.number_of_products) DESC", nativeQuery = true)
    List<Object[]> getProductSoldByYear(@Param("year") int year);

    @Query(value = "SELECT od.product_id, p.name, SUM(od.number_of_products) " +
           "FROM order_details od " +
           "JOIN orders o ON od.order_id = o.id " +
           "JOIN products p ON od.product_id = p.id " +
           "WHERE o.status IN ('pending', 'shipped', 'delivered') AND o.active = true " +
           "GROUP BY od.product_id, p.name " +
           "HAVING SUM(od.number_of_products) > 0 " +
           "ORDER BY SUM(od.number_of_products) DESC " +
           "LIMIT :#{#pageable.pageSize} OFFSET :#{#pageable.offset}", nativeQuery = true)
    List<Object[]> getTopProductSold(Pageable pageable);
}