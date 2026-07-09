## 🎯 Missão — Bootstrap Admin-Only (HUB)

Fundação de **API Keys + Auditoria + MCP seguro** no HUB Supabase (`lyoigsqluyktoclwdaft`), admin-only agora, modelagem pronta pra multi-cliente depois. Sem tocar em `.env`/PM2/nginx da VPS, sem v1/v2/v3, sem chave completa em log/commit.

---

## 📐 Arquitetura

```text
Cliente/CLI ──► api.centralldark.com (arsenal-openai-adapter)
                    │ 1. extrai Authorization: Bearer cdk_live_…
                    │ 2. hash SHA256 → busca em api.api_keys (cache 60s)
                    │ 3. valida status + scopes
                    │ 4. proxy pra upstream (Abacus / Lovable Gateway)
                    │ 5. INSERT em api.audit_log (sanitizado)
                    ▼
              HUB Supabase (lyoig)
              ├─ api.api_keys        (hash-only, admin-read)
              ├─ api.audit_log       (append-only, admin-read)
              └─ api.mcp_view_*      (views sanitizadas p/ MCP)
```

---

## 🗺️ Fases (PRs separados)

### PR#1 — Schema HUB (`infra/hub-migrations/2026-07-09_apikeys_audit.sql`)
- `api.api_keys`: `id, prefix (12ch), hash (sha256 hex), label, owner_email, scopes text[], status ('active'|'revoked'), rate_limit_rpm, usage_count, last_used_at, created_at, revoked_at, created_by`.
- `api.audit_log`: `id, ts, request_id, key_prefix (nullable), path, method, status, model, tokens_in, tokens_out, latency_ms, error_code, error_message_sanitized, ip_hash, user_agent_family`.
- `api.mcp_summary` view: agrega por hora (sem prefix, sem IP).
- GRANT: `service_role ALL`; `authenticated SELECT` só via view `api.api_keys_safe` (prefix+label+status, sem hash); `anon` ZERO.
- RLS: admin-only via `public.has_role(auth.uid(), 'admin')`.
- Aplicação via `psql "$HUB_SUPABASE_DB_URL"` (secret na VPS).

### PR#2 — Gateway middleware (`apps/modulos/arsenal-openai-adapter/`) 🔒
- Novo módulo `auth-audit.mjs`:
  - `authenticate(req)`: extrai Bearer, `sha256`, consulta HUB (cache 60s LRU), retorna `{keyId, prefix, scopes}` ou 401.
  - `audit(req, res, timing)`: insere via service_role no HUB, sanitiza (remove `Authorization`, `sk-*`, `cdk_live_*`, `Bearer …`).
  - `checkScope(scopes, path)`: bloqueia rota fora do escopo → 403.
- Wrap no handler existente. Toggle `AUTH_ENFORCE=shadow|enforce` (começa `shadow` = loga mas não bloqueia por 24h).
- Sem restart automático — Pivete decide o `pm2 reload`.

### PR#3 — Painel HUB (`apps/modulos/hub/`) 🔒
- Aba **🔑 Chaves API** (`ApiKeysTab.tsx`):
  - Lista via `api.api_keys_safe`.
  - Botão **Criar** → edge `hub-create-api-key` gera prefix `cdk_live_` + secret aleatório, mostra UMA vez em modal, salva hash.
  - Botão **Revogar** → edge `hub-revoke-api-key`.
- Aba **📋 Auditoria** (`AuditApiTab.tsx`): tabela paginada da `api.audit_log`, filtros (status/path/prefix), gráfico p95 latência (reciclar `useAiRequests` pattern).
- Guard: `useAuth().isAdmin` (padrão já existente).

### PR#4 — MCP endpoints seguros (`apps/modulos/mcp/`)
- Tools novas:
  - `hub_gateway_status` → GET `/v1/inventory` + últimas 24h summary.
  - `hub_audit_summary` → só `api.mcp_summary` (agregado, sem prefix/IP).
  - `hub_api_key_list` → só `api_keys_safe` (sem hash).
- Bloqueio explícito: nenhuma tool retorna `hash`, `Authorization`, `cdk_live_*` completo. Sanitizer já existente (`sanitize.js`) aplicado em toda saída.
- Write tools (revogar/criar) exigem scope `admin:write` no token do MCP → registra em `audit_log`.

### PR#5 — Smoke tests + Ouro
- `scripts/smoke-hub-apikeys.mjs`:
  1. `anon` faz SELECT em `api.api_keys` → espera 401/permission denied ✅
  2. Cria chave via edge → recebe secret uma vez, segunda leitura só vê hash ✅
  3. Chama gateway com chave válida → 200 + audit_log com `key_prefix`, sem `Authorization` ✅
  4. Chama com chave revogada → 401, audit_log registra ✅
  5. `grep -E 'cdk_live_[A-Za-z0-9_-]{20,}' logs/*` → 0 matches ✅
  6. MCP tool `hub_audit_summary` → resposta não contém `prefix`, `ip`, `Authorization` ✅
- Registrar Aprendizado #245 em `docs/CONSCIENCIA/APRENDIZADOS.md`.
- Card Hermes v1.3 no admin.

---

## 🔒 Travas respeitadas
- Backend só no HUB (`lyoigsqluyktoclwdaft`), zero migration no Lovable atual.
- `arsenal-openai-adapter` e `apps/modulos/hub/` são 🔒 → **PERMITO PIVETE já dado**.
- SSH via secret `VPS_SSH_KEY_LOVABLE` só para aplicar migration no HUB e ler `HUB_SUPABASE_DB_URL`.
- Sem `pm2 restart`, sem `.env` commit, sem force-push, sem v1/v2/v3.
- `AUTH_ENFORCE=shadow` no PR#2 = zero risco de derrubar clientes atuais (só você usa hoje, mas segue o padrão defensivo).

---

## 📦 Entregáveis finais
1. 5 commits atômicos no `ServerVpss/CentralDark`.
2. Migration aplicada no HUB (evidência: `\dt api.*`).
3. Smoke test verde (6/6).
4. Screenshot das abas 🔑 Chaves e 📋 Auditoria (dev).
5. Aprendizado #245 registrado.
6. Card Hermes no `@srver1bot` admin.

---

## ❓ Confirmação final antes de disparar
Você já autorizou ("PERMITO PIVETE"), mas confirma:
- **AUTH_ENFORCE começa em `shadow`** (só loga) → viramos `enforce` só depois de 24h de log limpo?
- **Edge `hub-create-api-key`** fica no HUB Supabase (não no Lovable atual)?

Manda **"toca ficha"** e eu abro PR#1 → PR#5 em cascata trazendo evidência de cada fase.
