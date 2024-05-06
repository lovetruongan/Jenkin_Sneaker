package com.example.Sneakers.responses;

import com.example.Sneakers.models.Cart;
import com.example.Sneakers.models.Product;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartResponse {
    private Long id;
    private ProductResponse products;
    private Long quantity;
    private Long size;
    public static CartResponse fromCart(Cart cart){
        return CartResponse.builder()
                .id(cart.getId())
                .products(ProductResponse.fromProduct(cart.getProduct()))
                .quantity(cart.getQuantity())
                .size(cart.getSize())
                .build();
    }
}