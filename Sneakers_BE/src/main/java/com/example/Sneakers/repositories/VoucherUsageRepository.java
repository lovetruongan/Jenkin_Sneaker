package com.example.Sneakers.repositories;

import com.example.Sneakers.models.VoucherUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, Long> {
    List<VoucherUsage> findByVoucherId(Long voucherId);

    List<VoucherUsage> findByOrderId(Long orderId);

    List<VoucherUsage> findByUserId(Long userId);

    Long countByVoucherIdAndUserId(Long voucherId, Long userId);
}