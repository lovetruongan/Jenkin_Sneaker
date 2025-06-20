package com.example.Sneakers.services;

import com.example.Sneakers.dtos.CartItemDTO;
import com.example.Sneakers.dtos.DashboardStatsDTO;
import com.example.Sneakers.dtos.OrderDTO;
import com.example.Sneakers.exceptions.DataNotFoundException;
import com.example.Sneakers.models.Order;
import com.example.Sneakers.responses.MessageResponse;
import com.example.Sneakers.responses.OrderHistoryResponse;
import com.example.Sneakers.responses.OrderIdResponse;
import com.example.Sneakers.responses.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface IOrderService {
    OrderIdResponse createOrder(OrderDTO orderDTO, String token) throws Exception;
    OrderResponse getOrder(Long id);


    OrderResponse getOrderByUser(Long orderId, String token) throws Exception;
    Order updateOrder(Long id, OrderDTO orderDTO) throws DataNotFoundException;
    void deleteOrder(Long id);
    List<OrderHistoryResponse> findByUserId(String token) throws Exception;
    List<OrderHistoryResponse> getAllOrders();
    Page<Order> getOrdersByKeyword(String keyword, String status, LocalDate startDate, LocalDate endDate, Pageable pageable);
    Order updateOrderStatus(Long orderId, String status) throws DataNotFoundException;
    Long getTotalRevenue();
    DashboardStatsDTO getDashboardStats();
    List<Order> findByUserId(Long userId);
    long countOrders();
    List<Order> getOrdersByDateRange(LocalDate startDate, LocalDate endDate);
}