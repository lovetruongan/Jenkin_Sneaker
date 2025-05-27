package com.example.Sneakers.repositories;

import com.example.Sneakers.models.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCode(String code);

    boolean existsByCode(String code);

    @Query("SELECT v FROM Voucher v WHERE v.isActive = true")
    Page<Voucher> findAllActive(Pageable pageable);

    @Query("SELECT v FROM Voucher v WHERE v.isActive = true AND v.validFrom <= :now AND v.validTo >= :now AND v.remainingQuantity > 0")
    Page<Voucher> findValidVouchers(@Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT v FROM Voucher v WHERE (LOWER(v.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(v.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Voucher> searchVouchers(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT COUNT(vu) > 0 FROM VoucherUsage vu WHERE vu.voucher.id = :voucherId")
    boolean isVoucherUsedInOrders(@Param("voucherId") Long voucherId);

    @Query("SELECT v FROM Voucher v WHERE v.code = :code AND v.isActive = true AND v.validFrom <= :now AND v.validTo >= :now AND v.remainingQuantity > 0")
    Optional<Voucher> findValidVoucherByCode(@Param("code") String code, @Param("now") LocalDateTime now);
}