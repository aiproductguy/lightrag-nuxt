### LightRAG 2.0 Query #Cloud-First-for-Efficiencyˆ

## Processing Pipeline
The query processing utilizes:
- Embedder: @cf/baai/bge-base-en-v1.5 for semantic search
  - Input Limit: 512 tokens
  - Output: 768-dimensional embeddings
- LLM: @cf/meta/llama-2-7b-chat-int8 for keyword extraction and answer generation
- Hybrid Search: Combines semantic (70%) and keyword (30%) scoring
- Cache: Uses Cloudflare KV with 1-hour TTL

## Technical Specifications
- Maximum Query Length: 512 tokens
- Embedding Model: @cf/baai/bge-base-en-v1.5
  - Input: Up to 512 tokens
  - Output: 768-dimensional vectors
- Vector Search: Cloudflare Vectorize
- Results Cache: Cloudflare KV (1h TTL)
- Metadata Store: Cloudflare D1

```mermaid
flowchart LR
    %% Styles
    classDef mainMode fill:#f9f,stroke:#333,stroke-width:4px
    classDef storage fill:#bbf,stroke:#333,stroke-width:2px
    classDef premium fill:#fcb,stroke:#633,stroke-width:3px,stroke-dasharray: 5 5
    classDef localCache fill:#dfd,stroke:#363,stroke-width:2px
    classDef cloudCache fill:#ddf,stroke:#336,stroke-width:2px
    classDef process fill:#bfb,stroke:#333,stroke-width:1px
    classDef choice fill:#fff,stroke:#333,stroke-width:2px
    classDef note fill:#fff,stroke:#666,stroke-width:1px,stroke-dasharray: 5 5

    %% Query Input and Choices
    query[["User Query"]] --> choice1{{"Cache<br/>Location"}}
    choice1 --> |"Cloud First"| kvCache
    choice1 --> |"Local First"| lcache
    
    choice2{{"Query<br/>Mode"}} --> hybrid{{Hybrid Query}}
    choice2 --> global{{Global Query}}

    %% Cloud Cache & Processing (Left Side)
    subgraph CloudSide [Cloud Processing]
        direction TB
        
        subgraph CloudCache [Cloud Cache]
            kvCache[("Cloudflare D1/KV")]
        end
        
        subgraph Processing [Query Processing]
            direction TB
            keywords[/"Keywords Extraction"/]
            
            %% Hybrid Flow
            hHigh["High-Level Search"]
            hLow["Low-Level Search"]
            hEdges["Get Related Edges*"]
            hNodes["Get Related Nodes*"]
            hContext["Combine Contexts"]
            
            %% Global Flow
            gRelation["Relation Search"]
            gNodes["Get Connected Nodes*"]
        end
    end

    %% Storage Options (Right Side)
    subgraph StorageSide [Storage Options]
        direction TB
        
        subgraph LocalCache [Local Cache]
            lcache[("SQLite Cache<br/>(Optional)")]
        end
        
        subgraph Storage [Cloud Storage]
            vdb[(Cloudflare Vectorize<br/>entities/relations)]
            chunks[(Text Chunks)]
        end

        subgraph Premium [Premium Storage]
            kg[("Knowledge Graph<br/>(Optional)")]
        end
    end

    %% Flow Connections
    kvCache -.-> |Cache Miss| choice2
    lcache -.-> |Cache Miss| vdb
    
    hybrid --> keywords
    keywords --> hHigh & hLow
    hHigh --> hEdges
    hLow --> hNodes
    hEdges & hNodes --> hContext
    global --> gRelation
    gRelation --> gNodes
    
    %% Storage Connections
    hHigh & gRelation --> vdb
    hLow --> chunks
    hEdges & hNodes & gNodes -.-> |Optional| kg
    
    %% Cache Store Paths
    hContext --> |Cache Store| kvCache
    gNodes --> |Cache Store| kvCache
    
    %% Notes
    note1[/"* Requires Premium
    Storage"/]
    note2[/"Choose local for
    offline support"/]
    note3[/"Choose cloud for
    shared caching"/]
    
    note1 -.-> Premium
    note2 -.-> lcache
    note3 -.-> kvCache

    %% Styling
    class hybrid,global mainMode
    class vdb,chunks storage
    class kg premium
    class lcache localCache
    class kvCache cloudCache
    class choice1,choice2 choice
    class keywords,hContext,hHigh,hLow,hEdges,hNodes,gRelation,gNodes process
    class note1,note2,note3 note
```
