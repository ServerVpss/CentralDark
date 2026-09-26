module.exports = [
"[project]/open-sse/config/embeddingRegistry.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Embedding Provider Registry
 *
 * Defines providers that support the /v1/embeddings endpoint.
 * All providers use the OpenAI-compatible format.
 *
 * API keys are stored in the same provider credentials system,
 * keyed by provider ID (e.g. "nebius", "openai").
 */ __turbopack_context__.s([
    "EMBEDDING_PROVIDERS",
    ()=>EMBEDDING_PROVIDERS,
    "buildDynamicEmbeddingProvider",
    ()=>buildDynamicEmbeddingProvider,
    "detectEmbeddingDimensionConflict",
    ()=>detectEmbeddingDimensionConflict,
    "getAllEmbeddingModels",
    ()=>getAllEmbeddingModels,
    "getEmbeddingDimension",
    ()=>getEmbeddingDimension,
    "getEmbeddingModelDefaultParams",
    ()=>getEmbeddingModelDefaultParams,
    "getEmbeddingModelModalities",
    ()=>getEmbeddingModelModalities,
    "getEmbeddingProvider",
    ()=>getEmbeddingProvider,
    "parseEmbeddingModel",
    ()=>parseEmbeddingModel
]);
function buildDynamicEmbeddingProvider(node) {
    if (!node.prefix || !node.baseUrl) {
        throw new Error(`Invalid provider_node: missing prefix or baseUrl`);
    }
    if (node.prefix.includes("/") || node.prefix.includes(" ")) {
        throw new Error(`Invalid provider_node prefix "${node.prefix}": must not contain / or spaces`);
    }
    const baseUrl = node.baseUrl.replace(/\/+$/, "");
    return {
        id: node.prefix,
        baseUrl: `${baseUrl}/embeddings`,
        authType: "none",
        authHeader: "none",
        models: []
    };
}
const EMBEDDING_PROVIDERS = {
    cohere: {
        id: "cohere",
        baseUrl: "https://api.cohere.com/v2/embed",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "embed-v4.0",
                name: "Embed v4.0"
            },
            {
                id: "embed-multilingual-v3.0",
                name: "Embed Multilingual v3.0"
            },
            {
                id: "embed-multilingual-v3.0-images",
                name: "Embed Multilingual v3.0 Image"
            },
            {
                id: "embed-multilingual-light-v3.0",
                name: "Embed Multilingual Light v3.0"
            },
            {
                id: "embed-multilingual-light-v3.0-images",
                name: "Embed Multilingual Light v3.0 Image"
            }
        ]
    },
    nebius: {
        id: "nebius",
        baseUrl: "https://api.tokenfactory.nebius.com/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "Qwen/Qwen3-Embedding-8B",
                name: "Qwen3 Embedding 8B",
                dimensions: 4096
            }
        ]
    },
    openai: {
        id: "openai",
        baseUrl: "https://api.openai.com/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "text-embedding-3-small",
                name: "Text Embedding 3 Small",
                dimensions: 1536
            },
            {
                id: "text-embedding-3-large",
                name: "Text Embedding 3 Large",
                dimensions: 3072
            },
            {
                id: "text-embedding-ada-002",
                name: "Text Embedding Ada 002",
                dimensions: 1536
            }
        ]
    },
    "vercel-ai-gateway": {
        id: "vercel-ai-gateway",
        baseUrl: "https://ai-gateway.vercel.sh/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "text-embedding-3-small",
                name: "Text Embedding 3 Small",
                dimensions: 1536
            },
            {
                id: "text-embedding-3-large",
                name: "Text Embedding 3 Large",
                dimensions: 3072
            }
        ]
    },
    upstage: {
        id: "upstage",
        baseUrl: "https://api.upstage.ai/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "embedding-query",
                name: "Embedding Query",
                dimensions: 4096
            },
            {
                id: "embedding-passage",
                name: "Embedding Passage",
                dimensions: 4096
            }
        ]
    },
    mistral: {
        id: "mistral",
        baseUrl: "https://api.mistral.ai/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "mistral-embed",
                name: "Mistral Embed",
                dimensions: 1024
            }
        ]
    },
    together: {
        id: "together",
        baseUrl: "https://api.together.xyz/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "BAAI/bge-large-en-v1.5",
                name: "BGE Large EN v1.5",
                dimensions: 1024
            },
            {
                id: "togethercomputer/m2-bert-80M-8k-retrieval",
                name: "M2 BERT 80M 8K",
                dimensions: 768
            }
        ]
    },
    fireworks: {
        id: "fireworks",
        baseUrl: "https://api.fireworks.ai/inference/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "nomic-ai/nomic-embed-text-v1.5",
                name: "Nomic Embed Text v1.5",
                dimensions: 768
            },
            {
                id: "accounts/fireworks/models/qwen3-embedding-8b",
                name: "Qwen3 Embedding 8B",
                dimensions: 4096
            }
        ]
    },
    nvidia: {
        id: "nvidia",
        baseUrl: "https://integrate.api.nvidia.com/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        // nv-embedqa-* are asymmetric models: NVIDIA NIM rejects requests without an
        // `input_type` ("query" | "passage") with 400 "'input_type' parameter is
        // required". Default to "query" when the client omits it (issue #1378).
        models: [
            {
                id: "nvidia/nv-embedqa-e5-v5",
                name: "NV EmbedQA E5 v5",
                dimensions: 1024,
                defaultParams: {
                    input_type: "query"
                }
            }
        ]
    },
    // Issue #2298: Adding DeepInfra to the embedding registry so custom
    // embedding models on the DeepInfra provider don't fail with "Unknown
    // embedding provider" when the user adds them via the dashboard.
    deepinfra: {
        id: "deepinfra",
        baseUrl: "https://api.deepinfra.com/v1/openai/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "Qwen/Qwen3-Embedding-8B",
                name: "Qwen3 Embedding 8B",
                dimensions: 4096
            },
            {
                id: "Qwen/Qwen3-Embedding-4B",
                name: "Qwen3 Embedding 4B",
                dimensions: 2560
            },
            {
                id: "Qwen/Qwen3-Embedding-0.6B",
                name: "Qwen3 Embedding 0.6B",
                dimensions: 1024
            },
            {
                id: "BAAI/bge-large-en-v1.5",
                name: "BGE Large EN v1.5",
                dimensions: 1024
            },
            {
                id: "BAAI/bge-base-en-v1.5",
                name: "BGE Base EN v1.5",
                dimensions: 768
            },
            {
                id: "BAAI/bge-m3",
                name: "BGE-M3",
                dimensions: 1024
            },
            {
                id: "intfloat/e5-large-v2",
                name: "E5 Large v2",
                dimensions: 1024
            },
            {
                id: "thenlper/gte-large",
                name: "GTE Large",
                dimensions: 1024
            }
        ]
    },
    // #6976 — OpenRouter serves embeddings via a dedicated OpenAI-compatible
    // /api/v1/embeddings endpoint (omitted from /v1/models, so this catalog is
    // curated rather than live-discovered). Ids verified against the API
    // reference (not the display-name collections page) at refresh time:
    // https://openrouter.ai/docs/api/reference/embeddings and
    // https://openrouter.ai/collections/embedding-models
    openrouter: {
        id: "openrouter",
        baseUrl: "https://openrouter.ai/api/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "openai/text-embedding-3-small",
                name: "Text Embedding 3 Small (OpenRouter)",
                dimensions: 1536
            },
            {
                id: "openai/text-embedding-3-large",
                name: "Text Embedding 3 Large (OpenRouter)",
                dimensions: 3072
            },
            {
                id: "qwen/qwen3-embedding-8b",
                name: "Qwen3 Embedding 8B (OpenRouter)",
                dimensions: 4096
            },
            {
                id: "qwen/qwen3-embedding-4b",
                name: "Qwen3 Embedding 4B (OpenRouter)",
                dimensions: 2560
            },
            {
                id: "baai/bge-m3",
                name: "BGE-M3 (OpenRouter)",
                dimensions: 1024
            },
            {
                id: "mistralai/mistral-embed-2312",
                name: "Mistral Embed (OpenRouter)",
                dimensions: 1024
            },
            {
                id: "google/gemini-embedding-001",
                name: "Gemini Embedding 001 (OpenRouter)",
                dimensions: 768
            }
        ]
    },
    gemini: {
        id: "gemini",
        structuredInputProtocol: "gemini-embed-content",
        baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "gemini-embedding-2",
                name: "Gemini Embedding 2",
                dimensions: 768,
                modalities: [
                    "text",
                    "image",
                    "audio",
                    "video",
                    "document"
                ]
            },
            {
                id: "gemini-embedding-2-preview",
                name: "Gemini Embedding 2 Preview",
                dimensions: 768,
                modalities: [
                    "text",
                    "image",
                    "audio",
                    "video",
                    "document"
                ]
            },
            {
                id: "gemini-embedding-001",
                name: "Gemini Embedding 001",
                dimensions: 768
            }
        ]
    },
    "voyage-ai": {
        id: "voyage-ai",
        baseUrl: "https://api.voyageai.com/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "voyage-4-large",
                name: "Voyage 4 Large",
                dimensions: 1024
            },
            {
                id: "voyage-4",
                name: "Voyage 4",
                dimensions: 1024
            },
            {
                id: "voyage-4-lite",
                name: "Voyage 4 Lite",
                dimensions: 1024
            },
            {
                id: "voyage-3-large",
                name: "Voyage 3 Large",
                dimensions: 1024
            },
            {
                id: "voyage-3.5",
                name: "Voyage 3.5",
                dimensions: 1024
            },
            {
                id: "voyage-3.5-lite",
                name: "Voyage 3.5 Lite",
                dimensions: 512
            },
            {
                id: "voyage-multilingual-2",
                name: "Voyage Multilingual 2",
                dimensions: 1024
            },
            {
                id: "voyage-code-3",
                name: "Voyage Code 3",
                dimensions: 1024
            },
            {
                id: "voyage-code-2",
                name: "Voyage Code 2",
                dimensions: 1536
            },
            {
                id: "voyage-finance-2",
                name: "Voyage Finance 2",
                dimensions: 1024
            },
            {
                id: "voyage-law-2",
                name: "Voyage Law 2",
                dimensions: 1024
            }
        ]
    },
    "github-models": {
        id: "github-models",
        baseUrl: "https://models.github.ai/inference/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "openai/text-embedding-3-large",
                name: "OpenAI Text Embedding 3 (large)",
                dimensions: 3_072
            },
            {
                id: "openai/text-embedding-3-small",
                name: "OpenAI Text Embedding 3 (small)",
                dimensions: 1_536
            }
        ]
    },
    github: {
        id: "github",
        baseUrl: "https://models.inference.ai.azure.com/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "text-embedding-3-small",
                name: "Text Embedding 3 Small (GitHub)",
                dimensions: 1536
            },
            {
                id: "text-embedding-3-large",
                name: "Text Embedding 3 Large (GitHub)",
                dimensions: 3072
            }
        ]
    },
    "jina-ai": {
        id: "jina-ai",
        structuredInputProtocol: "jina-v1",
        baseUrl: "https://api.jina.ai/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "jina-embeddings-v5-text-small",
                name: "Jina Embeddings v5 Text Small",
                dimensions: 1024
            },
            {
                id: "jina-embeddings-v5-text-nano",
                name: "Jina Embeddings v5 Text Nano",
                dimensions: 768
            },
            {
                id: "jina-embeddings-v5-omni-small",
                name: "Jina Embeddings v5 Omni Small",
                dimensions: 1024,
                modalities: [
                    "text",
                    "image",
                    "audio",
                    "video",
                    "document"
                ]
            },
            {
                id: "jina-embeddings-v5-omni-nano",
                name: "Jina Embeddings v5 Omni Nano",
                dimensions: 768,
                modalities: [
                    "text",
                    "image",
                    "audio",
                    "video",
                    "document"
                ]
            },
            {
                id: "jina-code-embeddings-1.5b",
                name: "Jina Code Embeddings 1.5B",
                dimensions: 1536
            },
            {
                id: "jina-code-embeddings-0.5b",
                name: "Jina Code Embeddings 0.5B",
                dimensions: 896
            },
            {
                id: "jina-embeddings-v4",
                name: "Jina Embeddings v4",
                dimensions: 2048,
                modalities: [
                    "text",
                    "image",
                    "document"
                ]
            },
            {
                id: "jina-clip-v2",
                name: "Jina CLIP v2",
                dimensions: 1024,
                modalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "jina-colbert-v2",
                name: "Jina ColBERT v2",
                dimensions: 128
            }
        ]
    },
    // LM Studio — local OpenAI-compatible server. No auth required.
    // Models are passthrough (LM Studio exposes its own model list), so the
    // models array is empty. The baseUrl is the default LM Studio endpoint;
    // users with a configured provider_node will use that URL instead.
    lmstudio: {
        id: "lmstudio",
        baseUrl: "http://localhost:1234/v1/embeddings",
        authType: "none",
        authHeader: "none",
        models: []
    },
    // Ollama Local — OpenAI-compatible embeddings endpoint. Ollama exposes its
    // own model catalog, but these common embedding models are useful defaults
    // for model selection and validation.
    "ollama-local": {
        id: "ollama-local",
        baseUrl: "http://localhost:11434/v1/embeddings",
        authType: "none",
        authHeader: "none",
        models: [
            {
                id: "embeddinggemma",
                name: "EmbeddingGemma"
            },
            {
                id: "nomic-embed-text",
                name: "Nomic Embed Text"
            },
            {
                id: "bge-m3",
                name: "BGE M3"
            }
        ]
    },
    // Issue #6660: Mixedbread AI — OpenAI-compatible /v1/embeddings, free tier
    // available (API key via signup, no card required). Model ids are the
    // upstream-qualified "mixedbread-ai/<model>" form, mirroring how `together`/
    // `fireworks` register fully-qualified upstream model ids above.
    mixedbread: {
        id: "mixedbread",
        baseUrl: "https://api.mixedbread.com/v1/embeddings",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "mixedbread-ai/mxbai-embed-large-v1",
                name: "Mixedbread Embed Large v1",
                dimensions: 1024
            },
            {
                id: "mixedbread-ai/mxbai-embed-2d-large-v1",
                name: "Mixedbread Embed 2D Large v1",
                dimensions: 1024
            }
        ]
    }
};
const EMBEDDING_PROVIDER_ALIASES = {
    jina: "jina-ai",
    voyage: "voyage-ai"
};
function resolveEmbeddingProviderId(providerId) {
    return EMBEDDING_PROVIDER_ALIASES[providerId] || providerId;
}
function normalizeProviderScopedModelId(providerId, modelId) {
    const resolvedProvider = resolveEmbeddingProviderId(providerId);
    const provider = EMBEDDING_PROVIDERS[resolvedProvider];
    if (provider?.models.some((model)=>model.id === modelId)) return modelId;
    const providerScopedModelId = `${resolvedProvider}/${modelId}`;
    if (provider?.models.some((model)=>model.id === providerScopedModelId)) {
        return providerScopedModelId;
    }
    return modelId.startsWith(`${providerId}/`) ? modelId.slice(providerId.length + 1) : modelId;
}
function toProviderScopedModelId(providerId, modelId) {
    return modelId.startsWith(`${providerId}/`) ? modelId : `${providerId}/${modelId}`;
}
function getEmbeddingProvider(providerId) {
    return EMBEDDING_PROVIDERS[resolveEmbeddingProviderId(providerId)] || null;
}
function parseEmbeddingModel(modelStr, dynamicProviders) {
    if (!modelStr) return {
        provider: null,
        model: null
    };
    // Check for "provider/model" format
    const slashIdx = modelStr.indexOf("/");
    if (slashIdx > 0) {
        const rawProvider = modelStr.slice(0, slashIdx);
        const resolvedProvider = resolveEmbeddingProviderId(rawProvider);
        if (EMBEDDING_PROVIDERS[resolvedProvider]) {
            return {
                provider: resolvedProvider,
                model: normalizeProviderScopedModelId(resolvedProvider, modelStr.slice(slashIdx + 1))
            };
        }
        // Phase 1: Try each hardcoded provider prefix
        for (const [providerId] of Object.entries(EMBEDDING_PROVIDERS)){
            if (modelStr.startsWith(providerId + "/")) {
                return {
                    provider: providerId,
                    model: normalizeProviderScopedModelId(providerId, modelStr.slice(providerId.length + 1))
                };
            }
        }
        // Phase 2: Try dynamic provider_nodes prefix
        if (dynamicProviders) {
            for (const dp of dynamicProviders){
                if (modelStr.startsWith(dp.id + "/")) {
                    return {
                        provider: dp.id,
                        model: modelStr.slice(dp.id.length + 1)
                    };
                }
            }
        }
        // Phase 3: Fallback — first segment is provider
        const provider = modelStr.slice(0, slashIdx);
        const model = modelStr.slice(slashIdx + 1);
        return {
            provider,
            model
        };
    }
    // No provider prefix — search hardcoded providers for the model
    for (const [providerId, config] of Object.entries(EMBEDDING_PROVIDERS)){
        if (config.models.some((m)=>m.id === modelStr)) {
            return {
                provider: providerId,
                model: modelStr
            };
        }
    }
    return {
        provider: null,
        model: modelStr
    };
}
function getEmbeddingDimension(modelStr) {
    const { provider, model } = parseEmbeddingModel(modelStr);
    if (!provider || !model) return undefined;
    const config = getEmbeddingProvider(provider);
    if (!config) return undefined;
    return config.models.find((m)=>m.id === model)?.dimensions;
}
function detectEmbeddingDimensionConflict(modelStrs) {
    const dimensions = {};
    for (const modelStr of modelStrs){
        const dim = getEmbeddingDimension(modelStr);
        if (typeof dim === "number") dimensions[modelStr] = dim;
    }
    const distinct = [
        ...new Set(Object.values(dimensions))
    ].sort((a, b)=>a - b);
    return {
        conflict: distinct.length > 1,
        dimensions,
        distinct
    };
}
function getEmbeddingModelDefaultParams(providerConfig, modelId) {
    if (!providerConfig || !modelId) return undefined;
    return providerConfig.models.find((m)=>m.id === modelId)?.defaultParams;
}
function getEmbeddingModelModalities(providerConfig, modelId) {
    if (!providerConfig || !modelId) return undefined;
    return providerConfig.models.find((model)=>model.id === modelId)?.modalities;
}
function getAllEmbeddingModels() {
    const models = [];
    for (const [providerId, config] of Object.entries(EMBEDDING_PROVIDERS)){
        for (const model of config.models){
            models.push({
                id: toProviderScopedModelId(providerId, model.id),
                name: model.name,
                provider: providerId,
                dimensions: model.dimensions
            });
        }
    }
    return models;
}
}),
"[project]/open-sse/config/rerankRegistry.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Rerank Provider Registry
 *
 * Defines providers that support the /v1/rerank endpoint.
 * Follows the Cohere rerank API request/response format (industry standard).
 *
 * API keys are stored in the same provider credentials system,
 * keyed by provider ID (e.g. "cohere", "together").
 */ __turbopack_context__.s([
    "RERANK_PROVIDERS",
    ()=>RERANK_PROVIDERS,
    "getAllRerankModels",
    ()=>getAllRerankModels,
    "getRerankProvider",
    ()=>getRerankProvider,
    "parseRerankModel",
    ()=>parseRerankModel
]);
const RERANK_PROVIDERS = {
    cohere: {
        id: "cohere",
        baseUrl: "https://api.cohere.com/v2/rerank",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "rerank-v4.0-pro",
                name: "Rerank v4.0 Pro"
            },
            {
                id: "rerank-v4.0-fast",
                name: "Rerank v4.0 Fast"
            },
            {
                id: "rerank-v3.5",
                name: "Rerank v3.5"
            },
            {
                id: "rerank-multilingual-v3.0",
                name: "Rerank Multilingual v3.0"
            }
        ]
    },
    together: {
        id: "together",
        baseUrl: "https://api.together.xyz/v1/rerank",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "Salesforce/Llama-Rank-V2",
                name: "Llama Rank V2"
            }
        ]
    },
    nvidia: {
        id: "nvidia",
        baseUrl: "https://integrate.api.nvidia.com/v1/ranking",
        authType: "apikey",
        authHeader: "bearer",
        format: "nvidia",
        models: [
            {
                id: "nvidia/nv-rerankqa-mistral-4b-v3",
                name: "NV RerankQA Mistral 4B v3"
            }
        ]
    },
    fireworks: {
        id: "fireworks",
        baseUrl: "https://api.fireworks.ai/inference/v1/rerank",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "accounts/fireworks/models/nomic-rerank-v1",
                name: "Nomic Rerank v1"
            },
            {
                id: "accounts/fireworks/models/qwen3-reranker-8b",
                name: "Qwen3 Reranker 8B"
            }
        ]
    },
    // Voyage AI is NOT Cohere-compatible: uses `top_k` (not `top_n`), rejects empty-string
    // documents, and returns `{data:[{relevance_score,index}]}` instead of `{results:[…]}`.
    // The `voyage` format adapter in open-sse/handlers/rerank.ts handles both directions (#7809).
    "voyage-ai": {
        id: "voyage-ai",
        baseUrl: "https://api.voyageai.com/v1/rerank",
        authType: "apikey",
        authHeader: "bearer",
        format: "voyage",
        models: [
            {
                id: "rerank-2.5",
                name: "Rerank 2.5"
            },
            {
                id: "rerank-2.5-lite",
                name: "Rerank 2.5 Lite"
            }
        ]
    },
    "jina-ai": {
        id: "jina-ai",
        baseUrl: "https://api.jina.ai/v1/rerank",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "jina-reranker-v3",
                name: "Jina Reranker v3"
            },
            {
                id: "jina-reranker-m0",
                name: "Jina Reranker m0"
            }
        ]
    },
    // SiliconFlow rerank is Cohere-compatible (POST /v1/rerank, {model,query,documents}). The
    // reranker models arrive in /v1/models via live model-sync; without this entry the rerank
    // router rejected them with "Invalid rerank model" (#5332). Model IDs keep their vendor slash
    // (e.g. "Qwen/Qwen3-Reranker-8B") — parseRerankModel splits on the FIRST slash, so it's safe.
    siliconflow: {
        id: "siliconflow",
        baseUrl: "https://api.siliconflow.com/v1/rerank",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "Qwen/Qwen3-Reranker-8B",
                name: "Qwen3 Reranker 8B"
            },
            {
                id: "Qwen/Qwen3-Reranker-4B",
                name: "Qwen3 Reranker 4B"
            },
            {
                id: "Qwen/Qwen3-Reranker-0.6B",
                name: "Qwen3 Reranker 0.6B"
            },
            {
                id: "BAAI/bge-reranker-v2-m3",
                name: "BGE Reranker v2 m3"
            }
        ]
    },
    // OpenRouter exposes a separate, Cohere-compatible POST /api/v1/rerank endpoint
    // (not surfaced by its live /v1/models feed, which contains 0 rerank ids — confirmed
    // by direct curl). Model IDs keep their vendor slash (e.g. "cohere/rerank-4-pro");
    // parseRerankModel splits on the FIRST slash, so 3-segment ids resolve safely, same
    // as siliconflow above. Seeded by hand and must be maintained here as OpenRouter adds
    // more rerank models (#6574).
    openrouter: {
        id: "openrouter",
        baseUrl: "https://openrouter.ai/api/v1/rerank",
        authType: "apikey",
        authHeader: "bearer",
        models: [
            {
                id: "cohere/rerank-4-pro",
                name: "Cohere Rerank 4 Pro (via OpenRouter)"
            },
            {
                id: "cohere/rerank-4-fast",
                name: "Cohere Rerank 4 Fast (via OpenRouter)"
            },
            {
                id: "cohere/rerank-v3.5",
                name: "Cohere Rerank v3.5 (via OpenRouter)"
            }
        ]
    },
    // DeepInfra rerank is NOT Cohere-shaped: POST /v1/inference/<MODEL> with {queries:[q],documents}
    // returning {scores:[…]} (one score per document, positional). The `deepinfra` format adapter in
    // open-sse/handlers/rerank.ts builds the per-model URL and maps scores → Cohere results (#5332).
    deepinfra: {
        id: "deepinfra",
        baseUrl: "https://api.deepinfra.com/v1/inference",
        authType: "apikey",
        authHeader: "bearer",
        format: "deepinfra",
        models: [
            {
                id: "Qwen/Qwen3-Reranker-8B",
                name: "Qwen3 Reranker 8B"
            },
            {
                id: "Qwen/Qwen3-Reranker-4B",
                name: "Qwen3 Reranker 4B"
            },
            {
                id: "Qwen/Qwen3-Reranker-0.6B",
                name: "Qwen3 Reranker 0.6B"
            }
        ]
    }
};
const RERANK_PROVIDER_ALIASES = {
    jina: "jina-ai",
    voyage: "voyage-ai"
};
function resolveRerankProviderId(providerId) {
    return RERANK_PROVIDER_ALIASES[providerId] || providerId;
}
function normalizeProviderScopedModelId(providerId, modelId) {
    const resolvedProvider = resolveRerankProviderId(providerId);
    const provider = RERANK_PROVIDERS[resolvedProvider];
    if (provider?.models.some((model)=>model.id === modelId)) return modelId;
    const providerScopedModelId = `${resolvedProvider}/${modelId}`;
    if (provider?.models.some((model)=>model.id === providerScopedModelId)) {
        return providerScopedModelId;
    }
    return modelId.startsWith(`${providerId}/`) ? modelId.slice(providerId.length + 1) : modelId;
}
function toProviderScopedModelId(providerId, modelId) {
    return modelId.startsWith(`${providerId}/`) ? modelId : `${providerId}/${modelId}`;
}
function getRerankProvider(providerId) {
    return RERANK_PROVIDERS[resolveRerankProviderId(providerId)] || null;
}
function parseRerankModel(modelStr) {
    if (!modelStr) return {
        provider: null,
        model: null
    };
    const slashIdx = modelStr.indexOf("/");
    if (slashIdx > 0) {
        const rawProvider = modelStr.slice(0, slashIdx);
        const resolvedProvider = resolveRerankProviderId(rawProvider);
        if (RERANK_PROVIDERS[resolvedProvider]) {
            return {
                provider: resolvedProvider,
                model: normalizeProviderScopedModelId(resolvedProvider, modelStr.slice(slashIdx + 1))
            };
        }
    }
    // Try each provider prefix
    for (const [providerId, config] of Object.entries(RERANK_PROVIDERS)){
        if (modelStr.startsWith(providerId + "/")) {
            return {
                provider: providerId,
                model: normalizeProviderScopedModelId(providerId, modelStr.slice(providerId.length + 1))
            };
        }
    }
    // No provider prefix — search all providers for the model
    for (const [providerId, config] of Object.entries(RERANK_PROVIDERS)){
        if (config.models.some((m)=>m.id === modelStr)) {
            return {
                provider: providerId,
                model: modelStr
            };
        }
    }
    return {
        provider: null,
        model: modelStr
    };
}
function getAllRerankModels() {
    const models = [];
    for (const [providerId, config] of Object.entries(RERANK_PROVIDERS)){
        for (const model of config.models){
            models.push({
                id: toProviderScopedModelId(providerId, model.id),
                name: model.name,
                provider: providerId
            });
        }
    }
    return models;
}
}),
"[project]/src/shared/constants/modal.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Modal (modal.com) is bring-your-own-deploy, so there is no catalog to probe —
// the server-side validator uses this known public model id as its default probe
// target (src/lib/providers/validation.ts) and the add-connection modal pre-fills
// the Validation Model Id field with the same value (#5446 checklist item 4).
__turbopack_context__.s([
    "MODAL_DEFAULT_VALIDATION_MODEL_ID",
    ()=>MODAL_DEFAULT_VALIDATION_MODEL_ID
]);
const MODAL_DEFAULT_VALIDATION_MODEL_ID = "Qwen/Qwen3-4B-Thinking-2507-FP8";
}),
"[project]/open-sse/config/providers/registry/segmind/imageModels.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Segmind image-generation provider entry (#6656).
 *
 * Segmind exposes 200+ hosted models via a single `POST /v1/{model}` REST
 * shape (https://docs.segmind.com/, confirmed live 2026-07-09): x-api-key
 * auth, JSON request body, raw image bytes response (no JSON envelope).
 * Kept as a full config object (not just the model list) so imageRegistry.ts
 * only needs a single-line reference — that file sits right at its size cap.
 *
 * Model slugs below are a curated starter subset. flux-schnell and
 * sdxl1.0-txt2img are verified against
 * https://www.segmind.com/models/<slug>/api; the remaining Flux/SD3/Kandinsky
 * slugs follow the same documented naming convention.
 */ __turbopack_context__.s([
    "SEGMIND_IMAGE_MODELS",
    ()=>SEGMIND_IMAGE_MODELS,
    "SEGMIND_IMAGE_PROVIDER",
    ()=>SEGMIND_IMAGE_PROVIDER
]);
const SEGMIND_IMAGE_MODELS = [
    {
        id: "flux-schnell",
        name: "FLUX.1 Schnell"
    },
    {
        id: "flux-dev",
        name: "FLUX.1 Dev"
    },
    {
        id: "flux-1.1-pro",
        name: "FLUX 1.1 Pro"
    },
    {
        id: "sdxl1.0-txt2img",
        name: "Stable Diffusion XL 1.0"
    },
    {
        id: "sd3.5-large-txt2img",
        name: "Stable Diffusion 3.5 Large"
    },
    {
        id: "kandinsky2.2-txt2img",
        name: "Kandinsky 2.2"
    }
];
const SEGMIND_IMAGE_PROVIDER = {
    id: "segmind",
    baseUrl: "https://api.segmind.com/v1",
    authType: "apikey",
    authHeader: "x-api-key",
    format: "segmind",
    models: SEGMIND_IMAGE_MODELS,
    supportedSizes: [
        "512x512",
        "1024x1024",
        "1024x1792",
        "1792x1024"
    ]
};
}),
"[project]/open-sse/config/providers/registry/kie/imageModels.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * KIE image-generation model catalog.
 *
 * Extracted out of imageRegistry.ts (which hit the 800-line file-size cap) so the
 * catalog lives in its own semantic family module, following the same pattern as
 * `providers/registry/lmarena/directModels.ts`. KIE aggregates many third-party
 * image models (Seedream, Z-Image, Imagen, Flux, Grok Imagine, GPT Image, Ideogram,
 * Qwen, Wan) behind a single `kie-image` format/handler — see `imageRegistry.ts`'s
 * `kie` entry for baseUrl/auth/format wiring.
 */ __turbopack_context__.s([
    "KIE_IMAGE_MODELS",
    ()=>KIE_IMAGE_MODELS
]);
const KIE_IMAGE_MODELS = [
    {
        id: "gpt4o-image",
        name: "KIE 4o Image"
    },
    {
        id: "seedream/4.5-text-to-image",
        name: "Seedream 4.5",
        isMarket: true
    },
    {
        id: "seedream/4.5-edit",
        name: "Seedream 4.5 Edit",
        isMarket: true
    },
    {
        id: "seedream/5.0-lite-text-to-image",
        name: "Seedream 5.0 Lite",
        isMarket: true
    },
    {
        id: "seedream/5.0-lite-image-to-image",
        name: "Seedream 5.0 Lite I2I",
        isMarket: true
    },
    {
        id: "z-image/4.0-text-to-image",
        name: "Z-Image v4.0",
        isMarket: true
    },
    {
        id: "z-image/4.5-text-to-image",
        name: "Z-Image v4.5",
        isMarket: true
    },
    {
        id: "google-imagen/imagen4-fast",
        name: "Imagen 4 Fast",
        isMarket: true
    },
    {
        id: "google-imagen/imagen4-ultra",
        name: "Imagen 4 Ultra",
        isMarket: true
    },
    {
        id: "google-imagen/imagen4",
        name: "Imagen 4",
        isMarket: true
    },
    {
        id: "google-imagen/nano-banana-2",
        name: "Nano Banana 2",
        isMarket: true
    },
    {
        id: "google-imagen/nano-banana",
        name: "Nano Banana",
        isMarket: true
    },
    {
        id: "google-imagen/nano-banana-pro",
        name: "Nano Banana Pro",
        isMarket: true
    },
    {
        id: "google-imagen/nano-banana-edit",
        name: "Nano Banana Edit",
        isMarket: true
    },
    {
        id: "flux/2-pro-image-to-image",
        name: "Flux 2 Pro I2I",
        isMarket: true
    },
    {
        id: "flux/2-pro-text-to-image",
        name: "Flux 2 Pro T2I",
        isMarket: true
    },
    {
        id: "flux/2-image-to-image",
        name: "Flux 2 I2I",
        isMarket: true
    },
    {
        id: "flux/2-text-to-image",
        name: "Flux 2 T2I",
        isMarket: true
    },
    {
        id: "flux/kontext",
        name: "Flux Kontext",
        isMarket: true
    },
    {
        id: "grok-imagine/text-to-image",
        name: "Grok Imagine T2I",
        isMarket: true
    },
    {
        id: "grok-imagine/image-to-image",
        name: "Grok Imagine I2I",
        isMarket: true
    },
    {
        id: "gpt/gpt-image-1.5-text-to-image",
        name: "GPT Image 1.5 T2I",
        isMarket: true
    },
    {
        id: "gpt/gpt-image-1.5-image-to-image",
        name: "GPT Image 1.5 I2I",
        isMarket: true
    },
    {
        id: "gpt/gpt-image-2-text-to-image",
        name: "GPT Image 2 T2I",
        isMarket: true
    },
    {
        id: "gpt/gpt-image-2-image-to-image",
        name: "GPT Image 2 I2I",
        isMarket: true
    },
    {
        id: "ideogram/v3-text-to-image",
        name: "Ideogram v3",
        isMarket: true
    },
    {
        id: "ideogram/v3-edit",
        name: "Ideogram v3 Edit",
        isMarket: true
    },
    {
        id: "ideogram/v3-remix",
        name: "Ideogram v3 Remix",
        isMarket: true
    },
    {
        id: "ideogram/v3-reframe",
        name: "Ideogram v3 Reframe",
        isMarket: true
    },
    {
        id: "qwen/text-to-image",
        name: "Qwen T2I",
        isMarket: true
    },
    {
        id: "qwen/image-to-image",
        name: "Qwen I2I",
        isMarket: true
    },
    {
        id: "qwen/image-edit",
        name: "Qwen Edit",
        isMarket: true
    },
    {
        id: "qwen2/image-edit",
        name: "Qwen2 Edit",
        isMarket: true
    },
    {
        id: "qwen2/text-to-image",
        name: "Qwen2 T2I",
        isMarket: true
    },
    {
        id: "wan/2.7-image",
        name: "Wan 2.7 Image",
        isMarket: true
    },
    {
        id: "wan/2.7-image-pro",
        name: "Wan 2.7 Image Pro",
        isMarket: true
    }
];
}),
"[project]/open-sse/config/providers/registry/freepik/index.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Freepik (Magnific Mystic) image provider registry entry.
 * Extracted into its own module to keep open-sse/config/imageRegistry.ts
 * under the file-size cap (god-file decomposition; semantic split).
 */ __turbopack_context__.s([
    "FREEPIK_IMAGE_PROVIDER",
    ()=>FREEPIK_IMAGE_PROVIDER
]);
const FREEPIK_IMAGE_PROVIDER = {
    id: "freepik",
    // Freepik rebranded its API docs to Magnific in April 2026; the Mystic
    // endpoint itself still lives under api.freepik.com as of this writing
    // (docs.freepik.com redirects to docs.magnific.com, but the API host
    // has not moved). Re-verify against live docs if this ever 404s.
    baseUrl: "https://api.freepik.com/v1/ai/mystic",
    statusUrl: "https://api.freepik.com/v1/ai/mystic",
    authType: "apikey",
    authHeader: "x-freepik-api-key",
    format: "freepik-image",
    models: [
        {
            id: "realism",
            name: "Mystic Realism"
        },
        {
            id: "fluid",
            name: "Mystic Fluid (Imagen 3)"
        },
        {
            id: "zen",
            name: "Mystic Zen"
        },
        {
            id: "flexible",
            name: "Mystic Flexible"
        },
        {
            id: "super_real",
            name: "Mystic Super Real"
        },
        {
            id: "editorial_portraits",
            name: "Mystic Editorial Portraits"
        }
    ],
    supportedSizes: [
        "1024x1024",
        "1024x1792",
        "1792x1024"
    ]
};
}),
"[project]/open-sse/config/providers/registry/stability-ai/imageModels.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Stability AI image-generation model catalog.
 *
 * Extracted out of imageRegistry.ts (which sits right at the 800-line file-size
 * cap) so the catalog lives in its own semantic family module, following the same
 * pattern as `providers/registry/kie/imageModels.ts` and
 * `providers/registry/segmind/imageModels.ts`. See `imageRegistry.ts`'s
 * `stability-ai` entry for baseUrl/auth/format wiring.
 *
 * `imageRequired: true` marks the dedicated edit/control/upscale endpoints
 * (STABILITY_EDIT_ENDPOINTS in open-sse/handlers/imageGeneration.ts) that accept a
 * text prompt but mechanically require an input image regardless —
 * modalitiesRequireImageInput() alone can't tell them apart from flexible
 * dual-modality generation models (BFL Kontext, Together, NVIDIA, LMArena,
 * NanoGPT), which correctly allow pure text-to-image.
 */ __turbopack_context__.s([
    "STABILITY_AI_IMAGE_MODELS",
    ()=>STABILITY_AI_IMAGE_MODELS
]);
const STABILITY_AI_IMAGE_MODELS = [
    {
        id: "stable-image-ultra",
        name: "Stable Image Ultra"
    },
    {
        id: "stable-image-core",
        name: "Stable Image Core"
    },
    {
        id: "sd3.5-large-turbo",
        name: "sd3.5-large-turbo"
    },
    {
        id: "sd3.5-large",
        name: "sd3.5-large"
    },
    {
        id: "sd3.5-medium",
        name: "sd3.5-medium"
    },
    {
        id: "sd3.5-flash",
        name: "sd3.5-flash"
    },
    {
        id: "erase",
        name: "Erase",
        inputModalities: [
            "image"
        ]
    },
    {
        id: "inpaint",
        name: "Inpaint",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "outpaint",
        name: "Outpaint",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "remove-background",
        name: "Remove Background",
        inputModalities: [
            "image"
        ]
    },
    {
        id: "search-and-replace",
        name: "Search and Replace",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "search-and-recolor",
        name: "Search and Recolor",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "replace-background-and-relight",
        name: "Replace Background and Relight",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "creative",
        name: "Creative Upscale",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "fast",
        name: "Fast Upscale",
        inputModalities: [
            "image"
        ]
    },
    {
        id: "conservative",
        name: "Conservative Upscale",
        inputModalities: [
            "image"
        ]
    },
    {
        id: "sketch",
        name: "Sketch Control",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "structure",
        name: "Structure Control",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "style",
        name: "Style Control",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    },
    {
        id: "style-transfer",
        name: "Style Transfer",
        inputModalities: [
            "text",
            "image"
        ],
        imageRequired: true
    }
];
}),
"[project]/open-sse/config/providers/registry/gemini/imageModels.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Google AI Studio (Gemini API) Imagen family image-generation provider entry.
 *
 * Uses the dedicated `:predict` endpoint (handled by format "google-imagen"), NOT
 * generateContent — so only imagen-* models belong here; gemini flash-image /
 * nano-banana route through /v1/chat/completions instead. The models are also
 * surfaced live via ListModels; this seed makes them addressable on
 * /v1/images/generations. Note: Imagen requires a billing-enabled Google project —
 * free-tier keys get 403 / quota 0. The handler builds `{baseUrl}/{model}:predict`.
 *
 * Extracted out of imageRegistry.ts (which sits right at the 800-line file-size
 * cap) so the catalog lives in its own semantic family module, following the same
 * pattern as `providers/registry/stability-ai/imageModels.ts` and
 * `providers/registry/segmind/imageModels.ts`. Co-located with the existing
 * `gemini/index.ts` chat-provider entry — same provider id, different
 * modality/consumer (chat registry vs image registry), mirroring the
 * `kie/index.ts` + `kie/imageModels.ts` split.
 */ __turbopack_context__.s([
    "GEMINI_IMAGEN_PROVIDER",
    ()=>GEMINI_IMAGEN_PROVIDER
]);
const GEMINI_IMAGEN_PROVIDER = {
    id: "gemini",
    alias: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    authType: "apikey",
    authHeader: "x-goog-api-key",
    format: "google-imagen",
    models: [
        {
            id: "imagen-4.0-generate-001",
            name: "Imagen 4"
        },
        {
            id: "imagen-4.0-ultra-generate-001",
            name: "Imagen 4 Ultra"
        },
        {
            id: "imagen-4.0-fast-generate-001",
            name: "Imagen 4 Fast"
        }
    ],
    supportedSizes: [
        "1024x1024",
        "1792x1024",
        "1024x1792"
    ]
};
}),
"[project]/open-sse/config/providers/registry/cheaperinference/imageModels.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Cheaper Inference image provider registry entry.
 * Extracted into its own module to keep open-sse/config/imageRegistry.ts
 * under the file-size cap (god-file decomposition; semantic split) — same
 * pattern as FREEPIK_IMAGE_PROVIDER / SEGMIND_IMAGE_PROVIDER.
 *
 * 3 image models measured from GET /v1/models?type=image on 2026-07-31.
 *
 * COLLISION NOTE: nano-banana-pro and nano-banana-2 are ALSO adobe-firefly model
 * ids. parseImageModel() resolves a bare id by first-match over IMAGE_PROVIDERS
 * iteration order, so this entry is spread into that object AFTER adobe-firefly:
 * bare `nano-banana-2` keeps routing to Firefly (pre-existing behaviour) and these
 * models are reachable only as `cheaperinference/<id>` / `cinf/<id>`. Do NOT add
 * IMAGE_MODEL_ALIASES entries for them — that would silently re-route Firefly
 * users. Guarded by tests/unit/cheaperinference-image-models.test.ts.
 *
 * The endpoint ignores `response_format:"url"` and always returns `b64_json`
 * (measured twice). The OpenAI image path already handles b64_json; this is not a
 * bug to "fix". /v1/images/edits returns 404 upstream, so no edit support.
 */ __turbopack_context__.s([
    "CHEAPERINFERENCE_IMAGE_PROVIDER",
    ()=>CHEAPERINFERENCE_IMAGE_PROVIDER
]);
const CHEAPERINFERENCE_IMAGE_PROVIDER = {
    id: "cheaperinference",
    alias: "cinf",
    baseUrl: "https://api.cheaperinference.com/v1/images/generations",
    authType: "apikey",
    authHeader: "bearer",
    format: "openai",
    models: [
        {
            id: "grok-imagine",
            name: "Grok Imagine (Cheaper Inference)"
        },
        {
            id: "nano-banana-pro",
            name: "Nano Banana Pro (Cheaper Inference)"
        },
        {
            id: "nano-banana-2",
            name: "Nano Banana 2 (Cheaper Inference)"
        }
    ],
    supportedSizes: [
        "1024x1024",
        "2048x2048",
        "4096x4096"
    ]
};
}),
"[project]/open-sse/config/imageRegistry.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IMAGE_PROVIDERS",
    ()=>IMAGE_PROVIDERS,
    "getAllImageModels",
    ()=>getAllImageModels,
    "getImageModelAliases",
    ()=>getImageModelAliases,
    "getImageModelEntry",
    ()=>getImageModelEntry,
    "getImageProvider",
    ()=>getImageProvider,
    "isRegisteredImageModel",
    ()=>isRegisteredImageModel,
    "modalitiesRequireImageInput",
    ()=>modalitiesRequireImageInput,
    "parseImageModel",
    ()=>parseImageModel
]);
/**
 * Image Generation Provider Registry
 *
 * Defines providers that support the /v1/images/generations endpoint.
 * Each provider has its own request format and endpoint.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$lmarena$2f$directModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/lmarena/directModels.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$segmind$2f$imageModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/segmind/imageModels.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kie$2f$imageModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/kie/imageModels.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$freepik$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/freepik/index.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$stability$2d$ai$2f$imageModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/stability-ai/imageModels.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gemini$2f$imageModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/gemini/imageModels.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cheaperinference$2f$imageModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/cheaperinference/imageModels.ts [middleware] (ecmascript)");
;
;
;
;
;
;
;
const IMAGE_MODEL_ALIASES = {
    "gemini-3.1-flash-image-preview": {
        provider: "antigravity",
        model: "gemini-3.1-flash-image",
        name: "Gemini 3.1 Flash Image",
        listInCatalog: false
    },
    "flux-kontext": {
        provider: "black-forest-labs",
        model: "flux-kontext-pro",
        name: "FLUX Kontext Pro",
        listInCatalog: true,
        inputModalities: [
            "text",
            "image"
        ]
    },
    "flux-kontext-max": {
        provider: "black-forest-labs",
        model: "flux-kontext-max",
        name: "FLUX Kontext Max",
        listInCatalog: true,
        inputModalities: [
            "text",
            "image"
        ]
    },
    "flux-2-max": {
        provider: "black-forest-labs",
        model: "flux-2-max",
        name: "FLUX.2 Max",
        listInCatalog: true,
        inputModalities: [
            "text",
            "image"
        ]
    },
    "flux-2-pro": {
        provider: "black-forest-labs",
        model: "flux-2-pro",
        name: "FLUX.2 Pro",
        listInCatalog: true,
        inputModalities: [
            "text",
            "image"
        ]
    },
    "flux-2-flex": {
        provider: "black-forest-labs",
        model: "flux-2-flex",
        name: "FLUX.2 Flex",
        listInCatalog: true,
        inputModalities: [
            "text",
            "image"
        ]
    },
    "flux-2-dev": {
        provider: "together",
        model: "black-forest-labs/FLUX.2-dev",
        name: "FLUX.2 Dev",
        listInCatalog: true,
        inputModalities: [
            "text",
            "image"
        ]
    },
    kontext: {
        provider: "black-forest-labs",
        model: "flux-kontext-pro",
        name: "FLUX Kontext Pro",
        listInCatalog: false,
        inputModalities: [
            "text",
            "image"
        ]
    },
    "pollinations/kontext": {
        provider: "black-forest-labs",
        model: "flux-kontext-pro",
        name: "FLUX Kontext Pro",
        listInCatalog: false,
        inputModalities: [
            "text",
            "image"
        ]
    }
};
function resolveImageModelAlias(modelStr) {
    const alias = IMAGE_MODEL_ALIASES[modelStr];
    return alias ? {
        provider: alias.provider,
        model: alias.model
    } : null;
}
function findImageModelConfig(providerId, modelId) {
    const provider = IMAGE_PROVIDERS[providerId];
    if (!provider) return null;
    return provider.models.find((model)=>model.id === modelId) || null;
}
// Kept out of getImageModelEntry() (which sits at the complexity-ratchet cap) — an
// alias can override imageRequired directly, else it falls back to its target
// model's own flag. Consumers coerce the result with Boolean(), so no `?? false`.
function resolveAliasImageRequired(alias, modelConfig) {
    return alias.imageRequired ?? modelConfig?.imageRequired;
}
const IMAGE_PROVIDERS = {
    "qwen-cloud-token-plan": {
        id: "qwen-cloud-token-plan",
        alias: "qct",
        baseUrl: "https://token-plan.ap-southeast-1.maas.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        authType: "apikey",
        authHeader: "bearer",
        format: "qwen-token-plan-image",
        models: [
            {
                id: "wan2.7-image",
                name: "Wan 2.7 Image",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "wan2.7-image-pro",
                name: "Wan 2.7 Image Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            }
        ],
        // Both models share 1K/2K support. The Pro model also accepts explicit 4K
        // dimensions, which callers can still pass through the permissive request schema.
        supportedSizes: [
            "1024x1024",
            "2048x2048"
        ]
    },
    openai: {
        id: "openai",
        baseUrl: "https://api.openai.com/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "gpt-image-2",
                name: "GPT Image 2"
            },
            {
                id: "gpt-image-1.5",
                name: "GPT Image 1.5"
            },
            {
                id: "gpt-image-1-mini",
                name: "GPT Image 1 Mini"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1792",
            "1792x1024"
        ]
    },
    // Codex exposes image generation only as a Responses-API hosted tool under
    // ChatGPT OAuth. Incoming GPT-Image-style `/v1/images/generations` requests are
    // translated to /responses calls with `tools: [{ type: "image_generation" }]`
    // by handleCodexImageGeneration.
    codex: {
        id: "codex",
        alias: "cx",
        baseUrl: "https://chatgpt.com/backend-api/codex/responses",
        authType: "oauth",
        authHeader: "bearer",
        format: "codex-responses",
        models: [
            {
                id: "gpt-5.6-sol",
                name: "GPT 5.6 Sol (Codex Image)"
            },
            {
                id: "gpt-5.6-terra",
                name: "GPT 5.6 Terra (Codex Image)"
            },
            {
                id: "gpt-5.6-luna",
                name: "GPT 5.6 Luna (Codex Image)"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1536",
            "1536x1024"
        ]
    },
    "chatgpt-web": {
        id: "chatgpt-web",
        alias: "cgpt-web",
        baseUrl: "https://chatgpt.com/backend-api/f/conversation",
        authType: "apikey",
        authHeader: "cookie",
        format: "chatgpt-web",
        models: [
            {
                id: "gpt-5.5",
                name: "GPT-5.5 Instant (ChatGPT Web Image)"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1536",
            "1536x1024"
        ]
    },
    "microsoft-designer-web": {
        id: "microsoft-designer-web",
        alias: "msdesigner",
        baseUrl: "https://designerapp.officeapps.live.com/designerapp/DallE.ashx?action=GetDallEImagesCogSci",
        authType: "apikey",
        authHeader: "bearer",
        format: "designer-web",
        models: [
            {
                id: "dall-e-3",
                name: "DALL-E 3 (Microsoft Designer Web)"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1792x1024",
            "1024x1792"
        ]
    },
    xai: {
        id: "xai",
        baseUrl: "https://api.x.ai/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "grok-imagine-image-quality",
                name: "Grok Imagine Image Quality"
            },
            {
                id: "grok-imagine-image",
                name: "Grok Imagine Image"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "2048x2048"
        ]
    },
    "vercel-ai-gateway": {
        id: "vercel-ai-gateway",
        alias: "vag",
        baseUrl: "https://ai-gateway.vercel.sh/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "gpt-image-1",
                name: "GPT Image 1"
            },
            {
                id: "black-forest-labs/flux-1.1-pro",
                name: "FLUX 1.1 Pro"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1792",
            "1792x1024"
        ]
    },
    together: {
        id: "together",
        baseUrl: "https://api.together.xyz/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "black-forest-labs/FLUX.2-max",
                name: "FLUX.2 Max",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "black-forest-labs/FLUX.2-pro",
                name: "FLUX.2 Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "black-forest-labs/FLUX.2-flex",
                name: "FLUX.2 Flex",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "black-forest-labs/FLUX.2-dev",
                name: "FLUX.2 Dev",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "openai/gpt-image-1.5",
                name: "GPT Image 1.5",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "Wan-AI/Wan2.6-image",
                name: "Wan 2.6 Image",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "Qwen/Qwen-Image-2.0-Pro",
                name: "Qwen Image 2.0 Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "Qwen/Qwen-Image-2.0",
                name: "Qwen Image 2.0",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "google/flash-image-3.1",
                name: "NanoBanana 2",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "google/gemini-3-pro-image",
                name: "NanoBanana Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            }
        ],
        supportedSizes: [
            "1024x1024",
            "512x512"
        ]
    },
    fireworks: {
        id: "fireworks",
        baseUrl: "https://api.fireworks.ai/inference/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "accounts/fireworks/flux-kontext-max",
                name: "FLUX Kontext Max"
            },
            {
                id: "accounts/fireworks/flux-kontext-pro",
                name: "FLUX Kontext Pro"
            },
            {
                id: "accounts/fireworks/flux-1-schnell-fp8",
                name: "FLUX.1 schnell"
            },
            {
                id: "accounts/fireworks/models/flux-1-dev-fp8",
                name: "FLUX 1 Dev FP8"
            },
            {
                id: "accounts/fireworks/models/stable-diffusion-xl-1024-v1-0",
                name: "SDXL 1024 v1.0"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "512x512"
        ]
    },
    antigravity: {
        id: "antigravity",
        baseUrl: "https://daily-cloudcode-pa.googleapis.com/v1internal:generateContent",
        authType: "oauth",
        authHeader: "bearer",
        format: "gemini-image",
        models: [
            {
                id: "gemini-3.1-flash-image",
                name: "Gemini 3.1 Flash Image"
            }
        ],
        supportedSizes: [
            "1024x1024"
        ]
    },
    // Google AI Studio Imagen family — dedicated :predict endpoint, not generateContent.
    // See providers/registry/gemini/imageModels.ts for the full rationale.
    gemini: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$gemini$2f$imageModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GEMINI_IMAGEN_PROVIDER"],
    //Curruntly no models serving
    nebius: {
        id: "nebius",
        baseUrl: "https://api.tokenfactory.nebius.com/v1/images/generations",
        fallbackUrl: "https://api.studio.nebius.com/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "black-forest-labs/flux-schnell",
                name: "No Model yet"
            }
        ],
        supportedSizes: [
            "1024x1024"
        ]
    },
    hyperbolic: {
        id: "hyperbolic",
        baseUrl: "https://api.hyperbolic.xyz/v1/image/generation",
        authType: "apikey",
        authHeader: "bearer",
        format: "hyperbolic",
        models: [
            {
                id: "SDXL1.0-base",
                name: "No Model yet"
            }
        ],
        supportedSizes: [
            "1024x1024"
        ]
    },
    //Curruntly no models serving
    nanobanana: {
        id: "nanobanana",
        baseUrl: "https://api.nanobananaapi.ai/api/v1/nanobanana/generate",
        proUrl: "https://api.nanobananaapi.ai/api/v1/nanobanana/generate-pro",
        statusUrl: "https://api.nanobananaapi.ai/api/v1/nanobanana/record-info",
        authType: "apikey",
        authHeader: "bearer",
        format: "nanobanana",
        models: [
            {
                id: "nanobanana-flash",
                name: "NanoBanana Flash (Gemini 2.5 Flash)"
            },
            {
                id: "nanobanana-pro",
                name: "NanoBanana Pro (Gemini 3 Pro)"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1280",
            "1024x1536",
            "1536x1024",
            "1280x1024"
        ]
    },
    kie: {
        id: "kie",
        baseUrl: "https://api.kie.ai",
        statusUrl: "https://api.kie.ai/api/v1/jobs/recordInfo",
        authType: "apikey",
        authHeader: "bearer",
        format: "kie-image",
        models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$kie$2f$imageModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["KIE_IMAGE_MODELS"],
        supportedSizes: [
            "1:1",
            "16:9",
            "9:16",
            "4:3",
            "3:4"
        ]
    },
    haiper: {
        id: "haiper",
        baseUrl: "https://api.haiper.ai/v1/jobs/gen2/text2image",
        statusUrl: "https://api.haiper.ai/v1/jobs",
        authType: "apikey",
        authHeader: "HAIPER_KEY",
        format: "haiper-image",
        models: [
            {
                id: "gen2",
                name: "Gen 2 Image"
            }
        ],
        supportedSizes: [
            "16:9",
            "9:16",
            "1:1",
            "4:3",
            "3:4"
        ]
    },
    // #2482: MiniMax already has entries in musicRegistry/audioRegistry/videoRegistry,
    // but was missing an image provider entirely, so MiniMax image-model requests
    // fell through the format dispatch below to a 400/unmatched-format response.
    minimax: {
        id: "minimax",
        baseUrl: "https://api.minimax.io/v1/image_generation",
        authType: "apikey",
        authHeader: "bearer",
        format: "minimax-image",
        models: [
            {
                id: "image-01",
                name: "MiniMax Image-01"
            },
            {
                id: "image-01-live",
                name: "MiniMax Image-01 Live"
            }
        ],
        supportedSizes: [
            "1:1",
            "16:9",
            "9:16",
            "4:3",
            "3:4",
            "3:2",
            "2:3",
            "1024x1024"
        ]
    },
    leonardo: {
        id: "leonardo",
        baseUrl: "https://cloud.leonardo.ai/api/rest/v1/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "leonardo-image",
        models: [
            {
                id: "phoenix",
                name: "Phoenix"
            },
            {
                id: "sdxl",
                name: "SDXL"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x576",
            "576x1024"
        ]
    },
    ideogram: {
        id: "ideogram",
        baseUrl: "https://api.ideogram.ai/generate",
        authType: "apikey",
        authHeader: "Api-Key",
        format: "ideogram-image",
        models: [
            {
                id: "V_3",
                name: "Ideogram V3"
            },
            {
                id: "V_2A",
                name: "Ideogram V2A"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1792",
            "1792x1024"
        ]
    },
    freepik: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$freepik$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FREEPIK_IMAGE_PROVIDER"],
    sdwebui: {
        id: "sdwebui",
        baseUrl: "http://localhost:7860/sdapi/v1/txt2img",
        authType: "none",
        authHeader: "none",
        format: "sdwebui",
        models: [
            {
                id: "stable-diffusion-v1-5",
                name: "Stable Diffusion v1.5"
            },
            {
                id: "sdxl-base-1.0",
                name: "SDXL Base 1.0"
            }
        ],
        supportedSizes: [
            "512x512",
            "768x768",
            "1024x1024"
        ]
    },
    comfyui: {
        id: "comfyui",
        baseUrl: "http://localhost:8188",
        authType: "none",
        authHeader: "none",
        format: "comfyui",
        models: [
            {
                id: "flux-dev",
                name: "FLUX Dev"
            },
            {
                id: "sdxl",
                name: "SDXL"
            }
        ],
        supportedSizes: [
            "512x512",
            "768x768",
            "1024x1024"
        ]
    },
    openrouter: {
        id: "openrouter",
        baseUrl: "https://openrouter.ai/api/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "openai/gpt-5.4-image-2",
                name: "GPT Image 2 (via OpenRouter)"
            },
            {
                id: "openai/gpt-5-image-mini",
                name: "GPT Image 1 Mini (via OpenRouter)"
            },
            {
                id: "google/gemini-3.1-flash-image-preview",
                name: "Nano Banana 2 (via OpenRouter)"
            },
            {
                id: "google/gemini-3-pro-image-preview",
                name: "Nano Banana Pro (via OpenRouter)"
            },
            {
                id: "black-forest-labs/flux.2-max",
                name: "FLUX.2 Max (via OpenRouter)"
            },
            {
                id: "black-forest-labs/flux.2-pro",
                name: "FLUX.2 Pro (via OpenRouter)"
            },
            {
                id: "black-forest-labs/flux.2-flex",
                name: "FLUX.2 Flex (via OpenRouter)"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1792",
            "1792x1024"
        ]
    },
    pollinations: {
        id: "pollinations",
        alias: "pol",
        baseUrl: "https://gen.pollinations.ai/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "klein",
                name: "FLUX.2 Klein 4B"
            },
            {
                id: "flux",
                name: "Flux Schnell"
            },
            {
                id: "zimage",
                name: "Z-Image Turbo"
            },
            {
                id: "qwen-image",
                name: "Qwen Image Plus"
            },
            {
                id: "wan-image",
                name: "Wan 2.7 Image"
            },
            {
                id: "gpt-image-2",
                name: "GPT Image 2"
            },
            {
                id: "gptimage-large",
                name: "GPT Image 1.5"
            },
            {
                id: "gptimage",
                name: "GPT Image 1 Mini"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "512x512"
        ]
    },
    "fal-ai": {
        id: "fal-ai",
        baseUrl: "https://fal.run",
        authType: "apikey",
        authHeader: "key",
        format: "fal-ai",
        models: [
            {
                id: "fal-ai/flux-2-max",
                name: "FLUX.2 Max"
            },
            {
                id: "fal-ai/flux-2-pro",
                name: "FLUX.2 Pro"
            },
            {
                id: "fal-ai/flux-2-flex",
                name: "FLUX.2 Flex"
            },
            {
                id: "bria/text-to-image/3.2",
                name: "Bria 3.2"
            },
            {
                id: "fal-ai/bytedance/seedream/v4.5/text-to-image",
                name: "SeeDream V4.5"
            },
            {
                id: "fal-ai/bytedance/dreamina/v3.1/text-to-image",
                name: "Dreamina V3.1"
            },
            {
                id: "fal-ai/ideogram/v3",
                name: "Ideogram V3"
            },
            {
                id: "fal-ai/nano-banana-pro",
                name: "Nano Banana Pro"
            },
            {
                id: "fal-ai/nano-banana-2",
                name: "Nano Banana 2"
            },
            {
                id: "fal-ai/recraft/v4/pro/text-to-image",
                name: "Recraft V4 Pro via Fal"
            },
            {
                id: "fal-ai/recraft/v4/text-to-image",
                name: "Recraft V4 via Fal"
            },
            {
                id: "fal-ai/stable-diffusion-v35-medium",
                name: "Stable Diffusion v3.5 Medium"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1280",
            "1280x1024"
        ]
    },
    "stability-ai": {
        id: "stability-ai",
        baseUrl: "https://api.stability.ai",
        authType: "apikey",
        authHeader: "bearer",
        format: "stability-ai",
        models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$stability$2d$ai$2f$imageModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["STABILITY_AI_IMAGE_MODELS"],
        supportedSizes: [
            "1024x1024",
            "1024x1280",
            "1280x1024"
        ]
    },
    "black-forest-labs": {
        id: "black-forest-labs",
        baseUrl: "https://api.bfl.ai",
        authType: "apikey",
        authHeader: "x-key",
        format: "black-forest-labs",
        models: [
            {
                id: "flux-2-max",
                name: "FLUX.2 Max"
            },
            {
                id: "flux-2-pro",
                name: "FLUX.2 Pro"
            },
            {
                id: "flux-2-flex",
                name: "FLUX.2 Flex"
            },
            {
                id: "flux-pro-1.1-ultra",
                name: "flux-pro-1.1-ultra"
            },
            {
                id: "flux-pro-1.1",
                name: "flux-pro-1.1"
            },
            {
                id: "flux-2-klein-9b",
                name: "flux 2 Klein 9B"
            },
            {
                id: "flux-2-klein-4b",
                name: "flux 2 Klein 4B"
            },
            {
                id: "flux-kontext-max",
                name: "flux-kontext-max",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "flux-kontext-pro",
                name: "flux-kontext-pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "flux-dev",
                name: "flux-dev"
            },
            {
                id: "flux-pro",
                name: "flux-pro"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1280",
            "1280x1024"
        ]
    },
    recraft: {
        id: "recraft",
        baseUrl: "https://external.api.recraft.ai",
        authType: "apikey",
        authHeader: "bearer",
        format: "recraft",
        models: [
            {
                id: "recraftv4_pro",
                name: "Recraft V4 Pro"
            },
            {
                id: "recraftv4",
                name: "Recraft V4"
            },
            {
                id: "recraftv3",
                name: "Recraft V3"
            },
            {
                id: "recraftv2",
                name: "Recraft V2"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1280",
            "1280x1024"
        ]
    },
    topaz: {
        id: "topaz",
        baseUrl: "https://api.topazlabs.com",
        authType: "apikey",
        authHeader: "x-api-key",
        format: "topaz",
        models: [
            {
                id: "topaz-enhance",
                name: "topaz-enhance",
                inputModalities: [
                    "image"
                ]
            }
        ],
        supportedSizes: [
            "1024x1024"
        ]
    },
    // Segmind (#6656): 200+ models, `POST /v1/{model}`, x-api-key, raw image bytes.
    segmind: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$segmind$2f$imageModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["SEGMIND_IMAGE_PROVIDER"],
    nanogpt: {
        id: "nanogpt",
        baseUrl: "https://nano-gpt.com/api/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "qwen-image",
                name: "Qwen Image",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "z-image-turbo",
                name: "Z Image Turbo"
            },
            {
                id: "chroma",
                name: "Chroma"
            },
            {
                id: "hidream",
                name: "Hidream I1 Full"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1024x1280",
            "1280x1024"
        ]
    },
    // NVIDIA NIM image generation (FLUX models). Distinct from the NVIDIA *chat* entry
    // (open-sse/config/providers/registry/nvidia/index.ts, host integrate.api.nvidia.com,
    // OpenAI-compatible) — image generation lives on ai.api.nvidia.com/v1/genai/<model>
    // with a native NIM body per model, so it gets a dedicated `nvidia-nim` format/handler
    // (handleNvidiaNimImageGeneration) rather than reusing the OpenAI image path.
    // Ported from upstream 9router#1195.
    nvidia: {
        id: "nvidia",
        baseUrl: "https://ai.api.nvidia.com/v1/genai",
        authType: "apikey",
        authHeader: "bearer",
        format: "nvidia-nim",
        models: [
            {
                id: "black-forest-labs/flux.1-dev",
                name: "FLUX.1 Dev",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "black-forest-labs/flux.1-schnell",
                name: "FLUX.1 Schnell"
            },
            {
                id: "black-forest-labs/flux.1-kontext-dev",
                name: "FLUX.1 Kontext Dev (Edit)",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "black-forest-labs/flux.2-klein-4b",
                name: "FLUX.2 Klein 4B",
                inputModalities: [
                    "text",
                    "image"
                ]
            }
        ],
        supportedSizes: [
            "1024x1024",
            "768x1344",
            "512x512"
        ]
    },
    // SenseNova (商汤日日新) Text-to-Image on the free Token Plan. OpenAI-compatible
    // `/v1/images/generations`, so the generic OpenAI image handler routes it — same
    // SenseNova api-key/connection as the chat provider. (9router#2233)
    sensenova: {
        id: "sensenova",
        baseUrl: "https://api.sensenova.cn/v1/images/generations",
        authType: "apikey",
        authHeader: "bearer",
        format: "openai",
        models: [
            {
                id: "sensenova-u1-fast",
                name: "SenseNova U1 Fast"
            }
        ],
        supportedSizes: [
            "1024x1024"
        ]
    },
    // HuggingFace Hub Inference API text-to-image task. Returns raw image bytes
    // (not JSON), so it uses a dedicated "huggingface-image" format handled by
    // handleHuggingFaceImageGeneration. Same base URL convention as the HF
    // STT/TTS entries in audioRegistry.ts. Model list is deliberately small —
    // the dashboard's "suggested models" chip row (GET
    // /api/v1/providers/suggested-models) surfaces additional HF Hub models
    // beyond this seed list.
    huggingface: {
        id: "huggingface",
        // HF retired api-inference.huggingface.co; text-to-image now routes through
        // router.huggingface.co with the hf-inference provider pinned in the path.
        baseUrl: "https://router.huggingface.co/hf-inference/models",
        authType: "apikey",
        authHeader: "bearer",
        format: "huggingface-image",
        models: [
            {
                id: "black-forest-labs/FLUX.1-dev",
                name: "FLUX.1 Dev (HF)"
            },
            {
                id: "black-forest-labs/FLUX.1-schnell",
                name: "FLUX.1 Schnell (HF)"
            },
            {
                id: "stabilityai/stable-diffusion-xl-base-1.0",
                name: "Stable Diffusion XL (HF)"
            }
        ],
        supportedSizes: [
            "1024x1024"
        ]
    },
    // Arena (formerly LMArena) Direct-chat Image category (static scrape 2026-07-09).
    // Not listed in the chat registry — image catalog only. Generation path still
    // uses cookie session auth via the lmarena provider connection (stable wire id).
    lmarena: {
        id: "lmarena",
        alias: "lma",
        baseUrl: "https://arena.ai/nextjs-api/stream/create-evaluation",
        authType: "apikey",
        authHeader: "cookie",
        format: "openai",
        models: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$lmarena$2f$directModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["LMARENA_DIRECT_IMAGE_MODELS"],
        supportedSizes: [
            "1024x1024",
            "1024x1792",
            "1792x1024"
        ]
    },
    // Adobe Firefly (unofficial) — IMS access_token (clio-playground-web) or browser
    // Cookie from firefly.adobe.com. Async 3P image generate + poll.
    // Model list = static fallback from models/discovery capture; live discovery
    // refreshes via resolveAdobeFireflyCatalog when credentials work.
    "adobe-firefly": {
        id: "adobe-firefly",
        alias: "firefly",
        baseUrl: "https://firefly-3p.ff.adobe.io/v2/3p-images/generate-async",
        authType: "apikey",
        authHeader: "bearer",
        format: "adobe-firefly-image",
        models: [
            {
                id: "nano-banana-pro",
                name: "Firefly Gemini 3.0 (Nano Banana Pro)",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "nano-banana",
                name: "Firefly Gemini 2.5 (Nano Banana)",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "nano-banana-2",
                name: "Firefly Gemini 3.1 (Nano Banana 2)",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "gpt-image-2",
                name: "Firefly GPT Image 2",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "gpt-image",
                name: "Firefly GPT Image 2",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "gpt-image-1.5",
                name: "Firefly GPT Image 1.5",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "flux-2",
                name: "Firefly Flux 2",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "flux-pro",
                name: "Firefly Flux 1.1 Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "flux-ultra",
                name: "Firefly Flux 1.1 Ultra",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "seedream-4",
                name: "Firefly Seedream 4.0",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "seedream-5-lite",
                name: "Firefly Seedream 5.0 Lite",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "runway-gen4-image",
                name: "Firefly Runway Gen-4 Image",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            // Topaz Labs upscalers (inputMediaUseCase: ["upscaling"]).
            // Served by firefly-3p /v2/3p-images/upsample — see config/upscaleRegistry.ts.
            {
                id: "topaz-standard",
                name: "Firefly Topaz Upscale (Standard)",
                inputModalities: [
                    "image"
                ],
                imageRequired: true
            },
            {
                id: "topaz-bloom",
                name: "Firefly Topaz Bloom (Creative Upscale)",
                inputModalities: [
                    "image"
                ],
                imageRequired: true
            }
        ],
        supportedSizes: [
            "1:1",
            "16:9",
            "9:16",
            "4:3",
            "3:4",
            "1024x1024",
            "1792x1024",
            "1024x1792"
        ]
    },
    // Cheaper Inference (OSS-sponsor gateway). Declared AFTER adobe-firefly on
    // purpose: it shares the nano-banana-pro / nano-banana-2 ids, and parseImageModel
    // resolves a bare id by first-match over this object's iteration order, so
    // Firefly keeps the bare ids and these are prefix-only. See the module for the
    // full collision note.
    cheaperinference: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$cheaperinference$2f$imageModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CHEAPERINFERENCE_IMAGE_PROVIDER"],
    // Keep Bailian Coding Plan after existing duplicate model owners so adding
    // explicit `bailian-coding-plan/` and `bcp/` routes does not change
    // historical bare-model routing.
    "bailian-coding-plan": {
        id: "bailian-coding-plan",
        alias: "bcp",
        baseUrl: "https://coding-intl.dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        authType: "apikey",
        authHeader: "bearer",
        format: "bailian-coding-plan-image",
        models: [
            {
                id: "wan2.7-image",
                name: "Wan 2.7 Image",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "wan2.7-image-pro",
                name: "Wan 2.7 Image Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "qwen-image-2.0",
                name: "Qwen Image 2.0",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "qwen-image-2.0-pro",
                name: "Qwen Image 2.0 Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            }
        ],
        supportedSizes: [
            "1024x1024",
            "2048x2048"
        ]
    },
    // Keep Alibaba after existing duplicate model owners so adding explicit
    // `alibaba/` and `ali/` routes does not change historical bare-model routing.
    alibaba: {
        id: "alibaba",
        alias: "ali",
        baseUrl: "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        authType: "apikey",
        authHeader: "bearer",
        format: "alibaba-image",
        models: [
            {
                id: "qwen-image-3.0-pro",
                name: "Qwen Image 3.0 Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "qwen-image-2.0-pro-2026-06-22",
                name: "Qwen Image 2.0 Pro (2026-06-22)",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "qwen-image-2.0",
                name: "Qwen Image 2.0",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "z-image-turbo",
                name: "Z-Image Turbo"
            },
            {
                id: "wan2.6-t2i",
                name: "Wan 2.6 T2I"
            }
        ],
        supportedSizes: [
            "1024x1024",
            "1280x1280",
            "2048x2048"
        ]
    },
    // Keep regular Qwen Cloud isolated from Alibaba, Bailian Coding Plan, and
    // Qwen Cloud Token Plan. Explicit `qwen-cloud/` or `qwc/` routes use only
    // the regular Qwen Cloud connection and its regional DashScope endpoint.
    "qwen-cloud": {
        id: "qwen-cloud",
        alias: "qwc",
        baseUrl: "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        authType: "apikey",
        authHeader: "bearer",
        format: "qwen-cloud-image",
        models: [
            {
                id: "wan2.7-image-pro",
                name: "Wan 2.7 Image Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "wan2.7-image",
                name: "Wan 2.7 Image",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "qwen-image-3.0-pro",
                name: "Qwen Image 3.0 Pro",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "qwen-image-2.0-pro-2026-06-22",
                name: "Qwen Image 2.0 Pro (2026-06-22)",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "qwen-image-2.0-2026-03-03",
                name: "Qwen Image 2.0 (2026-03-03)",
                inputModalities: [
                    "text",
                    "image"
                ]
            },
            {
                id: "z-image-turbo",
                name: "Z-Image Turbo"
            }
        ],
        // 1K/2K are shared by the whole catalog. Wan 2.7 Image Pro callers can
        // still pass supported 4K dimensions through the permissive request schema.
        supportedSizes: [
            "1024x1024",
            "2048x2048"
        ]
    }
};
function getImageProvider(providerId) {
    return IMAGE_PROVIDERS[providerId] || null;
}
function parseImageModel(modelStr) {
    if (!modelStr) return {
        provider: null,
        model: null
    };
    const directAlias = resolveImageModelAlias(modelStr);
    if (directAlias) {
        return directAlias;
    }
    // Try each provider prefix
    for (const [providerId, config] of Object.entries(IMAGE_PROVIDERS)){
        if (modelStr.startsWith(providerId + "/")) {
            const model = modelStr.slice(providerId.length + 1);
            const aliased = resolveImageModelAlias(`${providerId}/${model}`) || resolveImageModelAlias(model);
            return aliased || {
                provider: providerId,
                model
            };
        }
        // Check alias if available
        if (config.alias && modelStr.startsWith(config.alias + "/")) {
            const model = modelStr.slice(config.alias.length + 1);
            const aliased = resolveImageModelAlias(`${providerId}/${model}`) || resolveImageModelAlias(model);
            return aliased || {
                provider: providerId,
                model
            };
        }
    }
    // No provider prefix — try to find the model in every provider
    for (const [providerId, config] of Object.entries(IMAGE_PROVIDERS)){
        if (config.models.some((m)=>m.id === modelStr)) {
            return {
                provider: providerId,
                model: modelStr
            };
        }
    }
    return {
        provider: null,
        model: modelStr
    };
}
/**
 * Get all image models as a flat list
 */ function imageProviderCatalogEntries(providerId, config) {
    return config.models.map((model)=>({
            id: `${providerId}/${model.id}`,
            name: model.name,
            provider: providerId,
            supportedSizes: config.supportedSizes,
            inputModalities: model.inputModalities || [
                "text"
            ],
            description: model.description || undefined
        }));
}
function imageAliasCatalogEntry(alias, target) {
    if (!target.listInCatalog) return null;
    const providerConfig = IMAGE_PROVIDERS[target.provider];
    const modelConfig = findImageModelConfig(target.provider, target.model);
    return {
        id: alias,
        name: target.name || modelConfig?.name || alias,
        provider: target.provider,
        supportedSizes: providerConfig?.supportedSizes || [],
        inputModalities: target.inputModalities || modelConfig?.inputModalities || [
            "text"
        ],
        description: target.description || modelConfig?.description || undefined
    };
}
function getAllImageModels() {
    const providerModels = Object.entries(IMAGE_PROVIDERS).flatMap(([providerId, config])=>imageProviderCatalogEntries(providerId, config));
    const aliasModels = Object.entries(IMAGE_MODEL_ALIASES).flatMap(([alias, target])=>{
        const entry = imageAliasCatalogEntry(alias, target);
        return entry ? [
            entry
        ] : [];
    });
    return [
        ...providerModels,
        ...aliasModels
    ];
}
function getImageModelAliases() {
    return IMAGE_MODEL_ALIASES;
}
function isRegisteredImageModel(providerId, modelId) {
    return Boolean(findImageModelConfig(providerId, modelId));
}
function getImageModelEntry(modelStr) {
    if (!modelStr) return null;
    const alias = IMAGE_MODEL_ALIASES[modelStr];
    if (alias) {
        const modelConfig = findImageModelConfig(alias.provider, alias.model);
        return {
            provider: alias.provider,
            model: alias.model,
            inputModalities: alias.inputModalities || modelConfig?.inputModalities || [
                "text"
            ],
            imageRequired: resolveAliasImageRequired(alias, modelConfig),
            description: alias.description || modelConfig?.description || undefined
        };
    }
    const { provider, model } = parseImageModel(modelStr);
    if (!provider || !model) return null;
    const modelConfig = findImageModelConfig(provider, model);
    if (!modelConfig) return null;
    return {
        provider,
        model,
        inputModalities: modelConfig.inputModalities || [
            "text"
        ],
        imageRequired: modelConfig.imageRequired,
        description: modelConfig.description || undefined
    };
}
function modalitiesRequireImageInput(inputModalities) {
    const list = Array.isArray(inputModalities) ? inputModalities : [
        "text"
    ];
    return list.includes("image") && !list.includes("text");
}
}),
"[project]/src/shared/network/outboundUrlGuard.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLOUD_METADATA_BLOCKED_MESSAGE",
    ()=>CLOUD_METADATA_BLOCKED_MESSAGE,
    "OutboundUrlGuardError",
    ()=>OutboundUrlGuardError,
    "PROVIDER_URL_BLOCKED_MESSAGE",
    ()=>PROVIDER_URL_BLOCKED_MESSAGE,
    "isCloudMetadataHost",
    ()=>isCloudMetadataHost,
    "isPrivateHost",
    ()=>isPrivateHost,
    "parseAndValidateNonMetadataUrl",
    ()=>parseAndValidateNonMetadataUrl,
    "parseAndValidatePublicUrl",
    ()=>parseAndValidatePublicUrl,
    "parseOutboundUrl",
    ()=>parseOutboundUrl
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:net [external] (node:net, cjs)");
;
const PROVIDER_URL_BLOCKED_MESSAGE = "Blocked private or local provider URL";
const CLOUD_METADATA_BLOCKED_MESSAGE = "Blocked cloud-metadata endpoint";
class OutboundUrlGuardError extends Error {
    code;
    url;
    hostname;
    constructor(message, init){
        super(message);
        this.name = "OutboundUrlGuardError";
        this.code = init.code;
        this.url = init.url;
        this.hostname = init.hostname ?? null;
    }
}
function normalizeHost(hostname) {
    const normalized = hostname.trim().toLowerCase();
    if (normalized.startsWith("[") && normalized.endsWith("]")) {
        return normalized.slice(1, -1);
    }
    return normalized;
}
function isPrivateHost(hostname) {
    const normalized = normalizeHost(hostname);
    if (!normalized) return true;
    if (normalized === "localhost" || normalized === "0.0.0.0" || normalized === "127.0.0.1" || normalized === "::1" || normalized.endsWith(".localhost") || normalized.endsWith(".local") || // `.internal` is reserved for private use (ICANN-style) and is the
    // hostname suffix used by GCP/Azure metadata probes
    // (e.g. `metadata.google.internal`).
    normalized.endsWith(".internal") || normalized.startsWith("::ffff:")) {
        return true;
    }
    if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["isIP"])(normalized) === 4) {
        const octets = normalized.split(".").map((segment)=>parseInt(segment, 10));
        const [a, b] = octets;
        if (a === 0 || a === 10 || a === 127) return true;
        if (a === 169 && b === 254) return true;
        if (a === 192 && b === 168) return true;
        if (a === 172 && b >= 16 && b <= 31) return true;
        if (a === 100 && b >= 64 && b <= 127) return true;
        return false;
    }
    if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["isIP"])(normalized) === 6) {
        return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
    }
    return false;
}
const CLOUD_METADATA_HOSTNAMES = new Set([
    "169.254.169.254",
    "metadata.google.internal",
    "metadata.goog",
    "100.100.100.200",
    "fd00:ec2::254"
]);
function isCloudMetadataHost(hostname) {
    const host = normalizeHost(hostname);
    if (!host) return false;
    if (CLOUD_METADATA_HOSTNAMES.has(host)) return true;
    if (host.startsWith("169.254.")) return true; // IPv4 link-local /16
    return false;
}
function parseOutboundUrl(input) {
    let url;
    try {
        url = input instanceof URL ? input : new URL(String(input));
    } catch  {
        throw new OutboundUrlGuardError(`Invalid outbound URL: ${String(input)}`, {
            code: "OUTBOUND_URL_INVALID",
            url: String(input)
        });
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new OutboundUrlGuardError(`Invalid outbound URL protocol for ${url.toString()}`, {
            code: "OUTBOUND_URL_INVALID",
            url: url.toString(),
            hostname: url.hostname || null
        });
    }
    if (url.username || url.password) {
        throw new OutboundUrlGuardError("Blocked outbound URL with embedded credentials", {
            code: "OUTBOUND_URL_GUARD_BLOCKED",
            url: url.toString(),
            hostname: url.hostname || null
        });
    }
    return url;
}
function parseAndValidatePublicUrl(input) {
    const url = parseOutboundUrl(input);
    if (isPrivateHost(url.hostname)) {
        throw new OutboundUrlGuardError(PROVIDER_URL_BLOCKED_MESSAGE, {
            code: "OUTBOUND_URL_GUARD_BLOCKED",
            url: url.toString(),
            hostname: url.hostname || null
        });
    }
    return url;
}
function parseAndValidateNonMetadataUrl(input) {
    const url = parseOutboundUrl(input);
    if (isCloudMetadataHost(url.hostname)) {
        throw new OutboundUrlGuardError(CLOUD_METADATA_BLOCKED_MESSAGE, {
            code: "OUTBOUND_URL_GUARD_BLOCKED",
            url: url.toString(),
            hostname: url.hostname || null
        });
    }
    return url;
} // NOTE (#7682): `arePrivateProviderUrlsAllowed`, `areLocalProviderUrlsAllowed`,
 // `getProviderOutboundGuard`, `getProviderValidationGuard`, and `parseAndValidateWebhookUrl`
 // live in the sibling `./outboundUrlGuardPolicy.ts` module, NOT here. Those helpers need
 // `@/shared/utils/featureFlags` (which transitively pulls in the DB layer), and this file is
 // loaded by the packaged CLI (`omniroute setup-opencode` → cli-helper/config-generator/
 // opencode.ts) where no `tsconfig.json` is present to resolve the `@/*` path alias. Keeping
 // this module free of ANY `@/`-aliased import is what makes it safe to load from the CLI.
 // Do not add a `@/`-aliased import here — see docs/security/… (packaging) and #7682.
}),
"[project]/src/shared/network/outboundUrlGuardPolicy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LOCAL_PROVIDER_URLS_ENV",
    ()=>LOCAL_PROVIDER_URLS_ENV,
    "PRIVATE_PROVIDER_URLS_ENV",
    ()=>PRIVATE_PROVIDER_URLS_ENV,
    "areLocalProviderUrlsAllowed",
    ()=>areLocalProviderUrlsAllowed,
    "arePrivateProviderUrlsAllowed",
    ()=>arePrivateProviderUrlsAllowed,
    "getProviderOutboundGuard",
    ()=>getProviderOutboundGuard,
    "getProviderValidationGuard",
    ()=>getProviderValidationGuard,
    "parseAndValidateWebhookUrl",
    ()=>parseAndValidateWebhookUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuard.ts [middleware] (ecmascript)");
;
;
// #7682: this module is the DB/feature-flag-backed half of the outbound URL guard, split out
// of `./outboundUrlGuard.ts` so the CLI (`omniroute setup-opencode`, loaded via tsx with no
// tsconfig.json in a global npm install) never has to resolve the `@/` alias. Only Next.js /
// webpack-bundled server code (never the CLI) should import from here.
const TRUE_ENV_VALUES = new Set([
    "1",
    "true",
    "yes",
    "on"
]);
const PRIVATE_PROVIDER_URLS_ENV = "OMNIROUTE_ALLOW_PRIVATE_PROVIDER_URLS";
const LOCAL_PROVIDER_URLS_ENV = "OMNIROUTE_ALLOW_LOCAL_PROVIDER_URLS";
function isTrueValue(raw) {
    if (typeof raw !== "string") return false;
    return TRUE_ENV_VALUES.has(raw.trim().toLowerCase());
}
function arePrivateProviderUrlsAllowed() {
    // 1) DB override takes precedence — it represents an explicit user toggle in
    //    the dashboard ("Allow Private Provider URLs"). This is critical for the
    //    Electron build (#2575) where the server is spawned with the env value
    //    captured at boot, so subsequent UI toggles only land in the DB and the
    //    env-first ordering would otherwise mask them.
    try {
        const dbValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveFeatureFlag"])(PRIVATE_PROVIDER_URLS_ENV);
        if (isTrueValue(dbValue)) return true;
    } catch  {
    // DB not initialized yet — fall through to env-only check.
    }
    // 2) Explicit env opt-in (for headless/Docker users who set it before boot).
    if (isTrueValue(process.env[PRIVATE_PROVIDER_URLS_ENV])) return true;
    // 3) Legacy escape hatch — disabling the outbound guard implies allowing
    //    private URLs.
    const legacyValue = process.env["OUTBOUND_SSRF_GUARD_ENABLED"];
    if (typeof legacyValue === "string" && [
        "false",
        "0",
        "no",
        "off"
    ].includes(legacyValue.trim().toLowerCase())) {
        return true;
    }
    return false;
}
function getProviderOutboundGuard() {
    return arePrivateProviderUrlsAllowed() ? "none" : "public-only";
}
function areLocalProviderUrlsAllowed() {
    try {
        const dbValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveFeatureFlag"])(LOCAL_PROVIDER_URLS_ENV);
        if (dbValue !== undefined && dbValue !== "") return isTrueValue(dbValue);
    } catch  {
    // DB not initialized yet — fall through to env / default.
    }
    const envValue = process.env[LOCAL_PROVIDER_URLS_ENV];
    if (typeof envValue === "string" && envValue !== "") return isTrueValue(envValue);
    // Default ON.
    return true;
}
function getProviderValidationGuard() {
    if (arePrivateProviderUrlsAllowed()) return "none";
    if (areLocalProviderUrlsAllowed()) return "block-metadata";
    return "public-only";
}
function parseAndValidateWebhookUrl(input) {
    const url = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseOutboundUrl"])(input);
    // Cloud-metadata / link-local endpoints are NEVER a valid webhook target — block them
    // even when the private opt-in is enabled (SSRF→IAM-credential pivot). (#3269)
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isCloudMetadataHost"])(url.hostname)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OutboundUrlGuardError"](__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["PROVIDER_URL_BLOCKED_MESSAGE"], {
            code: "OUTBOUND_URL_GUARD_BLOCKED",
            url: url.toString(),
            hostname: url.hostname || null
        });
    }
    if (!arePrivateProviderUrlsAllowed() && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isPrivateHost"])(url.hostname)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OutboundUrlGuardError"](__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["PROVIDER_URL_BLOCKED_MESSAGE"], {
            code: "OUTBOUND_URL_GUARD_BLOCKED",
            url: url.toString(),
            hostname: url.hostname || null
        });
    }
    return url;
}
}),
"[project]/src/shared/utils/fetchTimeout.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FetchTimeoutError",
    ()=>FetchTimeoutError,
    "fetchWithTimeout",
    ()=>fetchWithTimeout,
    "getConfiguredTimeout",
    ()=>getConfiguredTimeout
]);
/**
 * Fetch Timeout — T-25
 *
 * Wraps fetch() with an AbortController-based timeout.
 * Default timeout is 120 seconds (FETCH_TIMEOUT_MS env var).
 *
 * @module shared/utils/fetchTimeout
 */ const DEFAULT_TIMEOUT_MS = parseInt(process.env.OMNIROUTE_DEFAULT_FETCH_TIMEOUT_MS || "", 10) || 120000; // 2 minutes
const FETCH_TIMEOUT_MS = parseInt(process.env.FETCH_TIMEOUT_MS || "", 10) || DEFAULT_TIMEOUT_MS;
async function fetchWithTimeout(url, options = {}) {
    const { timeoutMs = FETCH_TIMEOUT_MS, signal: externalSignal, fetchFn, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(), timeoutMs);
    // If an external signal was provided, wire it to abort our controller too
    if (externalSignal) {
        if (externalSignal.aborted) {
            controller.abort();
        } else {
            externalSignal.addEventListener("abort", ()=>controller.abort(), {
                once: true
            });
        }
    }
    try {
        const doFetch = fetchFn || globalThis.fetch;
        const response = await doFetch(url, {
            ...fetchOptions,
            signal: controller.signal
        });
        return response;
    } catch (error) {
        if (error.name === "AbortError") {
            throw new FetchTimeoutError(`Request to ${url} timed out after ${timeoutMs}ms`, timeoutMs, String(url));
        }
        throw error;
    } finally{
        clearTimeout(timeoutId);
    }
}
class FetchTimeoutError extends Error {
    timeoutMs;
    url;
    constructor(message, timeoutMs, url){
        super(message);
        this.name = "FetchTimeoutError";
        this.timeoutMs = timeoutMs;
        this.url = url;
    }
}
function getConfiguredTimeout() {
    return FETCH_TIMEOUT_MS;
}
}),
"[project]/src/shared/network/safeOutboundFetch.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "SAFE_OUTBOUND_FETCH_PRESETS",
    ()=>SAFE_OUTBOUND_FETCH_PRESETS,
    "SafeOutboundFetchError",
    ()=>SafeOutboundFetchError,
    "getSafeOutboundFetchErrorStatus",
    ()=>getSafeOutboundFetchErrorStatus,
    "safeOutboundFetch",
    ()=>safeOutboundFetch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/fetchTimeout.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuard.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const DEFAULT_IDEMPOTENT_METHODS = [
    "GET",
    "HEAD",
    "OPTIONS",
    "PUT",
    "DELETE"
];
const SAFE_OUTBOUND_FETCH_PRESETS = {
    validationRead: {
        timeoutMs: 5000,
        allowRedirect: false,
        retry: {
            attempts: 2,
            backoffMs: [
                150
            ],
            methods: [
                "GET",
                "HEAD"
            ]
        }
    },
    validationWrite: {
        timeoutMs: 15000,
        allowRedirect: false,
        retry: false
    },
    modelsProbe: {
        timeoutMs: 5000,
        allowRedirect: false,
        retry: {
            attempts: 2,
            backoffMs: [
                150
            ],
            methods: [
                "GET",
                "HEAD"
            ]
        }
    },
    modelsDiscovery: {
        timeoutMs: 10000,
        allowRedirect: false,
        retry: {
            attempts: 2,
            backoffMs: [
                200
            ],
            methods: [
                "GET",
                "HEAD"
            ]
        }
    },
    modelsPagination: {
        timeoutMs: 15000,
        allowRedirect: false,
        retry: {
            attempts: 2,
            backoffMs: [
                250
            ],
            methods: [
                "GET",
                "HEAD"
            ]
        }
    }
};
class SafeOutboundFetchError extends Error {
    code;
    url;
    method;
    attempts;
    isRetryable;
    timeoutMs;
    status;
    location;
    constructor(message, init){
        super(message);
        this.name = "SafeOutboundFetchError";
        this.code = init.code;
        this.url = init.url;
        this.method = init.method;
        this.attempts = init.attempts;
        this.isRetryable = init.isRetryable;
        this.timeoutMs = init.timeoutMs;
        this.status = init.status;
        this.location = init.location ?? null;
        if (init.cause !== undefined) {
            this.cause = init.cause;
        }
    }
}
function normalizeMethod(method) {
    return (method || "GET").toUpperCase();
}
function normalizeUrl(input) {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseOutboundUrl"])(input);
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OutboundUrlGuardError"]) {
            throw new SafeOutboundFetchError(error.message, {
                code: error.code === "OUTBOUND_URL_INVALID" ? "INVALID_URL" : "URL_GUARD_BLOCKED",
                url: error.url,
                method: "GET",
                attempts: 1,
                isRetryable: false,
                cause: error
            });
        }
        throw new SafeOutboundFetchError(`Invalid outbound URL: ${String(input)}`, {
            code: "INVALID_URL",
            url: String(input),
            method: "GET",
            attempts: 1,
            isRetryable: false,
            cause: error
        });
    }
}
function applyUrlGuard(targetUrl, guard, method) {
    if (guard === "none") return;
    try {
        // "public-only" rejects every private host; "block-metadata" (#5066) allows private/LAN
        // hosts but still rejects cloud-metadata / link-local endpoints.
        if (guard === "block-metadata") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseAndValidateNonMetadataUrl"])(targetUrl);
        } else {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["parseAndValidatePublicUrl"])(targetUrl);
        }
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OutboundUrlGuardError"]) {
            throw new SafeOutboundFetchError(error.message, {
                code: error.code === "OUTBOUND_URL_INVALID" ? "INVALID_URL" : "URL_GUARD_BLOCKED",
                url: error.url,
                method,
                attempts: 1,
                isRetryable: false,
                cause: error
            });
        }
        throw error;
    }
}
function getRetryConfig(retry, method) {
    if (retry === false) {
        return {
            attempts: 1,
            shouldRetryMethod: false,
            statusCodes: new Set(),
            backoffMs: []
        };
    }
    const methods = new Set((retry?.methods || DEFAULT_IDEMPOTENT_METHODS).map((value)=>value.toUpperCase()));
    const attempts = Math.max(1, retry?.attempts || 1);
    const backoffMs = Array.isArray(retry?.backoffMs) ? retry?.backoffMs : typeof retry?.backoffMs === "number" ? [
        retry.backoffMs
    ] : [];
    const statusCodes = new Set(retry?.statusCodes || []);
    return {
        attempts,
        shouldRetryMethod: methods.has(method),
        statusCodes,
        backoffMs
    };
}
function getBackoffDelay(backoffMs, attemptNumber) {
    if (backoffMs.length === 0) return 0;
    return backoffMs[Math.min(attemptNumber - 1, backoffMs.length - 1)] || 0;
}
function sleep(ms) {
    if (ms <= 0) return Promise.resolve();
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
async function cancelResponseBody(response) {
    try {
        await response.body?.cancel();
    } catch  {
    // Ignore body cancellation errors when preparing a retry.
    }
}
function normalizeFetchFailure(error, targetUrl, method, attempts) {
    if (error instanceof SafeOutboundFetchError) {
        error.attempts = attempts;
        return error;
    }
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FetchTimeoutError"]) {
        return new SafeOutboundFetchError(error.message, {
            code: "TIMEOUT",
            url: targetUrl,
            method,
            attempts,
            timeoutMs: error.timeoutMs,
            isRetryable: true,
            cause: error
        });
    }
    const message = error instanceof Error ? error.message : String(error);
    const code = error && typeof error === "object" ? error.code : undefined;
    return new SafeOutboundFetchError(message || `Outbound request failed for ${targetUrl}`, {
        code: "NETWORK_ERROR",
        url: targetUrl,
        method,
        attempts,
        isRetryable: code !== "PROXY_UNREACHABLE",
        cause: error
    });
}
async function safeOutboundFetch(url, options = {}) {
    const targetUrl = normalizeUrl(url);
    const method = normalizeMethod(options.method);
    const { timeoutMs, allowRedirect = false, retry, guard = "none", proxyConfig, bypassProxyPatch = false, signal, ...fetchOptions } = options;
    applyUrlGuard(targetUrl, guard, method);
    const retryConfig = getRetryConfig(retry, method);
    const redirect = allowRedirect ? fetchOptions.redirect ?? "follow" : "manual";
    for(let attempt = 1; attempt <= retryConfig.attempts; attempt++){
        try {
            const executeFetch = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["fetchWithTimeout"])(targetUrl.toString(), {
                    ...fetchOptions,
                    method,
                    redirect,
                    signal,
                    timeoutMs,
                    // When bypassing the proxy patch, use the original native fetch directly.
                    fetchFn: bypassProxyPatch ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getOriginalFetch"])() : undefined
                });
            const response = bypassProxyPatch ? await executeFetch() : proxyConfig ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, executeFetch) : await executeFetch();
            if (!allowRedirect && response.status >= 300 && response.status < 400) {
                const location = response.headers.get("location");
                await cancelResponseBody(response);
                throw new SafeOutboundFetchError(`Redirect blocked for ${method} ${targetUrl.toString()} (${response.status})`, {
                    code: "REDIRECT_BLOCKED",
                    url: targetUrl.toString(),
                    method,
                    attempts: attempt,
                    status: response.status,
                    location,
                    isRetryable: false
                });
            }
            if (retryConfig.shouldRetryMethod && attempt < retryConfig.attempts && retryConfig.statusCodes.has(response.status)) {
                await cancelResponseBody(response);
                await sleep(getBackoffDelay(retryConfig.backoffMs, attempt));
                continue;
            }
            return response;
        } catch (error) {
            const normalizedError = normalizeFetchFailure(error, targetUrl.toString(), method, attempt);
            const shouldRetry = retryConfig.shouldRetryMethod && attempt < retryConfig.attempts && normalizedError.isRetryable;
            if (!shouldRetry) {
                throw normalizedError;
            }
            await sleep(getBackoffDelay(retryConfig.backoffMs, attempt));
        }
    }
    throw new SafeOutboundFetchError(`Outbound request failed for ${targetUrl.toString()}`, {
        code: "NETWORK_ERROR",
        url: targetUrl.toString(),
        method,
        attempts: retryConfig.attempts,
        isRetryable: false
    });
}
function getSafeOutboundFetchErrorStatus(error) {
    if (!(error instanceof SafeOutboundFetchError)) return null;
    if (error.code === "TIMEOUT") return 504;
    if (error.code === "INVALID_URL" || error.code === "URL_GUARD_BLOCKED" || error.code === "REDIRECT_BLOCKED") {
        return 503;
    }
    return null;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/imageValidation.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "validateImageProviderApiKey",
    ()=>validateImageProviderApiKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/imageRegistry.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuardPolicy.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/safeOutboundFetch.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const IMAGE_PROVIDER_VALIDATION_ENDPOINTS = {
    "fal-ai": {
        baseUrl: "https://api.fal.ai",
        path: "/v1/models?limit=1"
    },
    "stability-ai": {
        path: "/v1/user/account"
    },
    "black-forest-labs": {
        path: "/v1/credits"
    },
    recraft: {
        path: "/v1/users/me"
    },
    topaz: {
        path: "/account/v1/credits/balance"
    }
};
function normalizeBaseUrl(baseUrl) {
    return (baseUrl || "").trim().replace(/\/$/, "");
}
function applyCustomUserAgent(headers, providerSpecificData = {}) {
    const customUserAgent = typeof providerSpecificData?.customUserAgent === "string" ? providerSpecificData.customUserAgent.trim() : "";
    if (customUserAgent) {
        headers["user-agent"] = customUserAgent;
    }
    return headers;
}
function toValidationErrorResult(error) {
    const message = error instanceof Error ? error.message : String(error || "Validation failed");
    const statusCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getSafeOutboundFetchErrorStatus"])(error);
    return {
        valid: false,
        error: message || "Validation failed",
        unsupported: false,
        ...statusCode ? {
            statusCode
        } : {},
        ...error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["SafeOutboundFetchError"] && error.code === "TIMEOUT" ? {
            timeout: true
        } : {},
        ...statusCode === 400 ? {
            securityBlocked: true
        } : {}
    };
}
function buildImageProviderValidationHeaders(imageProvider, apiKey, providerSpecificData = {}) {
    const headers = {
        Accept: "application/json"
    };
    if (apiKey) {
        switch(String(imageProvider?.authHeader || "").toLowerCase()){
            case "bearer":
                headers.Authorization = `Bearer ${apiKey}`;
                break;
            case "key":
                headers.Authorization = `Key ${apiKey}`;
                break;
            case "x-key":
                headers["x-key"] = apiKey;
                break;
            case "x-api-key":
                headers["X-API-Key"] = apiKey;
                break;
            case "none":
                break;
            default:
                headers.Authorization = `Bearer ${apiKey}`;
                break;
        }
    }
    return applyCustomUserAgent(headers, providerSpecificData);
}
async function validationRead(url, init) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["safeOutboundFetch"])(url, {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["SAFE_OUTBOUND_FETCH_PRESETS"].validationRead,
        guard: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getProviderOutboundGuard"])(),
        ...init
    });
}
async function validateImageProviderApiKey({ provider, apiKey, providerSpecificData = {} }) {
    const imageProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getImageProvider"])(provider);
    const validationConfig = IMAGE_PROVIDER_VALIDATION_ENDPOINTS[provider];
    if (!imageProvider || !validationConfig) {
        return {
            valid: false,
            error: "Provider validation not supported",
            unsupported: true
        };
    }
    try {
        const baseUrl = normalizeBaseUrl(providerSpecificData?.baseUrl || validationConfig.baseUrl || imageProvider.baseUrl);
        const url = `${baseUrl}${validationConfig.path}`;
        const response = await validationRead(url, {
            method: validationConfig.method || "GET",
            headers: buildImageProviderValidationHeaders(imageProvider, apiKey, providerSpecificData)
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "image-provider"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key",
                method: "image-provider"
            };
        }
        if (response.status === 429) {
            return {
                valid: false,
                error: "Validation rate limited (429)",
                method: "image-provider"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`,
                method: "image-provider"
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`,
            method: "image-provider"
        };
    } catch (error) {
        return toValidationErrorResult(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/shared/constants/alibabaProviderRegions.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALIBABA_PROVIDER_ENDPOINTS",
    ()=>ALIBABA_PROVIDER_ENDPOINTS,
    "ALIBABA_PROVIDER_REGION_VALUES",
    ()=>ALIBABA_PROVIDER_REGION_VALUES,
    "getDefaultAlibabaProviderRegion",
    ()=>getDefaultAlibabaProviderRegion,
    "isAlibabaRegionalProvider",
    ()=>isAlibabaRegionalProvider,
    "normalizeAlibabaProviderRegion",
    ()=>normalizeAlibabaProviderRegion,
    "resolveAlibabaProviderBaseUrl",
    ()=>resolveAlibabaProviderBaseUrl,
    "resolveAlibabaProviderMediaBaseUrl",
    ()=>resolveAlibabaProviderMediaBaseUrl,
    "resolveAlibabaProviderModelsUrl",
    ()=>resolveAlibabaProviderModelsUrl,
    "resolveAlibabaProviderRegion",
    ()=>resolveAlibabaProviderRegion
]);
const ALIBABA_PROVIDER_REGION_VALUES = [
    "global-sg",
    "china-beijing"
];
const ALIBABA_PROVIDER_ENDPOINTS = {
    alibaba: {
        "global-sg": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
        "china-beijing": "https://dashscope.aliyuncs.com/compatible-mode/v1"
    },
    "bailian-coding-plan": {
        "global-sg": "https://coding-intl.dashscope.aliyuncs.com/apps/anthropic/v1",
        "china-beijing": "https://coding.dashscope.aliyuncs.com/apps/anthropic/v1"
    },
    "qwen-cloud": {
        "global-sg": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
        "china-beijing": "https://dashscope.aliyuncs.com/compatible-mode/v1"
    },
    "qwen-cloud-token-plan": {
        "global-sg": "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
        "china-beijing": "https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1"
    }
};
const REGIONAL_PROVIDER_IDS = new Set([
    "alibaba",
    "alibaba-cn",
    "bailian-coding-plan",
    "qwen-cloud",
    "qwen-cloud-token-plan"
]);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function canonicalProviderFamily(providerId) {
    if (providerId === "alibaba-cn") return "alibaba";
    if (providerId === "alibaba" || providerId === "bailian-coding-plan" || providerId === "qwen-cloud" || providerId === "qwen-cloud-token-plan") {
        return providerId;
    }
    return null;
}
const SLASH_CHAR_CODE = 47;
/**
 * Strip every trailing "/" in linear time.
 *
 * Deliberately not a regex: `/\/+$/` has no left anchor, so the engine retries at
 * every start offset and each attempt re-walks the slash run before failing `$` —
 * quadratic on an endpoint made of many slashes (CodeQL js/polynomial-redos).
 * Connection base URLs are operator-supplied, so they reach this trim directly.
 */ function stripTrailingSlashes(value) {
    let end = value.length;
    while(end > 0 && value.charCodeAt(end - 1) === SLASH_CHAR_CODE)end--;
    return end === value.length ? value : value.slice(0, end);
}
function normalizeEndpoint(value) {
    return stripTrailingSlashes(value.trim()).replace(/\/(?:chat\/completions|messages)$/i, "").toLowerCase();
}
function isFamilyPresetUrl(family, value) {
    const normalized = normalizeEndpoint(value);
    return ALIBABA_PROVIDER_REGION_VALUES.some((region)=>normalizeEndpoint(ALIBABA_PROVIDER_ENDPOINTS[family][region]) === normalized);
}
function isAlibabaRegionalProvider(providerId) {
    return typeof providerId === "string" && REGIONAL_PROVIDER_IDS.has(providerId);
}
function getDefaultAlibabaProviderRegion(providerId) {
    return providerId === "alibaba-cn" ? "china-beijing" : "global-sg";
}
function normalizeAlibabaProviderRegion(value, fallback = "global-sg") {
    if (typeof value !== "string") return fallback;
    switch(value.trim().toLowerCase()){
        case "global-sg":
        case "global":
        case "international":
        case "singapore":
        case "ap-southeast-1":
            return "global-sg";
        case "china-beijing":
        case "china":
        case "cn":
        case "beijing":
        case "cn-beijing":
            return "china-beijing";
        default:
            return fallback;
    }
}
function resolveAlibabaProviderRegion(providerId, providerSpecificData) {
    const fallback = getDefaultAlibabaProviderRegion(providerId);
    return normalizeAlibabaProviderRegion(asRecord(providerSpecificData).region, fallback);
}
function resolveAlibabaProviderBaseUrl(providerId, providerSpecificData, fallback = "") {
    const family = canonicalProviderFamily(providerId);
    const data = asRecord(providerSpecificData);
    const configuredBaseUrl = typeof data.baseUrl === "string" && data.baseUrl.trim() ? data.baseUrl.trim() : "";
    if (!family) return configuredBaseUrl || fallback;
    if (configuredBaseUrl && !isFamilyPresetUrl(family, configuredBaseUrl)) {
        return configuredBaseUrl;
    }
    const region = resolveAlibabaProviderRegion(providerId, data);
    return ALIBABA_PROVIDER_ENDPOINTS[family][region];
}
function resolveAlibabaProviderModelsUrl(providerId, providerSpecificData, fallback = "") {
    const baseUrl = stripTrailingSlashes(resolveAlibabaProviderBaseUrl(providerId, providerSpecificData, fallback).trim()).replace(/\/(?:chat\/completions|messages|models)$/i, "");
    return baseUrl ? `${baseUrl}/models` : "";
}
function resolveAlibabaProviderMediaBaseUrl(providerId, providerSpecificData, fallback = "") {
    return stripTrailingSlashes(resolveAlibabaProviderBaseUrl(providerId, providerSpecificData, fallback).trim()).replace(/\/compatible-mode\/v1(?:\/(?:chat\/completions|models))?$/i, "/api/v1").replace(/\/apps\/anthropic(?:\/v1)?(?:\/messages)?$/i, "/api/v1");
}
}),
"[project]/src/lib/providers/validation/urlHelpers.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GEMINI_LIKE_FORMATS",
    ()=>GEMINI_LIKE_FORMATS,
    "OPENAI_LIKE_FORMATS",
    ()=>OPENAI_LIKE_FORMATS,
    "addModelsSuffix",
    ()=>addModelsSuffix,
    "normalizeAnthropicBaseUrl",
    ()=>normalizeAnthropicBaseUrl,
    "normalizeAzureOpenAIBaseUrl",
    ()=>normalizeAzureOpenAIBaseUrl,
    "normalizeBaseUrl",
    ()=>normalizeBaseUrl,
    "normalizeClaudeCodeCompatibleBaseUrl",
    ()=>normalizeClaudeCodeCompatibleBaseUrl,
    "normalizeDatabricksChatUrl",
    ()=>normalizeDatabricksChatUrl,
    "normalizeGigachatChatUrl",
    ()=>normalizeGigachatChatUrl,
    "normalizeHerokuChatUrl",
    ()=>normalizeHerokuChatUrl,
    "normalizeSnowflakeChatUrl",
    ()=>normalizeSnowflakeChatUrl,
    "resolveBaseUrl",
    ()=>resolveBaseUrl,
    "resolveChatUrl",
    ()=>resolveChatUrl
]);
// URL/format normalizers for provider key validation. Pure string helpers extracted from
// validation.ts (god-file decomposition): no I/O, no side effects — they only shape base URLs
// and chat endpoints per provider format. Behavior is byte-identical to the original inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatible.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [middleware] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const OPENAI_LIKE_FORMATS = new Set([
    "openai",
    "openai-responses"
]);
const GEMINI_LIKE_FORMATS = new Set([
    "gemini"
]);
function normalizeBaseUrl(baseUrl) {
    // Guard against a non-string baseUrl reaching .trim() / .replace() — see #2463
    // where NVIDIA NIM validation surfaced as `e.startsWith is not a function`
    // after the bundler renamed `baseUrl` to `e`. Any malformed providerSpecificData
    // (e.g. saved as object from a UI bug) would otherwise crash mid-validation.
    const value = typeof baseUrl === "string" ? baseUrl : "";
    return value.trim().replace(/\/$/, "");
}
function normalizeAzureOpenAIBaseUrl(baseUrl) {
    return normalizeBaseUrl(baseUrl).replace(/\/openai$/i, "").replace(/\/openai\/deployments\/[^/]+\/chat\/completions.*$/i, "");
}
function normalizeAnthropicBaseUrl(baseUrl) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["stripAnthropicMessagesSuffix"])(baseUrl || "");
}
function normalizeClaudeCodeCompatibleBaseUrl(baseUrl) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["stripClaudeCodeCompatibleEndpointSuffix"])(baseUrl || "");
}
function addModelsSuffix(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return "";
    // Endpoint URLs can carry request-only query flags (for example Kimi Code's
    // `/messages?beta=true`). A models probe targets a sibling path, so preserve
    // only the URL before the query/hash before replacing the endpoint suffix.
    const separatorIndex = normalized.search(/[?#]/);
    const endpoint = separatorIndex === -1 ? normalized : normalized.slice(0, separatorIndex);
    const suffixes = [
        "/chat/completions",
        "/responses",
        "/chat",
        "/messages"
    ];
    if (endpoint.endsWith("/models")) {
        return endpoint;
    }
    for (const suffix of suffixes){
        if (endpoint.endsWith(suffix)) {
            return `${endpoint.slice(0, -suffix.length)}/models`;
        }
    }
    return `${endpoint}/models`;
}
function resolveBaseUrl(entry, providerSpecificData = {}) {
    if (providerSpecificData?.baseUrl) return normalizeBaseUrl(providerSpecificData.baseUrl);
    if (entry?.baseUrl) return normalizeBaseUrl(entry.baseUrl);
    return "";
}
function resolveChatUrl(provider, baseUrl, providerSpecificData = {}) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return "";
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isOpenAICompatibleProvider"])(provider)) {
        if (providerSpecificData?.chatPath) {
            return `${normalized}${providerSpecificData.chatPath}`;
        }
        if (providerSpecificData?.apiType === "responses") {
            return `${normalized}/responses`;
        }
        return `${normalized}/chat/completions`;
    }
    if (normalized.endsWith("/chat/completions") || normalized.endsWith("/responses") || normalized.endsWith("/chat")) {
        return normalized;
    }
    if (normalized.endsWith("/v1")) {
        return `${normalized}/chat/completions`;
    }
    return normalized;
}
function normalizeHerokuChatUrl(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return "";
    return normalized.endsWith("/v1/chat/completions") ? normalized : `${normalized}/v1/chat/completions`;
}
function normalizeDatabricksChatUrl(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return "";
    return normalized.endsWith("/chat/completions") ? normalized : `${normalized}/chat/completions`;
}
function normalizeSnowflakeChatUrl(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl).replace(/\/cortex\/inference:complete$/, "").replace(/\/api\/v2$/, "");
    if (!normalized) return "";
    return `${normalized}/api/v2/cortex/inference:complete`;
}
function normalizeGigachatChatUrl(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl).replace(/\/chat\/completions$/, "");
    if (!normalized) return "";
    return `${normalized}/chat/completions`;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/utils/proxyFallback.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "__setProxyFallbackTestHooks",
    ()=>__setProxyFallbackTestHooks,
    "clearProxyFallbackCache",
    ()=>clearProxyFallbackCache,
    "findWorkingProxy",
    ()=>findWorkingProxy,
    "getProxyCandidates",
    ()=>getProxyCandidates,
    "selectWorkingProxyFallback",
    ()=>selectWorkingProxyFallback,
    "testProxiesAgainstTarget",
    ()=>testProxiesAgainstTarget,
    "testSingleProxy",
    ()=>testSingleProxy
]);
/**
 * proxyFallback.ts — Smart Proxy Fallback for Provider Validation
 *
 * When a direct fetch to a provider fails and no explicit proxy was configured,
 * this module automatically gathers proxy candidates from all available sources,
 * tests them in parallel against the provider URL, and returns the first working one.
 * Results are cached per target URL to avoid repeated probing without letting
 * a failed path poison a different endpoint on the same API host.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/undici/index.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyDispatcher.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/proxies/rotation.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/proxies.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$oneproxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/oneproxy.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------
const PROXY_FALLBACK_CACHE = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let proxyFallbackTestHooks = null;
function clearProxyFallbackCache() {
    PROXY_FALLBACK_CACHE.clear();
}
function __setProxyFallbackTestHooks(hooks) {
    proxyFallbackTestHooks = hooks;
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/**
 * Build a full proxy URL string from a proxy record's fields.
 */ function proxyRecordToUrl(proxy) {
    const auth = proxy.username ? `${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password || "")}@` : "";
    return `${proxy.type}://${auth}${proxy.host}:${proxy.port}`;
}
function cacheKeyForTarget(targetHostname, targetUrl) {
    try {
        const url = new URL(targetUrl);
        const normalizedPath = `${url.pathname || "/"}${url.search}`;
        return `${url.protocol}//${url.host}${normalizedPath}`;
    } catch  {
        return targetHostname.toLowerCase();
    }
}
/**
 * Resolve the environment proxy URL (HTTP_PROXY / HTTPS_PROXY / ALL_PROXY)
 * for the given target URL. Returns null if no env proxy is configured or
 * the target matches NO_PROXY.
 */ function resolveEnvProxyUrl(targetUrl) {
    // Honour NO_PROXY
    const noProxy = process.env.NO_PROXY || process.env.no_proxy;
    if (noProxy) {
        let hostname;
        try {
            hostname = new URL(targetUrl).hostname.toLowerCase();
        } catch  {
            return null;
        }
        const patterns = noProxy.split(",").map((p)=>p.trim().toLowerCase()).filter(Boolean);
        const match = patterns.some((pattern)=>{
            if (pattern === "*") return true;
            if (pattern.includes("*")) {
                const re = new RegExp("^" + pattern.split("*").map((s)=>s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$");
                return re.test(hostname);
            }
            return hostname === pattern || hostname.endsWith(`.${pattern}`);
        });
        if (match) return null;
    }
    let protocol;
    try {
        protocol = new URL(targetUrl).protocol;
    } catch  {
        return null;
    }
    const proxyUrl = protocol === "https:" ? process.env.HTTPS_PROXY || process.env.https_proxy || process.env.ALL_PROXY || process.env.all_proxy : process.env.HTTP_PROXY || process.env.http_proxy || process.env.ALL_PROXY || process.env.all_proxy;
    if (!proxyUrl) return null;
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeProxyUrl"])(proxyUrl, "environment proxy");
    } catch  {
        return null;
    }
}
async function getProxyCandidates(targetUrl) {
    const candidates = new Set();
    // 1. Global proxy from registry
    try {
        const globalProxy = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2f$rotation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveProxyForScopeFromRegistry"])("global");
        if (globalProxy?.proxy) {
            candidates.add(proxyRecordToUrl(globalProxy.proxy));
        }
    } catch  {
    // Table may not exist yet
    }
    // 2. All user-configured proxies (include secrets for auth)
    try {
        const { items: allProxies } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$proxies$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["listProxies"])({
            includeSecrets: true
        });
        for (const p of allProxies){
            if (p.host && p.port) {
                candidates.add(proxyRecordToUrl(p));
            }
        }
    } catch  {
    // Table may not exist yet
    }
    // 3. Top 5 1proxy marketplace proxies
    try {
        const oneproxyProxies = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$oneproxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["listOneproxyProxies"])({
            limit: 5
        });
        for (const p of oneproxyProxies){
            if (p.host && p.port) {
                candidates.add(proxyRecordToUrl(p));
            }
        }
    } catch  {
    // Table may not exist yet
    }
    // 4. Environment proxy (needs targetUrl to determine protocol)
    if (targetUrl) {
        try {
            const envProxy = resolveEnvProxyUrl(targetUrl);
            if (envProxy) candidates.add(envProxy);
        } catch  {
        // Ignore env proxy errors
        }
    }
    return Array.from(candidates);
}
async function testSingleProxy(proxyUrl, targetUrl, timeoutMs = 3000) {
    const start = Date.now();
    try {
        const controller = new AbortController();
        const timeout = setTimeout(()=>controller.abort(), timeoutMs);
        const dispatcher = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyDispatcher$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createProxyDispatcher"])(proxyUrl);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$undici$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["fetch"])(targetUrl, {
            method: "HEAD",
            signal: controller.signal,
            dispatcher,
            headers: {
                "User-Agent": "OmniRoute/1.0"
            }
        });
        clearTimeout(timeout);
        const latencyMs = Date.now() - start;
        // Any response (including 4xx) means the proxy can reach the target
        return {
            ok: true,
            latencyMs
        };
    } catch  {
        return {
            ok: false,
            latencyMs: null
        };
    }
}
async function testProxiesAgainstTarget(targetUrl, proxyUrls) {
    if (proxyUrls.length === 0) return [];
    const results = await Promise.allSettled(proxyUrls.map(async (proxyUrl)=>{
        const result = await testSingleProxy(proxyUrl, targetUrl);
        return {
            proxyUrl,
            ...result
        };
    }));
    return results.map((r)=>r.status === "fulfilled" ? r.value : {
            proxyUrl: "unknown",
            ok: false,
            latencyMs: null
        });
}
// ---------------------------------------------------------------------------
// Find working proxy (with caching)
// ---------------------------------------------------------------------------
// #9100: single-flight probe dedup. Under concurrent failures (e.g. 5 parallel
// chat requests all hitting a dead pinned proxy), every request would otherwise
// probe the whole proxy pool simultaneously — a thundering herd of TCP connects
// that throttles the very proxies it is trying to reach. Concurrent
// findWorkingProxy calls for the same cache key share ONE probe promise;
// mirrors the proxyHealthInflight pattern in src/lib/proxyHealth.ts.
const inflightProbes = new Map();
async function findWorkingProxy(targetHostname, targetUrl) {
    if (!targetHostname) return null;
    const cacheKey = cacheKeyForTarget(targetHostname, targetUrl);
    // Check cache first
    const cached = PROXY_FALLBACK_CACHE.get(cacheKey);
    if (cached) {
        if (cached.expiresAt > Date.now()) {
            // Cached hit — return the proxy (or null if previously all failed)
            return cached.proxyUrl || null;
        }
        // Expired entry — remove it and re-probe
        PROXY_FALLBACK_CACHE.delete(cacheKey);
    }
    // #9100: single-flight — if a probe for this cache key is already running,
    // share its promise instead of starting another (thundering-herd guard).
    const existingProbe = inflightProbes.get(cacheKey);
    if (existingProbe) {
        return existingProbe;
    }
    const probe = (async ()=>{
        // Collect candidates
        const candidates = await (proxyFallbackTestHooks?.getProxyCandidates ?? getProxyCandidates)(targetUrl);
        if (candidates.length === 0) {
            return null;
        }
        // Test all in parallel, return first that works
        const results = await Promise.allSettled(candidates.map(async (proxyUrl)=>{
            const { ok } = await (proxyFallbackTestHooks?.testSingleProxy ?? testSingleProxy)(proxyUrl, targetUrl);
            return {
                proxyUrl,
                ok
            };
        }));
        const working = results.find((r)=>r.status === "fulfilled" && r.value.ok);
        if (working && working.status === "fulfilled") {
            const proxyUrl = working.value.proxyUrl;
            // Cache the working proxy
            PROXY_FALLBACK_CACHE.set(cacheKey, {
                proxyUrl,
                expiresAt: Date.now() + CACHE_TTL_MS
            });
            return proxyUrl;
        }
        // All failed — cache the negative result to avoid re-probing too often
        PROXY_FALLBACK_CACHE.set(cacheKey, {
            proxyUrl: "",
            expiresAt: Date.now() + CACHE_TTL_MS
        });
        return null;
    })();
    inflightProbes.set(cacheKey, probe);
    try {
        return await probe;
    } finally{
        // Only the owning caller removes the entry — a later caller that picked up
        // the shared promise must not delete it out from under the first caller.
        if (inflightProbes.get(cacheKey) === probe) {
            inflightProbes.delete(cacheKey);
        }
    }
}
async function selectWorkingProxyFallback(_connectionId) {
    // #3332: auto-selection is opt-in. Without this gate, any single proxy in the
    // registry silently becomes a global fallback for ALL connections (ignoring
    // assignments / per-connection proxy_enabled). Default OFF — only run when the
    // operator explicitly enables PROXY_AUTO_SELECT_ENABLED.
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])("PROXY_AUTO_SELECT_ENABLED")) return null;
    const candidates = await getProxyCandidates();
    if (candidates.length === 0) return null;
    // Use a well-known AI API endpoint as the test target. If a proxy can
    // reach this, it is likely suitable for routing AI traffic.
    const targetUrl = "https://api.openai.com/v1/models";
    const targetHostname = "api.openai.com";
    const workingUrl = await findWorkingProxy(targetHostname, targetUrl);
    if (!workingUrl) return null;
    try {
        const url = new URL(workingUrl);
        return {
            proxy: {
                type: url.protocol.replace(":", "") || "http",
                host: url.hostname,
                port: parseInt(url.port, 10) || (url.protocol === "https:" ? 443 : 80),
                username: url.username ? decodeURIComponent(url.username) : "",
                password: url.password ? decodeURIComponent(url.password) : ""
            },
            level: "autoSelect",
            levelId: null,
            source: "automatic"
        };
    } catch  {
        return null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/proxyAutoSelector.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "clearProxySelectionCache",
    ()=>clearProxySelectionCache,
    "selectProxyForValidation",
    ()=>selectProxyForValidation
]);
/**
 * proxyAutoSelector.ts — Validation-layer proxy auto-selection service
 *
 * Wraps the low-level proxy fallback engine for use in the provider validation
 * pipeline. When a direct validation request fails with a connectivity error,
 * this service finds a working proxy and lets the caller retry with it.
 *
 * Proxies are discovered and returned for the current request only — they are
 * NOT persisted to the proxy registry. Short-term caching (5-minute TTL) is
 * handled by the in-memory cache in proxyFallback.ts.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFallback$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFallback.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFallback$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFallback$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function selectProxyForValidation(targetUrl) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])("PROXY_AUTO_SELECT_ENABLED")) return null;
    if (!targetUrl) return null;
    let hostname;
    try {
        hostname = new URL(targetUrl).hostname;
        if (!hostname) return null;
    } catch  {
        return null;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFallback$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["findWorkingProxy"])(hostname, targetUrl);
}
function clearProxySelectionCache() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFallback$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["clearProxyFallbackCache"])();
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/transport.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "WEB_COOKIE_PROVIDERS_WITHOUT_MODELS_API",
    ()=>WEB_COOKIE_PROVIDERS_WITHOUT_MODELS_API,
    "fetchWithProxyFallback",
    ()=>fetchWithProxyFallback,
    "isRetryableProxyTarget",
    ()=>isRetryableProxyTarget,
    "isSecurityBlockError",
    ()=>isSecurityBlockError,
    "toValidationErrorResult",
    ()=>toValidationErrorResult,
    "toWebCookieValidationErrorResult",
    ()=>toWebCookieValidationErrorResult,
    "validationRead",
    ()=>validationRead,
    "validationWrite",
    ()=>validationWrite
]);
// Outbound fetch wrappers for provider validation: proxy-fallback, SSRF-aware proxy targeting, and
// error→result mapping. Extracted from validation.ts (god-file decomposition). Behavior is
// byte-identical to the original inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/safeOutboundFetch.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuard.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuardPolicy.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$proxyAutoSelector$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/proxyAutoSelector.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$proxyAutoSelector$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$proxyAutoSelector$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function fetchWithProxyFallback(url, init, presets, isLocal) {
    try {
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["safeOutboundFetch"])(url, {
            ...presets,
            guard: isLocal ? "none" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getProviderValidationGuard"])(),
            ...init
        });
    } catch (err) {
        // Only attempt proxy fallback for retryable errors (network / timeout)
        // and only when the target is not a local / LAN address.
        const fetchErr = err;
        const isNetworkIssue = fetchErr?.code === "NETWORK_ERROR" || fetchErr?.code === "TIMEOUT";
        const isRetryable = fetchErr?.isRetryable !== false;
        const isValidTarget = !isLocal && isRetryableProxyTarget(url);
        if (isLocal || !isNetworkIssue || !isRetryable) throw err;
        if (!isValidTarget) throw err;
        const proxyUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$proxyAutoSelector$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["selectProxyForValidation"])(url);
        if (!proxyUrl) throw err;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["safeOutboundFetch"])(url, {
            ...presets,
            guard: isLocal ? "none" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getProviderValidationGuard"])(),
            ...init,
            proxyConfig: proxyUrl
        });
    }
}
function isRetryableProxyTarget(url) {
    try {
        const hostname = new URL(url).hostname.toLowerCase();
        // Never proxy-fallback to a private/link-local/metadata host. Delegates to
        // the canonical SSRF guard (covers 169.254, 0.0.0.0, 172.16/12, CGNAT,
        // IPv6 fc/fd/fe80, .internal — gaps the previous inline check missed).
        return !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isPrivateHost"])(hostname);
    } catch  {
        return false;
    }
}
async function validationRead(url, init, isLocal = false) {
    return fetchWithProxyFallback(url, init, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["SAFE_OUTBOUND_FETCH_PRESETS"].validationRead, isLocal);
}
async function validationWrite(url, init, isLocal = false) {
    return fetchWithProxyFallback(url, init, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["SAFE_OUTBOUND_FETCH_PRESETS"].validationWrite, isLocal);
}
function isSecurityBlockError(error) {
    if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["SafeOutboundFetchError"])) return false;
    if (error.code === "URL_GUARD_BLOCKED" || error.code === "INVALID_URL") return true;
    if (error.code === "REDIRECT_BLOCKED") {
        if (!error.location) return false;
        try {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuard$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isPrivateHost"])(new URL(error.location, error.url).hostname);
        } catch  {
            return false;
        }
    }
    return false;
}
// #7542 — web-cookie providers whose registry `baseUrl` is a POST-only streaming/completion
// endpoint (no real `/models` listing API), so the generic `/models` probe in
// validateWebCookieProvider() gets a redirect instead of a definitive 200/401/403. A blocked
// redirect there is not a session-expiry signal — the endpoint just isn't shaped for the probe
// — so it should degrade to "unsupported" the same way the discovery path already does for
// REDIRECT_BLOCKED (#6267's buildDiscoveryErrorFallbackResponse).
//
// Scoped to `lmarena` only (root-caused and regression-tested for #7542): the other web-cookie
// providers sharing a POST-only baseUrl shape (doubao-web, huggingchat, yuanbao-web,
// zenmux-free, zai-web) have not been individually verified to actually redirect on this probe
// rather than 404/405 — do not add them here without a proven repro per provider (see
// #7542 plan-file, "Risks").
const WEB_COOKIE_PROVIDERS_WITH_UNRELIABLE_MODELS_PROBE = new Set([
    "lmarena"
]);
const WEB_COOKIE_PROVIDERS_WITHOUT_MODELS_API = new Set([
    "huggingchat",
    "chatgpt-web",
    "grok-web",
    "notion-web",
    "t3-web",
    "yuanbao-web",
    "copilot-web",
    "copilot-m365-web"
]);
function toWebCookieValidationErrorResult(provider, error) {
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["SafeOutboundFetchError"] && error.code === "REDIRECT_BLOCKED" && WEB_COOKIE_PROVIDERS_WITH_UNRELIABLE_MODELS_PROBE.has(provider)) {
        return {
            valid: false,
            error: "Provider validation not supported",
            unsupported: true
        };
    }
    return toValidationErrorResult(error);
}
function toValidationErrorResult(error) {
    const message = error instanceof Error ? error.message : String(error || "Validation failed");
    const statusCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getSafeOutboundFetchErrorStatus"])(error);
    return {
        valid: false,
        error: message || "Validation failed",
        unsupported: false,
        ...statusCode ? {
            statusCode
        } : {},
        ...error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["SafeOutboundFetchError"] && error.code === "TIMEOUT" ? {
            timeout: true
        } : {},
        ...isSecurityBlockError(error) ? {
            securityBlocked: true
        } : {}
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/headers.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "STANDARD_USER_AGENT",
    ()=>STANDARD_USER_AGENT,
    "applyCustomUserAgent",
    ()=>applyCustomUserAgent,
    "buildBearerHeaders",
    ()=>buildBearerHeaders,
    "buildClarifaiHeaders",
    ()=>buildClarifaiHeaders,
    "buildKeyHeaders",
    ()=>buildKeyHeaders,
    "buildRekaHeaders",
    ()=>buildRekaHeaders,
    "buildTokenHeaders",
    ()=>buildTokenHeaders,
    "directHttpsRequest",
    ()=>directHttpsRequest,
    "getCustomUserAgent",
    ()=>getCustomUserAgent,
    "withCustomUserAgent",
    ()=>withCustomUserAgent
]);
// Request-header builders + custom-UA handling + a direct (proxy-bypassing) HTTPS helper, extracted
// from validation.ts (god-file decomposition). Pure header construction except directHttpsRequest,
// which delegates to safeOutboundFetch with bypassProxyPatch. Behavior is byte-identical.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/safeOutboundFetch.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuardPolicy.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const STANDARD_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";
function getCustomUserAgent(providerSpecificData = {}) {
    if (typeof providerSpecificData?.customUserAgent !== "string") return null;
    const customUserAgent = providerSpecificData.customUserAgent.trim();
    return customUserAgent || null;
}
function applyCustomUserAgent(headers, providerSpecificData = {}) {
    const customUserAgent = getCustomUserAgent(providerSpecificData);
    if (!customUserAgent) return headers;
    headers["User-Agent"] = customUserAgent;
    if ("user-agent" in headers) {
        headers["user-agent"] = customUserAgent;
    }
    return headers;
}
function withCustomUserAgent(init, providerSpecificData = {}) {
    return {
        ...init,
        headers: applyCustomUserAgent({
            ...init.headers || {}
        }, providerSpecificData)
    };
}
function directHttpsRequest(url, options, timeoutMs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["safeOutboundFetch"])(url, {
        method: options.method || "GET",
        headers: options.headers || {},
        body: options.body,
        timeoutMs,
        bypassProxyPatch: true,
        allowRedirect: false,
        guard: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getProviderValidationGuard"])(),
        retry: false
    }).then(async (response)=>({
            status: response.status,
            ok: response.ok,
            text: async ()=>await response.text()
        }));
}
function buildBearerHeaders(apiKey, providerSpecificData = {}) {
    const headers = {
        "Content-Type": "application/json"
    };
    if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
    }
    return applyCustomUserAgent(headers, providerSpecificData);
}
function buildRekaHeaders(apiKey, providerSpecificData = {}) {
    const headers = {
        "Content-Type": "application/json"
    };
    if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
        headers["X-Api-Key"] = apiKey;
    }
    return applyCustomUserAgent(headers, providerSpecificData);
}
function buildClarifaiHeaders(apiKey, providerSpecificData = {}) {
    const headers = {
        "Content-Type": "application/json"
    };
    if (apiKey) {
        headers.Authorization = `Key ${apiKey}`;
    }
    return applyCustomUserAgent(headers, providerSpecificData);
}
function buildKeyHeaders(apiKey, providerSpecificData = {}) {
    const headers = {
        "Content-Type": "application/json"
    };
    if (apiKey) {
        headers.Authorization = `Key ${apiKey}`;
    }
    return applyCustomUserAgent(headers, providerSpecificData);
}
function buildTokenHeaders(apiKey, providerSpecificData = {}) {
    const headers = {
        "Content-Type": "application/json"
    };
    if (apiKey) {
        headers.Authorization = `Token ${apiKey}`;
    }
    return applyCustomUserAgent(headers, providerSpecificData);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/webCookieAuth.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildGrokCookieHeader",
    ()=>buildGrokCookieHeader,
    "buildQwenCookieHeader",
    ()=>buildQwenCookieHeader,
    "extractCookieValue",
    ()=>extractCookieValue,
    "extractKimiAccessToken",
    ()=>extractKimiAccessToken,
    "extractKimiJwt",
    ()=>extractKimiJwt,
    "extractQwenToken",
    ()=>extractQwenToken,
    "normalizeSessionCookieHeader",
    ()=>normalizeSessionCookieHeader,
    "normalizeSessionCookieHeaders",
    ()=>normalizeSessionCookieHeaders,
    "stripCookieInputPrefix",
    ()=>stripCookieInputPrefix
]);
function stripCookieInputPrefix(rawValue) {
    const trimmed = (rawValue || "").trim();
    if (!trimmed) return "";
    const withoutBearer = trimmed.replace(/^bearer\s+/i, "");
    return withoutBearer.replace(/^cookie:/i, "").trim();
}
function normalizeSessionCookieHeader(rawValue, defaultCookieName) {
    const normalized = stripCookieInputPrefix(rawValue);
    if (!normalized) return "";
    if (normalized.includes("=")) {
        return normalized;
    }
    return `${defaultCookieName}=${normalized}`;
}
function extractCookieValue(rawValue, cookieName) {
    const trimmed = stripCookieInputPrefix(rawValue);
    if (!trimmed) return "";
    if (trimmed.includes(";")) {
        const escaped = cookieName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = trimmed.match(new RegExp("(?:^|;\\s*)" + escaped + "=([^;\\s]+)"));
        return match ? match[1] : "";
    }
    const prefix = `${cookieName}=`;
    if (trimmed.startsWith(prefix)) return trimmed.slice(prefix.length);
    return trimmed;
}
function buildGrokCookieHeader(rawValue) {
    const sso = extractCookieValue(rawValue, "sso");
    if (!sso) return "";
    const parts = [
        `sso=${sso}`
    ];
    for (const name of [
        "sso-rw",
        "cf_clearance",
        "__cf_bm"
    ]){
        if (new RegExp("(?:^|;\\s*)" + name + "=").test(rawValue)) {
            const value = extractCookieValue(rawValue, name);
            if (value) parts.push(`${name}=${value}`);
        }
    }
    return parts.join("; ");
}
function buildQwenCookieHeader(rawValue) {
    const trimmed = stripCookieInputPrefix(rawValue);
    if (!trimmed || !trimmed.includes("=")) return "";
    return trimmed;
}
function extractQwenToken(rawValue) {
    const trimmed = stripCookieInputPrefix(rawValue);
    if (!trimmed) return "";
    if (!trimmed.includes("=")) return trimmed;
    const match = trimmed.match(/(?:^|;\s*)token=([^;\s]+)/);
    return match ? match[1] : "";
}
function extractKimiAccessToken(rawValue) {
    const raw = String(rawValue ?? "").trim();
    if (!raw) return "";
    const bearer = raw.match(/^(?:authorization:\s*)?bearer\s+([^;\s]+)/i);
    if (bearer) return bearer[1];
    const trimmed = stripCookieInputPrefix(raw);
    for (const key of [
        "access_token",
        "kimi-auth"
    ]){
        const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = trimmed.match(new RegExp(`(?:^|[\\s;])${escaped}=([^;\\s]+)`));
        if (match) return match[1];
    }
    return !trimmed.includes("=") && !trimmed.includes(";") ? trimmed : "";
}
function extractKimiJwt(rawValue) {
    return extractKimiAccessToken(rawValue);
}
function normalizeSessionCookieHeaders(rawValues, defaultCookieName) {
    const seen = new Set();
    const normalizedHeaders = [];
    for (const rawValue of rawValues){
        if (typeof rawValue !== "string") continue;
        const normalized = normalizeSessionCookieHeader(rawValue, defaultCookieName);
        if (!normalized || seen.has(normalized)) continue;
        seen.add(normalized);
        normalizedHeaders.push(normalized);
    }
    return normalizedHeaders;
}
}),
"[project]/src/lib/providers/validation/webProvidersA.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

// Web-cookie provider key validators (part A): deepseek-web, qwen-web, grok-web, chatgpt-web,
// perplexity-web, blackbox-web. Extracted from validation.ts (god-file decomposition) — top-level
// functions with no dispatcher-state captures; behavior is byte-identical to the original inline defs.
__turbopack_context__.s([
    "isGrokAntiBotBlock",
    ()=>isGrokAntiBotBlock,
    "validateBlackboxWebProvider",
    ()=>validateBlackboxWebProvider,
    "validateChatGptWebProvider",
    ()=>validateChatGptWebProvider,
    "validateDeepSeekWebProvider",
    ()=>validateDeepSeekWebProvider,
    "validateGrokWebProvider",
    ()=>validateGrokWebProvider,
    "validateKimiWebProvider",
    ()=>validateKimiWebProvider,
    "validatePerplexityWebProvider",
    ()=>validatePerplexityWebProvider,
    "validateQwenWebProvider",
    ()=>validateQwenWebProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/webCookieAuth.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function validateKimiWebProvider({ apiKey }) {
    const rawCred = String(apiKey ?? "").trim();
    if (!rawCred) {
        return {
            valid: false,
            error: "Missing Kimi access_token from www.kimi.com localStorage"
        };
    }
    const accessToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["extractKimiAccessToken"])(rawCred);
    if (!accessToken) {
        return {
            valid: false,
            error: "Could not find a Kimi access_token. Re-login at https://www.kimi.com and copy it from localStorage."
        };
    }
    try {
        const resp = await fetch("https://www.kimi.com/api/user", {
            headers: {
                Accept: "application/json, text/plain, */*",
                Authorization: `Bearer ${accessToken}`,
                Origin: "https://www.kimi.com",
                Referer: "https://www.kimi.com/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
            }
        });
        if (resp.status === 401 || resp.status === 403) {
            return {
                valid: false,
                error: "Kimi session is invalid or expired — re-login at https://www.kimi.com and paste a fresh access_token"
            };
        }
        if (!resp.ok) {
            return {
                valid: false,
                error: `Kimi returned HTTP ${resp.status}`
            };
        }
        // Profile response: `{ id, name, email, region, ... }` at the top level.
        try {
            const data = await resp.json();
            if (!data?.id) {
                return {
                    valid: false,
                    error: "Kimi session token is invalid or expired — re-login at https://www.kimi.com and paste a fresh access_token"
                };
            }
        } catch  {
            return {
                valid: false,
                error: "Kimi returned invalid JSON response"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateDeepSeekWebProvider({ apiKey }) {
    if (!apiKey) {
        return {
            valid: false,
            error: "Missing userToken — paste the value from DevTools → Application → Local Storage → chat.deepseek.com → userToken"
        };
    }
    let token = apiKey;
    try {
        const parsed = JSON.parse(token);
        if (typeof parsed?.value === "string") token = parsed.value;
    } catch  {
    // not JSON, use as-is
    }
    try {
        const resp = await fetch("https://chat.deepseek.com/api/v0/users/current", {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "*/*",
                Origin: "https://chat.deepseek.com",
                Referer: "https://chat.deepseek.com/",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
                // Match the current chat.deepseek.com web client (v2.0.0): the legacy
                // X-App-Version build stamp was dropped, X-Client-Bundle-Id was added.
                // Keep aligned with FAKE_HEADERS in open-sse/executors/deepseek-web.ts.
                "X-Client-Bundle-Id": "com.deepseek.chat",
                "X-Client-Platform": "web",
                "X-Client-Version": "2.0.0"
            }
        });
        if (resp.status === 401 || resp.status === 403) {
            return {
                valid: false,
                error: "userToken is invalid or expired — get a fresh one from localStorage"
            };
        }
        if (!resp.ok) {
            return {
                valid: false,
                error: `DeepSeek returned HTTP ${resp.status}`
            };
        }
        const json = await resp.json();
        const bizData = json?.data?.biz_data || json?.biz_data;
        if (!bizData?.token) {
            return {
                valid: false,
                error: `DeepSeek did not return an access token: ${json?.msg || "unknown error"}`
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateQwenWebProvider({ apiKey }) {
    const rawCred = String(apiKey ?? "").trim();
    if (!rawCred) {
        return {
            valid: false,
            error: "Missing Qwen session — paste the full chat.qwen.ai Cookie header (must include token, cna and ssxmod_itna)"
        };
    }
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["extractQwenToken"])(rawCred);
    const cookieHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildQwenCookieHeader"])(rawCred);
    if (!token && !cookieHeader) {
        return {
            valid: false,
            error: "Could not find a Qwen token/cookie in the pasted value"
        };
    }
    try {
        const headers = {
            Accept: "*/*",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
            Origin: "https://chat.qwen.ai",
            Referer: "https://chat.qwen.ai/",
            source: "web",
            "bx-v": "2.5.36",
            // The Qwen SPA's `version` header is required by the v2 chat completion
            // endpoint; the validator sends it too so the probe matches a real
            // browser request as closely as possible. (The session probe endpoint
            // doesn't enforce it, but consistency with the executor avoids surprises
            // if Qwen ever tightens its WAF rules.)
            version: "0.2.66"
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        if (cookieHeader) headers["Cookie"] = cookieHeader;
        // The trailing slash is significant: `/api/v1/auths` (no slash) answers 401,
        // `/api/v1/auths/` returns the user profile.
        const resp = await fetch("https://chat.qwen.ai/api/v1/auths/", {
            headers
        });
        const contentType = resp.headers.get("content-type") || "";
        if (resp.status === 401 || resp.status === 403) {
            return {
                valid: false,
                error: "Qwen session is invalid or expired — re-login at https://chat.qwen.ai and paste a fresh full Cookie header"
            };
        }
        // Alibaba's WAF / retired-v1 gateway answers with an HTML challenge page (or 504)
        // instead of JSON. A bearer token alone is no longer enough for the v2 endpoint.
        if (contentType.includes("text/html") || resp.status === 504) {
            return {
                valid: false,
                error: "Qwen blocked the request with its anti-bot WAF. Re-login at https://chat.qwen.ai and paste a fresh full Cookie header (must include cna, ssxmod_itna and token) — a bearer token alone is not accepted."
            };
        }
        if (!resp.ok) {
            return {
                valid: false,
                error: `Qwen returned HTTP ${resp.status}`
            };
        }
        // Parse JSON response and verify we have a real user object.
        // /api/v1/auths/ returns the user at the top level: {id, email, name, role, ...}.
        // We require `id` to be a non-empty string AND look like a real identifier
        // (uuid-ish or otherwise ≥8 chars) to avoid false-positives from upstream
        // error envelopes that happen to ship a top-level `id: "not_found"` style
        // field. Keep the legacy nested checks (data.user, user) for robustness in
        // case the upstream shape changes again.
        try {
            const data = await resp.json();
            const hasTopLevelUser = typeof data?.id === "string" && data.id.length >= 8 && typeof data?.email === "string";
            const hasNestedUser = typeof data?.user?.id === "string" && data.user.id.length > 0 || typeof data?.data?.user?.id === "string" && data.data.user.id.length > 0;
            if (!hasTopLevelUser && !hasNestedUser) {
                return {
                    valid: false,
                    error: "Qwen session token is invalid or expired — re-login at https://chat.qwen.ai and paste a fresh full Cookie header"
                };
            }
        } catch (parseError) {
            return {
                valid: false,
                error: "Qwen returned invalid JSON response"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
function isGrokAntiBotBlock(body) {
    const text = (body || "").trim();
    if (!text) return true; // empty 403 body — pre-auth block, treat as anti-bot
    if (/anti-bot|forbidden|access denied|blocked|rate.?limit/i.test(text)) return true;
    // A structured upstream API error has a parseable JSON `error.message`; if one
    // is present this is a real upstream error, not an anti-bot block.
    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed?.error?.message === "string") return false;
    } catch  {
        // Non-JSON 403 body with no recognizable structure → treat as anti-bot block.
        return true;
    }
    return false;
}
// Shared IP-reputation / anti-bot guidance (#3474, #5350). The request was rejected
// before (or independently of) auth — the cookie itself is likely fine. cf_clearance
// is pinned to the IP + TLS fingerprint + User-Agent that earned it and cannot be
// replayed from a different machine/IP, so an auth-shaped rejection after a
// cf_clearance was supplied is almost always this block, not a bad cookie.
const GROK_IP_REPUTATION_GUIDANCE = "Your sso cookie is likely fine — this is an IP-reputation block on the request, not an " + "auth failure. cf_clearance is pinned to the IP + TLS fingerprint + User-Agent that earned " + "it and cannot be replayed from a different machine/IP. Retry from a residential IP or " + "configure a proxy for grok-web.";
async function validateGrokWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["extractCookieValue"])(apiKey, "sso");
        if (!token) {
            return {
                valid: false,
                error: "Missing sso cookie — paste the value (or the full grok.com cookie line)"
            };
        }
        // Use the TLS-impersonating client — Cloudflare on grok.com pins
        // cf_clearance to JA3/JA4 + HTTP/2 SETTINGS, so plain Node fetch always
        // gets "Request rejected by anti-bot rules." regardless of cookies (#3180).
        const { tlsFetchGrok, TlsClientUnavailableError, isCloudflareChallenge } = await __turbopack_context__.A("[project]/open-sse/services/grokTlsClient.ts [middleware] (ecmascript, async loader)");
        // Generate the same Cloudflare-bypass headers the GrokWebExecutor uses.
        const randomHex = (n)=>{
            const a = new Uint8Array(n);
            crypto.getRandomValues(a);
            return Array.from(a, (b)=>b.toString(16).padStart(2, "0")).join("");
        };
        const statsigMsg = `e:TypeError: Cannot read properties of null (reading 'children')`;
        const traceId = randomHex(16);
        const spanId = randomHex(8);
        let response;
        try {
            response = await tlsFetchGrok("https://grok.com/rest/app-chat/conversations/new", {
                method: "POST",
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                    Accept: "*/*",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Accept-Language": "en-US,en;q=0.9",
                    Baggage: "sentry-environment=production,sentry-release=d6add6fb0460641fd482d767a335ef72b9b6abb8,sentry-public_key=b311e0f2690c81f25e2c4cf6d4f7ce1c",
                    "Cache-Control": "no-cache",
                    "Content-Type": "application/json",
                    Cookie: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildGrokCookieHeader"])(apiKey),
                    Origin: "https://grok.com",
                    Pragma: "no-cache",
                    Referer: "https://grok.com/",
                    "Sec-Ch-Ua": '"Google Chrome";v="149", "Chromium";v="149", "Not(A:Brand";v="24"',
                    "Sec-Ch-Ua-Mobile": "?0",
                    "Sec-Ch-Ua-Platform": '"macOS"',
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
                    "x-statsig-id": btoa(statsigMsg),
                    "x-xai-request-id": crypto.randomUUID(),
                    traceparent: `00-${traceId}-${spanId}-00`
                }, providerSpecificData),
                body: JSON.stringify({
                    temporary: true,
                    modeId: "fast",
                    message: "test",
                    fileAttachments: [],
                    imageAttachments: [],
                    disableSearch: true,
                    enableImageGeneration: false,
                    returnImageBytes: false,
                    returnRawGrokInXaiRequest: false,
                    enableImageStreaming: false,
                    imageGenerationCount: 0,
                    forceConcise: true,
                    toolOverrides: {},
                    enableSideBySide: false,
                    sendFinalMetadata: false,
                    isReasoning: false,
                    disableTextFollowUps: true,
                    disableMemory: true,
                    forceSideBySide: false,
                    isAsyncChat: false,
                    disableSelfHarmShortCircuit: false
                }),
                timeoutMs: 15_000
            });
        } catch (err) {
            if (err instanceof TlsClientUnavailableError) {
                return {
                    valid: false,
                    error: `TLS impersonation client unavailable: ${err.message}`
                };
            }
            throw err;
        }
        let errorDetail = "";
        try {
            errorDetail = (response.text || "").slice(0, 240);
        } catch  {}
        // Detect Cloudflare challenge pages even with a 200 status from tls-client-node
        if (isCloudflareChallenge(errorDetail)) {
            return {
                valid: false,
                error: "Grok validation blocked by Cloudflare anti-bot. Try a residential IP or proxy."
            };
        }
        if (response.status >= 200 && response.status < 300) {
            return {
                valid: true,
                error: null
            };
        }
        // Did the user actually supply a cf_clearance cookie? Detect it from the raw
        // input blob via a real cookie-pair match — NOT extractCookieValue, which
        // returns the whole bare value for any name when the input has no ";" (#5350).
        const suppliedCfClearance = /(?:^|;\s*)cf_clearance=[^;\s]+/.test(String(apiKey || ""));
        if (response.status === 401) {
            // With a cf_clearance supplied, a 401 is almost always an IP-reputation block
            // (the clearance can't be replayed from a different machine), not a bad cookie.
            if (suppliedCfClearance) {
                return {
                    valid: false,
                    error: `Grok returned 401. ${GROK_IP_REPUTATION_GUIDANCE}`
                };
            }
            return {
                valid: false,
                error: "Invalid SSO cookie — re-paste from grok.com DevTools → Cookies → sso"
            };
        }
        if (response.status === 403) {
            // Grok uses 403 for auth failures, entitlement issues, geo blocks,
            // anti-bot/IP-reputation rejections, and resource errors. Classify before
            // messaging — a misleading "invalid cookie" verdict on an IP-reputation
            // block (issue #3474) sends users chasing a cookie that is actually fine.
            //
            // 1. Auth-shaped → the cookie/session is the problem; re-paste it. But when a
            //    cf_clearance was supplied, this is almost always an IP-reputation block the
            //    edge surfaced as an auth failure — the clearance can't be replayed from a
            //    different machine, so re-pasting the cookie will not help (#5350).
            if (/invalid-credentials|unauthenticated|unauthorized/i.test(errorDetail)) {
                if (suppliedCfClearance) {
                    return {
                        valid: false,
                        error: `Grok returned 403. ${GROK_IP_REPUTATION_GUIDANCE}`
                    };
                }
                return {
                    valid: false,
                    error: "Invalid SSO cookie — re-paste from grok.com DevTools → Cookies → sso"
                };
            }
            // 2. Anti-bot / Cloudflare / IP-reputation block → the cookie is likely
            //    fine; the request was rejected before auth was even evaluated. This is
            //    not code-fixable: the datacenter/VPS IP is flagged. A Cloudflare
            //    challenge body, Grok's "anti-bot rules" rejection, or a bare/non-JSON
            //    forbidden body (no structured upstream `error.message`) all map here.
            if (isCloudflareChallenge(errorDetail) || isGrokAntiBotBlock(errorDetail)) {
                return {
                    valid: false,
                    error: `Grok returned 403 (anti-bot/Cloudflare block). ${GROK_IP_REPUTATION_GUIDANCE}`
                };
            }
            // 3. Structured upstream error (e.g. probe model renamed) → surface the body
            //    so the user/maintainer sees the real cause instead of a wrong verdict.
            return {
                valid: false,
                error: `Grok rejected validation (403)${errorDetail ? `: ${errorDetail.slice(0, 160)}` : ""}`
            };
        }
        if (response.status === 429) {
            return {
                valid: false,
                error: "Grok rate limited during validation (429)"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Grok unavailable (${response.status})`
            };
        }
        return {
            valid: false,
            error: `Grok validation failed (${response.status})${errorDetail ? `: ${errorDetail}` : ""}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateChatGptWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        // Accept bare value, unchunked cookie, chunked (.0/.1) cookies, or full
        // "Cookie: ..." DevTools line. Pass through verbatim once recognised.
        let cookieHeader = String(apiKey || "").trim();
        if (/^cookie\s*:\s*/i.test(cookieHeader)) {
            cookieHeader = cookieHeader.replace(/^cookie\s*:\s*/i, "");
        }
        if (!/__Secure-next-auth\.session-token(?:\.\d+)?\s*=/.test(cookieHeader)) {
            cookieHeader = `__Secure-next-auth.session-token=${cookieHeader}`;
        }
        // Use the TLS-impersonating client — Cloudflare on chatgpt.com pins
        // cf_clearance to JA3/JA4 + HTTP/2 SETTINGS, so plain Node fetch always
        // gets cf-mitigated: challenge regardless of cookies.
        const { tlsFetchChatGpt, TlsClientUnavailableError } = await __turbopack_context__.A("[project]/open-sse/services/chatgptTlsClient.ts [middleware] (ecmascript, async loader)");
        let response;
        try {
            response = await tlsFetchChatGpt("https://chatgpt.com/api/auth/session", {
                method: "GET",
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                    Accept: "application/json",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Cache-Control": "no-cache",
                    Cookie: cookieHeader,
                    Origin: "https://chatgpt.com",
                    Pragma: "no-cache",
                    Referer: "https://chatgpt.com/",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:152.0) Gecko/20100101 Firefox/152.0"
                }, providerSpecificData),
                timeoutMs: 30_000
            });
        } catch (err) {
            if (err instanceof TlsClientUnavailableError) {
                return {
                    valid: false,
                    error: `${err.message} (chatgpt-web requires this — without it, Cloudflare blocks every request)`
                };
            }
            throw err;
        }
        const contentType = response.headers.get("content-type") || "";
        const cfRay = response.headers.get("cf-ray");
        const cfMitigated = response.headers.get("cf-mitigated");
        if (response.status === 401 || response.status === 403) {
            const bodyText = response.text || "";
            if (cfMitigated || /just a moment|cloudflare|cf-chl|attention required/i.test(bodyText)) {
                return {
                    valid: false,
                    error: "Cloudflare blocked the validator — open chatgpt.com in your browser, then copy the FULL Cookie line from DevTools (Network → request → Cookie) including cf_clearance, __cf_bm, _cfuvid, and the session-token chunks."
                };
            }
            return {
                valid: false,
                error: "Invalid ChatGPT session cookie — re-paste __Secure-next-auth.session-token from chatgpt.com DevTools → Cookies"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `ChatGPT unavailable (${response.status})`
            };
        }
        if (response.status >= 400) {
            return {
                valid: false,
                error: `Validation failed: ${response.status}`
            };
        }
        if (!contentType.includes("json")) {
            return {
                valid: false,
                error: `ChatGPT returned non-JSON (${contentType || "no content-type"}${cfRay ? `, cf-ray=${cfRay}` : ""}) — paste the FULL Cookie line including cf_clearance, __cf_bm, _cfuvid alongside the session-token chunks.`
            };
        }
        let data = {};
        try {
            data = JSON.parse(response.text || "{}");
        } catch  {
            return {
                valid: false,
                error: "ChatGPT session response was not JSON — paste the FULL Cookie line including cf_clearance and __cf_bm."
            };
        }
        if (!data?.accessToken) {
            return {
                valid: false,
                error: "ChatGPT session expired — log into chatgpt.com and copy a fresh cookie"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validatePerplexityWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        let sessionToken = apiKey;
        let bearerToken = null;
        if (sessionToken.startsWith("__Secure-next-auth.session-token=")) {
            sessionToken = sessionToken.slice("__Secure-next-auth.session-token=".length);
        } else if (/^bearer\s+/i.test(sessionToken)) {
            bearerToken = sessionToken.replace(/^bearer\s+/i, "").trim();
            sessionToken = "";
        }
        const timezone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
        const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
            "Content-Type": "application/json",
            Accept: "text/event-stream",
            Origin: "https://www.perplexity.ai",
            Referer: "https://www.perplexity.ai/",
            // Firefox 148 — must match the firefox_148 TLS profile of perplexityTlsClient (issue #2459).
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:152.0) Gecko/20100101 Firefox/152.0",
            "X-App-ApiClient": "default",
            "X-App-ApiVersion": "client-1.11.0",
            ...bearerToken ? {
                Authorization: `Bearer ${bearerToken}`
            } : sessionToken ? {
                Cookie: `__Secure-next-auth.session-token=${sessionToken}`
            } : {}
        }, providerSpecificData);
        // Perplexity is behind Cloudflare Enterprise which pins JA3/JA4 to a real
        // browser handshake — plain fetch is challenged with a 403 page from
        // VPS/datacenter IPs even with a valid cookie. Use the Firefox-fingerprinted
        // TLS client so the validator's verdict reflects the cookie, not the IP (issue #2459).
        const { tlsFetchPerplexity, isCloudflareChallenge, TlsClientUnavailableError } = await __turbopack_context__.A("[project]/open-sse/services/perplexityTlsClient.ts [middleware] (ecmascript, async loader)");
        let response;
        try {
            response = await tlsFetchPerplexity("https://www.perplexity.ai/rest/sse/perplexity_ask", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    query_str: "test",
                    params: {
                        query_str: "test",
                        search_focus: "internet",
                        mode: "concise",
                        model_preference: "default",
                        sources: [
                            "web"
                        ],
                        attachments: [],
                        frontend_uuid: crypto.randomUUID(),
                        frontend_context_uuid: crypto.randomUUID(),
                        version: "client-1.11.0",
                        language: "en-US",
                        timezone,
                        search_recency_filter: null,
                        is_incognito: true,
                        use_schematized_api: true,
                        last_backend_uuid: null
                    }
                }),
                timeoutMs: 30_000
            });
        } catch (err) {
            if (err instanceof TlsClientUnavailableError) {
                return {
                    valid: false,
                    error: `${err.message} perplexity-web requires it — without it Cloudflare blocks every request.`
                };
            }
            throw err;
        }
        if (response.status === 401 || response.status === 403) {
            if (isCloudflareChallenge(response.text)) {
                return {
                    valid: false,
                    error: "Cloudflare is blocking connections from this server's IP (TLS fingerprint rejected). " + "The session cookie may still be valid — install tls-client-node's native binary or route " + "perplexity-web through a residential proxy."
                };
            }
            return {
                valid: false,
                error: "Invalid Perplexity session cookie — re-paste __Secure-next-auth.session-token from perplexity.ai"
            };
        }
        if (response.status === 200 || response.status >= 400 && response.status < 500) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Perplexity unavailable (${response.status})`
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateBlackboxWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const cookieHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeSessionCookieHeader"])(apiKey, "next-auth.session-token");
        const sessionHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
            Accept: "application/json",
            Cookie: cookieHeader,
            Origin: "https://app.blackbox.ai",
            Referer: "https://app.blackbox.ai/",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
        }, providerSpecificData);
        const sessionResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])("https://app.blackbox.ai/api/auth/session", {
            method: "GET",
            headers: sessionHeaders
        });
        const sessionText = await sessionResponse.text();
        const sessionPayload = sessionText ? JSON.parse(sessionText) : null;
        const userEmail = sessionPayload?.user?.email;
        if (!sessionResponse.ok || !userEmail) {
            return {
                valid: false,
                error: "Invalid Blackbox session cookie — re-paste __Secure-authjs.session-token from app.blackbox.ai"
            };
        }
        const subscriptionHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
            "Content-Type": "application/json",
            Accept: "application/json",
            Cookie: cookieHeader,
            Origin: "https://app.blackbox.ai",
            Referer: "https://app.blackbox.ai/",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
        }, providerSpecificData);
        const subscriptionResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])("https://app.blackbox.ai/api/check-subscription", {
            method: "POST",
            headers: subscriptionHeaders,
            body: JSON.stringify({
                email: userEmail
            })
        });
        const subscriptionText = await subscriptionResponse.text();
        const subscriptionPayload = subscriptionText ? JSON.parse(subscriptionText) : null;
        const explicitActive = subscriptionPayload?.hasActiveSubscription === true || subscriptionPayload?.isTrialSubscription === true || subscriptionPayload?.status === "PREMIUM";
        const explicitInactive = subscriptionPayload?.hasActiveSubscription === false || subscriptionPayload?.status === "FREE";
        const requiresAuthentication = subscriptionPayload?.requiresAuthentication === true || /login is required/i.test(subscriptionText || "");
        if (subscriptionResponse.status === 401 || subscriptionResponse.status === 403) {
            return {
                valid: false,
                error: "Invalid Blackbox session cookie — re-paste __Secure-authjs.session-token from app.blackbox.ai"
            };
        }
        if (requiresAuthentication) {
            return {
                valid: false,
                error: "Blackbox session expired — re-paste __Secure-authjs.session-token from app.blackbox.ai"
            };
        }
        if (subscriptionResponse.ok && explicitActive) {
            return {
                valid: true,
                error: null
            };
        }
        if (subscriptionResponse.ok && explicitInactive || subscriptionPayload?.previouslySubscribed) {
            return {
                valid: false,
                error: "Blackbox account authenticated, but no active paid subscription was detected for premium web models."
            };
        }
        if (subscriptionResponse.ok) {
            return {
                valid: true,
                error: null
            };
        }
        if (subscriptionResponse.status >= 500) {
            return {
                valid: false,
                error: `Blackbox unavailable (${subscriptionResponse.status})`
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${subscriptionResponse.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/cloudAgent/julesApi.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Jules REST API base — https://developers.google.com/jules/api */ __turbopack_context__.s([
    "JULES_API_BASE_URL",
    ()=>JULES_API_BASE_URL,
    "buildJulesApiUrl",
    ()=>buildJulesApiUrl
]);
const JULES_API_BASE_URL = "https://jules.googleapis.com/v1alpha";
function buildJulesApiUrl(path) {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${JULES_API_BASE_URL}${normalized}`;
}
}),
"[project]/src/lib/providers/validation/metaAi.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Meta AI persisted-query request builder + base62/ID generators, extracted from validation.ts
// (god-file decomposition). Self-contained: uses only global crypto / Date / Math / Intl. The
// muse-spark-web validator (validation/webProvidersB.ts) consumes buildMetaAiValidationBody + the
// META_AI_* request consts. Behavior is byte-identical to the original inline defs.
__turbopack_context__.s([
    "META_AI_ASBD_ID",
    ()=>META_AI_ASBD_ID,
    "META_AI_BASE62_ALPHABET",
    ()=>META_AI_BASE62_ALPHABET,
    "META_AI_FRIENDLY_NAME",
    ()=>META_AI_FRIENDLY_NAME,
    "META_AI_REQUEST_ANALYTICS_TAGS",
    ()=>META_AI_REQUEST_ANALYTICS_TAGS,
    "META_AI_SEND_MESSAGE_DOC_ID",
    ()=>META_AI_SEND_MESSAGE_DOC_ID,
    "META_AI_USER_AGENT",
    ()=>META_AI_USER_AGENT,
    "buildMetaAiValidationBody",
    ()=>buildMetaAiValidationBody,
    "decodeMetaAiBase62",
    ()=>decodeMetaAiBase62,
    "encodeMetaAiBase62",
    ()=>encodeMetaAiBase62,
    "generateMetaAiConversationId",
    ()=>generateMetaAiConversationId,
    "generateMetaAiEventId",
    ()=>generateMetaAiEventId,
    "generateMetaAiNumericMessageId",
    ()=>generateMetaAiNumericMessageId,
    "randomMetaAiBigInt",
    ()=>randomMetaAiBigInt
]);
const META_AI_SEND_MESSAGE_DOC_ID = "29ae946c82d1f301196c6ca2226400b5";
const META_AI_FRIENDLY_NAME = "useEctoSendMessageSubscription";
const META_AI_REQUEST_ANALYTICS_TAGS = "graphservice";
const META_AI_ASBD_ID = "129477";
const META_AI_USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";
const META_AI_BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function encodeMetaAiBase62(value, padLength) {
    let remaining = value;
    let encoded = "";
    while(remaining > 0n){
        encoded = META_AI_BASE62_ALPHABET[Number(remaining % 62n)] + encoded;
        remaining /= 62n;
    }
    return encoded.padStart(padLength, "0");
}
function decodeMetaAiBase62(value) {
    let decoded = 0n;
    for (const char of value){
        const index = META_AI_BASE62_ALPHABET.indexOf(char);
        if (index < 0) {
            throw new Error(`Invalid Meta AI base62 character: ${char}`);
        }
        decoded = decoded * 62n + BigInt(index);
    }
    return decoded;
}
function randomMetaAiBigInt(byteLength) {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    let result = 0n;
    for (const byte of bytes){
        result = result << 8n | BigInt(byte);
    }
    return result;
}
function generateMetaAiConversationId() {
    const timestamp = BigInt(Date.now()) & (1n << 44n) - 1n;
    const random = randomMetaAiBigInt(8) & (1n << 64n) - 1n;
    return `c.${encodeMetaAiBase62(timestamp << 64n | random, 19)}`;
}
function generateMetaAiEventId(conversationId) {
    if (!conversationId.startsWith("c.")) {
        return null;
    }
    try {
        const packedConversation = decodeMetaAiBase62(conversationId.slice(2));
        const conversationRandom = packedConversation & (1n << 64n) - 1n;
        const timestamp = BigInt(Date.now()) & (1n << 44n) - 1n;
        const eventRandom = randomMetaAiBigInt(4) & (1n << 32n) - 1n;
        return `e.${encodeMetaAiBase62(timestamp << 64n + 32n | conversationRandom << 32n | eventRandom, 25)}`;
    } catch  {
        return null;
    }
}
function generateMetaAiNumericMessageId() {
    return (BigInt(Date.now()) * 1000n + BigInt(Math.floor(Math.random() * 1000)) + (randomMetaAiBigInt(2) & 0xfffn)).toString();
}
function buildMetaAiValidationBody() {
    const conversationId = generateMetaAiConversationId();
    return {
        doc_id: META_AI_SEND_MESSAGE_DOC_ID,
        variables: {
            assistantMessageId: crypto.randomUUID(),
            attachments: null,
            clientLatitude: null,
            clientLongitude: null,
            clientTimezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
            clippyIp: null,
            content: "test",
            conversationId,
            conversationStarterId: null,
            currentBranchPath: "0",
            developerOverridesForMessage: null,
            devicePixelRatio: 1,
            entryPoint: "KADABRA__CHAT__UNIFIED_INPUT_BAR",
            imagineOperationRequest: null,
            isNewConversation: true,
            mentions: null,
            mode: "mode_fast",
            promptEditType: null,
            promptSessionId: crypto.randomUUID(),
            promptType: null,
            qplJoinId: null,
            requestedToolCall: null,
            // See muse-spark-web executor: RewriteOptionsInput was removed from
            // Meta's schema; sending `rewriteOptions` (even null) breaks the
            // persisted-query validation. Omit the field.
            turnId: crypto.randomUUID(),
            userAgent: META_AI_USER_AGENT,
            userEventId: generateMetaAiEventId(conversationId),
            userLocale: "en_US",
            userMessageId: crypto.randomUUID(),
            userUniqueMessageId: generateMetaAiNumericMessageId()
        }
    };
}
}),
"[project]/src/lib/providers/validation/webProvidersB.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "extractM365CredentialParts",
    ()=>extractM365CredentialParts,
    "validateAdaptaWebProvider",
    ()=>validateAdaptaWebProvider,
    "validateClaudeWebProvider",
    ()=>validateClaudeWebProvider,
    "validateCopilotM365WebProvider",
    ()=>validateCopilotM365WebProvider,
    "validateCopilotWebProvider",
    ()=>validateCopilotWebProvider,
    "validateDevinCloudAgentProvider",
    ()=>validateDevinCloudAgentProvider,
    "validateGeminiWebProvider",
    ()=>validateGeminiWebProvider,
    "validateInnerAiProvider",
    ()=>validateInnerAiProvider,
    "validateJulesProvider",
    ()=>validateJulesProvider,
    "validateMuseSparkWebProvider",
    ()=>validateMuseSparkWebProvider,
    "validateNotionWebProvider",
    ()=>validateNotionWebProvider,
    "validateT3WebProvider",
    ()=>validateT3WebProvider
]);
// Web-cookie provider key validators (part B): muse-spark-web, adapta-web, claude-web, gemini-web,
// copilot-web, t3-web, jules, devin (cloud-agent), inner-ai. Extracted from validation.ts (god-file
// decomposition) — top-level functions with no dispatcher-state captures; behavior is byte-identical
// to the inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/safeOutboundFetch.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/webCookieAuth.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudAgent$2f$julesApi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cloudAgent/julesApi.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$metaAi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/metaAi.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
async function validateMuseSparkWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const cookieHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeSessionCookieHeader"])(apiKey, "ecto_1_sess");
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])("https://www.meta.ai/api/graphql", {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                "Content-Type": "application/json",
                Accept: "text/event-stream",
                "Accept-Language": "en-US,en;q=0.9",
                Cookie: cookieHeader,
                Origin: "https://www.meta.ai",
                Referer: "https://www.meta.ai/",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "User-Agent": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$metaAi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["META_AI_USER_AGENT"],
                "X-ASBD-ID": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$metaAi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["META_AI_ASBD_ID"],
                "X-FB-Friendly-Name": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$metaAi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["META_AI_FRIENDLY_NAME"],
                "X-FB-Request-Analytics-Tags": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$metaAi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["META_AI_REQUEST_ANALYTICS_TAGS"]
            }, providerSpecificData),
            body: JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$metaAi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildMetaAiValidationBody"])())
        });
        const responseText = await response.text();
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid Meta AI session cookie — re-paste ecto_1_sess from meta.ai"
            };
        }
        if (/authentication required to send messages|login is required|sign in/i.test(responseText)) {
            return {
                valid: false,
                error: "Invalid Meta AI session cookie — re-paste ecto_1_sess from meta.ai"
            };
        }
        if (response.status === 429 || /limit exceeded|rate limit|too many requests/i.test(responseText)) {
            return {
                valid: false,
                error: "Meta AI rate limited (429) — wait before retrying"
            };
        }
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Meta AI unavailable (${response.status})`
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateAdaptaWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const raw = typeof apiKey === "string" ? apiKey.trim() : "";
        if (!raw) return {
            valid: false,
            error: "Paste your __client cookie from .clerk.agent.adapta.one"
        };
        const eqIdx = raw.indexOf("=");
        const clientJwt = eqIdx > 0 && !raw.startsWith("eyJ") ? raw.slice(eqIdx + 1).trim() : raw;
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])("https://clerk.agent.adapta.one/v1/client", {
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Cookie: `__client=${clientJwt}`,
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
                Origin: "https://agent.adapta.one"
            }, providerSpecificData)
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid or expired __client cookie — re-paste from .clerk.agent.adapta.one"
            };
        }
        if (!response.ok) {
            return {
                valid: false,
                error: `Adapta Clerk returned HTTP ${response.status}`
            };
        }
        const body = await response.json().catch(()=>null);
        const sessions = body?.response?.sessions ?? [];
        const hasActive = sessions.some((s)=>s.status === "active");
        if (!hasActive) {
            return {
                valid: false,
                error: "No active Adapta session — your __client cookie may be expired"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateClaudeWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const cookieHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$webCookieAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeSessionCookieHeader"])(String(apiKey || ""), "sessionKey");
        if (!cookieHeader) {
            return {
                valid: false,
                error: "Paste your sessionKey cookie from claude.ai"
            };
        }
        const { tlsFetchClaude, TlsClientUnavailableError } = await __turbopack_context__.A("[project]/open-sse/services/claudeTlsClient.ts [middleware] (ecmascript, async loader)");
        let response;
        try {
            response = await tlsFetchClaude("https://claude.ai/api/organizations", {
                method: "GET",
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                    Accept: "application/json",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Cache-Control": "no-cache",
                    Cookie: cookieHeader,
                    Origin: "https://claude.ai",
                    Pragma: "no-cache",
                    Referer: "https://claude.ai/new",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
                    "anthropic-client-platform": "web_claude_ai"
                }, providerSpecificData),
                timeoutMs: 30_000
            });
        } catch (err) {
            if (err instanceof TlsClientUnavailableError) {
                return {
                    valid: false,
                    error: `${err.message} (claude-web requires this — without it, Cloudflare blocks every request)`
                };
            }
            throw err;
        }
        if (response.status === 200) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid or expired session cookie — re-paste sessionKey from claude.ai DevTools → Cookies"
            };
        }
        if (response.status === 429) {
            return {
                valid: false,
                error: "Claude Web API rate limited (429) — wait before retrying"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Claude.ai unavailable (${response.status})`
            };
        }
        return {
            valid: false,
            error: `Claude.ai validation failed (${response.status})`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateGeminiWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const raw = String(apiKey || "").trim();
        if (!raw) {
            return {
                valid: false,
                error: "Paste your __Secure-1PSID cookie from gemini.google.com"
            };
        }
        // Accept full cookie blob or bare value
        let cookieHeader = raw;
        if (!raw.includes("=")) {
            cookieHeader = `__Secure-1PSID=${raw}`;
        }
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])("https://gemini.google.com/app", {
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Accept: "text/html,application/xhtml+xml",
                Cookie: cookieHeader,
                Origin: "https://gemini.google.com",
                Referer: "https://gemini.google.com/"
            }, providerSpecificData)
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid or expired __Secure-1PSID cookie — re-paste from gemini.google.com DevTools → Cookies"
            };
        }
        // 200/302 = valid, anything < 500 that isn't auth failure is acceptable
        if (response.status < 500) {
            return {
                valid: true,
                error: null
            };
        }
        return {
            valid: false,
            error: `Gemini validation failed (${response.status})`
        };
    } catch (error) {
        // #7859: gemini.google.com/app answers EVERY session probe (valid or not) with a
        // 302 redirect (typically onward to accounts.google.com). validationRead() uses the
        // no-redirect preset, so safeOutboundFetch throws REDIRECT_BLOCKED before the
        // "200/302 = valid" status check above ever runs. A redirect to a PUBLIC host means
        // the redirect was never followed (no SSRF) and is exactly what a valid Gemini
        // session looks like here, so treat it as success. A redirect to a private/internal
        // host is a genuine SSRF signal and must stay invalid — isSecurityBlockError()
        // already makes that distinction.
        //
        // #9407: EXPIRED gemini sessions redirect to accounts.google.com/ServiceLogin,
        // which is a PUBLIC redirect (not SSRF) but represents a dead session. Inspect
        // the redirect target to distinguish between:
        //   - accounts.google.com/ServiceLogin — expired session → valid:false
        //   - other accounts.google.com paths — ambiguous, warn but treat as valid
        //   - non-Google redirects (e.g. gemini.google.com redirect loop) — valid
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["SafeOutboundFetchError"] && error.code === "REDIRECT_BLOCKED" && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isSecurityBlockError"])(error)) {
            const location = error.location ?? "";
            if (/accounts\.google\.com\/.*ServiceLogin/i.test(location)) {
                return {
                    valid: false,
                    error: "Session expired — re-paste __Secure-1PSID from gemini.google.com DevTools → Cookies"
                };
            }
            if (/accounts\.google\.com/i.test(location)) {
                return {
                    valid: true,
                    error: null,
                    warning: "Cookie accepted. Full verification requires browser test on first chat."
                };
            }
            return {
                valid: true,
                error: null
            };
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateCopilotWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const raw = String(apiKey || "").trim();
        if (!raw) {
            return {
                valid: false,
                error: "Paste your access_token from copilot.microsoft.com DevTools → Cookies"
            };
        }
        // Extract token — may be bare JWT, cookie string with access_token=, or Bearer prefix
        const { extractAccessToken } = await __turbopack_context__.A("[project]/open-sse/executors/copilot-web.ts [middleware] (ecmascript, async loader)");
        const token = extractAccessToken(raw);
        if (!token) {
            return {
                valid: false,
                error: "Could not extract access_token from input"
            };
        }
        // Probe Copilot's conversation API to verify token
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])("https://copilot.microsoft.com/c/api/conversations?language=en", {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
                Origin: "https://copilot.microsoft.com",
                Referer: "https://copilot.microsoft.com/"
            }, providerSpecificData)
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid or expired access_token — re-paste from copilot.microsoft.com DevTools → Cookies"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Copilot unavailable (${response.status})`
            };
        }
        // 200, 400, 404 etc. all indicate the token was accepted
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
function extractM365CredentialParts(raw, providerSpecificData) {
    const text = raw.trim();
    const parts = {};
    for (const segment of text.split(/[;\n]/)){
        const index = segment.indexOf("=");
        if (index <= 0) continue;
        const key = segment.slice(0, index).trim();
        const value = segment.slice(index + 1).trim();
        if (key && value) parts[key] = value;
    }
    // Accept the current M365 web endpoint (m365.cloud.microsoft, including
    // regional subdomains) plus the two legacy hosts (substrate.office.com,
    // copilot.microsoft.com). The path still carries /m365Copilot/Chathub/<tenant>,
    // so extraction is unchanged. (OmniRoute issue #7078)
    if (/^wss:\/\//i.test(text)) {
        try {
            const url = new URL(text);
            const hostOk = /^(?:[\w-]+\.)*(?:m365\.cloud\.microsoft|copilot\.microsoft\.com|substrate\.office\.com)$/i.test(url.hostname);
            if (hostOk && url.pathname.startsWith("/m365Copilot/Chathub/")) {
                parts.access_token ||= url.searchParams.get("access_token") || "";
                parts.chathubPath ||= decodeURIComponent(url.pathname.split("/m365Copilot/Chathub/")[1] || "");
            }
        } catch  {
        // Fall through to the structured key/value parser result.
        }
    }
    return {
        accessToken: parts.access_token || parts.accessToken || (typeof providerSpecificData.access_token === "string" ? providerSpecificData.access_token : "") || (typeof providerSpecificData.accessToken === "string" ? providerSpecificData.accessToken : ""),
        chathubPath: parts.chathubPath || parts.userTenant || (typeof providerSpecificData.chathubPath === "string" ? providerSpecificData.chathubPath : "") || (typeof providerSpecificData.userTenant === "string" ? providerSpecificData.userTenant : "")
    };
}
async function validateCopilotM365WebProvider({ apiKey, providerSpecificData = {} }) {
    const { accessToken, chathubPath } = extractM365CredentialParts(String(apiKey || ""), providerSpecificData);
    if (!accessToken) {
        return {
            valid: false,
            error: "Could not extract access_token from the Microsoft 365 Copilot credential"
        };
    }
    if (!chathubPath || !chathubPath.includes("@")) {
        return {
            valid: false,
            error: "Could not extract the account-specific Chathub path from the credential"
        };
    }
    // The live provider uses a SignalR WebSocket. The generic web-cookie /models
    // probe builds an invalid wss://.../models URL, so validation here confirms
    // the captured credential shape and lets the executor perform the live check.
    return {
        valid: true,
        error: null,
        warning: "Credential format accepted. The session is verified when the provider sends a chat."
    };
}
async function validateT3WebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const raw = String(apiKey || "").trim();
        if (!raw) {
            return {
                valid: false,
                error: "Paste your Cookie header and convex-session-id from t3.chat"
            };
        }
        // The cookie field may contain "cookies=<Cookie header>\nconvexSessionId=<id>"
        // or just the Cookie header value. Try to parse.
        let cookieHeader = raw;
        let convexSessionId = "";
        if (raw.includes("convexSessionId") || raw.includes("convex-session-id")) {
            // Structured format: "cookies=...; convexSessionId=..."
            const parts = raw.split(/[,;\n]/).map((s)=>s.trim());
            const cookieParts = [];
            for (const part of parts){
                if (part.startsWith("convexSessionId=") || part.startsWith("convex-session-id=")) {
                    convexSessionId = part.split("=").slice(1).join("=");
                } else if (part.startsWith("cookies=")) {
                    cookieParts.push(part.slice("cookies=".length));
                } else if (part.includes("=")) {
                    cookieParts.push(part);
                }
            }
            if (cookieParts.length) cookieHeader = cookieParts.join("; ");
        }
        // Build final cookie with convex-session-id if found
        const finalCookie = convexSessionId ? `${cookieHeader}; convex-session-id=${convexSessionId}` : cookieHeader;
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])("https://t3.chat", {
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Accept: "text/html",
                Cookie: finalCookie
            }, providerSpecificData)
        });
        // t3.chat returns 200/302/404 for valid sessions, 5xx for down
        if (response.status >= 500) {
            return {
                valid: false,
                error: `t3.chat unavailable (${response.status})`
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateJulesProvider({ apiKey }) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudAgent$2f$julesApi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildJulesApiUrl"])("/sources"), {
            method: "GET",
            headers: {
                "X-Goog-Api-Key": apiKey
            }
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        const errorText = await response.text().catch(()=>"");
        return {
            valid: false,
            error: errorText.trim() || `Jules API returned ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateDevinCloudAgentProvider({ apiKey }) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])("https://api.devin.ai/v1/sessions?limit=1", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        const errorText = await response.text().catch(()=>"");
        return {
            valid: false,
            error: errorText.trim() || `Devin API returned ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateNotionWebProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const raw = String(apiKey || "").trim();
        if (!raw) {
            return {
                valid: false,
                error: "Paste your token_v2 cookie value from notion.so"
            };
        }
        const cookieHeader = raw.includes("=") ? raw : `token_v2=${raw}`;
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])("https://www.notion.so/api/v3/getSpaces", {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                "Content-Type": "application/json",
                Accept: "application/json",
                Cookie: cookieHeader,
                Origin: "https://www.notion.so",
                Referer: "https://www.notion.so/"
            }, providerSpecificData),
            body: "{}"
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid or expired token_v2 cookie — re-paste from notion.so DevTools → Cookies"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Notion unavailable (${response.status})`
            };
        }
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        return {
            valid: false,
            error: `Notion validation failed (${response.status})`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateInnerAiProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const raw = typeof apiKey === "string" ? apiKey.trim() : "";
        if (!raw) {
            return {
                valid: false,
                error: "Paste your token cookie and email — format: eyJ... user@example.com"
            };
        }
        // Parse token and optional email (format: "TOKEN EMAIL")
        const eqIdx = raw.indexOf("=");
        const stripped = eqIdx > 0 && !raw.startsWith("eyJ") ? raw.slice(eqIdx + 1).trim() : raw;
        const lastSpace = stripped.lastIndexOf(" ");
        let token = stripped;
        let credEmail = "";
        if (lastSpace > 0) {
            const possibleEmail = stripped.slice(lastSpace + 1).trim();
            if (possibleEmail.includes("@")) {
                token = stripped.slice(0, lastSpace).trim();
                credEmail = possibleEmail;
            }
        }
        if (!credEmail) {
            return {
                valid: false,
                error: "Email is required — paste token followed by a space and your email: eyJ... user@example.com"
            };
        }
        // Validate JWT structure (3 parts separated by dots)
        const parts = token.split(".");
        if (parts.length < 3) {
            return {
                valid: false,
                error: "Invalid token format — paste only the token cookie value from .innerai.com (starts with eyJ…)"
            };
        }
        // Decode payload and check expiry
        const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        let payload = {};
        try {
            payload = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
        } catch  {
            return {
                valid: false,
                error: "Could not parse Inner.ai token — re-paste from DevTools"
            };
        }
        if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
            return {
                valid: false,
                error: "Inner.ai token has expired — re-login at app.innerai.com and re-paste the token cookie"
            };
        }
        // Verify the token carries at least one known Inner.ai identity field
        const hasIdentity = payload.device_id ?? payload.deviceId ?? payload["device-id"] ?? payload.did ?? payload.user_id ?? payload.userId ?? payload.sub;
        if (!hasIdentity) {
            return {
                valid: false,
                error: "Token does not look like an Inner.ai session token — re-paste from DevTools → Cookies → .innerai.com"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/directChatProbe.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "validateDirectChatProvider",
    ()=>validateDirectChatProvider
]);
// Generic "POST /chat/completions auth probe" used by several provider validators (command-code,
// nlpcloud + the enterprise-cloud validators). Extracted from validation.ts (god-file decomposition)
// into its own leaf so both the host dispatcher and validation/cloudProviders.ts can share it without
// a cycle. Behavior is byte-identical to the original inline def.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function validateDirectChatProvider({ url, headers, body, providerSpecificData = {}, isLocal = false }) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(url, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])(headers, providerSpecificData),
            body: JSON.stringify(body)
        }, isLocal);
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.ok || response.status === 400 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/gigachatAuth.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getGigachatAccessToken",
    ()=>getGigachatAccessToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const DEFAULT_GIGACHAT_AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
const DEFAULT_GIGACHAT_SCOPE = "GIGACHAT_API_PERS";
const CACHE_SKEW_MS = 60_000;
const tokenCache = new Map();
const inflightRequests = new Map();
function getCacheKey(credentials, authUrl, scope) {
    return `${authUrl}::${scope}::${credentials}`;
}
function isFreshToken(token) {
    if (!token?.accessToken || !token?.expiresAt) return false;
    const expiresAtMs = new Date(token.expiresAt).getTime();
    return Number.isFinite(expiresAtMs) && expiresAtMs - Date.now() > CACHE_SKEW_MS;
}
function normalizeExpiry(rawExpiry) {
    if (typeof rawExpiry === "number" && Number.isFinite(rawExpiry)) {
        return new Date(rawExpiry).toISOString();
    }
    if (typeof rawExpiry === "string" && rawExpiry.trim().length > 0) {
        const numericValue = Number(rawExpiry);
        if (Number.isFinite(numericValue)) {
            return new Date(numericValue).toISOString();
        }
        const dateMs = Date.parse(rawExpiry);
        if (Number.isFinite(dateMs)) {
            return new Date(dateMs).toISOString();
        }
    }
    return new Date(Date.now() + 30 * 60 * 1000).toISOString();
}
async function getGigachatAccessToken(options = {}) {
    const credentials = (options.credentials || "").trim();
    if (!credentials) {
        throw new Error("Missing GigaChat credentials");
    }
    const authUrl = (options.authUrl || DEFAULT_GIGACHAT_AUTH_URL).trim();
    const scope = (options.scope || DEFAULT_GIGACHAT_SCOPE).trim();
    const cacheKey = getCacheKey(credentials, authUrl, scope);
    const cached = tokenCache.get(cacheKey);
    if (isFreshToken(cached)) {
        return cached;
    }
    const inflight = inflightRequests.get(cacheKey);
    if (inflight) {
        return inflight;
    }
    const requestPromise = (async ()=>{
        const response = await fetch(authUrl, {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                RqUID: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])(),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                scope
            }).toString(),
            signal: options.signal
        });
        if (!response.ok) {
            const bodyText = await response.text();
            throw new Error(`GigaChat token request failed: ${response.status} ${bodyText}`.trim());
        }
        const data = await response.json();
        const accessToken = typeof data.tok === "string" ? data.tok : typeof data.access_token === "string" ? data.access_token : "";
        if (!accessToken) {
            throw new Error("GigaChat token response missing access token");
        }
        const token = {
            accessToken,
            expiresAt: normalizeExpiry(data.exp ?? data.expires_at)
        };
        tokenCache.set(cacheKey, token);
        return token;
    })();
    inflightRequests.set(cacheKey, requestPromise);
    try {
        return await requestPromise;
    } finally{
        inflightRequests.delete(cacheKey);
    }
}
}),
"[project]/open-sse/config/azureAi.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AZURE_AI_DEFAULT_BASE_URL",
    ()=>AZURE_AI_DEFAULT_BASE_URL,
    "buildAzureAiChatUrl",
    ()=>buildAzureAiChatUrl,
    "buildAzureAiModelsUrl",
    ()=>buildAzureAiModelsUrl,
    "detectAzureUrlFormat",
    ()=>detectAzureUrlFormat,
    "normalizeAzureAiBaseUrl",
    ()=>normalizeAzureAiBaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/urlSanitize.ts [middleware] (ecmascript)");
;
const AZURE_AI_DEFAULT_BASE_URL = "https://example-resource.services.ai.azure.com/openai/v1";
function normalizeAzureAiBaseUrl(value) {
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(value || AZURE_AI_DEFAULT_BASE_URL);
    if (!normalized) return AZURE_AI_DEFAULT_BASE_URL;
    if (normalized.endsWith("/chat/completions") || normalized.endsWith("/responses") || normalized.endsWith("/models")) {
        return normalized.replace(/\/(?:chat\/completions|responses|models)$/i, "");
    }
    if (normalized.endsWith("/openai/v1") || normalized.endsWith("/v1")) {
        return normalized;
    }
    if (normalized.endsWith("/openai")) {
        return `${normalized}/v1`;
    }
    const parsed = new URL(normalized);
    if (parsed.hostname.endsWith(".services.ai.azure.com") || parsed.hostname.endsWith(".openai.azure.com")) {
        if (!parsed.pathname || parsed.pathname === "/") {
            parsed.pathname = "/openai/v1";
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripTrailingSlashes"])(parsed.toString());
        }
    }
    return normalized;
}
function detectAzureUrlFormat(baseUrl) {
    if (!baseUrl || typeof baseUrl !== "string") return "foundry";
    const trimmed = baseUrl.trim();
    if (!trimmed) return "foundry";
    try {
        const urlStr = trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
        const parsed = new URL(urlStr);
        const host = parsed.hostname.toLowerCase();
        const pathname = parsed.pathname.toLowerCase();
        if (host.endsWith(".services.ai.azure.com")) {
            return "foundry";
        }
        if ((host.endsWith(".openai.azure.com") || host.endsWith(".cognitiveservices.azure.com")) && !pathname.includes("/v1")) {
            return "classic";
        }
        if (pathname.includes("/v1")) {
            return "foundry";
        }
        return "foundry";
    } catch  {
        return "foundry";
    }
}
function buildAzureAiChatUrl(value, apiType = "chat", model, apiVersion = "2024-12-01-preview") {
    const format = detectAzureUrlFormat(value);
    const normalized = normalizeAzureAiBaseUrl(value);
    if (format === "classic" && model) {
        const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripTrailingSlashes"])((value || "").trim()).replace(/\/openai$/i, "").replace(/\/openai\/deployments\/[^/]+\/chat\/completions[^/]*$/i, "");
        return `${raw}/openai/deployments/${encodeURIComponent(model)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
    }
    return `${normalized}/${apiType === "responses" ? "responses" : "chat/completions"}`;
}
function buildAzureAiModelsUrl(value) {
    return `${normalizeAzureAiBaseUrl(value)}/models`;
}
}),
"[project]/open-sse/config/datarobot.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DATAROBOT_DEFAULT_BASE_URL",
    ()=>DATAROBOT_DEFAULT_BASE_URL,
    "buildDataRobotCatalogUrl",
    ()=>buildDataRobotCatalogUrl,
    "buildDataRobotChatUrl",
    ()=>buildDataRobotChatUrl,
    "isDataRobotDeploymentUrl",
    ()=>isDataRobotDeploymentUrl,
    "normalizeDataRobotBaseUrl",
    ()=>normalizeDataRobotBaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/urlSanitize.ts [middleware] (ecmascript)");
;
const DATAROBOT_API_V2_SEGMENT = "/api/v2";
const DATAROBOT_LLMGW_CHAT_PATH = "/genai/llmgw/chat/completions/";
const DATAROBOT_LLMGW_CATALOG_PATH = "/genai/llmgw/catalog/";
const DATAROBOT_DEFAULT_BASE_URL = "https://app.datarobot.com";
function normalizeDataRobotBaseUrl(value) {
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(value || DATAROBOT_DEFAULT_BASE_URL);
    return normalized || DATAROBOT_DEFAULT_BASE_URL;
}
function isDataRobotDeploymentUrl(value) {
    const normalized = normalizeDataRobotBaseUrl(value);
    return /\/api\/v2\/deployments\/[^/]+(?:\/chat\/completions)?$/i.test(normalized);
}
function buildDataRobotChatUrl(value) {
    const normalized = normalizeDataRobotBaseUrl(value);
    if (normalized.endsWith("/chat/completions")) {
        return normalized;
    }
    if (/\/api\/v2\/deployments\/[^/]+$/i.test(normalized)) {
        return `${normalized}/chat/completions`;
    }
    if (/\/api\/v2\/genai\/llmgw$/i.test(normalized)) {
        return `${normalized}/chat/completions/`;
    }
    if (/\/api\/v2\/genai\/llmgw\/chat$/i.test(normalized)) {
        return `${normalized}/completions/`;
    }
    if (normalized.includes(DATAROBOT_API_V2_SEGMENT)) {
        return `${normalized}${DATAROBOT_LLMGW_CHAT_PATH}`;
    }
    return `${normalized}${DATAROBOT_API_V2_SEGMENT}${DATAROBOT_LLMGW_CHAT_PATH}`;
}
function buildDataRobotCatalogUrl(value) {
    const normalized = normalizeDataRobotBaseUrl(value);
    if (isDataRobotDeploymentUrl(normalized)) {
        return null;
    }
    const parsed = new URL(normalized);
    let basePath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripTrailingSlashes"])(parsed.pathname);
    if (/\/api\/v2\/genai\/llmgw\/chat\/completions$/i.test(basePath)) {
        basePath = basePath.replace(/\/chat\/completions$/i, "");
    } else if (/\/api\/v2\/genai\/llmgw$/i.test(basePath)) {
    // Keep path as-is.
    } else if (basePath.includes(DATAROBOT_API_V2_SEGMENT)) {
        basePath = basePath.replace(/\/api\/v2.*$/i, "");
    }
    const catalogPath = `${basePath}${DATAROBOT_LLMGW_CATALOG_PATH}`.replace(/\/{2,}/g, "/");
    parsed.pathname = catalogPath;
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
}
}),
"[project]/open-sse/config/oci.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OCI_DEFAULT_BASE_URL",
    ()=>OCI_DEFAULT_BASE_URL,
    "buildOciChatUrl",
    ()=>buildOciChatUrl,
    "buildOciModelsUrl",
    ()=>buildOciModelsUrl,
    "normalizeOciBaseUrl",
    ()=>normalizeOciBaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/urlSanitize.ts [middleware] (ecmascript)");
;
const OCI_DEFAULT_BASE_URL = "https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/openai/v1";
function normalizeOciBaseUrl(value) {
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(value || OCI_DEFAULT_BASE_URL);
    if (!normalized) return OCI_DEFAULT_BASE_URL;
    const stripped = normalized.replace(/\/(?:chat\/completions|responses|models)$/i, "");
    if (stripped.endsWith("/openai/v1")) {
        return stripped;
    }
    if (stripped.endsWith("/openai")) {
        return `${stripped}/v1`;
    }
    try {
        const parsed = new URL(stripped);
        if (!parsed.pathname || parsed.pathname === "/") {
            parsed.pathname = "/openai/v1";
        } else if (parsed.pathname.endsWith("/openai")) {
            parsed.pathname = `${parsed.pathname}/v1`;
        }
        parsed.search = "";
        parsed.hash = "";
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripTrailingSlashes"])(parsed.toString());
    } catch  {
        return stripped;
    }
}
function buildOciChatUrl(value, apiType = "chat") {
    return `${normalizeOciBaseUrl(value)}/${apiType === "responses" ? "responses" : "chat/completions"}`;
}
function buildOciModelsUrl(value) {
    return `${normalizeOciBaseUrl(value)}/models`;
}
}),
"[project]/open-sse/config/sap.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SAP_DEFAULT_BASE_URL",
    ()=>SAP_DEFAULT_BASE_URL,
    "buildSapChatUrl",
    ()=>buildSapChatUrl,
    "buildSapModelsUrl",
    ()=>buildSapModelsUrl,
    "getSapResourceGroup",
    ()=>getSapResourceGroup,
    "isSapDeploymentUrl",
    ()=>isSapDeploymentUrl,
    "normalizeSapBaseUrl",
    ()=>normalizeSapBaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/urlSanitize.ts [middleware] (ecmascript)");
;
const SAP_DEFAULT_BASE_URL = "https://example-aicore.cfapps.eu10.hana.ondemand.com/v2/lm/deployments/example-deployment";
function sanitizeUrl(value) {
    try {
        const parsed = new URL(value);
        parsed.search = "";
        parsed.hash = "";
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripTrailingSlashes"])(parsed.toString());
    } catch  {
        return value;
    }
}
function normalizeSapBaseUrl(value) {
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(value || SAP_DEFAULT_BASE_URL);
    if (!normalized) return SAP_DEFAULT_BASE_URL;
    return sanitizeUrl(normalized.replace(/\/chat\/completions$/i, ""));
}
function isSapDeploymentUrl(value) {
    const normalized = normalizeSapBaseUrl(value);
    return /\/v2\/lm\/deployments\/[^/]+$/i.test(normalized);
}
function buildSapChatUrl(value) {
    const normalized = normalizeSapBaseUrl(value);
    if (normalized.endsWith("/chat/completions")) return normalized;
    return `${normalized}/chat/completions`;
}
function buildSapModelsUrl(value) {
    const normalized = normalizeSapBaseUrl(value);
    const root = normalized.replace(/\/v2\/lm\/deployments\/[^/]+$/i, "");
    return `${root}/v2/lm/scenarios/foundation-models/models`;
}
function getSapResourceGroup(providerSpecificData, fallback = "default") {
    const candidates = [
        providerSpecificData?.resourceGroup,
        providerSpecificData?.aiResourceGroup,
        providerSpecificData?.resource_group
    ];
    for (const candidate of candidates){
        if (typeof candidate === "string" && candidate.trim()) {
            return candidate.trim();
        }
    }
    return fallback;
}
}),
"[project]/open-sse/config/watsonx.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WATSONX_DEFAULT_BASE_URL",
    ()=>WATSONX_DEFAULT_BASE_URL,
    "buildWatsonxChatUrl",
    ()=>buildWatsonxChatUrl,
    "buildWatsonxModelsUrl",
    ()=>buildWatsonxModelsUrl,
    "normalizeWatsonxBaseUrl",
    ()=>normalizeWatsonxBaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/urlSanitize.ts [middleware] (ecmascript)");
;
const WATSONX_DEFAULT_BASE_URL = "https://ca-tor.ml.cloud.ibm.com/ml/gateway/v1";
function normalizeWatsonxBaseUrl(value) {
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(value || WATSONX_DEFAULT_BASE_URL);
    if (!normalized) return WATSONX_DEFAULT_BASE_URL;
    const stripped = normalized.replace(/\/(?:chat\/completions|completions|embeddings|models)$/i, "");
    if (stripped.endsWith("/ml/gateway/v1")) {
        return stripped;
    }
    if (stripped.endsWith("/ml/gateway")) {
        return `${stripped}/v1`;
    }
    try {
        const parsed = new URL(stripped);
        if (!parsed.pathname || parsed.pathname === "/") {
            parsed.pathname = "/ml/gateway/v1";
        } else if (parsed.pathname.endsWith("/ml/gateway")) {
            parsed.pathname = `${parsed.pathname}/v1`;
        }
        parsed.search = "";
        parsed.hash = "";
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripTrailingSlashes"])(parsed.toString());
    } catch  {
        return stripped;
    }
}
function buildWatsonxChatUrl(value) {
    return `${normalizeWatsonxBaseUrl(value)}/chat/completions`;
}
function buildWatsonxModelsUrl(value) {
    return `${normalizeWatsonxBaseUrl(value)}/models`;
}
}),
"[project]/src/lib/providers/validation/cloudProviders.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "validateAzureAiProvider",
    ()=>validateAzureAiProvider,
    "validateAzureOpenAIProvider",
    ()=>validateAzureOpenAIProvider,
    "validateDataRobotProvider",
    ()=>validateDataRobotProvider,
    "validateDatabricksProvider",
    ()=>validateDatabricksProvider,
    "validateGigachatProvider",
    ()=>validateGigachatProvider,
    "validateHerokuProvider",
    ()=>validateHerokuProvider,
    "validateOciProvider",
    ()=>validateOciProvider,
    "validateSapProvider",
    ()=>validateSapProvider,
    "validateSnowflakeProvider",
    ()=>validateSnowflakeProvider,
    "validateWatsonxProvider",
    ()=>validateWatsonxProvider
]);
// Enterprise-cloud provider key validators: heroku, databricks, datarobot, snowflake, gigachat,
// azure-openai, azure-ai, watsonx, oci, sap. Extracted from validation.ts (god-file decomposition) —
// top-level functions with no dispatcher-state captures; behavior is byte-identical to the inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/directChatProbe.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$gigachatAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/gigachatAuth.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$azureAi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/azureAi.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$datarobot$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/datarobot.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$oci$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/oci.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$sap$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/sap.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$watsonx$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/watsonx.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
async function validateHerokuProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl);
    if (!baseUrl) {
        return {
            valid: false,
            error: "Missing base URL"
        };
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateDirectChatProvider"])({
        url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeHerokuChatUrl"])(baseUrl),
        headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
        body: {
            model: providerSpecificData.validationModelId || "claude-4-sonnet",
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        },
        providerSpecificData
    });
}
async function validateDatabricksProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl);
    if (!baseUrl) {
        return {
            valid: false,
            error: "Missing base URL"
        };
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateDirectChatProvider"])({
        url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeDatabricksChatUrl"])(baseUrl),
        headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
        body: {
            model: providerSpecificData.validationModelId || "databricks-meta-llama-3-3-70b-instruct",
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        },
        providerSpecificData
    });
}
async function validateDataRobotProvider({ apiKey, providerSpecificData = {} }) {
    const configuredBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$datarobot$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["DATAROBOT_DEFAULT_BASE_URL"];
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$datarobot$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isDataRobotDeploymentUrl"])(configuredBaseUrl)) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateDirectChatProvider"])({
            url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$datarobot$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildDataRobotChatUrl"])(configuredBaseUrl),
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: {
                model: providerSpecificData.validationModelId || "datarobot-deployed-llm",
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            },
            providerSpecificData
        });
    }
    const catalogUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$datarobot$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildDataRobotCatalogUrl"])(configuredBaseUrl);
    if (!catalogUrl) {
        return {
            valid: false,
            error: "Invalid DataRobot base URL"
        };
    }
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(catalogUrl, {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData)
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "gateway_catalog"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "gateway_catalog",
                warning: "Rate limited, but credentials are valid"
            };
        }
        if (response.status >= 400 && response.status < 500) {
            return {
                valid: true,
                error: null,
                method: "gateway_catalog"
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateSnowflakeProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl);
    if (!baseUrl) {
        return {
            valid: false,
            error: "Missing base URL"
        };
    }
    const usesProgrammaticAccessToken = typeof apiKey === "string" && apiKey.startsWith("pat/");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateDirectChatProvider"])({
        url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeSnowflakeChatUrl"])(baseUrl),
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${usesProgrammaticAccessToken ? apiKey.slice(4) : apiKey}`,
            "X-Snowflake-Authorization-Token-Type": usesProgrammaticAccessToken ? "PROGRAMMATIC_ACCESS_TOKEN" : "KEYPAIR_JWT"
        },
        body: {
            model: providerSpecificData.validationModelId || "llama3.3-70b",
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        },
        providerSpecificData
    });
}
async function validateGigachatProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || "https://gigachat.devices.sberbank.ru/api/v1";
    let token;
    try {
        token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$gigachatAuth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getGigachatAccessToken"])({
            credentials: apiKey
        });
    } catch (error) {
        if (String(error?.message || "").match(/\b(401|403)\b/)) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateDirectChatProvider"])({
        url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeGigachatChatUrl"])(baseUrl),
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.accessToken}`,
            Accept: "application/json"
        },
        body: {
            model: providerSpecificData.validationModelId || "GigaChat-2-Pro",
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        },
        providerSpecificData
    });
}
async function validateAzureOpenAIProvider({ apiKey, providerSpecificData = {} }) {
    const rawBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl);
    if (!rawBaseUrl) {
        return {
            valid: false,
            error: "Missing base URL"
        };
    }
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeAzureOpenAIBaseUrl"])(rawBaseUrl);
    const apiVersion = typeof providerSpecificData.validationApiVersion === "string" && providerSpecificData.validationApiVersion.trim() ? providerSpecificData.validationApiVersion.trim() : "2024-12-01-preview";
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
        "Content-Type": "application/json",
        "api-key": apiKey
    }, providerSpecificData);
    const encodedVersion = encodeURIComponent(apiVersion);
    for (const probeUrl of [
        `${baseUrl}/openai/deployments?api-version=${encodedVersion}`,
        `${baseUrl}/openai/models?api-version=${encodedVersion}`
    ]){
        try {
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(probeUrl, {
                method: "GET",
                headers
            });
            if (response.ok) {
                return {
                    valid: true,
                    error: null,
                    method: "azure_probe"
                };
            }
            if (response.status === 401 || response.status === 403) {
                return {
                    valid: false,
                    error: "Invalid API key"
                };
            }
            if (response.status === 400 || response.status === 404 || response.status === 405) {
                continue;
            }
            if (response.status === 429) {
                return {
                    valid: true,
                    error: null,
                    method: "azure_probe",
                    warning: "Rate limited, but credentials are valid"
                };
            }
            if (response.status >= 500) {
                return {
                    valid: false,
                    error: `Provider unavailable (${response.status})`
                };
            }
        } catch (error) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
        }
    }
    const deploymentId = typeof providerSpecificData.validationModelId === "string" ? providerSpecificData.validationModelId.trim() : "";
    if (!deploymentId) {
        return {
            valid: true,
            error: null,
            warning: "Azure key accepted, but no deployment name was provided for a chat probe. Set Model ID to validate a specific deployment."
        };
    }
    const chatUrl = `${baseUrl}/openai/deployments/${encodeURIComponent(deploymentId)}/chat/completions?api-version=${encodedVersion}`;
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
            model: deploymentId,
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        })
    });
    if (response.ok || response.status === 400 || response.status === 422 || response.status === 429) {
        return {
            valid: true,
            error: null,
            method: "chat_probe"
        };
    }
    if (response.status === 401 || response.status === 403) {
        return {
            valid: false,
            error: "Invalid API key"
        };
    }
    if (response.status === 404) {
        return {
            valid: true,
            error: null,
            method: "chat_probe",
            warning: "Azure credentials are valid, but the requested deployment was not found."
        };
    }
    if (response.status >= 500) {
        return {
            valid: false,
            error: `Provider unavailable (${response.status})`
        };
    }
    return {
        valid: false,
        error: `Validation failed: ${response.status}`
    };
}
function extractTargetDeployments(psd) {
    const deployments = [];
    if (Array.isArray(psd.deployments)) {
        for (const d of psd.deployments){
            if (typeof d === "string" && d.trim()) deployments.push(d.trim());
            else if (d && typeof d === "object" && typeof d.id === "string" && d.id.trim()) {
                deployments.push(d.id.trim());
            }
        }
    }
    if (Array.isArray(psd.models)) {
        for (const m of psd.models){
            if (typeof m === "string" && m.trim()) deployments.push(m.trim());
            else if (m && typeof m === "object" && typeof m.id === "string" && m.id.trim()) {
                deployments.push(m.id.trim());
            }
        }
    }
    if (Array.isArray(psd.validationModelIds)) {
        for (const id of psd.validationModelIds){
            if (typeof id === "string" && id.trim()) deployments.push(id.trim());
        }
    }
    if (typeof psd.validationModelId === "string" && psd.validationModelId.trim()) {
        const split = psd.validationModelId.split(",").map((s)=>s.trim()).filter(Boolean);
        for (const s of split){
            if (!deployments.includes(s)) deployments.push(s);
        }
    }
    return Array.from(new Set(deployments));
}
async function validateAzureAiProvider({ apiKey, providerSpecificData = {} }) {
    const rawBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$azureAi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["AZURE_AI_DEFAULT_BASE_URL"];
    const modelsUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$azureAi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildAzureAiModelsUrl"])(rawBaseUrl);
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
        "Content-Type": "application/json",
        "api-key": apiKey
    }, providerSpecificData);
    let modelsEndpointOk = false;
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(modelsUrl, {
            method: "GET",
            headers
        });
        if (response.ok) {
            modelsEndpointOk = true;
        } else if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        } else if (response.status === 429) {
            modelsEndpointOk = true;
        }
    } catch  {
    // Fall through to chat probe when /models is unavailable.
    }
    const targetDeployments = extractTargetDeployments(providerSpecificData);
    if (targetDeployments.length === 0) {
        if (modelsEndpointOk) {
            return {
                valid: true,
                error: null,
                method: "azure_ai_models"
            };
        }
        return {
            valid: false,
            error: "Endpoint /models unavailable. Provide a Model ID to validate via /chat/completions."
        };
    }
    const apiType = providerSpecificData.apiType === "responses" ? "responses" : "chat";
    const apiVersion = typeof providerSpecificData.apiVersion === "string" && providerSpecificData.apiVersion.trim() ? providerSpecificData.apiVersion.trim() : "2024-12-01-preview";
    const probeOne = async (deploymentId)=>{
        const chatUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$azureAi$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildAzureAiChatUrl"])(rawBaseUrl, apiType, deploymentId, apiVersion);
        const chatBody = apiType === "responses" ? {
            model: deploymentId,
            input: "test",
            max_output_tokens: 1
        } : {
            model: deploymentId,
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        };
        try {
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(chatBody)
            });
            if (response.ok || response.status === 400 || response.status === 422 || response.status === 429) {
                return {
                    deploymentId,
                    valid: true,
                    status: "ok",
                    error: null
                };
            }
            if (response.status === 401 || response.status === 403) {
                return {
                    deploymentId,
                    valid: false,
                    status: "auth_error",
                    error: "Invalid API key"
                };
            }
            if (response.status === 404) {
                return {
                    deploymentId,
                    valid: false,
                    status: "not_found",
                    error: "Deployment not found"
                };
            }
            return {
                deploymentId,
                valid: false,
                status: "error",
                error: `Provider unavailable (${response.status})`
            };
        } catch (error) {
            const errRes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
            return {
                deploymentId,
                valid: false,
                status: "error",
                error: errRes.error || "Connection failed"
            };
        }
    };
    const settled = await Promise.allSettled(targetDeployments.map(probeOne));
    const deploymentResults = settled.map((res, i)=>res.status === "fulfilled" ? res.value : {
            deploymentId: targetDeployments[i],
            valid: false,
            status: "error",
            error: "Connection test failed"
        });
    const validCount = deploymentResults.filter((r)=>r.valid).length;
    const totalCount = deploymentResults.length;
    const hasAnyValid = validCount > 0 || modelsEndpointOk;
    if (!hasAnyValid) {
        const firstErr = deploymentResults.find((r)=>r.error)?.error || "Connection failed";
        return {
            valid: false,
            error: firstErr,
            method: "azure_ai_chat_probe",
            deployments: deploymentResults
        };
    }
    const warning = validCount < totalCount ? `${totalCount - validCount} of ${totalCount} deployment(s) failed connection test.` : null;
    return {
        valid: true,
        error: null,
        warning,
        method: modelsEndpointOk && targetDeployments.length === 0 ? "azure_ai_models" : "azure_ai_chat_probe",
        deployments: deploymentResults
    };
}
async function validateWatsonxProvider({ apiKey, providerSpecificData = {} }) {
    const rawBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$watsonx$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WATSONX_DEFAULT_BASE_URL"];
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
    }, providerSpecificData);
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$watsonx$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildWatsonxModelsUrl"])(rawBaseUrl), {
            method: "GET",
            headers
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "watsonx_models"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "watsonx_models",
                warning: "Rate limited, but credentials are valid"
            };
        }
    } catch  {
    // Fall through to chat probe when /models is unavailable.
    }
    const validationModelId = typeof providerSpecificData.validationModelId === "string" && providerSpecificData.validationModelId.trim() ? providerSpecificData.validationModelId.trim() : "ibm/granite-3-3-8b-instruct";
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$watsonx$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildWatsonxChatUrl"])(rawBaseUrl), {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: validationModelId,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        });
        if (response.ok || response.status === 400 || response.status === 404 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "watsonx_chat_probe",
                ...response.status === 404 ? {
                    warning: "watsonx credentials are valid, but the requested model is not enabled."
                } : {}
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing watsonx.ai"
    };
}
async function validateOciProvider({ apiKey, providerSpecificData = {} }) {
    const rawBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$oci$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OCI_DEFAULT_BASE_URL"];
    const projectId = typeof providerSpecificData.projectId === "string" && providerSpecificData.projectId.trim() ? providerSpecificData.projectId.trim() : typeof providerSpecificData.project === "string" && providerSpecificData.project.trim() ? providerSpecificData.project.trim() : "";
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...projectId ? {
            "OpenAI-Project": projectId
        } : {}
    }, providerSpecificData);
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$oci$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildOciModelsUrl"])(rawBaseUrl), {
            method: "GET",
            headers
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "oci_models"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "oci_models",
                warning: "Rate limited, but credentials are valid"
            };
        }
    } catch  {
    // Fall through to chat/responses probe when /models is unavailable.
    }
    const validationModelId = typeof providerSpecificData.validationModelId === "string" && providerSpecificData.validationModelId.trim() ? providerSpecificData.validationModelId.trim() : "openai.gpt-oss-20b";
    const apiType = providerSpecificData.apiType === "responses" ? "responses" : "chat";
    const body = apiType === "responses" ? {
        model: validationModelId,
        input: "test",
        max_output_tokens: 1
    } : {
        model: validationModelId,
        messages: [
            {
                role: "user",
                content: "test"
            }
        ],
        max_tokens: 1
    };
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$oci$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildOciChatUrl"])(rawBaseUrl, apiType), {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        });
        if (response.ok || response.status === 400 || response.status === 404 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null,
                method: apiType === "responses" ? "oci_responses_probe" : "oci_chat_probe",
                ...response.status === 404 ? {
                    warning: "OCI credentials are valid, but the requested model was not found."
                } : {}
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing OCI Generative AI"
    };
}
async function validateSapProvider({ apiKey, providerSpecificData = {} }) {
    const rawBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$sap$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["SAP_DEFAULT_BASE_URL"];
    const resourceGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$sap$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getSapResourceGroup"])(providerSpecificData);
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "AI-Resource-Group": resourceGroup
    }, providerSpecificData);
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$sap$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildSapModelsUrl"])(rawBaseUrl), {
            method: "GET",
            headers
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "sap_models"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "sap_models",
                warning: "Rate limited, but credentials are valid"
            };
        }
    } catch  {
    // Fall through to deployment probe when the discovery API is unavailable.
    }
    const canProbeChat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$sap$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isSapDeploymentUrl"])(rawBaseUrl) || /\/chat\/completions$/i.test((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(rawBaseUrl));
    if (!canProbeChat) {
        return {
            valid: false,
            error: "SAP validation needs either a reachable AI_API_URL or a deployment URL in providerSpecificData.baseUrl"
        };
    }
    const validationModelId = typeof providerSpecificData.validationModelId === "string" && providerSpecificData.validationModelId.trim() ? providerSpecificData.validationModelId.trim() : "gpt-4o";
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$sap$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildSapChatUrl"])(rawBaseUrl), {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: validationModelId,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        });
        if (response.ok || response.status === 400 || response.status === 404 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "sap_chat_probe",
                ...response.status === 404 ? {
                    warning: "SAP credentials are valid, but the deployment URL or model was not found."
                } : {}
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing SAP Generative AI Hub"
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/config/runway.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RUNWAYML_API_VERSION",
    ()=>RUNWAYML_API_VERSION,
    "RUNWAYML_DEFAULT_BASE_URL",
    ()=>RUNWAYML_DEFAULT_BASE_URL,
    "RUNWAYML_IMAGE_REQUIRED_MODELS",
    ()=>RUNWAYML_IMAGE_REQUIRED_MODELS,
    "RUNWAYML_SUPPORTED_VIDEO_MODELS",
    ()=>RUNWAYML_SUPPORTED_VIDEO_MODELS,
    "buildRunwayApiUrl",
    ()=>buildRunwayApiUrl,
    "buildRunwayHeaders",
    ()=>buildRunwayHeaders,
    "normalizeRunwayBaseUrl",
    ()=>normalizeRunwayBaseUrl
]);
const RUNWAYML_DEFAULT_BASE_URL = "https://api.dev.runwayml.com/v1";
const RUNWAYML_API_VERSION = "2024-11-06";
const RUNWAYML_SUPPORTED_VIDEO_MODELS = [
    {
        id: "gen4.5",
        name: "Gen-4.5"
    },
    {
        id: "gen4_turbo",
        name: "Gen-4 Turbo"
    },
    {
        id: "gen3a_turbo",
        name: "Gen-3 Alpha Turbo"
    },
    {
        id: "veo3.1",
        name: "Veo 3.1"
    },
    {
        id: "veo3.1_fast",
        name: "Veo 3.1 Fast"
    }
];
const RUNWAYML_IMAGE_REQUIRED_MODELS = new Set([
    "gen4_turbo"
]);
function normalizeRunwayBaseUrl(baseUrl) {
    const normalized = String(baseUrl || "").trim().replace(/\/$/, "");
    if (!normalized) return RUNWAYML_DEFAULT_BASE_URL;
    const stripped = normalized.replace(/\/organization$/i, "").replace(/\/tasks\/[^/]+$/i, "").replace(/\/(?:image_to_video|text_to_video)$/i, "");
    return stripped.endsWith("/v1") ? stripped : `${stripped}/v1`;
}
function buildRunwayApiUrl(path, baseUrl) {
    const normalizedBaseUrl = normalizeRunwayBaseUrl(baseUrl);
    return `${normalizedBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
function buildRunwayHeaders(apiKey) {
    return {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": RUNWAYML_API_VERSION
    };
}
}),
"[project]/open-sse/utils/awsSigV4.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "signAwsRequest",
    ()=>signAwsRequest
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
function sha256Hex(value) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(value).digest("hex");
}
function hmac(key, value) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHmac"])("sha256", key).update(value, "utf8").digest();
}
function hmacHex(key, value) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHmac"])("sha256", key).update(value, "utf8").digest("hex");
}
function awsEncode(value) {
    return encodeURIComponent(value).replace(/[!'()*]/g, (char)=>`%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}
function canonicalUri(pathname) {
    const path = pathname || "/";
    return path.split("/").map((segment)=>awsEncode(decodeURIComponent(segment))).join("/");
}
function canonicalQuery(searchParams) {
    return [
        ...searchParams.entries()
    ].sort(([keyA, valueA], [keyB, valueB])=>keyA === keyB ? valueA.localeCompare(valueB) : keyA.localeCompare(keyB)).map(([key, value])=>`${awsEncode(key)}=${awsEncode(value)}`).join("&");
}
function amzDateParts(now) {
    const iso = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    return {
        amzDate: iso,
        dateStamp: iso.slice(0, 8)
    };
}
function normalizeHeaders(headers) {
    const normalized = {};
    for (const [key, value] of Object.entries(headers)){
        if (value === undefined || value === null) continue;
        normalized[key.toLowerCase()] = String(value).trim().replace(/\s+/g, " ");
    }
    return normalized;
}
function signingKey(secretAccessKey, dateStamp, region, service) {
    const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
    const kRegion = hmac(kDate, region);
    const kService = hmac(kRegion, service);
    return hmac(kService, "aws4_request");
}
function signAwsRequest({ method, url, region, service, headers = {}, body = "", credentials, now = new Date() }) {
    const parsedUrl = new URL(url);
    const payload = body ?? "";
    const payloadHash = sha256Hex(payload);
    const { amzDate, dateStamp } = amzDateParts(now);
    const canonicalHeadersMap = normalizeHeaders({
        ...headers,
        host: parsedUrl.host,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": amzDate,
        ...credentials.sessionToken ? {
            "x-amz-security-token": credentials.sessionToken
        } : {}
    });
    const signedHeaderNames = Object.keys(canonicalHeadersMap).sort();
    const canonicalHeaders = signedHeaderNames.map((name)=>`${name}:${canonicalHeadersMap[name]}\n`).join("");
    const signedHeaders = signedHeaderNames.join(";");
    const canonicalRequest = [
        method.toUpperCase(),
        canonicalUri(parsedUrl.pathname),
        canonicalQuery(parsedUrl.searchParams),
        canonicalHeaders,
        signedHeaders,
        payloadHash
    ].join("\n");
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
        "AWS4-HMAC-SHA256",
        amzDate,
        credentialScope,
        sha256Hex(canonicalRequest)
    ].join("\n");
    const signature = hmacHex(signingKey(credentials.secretAccessKey, dateStamp, region, service), stringToSign);
    return {
        ...canonicalHeadersMap,
        Authorization: [
            "AWS4-HMAC-SHA256",
            `Credential=${credentials.accessKeyId}/${credentialScope},`,
            `SignedHeaders=${signedHeaders},`,
            `Signature=${signature}`
        ].join(" ")
    };
}
}),
"[project]/src/lib/providers/validation/audioMiscProviders.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getAwsPollyBaseUrl",
    ()=>getAwsPollyBaseUrl,
    "getAwsPollyRegion",
    ()=>getAwsPollyRegion,
    "getAwsProviderString",
    ()=>getAwsProviderString,
    "validateAssemblyAIProvider",
    ()=>validateAssemblyAIProvider,
    "validateAwsPollyProvider",
    ()=>validateAwsPollyProvider,
    "validateBailianCodingPlanProvider",
    ()=>validateBailianCodingPlanProvider,
    "validateDeepgramProvider",
    ()=>validateDeepgramProvider,
    "validateElevenLabsProvider",
    ()=>validateElevenLabsProvider,
    "validateInworldProvider",
    ()=>validateInworldProvider,
    "validateKieProvider",
    ()=>validateKieProvider,
    "validateMaritalkProvider",
    ()=>validateMaritalkProvider,
    "validateNlpCloudProvider",
    ()=>validateNlpCloudProvider,
    "validateNousResearchProvider",
    ()=>validateNousResearchProvider,
    "validatePoeProvider",
    ()=>validatePoeProvider,
    "validateQwenCloudTokenPlanProvider",
    ()=>validateQwenCloudTokenPlanProvider,
    "validateRekaProvider",
    ()=>validateRekaProvider,
    "validateRevAiProvider",
    ()=>validateRevAiProvider,
    "validateRunwayProvider",
    ()=>validateRunwayProvider
]);
// Audio/speech + miscellaneous API-key provider validators: deepgram, assemblyai, elevenlabs,
// inworld, kie, aws-polly, bailian-coding-plan, reka, maritalk, nlpcloud, runwayml, nous-research,
// poe. Extracted from validation.ts (god-file decomposition) — top-level functions with no
// dispatcher-state captures; behavior is byte-identical to the original inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$poe$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/poe/index.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/directChatProbe.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/runway.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$maritalk$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/maritalk.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$awsSigV4$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/awsSigV4.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/alibabaProviderRegions.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
async function validateDeepgramProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])("https://api.deepgram.com/v1/auth/token", {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Authorization: `Token ${apiKey}`
            }, providerSpecificData)
        });
        if (response.ok) return {
            valid: true,
            error: null
        };
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateAssemblyAIProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])("https://api.assemblyai.com/v2/transcript?limit=1", {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Authorization: apiKey,
                "Content-Type": "application/json"
            }, providerSpecificData)
        });
        if (response.ok) return {
            valid: true,
            error: null
        };
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateRevAiProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])("https://api.rev.ai/speechtotext/v1/jobs?limit=1", {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData)
        });
        if (response.ok) return {
            valid: true,
            error: null
        };
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateElevenLabsProvider({ apiKey, providerSpecificData = {} }) {
    try {
        // Lightweight auth check endpoint
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])("https://api.elevenlabs.io/v1/voices", {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                "xi-api-key": apiKey,
                "Content-Type": "application/json"
            }, providerSpecificData)
        });
        if (response.ok) return {
            valid: true,
            error: null
        };
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateInworldProvider({ apiKey, providerSpecificData = {} }) {
    try {
        // Inworld TTS lacks a simple key-introspection endpoint.
        // Send a minimal synth request and treat non-auth 4xx as auth-pass.
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])("https://api.inworld.ai/tts/v1/voice", {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Authorization: `Basic ${apiKey}`,
                "Content-Type": "application/json"
            }, providerSpecificData),
            body: JSON.stringify({
                text: "test",
                modelId: "inworld-tts-1.5-mini",
                audioConfig: {
                    audioEncoding: "MP3"
                }
            })
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Any other response indicates auth is accepted (payload/model may still be wrong)
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateKieProvider({ apiKey, providerSpecificData = {} }) {
    try {
        // Use credit check endpoint as requested by user based on Kie.ai docs.
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])("https://api.kie.ai/api/v1/chat/credit", {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }, providerSpecificData)
        });
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid Kie.ai API key"
            };
        }
        // Fallback: if credits endpoint is 404/not supported, try minimal chat probe.
        const chatRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])("https://api.kie.ai/api/v1/chat/completions", {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: providerSpecificData.validationModelId || "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        });
        if (chatRes.ok || chatRes.status >= 400 && chatRes.status < 500 && chatRes.status !== 401 && chatRes.status !== 403) {
            return {
                valid: true,
                error: null
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${chatRes.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
function getAwsProviderString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function getAwsPollyRegion(providerSpecificData = {}) {
    return getAwsProviderString(providerSpecificData.region) || getAwsProviderString(providerSpecificData.awsRegion) || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
}
function getAwsPollyBaseUrl(providerSpecificData = {}, region) {
    return (getAwsProviderString(providerSpecificData.baseUrl) || `https://polly.${region}.amazonaws.com`).replace(/\/+$/, "");
}
async function validateAwsPollyProvider({ apiKey, providerSpecificData = {} }) {
    const accessKeyId = getAwsProviderString(providerSpecificData.accessKeyId) || getAwsProviderString(providerSpecificData.awsAccessKeyId);
    const secretAccessKey = getAwsProviderString(apiKey);
    if (!accessKeyId) {
        return {
            valid: false,
            error: "Missing AWS accessKeyId"
        };
    }
    if (!secretAccessKey) {
        return {
            valid: false,
            error: "Missing AWS Secret Access Key"
        };
    }
    const region = getAwsPollyRegion(providerSpecificData);
    const baseUrl = getAwsPollyBaseUrl(providerSpecificData, region).replace(/\/v1\/voices$/i, "");
    const url = `${baseUrl}/v1/voices?Engine=standard`;
    try {
        const signedHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$awsSigV4$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["signAwsRequest"])({
            method: "GET",
            url,
            region,
            service: "polly",
            credentials: {
                accessKeyId,
                secretAccessKey,
                sessionToken: getAwsProviderString(providerSpecificData.sessionToken) || getAwsProviderString(providerSpecificData.awsSessionToken)
            }
        });
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(url, {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])(signedHeaders, providerSpecificData)
        });
        if (response.ok) return {
            valid: true,
            error: null
        };
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateBailianCodingPlanProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const rawBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveAlibabaProviderBaseUrl"])("bailian-coding-plan", providerSpecificData));
        const baseUrl = rawBaseUrl.endsWith("/messages") ? rawBaseUrl.slice(0, -"/messages".length) : rawBaseUrl;
        // bailian-coding-plan uses DashScope Anthropic-compatible messages endpoint
        // It does NOT expose /v1/models — use messages probe directly
        const messagesUrl = `${baseUrl}/messages`;
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(messagesUrl, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
            }, providerSpecificData),
            body: JSON.stringify({
                model: "qwen3-coder-plus",
                max_tokens: 1,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ]
            })
        });
        // 401/403 => invalid key
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Non-auth 4xx (e.g., 400 bad request) means auth passed but request was malformed
        if (response.status >= 400 && response.status < 500) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateQwenCloudTokenPlanProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveAlibabaProviderBaseUrl"])("qwen-cloud-token-plan", providerSpecificData)).replace(/\/chat\/completions$/i, "");
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: providerSpecificData.validationModelId || "qwen3.7-max",
                max_tokens: 1,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ]
            })
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                warning: "Provider accepted the key but is rate limited (429)"
            };
        }
        if (response.ok || response.status === 400 || response.status === 422) {
            return {
                valid: true,
                error: null
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateRekaProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || "https://api.reka.ai/v1";
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildRekaHeaders"])(apiKey, providerSpecificData);
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(`${baseUrl}/models`, {
            method: "GET",
            headers
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "reka_models"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "reka_models",
                warning: "Rate limited, but credentials are valid"
            };
        }
    } catch  {
    // Fall through to the chat probe when /models is unavailable.
    }
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: providerSpecificData.validationModelId || "reka-flash-3",
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        });
        if (response.ok || response.status === 400 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "reka_chat_probe"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing Reka"
    };
}
async function validateMaritalkProvider({ apiKey, providerSpecificData = {} }) {
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])("maritalk");
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl || entry?.baseUrl);
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildKeyHeaders"])(apiKey, providerSpecificData);
    try {
        const modelsRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$maritalk$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildMaritalkModelsUrl"])(baseUrl), {
            method: "GET",
            headers
        });
        if (modelsRes.ok) {
            return {
                valid: true,
                error: null,
                method: "maritalk_models"
            };
        }
        if (modelsRes.status === 401 || modelsRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (modelsRes.status === 429) {
            return {
                valid: true,
                error: null,
                method: "maritalk_models",
                warning: "Rate limited, but credentials are valid"
            };
        }
        if (modelsRes.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${modelsRes.status})`
            };
        }
    } catch  {
    // Fall through to the chat probe when /models cannot be reached.
    }
    const modelId = typeof providerSpecificData?.validationModelId === "string" && providerSpecificData.validationModelId.trim() ? providerSpecificData.validationModelId.trim() : entry?.models?.[0]?.id || "sabia-4";
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateDirectChatProvider"])({
        url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$maritalk$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildMaritalkChatUrl"])(baseUrl),
        headers,
        body: {
            model: modelId,
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        },
        providerSpecificData
    });
}
async function validateNlpCloudProvider({ apiKey, providerSpecificData = {} }) {
    const rawBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || "https://api.nlpcloud.io/v1";
    const baseUrl = rawBaseUrl.endsWith("/gpu") ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, "")}/gpu`;
    const modelId = typeof providerSpecificData.validationModelId === "string" && providerSpecificData.validationModelId.trim() ? providerSpecificData.validationModelId.trim() : "chatdolphin";
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildTokenHeaders"])(apiKey, providerSpecificData);
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(`${baseUrl}/${modelId}/chatbot`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                input: "test",
                context: "You are a concise assistant.",
                history: []
            })
        });
        if (response.ok || response.status === 400 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "nlpcloud_chatbot",
                ...response.status === 429 ? {
                    warning: "Rate limited, but credentials are valid"
                } : {}
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing NLP Cloud"
    };
}
async function validateRunwayProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeRunwayBaseUrl"])(providerSpecificData.baseUrl);
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildRunwayApiUrl"])("/organization", baseUrl), {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildRunwayHeaders"])(apiKey)
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "runway_organization"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "runway_organization",
                warning: "Rate limited, but credentials are valid"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing Runway"
    };
}
async function validateNousResearchProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || "https://inference-api.nousresearch.com/v1";
    const chatUrl = `${baseUrl}/chat/completions`;
    const modelId = typeof providerSpecificData.validationModelId === "string" && providerSpecificData.validationModelId.trim() ? providerSpecificData.validationModelId.trim() : "Hermes-4-70B";
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: modelId,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "nous_chat_completions"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "nous_chat_completions",
                warning: "Rate limited, but credentials are valid"
            };
        }
        if (response.status === 402) {
            return {
                valid: false,
                error: "Payment required or API key missing"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
        // #3881: any other non-auth 4xx (e.g. 400 model-not-found, 404, 422) means the
        // credentials were accepted — only the probe model/request shape was rejected.
        // Treat as valid (mirrors the longcat/nvidia validators) so a model rename upstream
        // can't make a working key read as "invalid".
        if (response.status >= 400 && response.status < 500) {
            return {
                valid: true,
                error: null,
                method: "nous_chat_completions",
                warning: `Credentials valid (probe returned ${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing Nous Research"
    };
}
async function validatePoeProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$poe$2f$index$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["POE_DEFAULT_BASE_URL"];
    const balanceUrl = new URL("/usage/current_balance", baseUrl).toString();
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(balanceUrl, {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData)
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "poe_current_balance"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null,
                method: "poe_current_balance",
                warning: "Rate limited, but credentials are valid"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
    return {
        valid: false,
        error: "Connection failed while testing Poe"
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/searchProviders.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "SEARCH_VALIDATOR_CONFIGS",
    ()=>SEARCH_VALIDATOR_CONFIGS,
    "validateSearchProvider",
    ()=>validateSearchProvider
]);
// Web-search provider key validators + their per-provider request configs (serper, tavily, jina-reader,
// …). Extracted from validation.ts (god-file decomposition) — top-level functions/data with no
// dispatcher-state captures; behavior is byte-identical to the original inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/safeOutboundFetch.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/outboundUrlGuardPolicy.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function validateSearchProvider(url, init, providerSpecificData = {}, isLocal = false) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["safeOutboundFetch"])(url, {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$safeOutboundFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["SAFE_OUTBOUND_FETCH_PRESETS"].validationWrite,
            guard: isLocal ? "none" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$outboundUrlGuardPolicy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getProviderOutboundGuard"])(),
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["withCustomUserAgent"])(init, providerSpecificData)
        });
        if (response.ok) return {
            valid: true,
            error: null,
            unsupported: false
        };
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key",
                unsupported: false
            };
        }
        // For provider setup we only need to confirm authentication passed.
        // Search providers may return non-auth statuses for exhausted credits,
        // rate limiting, or request-shape quirks while still accepting the key.
        if (response.status < 500) {
            return {
                valid: true,
                error: null,
                unsupported: false
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`,
            unsupported: false
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
const SEARCH_VALIDATOR_CONFIGS = {
    "serper-search": (apiKey)=>({
            url: "https://google.serper.dev/search",
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": apiKey
                },
                body: JSON.stringify({
                    q: "test",
                    num: 1
                })
            }
        }),
    "brave-search": (apiKey)=>({
            url: "https://api.search.brave.com/res/v1/web/search?q=test&count=1",
            init: {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "X-Subscription-Token": apiKey
                }
            }
        }),
    "perplexity-search": (apiKey)=>({
            url: "https://api.perplexity.ai/search",
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    query: "test",
                    max_results: 1
                })
            }
        }),
    "exa-search": (apiKey)=>({
            url: "https://api.exa.ai/search",
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey
                },
                body: JSON.stringify({
                    query: "test",
                    numResults: 1
                })
            }
        }),
    "tavily-search": (apiKey)=>({
            url: "https://api.tavily.com/search",
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    query: "test",
                    max_results: 1
                })
            }
        }),
    "google-pse-search": (apiKey, providerSpecificData = {})=>{
        const cx = providerSpecificData?.cx;
        if (!cx || typeof cx !== "string") {
            throw new Error("Programmable Search Engine ID (cx) is required");
        }
        return {
            url: `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=test&num=1`,
            init: {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            }
        };
    },
    "linkup-search": (apiKey)=>({
            url: "https://api.linkup.so/v1/search",
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    q: "test",
                    depth: "standard",
                    outputType: "searchResults",
                    maxResults: 1
                })
            }
        }),
    "searchapi-search": (apiKey)=>({
            url: `https://www.searchapi.io/api/v1/search?engine=google&q=test&api_key=${encodeURIComponent(apiKey)}`,
            init: {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            }
        }),
    "youcom-search": (apiKey)=>({
            url: "https://ydc-index.io/v1/search?query=test&count=1",
            init: {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "X-API-Key": apiKey
                }
            }
        }),
    "searxng-search": (apiKey, providerSpecificData = {})=>{
        const baseUrl = typeof providerSpecificData?.baseUrl === "string" && providerSpecificData.baseUrl.trim() ? providerSpecificData.baseUrl.trim().replace(/\/+$/, "") : "http://localhost:8888/search";
        const searchUrl = baseUrl.endsWith("/search") ? baseUrl : `${baseUrl}/search`;
        const headers = {
            Accept: "application/json"
        };
        if (apiKey) {
            headers["Authorization"] = `Bearer ${apiKey}`;
        }
        return {
            url: `${searchUrl}?q=test&format=json`,
            init: {
                method: "GET",
                headers
            }
        };
    },
    "ollama-search": (apiKey)=>({
            url: "https://ollama.com/api/web_search",
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    query: "test",
                    max_results: 1
                })
            }
        }),
    "zai-search": (apiKey, providerSpecificData = {})=>{
        const baseUrl = typeof providerSpecificData?.baseUrl === "string" && providerSpecificData.baseUrl.trim() ? providerSpecificData.baseUrl.trim().replace(/\/+$/, "") : "https://api.z.ai/api/mcp/web_search_prime/mcp";
        return {
            url: baseUrl,
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "tools/call",
                    params: {
                        name: "web_search_prime",
                        arguments: {
                            search_query: "test"
                        }
                    },
                    id: 1
                })
            }
        };
    },
    // ── Web-fetch providers (#4401) ──
    // firecrawl / jina-reader were added as webFetch-kind providers in #2645 with their
    // own executors but no validator, so the dashboard "Validate" step returned
    // "Provider validation not supported" and accounts could not be added through the UI.
    // Probe each provider's real fetch endpoint with the same Bearer auth the executor
    // uses; validateSearchProvider maps 200/<500 → valid, 401/403 → invalid key,
    // >=500 → failure (a credit-exhausted / rate-limited key still validates).
    firecrawl: (apiKey, providerSpecificData = {})=>{
        const envBase = process.env.FIRECRAWL_BASE_URL?.trim();
        const baseUrl = envBase ? envBase.replace(/\/+$/, "") : typeof providerSpecificData?.baseUrl === "string" && providerSpecificData.baseUrl.trim() ? providerSpecificData.baseUrl.trim().replace(/\/+$/, "") : "https://api.firecrawl.dev";
        const headers = {
            "Content-Type": "application/json"
        };
        if (apiKey) {
            headers["Authorization"] = `Bearer ${apiKey}`;
        }
        return {
            url: `${baseUrl}/v1/scrape`,
            init: {
                method: "POST",
                headers,
                body: JSON.stringify({
                    url: "https://example.com",
                    formats: [
                        "markdown"
                    ]
                })
            }
        };
    },
    "jina-reader": (apiKey)=>({
            url: "https://r.jina.ai/https://example.com",
            init: {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            }
        }),
    tinyfish: (apiKey)=>({
            url: "https://api.fetch.tinyfish.ai",
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": apiKey
                },
                body: JSON.stringify({
                    urls: [
                        "https://example.com"
                    ],
                    format: "markdown"
                })
            }
        })
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/embeddingProviders.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "validateClarifaiProvider",
    ()=>validateClarifaiProvider,
    "validateEmbeddingApiProvider",
    ()=>validateEmbeddingApiProvider,
    "validateRerankApiProvider",
    ()=>validateRerankApiProvider
]);
// Embedding / rerank / clarifai provider key validators. Extracted from validation.ts (god-file
// decomposition) — top-level functions with no dispatcher-state captures; behavior is byte-identical
// to the original inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function validateClarifaiProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl) || "https://api.clarifai.com/v2/ext/openai/v1";
    const modelsUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["addModelsSuffix"])(baseUrl);
    try {
        const modelsRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(modelsUrl, {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildClarifaiHeaders"])(apiKey, providerSpecificData)
        });
        if (modelsRes.ok) {
            return {
                valid: true,
                error: null,
                method: "clarifai_models"
            };
        }
        if (modelsRes.status === 401 || modelsRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        const chatUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveChatUrl"])("clarifai", baseUrl, providerSpecificData);
        const chatRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildClarifaiHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: providerSpecificData?.validationModelId || "openai/chat-completion/models/gpt-oss-120b",
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        });
        if (chatRes.ok || chatRes.status === 400 || chatRes.status === 422 || chatRes.status === 429) {
            return {
                valid: true,
                error: null,
                method: "clarifai_chat_probe"
            };
        }
        if (chatRes.status === 401 || chatRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (chatRes.status === 404 || chatRes.status === 405) {
            return {
                valid: false,
                error: "Provider validation endpoint not supported"
            };
        }
        if (chatRes.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${chatRes.status})`
            };
        }
        return {
            valid: true,
            error: null,
            method: "clarifai_chat_probe"
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateEmbeddingApiProvider({ apiKey, providerSpecificData = {}, url, modelId }) {
    if (!url) {
        return {
            valid: false,
            error: "Missing embedding endpoint"
        };
    }
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(url, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: providerSpecificData?.validationModelId || modelId,
                input: [
                    "test"
                ]
            })
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.ok || response.status === 400 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateRerankApiProvider({ apiKey, providerSpecificData = {}, url, modelId }) {
    if (!url) {
        return {
            valid: false,
            error: "Missing rerank endpoint"
        };
    }
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(url, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: providerSpecificData?.validationModelId || modelId,
                query: "test",
                documents: [
                    "test"
                ],
                top_n: 1,
                return_documents: false
            })
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (response.ok || response.status === 400 || response.status === 422 || response.status === 429) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/config/bedrock.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BEDROCK_DASHBOARD_DEFAULT_REGION",
    ()=>BEDROCK_DASHBOARD_DEFAULT_REGION,
    "BEDROCK_DEFAULT_REGION",
    ()=>BEDROCK_DEFAULT_REGION,
    "buildBedrockControlBaseUrl",
    ()=>buildBedrockControlBaseUrl,
    "buildBedrockNativeConverseUrl",
    ()=>buildBedrockNativeConverseUrl,
    "buildBedrockNativeInferenceProfilesUrl",
    ()=>buildBedrockNativeInferenceProfilesUrl,
    "buildBedrockNativeModelsUrl",
    ()=>buildBedrockNativeModelsUrl,
    "buildBedrockRuntimeBaseUrl",
    ()=>buildBedrockRuntimeBaseUrl,
    "extractBedrockRegionFromBaseUrl",
    ()=>extractBedrockRegionFromBaseUrl,
    "getBedrockKnownModelLimits",
    ()=>getBedrockKnownModelLimits,
    "normalizeBedrockDiscoveredModels",
    ()=>normalizeBedrockDiscoveredModels,
    "normalizeBedrockRegion",
    ()=>normalizeBedrockRegion,
    "resolveBedrockRegion",
    ()=>resolveBedrockRegion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modelSpecs.ts [middleware] (ecmascript)");
;
const BEDROCK_DEFAULT_REGION = "us-east-1";
const BEDROCK_DASHBOARD_DEFAULT_REGION = "eu-west-2";
const BEDROCK_REGION_PATTERN = /^[a-z]{2}(?:-gov)?-[a-z]+-\d+$/i;
function normalizeBedrockRegion(value, fallback = BEDROCK_DEFAULT_REGION) {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim().toLowerCase();
    return BEDROCK_REGION_PATTERN.test(trimmed) ? trimmed : fallback;
}
function extractBedrockRegionFromBaseUrl(value) {
    if (!value) return null;
    try {
        const hostname = new URL(value).hostname;
        const match = hostname.match(/^bedrock(?:-runtime|-mantle)?\.([a-z0-9-]+)\./i);
        return match?.[1] ? normalizeBedrockRegion(match[1], "") || null : null;
    } catch  {
        return null;
    }
}
function resolveBedrockRegion(providerSpecificData) {
    const data = providerSpecificData && typeof providerSpecificData === "object" ? providerSpecificData : {};
    const explicit = normalizeBedrockRegion(data.region, "");
    if (explicit) return explicit;
    const baseUrl = typeof data.baseUrl === "string" ? data.baseUrl : null;
    return extractBedrockRegionFromBaseUrl(baseUrl) || BEDROCK_DEFAULT_REGION;
}
function buildBedrockControlBaseUrl(region) {
    return `https://bedrock.${normalizeBedrockRegion(region)}.amazonaws.com`;
}
function buildBedrockRuntimeBaseUrl(region) {
    return `https://bedrock-runtime.${normalizeBedrockRegion(region)}.amazonaws.com`;
}
function buildBedrockNativeModelsUrl(region) {
    return `${buildBedrockControlBaseUrl(region)}/foundation-models?byOutputModality=TEXT`;
}
function buildBedrockNativeInferenceProfilesUrl(region, options = {}) {
    const url = new URL(`${buildBedrockControlBaseUrl(region)}/inference-profiles`);
    url.searchParams.set("maxResults", "100");
    url.searchParams.set("typeEquals", options.typeEquals || "SYSTEM_DEFINED");
    if (options.nextToken) url.searchParams.set("nextToken", options.nextToken);
    return url.toString();
}
function buildBedrockNativeConverseUrl(region, modelId, stream = false) {
    const encodedModel = encodeURIComponent(modelId);
    return `${buildBedrockRuntimeBaseUrl(region)}/model/${encodedModel}/${stream ? "converse-stream" : "converse"}`;
}
function modelIdFromArn(value) {
    if (typeof value !== "string") return null;
    const marker = ":foundation-model/";
    const idx = value.indexOf(marker);
    if (idx < 0) return null;
    const id = value.slice(idx + marker.length).trim();
    return id || null;
}
function getBedrockKnownModelLimits(modelId) {
    const trimmed = typeof modelId === "string" ? modelId.trim() : "";
    if (!trimmed) return null;
    const unqualified = trimmed.includes("/") ? trimmed.slice(trimmed.indexOf("/") + 1) : trimmed;
    const withoutProfilePrefix = unqualified.replace(/^(?:eu|us|global)\./i, "");
    const withoutProviderPrefix = withoutProfilePrefix.replace(/^anthropic\./i, "");
    const spec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getModelSpec"])(trimmed) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getModelSpec"])(unqualified) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getModelSpec"])(withoutProfilePrefix) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getModelSpec"])(withoutProviderPrefix);
    if (!spec?.contextWindow && !spec?.maxOutputTokens) return null;
    return {
        ...typeof spec.contextWindow === "number" ? {
            inputTokenLimit: spec.contextWindow
        } : {},
        ...typeof spec.maxOutputTokens === "number" ? {
            outputTokenLimit: spec.maxOutputTokens
        } : {}
    };
}
function withKnownBedrockLimits(model) {
    return {
        ...model,
        ...getBedrockKnownModelLimits(model.id) || {}
    };
}
function normalizeBedrockDiscoveredModels(foundationModelsResponse, inferenceProfilesResponse = null) {
    const byId = new Map();
    const add = (model)=>{
        if (!model.id || byId.has(model.id)) return;
        byId.set(model.id, model);
    };
    const foundationModels = foundationModelsResponse && typeof foundationModelsResponse === "object" ? foundationModelsResponse.modelSummaries : null;
    if (Array.isArray(foundationModels)) {
        for (const item of foundationModels){
            const model = item && typeof item === "object" ? item : {};
            const id = typeof model.modelId === "string" ? model.modelId.trim() : "";
            if (!id) continue;
            const outputModalities = Array.isArray(model.outputModalities) ? model.outputModalities : [];
            const inputModalities = Array.isArray(model.inputModalities) ? model.inputModalities : [];
            add(withKnownBedrockLimits({
                id,
                name: typeof model.modelName === "string" && model.modelName.trim() ? model.modelName : id,
                source: "foundation",
                provider: typeof model.providerName === "string" ? model.providerName : null,
                supportsStreaming: model.responseStreamingSupported === true,
                supportsVision: inputModalities.includes("IMAGE") || outputModalities.includes("IMAGE")
            }));
        }
    }
    const profiles = inferenceProfilesResponse && typeof inferenceProfilesResponse === "object" ? inferenceProfilesResponse.inferenceProfileSummaries : null;
    if (Array.isArray(profiles)) {
        for (const item of profiles){
            const profile = item && typeof item === "object" ? item : {};
            const id = typeof profile.inferenceProfileId === "string" ? profile.inferenceProfileId.trim() : "";
            if (id) {
                add(withKnownBedrockLimits({
                    id,
                    name: typeof profile.inferenceProfileName === "string" && profile.inferenceProfileName.trim() ? profile.inferenceProfileName : id,
                    source: "inference_profile",
                    supportsStreaming: true
                }));
            }
            const models = Array.isArray(profile.models) ? profile.models : [];
            for (const profileModel of models){
                const modelRecord = profileModel && typeof profileModel === "object" ? profileModel : {};
                const modelId = modelIdFromArn(modelRecord.modelArn);
                if (modelId) {
                    add(withKnownBedrockLimits({
                        id: modelId,
                        name: modelId,
                        source: "foundation",
                        supportsStreaming: true
                    }));
                }
            }
        }
    }
    return [
        ...byId.values()
    ].sort((a, b)=>a.id.localeCompare(b.id));
}
}),
"[project]/open-sse/services/bedrock.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BedrockNativeApiError",
    ()=>BedrockNativeApiError,
    "buildBedrockNativeHeaders",
    ()=>buildBedrockNativeHeaders,
    "discoverBedrockNativeModels",
    ()=>discoverBedrockNativeModels,
    "isBedrockNativeApiError",
    ()=>isBedrockNativeApiError,
    "isBedrockNativeAuthError",
    ()=>isBedrockNativeAuthError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$bedrock$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/bedrock.ts [middleware] (ecmascript)");
;
class BedrockNativeApiError extends Error {
    status;
    url;
    body;
    constructor(message, options){
        super(message);
        this.name = "BedrockNativeApiError";
        this.status = typeof options.status === "number" ? options.status : null;
        this.url = options.url;
        this.body = options.body ?? null;
    }
}
function isBedrockNativeApiError(error) {
    return error instanceof BedrockNativeApiError;
}
function isBedrockNativeAuthError(error) {
    return isBedrockNativeApiError(error) && (error.status === 401 || error.status === 403);
}
function buildBedrockNativeHeaders(apiKey, extraHeaders = {}) {
    return {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...apiKey ? {
            Authorization: "Bearer " + apiKey
        } : {},
        ...extraHeaders
    };
}
async function readJsonOrText(response) {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch  {
        return text;
    }
}
function getErrorMessage(body, fallback) {
    if (body && typeof body === "object") {
        const record = body;
        const message = record.message || record.Message || record.error || record.errorMessage;
        if (typeof message === "string" && message.trim()) return message.trim();
    }
    if (typeof body === "string" && body.trim()) return body.trim();
    return fallback;
}
async function fetchBedrockJson(fetcher, url, apiKey, init = {}) {
    const headers = buildBedrockNativeHeaders(apiKey, {
        ...init.headers || {}
    });
    const response = await fetcher(url, {
        ...init,
        method: init.method || "GET",
        headers
    });
    const body = await readJsonOrText(response);
    if (!response.ok) {
        throw new BedrockNativeApiError(getErrorMessage(body, "Bedrock API request failed with " + response.status), {
            status: response.status,
            url,
            body
        });
    }
    return body;
}
async function fetchInferenceProfiles(fetcher, region, apiKey) {
    const summaries = [];
    let nextToken = null;
    do {
        const data = await fetchBedrockJson(fetcher, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$bedrock$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBedrockNativeInferenceProfilesUrl"])(region, {
            nextToken
        }), apiKey);
        const record = data && typeof data === "object" ? data : {};
        const pageSummaries = Array.isArray(record.inferenceProfileSummaries) ? record.inferenceProfileSummaries : [];
        summaries.push(...pageSummaries);
        nextToken = typeof record.nextToken === "string" && record.nextToken ? record.nextToken : null;
    }while (nextToken)
    return {
        inferenceProfileSummaries: summaries
    };
}
async function discoverBedrockNativeModels({ apiKey, providerSpecificData, fetcher = fetch }) {
    const region = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$bedrock$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveBedrockRegion"])(providerSpecificData);
    const foundationModelsResponse = await fetchBedrockJson(fetcher, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$bedrock$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBedrockNativeModelsUrl"])(region), apiKey);
    let inferenceProfilesResponse = {
        inferenceProfileSummaries: []
    };
    const warnings = [];
    try {
        inferenceProfilesResponse = await fetchInferenceProfiles(fetcher, region, apiKey);
    } catch (error) {
        if (isBedrockNativeAuthError(error)) {
            throw error;
        }
        const message = error instanceof Error ? error.message : String(error || "unknown error");
        warnings.push("Bedrock inference profiles unavailable: " + message);
    }
    return {
        region,
        foundationModelsResponse,
        inferenceProfilesResponse,
        models: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$bedrock$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBedrockDiscoveredModels"])(foundationModelsResponse, inferenceProfilesResponse),
        warnings
    };
}
}),
"[project]/src/lib/providers/validation/cozeError.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractCozeValidationError",
    ()=>extractCozeValidationError
]);
// #5426 — Coze surfaces key-validation failures as a JSON envelope shaped like
// `{ "code": 4100, "msg": "...", "logId": "...", "from": "bot-api" }`. Left
// untranslated, that raw envelope (logId included) leaks verbatim into the
// connection-validation UI. This pure helper recognizes the Coze shape and
// composes a friendly, leak-free message so callers can surface it instead of
// the raw body. Kept in its own leaf module (no network deps) so it is unit-
// testable in isolation.
function asRecord(value) {
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
        } catch  {
            return null;
        }
    }
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function extractCozeValidationError(body) {
    const record = asRecord(body);
    if (!record) return null;
    const msg = typeof record.msg === "string" ? record.msg.trim() : "";
    const from = typeof record.from === "string" ? record.from : "";
    const logId = typeof record.logId === "string" ? record.logId.trim() : "";
    const looksLikeCoze = msg !== "" || from === "bot-api" || logId !== "";
    if (!looksLikeCoze) return null;
    const code = record.code;
    const codeStr = typeof code === "number" ? String(code) : typeof code === "string" && code.trim() !== "" ? code.trim() : "";
    const detail = msg || "the API key was rejected";
    return codeStr ? `Coze rejected the key: ${detail} (code ${codeStr})` : `Coze rejected the key: ${detail}`;
}
}),
"[project]/src/lib/providers/validation/openaiFormat.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "validateBedrockProvider",
    ()=>validateBedrockProvider,
    "validateCommandCodeProvider",
    ()=>validateCommandCodeProvider,
    "validateGeminiLikeProvider",
    ()=>validateGeminiLikeProvider,
    "validateHuggingFaceProvider",
    ()=>validateHuggingFaceProvider,
    "validateOpenAICompatibleProvider",
    ()=>validateOpenAICompatibleProvider,
    "validateOpenAILikeProvider",
    ()=>validateOpenAILikeProvider
]);
// OpenAI/Gemini-format + Bedrock provider key validators (bedrock, openai-like, command-code, gemini-like, openai-compatible).
// Extracted from validation.ts (god-file decomposition) — top-level functions; behavior is
// byte-identical to the original inline defs.
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bedrock$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/bedrock.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/directChatProbe.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cozeError$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/cozeError.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
async function validateBedrockProvider({ apiKey, providerSpecificData = {} }) {
    if (!apiKey) {
        return {
            valid: false,
            error: "Provider and API key required"
        };
    }
    try {
        const discovery = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bedrock$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["discoverBedrockNativeModels"])({
            apiKey,
            providerSpecificData,
            fetcher: (url, init)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(url, init)
        });
        return {
            valid: true,
            error: null,
            method: "bedrock_native_models",
            warning: discovery.warnings[0] || null
        };
    } catch (error) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bedrock$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isBedrockNativeAuthError"])(error)) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$bedrock$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isBedrockNativeApiError"])(error)) {
            if (error.status === 429) {
                return {
                    valid: true,
                    error: null,
                    warning: "Bedrock accepted the key but model discovery is rate limited",
                    method: "bedrock_native_models"
                };
            }
            if (typeof error.status === "number" && error.status >= 500) {
                return {
                    valid: false,
                    error: `Provider unavailable (${error.status})`
                };
            }
            if (typeof error.status === "number") {
                return {
                    valid: false,
                    error: `Bedrock validation failed: ${error.status}`
                };
            }
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateOpenAILikeProvider({ provider = "openai", apiKey, baseUrl, headers = {}, modelId = "gpt-3.5-turbo", providerSpecificData, modelsUrl = "", isLocal = false }) {
    try {
        // Guard against a non-string modelsUrl reaching .trim()/.startsWith() — a malformed
        // providerSpecificData / registry value would otherwise throw a TypeError mid-validation
        // ("trim is not a function" / "startsWith is not a function"). See #2463 class.
        const customModelsUrl = (typeof modelsUrl === "string" ? modelsUrl.trim() : "") || "";
        const endpointUrl = customModelsUrl ? customModelsUrl.startsWith("http") ? customModelsUrl : `${baseUrl.replace(/\/+$/, "")}/${customModelsUrl.replace(/^\/+/, "")}` : // so an OpenAI-style baseUrl validates against /v1/models, not /v1/chat/completions/models.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["addModelsSuffix"])(baseUrl);
        const requestUrl = typeof providerSpecificData?.modelsUrl === "string" && providerSpecificData.modelsUrl.trim() !== "" ? providerSpecificData.modelsUrl.trim() : endpointUrl;
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(requestUrl, {
            headers: {
                ...headers,
                ...apiKey ? {
                    Authorization: `Bearer ${apiKey}`
                } : {}
            }
        }, isLocal);
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status === 401) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // #2929: A 403 on the models endpoint is not always a bad key. Some providers
        // (e.g. Fireworks Fire Pass `fpk_*` keys) return "...not authorized for this
        // route." on /models while still serving chat. Fall through to the chat probe
        // for such route-restriction 403s instead of declaring the key invalid.
        if (response.status === 403) {
            const forbiddenBody = await response.text().catch(()=>"");
            if (!/not authorized for this route/i.test(forbiddenBody)) {
                return {
                    valid: false,
                    error: "Invalid API key"
                };
            }
        }
        const chatUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveChatUrl"])(provider, baseUrl, providerSpecificData);
        if (!chatUrl) {
            return {
                valid: false,
                error: `Validation failed: ${response.status}`
            };
        }
        const testModelId = providerSpecificData?.validationModelId || modelId;
        const testBody = {
            model: testModelId,
            messages: [
                {
                    role: "user",
                    content: "test"
                }
            ],
            max_tokens: 1
        };
        const chatRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
            method: "POST",
            headers: {
                ...headers,
                ...apiKey ? {
                    Authorization: `Bearer ${apiKey}`
                } : {}
            },
            body: JSON.stringify(testBody)
        }, isLocal);
        if (chatRes.ok) {
            return {
                valid: true,
                error: null
            };
        }
        // #5426: Coze answers the chat probe with a JSON envelope ({ code, msg,
        // logId, from }) on a bad key. Translate it into a friendly message so the
        // raw envelope (logId included) never leaks into the connection UI. Scoped
        // to provider === "coze" so a non-Coze error body that happens to carry a
        // `msg` field is never mislabeled, and other providers' response bodies are
        // never consumed here — they fall through to the canned handling below.
        if (provider === "coze") {
            const chatErrorBody = await chatRes.text().catch(()=>"");
            const cozeError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cozeError$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["extractCozeValidationError"])(chatErrorBody);
            if (cozeError) {
                return {
                    valid: false,
                    error: cozeError
                };
            }
        }
        if (chatRes.status === 401 || chatRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (chatRes.status === 404 || chatRes.status === 405) {
            return {
                valid: false,
                error: "Provider validation endpoint not supported"
            };
        }
        if (chatRes.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${chatRes.status})`
            };
        }
        // #7284: A 429 on the chat probe means the key is accepted but this connection
        // is rate/concurrency limited (e.g. always-throttled free tiers like opencode-zen).
        // Keep valid:true (the key works) but surface a warning so the connection Test
        // does not read as an unqualified green when real traffic will hit 429s.
        // Mirrors validateBedrockProvider's existing 429 precedent above.
        if (chatRes.status === 429) {
            return {
                valid: true,
                error: null,
                warning: "Provider accepted the key but is rate limited (429)"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateCommandCodeProvider({ apiKey, providerSpecificData = {} }) {
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])("command-code");
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(entry?.baseUrl || "https://api.commandcode.ai");
    const chatPath = entry?.chatPath || "/alpha/generate";
    const url = `${baseUrl}${chatPath.startsWith("/") ? chatPath : `/${chatPath}`}`;
    const validationModelId = providerSpecificData?.validationModelId || entry?.models?.find((model)=>model.id === "deepseek/deepseek-v4-flash")?.id || "deepseek/deepseek-v4-flash";
    const { COMMAND_CODE_VERSION } = await __turbopack_context__.A("[project]/open-sse/executors/commandCode.ts [middleware] (ecmascript, async loader)");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$directChatProbe$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateDirectChatProvider"])({
        url,
        providerSpecificData,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "x-command-code-version": COMMAND_CODE_VERSION,
            "x-cli-environment": "external",
            "x-project-slug": "pi-cc",
            "x-taste-learning": "false",
            "x-co-flag": "false",
            "x-session-id": (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()
        },
        body: {
            config: {
                workingDir: "/workspace",
                date: new Date().toISOString().slice(0, 10),
                environment: "external",
                structure: [],
                isGitRepo: false,
                currentBranch: "",
                mainBranch: "",
                gitStatus: "",
                recentCommits: []
            },
            memory: "",
            taste: "",
            skills: "",
            permissionMode: "standard",
            params: {
                model: validationModelId,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                tools: [],
                system: "",
                max_tokens: 1,
                stream: true
            }
        }
    });
}
async function validateHuggingFaceProvider({ apiKey }) {
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])("https://huggingface.co/api/whoami-v2", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
        if (response.ok) {
            return {
                valid: true,
                error: null,
                method: "huggingface_whoami"
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Non-auth, non-OK status — surface as a transient upstream failure rather
        // than declaring the (potentially valid) fine-grained token invalid.
        return {
            valid: false,
            error: `HuggingFace token check returned ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateGeminiLikeProvider({ apiKey, baseUrl, providerSpecificData = {}, authType = "query", isLocal = false }) {
    try {
        if (!baseUrl) {
            return {
                valid: false,
                error: "Missing base URL"
            };
        }
        const normalizedAuthType = String(authType || "query").toLowerCase();
        // Strip a trailing /models before appending — the default Gemini registry baseUrl is
        // `.../v1beta/models` (for the chat urlBuilder), so naively appending /models produced
        // `.../v1beta/models/models` → upstream 404 on connection validation (#2545).
        const baseForModels = String(baseUrl).replace(/\/models\/?$/, "").replace(/\/$/, "");
        const requestUrl = typeof providerSpecificData?.modelsUrl === "string" && providerSpecificData.modelsUrl.trim() !== "" ? providerSpecificData.modelsUrl.trim() : `${baseForModels}/models`;
        // Use the correct auth header based on provider config:
        // - gemini (API key): x-goog-api-key
        // - Google OAuth access tokens (ya29.*): Bearer token
        const headers = {};
        let urlWithKey = requestUrl;
        if (typeof apiKey === "string" && apiKey.startsWith("ya29.")) {
            // A Google OAuth access token (ya29.*) must use Bearer auth even when the
            // connection is configured as an API-key provider. Checked first so authType
            // "apikey"/"header" doesn't shadow it with x-goog-api-key.
            headers["Authorization"] = `Bearer ${apiKey}`;
        } else if (normalizedAuthType === "header" || normalizedAuthType === "apikey") {
            headers["x-goog-api-key"] = apiKey;
        } else if (normalizedAuthType === "oauth" || normalizedAuthType === "bearer") {
            headers["Authorization"] = `Bearer ${apiKey}`;
        } else if (normalizedAuthType === "query") {
            urlWithKey = `${requestUrl}?key=${encodeURIComponent(apiKey)}`;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])(headers, providerSpecificData);
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(urlWithKey, {
            headers
        }, isLocal);
        if (response.ok) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status === 429) {
            return {
                valid: true,
                error: null
            };
        }
        if (response.status === 400 || response.status === 401 || response.status === 403) {
            const isAuthError = (body)=>{
                const message = (body?.error?.message || "").toLowerCase();
                const reason = body?.error?.details?.[0]?.reason || "";
                const status = body?.error?.status || "";
                const authPatterns = [
                    "api key not valid",
                    "api key expired",
                    "api key invalid",
                    "API_KEY_INVALID",
                    "API_KEY_EXPIRED",
                    "PERMISSION_DENIED",
                    "UNAUTHENTICATED"
                ];
                return authPatterns.some((p)=>message.includes(p.toLowerCase()) || reason === p || status === p);
            };
            try {
                const body = await response.json();
                if (isAuthError(body)) {
                    return {
                        valid: false,
                        error: "Invalid API key"
                    };
                }
                if (response.status === 401 || response.status === 403) {
                    return {
                        valid: false,
                        error: "Invalid API key"
                    };
                }
            } catch  {
                if (response.status === 401 || response.status === 403) {
                    return {
                        valid: false,
                        error: "Invalid API key"
                    };
                }
                return {
                    valid: false,
                    error: "Invalid API key"
                };
            }
        }
        return {
            valid: false,
            error: `Validation failed: ${response.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateOpenAICompatibleProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl);
    if (!baseUrl) {
        return {
            valid: false,
            error: "No base URL configured for OpenAI compatible provider"
        };
    }
    const validationModelId = typeof providerSpecificData?.validationModelId === "string" ? providerSpecificData.validationModelId.trim() : "";
    // Step 1: Try GET /models
    let modelsReachable = false;
    try {
        const modelsRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(`${baseUrl}/models`, {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData)
        });
        modelsReachable = true;
        if (modelsRes.ok) {
            return {
                valid: true,
                error: null,
                method: "models_endpoint"
            };
        }
        if (modelsRes.status === 401 || modelsRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Endpoint responded and auth seems valid, but quota is exhausted/rate-limited.
        if (modelsRes.status === 429) {
            return {
                valid: true,
                error: null,
                method: "models_endpoint",
                warning: "Rate limited, but credentials are valid"
            };
        }
    } catch  {
    // /models fetch failed (network error, etc.) — fall through to chat test
    }
    // T25: if /models cannot be used and no custom model was provided, return a
    // clear actionable message instead of a generic connection error.
    if (!validationModelId) {
        return {
            valid: false,
            error: "Endpoint /models unavailable. Provide a Model ID to validate via /chat/completions."
        };
    }
    // Step 2: Fallback — try a minimal chat completion request
    // Many providers don't expose /models but accept chat completions fine
    const apiType = providerSpecificData.apiType || "chat";
    const chatSuffix = apiType === "responses" ? "/responses" : "/chat/completions";
    const chatUrl = `${baseUrl}${chatSuffix}`;
    const testModelId = validationModelId;
    try {
        const chatRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: testModelId,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        });
        if (chatRes.ok) {
            return {
                valid: true,
                error: null,
                method: "chat_completions"
            };
        }
        if (chatRes.status === 401 || chatRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (chatRes.status === 429) {
            return {
                valid: true,
                error: null,
                method: "chat_completions",
                warning: "Rate limited, but credentials are valid"
            };
        }
        // If /models was reachable but returned non-auth error, and chat succeeds
        // auth-wise, this still confirms credentials are valid.
        if (chatRes.status === 400) {
            return {
                valid: true,
                error: null,
                method: "inference_available",
                warning: "Model ID may be invalid, but credentials are valid"
            };
        }
        // #2032: a 404 on the chat probe commonly means the requested model id
        // does not exist at this provider (OpenAI-compatible `model_not_found`,
        // e.g. Featherless/OpenRouter-style `vendor/model` typos). Credentials
        // are still valid (the endpoint responded), but silently passing this
        // hides the bad model id from the user until a real request later trips
        // the per-model lockout — surface it as a warning at Check time instead.
        if (chatRes.status === 404) {
            let modelNotFoundDetail = "";
            try {
                const body = await chatRes.json();
                const err = body?.error;
                if (typeof err?.message === "string" && err.message.trim()) {
                    modelNotFoundDetail = `: ${err.message.trim()}`;
                }
            } catch  {
            // Non-JSON or unreadable body — fall through with the generic warning.
            }
            return {
                valid: true,
                error: null,
                method: "inference_available",
                warning: `Model ID may not exist at this provider (404)${modelNotFoundDetail}`
            };
        }
        // 4xx other than auth (e.g. 400 bad model, 422) usually means auth passed
        if (chatRes.status >= 400 && chatRes.status < 500) {
            return {
                valid: true,
                error: null,
                method: "inference_available"
            };
        }
        if (chatRes.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${chatRes.status})`
            };
        }
    } catch  {
    // Chat test also failed — fall through to simple connectivity check
    }
    // Step 3: Final fallback — simple connectivity check
    // For local providers (Ollama, LM Studio, etc.) that may not respond to
    // standard OpenAI endpoints but are still reachable
    if (!modelsReachable) {
        return {
            valid: false,
            error: "Connection failed while testing /chat/completions"
        };
    }
    try {
        const pingRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(baseUrl, {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData)
        });
        // If the server responds at all (even with an error page), it's reachable
        if (pingRes.status < 500) {
            return {
                valid: true,
                error: null
            };
        }
        return {
            valid: false,
            error: `Provider unavailable (${pingRes.status})`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/anthropicFormat.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "validateAnthropicCompatibleProvider",
    ()=>validateAnthropicCompatibleProvider,
    "validateAnthropicLikeProvider",
    ()=>validateAnthropicLikeProvider,
    "validateClaudeCodeCompatibleProvider",
    ()=>validateClaudeCodeCompatibleProvider,
    "validateClaudeOAuthInline",
    ()=>validateClaudeOAuthInline
]);
// Anthropic/Claude-format provider key validators (anthropic-like, claude-oauth-inline, anthropic-compatible, claude-code-compatible).
// Extracted from validation.ts (god-file decomposition) — top-level functions; behavior is
// byte-identical to the original inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/claudeCodeCompatible.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function validateAnthropicLikeProvider({ apiKey, baseUrl, modelId = "claude-3-5-sonnet-20240620", headers = {}, providerSpecificData = {}, isLocal = false }) {
    try {
        if (!baseUrl) {
            return {
                valid: false,
                error: "Missing base URL"
            };
        }
        if (typeof apiKey === "string" && apiKey.startsWith("sk-ant-oat")) {
            return validateClaudeOAuthInline({
                apiKey,
                modelId,
                providerSpecificData
            });
        }
        const probeUrl = typeof providerSpecificData?.modelsUrl === "string" && providerSpecificData.modelsUrl.trim() !== "" ? providerSpecificData.modelsUrl.trim() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["addModelsSuffix"])(baseUrl);
        // Best-effort /models probe. It must not fail validation: canonical Claude
        // base URLs can already include a path/query (…/messages?beta=true).
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(probeUrl, {
                headers: {
                    "anthropic-version": "2023-06-01",
                    ...headers
                }
            }, isLocal);
        } catch  {
        // ignore probe failures
        }
        const requestUrl = typeof providerSpecificData?.modelsUrl === "string" && providerSpecificData.modelsUrl.trim() !== "" ? providerSpecificData.modelsUrl.trim() : "";
        if (requestUrl) {
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(requestUrl, {
                headers: {
                    "anthropic-version": "2023-06-01",
                    ...headers
                }
            }, isLocal);
            if (response.status === 401 || response.status === 403) {
                return {
                    valid: false,
                    error: "Invalid API key"
                };
            }
        }
        const requestHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
            "Content-Type": "application/json",
            ...headers
        }, providerSpecificData);
        if (!requestHeaders["x-api-key"] && !requestHeaders["X-API-Key"]) {
            requestHeaders["x-api-key"] = apiKey;
        }
        if (!requestHeaders["anthropic-version"] && !requestHeaders["Anthropic-Version"]) {
            requestHeaders["anthropic-version"] = "2023-06-01";
        }
        const testModelId = providerSpecificData?.validationModelId || modelId || "claude-3-5-sonnet-20241022";
        const chatResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(baseUrl, {
            method: "POST",
            headers: requestHeaders,
            body: JSON.stringify({
                model: testModelId,
                max_tokens: 1,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ]
            })
        }, isLocal);
        if (chatResponse.status === 401 || chatResponse.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateClaudeOAuthInline({ apiKey, modelId, providerSpecificData = {} }) {
    const testModelId = providerSpecificData?.validationModelId || modelId || "claude-haiku-4-5-20251001";
    try {
        const { getExecutor } = await __turbopack_context__.A("[project]/open-sse/executors/index.ts [middleware] (ecmascript, async loader)");
        const { response } = await getExecutor("claude").execute({
            model: testModelId,
            body: {
                model: testModelId,
                max_tokens: 1,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ]
            },
            stream: false,
            credentials: {
                accessToken: apiKey,
                providerSpecificData
            }
        });
        if (response.status === 401 || response.status === 403) {
            return {
                valid: false,
                error: "Invalid OAuth token"
            };
        }
        if (response.status >= 500) {
            return {
                valid: false,
                error: `Provider unavailable (${response.status})`
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateAnthropicCompatibleProvider({ apiKey, providerSpecificData = {}, isLocal = false }) {
    let baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeAnthropicBaseUrl"])(providerSpecificData.baseUrl);
    if (!baseUrl) {
        return {
            valid: false,
            error: "No base URL configured for Anthropic compatible provider"
        };
    }
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])({
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        Authorization: `Bearer ${apiKey}`
    }, providerSpecificData);
    // Step 1: Best-effort GET /models probe. /models is NOT part of the Anthropic API spec
    // and many compatible proxies either 404, 401, or 403 on /models even with a valid key —
    // so a 401/403 here must NOT mark the credentials invalid. Only a 2xx is a positive
    // signal that the proxy DOES implement /models AND the key was accepted; everything else
    // (including auth-shaped statuses) falls through to the authoritative POST /v1/messages
    // probe below. Ported from decolua/9router 584cf66a.
    try {
        const modelsRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["joinBaseUrlAndPath"])(baseUrl, providerSpecificData?.modelsPath || "/models"), {
            method: "GET",
            headers
        }, isLocal);
        if (modelsRes.ok) {
            return {
                valid: true,
                error: null
            };
        }
    } catch  {
    // /models fetch failed — fall through to messages test
    }
    // Step 2: Authoritative probe — POST /v1/messages with max_tokens=1.
    const testModelId = providerSpecificData?.validationModelId || "claude-3-5-sonnet-20241022";
    try {
        const messagesRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["joinBaseUrlAndPath"])(baseUrl, providerSpecificData?.chatPath || "/messages"), {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: testModelId,
                max_tokens: 1,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ]
            })
        }, isLocal);
        if (messagesRes.status === 401 || messagesRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Any other response (200, 400, 422, etc.) means auth passed
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateClaudeCodeCompatibleProvider({ apiKey, providerSpecificData = {} }) {
    const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeClaudeCodeCompatibleBaseUrl"])(providerSpecificData.baseUrl);
    if (!baseUrl) {
        return {
            valid: false,
            error: "No base URL configured for CC Compatible provider"
        };
    }
    const modelsPath = providerSpecificData?.modelsPath || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CLAUDE_CODE_COMPATIBLE_DEFAULT_MODELS_PATH"];
    const chatPath = providerSpecificData?.chatPath || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CLAUDE_CODE_COMPATIBLE_DEFAULT_CHAT_PATH"];
    const defaultHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildClaudeCodeCompatibleHeaders"])(apiKey, false), providerSpecificData);
    try {
        const modelsRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["joinClaudeCodeCompatibleUrl"])(baseUrl, modelsPath), {
            method: "GET",
            headers: defaultHeaders
        });
        if (modelsRes.ok) {
            return {
                valid: true,
                error: null,
                method: "models_endpoint"
            };
        }
        if (modelsRes.status === 401 || modelsRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
    } catch  {
    // Fall through to bridge request validation.
    }
    const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildClaudeCodeCompatibleValidationPayload"])(providerSpecificData?.validationModelId || "claude-sonnet-4-6");
    const sessionId = JSON.parse(payload.metadata.user_id).session_id;
    try {
        const messagesRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["joinClaudeCodeCompatibleUrl"])(baseUrl, chatPath), {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["applyCustomUserAgent"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$claudeCodeCompatible$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildClaudeCodeCompatibleHeaders"])(apiKey, true, sessionId), providerSpecificData),
            body: JSON.stringify(payload)
        });
        if (messagesRes.status === 401 || messagesRes.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (messagesRes.status === 429) {
            return {
                valid: true,
                error: null,
                method: "cc_bridge_request",
                warning: "Rate limited, but credentials are valid"
            };
        }
        if (messagesRes.status >= 400 && messagesRes.status < 500) {
            return {
                valid: true,
                error: null,
                method: "cc_bridge_request",
                warning: "Bridge request reached upstream, but the model or payload was rejected"
            };
        }
        return {
            valid: messagesRes.ok,
            error: messagesRes.ok ? null : `Validation failed: ${messagesRes.status}`,
            method: "cc_bridge_request"
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation/webCookie.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "bytezValidationResultFromStatus",
    ()=>bytezValidationResultFromStatus,
    "validateBytezProvider",
    ()=>validateBytezProvider,
    "validateWebCookieProvider",
    ()=>validateWebCookieProvider
]);
// Web-cookie session-ping validator + Bytez auth-only probe. Extracted from validation.ts
// (god-file decomposition) — top-level functions with no dispatcher-state captures; behavior is
// byte-identical to the original inline defs.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/web-cookie.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
async function validateWebCookieProvider({ provider, apiKey, providerSpecificData: _providerSpecificData = {} }) {
    try {
        const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(provider);
        const cookieProvider = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"][provider];
        if (!entry && !cookieProvider) {
            return {
                valid: false,
                error: "Provider not found in registry",
                unsupported: true
            };
        }
        // For web-cookie providers, apiKey contains the cookie string
        const cookie = (apiKey || "").trim();
        if (!cookie) {
            return {
                valid: false,
                error: "Cookie required for web-cookie provider",
                unsupported: false
            };
        }
        if (!entry) {
            // Providers listed in WEB_COOKIE_PROVIDERS without a providerRegistry entry (e.g.
            // gemini-business, poe-web, venice-web, v0-vercel-web) only expose a
            // marketing website URL, not a real API host. Probing `${website}/models`
            // does not reliably signal session validity for these —
            // live verification showed most return redirects or SPA 200s regardless of
            // cookie validity, which would silently report an expired/garbage cookie as
            // "OK" (worse than an honest "not supported"). Until each of these providers
            // has a verified, side-effect-free auth probe against its real API host, report
            // unsupported instead of a false positive.
            return {
                valid: false,
                error: "Provider validation not supported",
                unsupported: true
            };
        }
        // Attempt a minimal request to check if the session is valid
        // Use /models endpoint or a minimal completion request depending on the provider
        const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(entry.baseUrl || "");
        // Defense-in-depth: only an http(s) baseUrl without a query string is safe to
        // probe by blindly appending `/models`. A ws(s):// baseUrl (e.g. copilot-web) is
        // already rejected by the outbound URL guard downstream, but reject it explicitly
        // here for the honest "unsupported" result instead of a confusing security-block
        // message — this also covers a future http(s) baseUrl carrying a query string,
        // which the guard does not currently block (#7857 acceptance criteria).
        if (!/^https?:\/\//i.test(baseUrl) || baseUrl.includes("?")) {
            return {
                valid: false,
                error: "Provider validation not supported",
                unsupported: true
            };
        }
        const testUrl = `${baseUrl}/models`;
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(testUrl, {
            method: "GET",
            headers: {
                "User-Agent": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["STANDARD_USER_AGENT"],
                Cookie: cookie
            }
        }, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isLocalProvider"])(provider));
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "SESSION_EXPIRED",
                errorCode: "AUTH_007",
                unsupported: false
            };
        }
        // #7857: for providers whose baseUrl is a conversation/completion endpoint rather
        // than a real API root, the /models path never existed upstream — a redirect,
        // login-HTML 200, 404, 405, or 429 from it is not a meaningful auth signal and is
        // indistinguishable from a genuinely valid session. Report the same honest
        // "unsupported" result the !entry branch above already gives its no-registry
        // siblings, instead of a false `valid: true`.
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS_WITHOUT_MODELS_API"].has(provider)) {
            return {
                valid: false,
                error: "Provider validation not supported",
                unsupported: true
            };
        }
        // Any other response (200, 404, 405, 429, ...) means the cookie was accepted —
        // a 401/403 from the /models probe is the only definitive "session expired" signal
        // for web-cookie auth, so a non-auth status is treated as a valid session.
        return {
            valid: true,
            error: null,
            unsupported: false
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toWebCookieValidationErrorResult"])(provider, error);
    }
}
function bytezValidationResultFromStatus(status) {
    if (status === 200) {
        return {
            valid: true,
            error: null
        };
    }
    if (status === 401 || status === 403) {
        return {
            valid: false,
            error: "Invalid API key"
        };
    }
    return {
        valid: false,
        error: `Validation failed: ${status}`
    };
}
async function validateBytezProvider({ apiKey, providerSpecificData = {} }) {
    try {
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])("https://api.bytez.com/models/v2/list/tasks", {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData)
        });
        return bytezValidationResultFromStatus(res.status);
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/oauth/services/kiro.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KiroService",
    ()=>KiroService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/constants/oauth.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/kiroExternalIdp.ts [middleware] (ecmascript)");
;
;
/**
 * Kiro OAuth Service
 * Supports multiple authentication methods:
 * 1. AWS Builder ID (Device Code Flow)
 * 2. AWS IAM Identity Center/IDC (Device Code Flow)
 * 3. Google/GitHub Social Login (Authorization Code Flow + Manual Callback)
 * 4. Import Token (Manual refresh token paste)
 */ const KIRO_AUTH_SERVICE = "https://prod.us-east-1.auth.desktop.kiro.dev";
class KiroService {
    /**
   * Register OIDC client with AWS SSO
   * Returns clientId and clientSecret for device code flow
   */ async registerClient(region = "us-east-1") {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["assertValidAwsRegion"])(region);
        const endpoint = `https://oidc.${region}.amazonaws.com/client/register`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                clientName: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["KIRO_CONFIG"].clientName,
                clientType: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["KIRO_CONFIG"].clientType,
                scopes: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["KIRO_CONFIG"].scopes,
                grantTypes: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["KIRO_CONFIG"].grantTypes,
                issuerUrl: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["KIRO_CONFIG"].issuerUrl
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to register client: ${error}`);
        }
        const data = await response.json();
        return {
            clientId: data.clientId,
            clientSecret: data.clientSecret,
            clientSecretExpiresAt: data.clientSecretExpiresAt
        };
    }
    /**
   * Start device authorization for AWS Builder ID or IDC
   */ async startDeviceAuthorization(clientId, clientSecret, startUrl, region = "us-east-1") {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["assertValidAwsRegion"])(region);
        const endpoint = `https://oidc.${region}.amazonaws.com/device_authorization`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                clientId,
                clientSecret,
                startUrl
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to start device authorization: ${error}`);
        }
        const data = await response.json();
        return {
            deviceCode: data.deviceCode,
            userCode: data.userCode,
            verificationUri: data.verificationUri,
            verificationUriComplete: data.verificationUriComplete,
            expiresIn: data.expiresIn,
            interval: data.interval || 5
        };
    }
    /**
   * Poll for token using device code (AWS Builder ID/IDC)
   */ async pollDeviceToken(clientId, clientSecret, deviceCode, region = "us-east-1") {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["assertValidAwsRegion"])(region);
        const endpoint = `https://oidc.${region}.amazonaws.com/token`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                clientId,
                clientSecret,
                deviceCode,
                grantType: "urn:ietf:params:oauth:grant-type:device_code"
            })
        });
        const data = await response.json();
        // Handle pending/slow_down/errors
        if (!response.ok || data.error) {
            return {
                success: false,
                error: data.error,
                errorDescription: data.error_description,
                pending: data.error === "authorization_pending" || data.error === "slow_down"
            };
        }
        return {
            success: true,
            tokens: {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expiresIn: data.expiresIn,
                tokenType: data.tokenType
            }
        };
    }
    /**
   * Build Google/GitHub social login URL
   * Returns authorization URL for manual callback flow
   * Uses kiro:// custom protocol as required by AWS Cognito whitelist
   */ buildSocialLoginUrl(provider, codeChallenge, state) {
        const idp = provider === "google" ? "Google" : "Github";
        // AWS Cognito only whitelists kiro:// protocol, not localhost
        const redirectUri = "kiro://kiro.kiroAgent/authenticate-success";
        return `${KIRO_AUTH_SERVICE}/login?idp=${idp}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}&prompt=select_account`;
    }
    /**
   * Exchange authorization code for tokens (Social Login)
   * Must use same redirect_uri as authorization request
   */ async exchangeSocialCode(code, codeVerifier) {
        // Must match the redirect_uri used in buildSocialLoginUrl
        const redirectUri = "kiro://kiro.kiroAgent/authenticate-success";
        const response = await fetch(`${KIRO_AUTH_SERVICE}/oauth/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code,
                code_verifier: codeVerifier,
                redirect_uri: redirectUri
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Token exchange failed: ${error}`);
        }
        const data = await response.json();
        return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            profileArn: data.profileArn,
            expiresIn: data.expiresIn || 3600
        };
    }
    /**
   * Refresh token using refresh token
   */ async refreshToken(refreshToken, providerSpecificData = {}) {
        const { authMethod, clientId, clientSecret, region } = providerSpecificData;
        // Enterprise / Microsoft Entra "Your organization" (external_idp) login: refresh with a
        // standard public-client OAuth2 refresh_token grant against the org IdP's tokenEndpoint
        // (form-encoded client_id + refresh_token + scope, no client_secret). The AWS SSO OIDC and
        // Kiro social endpoints cannot refresh these tokens.
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isExternalIdpAuthMethod"])(authMethod)) {
            const refreshRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$kiroExternalIdp$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildExternalIdpRefreshParams"])(refreshToken, providerSpecificData);
            const response = await fetch(refreshRequest.tokenEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json"
                },
                body: refreshRequest.body
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Token refresh failed: ${error}`);
            }
            const data = await response.json();
            return {
                accessToken: data.access_token,
                refreshToken: data.refresh_token || refreshToken,
                expiresIn: data.expires_in || 3600
            };
        }
        // AWS SSO OIDC refresh (Builder ID or IDC).
        // Imported social tokens (authMethod === "imported") have a registered clientId/clientSecret
        // but a Kiro-social refresh token the OIDC client can't refresh — use the social path (#2467).
        if (clientId && clientSecret && authMethod !== "imported") {
            const resolvedRegion = region || "us-east-1";
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["assertValidAwsRegion"])(resolvedRegion);
            const endpoint = `https://oidc.${resolvedRegion}.amazonaws.com/token`;
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    clientId,
                    clientSecret,
                    refreshToken,
                    grantType: "refresh_token"
                })
            });
            if (!response.ok) {
                // Client credentials may be expired or invalid (DB import, TTL, browser conflict).
                // Re-register a fresh OIDC client and retry once before giving up (#2524).
                console.warn("[kiro refresh] OIDC refresh failed, attempting client re-registration...");
                try {
                    const newReg = await this.registerClient(resolvedRegion);
                    const retryRes = await fetch(endpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            clientId: newReg.clientId,
                            clientSecret: newReg.clientSecret,
                            refreshToken,
                            grantType: "refresh_token"
                        })
                    });
                    if (retryRes.ok) {
                        const retryData = await retryRes.json();
                        return {
                            accessToken: retryData.accessToken,
                            refreshToken: retryData.refreshToken || refreshToken,
                            expiresIn: retryData.expiresIn || 3600,
                            _newClientId: newReg.clientId,
                            _newClientSecret: newReg.clientSecret,
                            _newClientSecretExpiresAt: newReg.clientSecretExpiresAt
                        };
                    } else {
                        const retryError = await retryRes.text();
                        throw new Error(`Token refresh retry failed after re-registration: ${retryError}`);
                    }
                } catch (reRegErr) {
                    if (reRegErr.message?.includes("Token refresh retry failed")) throw reRegErr;
                    console.warn("[kiro refresh] Re-registration fallback failed:", reRegErr);
                }
                const error = await response.text();
                throw new Error(`Token refresh failed: ${error}`);
            }
            const data = await response.json();
            return {
                // Builder ID / IDC OIDC refresh: no profileArn (the social path supplies
                // one; Builder ID connections legitimately have none). expiresIn falls
                // back to 3600 so the import route never computes Date(NaN) if upstream
                // omits it (the social path already guards the same way).
                accessToken: data.accessToken,
                refreshToken: data.refreshToken || refreshToken,
                expiresIn: data.expiresIn || 3600
            };
        }
        // Social auth refresh (Google/GitHub)
        const response = await fetch(`${KIRO_AUTH_SERVICE}/refreshToken`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                refreshToken
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Token refresh failed: ${error}`);
        }
        const data = await response.json();
        return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken || refreshToken,
            profileArn: data.profileArn,
            expiresIn: data.expiresIn || 3600
        };
    }
    /**
   * Validate and import refresh token.
   * First attempts to validate using cached AWS SSO client credentials (Builder ID path).
   * If that fails or no cached credentials exist, registers a dedicated OIDC client.
   * If registerClient() also fails, the import falls back to the shared social-auth refresh path.
   */ async validateImportToken(refreshToken, region = "us-east-1", clientIdHint) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["assertValidAwsRegion"])(region);
        // Validate token format
        if (!refreshToken.startsWith("aorAAAAAG")) {
            throw new Error("Invalid token format. Token should start with aorAAAAAG...");
        }
        // Try to read cached clientId/clientSecret from AWS SSO cache (Builder ID tokens).
        // When the caller knows the token's own clientId (#1253 — e.g. surfaced by
        // auto-import from a direct `clientId` field on the token file), pass it
        // through so the cache lookup can match it exactly instead of guessing via
        // region + latest-expiry, which can silently adopt an unrelated stale
        // client registration on hosts with multiple cached SSO sessions.
        const cachedClient = await this.readCachedClientCredentials(region, clientIdHint);
        // Attempt 1: Try Builder ID refresh using cached credentials
        if (cachedClient) {
            try {
                const result = await this.refreshToken(refreshToken, {
                    clientId: cachedClient.clientId,
                    clientSecret: cachedClient.clientSecret,
                    authMethod: "builder-id",
                    // Forward the requested region so a non-us-east-1 Builder ID validates
                    // against the right OIDC endpoint instead of defaulting to us-east-1.
                    region
                });
                return {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken || refreshToken,
                    // profileArn is intentionally absent for Builder ID (OIDC) imports —
                    // only the social-auth path returns one, and Builder ID connections
                    // don't require it. The Kiro executor adds profileArn conditionally.
                    profileArn: result.profileArn,
                    expiresIn: result.expiresIn,
                    authMethod: "builder-id",
                    clientId: cachedClient.clientId,
                    clientSecret: cachedClient.clientSecret
                };
            } catch  {
            // Cached credentials didn't work, fall through
            }
        }
        // Attempt 2: Try social auth refresh
        let result;
        try {
            result = await this.refreshToken(refreshToken);
        } catch (error) {
            throw new Error(`Token validation failed: ${error.message}`);
        }
        // Register an independent OIDC client for this connection so multiple accounts
        // do not share a single Kiro backend session (issue #2328).
        let clientId;
        let clientSecret;
        let clientSecretExpiresAt;
        try {
            const registration = await this.registerClient(region);
            clientId = registration.clientId;
            clientSecret = registration.clientSecret;
            clientSecretExpiresAt = registration.clientSecretExpiresAt;
        } catch (err) {
            console.warn("[kiro import] registerClient failed, continuing without isolated client:", err);
        }
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken || refreshToken,
            profileArn: result.profileArn,
            expiresIn: result.expiresIn,
            authMethod: "imported",
            ...clientId ? {
                clientId,
                clientSecret,
                clientSecretExpiresAt
            } : {}
        };
    }
    /**
   * Read clientId/clientSecret from AWS SSO cache (for Builder ID tokens).
   * The cache is located at ~/.aws/sso/cache/ and contains JSON files from
   * the OIDC client registration step of the device code flow.
   */ async readCachedClientCredentials(region, clientIdHint) {
        try {
            const { readdir, readFile } = await __turbopack_context__.A("[externals]/fs/promises [external] (fs/promises, cjs, async loader)");
            const { homedir } = await __turbopack_context__.A("[externals]/os [external] (os, cjs, async loader)");
            const { join } = await __turbopack_context__.A("[externals]/path [external] (path, cjs, async loader)");
            const cachePath = join(homedir(), ".aws", "sso", "cache");
            const files = await readdir(cachePath);
            const candidates = [];
            for (const file of files){
                if (!file.endsWith(".json")) continue;
                try {
                    const content = await readFile(join(cachePath, file), "utf-8");
                    const data = JSON.parse(content);
                    if (data.clientId && data.clientSecret) {
                        candidates.push({
                            clientId: data.clientId,
                            clientSecret: data.clientSecret,
                            region: data.region,
                            expiresAt: data.clientSecretExpiresAt || data.expiresAt
                        });
                    }
                } catch  {
                    continue;
                }
            }
            if (candidates.length === 0) return null;
            // When the caller knows the token's own clientId (#1253), an exact match
            // is authoritative — it identifies the one registration that can actually
            // refresh this token, regardless of region or expiry. Falling through to
            // the region/latest-expiry heuristic below for an unmatched hint would
            // silently adopt an unrelated (and non-working) client pair.
            if (clientIdHint) {
                const exactMatch = candidates.find((c)=>c.clientId === clientIdHint);
                if (exactMatch) {
                    return {
                        clientId: exactMatch.clientId,
                        clientSecret: exactMatch.clientSecret
                    };
                }
            }
            // A host can cache OIDC client registrations for several SSO sessions;
            // adopting the wrong pair makes the Builder ID refresh fail. Prefer a
            // registration whose region matches the requested import region, then —
            // among the candidates — the one with the latest secret expiry, instead
            // of blindly taking the first file readdir happens to return.
            const byLatestExpiry = (a, b)=>String(b.expiresAt || "").localeCompare(String(a.expiresAt || ""));
            const matching = region ? candidates.filter((c)=>c.region === region) : [];
            const ordered = (matching.length > 0 ? matching : candidates).slice().sort(byLatestExpiry);
            const best = ordered[0];
            return {
                clientId: best.clientId,
                clientSecret: best.clientSecret
            };
        } catch  {
        // Cache not available
        }
        return null;
    }
    /**
   * List available CodeWhisperer profiles for an access token or long-lived API key.
   * Some long-lived API keys can call GenerateAssistantResponse but are explicitly
   * denied on ListAvailableProfiles, so callers must treat an AccessDenied profile
   * lookup as an optional discovery failure rather than a hard auth failure.
   */ async listAvailableProfiles(accessToken, region = "us-east-1") {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["assertValidAwsRegion"])(region);
        const endpoint = region === "us-east-1" ? "https://codewhisperer.us-east-1.amazonaws.com" : `https://q.${region}.amazonaws.com`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/x-amz-json-1.0",
                "x-amz-target": "AmazonCodeWhispererService.ListAvailableProfiles",
                Accept: "application/json",
                tokentype: "API_KEY"
            },
            body: JSON.stringify({
                maxResults: 10
            })
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to list profiles: ${error}`);
        }
        const data = await response.json();
        const profiles = Array.isArray(data?.profiles) ? data.profiles : [];
        const arnOf = (profile)=>profile?.arn || profile?.profileArn || null;
        const match = profiles.find((profile)=>String(arnOf(profile) || "").includes(`:${region}:`)) || profiles[0];
        return arnOf(match);
    }
    /**
   * Normalize a long-lived Kiro/CodeWhisperer API key.
   */ async validateApiKey(apiKey, regionInput) {
        // Default kept OUT of the parameter list: check-public-creds' CRED_KEY_RE matches the
        // `apiKey:` annotation and flags any string literal in the signature (fn-param FP class).
        const region = regionInput || "us-east-1";
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$constants$2f$oauth$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["assertValidAwsRegion"])(region);
        const accessToken = apiKey.trim();
        if (!accessToken) {
            throw new Error("API key is required");
        }
        let profileArn = null;
        try {
            profileArn = await this.listAvailableProfiles(accessToken, region);
        } catch (error) {
            const message = String(error?.message || error || "");
            const isApiKeyProfileDenied = message.includes("AccessDeniedException") && message.includes("API key authentication is not supported for this operation");
            if (!isApiKeyProfileDenied) {
                throw error;
            }
        }
        return {
            accessToken,
            refreshToken: null,
            profileArn,
            region,
            authMethod: "api_key"
        };
    }
    /**
   * Fetch user email from access token (optional, for display)
   */ extractEmailFromJWT(accessToken) {
        try {
            const parts = accessToken.split(".");
            if (parts.length !== 3) return null;
            // Decode payload (add padding if needed)
            let payload = parts[1];
            while(payload.length % 4){
                payload += "=";
            }
            const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
            return decoded.email || decoded.preferred_username || decoded.sub;
        } catch  {
            return null;
        }
    }
}
}),
"[project]/src/lib/providers/nvidiaValidationModel.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * NVIDIA NIM key-validation probe model (#3116).
 *
 * Key validation does a tiny chat/completions probe and only cares whether auth passes
 * (401/403 ⇒ bad key; anything else ⇒ key OK). The probe model therefore must be one
 * that responds quickly for every account. The previous default was the first model in
 * the catalog (`z-ai/glm-5.1`), which requires the "Public API Endpoints" account
 * permission and has had DEGRADED windows — accounts lacking that permission see the
 * probe HANG until the validation timeout, which surfaces as a misleading "Upstream
 * Error" on an otherwise-valid key.
 *
 * `meta/llama-3.1-8b-instruct` is a long-lived, universally-available NIM model (no
 * special permission), so it is a far more reliable auth probe. A connection may still
 * override it via `providerSpecificData.validationModelId`.
 */ __turbopack_context__.s([
    "NVIDIA_DEFAULT_VALIDATION_MODEL",
    ()=>NVIDIA_DEFAULT_VALIDATION_MODEL,
    "resolveNvidiaValidationModel",
    ()=>resolveNvidiaValidationModel
]);
const NVIDIA_DEFAULT_VALIDATION_MODEL = "meta/llama-3.1-8b-instruct";
function resolveNvidiaValidationModel(providerSpecificData) {
    const override = providerSpecificData?.validationModelId;
    if (typeof override === "string" && override.trim()) return override.trim();
    return NVIDIA_DEFAULT_VALIDATION_MODEL;
}
}),
"[project]/src/lib/providers/validation/kiro.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Kiro runtime probe — falls back to a generateAssistantResponse call when an API key
// cannot list profiles. Extracted from validation.ts (god-file decomposition) — top-level
// function with no dispatcher-state captures; behavior is byte-identical to the original
// inline def.
__turbopack_context__.s([
    "validateKiroApiKeyRuntimeProbe",
    ()=>validateKiroApiKeyRuntimeProbe
]);
async function validateKiroApiKeyRuntimeProbe({ apiKey, region, profileArn }) {
    const endpoint = region === "us-east-1" ? "https://codewhisperer.us-east-1.amazonaws.com/generateAssistantResponse" : `https://q.${region}.amazonaws.com/generateAssistantResponse`;
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 15_000);
    try {
        const body = {
            ...profileArn ? {
                profileArn
            } : {},
            conversationState: {
                chatTriggerType: "MANUAL",
                conversationId: crypto.randomUUID(),
                currentMessage: {
                    userInputMessage: {
                        content: "ping",
                        modelId: "auto",
                        origin: "AI_EDITOR"
                    }
                },
                history: []
            },
            inferenceConfig: {
                maxTokens: 1
            }
        };
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                tokentype: "API_KEY",
                "Content-Type": "application/x-amz-json-1.0",
                "X-Amz-Target": "AmazonCodeWhispererStreamingService.GenerateAssistantResponse",
                Accept: "application/vnd.amazon.eventstream",
                "Amz-Sdk-Request": "attempt=1; max=3",
                "Amz-Sdk-Invocation-Id": crypto.randomUUID()
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        await res.body?.cancel().catch(()=>undefined);
        if (res.ok) {
            return {
                valid: true,
                error: null,
                method: "kiro_generate_assistant_response"
            };
        }
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "Invalid Kiro API key or AWS region"
            };
        }
        if (res.status === 400 || res.status === 422 || res.status === 429) {
            return {
                valid: true,
                error: null,
                method: `kiro_generate_assistant_response_${res.status}`
            };
        }
        return {
            valid: false,
            error: `Kiro validation failed: ${res.status}`
        };
    } finally{
        clearTimeout(timeout);
    }
}
}),
"[project]/src/lib/providers/validation/specialtyInline.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildGitlawbValidators",
    ()=>buildGitlawbValidators,
    "buildOpengatewayValidator",
    ()=>buildOpengatewayValidator,
    "validateAuggieProvider",
    ()=>validateAuggieProvider,
    "validateGitlabProvider",
    ()=>validateGitlabProvider,
    "validateKiroProvider",
    ()=>validateKiroProvider,
    "validateLongcatProvider",
    ()=>validateLongcatProvider,
    "validateNvidiaProvider",
    ()=>validateNvidiaProvider,
    "validateQoderProvider",
    ()=>validateQoderProvider,
    "validateV0VercelProvider",
    ()=>validateV0VercelProvider,
    "validateVertexPartnerProvider",
    ()=>validateVertexPartnerProvider,
    "validateVertexProvider",
    ()=>validateVertexProvider,
    "validateXiaomiMimoProvider",
    ()=>validateXiaomiMimoProvider,
    "validateZaiProvider",
    ()=>validateZaiProvider
]);
// Inline specialty provider validators that previously lived as closures inside the
// SPECIALTY_VALIDATORS map in validation.ts. Extracted (god-file decomposition) as top-level
// functions taking `isLocal` where the original closure captured it; behavior is byte-identical
// to the original inline defs. The host dispatcher still owns the SPECIALTY_VALIDATORS map
// construction + dispatch — these are just the leaf validator bodies.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$qoderCli$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/qoderCli.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$services$2f$kiro$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/services/kiro.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$nvidiaValidationModel$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/nvidiaValidationModel.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/headers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$kiro$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/kiro.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
async function validateV0VercelProvider({ apiKey, providerSpecificData, isLocal }) {
    try {
        const configuredBaseUrl = typeof providerSpecificData?.baseUrl === "string" && providerSpecificData.baseUrl.trim() ? providerSpecificData.baseUrl.trim() : "https://api.v0.dev";
        const root = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(configuredBaseUrl).replace(/\/v1\/chat\/completions$/, "").replace(/\/v1$/, "");
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(`${root}/v1/chats?limit=1`, {
            method: "GET",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData)
        }, isLocal);
        if (res.ok) {
            return {
                valid: true,
                error: null,
                method: "v0_platform_chats_list"
            };
        }
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: false,
            error: `v0 validation failed: ${res.status}`
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateAuggieProvider() {
    const { checkAuggieCliVersion } = await __turbopack_context__.A("[project]/open-sse/executors/auggie.ts [middleware] (ecmascript, async loader)");
    const result = await checkAuggieCliVersion();
    if (!result.ok) {
        return {
            valid: false,
            error: result.error || "Auggie CLI not found. Install it and run `auggie login`.",
            unsupported: false
        };
    }
    return {
        valid: true,
        error: null,
        unsupported: false,
        method: result.version
    };
}
async function validateQoderProvider({ apiKey, providerSpecificData }) {
    // Bifurcate validation: PAT tokens use Cosy auth against api1.qoder.sh;
    // regular API keys validate against dashscope (OpenAI-compatible endpoint).
    const key = (apiKey || "").trim();
    if (key.startsWith("pt-")) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$qoderCli$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["validateQoderCliPat"])({
            apiKey: key,
            providerSpecificData
        });
    }
    // Non-PAT token → validate against dashscope (Alibaba Cloud).
    // The executor routes these tokens to dashscope.aliyuncs.com, so the
    // validation must test against dashscope, NOT the Cosy PAT endpoint.
    try {
        const dashscopeUrl = "https://dashscope.aliyuncs.com/compatible-mode/v1/models";
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationRead"])(dashscopeUrl, {
            headers: {
                Authorization: `Bearer ${key}`
            }
        }, false);
        if (res.ok) return {
            valid: true,
            error: null
        };
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "Invalid Qoder API key. Make sure you're using a valid API key from Qoder / Alibaba Cloud Dashscope."
            };
        }
        // 4xx/5xx other than auth — treat as valid bypass to prevent false
        // negatives from transient dashscope issues (consistent with PAT path).
        return {
            valid: true,
            error: null
        };
    } catch (err) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(err);
    }
}
async function validateKiroProvider({ apiKey, providerSpecificData }) {
    try {
        const region = providerSpecificData?.region || "us-east-1";
        const credential = await new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$services$2f$kiro$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["KiroService"]().validateApiKey(apiKey, region);
        if (!credential.profileArn) {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$kiro$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateKiroApiKeyRuntimeProbe"])({
                apiKey: credential.accessToken,
                region: credential.region,
                profileArn: providerSpecificData?.profileArn
            });
        }
        return {
            valid: true,
            error: null,
            method: "kiro_list_available_profiles"
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateGitlabProvider({ apiKey, providerSpecificData, isLocal }) {
    try {
        const configuredBaseUrl = typeof providerSpecificData?.baseUrl === "string" ? providerSpecificData.baseUrl.trim() : "";
        const root = (configuredBaseUrl || "https://gitlab.com").replace(/\/$/, "");
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(`${root}/api/v4/code_suggestions/direct_access`, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: "{}"
        }, isLocal);
        if (res.status === 401) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateVertexProvider({ apiKey }) {
    try {
        const { parseSAFromApiKey, getAccessToken, isExpressApiKey } = await __turbopack_context__.A("[project]/open-sse/executors/vertex.ts [middleware] (ecmascript, async loader)");
        // Express-mode API keys are opaque strings sent directly as the ?key= query param — there is
        // no JWT to mint, so accept any non-empty Express key (the live chat/media call validates it).
        if (isExpressApiKey(apiKey)) {
            return {
                valid: true,
                error: null
            };
        }
        const sa = parseSAFromApiKey(apiKey);
        // Validates credentials by successfully successfully exchanging them for a JWT from Google Identity
        await getAccessToken(sa);
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return {
            valid: false,
            error: "Invalid Service Account JSON: " + error.message
        };
    }
}
async function validateVertexPartnerProvider({ apiKey }) {
    try {
        const { parseSAFromApiKey, getAccessToken, isExpressApiKey } = await __turbopack_context__.A("[project]/open-sse/executors/vertex.ts [middleware] (ecmascript, async loader)");
        if (isExpressApiKey(apiKey)) {
            return {
                valid: true,
                error: null
            };
        }
        const sa = parseSAFromApiKey(apiKey);
        await getAccessToken(sa);
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return {
            valid: false,
            error: "Invalid Service Account JSON: " + error.message
        };
    }
}
async function validateLongcatProvider({ apiKey, providerSpecificData, isLocal }) {
    try {
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])("https://api.longcat.chat/openai/v1/chat/completions", {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: "LongCat-2.0",
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        }, isLocal);
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Any non-auth response (200, 400, 422) means auth passed
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateNvidiaProvider({ apiKey, providerSpecificData }) {
    try {
        const baseUrlRaw = providerSpecificData?.baseUrl || "https://integrate.api.nvidia.com/v1/chat/completions";
        const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(baseUrlRaw);
        const chatBase = normalized.replace(/\/models$/, "");
        const chatUrl = normalized.endsWith("/chat/completions") ? normalized : `${chatBase}/chat/completions`;
        // #3116: probe a universally-available model rather than models[0]
        // (z-ai/glm-5.1), which requires the "Public API Endpoints" account permission
        // and can hang/be DEGRADED — making a *valid* key fail with "Upstream Error".
        const modelId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$nvidiaValidationModel$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveNvidiaValidationModel"])(providerSpecificData);
        // #3226: use raw https (bypass the proxy/TLS-patched fetch) — the undici
        // dispatcher stalls against NVIDIA's endpoint, causing a 504 timeout.
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["directHttpsRequest"])(chatUrl, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: modelId,
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        }, 20000);
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Any non-auth response (200, 400, 422, 429) means auth passed
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateZaiProvider({ apiKey, providerSpecificData }) {
    try {
        // providerSpecificData.baseUrl allows test overrides to point at a local
        // HTTP server; production always uses the fixed api.z.ai endpoint.
        const messagesUrl = providerSpecificData?.baseUrl ? `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData.baseUrl).split("?")[0]}?beta=true` : "https://api.z.ai/api/anthropic/v1/messages?beta=true";
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["directHttpsRequest"])(messagesUrl, {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            body: JSON.stringify({
                model: "glm-5.1",
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        }, 20000);
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        if (res.status === 404 || res.status === 405) {
            return {
                valid: false,
                error: "Provider validation endpoint not supported"
            };
        }
        if (res.status >= 500 && res.status !== 502) {
            return {
                valid: false,
                error: `Provider unavailable (${res.status})`
            };
        }
        // Any non-auth response (200, 400, 422, 429, 502) means auth passed;
        // 502 "job timed out" is z.ai's own server-side queue limit, not an auth error.
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
async function validateXiaomiMimoProvider({ apiKey, providerSpecificData, isLocal }) {
    try {
        const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData?.baseUrl || "https://api.xiaomimimo.com/v1");
        const chatUrl = `${baseUrl.replace(/\/chat\/completions$/, "")}/chat/completions`;
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
            method: "POST",
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
            body: JSON.stringify({
                model: "mimo-v2.5-pro",
                messages: [
                    {
                        role: "user",
                        content: "test"
                    }
                ],
                max_tokens: 1
            })
        }, isLocal);
        if (res.status === 401 || res.status === 403) {
            return {
                valid: false,
                error: "Invalid API key"
            };
        }
        // Any non-auth response (200, 400, 422, 429) means auth passed
        return {
            valid: true,
            error: null
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
function buildOpengatewayValidator(defaultBaseUrl, model) {
    return async ({ apiKey, providerSpecificData, isLocal })=>{
        try {
            const baseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData?.baseUrl || defaultBaseUrl);
            const chatUrl = `${baseUrl.replace(/\/chat\/completions$/, "")}/chat/completions`;
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validationWrite"])(chatUrl, {
                method: "POST",
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$headers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildBearerHeaders"])(apiKey, providerSpecificData),
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: "user",
                            content: "test"
                        }
                    ],
                    max_tokens: 1
                })
            }, isLocal);
            if (res.status === 401 || res.status === 403) {
                return {
                    valid: false,
                    error: "Invalid API key"
                };
            }
            // Any non-auth response (200, 400, 422, 429) means auth passed
            return {
                valid: true,
                error: null
            };
        } catch (error) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
        }
    };
}
function buildGitlawbValidators(configs, isLocal) {
    return Object.fromEntries(configs.map(([id, baseUrl, model])=>[
            id,
            ({ apiKey, providerSpecificData })=>buildOpengatewayValidator(baseUrl, model)({
                    apiKey,
                    providerSpecificData,
                    isLocal
                })
        ]));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/providers/validation.ts [middleware] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "validateProviderApiKey",
    ()=>validateProviderApiKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/embeddingRegistry.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$rerankRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/rerankRegistry.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/web-cookie.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modal$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modal.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/imageValidation.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/ccWireImageBuiltins.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/alibabaProviderRegions.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/provider.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/urlHelpers.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/transport.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/webProvidersA.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/webProvidersB.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/cloudProviders.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/audioMiscProviders.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$searchProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/searchProviders.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$embeddingProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/embeddingProviders.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/openaiFormat.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$anthropicFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/anthropicFormat.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webCookie$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/webCookie.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/validation/specialtyInline.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$searchProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$embeddingProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$anthropicFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webCookie$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$searchProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$embeddingProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$anthropicFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webCookie$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
async function validateProviderApiKey({ provider, apiKey, providerSpecificData = {} }) {
    const requiresApiKey = !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["providerAllowsOptionalApiKey"])(provider);
    const isLocal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isLocalProvider"])(provider);
    if (!provider || requiresApiKey && !apiKey) {
        return {
            valid: false,
            error: "Provider and API key required",
            unsupported: false
        };
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isOpenAICompatibleProvider"])(provider)) {
        try {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateOpenAICompatibleProvider"])({
                apiKey,
                providerSpecificData
            });
        } catch (error) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
        }
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAnthropicCompatibleProvider"])(provider)) {
        try {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(provider)) {
                return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$anthropicFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateClaudeCodeCompatibleProvider"])({
                    apiKey,
                    providerSpecificData
                });
            }
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$anthropicFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateAnthropicCompatibleProvider"])({
                apiKey,
                providerSpecificData,
                isLocal
            });
        } catch (error) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
        }
    }
    // buildOpengatewayValidator + buildGitlawbValidators now live in ./validation/specialtyInline
    // (god-file decomposition). The host still owns the SPECIALTY_VALIDATORS map below; only the
    // validator bodies were extracted as leaf functions taking `isLocal` where the original
    // closure captured it.
    // ── Specialty provider validation ──
    const SPECIALTY_VALIDATORS = {
        "v0-vercel": ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateV0VercelProvider"])({
                apiKey,
                providerSpecificData,
                isLocal
            }),
        jules: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateJulesProvider"],
        // "devin" is the Cognition cloud-agent provider (distinct from the "devin-cli"
        // LLM/ACP provider, which is already registered in providerRegistry). Wired here
        // for parity with the "jules" cloud-agent entry above — see #6142.
        devin: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateDevinCloudAgentProvider"],
        auggie: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateAuggieProvider"],
        qoder: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateQoderProvider"],
        kiro: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateKiroProvider"],
        "command-code": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateCommandCodeProvider"],
        huggingface: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateHuggingFaceProvider"],
        // #5422: auth-only probe — Bytez 404s on every chat model until the account adds it to
        // its catalog, so the generic chat probe can't validate a fresh key.
        bytez: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webCookie$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateBytezProvider"],
        deepgram: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateDeepgramProvider"],
        assemblyai: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateAssemblyAIProvider"],
        "rev-ai": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateRevAiProvider"],
        "fal-ai": ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateImageProviderApiKey"])({
                provider: "fal-ai",
                apiKey,
                providerSpecificData
            }),
        "stability-ai": ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateImageProviderApiKey"])({
                provider: "stability-ai",
                apiKey,
                providerSpecificData
            }),
        "black-forest-labs": ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateImageProviderApiKey"])({
                provider: "black-forest-labs",
                apiKey,
                providerSpecificData
            }),
        recraft: ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateImageProviderApiKey"])({
                provider: "recraft",
                apiKey,
                providerSpecificData
            }),
        topaz: ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$imageValidation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateImageProviderApiKey"])({
                provider: "topaz",
                apiKey,
                providerSpecificData
            }),
        elevenlabs: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateElevenLabsProvider"],
        inworld: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateInworldProvider"],
        kie: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateKieProvider"],
        "aws-polly": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateAwsPollyProvider"],
        "bailian-coding-plan": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateBailianCodingPlanProvider"],
        "qwen-cloud-token-plan": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateQwenCloudTokenPlanProvider"],
        heroku: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateHerokuProvider"],
        databricks: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateDatabricksProvider"],
        datarobot: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateDataRobotProvider"],
        watsonx: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateWatsonxProvider"],
        oci: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateOciProvider"],
        sap: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateSapProvider"],
        bedrock: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateBedrockProvider"],
        modal: ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateOpenAILikeProvider"])({
                provider: "modal",
                apiKey,
                providerSpecificData,
                baseUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(providerSpecificData?.baseUrl || ""),
                modelId: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modal$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["MODAL_DEFAULT_VALIDATION_MODEL_ID"],
                isLocal
            }),
        "nous-research": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateNousResearchProvider"],
        poe: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validatePoeProvider"],
        clarifai: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$embeddingProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateClarifaiProvider"],
        reka: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateRekaProvider"],
        maritalk: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateMaritalkProvider"],
        nlpcloud: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateNlpCloudProvider"],
        runwayml: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$audioMiscProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateRunwayProvider"],
        snowflake: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateSnowflakeProvider"],
        gigachat: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateGigachatProvider"],
        "deepseek-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateDeepSeekWebProvider"],
        "grok-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateGrokWebProvider"],
        "qwen-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateQwenWebProvider"],
        "kimi-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateKimiWebProvider"],
        "chatgpt-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateChatGptWebProvider"],
        "perplexity-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validatePerplexityWebProvider"],
        "blackbox-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersA$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateBlackboxWebProvider"],
        "muse-spark-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateMuseSparkWebProvider"],
        "inner-ai": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateInnerAiProvider"],
        "adapta-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateAdaptaWebProvider"],
        "claude-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateClaudeWebProvider"],
        "gemini-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateGeminiWebProvider"],
        "notion-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateNotionWebProvider"],
        "copilot-m365-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateCopilotM365WebProvider"],
        "copilot-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateCopilotWebProvider"],
        "t3-web": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webProvidersB$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateT3WebProvider"],
        "azure-openai": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateAzureOpenAIProvider"],
        "azure-ai": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$cloudProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateAzureAiProvider"],
        "voyage-ai": ({ apiKey, providerSpecificData })=>{
            const embeddingProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$embeddingRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getEmbeddingProvider"])("voyage-ai");
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$embeddingProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateEmbeddingApiProvider"])({
                apiKey,
                providerSpecificData,
                url: embeddingProvider?.baseUrl,
                modelId: embeddingProvider?.models?.[0]?.id || "voyage-4-lite"
            });
        },
        "jina-ai": ({ apiKey, providerSpecificData })=>{
            const rerankProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$rerankRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getRerankProvider"])("jina-ai");
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$embeddingProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateRerankApiProvider"])({
                apiKey,
                providerSpecificData,
                url: rerankProvider?.baseUrl,
                modelId: rerankProvider?.models?.[0]?.id || "jina-reranker-v3"
            });
        },
        gitlab: ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateGitlabProvider"])({
                apiKey,
                providerSpecificData,
                isLocal
            }),
        vertex: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateVertexProvider"],
        "vertex-partner": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateVertexPartnerProvider"],
        longcat: ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateLongcatProvider"])({
                apiKey,
                providerSpecificData,
                isLocal
            }),
        nvidia: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateNvidiaProvider"],
        zai: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateZaiProvider"],
        "xiaomi-mimo": ({ apiKey, providerSpecificData })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateXiaomiMimoProvider"])({
                apiKey,
                providerSpecificData,
                isLocal
            }),
        // Gitlawb Opengateway — Xiaomi MiMo compatible, same /models endpoint limitation.
        // Bypass /models probe in favor of chat/completions, matching xiaomi-mimo's pattern.
        // Uses a factory to share validation logic across Opengateway provider variants.
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$specialtyInline$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildGitlawbValidators"])([
            [
                "gitlawb",
                "https://opengateway.gitlawb.com/v1/xiaomi-mimo",
                "mimo-v2.5-pro"
            ],
            [
                "gitlawb-gmi",
                "https://opengateway.gitlawb.com/v1/gmi-cloud",
                "XiaomiMiMo/MiMo-V2.5-Pro"
            ]
        ], isLocal),
        // Search providers — use factored validator
        ...Object.fromEntries(Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$searchProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["SEARCH_VALIDATOR_CONFIGS"]).map(([id, configFn])=>[
                id,
                ({ apiKey, providerSpecificData })=>{
                    const { url, init } = configFn(apiKey, providerSpecificData);
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$searchProviders$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateSearchProvider"])(url, init, providerSpecificData, isLocal);
                }
            ]))
    };
    if (SPECIALTY_VALIDATORS[provider]) {
        try {
            return await SPECIALTY_VALIDATORS[provider]({
                apiKey,
                providerSpecificData
            });
        } catch (error) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
        }
    }
    // Web-cookie providers WITHOUT a dedicated specialty validator above fall back to the generic
    // session-ping check (AUTH_007 SESSION_EXPIRED on 401/403). Providers that DO have a rich
    // per-provider validator (grok-web, chatgpt-web, claude-web, …) are handled by
    // SPECIALTY_VALIDATORS first and must not be shadowed by this generic probe (issue: the
    // #4023 dispatch was placed too early and intercepted every web-cookie provider).
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"][provider]) {
        try {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$webCookie$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateWebCookieProvider"])({
                provider,
                apiKey,
                providerSpecificData
            });
        } catch (error) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
        }
    }
    const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRegistryEntry"])(provider);
    if (!entry) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isSelfHostedChatProvider"])(provider)) {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateOpenAILikeProvider"])({
                provider,
                apiKey,
                baseUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveBaseUrl"])(null, providerSpecificData),
                providerSpecificData,
                modelId: "local-model",
                modelsUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["addModelsSuffix"])(providerSpecificData?.baseUrl || ""),
                isLocal
            });
        }
        return {
            valid: false,
            error: "Provider validation not supported",
            unsupported: true
        };
    }
    const modelId = entry.models?.[0]?.id || null;
    // (#532) Use testKeyBaseUrl if defined — some providers validate keys on a different endpoint
    // than where requests are sent (e.g. opencode-go validates on zen/v1, not zen/go/v1)
    const validationEntry = entry.testKeyBaseUrl ? {
        ...entry,
        baseUrl: entry.testKeyBaseUrl
    } : entry;
    const usesAlibabaRegionalEndpoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isAlibabaRegionalProvider"])(provider);
    const baseUrl = usesAlibabaRegionalEndpoint ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveAlibabaProviderBaseUrl"])(provider, providerSpecificData, validationEntry.baseUrl) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveBaseUrl"])(validationEntry, providerSpecificData);
    try {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["OPENAI_LIKE_FORMATS"].has(entry.format)) {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateOpenAILikeProvider"])({
                apiKey,
                baseUrl,
                headers: entry.headers || {},
                providerSpecificData,
                modelId,
                modelsUrl: usesAlibabaRegionalEndpoint ? "" : entry.testKeyModelsUrl || entry.modelsUrl,
                isLocal
            });
        }
        if (entry.format === "claude") {
            // Built-in CC-wire-image providers (e.g. agentrouter, #6056/#6255) gate
            // their WAF on the dynamic Claude-Code fingerprint (User-Agent,
            // `?beta=true` chat path, anthropic-beta/x-app/X-Stainless-* headers).
            // The real chat-request path already routes through
            // buildProviderUrl/buildProviderHeaders for this; the validation probe
            // must use the SAME wire image or a genuinely valid key gets 403'd as
            // "unauthorized client detected" (#6377).
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$ccWireImageBuiltins$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["usesCcWireImage"])(provider)) {
                const requestBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildProviderUrl"])(provider, modelId, true, {
                    baseUrl
                });
                const requestHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$provider$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildProviderHeaders"])(provider, {
                    apiKey
                }, true);
                return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$anthropicFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateAnthropicLikeProvider"])({
                    apiKey,
                    baseUrl: requestBaseUrl,
                    modelId,
                    headers: requestHeaders,
                    providerSpecificData,
                    isLocal
                });
            }
            const requestBaseUrl = `${baseUrl}${entry.urlSuffix || ""}`;
            const requestHeaders = {
                ...entry.headers || {}
            };
            if ((entry.authHeader || "").toLowerCase() === "x-api-key") {
                requestHeaders["x-api-key"] = apiKey;
            } else {
                requestHeaders["Authorization"] = `Bearer ${apiKey}`;
            }
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$anthropicFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateAnthropicLikeProvider"])({
                apiKey,
                baseUrl: requestBaseUrl,
                modelId,
                headers: requestHeaders,
                providerSpecificData,
                isLocal
            });
        }
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$urlHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["GEMINI_LIKE_FORMATS"].has(entry.format)) {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$openaiFormat$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["validateGeminiLikeProvider"])({
                apiKey,
                baseUrl,
                providerSpecificData,
                authType: entry.authType,
                isLocal
            });
        }
        if (entry.format === "antigravity") {
            const expiresAt = providerSpecificData?.tokenExpiresAt || providerSpecificData?.expiresAt || providerSpecificData?.expiry_date || providerSpecificData?.expiryDate;
            const expiryMs = typeof expiresAt === "number" ? expiresAt : typeof expiresAt === "string" && expiresAt.trim() ? Date.parse(expiresAt) : Number.NaN;
            if (Number.isFinite(expiryMs) && expiryMs > 0 && expiryMs < Date.now()) {
                return {
                    valid: false,
                    error: "Antigravity OAuth token has expired. Re-import or refresh the CLI login.",
                    unsupported: false
                };
            }
            return {
                valid: true,
                error: null,
                unsupported: false
            };
        }
        return {
            valid: false,
            error: "Provider validation not supported",
            unsupported: true
        };
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2f$transport$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["toValidationErrorResult"])(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/vncSession/harvest.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "harvestFromContainer",
    ()=>harvestFromContainer,
    "harvestToCredentials",
    ()=>harvestToCredentials,
    "rewriteDebuggerUrl",
    ()=>rewriteDebuggerUrl,
    "selectPageTarget",
    ()=>selectPageTarget,
    "waitForCdpReady",
    ()=>waitForCdpReady
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__ = __turbopack_context__.i("[externals]/ws [external] (ws, esm_import, [project]/node_modules/ws)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
class CdpClient {
    ws;
    nextId = 1;
    pending = new Map();
    sessionId = null;
    closed = false;
    constructor(wsUrl){
        this.ws = new __TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__["default"](wsUrl);
        this.ws.on("message", (data)=>this.onMessage(data));
        this.ws.on("close", ()=>this.rejectAll(new Error("CDP websocket closed")));
        this.ws.on("error", (error)=>this.rejectAll(toError(error, "CDP websocket error")));
    }
    ready(timeoutMs = 15_000, signal) {
        if (this.ws.readyState === __TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__["default"].OPEN) return Promise.resolve();
        if (this.ws.readyState === __TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__["default"].CLOSING || this.ws.readyState === __TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__["default"].CLOSED) {
            return Promise.reject(new Error("CDP websocket is closed"));
        }
        return new Promise((resolve, reject)=>{
            let settled = false;
            const finish = (error)=>{
                if (settled) return;
                settled = true;
                cleanup();
                if (error) reject(error);
                else resolve();
            };
            const onOpen = ()=>finish();
            const onError = (error)=>finish(toError(error, "CDP websocket error"));
            const onAbort = ()=>{
                this.close();
                finish(new Error("CDP connection aborted"));
            };
            const timer = setTimeout(()=>{
                this.close();
                finish(new Error("CDP open timeout"));
            }, timeoutMs);
            const cleanup = ()=>{
                clearTimeout(timer);
                this.ws.off("open", onOpen);
                this.ws.off("error", onError);
                signal?.removeEventListener("abort", onAbort);
            };
            this.ws.once("open", onOpen);
            this.ws.once("error", onError);
            if (signal) {
                if (signal.aborted) onAbort();
                else signal.addEventListener("abort", onAbort, {
                    once: true
                });
            }
        });
    }
    onMessage(data) {
        let message;
        try {
            message = JSON.parse(data.toString());
        } catch  {
            return;
        }
        if (typeof message.id !== "number") return;
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        pending.cleanup();
        if (message.error) {
            pending.reject(new Error(message.error.message || "CDP command failed"));
        } else {
            pending.resolve(message.result);
        }
    }
    rejectAll(error) {
        for (const [id, pending] of this.pending){
            this.pending.delete(id);
            pending.cleanup();
            pending.reject(error);
        }
    }
    send(method, params = {}, sessionId, timeoutMs = 10_000, signal) {
        if (this.ws.readyState !== __TURBOPACK__imported__module__$5b$externals$5d2f$ws__$5b$external$5d$__$28$ws$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$ws$29$__["default"].OPEN) {
            return Promise.reject(new Error("CDP websocket is not open"));
        }
        return new Promise((resolve, reject)=>{
            const id = this.nextId++;
            let settled = false;
            const finishReject = (error)=>{
                if (settled) return;
                settled = true;
                this.pending.delete(id);
                cleanup();
                reject(error);
            };
            const onAbort = ()=>finishReject(new Error(`CDP command aborted: ${method}`));
            const timer = setTimeout(()=>finishReject(new Error(`CDP command timed out: ${method}`)), timeoutMs);
            const cleanup = ()=>{
                clearTimeout(timer);
                signal?.removeEventListener("abort", onAbort);
            };
            this.pending.set(id, {
                resolve: (value)=>{
                    if (settled) return;
                    settled = true;
                    cleanup();
                    resolve(value);
                },
                reject: finishReject,
                cleanup
            });
            if (signal) {
                if (signal.aborted) {
                    onAbort();
                    return;
                }
                signal.addEventListener("abort", onAbort, {
                    once: true
                });
            }
            try {
                this.ws.send(JSON.stringify({
                    id,
                    method,
                    params,
                    ...sessionId ? {
                        sessionId
                    } : {}
                }), (error)=>{
                    if (error) finishReject(toError(error, `Failed to send CDP command: ${method}`));
                });
            } catch (error) {
                finishReject(toError(error, `Failed to send CDP command: ${method}`));
            }
        });
    }
    async attachToPage(targetOrigin, signal) {
        const { targetInfos } = await this.send("Target.getTargets", {}, undefined, 10_000, signal);
        const page = selectPageTarget(targetInfos || [], targetOrigin);
        const { sessionId } = await this.send("Target.attachToTarget", {
            targetId: page.targetId,
            flatten: true
        }, undefined, 10_000, signal);
        this.sessionId = sessionId;
    }
    async getCookies(url, signal) {
        if (!this.sessionId) throw new Error("CDP page target is not attached");
        const result = await this.send("Network.getCookies", {
            urls: [
                url
            ]
        }, this.sessionId, 10_000, signal);
        return result.cookies || [];
    }
    async getDeclaredStorage(keys, signal) {
        if (!this.sessionId) throw new Error("CDP page target is not attached");
        const expression = `(() => {
      const keys = ${JSON.stringify([
            ...keys
        ])};
      const out = {};
      for (const store of [window.localStorage, window.sessionStorage]) {
        for (const key of keys) {
          const value = store.getItem(key);
          if (typeof value === "string" && value.length > 0) out[key] = value;
        }
      }
      const urls = [window.location.href, ...performance.getEntriesByType("resource").map((e) => e.name)];
      for (const raw of urls) {
        try {
          const url = new URL(raw, window.location.href);
          for (const key of keys) {
            const value = url.searchParams.get(key);
            if (value && !out[key]) out[key] = value;
          }
        } catch {}
      }
      return out;
    })()`;
        const result = await this.send("Runtime.evaluate", {
            expression,
            returnByValue: true
        }, this.sessionId, 10_000, signal);
        const value = result?.result?.value;
        return value && typeof value === "object" ? value : {};
    }
    close() {
        if (this.closed) return;
        this.closed = true;
        this.rejectAll(new Error("CDP client closed"));
        try {
            this.ws.close();
        } catch  {
        // Best-effort close.
        }
    }
}
async function waitForCdpReady(cdpPort, timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    let lastError = null;
    while(Date.now() < deadline){
        const controller = new AbortController();
        const timer = setTimeout(()=>controller.abort(), 2_000);
        try {
            const version = await fetchJson(`http://127.0.0.1:${cdpPort}/json/version`, controller.signal);
            if (version?.webSocketDebuggerUrl) return;
            lastError = new Error("CDP endpoint did not return a websocket URL");
        } catch (error) {
            lastError = toError(error, "CDP endpoint is not ready");
        } finally{
            clearTimeout(timer);
        }
        await delay(500);
    }
    throw new Error(`Browser did not become ready: ${lastError?.message || "CDP timeout"}`);
}
async function harvestFromContainer(cdpPort, provider, timeoutMs = 20_000) {
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), timeoutMs);
    let client = null;
    try {
        const version = await fetchJson(`http://127.0.0.1:${cdpPort}/json/version`, controller.signal);
        const debuggerUrl = version?.webSocketDebuggerUrl;
        if (typeof debuggerUrl !== "string" || !debuggerUrl) {
            throw new Error("No CDP websocket endpoint from browser container");
        }
        client = new CdpClient(rewriteDebuggerUrl(debuggerUrl, cdpPort));
        await client.ready(Math.min(timeoutMs, 15_000), controller.signal);
        const origin = new URL(provider.url).origin;
        await client.attachToPage(origin, controller.signal);
        const [cookiesRaw, declaredStorage] = await Promise.all([
            client.getCookies(provider.url, controller.signal),
            client.getDeclaredStorage(provider.requirement.storageKeys, controller.signal)
        ]);
        const cookies = cookiesRaw.filter((cookie)=>domainMatches(cookie.domain, origin)).map((cookie)=>({
                name: String(cookie.name || ""),
                value: String(cookie.value || ""),
                domain: String(cookie.domain || ""),
                path: String(cookie.path || "/")
            })).filter((cookie)=>cookie.name.length > 0 && cookie.value.length > 0);
        const cookieHeader = provider.requirement.acceptsFullCookieHeader ? cookies.map((cookie)=>`${cookie.name}=${cookie.value}`).join("; ") : "";
        const baseResult = {
            cookies,
            localStorage: declaredStorage,
            cookieHeader,
            hasCredential: false
        };
        const credentials = harvestToCredentials(baseResult, provider);
        const hasCredential = typeof credentials.apiKey === "string" || Object.values(credentials.providerSpecificData).some((value)=>typeof value === "string" && value.length > 0);
        return {
            ...baseResult,
            hasCredential
        };
    } catch (error) {
        if (controller.signal.aborted) {
            throw new Error(`Browser credential harvest timed out after ${timeoutMs}ms`);
        }
        throw error;
    } finally{
        clearTimeout(timeout);
        client?.close();
    }
}
function harvestToCredentials(harvest, provider) {
    const requirement = provider.requirement;
    const providerSpecificData = {};
    for (const key of requirement.storageKeys){
        if (key === "cookie") continue;
        const value = harvest.localStorage[key] || harvest.cookies.find((cookie)=>cookie.name === key)?.value;
        if (value) providerSpecificData[key] = value;
    }
    if (requirement.kind === "token") {
        const tokenValue = requirement.storageKeys.map((key)=>providerSpecificData[key]).find(Boolean) || null;
        if (tokenValue && requirement.storageKeys.includes("token")) {
            providerSpecificData.token = tokenValue;
        }
        return {
            providerSpecificData,
            apiKey: tokenValue
        };
    }
    if (requirement.acceptsFullCookieHeader && requirement.storageKeys.includes("cookie") && harvest.cookieHeader) {
        providerSpecificData.cookie = harvest.cookieHeader;
    }
    return {
        providerSpecificData,
        apiKey: null
    };
}
function rewriteDebuggerUrl(debuggerUrl, cdpPort) {
    const url = new URL(debuggerUrl);
    url.protocol = "ws:";
    url.hostname = "127.0.0.1";
    url.port = String(cdpPort);
    return url.toString();
}
function selectPageTarget(targetInfos, targetOrigin) {
    const pages = targetInfos.filter((target)=>target.type === "page");
    const matching = pages.find((target)=>safeOrigin(target.url) === targetOrigin);
    if (matching) return matching;
    throw new Error(`No browser page is open for ${targetOrigin}`);
}
function safeOrigin(value) {
    if (!value) return null;
    try {
        return new URL(value).origin;
    } catch  {
        return null;
    }
}
async function fetchJson(url, signal) {
    const response = await fetch(url, {
        signal
    });
    if (!response.ok) throw new Error(`CDP endpoint returned HTTP ${response.status}`);
    return response.json();
}
function domainMatches(cookieDomain, origin) {
    try {
        const host = new URL(origin).hostname;
        const domain = cookieDomain.startsWith(".") ? cookieDomain.slice(1) : cookieDomain;
        return host === domain || host.endsWith(`.${domain}`);
    } catch  {
        return false;
    }
}
function delay(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
function toError(error, fallback) {
    if (error instanceof Error) return error;
    return new Error(typeof error === "string" && error ? error : fallback);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/vncSession/service.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getSession",
    ()=>getSession,
    "harvestSession",
    ()=>harvestSession,
    "listSessions",
    ()=>listSessions,
    "markViewerActive",
    ()=>markViewerActive,
    "sessionKey",
    ()=>sessionKey,
    "startSession",
    ()=>startSession,
    "stopAllSessions",
    ()=>stopAllSessions,
    "stopSession",
    ()=>stopSession
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:child_process [external] (node:child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/providers/validation.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/vncSession/manifest.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$harvest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/vncSession/harvest.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$harvest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$harvest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
const LABEL = "com.omniroute.browser-login";
const SESSIONS = new Map();
let idleTimer = null;
let reconciliationPromise = null;
function docker(args, opts = {}) {
    return new Promise((resolve)=>{
        let settled = false;
        let out = "";
        let err = "";
        const child = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["spawn"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].dockerBin, args, {
            stdio: [
                "ignore",
                "pipe",
                "pipe"
            ]
        });
        let timer = null;
        const finish = (result)=>{
            if (settled) return;
            settled = true;
            if (timer) clearTimeout(timer);
            resolve(result);
        };
        timer = setTimeout(()=>{
            child.kill("SIGKILL");
            finish({
                code: -1,
                out,
                err: `${err} (docker timed out)`.trim()
            });
        }, opts.timeoutMs ?? 60_000);
        child.stdout.on("data", (data)=>{
            out += data.toString();
        });
        child.stderr.on("data", (data)=>{
            err += data.toString();
        });
        child.on("error", (error)=>{
            finish({
                code: -1,
                out,
                err: error.message
            });
        });
        child.on("close", (code)=>{
            finish({
                code: code ?? -1,
                out,
                err
            });
        });
    });
}
function sessionKey(sessionId) {
    return `omniroute-browser-login-${sessionId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)}`;
}
function getSession(connectionId, sessionId) {
    const session = SESSIONS.get(sessionId);
    return session?.connectionId === connectionId ? session : undefined;
}
function listSessions(connectionId) {
    const sessions = [
        ...SESSIONS.values()
    ];
    return connectionId ? sessions.filter((session)=>session.connectionId === connectionId) : sessions;
}
async function reconcileStaleContainers() {
    if (!reconciliationPromise) {
        reconciliationPromise = (async ()=>{
            const listed = await docker([
                "ps",
                "-aq",
                "--filter",
                `label=${LABEL}=true`
            ], {
                timeoutMs: 20_000
            });
            if (listed.code !== 0) return;
            const ids = listed.out.split(/\s+/).map((value)=>value.trim()).filter(Boolean);
            if (ids.length > 0) {
                await docker([
                    "rm",
                    "-f",
                    ...ids
                ], {
                    timeoutMs: 30_000
                });
            }
        })();
    }
    await reconciliationPromise;
}
function findActiveSessionForConnection(connectionId) {
    return [
        ...SESSIONS.values()
    ].find((session)=>session.connectionId === connectionId && [
            "starting",
            "running",
            "harvesting"
        ].includes(session.status));
}
function safePathSegment(value) {
    const safe = value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
    if (!safe || safe === "." || safe === "..") throw new Error("Invalid profile identifier");
    return safe;
}
function createProfileDir(connectionId, sessionId) {
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["mkdirSync"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].profileDir, {
        recursive: true,
        mode: 0o700
    });
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["chmodSync"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].profileDir, 0o700);
    const profileName = safePathSegment(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].persistProfiles ? connectionId : sessionId);
    const profileDir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].profileDir, profileName);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["mkdirSync"])(profileDir, {
        recursive: true,
        mode: 0o700
    });
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["chmodSync"])(profileDir, 0o700);
    return profileDir;
}
async function publishedPort(containerName, containerPort) {
    const result = await docker([
        "port",
        containerName,
        `${containerPort}/tcp`
    ], {
        timeoutMs: 10_000
    });
    if (result.code !== 0) {
        throw new Error(result.err.trim() || `Could not resolve published port ${containerPort}`);
    }
    for (const line of result.out.split(/\r?\n/)){
        const match = line.trim().match(/:(\d+)$/);
        if (match) return Number(match[1]);
    }
    throw new Error(`Docker did not publish container port ${containerPort}`);
}
async function startSession(connectionId) {
    await reconcileStaleContainers();
    const connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnectionById"])(connectionId);
    if (!connection) throw new Error("Provider connection not found");
    const providerId = typeof connection.provider === "string" ? connection.provider : "";
    const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getVncProvider"])(providerId);
    if (!provider) {
        throw new Error(`Browser login is not supported for provider '${providerId || "unknown"}'`);
    }
    const existing = findActiveSessionForConnection(connectionId);
    if (existing) return existing;
    if (SESSIONS.size >= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].maxSessions) {
        throw new Error(`Maximum ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].maxSessions} concurrent browser-login sessions reached`);
    }
    const sessionId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    const containerName = sessionKey(sessionId);
    const profileDir = createProfileDir(connectionId, sessionId);
    const state = {
        sessionId,
        connectionId,
        providerId,
        containerName,
        profileDir,
        cdpPort: 0,
        vncPort: 0,
        url: provider.url,
        status: "starting",
        startedAt: Date.now(),
        lastViewerAt: Date.now(),
        lastHarvestAt: 0
    };
    SESSIONS.set(sessionId, state);
    try {
        const chromeCli = `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].chromiumArgs} ${provider.url}`;
        const result = await docker([
            "run",
            "-d",
            "--name",
            containerName,
            "--restart",
            "no",
            "--label",
            `${LABEL}=true`,
            "--label",
            `${LABEL}.session-id=${sessionId}`,
            "--label",
            `${LABEL}.connection-id=${connectionId}`,
            "--shm-size",
            "1gb",
            "-p",
            `127.0.0.1::${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].containerVncPort}`,
            "-p",
            `127.0.0.1::${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].containerCdpPort}`,
            "-v",
            `${profileDir}:${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].containerProfileDir}`,
            "-e",
            `CHROME_CLI=${chromeCli}`,
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].image
        ], {
            timeoutMs: 120_000
        });
        if (result.code !== 0) {
            const message = result.err.trim() || "docker run failed";
            const buildHint = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].image === "omniroute-vnc-chromium:local" && /pull access denied|unable to find image|not found/i.test(message) ? " Build it with: docker build -t omniroute-vnc-chromium:local docker/vnc-browser/chromium" : "";
            throw new Error(`${message}${buildHint}`);
        }
        state.vncPort = await publishedPort(containerName, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].containerVncPort);
        state.cdpPort = await publishedPort(containerName, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].containerCdpPort);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$harvest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["waitForCdpReady"])(state.cdpPort, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].browserReadyTimeoutMs);
        state.status = "running";
        scheduleIdleSweep();
        return state;
    } catch (error) {
        state.status = "error";
        state.error = error instanceof Error ? error.message : String(error);
        SESSIONS.delete(sessionId);
        await docker([
            "rm",
            "-f",
            containerName
        ], {
            timeoutMs: 20_000
        });
        cleanupProfile(state);
        throw new Error(`Failed to start browser login for connection ${connectionId}: ${state.error}`);
    }
}
function markViewerActive(connectionId, sessionId) {
    const session = getSession(connectionId, sessionId);
    if (session) session.lastViewerAt = Date.now();
}
async function harvestSession(connectionId, sessionId) {
    const session = getSession(connectionId, sessionId);
    if (!session) throw new Error("Browser-login session not found");
    if (session.status !== "running") {
        throw new Error(`Browser-login session is not running (${session.status})`);
    }
    const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getVncProvider"])(session.providerId);
    if (!provider) throw new Error("Provider is no longer supported for browser login");
    session.status = "harvesting";
    try {
        const harvest = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$harvest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["harvestFromContainer"])(session.cdpPort, provider, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].harvestTimeoutMs);
        session.lastHarvestAt = Date.now();
        if (!harvest.hasCredential) {
            return {
                harvested: false,
                sessionId,
                connectionId,
                providerId: session.providerId,
                updatedFields: [],
                validation: null
            };
        }
        const connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnectionById"])(connectionId);
        if (!connection) throw new Error("Provider connection no longer exists");
        if (connection.provider !== session.providerId) {
            throw new Error("Provider connection changed while browser login was active");
        }
        const { providerSpecificData, apiKey } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$harvest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["harvestToCredentials"])(harvest, provider);
        const existingData = connection.providerSpecificData && typeof connection.providerSpecificData === "object" && !Array.isArray(connection.providerSpecificData) ? connection.providerSpecificData : {};
        const mergedData = {
            ...existingData,
            ...providerSpecificData
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connectionId, {
            providerSpecificData: mergedData,
            ...apiKey ? {
                apiKey
            } : {}
        });
        const validationKey = apiKey || (typeof mergedData.cookie === "string" ? mergedData.cookie : null) || (typeof connection.apiKey === "string" ? connection.apiKey : "");
        const validationResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$validation$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["validateProviderApiKey"])({
            provider: session.providerId,
            apiKey: validationKey,
            providerSpecificData: mergedData
        });
        return {
            harvested: true,
            sessionId,
            connectionId,
            providerId: session.providerId,
            updatedFields: [
                ...Object.keys(providerSpecificData).map((key)=>`providerSpecificData.${key}`),
                ...apiKey ? [
                    "apiKey"
                ] : []
            ],
            validation: {
                valid: !!validationResult.valid,
                unsupported: !!validationResult.unsupported,
                error: typeof validationResult.error === "string" && validationResult.error.trim() ? validationResult.error : null
            }
        };
    } finally{
        if (session.status === "harvesting") session.status = "running";
    }
}
async function stopSession(connectionId, sessionId) {
    const session = getSession(connectionId, sessionId);
    if (!session || session.status === "stopping") return;
    session.status = "stopping";
    SESSIONS.delete(sessionId);
    try {
        const result = await docker([
            "rm",
            "-f",
            session.containerName
        ], {
            timeoutMs: 20_000
        });
        if (result.code !== 0 && !/no such container/i.test(result.err)) {
            throw new Error(result.err.trim() || "Failed to remove browser container");
        }
    } finally{
        cleanupProfile(session);
    }
}
async function stopAllSessions() {
    const sessions = [
        ...SESSIONS.values()
    ];
    await Promise.all(sessions.map((session)=>stopSession(session.connectionId, session.sessionId).catch(()=>{})));
    if (idleTimer) clearInterval(idleTimer);
    idleTimer = null;
}
function cleanupProfile(session) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].persistProfiles) return;
    try {
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["rmSync"])(session.profileDir, {
            recursive: true,
            force: true
        });
    } catch  {
    // Best-effort cleanup; the directory remains mode 0700 if removal fails.
    }
}
function scheduleIdleSweep() {
    if (idleTimer) return;
    idleTimer = setInterval(async ()=>{
        const now = Date.now();
        for (const session of [
            ...SESSIONS.values()
        ]){
            if (session.status !== "running") continue;
            const idleFor = now - Math.max(session.lastViewerAt, session.lastHarvestAt);
            const overMax = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].maxSessionMs > 0 && now - session.startedAt >= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].maxSessionMs;
            if (idleFor >= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$vncSession$2f$manifest$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["VNC_CONFIG"].idleTimeoutMs || overMax) {
                await stopSession(session.connectionId, session.sessionId).catch(()=>{});
            }
        }
    }, 30_000);
    idleTimer.unref?.();
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=_0xja-vl._.js.map