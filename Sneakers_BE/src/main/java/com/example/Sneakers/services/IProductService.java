package com.example.Sneakers.services;

import com.example.Sneakers.dtos.ProductDTO;
import com.example.Sneakers.dtos.ProductImageDTO;
import com.example.Sneakers.models.Product;
import com.example.Sneakers.models.ProductImage;
import com.example.Sneakers.responses.ListProductResponse;
import com.example.Sneakers.responses.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;

public interface IProductService {
    Product createProduct(ProductDTO productDTO) throws Exception;

    Product getProductById(Long productId) throws Exception;

    Page<ProductResponse> getAllProducts(String keyword, Long categoryId, PageRequest pageRequest);

    List<Product> allProducts();

    Product updateProduct(Long id, ProductDTO productDTO) throws Exception;

    void deleteProduct(Long id);

    boolean existsByName(String name);

    ProductImage createProductImage(Long productId, ProductImageDTO productImageDTO) throws Exception;

    List<Product> findProductsByIds(List<Long> productIds);

    long totalProducts();

    ListProductResponse getProductsByPrice(Long minPrice, Long maxPrice);

    ListProductResponse getProductsByKeyword(String keyword);

    ListProductResponse getProductsByCategory(Long categoryId);

    ListProductResponse getRelatedProducts(Long productId) throws Exception;

    void updateProductThumbnail(Long productId, String thumbnailUrl) throws Exception;

    void deleteProductImage(Long id) throws Exception;
}