package com.example.Sneakers.repositories;

import com.example.Sneakers.models.Cart;
import com.example.Sneakers.models.Product;
import com.example.Sneakers.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart,Long> {
    List<Cart> findByUserId(Long userId);
    Long countByUserId(Long userId);
    void deleteByUserId(Long userId);
    Optional<Cart> findByUserAndProductAndSize(User user, Product product, Long size);
}