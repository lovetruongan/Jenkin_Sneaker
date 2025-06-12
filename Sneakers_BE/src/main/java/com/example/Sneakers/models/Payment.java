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

    @Column(name = "vnp_txn_ref", unique = true)
    private String vnpTxnRef;

    @Column(name = "vnp_order_info")
    private String vnpOrderInfo;

    @Column(name = "vnp_amount")
    private Long vnpAmount;

    @Column(name = "vnp_bank_code")
    private String vnpBankCode;

    @Column(name = "vnp_bank_tran_no")
    private String vnpBankTranNo;

    @Column(name = "vnp_card_type")
    private String vnpCardType;

    @Column(name = "vnp_pay_date")
    private String vnpPayDate;

    @Column(name = "vnp_response_code")
    private String vnpResponseCode;

    @Column(name = "vnp_transaction_no")
    private String vnpTransactionNo;

    @Column(name = "vnp_transaction_status")
    private String vnpTransactionStatus;

    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "refund_amount")
    private Long refundAmount;

    @Column(name = "refund_date")
    private LocalDateTime refundDate;

    @Column(name = "refund_status")
    private String refundStatus;

    public enum PaymentStatus {
        PENDING,
        SUCCESS,
        FAILED,
        REFUNDED,
        PARTIALLY_REFUNDED
    }
}