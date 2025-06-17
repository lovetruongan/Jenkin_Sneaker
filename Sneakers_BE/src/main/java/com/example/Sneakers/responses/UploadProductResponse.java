package com.example.Sneakers.responses;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UploadProductResponse {
    private Long productId;
    private String message;
}