package com.example.Sneakers.responses;

import com.example.Sneakers.models.Order;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderHistoryResponse {
    private Long id;

    @JsonProperty("user_id")
    private Long userId;

    private String status;

    @JsonProperty("total_money")
    private Long totalMoney;

    @JsonProperty("product_name")
    private String productName;

    @JsonProperty("order_date")
    private LocalDate orderDate;

    private String thumbnail;

    @JsonProperty("total_products")
    private int totalProducts;

    @JsonProperty("buyer_name")
    private String buyerName;

    @JsonProperty("phone_number")
    private String phoneNumber;

    public static OrderHistoryResponse fromOrder(Order order){
        OrderHistoryResponseBuilder builder = OrderHistoryResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .status(order.getStatus())
                .totalMoney(order.getTotalMoney())
                .orderDate(order.getOrderDate())
                .buyerName(order.getFullName())
                .phoneNumber(order.getPhoneNumber());

        // Kiểm tra xem danh sách orderDetails có rỗng không trước khi truy cập
        if (!order.getOrderDetails().isEmpty()) {
            builder.thumbnail(order.getOrderDetails().get(0).getProduct().getThumbnail())
                    .productName(order.getOrderDetails().get(0).getProduct().getName())
                    .totalProducts(order.getOrderDetails().size());
        } else {
            // Xử lý trường hợp danh sách orderDetails rỗng
            builder.thumbnail("notfound.jpg")
                    .productName("Not found")
                    .totalProducts(0);
        }

        return builder.build();
    }
}