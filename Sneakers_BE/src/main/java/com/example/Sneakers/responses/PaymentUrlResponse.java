package com.example.Sneakers.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentUrlResponse {
    @JsonProperty("payment_id")
    private Long paymentId;

    @JsonProperty("payment_url")
    private String paymentUrl;

    @JsonProperty("qr_code")
    private String qrCode;

    @JsonProperty("payment_method")
    private String paymentMethod;

    private String message;

    @JsonProperty("expires_at")
    private String expiresAt;
}