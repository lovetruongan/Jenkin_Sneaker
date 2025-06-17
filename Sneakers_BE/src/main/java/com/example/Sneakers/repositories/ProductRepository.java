package com.example.Sneakers.repositories;


import com.example.Sneakers.models.Product;
import com.example.Sneakers.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product,Long> {
    Page<Product> findAll(Pageable pageable); //Phân trang

    boolean existsByName(String name);

    @Query("SELECT p FROM Product p WHERE " +
            "(:categoryId IS NULL OR :categoryId = 0 OR p.category.id = :categoryId) " +
            "AND (:keyword IS NULL OR :keyword = '' OR p.name LIKE %:keyword% OR p.description LIKE %:keyword%)")
    Page<Product> searchProducts(
            @Param("categoryId") Long categoryId,
            @Param("keyword") String keyword,
            Pageable pageable);
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.productImages WHERE p.id = :productId")
    Optional<Product> getDetailProduct(@Param("productId") Long productId);
    @Query("SELECT p FROM Product p WHERE p.id IN :productIds")
    List<Product> findProductsByIds(@Param("productIds") List<Long> productIds);
    long count();
    @Query("SELECT p FROM Product p " +
            "WHERE (:minPrice IS NULL OR p.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
    List<Product> getProductsByPrice(
            @Param("minPrice") Long minPrice,
            @Param("maxPrice") Long maxPrice);

    @Query("SELECT p FROM Product p " +
                "WHERE (:keyword IS NULL OR :keyword = '' " +
                    "OR p.name LIKE %:keyword% OR p.description LIKE %:keyword%)")
    List<Product> getProductsByKeyword(
            @Param("keyword") String keyword);

    @Query("SELECT p FROM Product p " +
            "WHERE (:categoryId IS NULL OR :categoryId = 0 OR p.category.id = :categoryId)")
    List<Product> getProductsByCategory(
            @Param("categoryId") Long categoryId);
}