package com.example.Sneakers.ai.services;

import com.example.Sneakers.models.Product;
import com.example.Sneakers.repositories.ProductRepository;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIProductAssistantService {

    private final ChatModel geminiChatModel;
    private final VectorSearchService vectorSearchService;
    private final ProductRepository productRepository;

    public String answerProductQuery(String userQuery) {
        log.info("Processing product query: {}", userQuery);

        // Search for relevant products using vector search
        List<Document> relevantDocuments = vectorSearchService.searchProducts(userQuery, 5);

        // Extract product information from documents
        String productContext = buildProductContext(relevantDocuments);

        // Create enhanced prompt with product context
        String enhancedPrompt = createEnhancedPrompt(userQuery, productContext);

        // Get response from Gemini
        var response = geminiChatModel.chat(UserMessage.from(enhancedPrompt));

        return response.aiMessage().text();
    }

    public String answerProductQueryByCategory(String userQuery, String category) {
        log.info("Processing product query in category {}: {}", category, userQuery);

        // Search for relevant products in specific category
        List<Document> relevantDocuments = vectorSearchService.searchProductsByCategory(userQuery, category, 5);

        String productContext = buildProductContext(relevantDocuments);
        String enhancedPrompt = createCategoryPrompt(userQuery, category, productContext);

        var response = geminiChatModel.chat(UserMessage.from(enhancedPrompt));

        return response.aiMessage().text();
    }

    public String answerProductQueryByPriceRange(String userQuery, Long minPrice, Long maxPrice) {
        log.info("Processing product query with price range {}-{}: {}", minPrice, maxPrice, userQuery);

        // Search for relevant products in price range
        List<Document> relevantDocuments = vectorSearchService.searchProductsByPriceRange(userQuery, minPrice, maxPrice,
                5);

        String productContext = buildProductContext(relevantDocuments);
        String enhancedPrompt = createPriceRangePrompt(userQuery, minPrice, maxPrice, productContext);

        var response = geminiChatModel.chat(UserMessage.from(enhancedPrompt));

        return response.aiMessage().text();
    }

    public String compareProducts(List<Long> productIds) {
        log.info("Comparing products: {}", productIds);

        // Fetch products from database
        List<Product> products = productRepository.findAllById(productIds);

        if (products.isEmpty()) {
            return "Sorry, I couldn't find the products you want to compare.";
        }

        String comparisonContext = buildComparisonContext(products);
        String prompt = createComparisonPrompt(comparisonContext);

        var response = geminiChatModel.chat(UserMessage.from(prompt));

        return response.aiMessage().text();
    }

    public String provideProductRecommendations(String userPreferences) {
        log.info("Generating recommendations based on: {}", userPreferences);

        // Search for products matching preferences
        List<Document> relevantDocuments = vectorSearchService.searchProducts(userPreferences, 10);

        String productContext = buildProductContext(relevantDocuments);
        String prompt = createRecommendationPrompt(userPreferences, productContext);

        var response = geminiChatModel.chat(UserMessage.from(prompt));

        return response.aiMessage().text();
    }

    private String buildProductContext(List<Document> documents) {
        if (documents.isEmpty()) {
            return "No specific products found in the database.";
        }

        StringBuilder context = new StringBuilder("Here are the relevant products from our database:\n\n");

        for (int i = 0; i < documents.size(); i++) {
            Document doc = documents.get(i);
            Map<String, Object> metadata = doc.metadata().toMap();

            context.append(String.format("%d. Product: %s\n", i + 1, metadata.get("product_name")));
            context.append(String.format("   Price: %s VND\n", metadata.get("price")));
            context.append(String.format("   Category: %s\n", metadata.get("category_name")));
            context.append(String.format("   Discount: %s%%\n", metadata.get("discount")));
            context.append(String.format("   Description: %s\n\n", doc.text()));
        }

        return context.toString();
    }

    private String buildComparisonContext(List<Product> products) {
        StringBuilder context = new StringBuilder("Products to compare:\n\n");

        for (Product product : products) {
            context.append(String.format("Product: %s\n", product.getName()));
            context.append(String.format("Price: %d VND\n", product.getPrice()));
            context.append(String.format("Category: %s\n",
                    product.getCategory() != null ? product.getCategory().getName() : "Unknown"));
            context.append(String.format("Discount: %d%%\n",
                    product.getDiscount() != null ? product.getDiscount() : 0));
            context.append(String.format("Description: %s\n\n", product.getDescription()));
        }

        return context.toString();
    }

    private String createEnhancedPrompt(String userQuery, String productContext) {
        return String.format("""
                You are a helpful sneaker shopping assistant with access to our product database.

                Customer Question: "%s"

                %s

                Please provide a helpful and accurate response based on the products in our database.
                If the customer is asking about specific products, reference the actual products above.
                Include prices, features, and any relevant details from the product information.
                If no relevant products were found, suggest alternatives or ask for clarification.
                Keep your response friendly, informative, and focused on helping the customer find the right sneakers.
                """, userQuery, productContext);
    }

    private String createCategoryPrompt(String userQuery, String category, String productContext) {
        return String.format("""
                You are a helpful sneaker shopping assistant with access to our product database.

                Customer Question about %s category: "%s"

                %s

                Please provide a helpful response focusing on products in the %s category.
                Highlight the features and benefits of products in this specific category.
                Include prices and any special offers available.
                """, category, userQuery, productContext, category);
    }

    private String createPriceRangePrompt(String userQuery, Long minPrice, Long maxPrice, String productContext) {
        return String.format("""
                You are a helpful sneaker shopping assistant with access to our product database.

                Customer Question (budget: %,d - %,d VND): "%s"

                %s

                Please provide recommendations within the customer's budget range.
                Highlight the best value options and explain why they're good choices.
                If there are products slightly outside their range with significant benefits, you can mention them too.
                """, minPrice, maxPrice, userQuery, productContext);
    }

    private String createComparisonPrompt(String comparisonContext) {
        return String.format("""
                You are a helpful sneaker shopping assistant. Please compare these products:

                %s

                Provide a detailed comparison including:
                1. Price differences and value for money
                2. Key features and benefits of each
                3. Best use cases for each product
                4. Your recommendation based on different customer needs

                Format your response in a clear, easy-to-read manner.
                """, comparisonContext);
    }

    private String createRecommendationPrompt(String preferences, String productContext) {
        return String.format("""
                You are a helpful sneaker shopping assistant with access to our product database.

                Customer Preferences: "%s"

                %s

                Based on the customer's preferences and our available products, provide personalized recommendations.
                Explain why each recommended product matches their needs.
                Suggest 3-5 products ranked by how well they match the preferences.
                Include prices and any special offers.
                """, preferences, productContext);
    }
}