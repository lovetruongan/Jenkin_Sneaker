package com.example.Sneakers.controllers;

import com.example.Sneakers.dtos.CartItemDTO;
import com.example.Sneakers.dtos.CategoryDTO;
import com.example.Sneakers.dtos.ProductDTO;
import com.example.Sneakers.models.Cart;
import com.example.Sneakers.models.Category;
import com.example.Sneakers.models.Product;
import com.example.Sneakers.models.User;
import com.example.Sneakers.responses.CartResponse;
import com.example.Sneakers.responses.CategoryResponse;
import com.example.Sneakers.responses.ListCartResponse;
import com.example.Sneakers.responses.ProductResponse;
import com.example.Sneakers.services.ICartService;
import com.example.Sneakers.services.IUserService;
import com.example.Sneakers.utils.MessageKeys;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/carts")
@RequiredArgsConstructor
public class CartController {
    private final ICartService cartService;
    @PostMapping("")
    public ResponseEntity<?> createCart(
            @Valid @RequestBody CartItemDTO cartItemDTO,
            @RequestHeader("Authorization") String token,
            BindingResult result
    ) throws Exception {
        try {
            if(result.hasErrors()){
                List<String> errorMessages = result.getFieldErrors()
                        .stream().map(FieldError::getDefaultMessage).toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }
            Cart cart = cartService.createCart(cartItemDTO,token);
            return ResponseEntity.ok(CartResponse.fromCart(cart));
        }
        catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("")
    public ResponseEntity<?> getCartByUserId(
            @RequestHeader("Authorization") String token
    ){
        try {
            ListCartResponse listCartResponse = cartService.getCartsByUserId(token);
            return ResponseEntity.ok(listCartResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCart(
            @PathVariable Long id,
            @Valid @RequestBody CartItemDTO cartItemDTO,
            @RequestHeader("Authorization") String token){
        try {
            Cart updatedCart = cartService.updateCart(id,cartItemDTO,token);
            return ResponseEntity.ok(CartResponse.fromCart(updatedCart));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCart(
            @Valid @PathVariable("id") Long id,
            @RequestHeader("Authorization") String token
    ){
        try {
            cartService.deleteCart(id);
            ListCartResponse listCartResponse = cartService.getCartsByUserId(token);
            return ResponseEntity.ok(listCartResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("")
    public ResponseEntity<?> deleteCartByUserId(
            @RequestHeader("Authorization") String token
    ){
        try {
            cartService.deleteCartByUserId(token);
            ListCartResponse listCartResponse = cartService.getCartsByUserId(token);
            return ResponseEntity.ok(listCartResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}