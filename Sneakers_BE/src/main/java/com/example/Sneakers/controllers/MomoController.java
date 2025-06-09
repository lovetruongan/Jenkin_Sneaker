package com.example.Sneakers.controllers;

import com.example.Sneakers.dtos.MomoIPNRequest;
import com.example.Sneakers.dtos.MomoPaymentResponse;
import com.example.Sneakers.dtos.OrderDTO;
import com.example.Sneakers.models.Order;
import com.example.Sneakers.models.OrderStatus;
import com.example.Sneakers.repositories.OrderRepository;
import com.example.Sneakers.services.IMomoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("${api.prefix}/momo")
@RequiredArgsConstructor
@Slf4j
public class MomoController {

    private final IMomoService momoService;
    private final OrderRepository orderRepository;

    @PostMapping("/create-payment")
    public ResponseEntity<MomoPaymentResponse> createPayment(@RequestBody OrderDTO orderDTO) {
        try {
            MomoPaymentResponse momoResponse = momoService.createPayment(orderDTO);
            return ResponseEntity.ok(momoResponse);
        } catch (Exception e) {
            log.error("Error creating MoMo payment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/ipn")
    public ResponseEntity<Void> handleIpn(@RequestBody MomoIPNRequest ipnRequest) {
        log.info("Received MoMo IPN: {}", ipnRequest);

        // Basic validation
        if (ipnRequest == null || ipnRequest.getOrderId() == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            // In a real application, you must verify the signature from MoMo first
            // For now, we'll trust the IPN for demonstration purposes.

            if (ipnRequest.getResultCode() == 0) {
                // Find order by the `orderId` you sent to MoMo
                // This assumes you have stored the MoMo-specific orderId somewhere or can map it back
                // For this example, let's assume `extraData` contains your internal order ID
                Long internalOrderId = Long.parseLong(ipnRequest.getExtraData());
                Order order = orderRepository.findById(internalOrderId)
                        .orElseThrow(() -> new Exception("Order not found: " + internalOrderId));
                
                order.setStatus(OrderStatus.PROCESSING);
                order.setPaymentMethod("MoMo Wallet");
                orderRepository.save(order);
                
                log.info("Order {} status updated to PROCESSING.", internalOrderId);

            } else {
                log.warn("MoMo payment failed for orderId {}: {}", ipnRequest.getOrderId(), ipnRequest.getMessage());
                // Optionally, update order status to 'failed'
            }

            // Respond to MoMo that the IPN was received successfully
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("Error processing MoMo IPN: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 