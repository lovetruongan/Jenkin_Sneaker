package com.example.Sneakers.ai.controllers;

import dev.langchain4j.data.message.ImageContent;
import dev.langchain4j.data.message.TextContent;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/ai/chat")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class AIChatController {

    private final ChatModel geminiChatModel;

    @PostMapping("/text")
    public ResponseEntity<Map<String, Object>> chatWithText(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Message cannot be empty"));
            }

            log.info("Processing text chat request");
            var response = geminiChatModel.chat(UserMessage.from(message));

            Map<String, Object> result = new HashMap<>();
            result.put("response", response.aiMessage().text());
            result.put("success", true);
            result.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Error processing text chat", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> chatWithImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam("prompt") String prompt) {

        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Image cannot be empty"));
            }

            if (prompt == null || prompt.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Prompt cannot be empty"));
            }

            log.info("Processing image chat request");
            byte[] imageBytes = image.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            var response = geminiChatModel.chat(
                    UserMessage.from(
                            ImageContent.from(base64Image),
                            TextContent.from(prompt)));

            Map<String, Object> result = new HashMap<>();
            result.put("response", response.aiMessage().text());
            result.put("success", true);
            result.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(result);

        } catch (IOException e) {
            log.error("Failed to process image", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process image: " + e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.internalServerError().body(errorResponse);
        } catch (Exception e) {
            log.error("Error processing image chat", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/product-assistant")
    public ResponseEntity<Map<String, Object>> productAssistant(@RequestBody Map<String, String> request) {
        try {
            String userQuery = request.get("query");
            if (userQuery == null || userQuery.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Query cannot be empty"));
            }

            // Create a prompt for product assistance
            String enhancedPrompt = String.format("""
                    You are a helpful sneaker shopping assistant.
                    The user has asked: "%s"

                    Please provide helpful information about sneakers, recommendations,
                    or answer their question in a friendly and knowledgeable manner.
                    If they're asking about specific products, suggest they use our search feature.
                    """, userQuery);

            log.info("Processing product assistant request");
            var response = geminiChatModel.chat(UserMessage.from(enhancedPrompt));

            Map<String, Object> result = new HashMap<>();
            result.put("response", response.aiMessage().text());
            result.put("success", true);
            result.put("type", "product-assistant");
            result.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Error in product assistant", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}