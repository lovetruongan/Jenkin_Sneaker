package com.example.Sneakers.ai.services;

import com.example.Sneakers.models.Product;
import com.example.Sneakers.models.Category;
import com.example.Sneakers.repositories.ProductRepository;
import com.example.Sneakers.repositories.CategoryRepository;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.chroma.ChromaEmbeddingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VectorSearchServiceImpl implements VectorSearchService {

    private final ChromaEmbeddingStore chromaEmbeddingStore;
    private final EmbeddingModel embeddingModel;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public void indexProduct(Product product) {
        log.info("Indexing product: {}", product.getName());

        String content = formatProductContent(product);
        Map<String, String> metadata = createProductMetadata(product);

        Embedding embedding = embeddingModel.embed(content).content();
        TextSegment segment = TextSegment.from(content, Metadata.from(metadata));

        chromaEmbeddingStore.add(embedding, segment);
        log.info("Successfully indexed product: {}", product.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public void indexAllProducts() {
        log.info("Starting to index all products");
        List<Product> products = productRepository.findAll();

        for (Product product : products) {
            try {
                indexProduct(product);
            } catch (Exception e) {
                log.error("Failed to index product: {}", product.getName(), e);
            }
        }

        log.info("Completed indexing {} products", products.size());
    }

    @Override
    @Transactional(readOnly = true)
    public void updateProductIndex(Product product) {
        // For now, we'll delete and re-add
        // In production, you might want to implement proper update logic
        deleteProductFromIndex(product.getId());
        indexProduct(product);
    }

    @Override
    public void deleteProductFromIndex(Long productId) {
        log.info("Deleting product from index: {}", productId);
        // ChromaDB doesn't have direct delete by metadata, so this is a simplified
        // version
        // In production, you'd want to maintain a mapping of product IDs to embedding
        // IDs
    }

    @Override
    @Transactional(readOnly = true)
    public void indexCategory(Category category) {
        log.info("Indexing category: {}", category.getName());

        String content = String.format("Category: %s", category.getName());
        Map<String, String> metadata = new HashMap<>();
        metadata.put("type", "category");
        metadata.put("category_id", category.getId().toString());
        metadata.put("category_name", category.getName());

        Embedding embedding = embeddingModel.embed(content).content();
        TextSegment segment = TextSegment.from(content, Metadata.from(metadata));

        chromaEmbeddingStore.add(embedding, segment);
    }

    @Override
    @Transactional(readOnly = true)
    public void indexAllCategories() {
        log.info("Starting to index all categories");
        List<Category> categories = categoryRepository.findAll();

        for (Category category : categories) {
            try {
                indexCategory(category);
            } catch (Exception e) {
                log.error("Failed to index category: {}", category.getName(), e);
            }
        }

        log.info("Completed indexing {} categories", categories.size());
    }

    @Override
    public List<Document> searchProducts(String query, int topK) {
        log.debug("Searching products with query: {}", query);

        Embedding queryEmbedding = embeddingModel.embed(query).content();

        EmbeddingSearchRequest searchRequest = new EmbeddingSearchRequest(
                queryEmbedding,
                topK,
                0.7, // minimum score
                null // no filter
        );

        EmbeddingSearchResult<TextSegment> searchResult = chromaEmbeddingStore.search(searchRequest);

        return searchResult.matches().stream()
                .map(match -> Document.from(match.embedded().text(), match.embedded().metadata()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Document> searchProductsByCategory(String query, String categoryName, int topK) {
        log.debug("Searching products in category: {} with query: {}", categoryName, query);

        // Create a query that includes the category context
        String enhancedQuery = String.format("%s in %s category", query, categoryName);

        return searchProducts(enhancedQuery, topK);
    }

    @Override
    public List<Document> searchProductsByPriceRange(String query, Long minPrice, Long maxPrice, int topK) {
        log.debug("Searching products with price range: {} - {} and query: {}", minPrice, maxPrice, query);

        // For now, we'll use the basic search and filter results
        // In production, you'd want to use metadata filtering in ChromaDB
        return searchProducts(query, topK * 2).stream()
                .filter(doc -> {
                    try {
                        Map<String, Object> metadata = doc.metadata().toMap();
                        Object priceObj = metadata.get("price");
                        if (priceObj != null) {
                            Long price = Long.parseLong(priceObj.toString());
                            return price >= minPrice && price <= maxPrice;
                        }
                        return false;
                    } catch (NumberFormatException e) {
                        return false;
                    }
                })
                .limit(topK)
                .collect(Collectors.toList());
    }

    @Override
    public List<DocumentWithScore> searchProductsWithScores(String query, int topK, double minScore) {
        log.debug("Searching products with scores, query: {}, minScore: {}", query, minScore);

        Embedding queryEmbedding = embeddingModel.embed(query).content();

        EmbeddingSearchRequest searchRequest = new EmbeddingSearchRequest(
                queryEmbedding,
                topK,
                minScore,
                null);

        EmbeddingSearchResult<TextSegment> searchResult = chromaEmbeddingStore.search(searchRequest);

        return searchResult.matches().stream()
                .map(match -> new DocumentWithScore(
                        Document.from(match.embedded().text(), match.embedded().metadata()),
                        match.score()))
                .collect(Collectors.toList());
    }

    @Override
    public void clearAllDocuments() {
        log.warn("Clearing all documents from vector store");
        // This would need to be implemented based on ChromaDB's API
        // For now, it's a placeholder
    }

    @Override
    public long getDocumentCount() {
        // This would need to be implemented based on ChromaDB's API
        return 0;
    }

    private String formatProductContent(Product product) {
        return String.format("""
                Product: %s
                Description: %s
                Category: %s
                Price: %d VND
                Discount: %d%%
                Features: Sneaker shoe, comfortable, stylish
                """,
                product.getName(),
                product.getDescription(),
                product.getCategory() != null ? product.getCategory().getName() : "Unknown",
                product.getPrice(),
                product.getDiscount() != null ? product.getDiscount() : 0);
    }

    private Map<String, String> createProductMetadata(Product product) {
        Map<String, String> metadata = new HashMap<>();
        metadata.put("type", "product");
        metadata.put("product_id", product.getId().toString());
        metadata.put("product_name", product.getName());
        metadata.put("price", product.getPrice().toString());
        metadata.put("category_id", product.getCategory() != null ? product.getCategory().getId().toString() : "");
        metadata.put("category_name", product.getCategory() != null ? product.getCategory().getName() : "");
        metadata.put("discount", product.getDiscount() != null ? product.getDiscount().toString() : "0");

        return metadata;
    }
}