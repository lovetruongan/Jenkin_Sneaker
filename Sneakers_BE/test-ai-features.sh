#!/bin/bash

# Test script for AI features in Sneakers Backend
# Make sure the application is running on port 8089

echo "=== Testing AI Features for Sneakers Backend ==="
echo

# Base URL
BASE_URL="http://localhost:8089/api"

# Test 1: Index all products
echo "1. Indexing all products..."
curl -X POST "${BASE_URL}/ai/search/index/all-products" | jq .
echo

# Test 2: Search for products
echo "2. Searching for 'comfortable running shoes'..."
curl -G "${BASE_URL}/ai/search/products" \
  --data-urlencode "query=comfortable running shoes" \
  --data-urlencode "topK=5" | jq .
echo

# Test 3: AI Chat
echo "3. Testing AI Chat..."
curl -X POST "${BASE_URL}/ai/chat/text" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What are the best features of Nike sneakers?"}' | jq .
echo

# Test 4: Product Assistant
echo "4. Testing Product Assistant..."
curl -X POST "${BASE_URL}/ai/chat/product-assistant" \
  -H "Content-Type: application/json" \
  -d '{"query": "I need comfortable sneakers for daily walking under 200000 VND"}' | jq .
echo

# Test 5: Search by price range
echo "5. Searching products by price range..."
curl -G "${BASE_URL}/ai/search/products/price-range" \
  --data-urlencode "query=sneakers" \
  --data-urlencode "minPrice=100000" \
  --data-urlencode "maxPrice=500000" \
  --data-urlencode "topK=5" | jq .
echo

# Test 6: Search with scores
echo "6. Searching products with similarity scores..."
curl -G "${BASE_URL}/ai/search/products/with-scores" \
  --data-urlencode "query=nike air max" \
  --data-urlencode "topK=5" \
  --data-urlencode "minScore=0.7" | jq .
echo

echo "=== AI Features Testing Complete ===" 