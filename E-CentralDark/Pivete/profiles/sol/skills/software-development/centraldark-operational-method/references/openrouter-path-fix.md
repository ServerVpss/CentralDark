# OpenRouter Path Fix — Quick Reference (2026-08-25)

## Descoberta
OpenRouter NÃO usa o endpoint padrão OpenAI `/v1/chat/completions` quando a `base_url` já inclui `/api/v1`.

## Configuração
```python
# .env
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_API_KEY=sk-or-...
```

## Endpoint Correto
```python
# base_url = "https://openrouter.ai/api/v1"
# OpenRouter espera: POST https://openrouter.ai/api/v1/chat/completions
# Mas base_url JÁ TEM /api/v1 → caminho relativo = /chat/completions

# ✅ CORRETO
POST {base_url}/chat/completions
# Expande para: https://openrouter.ai/api/v1/chat/completions

# ❌ ERRADO (404)
POST {base_url}/v1/chat/completions
# Expande para: https://openrouter.ai/api/v1/v1/chat/completions

# ❌ ERRADO (404)
POST {base_url}/api/v1/chat/completions
# Expande para: https://openrouter.ai/api/v1/api/v1/chat/completions
```

## Tabela de Testes

| base_url configurada | Path no código | URL final | Status |
|---------------------|----------------|-----------|--------|
| `https://openrouter.ai/api/v1` | `/chat/completions` | `https://openrouter.ai/api/v1/chat/completions` | ✅ 200/401* |
| `https://openrouter.ai/api/v1` | `/v1/chat/completions` | `https://openrouter.ai/api/v1/v1/chat/completions` | ❌ 404 |
| `https://openrouter.ai/api/v1` | `/api/v1/chat/completions` | `https://openrouter.ai/api/v1/api/v1/chat/completions` | ❌ 404 |
| `https://api.openai.com` | `/v1/chat/completions` | `https://api.openai.com/v1/chat/completions` | ✅ 200 |

*401 = chave inválida/truncada, mas endpoint existe

## Implementação no Omni Router
```python
def run_openai(prompt: str, target_model: str) -> Tuple[str, str]:
    openai_base = os.getenv("OPENAI_BASE_URL", "https://api.openai.com").rstrip("/")
    # Sempre usar /chat/completions - funciona para OpenAI, OpenRouter, Nous, qualquer OpenAI-compat
    url = f"{openai_base}/chat/completions"
    ...
```

## Lição
**Chat Completions (`/chat/completions`) é o padrão universal** para OpenAI + compatíveis.
Responses API (`/v1/responses`) é só OpenAI oficial.
Padronizar em Chat Completions = máxima compatibilidade.