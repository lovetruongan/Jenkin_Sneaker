package com.example.Sneakers.services;

import com.example.Sneakers.dtos.ProductDTO;
import com.example.Sneakers.dtos.ProductImageDTO;
import com.example.Sneakers.exceptions.DataNotFoundException;
import com.example.Sneakers.exceptions.InvalidParamException;
import com.example.Sneakers.models.Category;
import com.example.Sneakers.models.Product;
import com.example.Sneakers.models.ProductImage;
import com.example.Sneakers.repositories.CategoryRepository;
import com.example.Sneakers.repositories.ProductImageRepository;
import com.example.Sneakers.repositories.ProductRepository;
import com.example.Sneakers.responses.ListProductResponse;
import com.example.Sneakers.responses.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService implements IProductService{
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    @Override
    @Transactional
    public Product createProduct(ProductDTO productDTO) throws DataNotFoundException {
        Category existingCategory = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new DataNotFoundException(
                        "Cannot find category with id = " + productDTO.getCategoryId()));
        Product newProduct = Product.builder()
                .name(productDTO.getName())
                .price(productDTO.getPrice())
                .thumbnail(productDTO.getThumbnail())
                .description(productDTO.getDescription())
                .category(existingCategory)
                .discount(productDTO.getDiscount())
                .build();
        return productRepository.save(newProduct);
    }

    @Override
    public Product getProductById(Long productId) throws Exception {
        Optional<Product> optionalProduct = productRepository.getDetailProduct(productId);
        if(optionalProduct.isPresent()) {
            return optionalProduct.get();
        }
        throw new DataNotFoundException("Cannot find product with id =" + productId);
    }

    @Override
    public Page<ProductResponse> getAllProducts(String keyword, Long categoryId, PageRequest pageRequest) {
        //Lấy danh sách sản phẩm theo trang (page), giới hạn (limit), và categoryId (nếu có)
        Page<Product> productPage;
        productPage = productRepository.searchProducts(categoryId, keyword, pageRequest);
        return productPage.map(ProductResponse::fromProduct);
    }

    @Override
    public List<Product> allProducts() {
        return productRepository.findAll();
    }

    @Override
    @Transactional
    public Product updateProduct(Long id, ProductDTO productDTO) throws Exception {
        Product existingProduct = getProductById(id);
        if(existingProduct != null){
            Category existingCategory = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new DataNotFoundException(
                            "Cannot find category with id = "+productDTO.getCategoryId()));
            existingProduct.setName(productDTO.getName());
            existingProduct.setCategory(existingCategory);
            existingProduct.setPrice(productDTO.getPrice());
            existingProduct.setDescription(productDTO.getDescription());
            if(productDTO.getThumbnail()!=null){
                existingProduct.setThumbnail(productDTO.getThumbnail());
            }
            existingProduct.setDiscount(productDTO.getDiscount());
            return productRepository.save(existingProduct);
        }
        return null;
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        optionalProduct.ifPresent(productRepository::delete);
    }

    @Override
    public boolean existsByName(String name) {
        return productRepository.existsByName(name);
    }

    @Override
    @Transactional
    public ProductImage createProductImage(Long productId, ProductImageDTO productImageDTO) throws Exception {
        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new DataNotFoundException(
                        "Cannot find category with id = "+productImageDTO.getProductId()));
        ProductImage newProductImage = ProductImage.builder()
                .product(existingProduct)
                .imageUrl(productImageDTO.getImageUrl())
                .build();
        //Không cho insert quá 5 ảnh cho 1 sản phẩm
        int size = productImageRepository.findByProductId(productId).size();
        if(size >= ProductImage.MAXIMUM_IMAGES_PER_PRODUCT){
            throw new InvalidParamException("Number of images must be <= "
                    + ProductImage.MAXIMUM_IMAGES_PER_PRODUCT);
        }
        return productImageRepository.save(newProductImage);
    }

    @Override
    public List<Product> findProductsByIds(List<Long> productIds) {
        return productRepository.findProductsByIds(productIds);
    }

    @Override
    public long totalProducts() {
        return productRepository.count();
    }

    @Override
    public ListProductResponse getProductsByPrice(Long minPrice, Long maxPrice) {
        List<ProductResponse> productResponses = new ArrayList<>();
        List<Product> products = productRepository.getProductsByPrice(minPrice,maxPrice);
        for(Product product: products){
            productResponses.add(ProductResponse.fromProduct(product));
        }
        return ListProductResponse.builder()
                .products(productResponses)
                .totalProducts(productResponses.size())
                .build();
    }
    @Override
    public ListProductResponse getProductsByKeyword(String keyword) {
        List<ProductResponse> productResponses = new ArrayList<>();
        List<Product> products = productRepository.getProductsByKeyword(keyword);
        for(Product product: products){
            productResponses.add(ProductResponse.fromProduct(product));
        }
        return ListProductResponse.builder()
                .products(productResponses)
                .totalProducts(productResponses.size())
                .build();
    }

    @Override
    public ListProductResponse getProductsByCategory(Long categoryId) {
        List<ProductResponse> productResponses = new ArrayList<>();
        List<Product> products = productRepository.getProductsByCategory(categoryId);
        for(Product product: products){
            productResponses.add(ProductResponse.fromProduct(product));
        }
        return ListProductResponse.builder()
                .products(productResponses)
                .totalProducts(productResponses.size())
                .build();
    }

    @Override
    public ListProductResponse getRelatedProducts(Long productId) throws Exception {
        Product product = getProductById(productId);
        Optional<Product> optionalProduct = productRepository.findById(productId);
        List<ProductResponse> productResponses = new ArrayList<>();
        if(optionalProduct.isEmpty()){
            throw new Exception("Cannot find product with id = " + productId);
        }
        
        Product targetProduct = optionalProduct.get();
        if(targetProduct.getCategory() == null) {
            // If product has no category, return empty list
            return ListProductResponse.builder()
                    .products(productResponses)
                    .totalProducts(0)
                    .build();
        }
        
        List<Product> products = productRepository.getProductsByCategory(
                                    targetProduct.getCategory().getId());
        int cnt = 0;
        for(Product p : products){
            if(!Objects.equals(p.getId(), productId)){
                productResponses.add(ProductResponse.fromProduct(p));
                cnt++;
            }
            if(cnt==4) break;
        }
        return ListProductResponse.builder()
                .products(productResponses)
                .totalProducts(productResponses.size())
                .build();
    }
}