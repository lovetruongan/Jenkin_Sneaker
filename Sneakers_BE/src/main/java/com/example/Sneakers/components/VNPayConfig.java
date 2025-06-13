package com.example.Sneakers.components;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
@Setter
public class VNPayConfig {
    @Value("${payment.vnpay.tmnCode}")
    private String vnp_TmnCode;

    @Value("${payment.vnpay.hashSecret}")
    private String vnp_HashSecret;

    @Value("${payment.vnpay.url}")
    private String vnp_Url;

    @Value("${payment.vnpay.returnUrl}")
    private String vnp_ReturnUrl;
} 