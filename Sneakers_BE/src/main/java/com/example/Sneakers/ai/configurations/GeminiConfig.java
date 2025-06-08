package com.example.Sneakers.ai.configurations;

import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.vertexai.VertexAiGeminiChatModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
@Slf4j
public class GeminiConfig {

    @Value("${spring.google.ai.project-id}")
    private String projectId;

    @Value("${spring.google.ai.location}")
    private String location;

    @Value("${spring.google.ai.model}")
    private String modelName;

    @Bean
    public ChatModel geminiChatModel() throws IOException {
        log.info("Initializing Gemini chat model with project: {}, location: {}, model: {}",
                projectId, location, modelName);

        return VertexAiGeminiChatModel.builder()
                .project(projectId)
                .location(location)
                .modelName(modelName)
                .build();
    }
}