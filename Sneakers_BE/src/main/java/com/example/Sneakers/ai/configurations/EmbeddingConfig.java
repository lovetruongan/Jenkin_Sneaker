package com.example.Sneakers.ai.configurations;

import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.chroma.ChromaEmbeddingStore;
import dev.langchain4j.model.vertexai.VertexAiEmbeddingModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import lombok.extern.slf4j.Slf4j;

import static dev.langchain4j.internal.Utils.randomUUID;

@Configuration
@Slf4j
public class EmbeddingConfig {

    @Value("${spring.google.ai.project-id}")
    private String projectId;

    @Value("${chroma.collection.name:sneakers-collection}")
    private String collectionName;

    @Value("${chroma.base.url:http://localhost:8000}")
    private String chromaBaseUrl;

    @Bean
    public EmbeddingModel embeddingModel() {
        log.info("Initializing Vertex AI embedding model");

        return VertexAiEmbeddingModel.builder()
                .project(projectId)
                .location("us-central1")
                .endpoint("us-central1-aiplatform.googleapis.com:443")
                .publisher("google")
                .modelName("text-multilingual-embedding-002")
                .maxRetries(2)
                .maxSegmentsPerBatch(40)
                .maxTokensPerBatch(2048)
                .taskType(VertexAiEmbeddingModel.TaskType.CLASSIFICATION)
                .autoTruncate(false)
                .outputDimensionality(512)
                .build();
    }

    @Bean
    public ChromaEmbeddingStore chromaEmbeddingStore() {
        log.info("Initializing Chroma embedding store with collection: {}", collectionName);

        try {
            return ChromaEmbeddingStore.builder()
                    .baseUrl(chromaBaseUrl)
                    .collectionName(collectionName)
                    .logRequests(true)
                    .logResponses(true)
                    .build();
        } catch (Exception e) {
            log.error("Failed to initialize Chroma embedding store", e);
            throw new RuntimeException("Failed to initialize Chroma embedding store", e);
        }
    }
}