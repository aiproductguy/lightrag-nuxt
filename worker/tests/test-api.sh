#!/bin/bash

# Configuration
API_URL="https://kv-vector-store.aiproductguy.workers.dev"

echo "🧪 Testing KV+Vector Store API"
echo "=============================="

# Test 1: Upload Document
echo -e "\n📄 Test 1: Uploading document..."
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/documents" \
  -F "title=Test Document" \
  -F "file=@docs/test.md")
echo "Response: $UPLOAD_RESPONSE"

# Extract document ID from response
DOC_ID=$(echo $UPLOAD_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Document ID: $DOC_ID"

# Test 2: Semantic Search
echo -e "\n🔍 Test 2: Testing semantic search..."
SEARCH_QUERIES=(
  "What is machine learning?"
  "How does vector search work?"
  "Explain RAG systems"
)

for query in "${SEARCH_QUERIES[@]}"; do
  echo -e "\nQuery: $query"
  SEARCH_RESPONSE=$(curl -s -X POST "$API_URL/search" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"$query\"}")
  echo "Response: $SEARCH_RESPONSE"
done

# Test 3: Get Stats
echo -e "\n📊 Test 3: Getting stats..."
STATS_RESPONSE=$(curl -s "$API_URL/stats")
echo "Response: $STATS_RESPONSE"

echo -e "\n✅ Tests completed!" 