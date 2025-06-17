package com.example.Sneakers.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CartItemDTO {
    @JsonProperty("product_id")
    @Min(value = 1,message = "Product's id must be > 0")
    private Long productId;

    @JsonProperty("quantity")
    @Min(value = 1,message = "Quantity must be > 0")
    private Long quantity;

    @JsonProperty("size")
    @Min(value = 36,message = "Size must be >= 36 and <= 44")
    @Max(value = 44,message = "Size must be >= 36 and <= 44")
    private Long size;
}