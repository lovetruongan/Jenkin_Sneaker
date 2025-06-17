package com.example.Sneakers.responses;

import com.example.Sneakers.models.Order;
import com.example.Sneakers.models.OrderDetail;
import com.example.Sneakers.models.User;
import com.example.Sneakers.models.Voucher;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.*;

import java.time.LocalDate;
import java.util.Date;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponse {
    private Long id;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("fullname")
    private String fullName;

    @JsonProperty("phone_number")
    private String phoneNumber;

    @JsonProperty("email")
    private String email;

    @JsonProperty("address")
    private String address;

    @JsonProperty("note")
    private String note;

    @JsonProperty("order_date")
    // @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDate orderDate;

    @JsonProperty("status")
    private String status;

    @JsonProperty("total_money")
    private Long totalMoney;

    @JsonProperty("shipping_method")
    private String shippingMethod;

    @JsonProperty("shipping_date")
    private LocalDate shippingDate;

    @JsonProperty("payment_method")
    private String paymentMethod;

    @JsonProperty("voucher")
    private VoucherInfo voucher;

    @JsonProperty("discount_amount")
    private Long discountAmount;

    @JsonProperty("order_details")
    private List<OrderDetail> orderDetails;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VoucherInfo {
        private String code;
        private String name;
        @JsonProperty("discount_percentage")
        private Integer discountPercentage;
    }

    public static OrderResponse fromOrder(Order order) {
        OrderResponse.VoucherInfo voucherInfo = null;
        if (order.getVoucher() != null) {
            voucherInfo = VoucherInfo.builder()
                    .code(order.getVoucher().getCode())
                    .name(order.getVoucher().getName())
                    .discountPercentage(order.getVoucher().getDiscountPercentage())
                    .build();
        }

        return OrderResponse
                .builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .fullName(order.getFullName())
                .phoneNumber(order.getPhoneNumber())
                .email(order.getEmail())
                .address(order.getAddress())
                .note(order.getNote())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .totalMoney(order.getTotalMoney())
                .shippingMethod(order.getShippingMethod())
                .shippingDate(order.getShippingDate())
                .paymentMethod(order.getPaymentMethod())
                .voucher(voucherInfo)
                .discountAmount(order.getDiscountAmount())
                .orderDetails(order.getOrderDetails())
                .build();
    }
}