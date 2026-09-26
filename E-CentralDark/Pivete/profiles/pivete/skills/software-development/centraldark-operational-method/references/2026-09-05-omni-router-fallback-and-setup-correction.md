# Omni Router Fallback Automático + SETUP.md Correção — Session 2026-09-05

## Omni Router — Fallback Chain Implementado

**Arquivo**: `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`

```python
# Linha 32
DEFAULT_FALLBACK_CHAIN = "nous,hermes,google,claude-code,xai,abacus,openai"
```

**Função `execute_with_failover`** (linhas 583-672):
- Tenta cada provider na ordem da cadeia
- Pula providers não configurados (`provider_configured` check)
- Pula providers que violam política de preço (`free_only_allows`)
- Se provider falha (HTTPException), continua para o próximo
- Retorna `fallback_used: true` no receipt quando usa provider não primário
- `CENTRALDARK_AUTO_FALLBACK` default `True` (linha 324)

**Cadeia completa**: `nous` → `hermes` → `google` → `claude-code` → `xai` → `abacus` → `openai`

**Abacus** agora é provider interno do Omni Router, não requisito direto da superfície Codex.

---

## SETUP.md Correção — Worktree `_wt_1366_resolve`

**Arquivo corrigido**: `_wt_1366_resolve/docs/CODEX/SETUP.md` (linhas 126-178)

### Antes (problemático):
```toml
model_provider = "abacus"

[model_providers.abacus]
name = "Abacus RouteLLM"
base_url = "https://routellm.abacus.ai/v1"
wire_api = "responses"
env_key = "ABACUS_API_KEY"
```
- Forçava `ABACUS_API_KEY` na superfície Codex
- Falha global se key ausente (`MISSING_OPTIONAL_PROVIDER_KEY == GLOBAL_SURFACE_FAILURE`)

### Depois (corrigido):
```toml
model_provider = "centraldark-router"

[model_providers.centraldark-router]
name = "CentralDark Omni Router"
base_url = "http://127.0.0.1:8099/v1"
wire_api = "chat"
# Sem env_key — o Omni Router aceita local-no-auth ou herda do auth.json (Nous)
# Fallback automático: nous/gratis, claude-code, hermes, openai-codex
```

**Princípios aplicados**:
- `MISSING_OPTIONAL_PROVIDER_KEY != GLOBAL_SURFACE_FAILURE`
- `UNKNOWN != PASS`
- Superfície Codex fala com Casa via Omni Router
- Credenciais upstream (ABACUS_API_KEY, etc.) pertencem ao router/owner do provider

---

## SETUP.md Principal — Já Correto

**Arquivo**: `docs/CODEX/SETUP.md` (linhas 103-150)
- Já aponta para `model_provider = "centraldark"` / porta 8099
- Explica que `ABACUS_API_KEY` etc. pertencem ao router/owner interno
- Regra explícita: `MISSING_OPTIONAL_PROVIDER_KEY != GLOBAL_SURFACE_FAILURE`

---

## Cadeia de Autenticação Atualizada (2026-09-05)

| Componente | Status | Detalhes |
|------------|--------|----------|
| Nous token | ✅ | `auth.json` lido dinamicamente (`centraldark_omni_router.py:146`) |
| Omni Router | ✅ | Porta 8099 ativa; engine `nous` free; fallback `centraldark-router` no config.yaml |
| MCP_CENTRALDARK_TOKEN | ⚠️ Vazio local | `ecosystem.config.cjs:72` — vem do VPS via `sync-mcp-password.sh` |
| Hermes profile | ✅ | Provider `centraldark-router`, base_url `http://127.0.0.1:8099/v1` |
| **Faltando para cadeia completa** | | |
| OPENAI_API_KEY | ❌ | OpenRouter |
| HERMES_AUTH_TOKEN | ❌ | Se usar Hermes local |
| Claude Code trust | ❌ | `hasTrustDialogAccepted: true` no `~/.claude.json` |
| MCP token sync | ❌ | `sync-mcp-password.sh` na VPS |

---

## Commit de Referência

- **Omni Router failover**: commit `94327e01` (PR #1381) — já na main
- **SETUP.md worktree correção**: patch aplicado no worktree `_wt_1366_resolve`

---

## Próximos Passos para Fixed Point

1. Set `OPENAI_API_KEY` no ambiente (OpenRouter)
2. Trust workspace no Claude Code (`projects["E:/CentralDark/Pivete/CentralDark"].hasTrustDialogAccepted: true`)
3. Rodar `sync-mcp-password.sh` na VPS para popular `MCP_CENTRALDARK_TOKEN`
4. Testar rota `nous/poolside/laguna-xs-2.1:free` via Omni Router (já validado: 3.4s)