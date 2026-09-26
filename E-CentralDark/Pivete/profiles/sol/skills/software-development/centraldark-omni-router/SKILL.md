---
name: centraldark-omni-router
description: ONE_SYSTEM_ONLY entrypoint routing 4 AI engines.
trigger:
  - centraldark_router_needed
  - multi_engine_routing
  - gateway_unification
phases: "MEASURE → DIAGNOSE → MINIMAL_REMEDIATION → RETEST → COUNTERPROOF → RECEIPT"
runtime_checks:
  - self_test_passes
  - health_endpoint_returns_4_engines
  - models_endpoint_lists_5_models
  - chat_completions_nous_works
  - chat_completions_claude_code_works
  - dynamic_env_reading_verified
failure_signature: "CENTRALDARK_OMNI_ROUTER_GOLD_STANDARD_v1"
remediation_escalation: "env_fix > path_fix > auth_json_fix > engine_disable > nuclear"
provenance:
  sources:
    - "apps/modulos/elite-gateway/scripts/centraldark_omni_router.py"
    - "NUCLEO/docs/reference/CENTRALDARK_OMNI_ROUTER_CRISTALIZACAO_20260825.md"
    - "references/daemon-robust-mandatory-rules.md"
  tests:
    - "self_test()"
    - "health_check"
    - "models_endpoint"
    - "chat_completions_per_engine"
  receipts:
    - "centraldark.runtime.receipt.v1"
    - "CENTRALDARK_OMNI_ROUTER_CRISTALIZACAO_20260825.md"
counterproof: "Clean restart with OPENAI_API_KEY + NOUS auth.json → all 4 engines configured → health + models + chat/completions per engine → receipt emitted"
fixed_point_contribution: "Resolves gateway_unification, multi_engine_routing, dynamic_config, auth_integration"
mantra: "ONE PORT, FOUR ENGINES, ZERO DUPLICATION, DYNAMIC TRUTH"
---

# CENTRALDARK OMNI ROUTER — Gold Standard Skill

## Visão Geral

**ONE_SYSTEM_ONLY**: Um único ponto de entrada (porta 8099) que roteia para 4 engines substituíveis:
- `openai` → OpenAI Chat Completions API (oficial ou OpenRouter)
- `claude-code` → Claude Code CLI local
- `hermes` → Hermes local / OpenAI-compatible endpoint
- `nous` → Nous Research inference API (modelos Hermes gratuitos)

## Gatilho

- Missão exige roteamento multi-engine
- Gateway unification necessária
- CentralDark operational bootstrap

## Pré-requisitos (Medidos no Boot)

```bash
# Verificar ambiente
python -c "import fastapi, uvicorn, requests, pydantic"  # deps
claude --version  # CLI disponível
cat E:/CentralDark/Pivete/auth.json | jq '.credential_pool.openrouter'  # Nous token
```

## Configuração (Environment Variables)

```bash
# OpenAI / OpenRouter
OPENAI_API_KEY=sk-or-...          # obrigatório para engine openai
OPENAI_BASE_URL=https://openrouter.ai/api/v1  # ou https://api.openai.com
OPENAI_MODEL=zai-org/glm-5.2      # modelo padrão

# Hermes local (opcional)
HERMES_BASE_URL=http://localhost:8080/v1
HERMES_AUTH_TOKEN=...
HERMES_MODEL=hermes

# Nous Research (lê de auth.json automaticamente)
NOUS_MODEL=tencent/hy3:free       # ou qualquer :free do Nous

# Router
CENTRALDARK_ROUTER_HOST=127.0.0.1
CENTRALDARK_ROUTER_PORT=8099
CENTRALDARK_ROUTER_TOKEN=...      # opcional, Bearer auth
```

## Sintaxe de Roteamento

```bash
auto                                    → default engine (claude-code)
openai/zai-org/glm-5.2                 → OpenAI engine com modelo específico
claude-code/opus                       → Claude Code com override de modelo
nous/tencent/hy3:free                  → Nous Research engine
hermes/custom-model                    → Hermes endpoint local
```

## Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/health` | GET | Health check com 4 engines dinâmicos |
| `/v1/models` | GET | Lista 5 modelos (auto + 4 engines) |
| `/v1/chat/completions` | POST | Chat Completions unificado |

