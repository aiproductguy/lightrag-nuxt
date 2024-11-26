# LightRAG 2.0 Upsert Architecture

## Cloud Processing Pipeline
The cloud processing path utilizes high-performance cloud services:
- Chunker: Uses tiktoken/spaCy for text segmentation (512 token limit per chunk)
- Embedder: Uses @cf/baai/bge-base-en-v1.5 (768-dimensional embeddings, 512 token input limit) [details]
(https://docs.latenode.com/docs/722c823e-e550-42ea-8c99-2a3e77cfc708/?t)
- LLM: Uses @cf/meta/llama-2-7b-chat-int8 for text processing [details](https://
blog.cloudflare.com/meta-llama-3-available-on-cloudflare-workers-ai?t/)
- Storage: Utilizes Cloudflare KV for caching, Vectorize for embeddings, D1 for metadata

## Technical Specifications
- Input Token Limit: 512 tokens per text chunk
- Embedding Dimensions: 768
- Vector Storage: Cloudflare Vectorize
- Metadata Storage: Cloudflare D1
- Cache Layer: Cloudflare KV

## Local Processing Pipeline
The local processing path focuses on offline capabilities:
- Chunker: COMING SOON
- Embedder: COMING SOON
- LLM: COMING SOON
- Storage: COMING SOON
#Cloud-First-for-Efficienty

## Storage Options
Multiple storage tiers are available:
1. Cloud Storage:
   - D1 and KV for fast caching and metadata
   - Vectorize DB for cloud-scale vector storage (768-dimensional vectors)
   - D1 for relational queries and stats

2. Local Storage: COMING SOON
   - SQLite/JSON for local caching
   - Nano Vector DB for embedded vector storage
   - File Store for document management

3. Premium Storage (Optional):
   - Neo4j Graph for advanced relationships
   - Oracle Graph for enterprise deployments

## Processing Flow
1. Default configuration is cloud processing and storage
2. Input text is received
3. Text is processed through appropriate pipeline:
   - Cloud: tiktoken → OpenAI → GPT-4 → Cloud Storage
   - Local: NLTK → Nano → Llama → Local Storage
4. Optional premium storage integration for both paths
```

### LightRAG 2.0 Upsert #Cloud-First-for-Efficiency
```mermaid
flowchart LR
    %% Styles
    classDef mainFlow fill:#f9f,stroke:#333,stroke-width:4px
    classDef storage fill:#bbf,stroke:#333,stroke-width:2px
    classDef premium fill:#fcb,stroke:#633,stroke-width:3px,stroke-dasharray: 5 5
    classDef localCache fill:#dfd,stroke:#363,stroke-width:2px
    classDef cloudCache fill:#ddf,stroke:#336,stroke-width:2px
    classDef process fill:#bfb,stroke:#333,stroke-width:1px
    classDef choice fill:#fff,stroke:#333,stroke-width:2px
    classDef processor fill:#fcd,stroke:#333,stroke-width:2px

    %% Input and Initial Choice
    input[["Input Text"]] --> choice{{"Storage<br/>Location"}}
    
    %% Cloud Path
    choice -->|"Cloud Path"| cloudChunker
    
    %% Cloud Processing Pipeline
    subgraph CloudProcessing ["Cloud Processing"]
        direction TB
        cloudChunker["Chunker<br/>tiktoken/spaCy"]:::processor
        cloudEmbedder["Embedder<br/>@cf/baai/bge-base-en-v1.5"]:::processor
        cloudLLM["LLM<br/>llama-3-8b-instruct"]:::processor
    end
    
    %% Cloud Storage
    subgraph CloudSide ["Cloud Storage"]
        direction TB
        subgraph CloudCache ["Cloud Cache"]
            CloudFlareKVCache[("CloudFlare KV Cache")]:::cloudCache
            CloudFlareD1Cache[("CloudFlare D1 Cache")]:::cloudCache
        end
        
        subgraph CloudStorage ["Cloud Storage"]
            vectorizeDB[(Cloudflare Vectorize)]:::storage
            textStore[(Text Store)]:::storage
        end
    end
    
    %% Local Path
    choice -->|"Local Path"| localChunker
    
    %% Local Processing Pipeline
    subgraph LocalProcessing ["Local Processing"]
        direction TB
        localChunker["Chunker<br/>NLTK/regex"]:::processor
        localEmbedder["Embedder<br/>HuggingFace/Nano"]:::processor
        localLLM["LLM<br/>Llama/Gemma"]:::processor
    end
    
    %% Local Storage
    subgraph LocalSide ["Local Storage"]
        direction TB
        subgraph LocalCache ["Local Cache"]
            sqliteCache[("SQLite Cache")]:::localCache
            jsonCache[("JSON Cache")]:::localCache
        end
        
        subgraph LocalStorage ["Local Storage"]
            nanoVDB[(Nano Vector DB)]:::storage
            fileStore[(File Store)]:::storage
        end
    end
    
    %% Premium Storage
    subgraph PremiumStore ["Premium Storage"]
        direction TB
        neo4j[("Neo4j Graph")]:::premium
        oracle[("Oracle Graph")]:::premium
    end
    
    %% Cloud Processing Flows
    cloudChunker --> cloudEmbedder
    cloudEmbedder --> cloudLLM
    cloudLLM --> CloudFlareKVCache & CloudFlareD1Cache
    cloudLLM --> vectorizeDB & textStore
    cloudLLM -.-> neo4j & oracle
    
    %% Local Processing Flows
    localChunker --> localEmbedder
    localEmbedder --> localLLM
    localLLM --> sqliteCache & jsonCache
    localLLM --> nanoVDB & fileStore
    localLLM -.-> neo4j & oracle
    
    %% Notes
    note1[/"Premium graph storage 
    optional for both paths"/]
    note2[/"Local processing ideal
    for offline use"/]
    note3[/"Cloud processing for
    enterprise scale"/]
    
    note1 -.-> PremiumStore
    note2 -.-> LocalProcessing
    note3 -.-> CloudProcessing
```
