package com.example.Sneakers.repositories;

import com.example.Sneakers.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByVnpTxnRef(String vnpTxnRef);

    Optional<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByVnpTransactionNo(String vnpTransactionNo);
}