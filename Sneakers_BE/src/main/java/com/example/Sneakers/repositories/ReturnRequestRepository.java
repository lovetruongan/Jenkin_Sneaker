package com.example.Sneakers.repositories;

import com.example.Sneakers.models.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    @Query("SELECT r FROM ReturnRequest r JOIN FETCH r.order o JOIN FETCH o.user u WHERE o.user.id = :userId ORDER BY r.requestedAt DESC")
    List<ReturnRequest> findByOrderUserId(Long userId);
    
    Optional<ReturnRequest> findByOrderId(Long orderId);

    @Query("SELECT r FROM ReturnRequest r JOIN FETCH r.order o JOIN FETCH o.user u ORDER BY r.requestedAt DESC")
    List<ReturnRequest> findAllAdmin();
} 