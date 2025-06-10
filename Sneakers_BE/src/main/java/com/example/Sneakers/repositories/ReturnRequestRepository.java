package com.example.Sneakers.repositories;

import com.example.Sneakers.models.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    List<ReturnRequest> findByOrderUserId(Long userId);
    Optional<ReturnRequest> findByOrderId(Long orderId);

    @Query("SELECT r FROM ReturnRequest r ORDER BY r.requestedAt DESC")
    List<ReturnRequest> findAllAdmin();
} 