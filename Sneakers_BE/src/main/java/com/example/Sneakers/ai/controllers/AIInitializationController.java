package com.example.Sneakers.ai.controllers;

import com.example.Sneakers.ai.services.VectorSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/ai/initialize")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class AIInitializationController {

    private final VectorSearchService vectorSearchService;

    @PostMapping("/index-all")
    public ResponseEntity<Map<String, Object>> indexAllData() {
        try {
            log.info("Starting to index all data for AI");

            // Index all products
            vectorSearchService.indexAllProducts();

            // Index all categories
            vectorSearchService.indexAllCategories();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully indexed all products and categories");
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to index data", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getIndexStatus() {
        try {
            long documentCount = vectorSearchService.getDocumentCount();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("documentCount", documentCount);
            response.put("status", documentCount > 0 ? "initialized" : "not_initialized");
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to get index status", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @DeleteMapping("/clear-index")
    public ResponseEntity<Map<String, Object>> clearIndex() {
        try {
            log.warn("Clearing all indexed documents");

            vectorSearchService.clearAllDocuments();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully cleared all indexed documents");
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to clear index", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}