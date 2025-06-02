package com.example.Sneakers.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vouchers")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Voucher extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "discount_percentage", nullable = false)
    private Integer discountPercentage;

    @Column(name = "min_order_value")
    private Long minOrderValue;

    @Column(name = "max_discount_amount")
    private Long maxDiscountAmount;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "remaining_quantity", nullable = false)
    private Integer remainingQuantity;

    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;

    @Column(name = "valid_to", nullable = false)
    private LocalDateTime validTo;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VoucherUsage> voucherUsages;

    @OneToMany(mappedBy = "voucher", fetch = FetchType.LAZY)
    private List<Order> orders;

    // Helper method to check if voucher is valid
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive &&
                remainingQuantity > 0 &&
                now.isAfter(validFrom) &&
                now.isBefore(validTo);
    }

    // Helper method to check if voucher can be applied to an order
    public boolean canApplyToOrder(Long orderTotal) {
        return isValid() && orderTotal >= minOrderValue;
    }

    // Calculate discount amount for an order
    public Long calculateDiscount(Long orderTotal) {
        if (!canApplyToOrder(orderTotal)) {
            return 0L;
        }

        Long discountAmount = (orderTotal * discountPercentage) / 100;

        // Apply max discount limit if set
        if (maxDiscountAmount != null && discountAmount > maxDiscountAmount) {
            discountAmount = maxDiscountAmount;
        }

        return discountAmount;
    }
}