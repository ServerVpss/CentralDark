---
name: vector-memory
description: Semantic vector memory for long-term storage and retrieval of embeddings. Use when you need persistent semantic search across sessions, clustering, or similarity-based recall.
---

# Vector Memory

Semantic vector memory layer for persistent storage and retrieval of embeddings.

## Core Concepts
- **Embedding**: Dense vector representation of text (semantic meaning)
- **Index**: Data structure for efficient similarity search (HNSW, IVF, flat)
- **Namespace**: Logical separation of vector collections
- **Metadata**: Structured data attached to vectors for filtering

## Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Ingest Text    │────▶│  Embedding Model │────▶│  Vector Index   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Metadata Store │
                                               └─────────────────┘
```

## Operations

### Ingest
```python
vector_memory.ingest(
    texts=["doc1", "doc2", ...],
    metadata=[{"source": "chat", "session_id": "..."}, ...],
    namespace="chat_history"
)
```

### Search
```python
results = vector_memory.search(
    query="how to configure auth",
    namespace="chat_history",
    top_k=5,
    filter={"session_id": "..."}
)
# Returns: [{text, score, metadata}, ...]
```

### Cluster
```python
clusters = vector_memory.cluster(
    namespace="chat_history",
    min_cluster_size=3,
    min_samples=2
)
# Returns cluster labels per vector
```

## Index Types
- **HNSW**: Fast approximate search, good for production
- **IVF**: Inverted file, good for large datasets
- **Flat**: Exact search, small datasets only

## Embedding Providers
- OpenAI: `text-embedding-3-small` (1536d, $0.02/1M)
- OpenAI: `text-embedding-3-large` (3072d, $0.13/1M)
- Local: `sentence-transformers` (free, offline)
- Cohere: `embed-english-v3.0` (1024d)

## Integration
- `brain-memory` stores taste signals as vectors
- `session-intelligence-harvester` stores session embeddings
- `knowledge-compiler` retrieves relevant context via semantic search
- `context-synthesis` uses vector search for triangulation

## Persistence
- SQLite + sqlite-vec (local, embedded)
- PostgreSQL + pgvector (shared, production)
- Qdrant/Weaviate (dedicated vector DB)

## Privacy
- Never store raw secrets in vectors
- Metadata only: source, timestamp, scope
- Raw text optional (can store hash only)
