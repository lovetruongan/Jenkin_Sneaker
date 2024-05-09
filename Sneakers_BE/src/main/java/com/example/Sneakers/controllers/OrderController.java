package com.example.Sneakers.controllers;

import com.example.Sneakers.components.LocalizationUtils;
import com.example.Sneakers.dtos.OrderDTO;
import com.example.Sneakers.dtos.StatusDTO;
import com.example.Sneakers.models.Order;
import com.example.Sneakers.responses.*;
import com.example.Sneakers.services.IOrderService;
import com.example.Sneakers.services.OrderService;
import com.example.Sneakers.utils.MessageKeys;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("${api.prefix}/orders")
@RestController
@RequiredArgsConstructor
public class OrderController {
    private final IOrderService orderService;
    private final LocalizationUtils localizationUtils;
    @PostMapping("")
    public ResponseEntity<?> createOrder(
            @Valid @RequestBody OrderDTO orderDTO,
            @RequestHeader("Authorization") String token,
            BindingResult result){
        try {
            if(result.hasErrors()){
                List<String> errorMessages = result.getFieldErrors().stream().map(FieldError::getDefaultMessage).toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }
            OrderIdResponse orderResponse = orderService.createOrder(orderDTO,token);
            return ResponseEntity.ok(orderResponse);
        }
        catch (Exception e ){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/admin")
    public ResponseEntity<?> getALlOrders(
            @RequestHeader("Authorization") String token){
        try {
            List<OrderHistoryResponse> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        }
        catch (Exception e ){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getOrdersByUser(
            @RequestHeader("Authorization") String token){
        try {
            List<OrderHistoryResponse> orders = orderService.findByUserId(token);
            return ResponseEntity.ok(orders);
        }
        catch (Exception e ){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getOrder(@Valid @PathVariable("id") Long orderId){
        try {
            OrderResponse existingOrder = orderService.getOrder(orderId);
            return ResponseEntity.ok((existingOrder));
        }
        catch (Exception e ){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/user/{id}")
    public ResponseEntity<?> getOrderByIdAndUser(
            @Valid @PathVariable("id") Long orderId,
            @RequestHeader("Authorization") String token){
        try {
            OrderResponse existingOrder = orderService.getOrderByUser(orderId,token);
            return ResponseEntity.ok((existingOrder));
        }
        catch (Exception e ){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(
            @Valid @PathVariable Long id,
            @Valid @RequestBody OrderDTO orderDTO){
        try {
            Order order = orderService.updateOrder(id,orderDTO);
            return ResponseEntity.ok(OrderResponse.fromOrder(order));
        }
        catch (Exception e ){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable("id") Long id,
            @RequestBody StatusDTO statusDTO,
            @RequestHeader("Authorization") String token
            ){
        try {
            Order order = orderService.updateOrderStatus(id,statusDTO.getStatus());
            return ResponseEntity.ok(MessageResponse
                    .builder()
                    .message("Update status successfully")
                    .build());
        }
        catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@Valid @PathVariable Long id){
        //Xoá mềm => Cập nhật trường active = false
        orderService.deleteOrder(id);
        return ResponseEntity.ok(localizationUtils.getLocalizedMessage(MessageKeys.DELETE_ORDER_SUCCESSFULLY));
    }

    @GetMapping("/get-orders-by-keyword")
//    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<OrderListResponse> getOrdersByKeyword(
            @RequestParam(defaultValue = "", required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        // Tạo Pageable từ thông tin trang và giới hạn
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                //Sort.by("createdAt").descending()
                Sort.by("id").ascending()
        );
        Page<OrderResponse> orderPage = orderService
                .getOrdersByKeyword(keyword, pageRequest)
                .map(OrderResponse::fromOrder);
        // Lấy tổng số trang
        int totalPages = orderPage.getTotalPages();
        List<OrderResponse> orderResponses = orderPage.getContent();
        return ResponseEntity.ok(OrderListResponse
                .builder()
                .orders(orderResponses)
                .totalPages(totalPages)
                .build());
    }
}