## Health Check — Estrutura de Prova Obrigatória

```json
{
  "ok": true,
  "service": "centraldark-omni-router",
  "version": "0.1.0",
  "default_engine": "claude-code",
  "engines": {
    "openai": {"configured": true, "transport": "official_api"},
    "claude-code": {"configured": true, "transport": "local_cli"},
    "hermes": {"configured": false, "transport": "openai_compatible_http"},
    "nous": {"configured": true, "transport": "nous_inference_api"}
  },
  "legacy_zendriver_chatgpt": "FROZEN_NOT_ROUTED"
}
```

## Self-Test (Obrigatório Antes de Subir)

```bash
python centraldark_omni_router.py --self-test
# ✅ {"ok": true, "checks": {"route_openai": true, "route_claude": true, "route_nous": true, "redaction": true, "flatten": true, "openai_extract": true, "cli_extract": true}, "failed": []}
```

## Inicialização (Daemon Robusto - 6 Pilares)

```python
# launch_omni_router_daemon.py
import os, subprocess, signal, atexit, time, json, hashlib
from http.server import HTTPServer, BaseHTTPRequestHandler

class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            # ... retorna estrutura de prova com sha256 + timestamp ISO8601 + proved: true
            pass

# 1. Signal Handlers (SIGTERM, SIGINT, SIGHUP)
# 2. Health Check HTTP (/health com prova)
# 3. Auto-Restart Watchdog (loop 30s)
# 4. PID File + atexit cleanup
# 5. Logging Persistente (FileHandler + StreamHandler)
# 6. Auto-Save State (60s com timestamp + sha256 + proved: true)
```

## Lições Cristalizadas (Gold)

### L1: MODULE_CONSTANTS ≠ RUNTIME_CONFIG
> Module-level `os.getenv()` roda uma vez no import. Para config hot-reloadable, ler `os.getenv()` no **tempo de request** dentro dos handlers.

### L2: CHAT_COMPLETIONS > RESPONSES_API
> OpenRouter e endpoints compatíveis implementam Chat Completions (`/v1/chat/completions` ou `/chat/completions` no base_url), não OpenAI Responses API (`/v1/responses`). Padronizar em Chat Completions para máxima compatibilidade.

### L3: AUTH.JSON AS CREDENTIAL SOURCE
> Token Nous vive em `auth.json` (managed by Hermes credential pool). Ler dinamicamente no request time, não de `.env`. Mantém segredos em um lugar e respeita rotação.

### L4: OPENROUTER PATH FIX
> OpenRouter base_url = `https://openrouter.ai/api/v1`. Endpoint real = `/chat/completions` (NÃO `/v1/chat/completions` nem `/api/v1/chat/completions`). O base_url já contém `/api/v1`.

### L5: DYNAMIC ENV READING
> Health endpoint reflete mudanças de config ao vivo sem restart. `os.getenv()` dentro do handler, não no nível do módulo.

## Validação de Fixed Point

```text
FIXED_POINT TRUE IFF:
1. objective_closed          → Single entrypoint, 4 engines
2. counterproof_survived     → All engines tested independently
3. applicable_invariants_hold → Dynamic config, Chat Completions, auth.json
4. no_material_unknown       → OpenRouter path documented
5. no_new_material_failure   → No regressions
6. no_new_information        → Stable after restarts
7. no_candidate_beats_baseline → This IS the baseline
8. regression_denominator_passed → Self-test + health + models + chat all pass
```

## Próximos Passos Naturais

1. **OpenRouter fix** → Implementar `/chat/completions` path detection automático
2. **Fallback chain** → openai → nous → claude-code automatico
3. **Streaming** → `stream: true` support
4. **Auth token** → `CENTRALDARK_ROUTER_TOKEN` para produção
5. **Hermes local** → Configurar quando Hermes Agent runtime disponível

## Arquivos de Referência

- `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py` — Implementação canônica
- `NUCLEO/docs/reference/CENTRALDARK_OMNI_ROUTER_CRISTALIZACAO_20260825.md` — Receipt completo
- `references/daemon-robust-mandatory-rules.md` — Padrão Daemon Robusto
- `references/centraldark-operational-method.md` — Método operacional