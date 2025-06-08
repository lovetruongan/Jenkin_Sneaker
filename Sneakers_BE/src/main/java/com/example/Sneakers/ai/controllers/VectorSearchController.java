package com.example.Sneakers.ai.controllers;

import com.example.Sneakers.ai.services.VectorSearchService;
import com.example.Sneakers.ai.services.VectorSearchService.DocumentWithScore;
import dev.langchain4j.data.document.Document;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("${api.prefix}/ai/search")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class VectorSearchController {

    private final VectorSearchService vectorSearchService;

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int topK) {

        try {
            log.info("Searching products with query: {}", query);

            List<Document> documents = vectorSearchService.searchProducts(query, topK);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("query", query);
            response.put("topK", topK);
            response.put("resultCount", documents.size());
            response.put("results", documents.stream()
                    .map(this::documentToMap)
                    .collect(Collectors.toList()));
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error searching products", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("query", query);

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/products/category")
    public ResponseEntity<Map<String, Object>> searchProductsByCategory(
            @RequestParam String query,
            @RequestParam String category,
            @RequestParam(defaultValue = "10") int topK) {

        try {
            log.info("Searching products in category {} with query: {}", category, query);

            List<Document> documents = vectorSearchService.searchProductsByCategory(query, category, topK);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("query", query);
            response.put("category", category);
            response.put("topK", topK);
            response.put("resultCount", documents.size());
            response.put("results", documents.stream()
                    .map(this::documentToMap)
                    .collect(Collectors.toList()));
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error searching products by category", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/products/price-range")
    public ResponseEntity<Map<String, Object>> searchProductsByPriceRange(
            @RequestParam String query,
            @RequestParam Long minPrice,
            @RequestParam Long maxPrice,
            @RequestParam(defaultValue = "10") int topK) {

        try {
            log.info("Searching products with price range {}-{} and query: {}", minPrice, maxPrice, query);

            List<Document> documents = vectorSearchService.searchProductsByPriceRange(query, minPrice, maxPrice, topK);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("query", query);
            response.put("minPrice", minPrice);
            response.put("maxPrice", maxPrice);
            response.put("topK", topK);
            response.put("resultCount", documents.size());
            response.put("results", documents.stream()
                    .map(this::documentToMap)
                    .collect(Collectors.toList()));
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error searching products by price range", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/products/with-scores")
    public ResponseEntity<Map<String, Object>> searchProductsWithScores(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int topK,
            @RequestParam(defaultValue = "0.7") double minScore) {

        try {
            log.info("Searching products with scores, query: {}, minScore: {}", query, minScore);

            List<DocumentWithScore> documentsWithScores = vectorSearchService.searchProductsWithScores(query, topK,
                    minScore);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("query", query);
            response.put("topK", topK);
            response.put("minScore", minScore);
            response.put("resultCount", documentsWithScores.size());
            response.put("results", documentsWithScores.stream()
                    .map(this::documentWithScoreToMap)
                    .collect(Collectors.toList()));
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error searching products with scores", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/index/all-products")
    public ResponseEntity<Map<String, Object>> indexAllProducts() {
        try {
            log.info("Starting to index all products");

            vectorSearchService.indexAllProducts();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All products indexed successfully");
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error indexing all products", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/index/all-categories")
    public ResponseEntity<Map<String, Object>> indexAllCategories() {
        try {
            log.info("Starting to index all categories");

            vectorSearchService.indexAllCategories();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All categories indexed successfully");
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error indexing all categories", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    private Map<String, Object> documentToMap(Document document) {
        Map<String, Object> result = new HashMap<>();
        result.put("text", document.text());
        result.put("metadata", document.metadata().toMap());
        return result;
    }

    private Map<String, Object> documentWithScoreToMap(DocumentWithScore documentWithScore) {
        Map<String, Object> result = new HashMap<>();
        result.put("text", documentWithScore.getText());
        result.put("metadata", documentWithScore.getMetadata());
        result.put("score", documentWithScore.getScore());
        return result;
    }
}