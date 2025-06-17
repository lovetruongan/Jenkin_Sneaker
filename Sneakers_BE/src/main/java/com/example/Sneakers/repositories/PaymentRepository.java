package com.example.Sneakers.repositories;

import com.example.Sneakers.models.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findByOrderId(Long orderId);
    
    Optional<Payment> findByTransactionId(String transactionId);
    
    Optional<Payment> findByGatewayTransactionId(String gatewayTransactionId);
    
    List<Payment> findByPaymentStatus(String paymentStatus);
    
    List<Payment> findByPaymentMethod(String paymentMethod);
    
    @Query("SELECT p FROM Payment p WHERE p.order.user.id = :userId ORDER BY p.createdAt DESC")
    List<Payment> findByOrderUserId(@Param("userId") Long userId);
    
    @Query("SELECT p FROM Payment p WHERE p.paymentStatus = :status AND p.createdAt < :before")
    List<Payment> findExpiredPayments(@Param("status") String status, @Param("before") LocalDateTime before);
    
    @Query("SELECT p FROM Payment p WHERE p.paymentMethod = :method AND p.paymentStatus = :status")
    Page<Payment> findByPaymentMethodAndStatus(@Param("method") String method, 
                                             @Param("status") String status, 
                                             Pageable pageable);
    
    @Query("SELECT p FROM Payment p WHERE " +
           "(:paymentMethod IS NULL OR p.paymentMethod = :paymentMethod) AND " +
           "(:paymentStatus IS NULL OR p.paymentStatus = :paymentStatus) AND " +
           "(:startDate IS NULL OR p.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR p.createdAt <= :endDate)")
    Page<Payment> findPaymentsWithFilters(@Param("paymentMethod") String paymentMethod,
                                        @Param("paymentStatus") String paymentStatus,
                                        @Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate,
                                        Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentStatus = :status")
    Long countByPaymentStatus(@Param("status") String status);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'COMPLETED' AND p.paymentDate BETWEEN :startDate AND :endDate")
    Long getTotalRevenueByDateRange(@Param("startDate") LocalDateTime startDate, 
                                   @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT p.paymentMethod, COUNT(p) FROM Payment p WHERE p.paymentStatus = 'COMPLETED' GROUP BY p.paymentMethod")
    List<Object[]> getPaymentMethodStatistics();
}