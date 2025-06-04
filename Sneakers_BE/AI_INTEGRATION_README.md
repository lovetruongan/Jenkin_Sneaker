# AI Integration for Sneakers Backend

This document describes the AI features integrated into the Sneakers backend using LangChain4J and Google Gemini.

## Features

### 1. AI Chat Assistant

- Text-based chat using Google Gemini
- Image analysis capabilities
- Product-specific assistant for sneaker recommendations

### 2. Vector Search

- Semantic search for products
- Search by category
- Search by price range
- Similarity scoring

## Setup

### Prerequisites

1. **Google Cloud Project**
   - Create a Google Cloud project
   - Enable Vertex AI API
   - Set up authentication (Application Default Credentials)

2. **Chroma Vector Database**
   - Run Chroma using Docker Compose:

   ```bash
   docker-compose up -d
   ```

   The docker-compose.yml file:

   ```yaml
   version: '3.9'
   services:
     chroma:
       image: ghcr.io/chroma-core/chroma:latest
       environment:
         - IS_PERSISTENT=TRUE
       volumes:
         - chroma-data:/chroma/chroma/
       ports:
         - 8000:8000
   volumes:
     chroma-data:
       driver: local
   ```

### Configuration

Update your `application.yaml`:

```yaml
spring:
  google:
    ai:
      project-id: your-google-cloud-project-id
      location: us-central1
      model: gemini-1.5-flash
  autoconfigure:
    exclude:
      - org.springframework.ai.autoconfigure.vectorstore.chroma.ChromaVectorStoreAutoConfiguration

chroma:
  collection:
    name: sneakers-collection
  base:
    url: http://localhost:8000
```

### Google Cloud Authentication

Set up Application Default Credentials:

```bash
gcloud auth application-default login
```

Or set the environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
```

## API Endpoints

### AI Chat Endpoints

#### 1. Text Chat

```bash
POST /api/ai/chat/text
Content-Type: application/json

{
  "prompt": "What are the best running sneakers?"
}
```

#### 2. Image Chat

```bash
POST /api/ai/chat/image
Content-Type: multipart/form-data

image: [file]
prompt: "What type of sneakers are these?"
```

#### 3. Product Assistant

```bash
POST /api/ai/chat/product-assistant
Content-Type: application/json

{
  "query": "I need comfortable sneakers for daily walking"
}
```

### Vector Search Endpoints

#### 1. Search Products

```bash
GET /api/ai/search/products?query=comfortable running shoes&topK=10
```

#### 2. Search by Category

```bash
GET /api/ai/search/products/category?query=lightweight&category=Running&topK=10
```

#### 3. Search by Price Range

```bash
GET /api/ai/search/products/price-range?query=premium sneakers&minPrice=100000&maxPrice=500000&topK=10
```

#### 4. Search with Similarity Scores

```bash
GET /api/ai/search/products/with-scores?query=nike air max&topK=10&minScore=0.7
```

#### 5. Index All Products

```bash
POST /api/ai/search/index/all-products
```

#### 6. Index All Categories

```bash
POST /api/ai/search/index/all-categories
```

## Automatic Indexing

Products are automatically indexed when:

- A new product is created
- An existing product is updated
- A product is deleted (removed from index)

This is handled by the `ProductIndexListener` which uses JPA entity listeners.

## Example Usage

### 1. Initialize the Vector Database

First, index all existing products:

```bash
curl -X POST http://localhost:8089/api/ai/search/index/all-products
```

### 2. Search for Products

```bash
curl "http://localhost:8089/api/ai/search/products?query=comfortable%20running%20shoes&topK=5"
```

### 3. Chat with AI Assistant

```bash
curl -X POST http://localhost:8089/api/ai/chat/text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What are the key features of good running shoes?"}'
```

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Ensure Google Cloud credentials are properly set up
   - Check if Vertex AI API is enabled in your project

2. **Chroma Connection Error**
   - Verify Chroma is running: `docker ps`
   - Check if port 8000 is available

3. **Indexing Issues**
   - Check logs for indexing errors
   - Ensure products have proper data (name, description, category)

### Logs

Monitor application logs for AI-related activities:

```bash
tail -f logs/application.log | grep -E "(AI|Vector|Gemini|Chroma)"
```

## Performance Considerations

1. **Batch Indexing**: When indexing many products, consider implementing batch processing
2. **Caching**: Consider caching frequent AI responses
3. **Rate Limiting**: Implement rate limiting for AI endpoints to control costs

## Future Enhancements

1. **Multi-language Support**: Add support for Vietnamese product descriptions
2. **Image Search**: Enable searching products by uploading images
3. **Personalization**: Use user history for personalized recommendations
4. **Advanced Filters**: Add more metadata filters for vector search
5. **Analytics**: Track search queries and AI usage patterns
