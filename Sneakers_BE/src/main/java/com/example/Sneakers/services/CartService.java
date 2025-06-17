package com.example.Sneakers.services;

import com.example.Sneakers.dtos.CartItemDTO;
import com.example.Sneakers.exceptions.DataNotFoundException;
import com.example.Sneakers.models.Cart;
import com.example.Sneakers.models.Product;
import com.example.Sneakers.models.User;
import com.example.Sneakers.repositories.CartRepository;
import com.example.Sneakers.repositories.ProductRepository;
import com.example.Sneakers.repositories.UserRepository;
import com.example.Sneakers.responses.CartResponse;
import com.example.Sneakers.responses.ListCartResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService implements ICartService{
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    @Override
    @Transactional
    public Cart createCart(CartItemDTO cartItemDTO,String token) throws Exception {
        Product product = productRepository.findById(cartItemDTO.getProductId())
                .orElseThrow(() -> new DataNotFoundException(
                        "Cannot find product with id = " + cartItemDTO.getProductId()
                ));
        String extractedToken = token.substring(7); // Loại bỏ "Bearer " từ chuỗi token
        User user = userService.getUserDetailsFromToken(extractedToken);

        Optional<Cart> existingCartOptional = cartRepository.findByUserAndProductAndSize(user,product,cartItemDTO.getSize());

        if(existingCartOptional.isPresent()){
            Cart existingCart = existingCartOptional.get();
            existingCart.setQuantity(existingCart.getQuantity()+cartItemDTO.getQuantity());
            return cartRepository.save(existingCart);
        }

        Cart cart = Cart.builder()
                .product(product)
                .quantity(cartItemDTO.getQuantity())
                .size(cartItemDTO.getSize())
                .user(user)
                .build();
        return cartRepository.save(cart);
    }

    @Override
    public ListCartResponse getCartsByUserId(String token) throws Exception {
        String extractedToken = token.substring(7); // Loại bỏ "Bearer " từ chuỗi token
        User user = userService.getUserDetailsFromToken(extractedToken);
        List<CartResponse> cartResponses = new ArrayList<>();
        List<Cart> carts = cartRepository.findByUserId(user.getId());
        for(Cart cart: carts){
            cartResponses.add(CartResponse.fromCart(cart));
        }
        return ListCartResponse.builder()
                .carts(cartResponses)
                .totalCartItems(cartRepository.countByUserId(user.getId()))
                .build();
    }

    @Override
    @Transactional
    public Cart updateCart(Long id, CartItemDTO cartItemDTO,String token) throws Exception {
        String extractedToken = token.substring(7); // Loại bỏ "Bearer " từ chuỗi token
        User user = userService.getUserDetailsFromToken(extractedToken);
        Cart cart = cartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        Product product = productRepository.findById(cartItemDTO.getProductId())
                .orElseThrow(() -> new DataNotFoundException(
                        "Cannot find product with id = " + cartItemDTO.getProductId()
                ));
        if(!Objects.equals(cart.getProduct().getId(), product.getId())){
            throw new DataNotFoundException("Product's id is not valid");
        }
        Optional<Cart> existingCartOptional = cartRepository.findByUserAndProductAndSize(user,product,cartItemDTO.getSize());

        if(existingCartOptional.isPresent()){
            Cart existingCart = existingCartOptional.get();
            if(existingCart.getId()!=id){
                existingCart.setQuantity(existingCart.getQuantity()+cartItemDTO.getQuantity());
                cartRepository.deleteById(id);
                return cartRepository.save(existingCart);
            }
        }
        cart.setProduct(product);
        cart.setQuantity(cartItemDTO.getQuantity());
        cart.setSize(cartItemDTO.getSize());
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void deleteCart(Long id) {
        cartRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteCartByUserId(String token) throws Exception {
        String extractedToken = token.substring(7); // Loại bỏ "Bearer " từ chuỗi token
        User user = userService.getUserDetailsFromToken(extractedToken);
        cartRepository.deleteByUserId(user.getId());
    }

    @Override
    public Long countCartsByUserId(Long userId) {
        return cartRepository.countByUserId(userId);
    }


}