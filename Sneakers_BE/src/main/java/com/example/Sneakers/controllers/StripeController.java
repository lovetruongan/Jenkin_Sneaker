package com.example.Sneakers.controllers;

import com.example.Sneakers.dtos.StripePaymentRequestDTO;
import com.example.Sneakers.dtos.StripePaymentResponseDTO;
import com.example.Sneakers.responses.MessageResponse;
import com.example.Sneakers.services.IStripeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("${api.prefix}/stripe")
@RestController
@RequiredArgsConstructor
public class StripeController {

    private final IStripeService stripeService;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(
            @Valid @RequestBody StripePaymentRequestDTO request,
            @RequestHeader(value = "Authorization", required = false) String token,
            BindingResult result) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }

            StripePaymentResponseDTO response = stripeService.createPaymentIntent(request);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    MessageResponse.builder()
                            .message("Failed to create payment intent: " + e.getMessage())
                            .build()
            );
        }
    }

    @PostMapping("/confirm-payment/{paymentIntentId}")
    public ResponseEntity<?> confirmPayment(@PathVariable String paymentIntentId) {
        try {
            StripePaymentResponseDTO response = stripeService.confirmPayment(paymentIntentId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    MessageResponse.builder()
                            .message("Failed to confirm payment: " + e.getMessage())
                            .build()
            );
        }
    }

    @PostMapping("/create-setup-intent")
    public ResponseEntity<?> createSetupIntent() {
        try {
            String clientSecret = stripeService.createPaymentMethodClientSecret();
            return ResponseEntity.ok(
                    MessageResponse.builder()
                            .message(clientSecret)
                            .build()
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    MessageResponse.builder()
                            .message("Failed to create setup intent: " + e.getMessage())
                            .build()
            );
        }
    }

    @GetMapping("/config")
    public ResponseEntity<?> getStripeConfig() {
        // Return the publishable key for frontend
        // In a real app, this should be read from a config file or environment variable
        return ResponseEntity.ok(
                MessageResponse.builder()
                        .message("pk_test_YOUR_PUBLISHABLE_KEY_HERE")
                        .build()
        );
    }
} 