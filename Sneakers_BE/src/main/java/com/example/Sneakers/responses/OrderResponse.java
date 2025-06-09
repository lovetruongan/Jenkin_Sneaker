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
import java.util.stream.Collectors;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponse {
    private Long id;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("buyer_name")
    private String buyerName;

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
    private List<OrderDetailResponse> orderDetails;

    @JsonProperty("product_name")
    private String productName;

    @JsonProperty("total_products")
    private int totalProducts;

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
        List<OrderDetailResponse> orderDetailResponses = order.getOrderDetails()
                .stream()
                .map(OrderDetailResponse::fromOrderDetail)
                .collect(Collectors.toList());

        OrderResponse orderResponse = OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .buyerName(order.getFullName())
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
                .orderDetails(orderDetailResponses)
                .build();
        
        if (order.getOrderDetails() != null && !order.getOrderDetails().isEmpty()) {
            String productNames = order.getOrderDetails().stream()
                    .map(od -> od.getProduct().getName())
                    .collect(Collectors.joining(", "));
            orderResponse.setProductName(productNames);

            long totalProducts = order.getOrderDetails().stream()
                    .mapToLong(OrderDetail::getNumberOfProducts)
                    .sum();
            orderResponse.setTotalProducts((int) totalProducts);
        } else {
            orderResponse.setProductName("N/A");
            orderResponse.setTotalProducts(0);
        }

        return orderResponse;
    }
}