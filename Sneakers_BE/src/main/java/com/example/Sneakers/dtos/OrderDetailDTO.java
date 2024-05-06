package com.example.Sneakers.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import lombok.*;

@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderDetailDTO {
    @JsonProperty("order_id")
    @Min(value = 1,message = "Order's ID must be >0")
    private Long orderId;

    @JsonProperty("product_id")
    @Min(value = 1,message = "Product's ID must be >0")
    private Long productId;

    @Min(value = 0,message = "Price must be >= 0")
    private Long price;

    @JsonProperty("number_of_products")
    @Min(value = 1,message = "Number of products must be >= 1")
    private Long numberOfProducts;

    @JsonProperty("total_money")
    @Min(value = 0,message = "Total money must be >= 0")
    private Long totalMoney;

    private Long size;
}