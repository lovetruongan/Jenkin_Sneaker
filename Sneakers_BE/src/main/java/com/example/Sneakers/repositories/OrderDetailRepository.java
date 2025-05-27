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
           "JOIN od.order o WHERE o.status = 'COMPLETED'")
    Long countSoldProducts();

    // Best selling products statistics
    @Query("SELECT od.product.id, p.name, SUM(od.numberOfProducts), SUM(od.totalMoney) " +
           "FROM OrderDetail od " +
           "JOIN od.order o " +
           "JOIN od.product p " +
           "WHERE o.totalMoney > 0 " +
           "GROUP BY od.product.id, p.name " +
           "ORDER BY SUM(od.numberOfProducts) DESC")
    List<Object[]> getBestSellingProducts(Pageable pageable);

    // Best selling brands statistics
    @Query("SELECT c.id, c.name, SUM(od.numberOfProducts), SUM(od.totalMoney) " +
           "FROM OrderDetail od " +
           "JOIN od.order o " +
           "JOIN od.product p " +
           "JOIN p.category c " +
           "WHERE o.totalMoney > 0 " +
           "GROUP BY c.id, c.name " +
           "ORDER BY SUM(od.numberOfProducts) DESC")
    List<Object[]> getBestSellingBrands(Pageable pageable);

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