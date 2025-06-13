package com.example.Sneakers.services;

import com.example.Sneakers.dtos.VnpayRefundRequestDTO;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Map;

public interface IVnPayService {
    String createOrder(long total, String orderInfo, Long orderId);
    Map<String, String> refund(VnpayRefundRequestDTO vnpayRefundRequestDTO, HttpServletRequest request) throws Exception;
} 