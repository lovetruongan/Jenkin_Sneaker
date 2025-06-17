package com.example.Sneakers.models;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "payments")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Payment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod; // CASH, BANKING, MOMO, VNPAY, STRIPE

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus; // PENDING, COMPLETED, FAILED, CANCELLED

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "payment_gateway_response", columnDefinition = "TEXT")
    private String paymentGatewayResponse;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "gateway_transaction_id")
    private String gatewayTransactionId;

    @Column(name = "gateway_fee")
    private Long gatewayFee;

    // Helper methods
    public boolean isCompleted() {
        return PaymentStatus.COMPLETED.equals(paymentStatus);
    }

    public boolean isPending() {
        return PaymentStatus.PENDING.equals(paymentStatus);
    }

    public boolean isFailed() {
        return PaymentStatus.FAILED.equals(paymentStatus);
    }
}

