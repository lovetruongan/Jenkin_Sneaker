package com.example.Sneakers.services;

import com.example.Sneakers.dtos.MomoPaymentResponse;
import com.example.Sneakers.dtos.OrderDTO;

public interface IMomoService {
    MomoPaymentResponse createPayment(OrderDTO orderDTO) throws Exception;
} 