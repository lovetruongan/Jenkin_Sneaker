package com.example.Sneakers.repositories;

import com.example.Sneakers.models.PaymentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory, Long> {
    
    List<PaymentHistory> findByPaymentIdOrderByUpdatedAtDesc(Long paymentId);
    
    @Query("SELECT ph FROM PaymentHistory ph WHERE ph.payment.order.user.id = :userId ORDER BY ph.updatedAt DESC")
    List<PaymentHistory> findByUserIdOrderByUpdatedAtDesc(@Param("userId") Long userId);
    
    List<PaymentHistory> findByUpdatedByOrderByUpdatedAtDesc(String updatedBy);
    
    @Query("SELECT ph FROM PaymentHistory ph WHERE ph.oldStatus = :oldStatus AND ph.newStatus = :newStatus")
    List<PaymentHistory> findByStatusTransition(@Param("oldStatus") String oldStatus, 
                                              @Param("newStatus") String newStatus);
}