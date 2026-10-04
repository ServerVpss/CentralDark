# 2026-10-04 — PR-Agent ligado à IA local CURRENT

## Correção

O workflow `.github/workflows/pr-agent.yml` estava ligado a três provedores cloud:

```text
Groq → Llama3-70B
Gemini → Flash
Anthropic → Claude
```

Isso não respeitava o binding local CentralDark. O owner foi mantido e corrigido para um único review pelo bridge local existente.

## Binding atual

```text
GitHub Actions self-hosted Linux
→ http://127.0.0.1:18435/health
→ resolve model CURRENT
→ http://127.0.0.1:18435/v1
→ PR-Agent
→ GitHub PR review
```

O job resolve `LOCAL_MODEL` no início da execução e exporta:

```text
CONFIG__AI_PROVIDER=openai
CONFIG__MODEL=openai/$LOCAL_MODEL
OPENAI__API_BASE=http://127.0.0.1:18435/v1
OPENAI__KEY=local-kylin
CONFIG__FALLBACK_MODELS=[]
```

O valor do modelo não está fixado no workflow. O `GITHUB_ENV` é usado para transportar o modelo resolvido ao passo seguinte; `CONFIG__MODEL` é montado no shell do próprio passo de review, depois da resolução.

## Removido

```text
GROQ_API_KEY
GEMINI_API_KEY
ANTHROPIC_API_KEY
ANTHROPIC_BASE_URL
```

Não há fallback cloud silencioso.

## Verificação

```text
workflow YAML parse: PASS
local workflow assertions: PASS
git diff --check: PASS
bridge live /health: 200
current local model measured: kylin-qwen-plus
```

## Decisão

```text
LOCAL_PR_REVIEW=REUSE_EXISTING_KYLIN_BRIDGE
SECOND_REVIEW_ENGINE=false
CLOUD_REVIEW_BINDING=false
MODEL_STATIC_IDENTITY=false
RESOLVE_AT_JOB_START=true
FALLBACK_CLOUD=false
```

A quantidade anterior de três jobs não representava três inteligências locais; eram três provedores cloud. O workflow agora não finge diversidade: usa o executor local CURRENT real.

## Next cursor

`publicar workflow → disparar/medir um run de PR → provar health/model binding → provar PR-Agent usando 127.0.0.1:18435 → confirmar review publicado → receipt → retomar Self-Evolution com o mesmo resolver`
