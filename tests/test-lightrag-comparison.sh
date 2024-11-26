#!/bin/bash

# Configuration
API_URL="https://kv-vector-store.aiproductguy.workers.dev"

echo "🧪 Testing LightRAG Knowledge Comparison"
echo "======================================"

# Test queries about LightRAG
QUERIES=(
  "What is LightRAG?"
  "How does LightRAG improve RAG efficiency?"
  "What are LightRAG's main contributions to the field?"
)

echo -e "\n📚 Phase 1: Testing Base Knowledge"
echo "--------------------------------"

for query in "${QUERIES[@]}"; do
  echo -e "\nQuery: $query"
  SEARCH_RESPONSE=$(curl -s -X POST "$API_URL/search" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"$query\", \"path\":\"cloud\"}")
  echo "Response: $SEARCH_RESPONSE"
  sleep 2
done

echo -e "\n📄 Phase 2: Uploading LightRAG Paper"
echo "--------------------------------"
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/documents" \
  -H "Content-Type: multipart/form-data" \
  -F "title=LightRAG: Compact LLM Architecture for RAG Tasks" \
  -F "file=@docs/LightRAG-2410.pdf;type=application/pdf" \
  -F "path=cloud")
echo "Response: $UPLOAD_RESPONSE"

# Extract document ID and wait for processing
DOC_ID=$(echo $UPLOAD_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Document ID: $DOC_ID"
echo "Waiting for document processing..."
sleep 15  # Increased wait time for PDF processing

echo -e "\n🔍 Phase 3: Testing Updated Knowledge"
echo "--------------------------------"

for query in "${QUERIES[@]}"; do
  echo -e "\nQuery: $query"
  SEARCH_RESPONSE=$(curl -s -X POST "$API_URL/search" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"$query\", \"path\":\"cloud\"}")
  echo "Response: $SEARCH_RESPONSE"
  sleep 2
done

# Get final stats
echo -e "\n📊 Final Stats"
echo "------------"
STATS_RESPONSE=$(curl -s "$API_URL/stats")
echo "Response: $STATS_RESPONSE"

echo -e "\n✅ Comparison Test Completed!" 