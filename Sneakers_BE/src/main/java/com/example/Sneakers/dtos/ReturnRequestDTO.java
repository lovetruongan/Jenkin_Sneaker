package com.example.Sneakers.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReturnRequestDTO {
    @JsonProperty("order_id")
    @NotNull(message = "Order ID is required")
    @Min(value = 1, message = "Order ID must be > 0")
    private Long orderId;

    @JsonProperty("reason")
    @NotBlank(message = "Reason is required")
    @Size(min = 10, max = 1000, message = "Reason must be between 10 and 1000 characters")
    private String reason;
} 