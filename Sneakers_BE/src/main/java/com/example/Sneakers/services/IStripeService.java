package com.example.Sneakers.services;

import com.example.Sneakers.dtos.StripePaymentRequestDTO;
import com.example.Sneakers.dtos.StripePaymentResponseDTO;

public interface IStripeService {
    StripePaymentResponseDTO createPaymentIntent(StripePaymentRequestDTO request) throws Exception;
    StripePaymentResponseDTO confirmPayment(String paymentIntentId) throws Exception;
    String createPaymentMethodClientSecret() throws Exception;
    void refund(String paymentIntentId) throws Exception;
} 