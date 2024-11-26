#!/bin/bash

# Configuration
API_URL="https://kv-vector-store.aiproductguy.workers.dev"

echo "🧪 Testing LightRAG 2.0 Upsert"
echo "=============================="

# Test Cloud Path
echo -e "\n📤 Test 1: Cloud Path Upload"
CLOUD_RESPONSE=$(curl -s -X POST "$API_URL/documents" \
  -F "title=Cloud Processing Test" \
  -F "file=@docs/upsert-diagram-v2.md" \
  -F "path=cloud")
echo "Cloud Response:"
echo "$CLOUD_RESPONSE" | jq '.'

# Test Local Path
echo -e "\n📥 Test 2: Local Path Upload"
LOCAL_RESPONSE=$(curl -s -X POST "$API_URL/documents" \
  -F "title=Local Processing Test" \
  -F "file=@docs/upsert-diagram-v2.md" \
  -F "path=local")
echo "Local Response:"
echo "$LOCAL_RESPONSE" | jq '.'

# Test Search on Cloud Path
echo -e "\n🔍 Test 3: Search Cloud Path"
SEARCH_QUERIES=(
  "What is the cloud processing pipeline?"
  "How does local processing work?"
  "Explain the storage options"
)

for query in "${SEARCH_QUERIES[@]}"; do
  echo -e "\nQuery: $query"
  echo -e "\nCloud Path Results:"
  curl -s -X POST "$API_URL/search" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"$query\", \"path\":\"cloud\"}" | jq '.'
  
  echo -e "\nLocal Path Results:"
  curl -s -X POST "$API_URL/search" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"$query\", \"path\":\"local\"}" | jq '.'
  
  # Add a small delay to avoid rate limiting
  sleep 1
done

# Test Stats
echo -e "\n📊 Test 4: Get Stats"
curl -s "$API_URL/stats" | jq '.'

echo -e "\n✅ Tests completed!" 