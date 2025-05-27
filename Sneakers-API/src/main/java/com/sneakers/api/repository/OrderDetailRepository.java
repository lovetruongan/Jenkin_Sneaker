package com.sneakers.api.repository;

import com.sneakers.api.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    @Query("SELECT COALESCE(SUM(od.quantity), 0) FROM OrderDetail od")
    Long countSoldProducts();
} 