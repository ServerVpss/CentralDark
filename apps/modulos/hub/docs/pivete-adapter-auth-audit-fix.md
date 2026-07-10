# PR pivete/adapter-auth-audit-fix — Auth/Audit + HUB super_admin lock

**Escopo:** correção cirúrgica autorizada por "PERMITO PIVETE" em 10/07/2026.
**Branch:** `pivete/adapter-auth-audit-fix`
**Não toca VPS, secrets, service_role, .env, tokens ou URLs internas reais.**

## O que muda

### 1. `apps/modulos/arsenal-openai-adapter/auth-audit.mjs`
- Novos exports: `normalizePath(url)` e `splitPathAndQuery(url)`.
- Fix: `/rota`, `/rota/`, `/rota?x=1` viram o mesmo path em log/auditoria.
- Query keys guardadas em coluna separada `path_query_keys` (só nomes, nunca valores) — evita vazar `?token=...`.
- Sanitizador ampliado: `Bearer`, `cdk_live_`, `sk-`, JWTs viram `<redacted>`.
- Auditoria SEMPRE normaliza — se caller esquecer, path continua consistente.

### 2. `apps/modulos/arsenal-openai-adapter/server.mjs`
- Importa `normalizePath`.
- Comparações de rota (`/health`, `/v1/models`, `/models`, `/v1/chat/completions`, `/chat/completions`) agora usam path normalizado.
- 404 devolve `path` (normalizado) + `request_id` pra debug.

### 3. `apps/modulos/hub/src/lib/gatewayProbe.ts` (novo)
Probe multi-URL do gateway pra o botão "Testar Conexão":
- Testa `/rota` E `/rota/` (prova normalização).
- Devolve `status`, `latencyMs`, `overall` (`OK | DEGRADED | OFF | UNKNOWN`).
- `redact()` remove qualquer segredo do output antes de exibir.
- Sem token no header por padrão (`authScheme: 'none'`); opcional `x-api-key` ou `bearer`.

### 4. `apps/modulos/hub/src/components/ComandosUteis.tsx` (novo)
Aba "Comandos Úteis" — só admin:
- Comandos seguros de leitura: ping gateway, listar modelos, testar barra final, verificar trava super_admin.
- Comandos destrutivos aparecem mas exigem confirmação dupla.
- Descrição leiga (sem jargão) por comando.
- Saídas sempre passam por `redact()`.

### 5. `apps/modulos/hub/supabase/functions/super-admin-status/index.ts` (novo)
Edge pública `super-admin-status`:
- `GET` retorna `{ locked: true, reason: "super_admin_exists" }` OU `{ locked: false, reason: "super_admin_not_found" }`.
- Nunca retorna email, user_id ou qualquer dado sensível.
- Usa `service_role` internamente (nunca vazado).
- Tolera tabela ausente (`table_missing`) pra bootstrap inicial.

### 6. `apps/modulos/hub/supabase/migrations/20260710_super_admin_lock.sql` (novo)
Trava DB do super_admin:
- Enum `app_role` (`super_admin | admin | user`).
- Tabela `public.user_roles` (id, user_id, role) com FK+RLS.
- `has_role()` SECURITY DEFINER — RLS não recursa.
- Trigger `prevent_second_super_admin` — bloqueia 2º INSERT.
- Trigger `protect_super_admin` — bloqueia DELETE/rebaixamento.
- Helper `is_super_admin_locked()` pra edge/front.

## Como testar

```bash
# 1. Normalização de path
node -e "import('./apps/modulos/arsenal-openai-adapter/auth-audit.mjs').then(m => {
  console.log(m.normalizePath('/v1/models'));      // /v1/models
  console.log(m.normalizePath('/v1/models/'));     // /v1/models
  console.log(m.normalizePath('/v1/models?x=1'));  // /v1/models
  console.log(m.normalizePath('//v1//models///')); // /v1/models
  console.log(m.normalizePath(''));                 // /
})"

# 2. Endpoint super_admin (depois de subir no HUB)
curl -s https://<HUB>/functions/v1/super-admin-status
# → { "locked": false, "reason": "super_admin_not_found" }
```

## Definition of Done

- [x] Branch limpa criada
- [x] auth-audit.mjs com normalizePath()
- [x] server.mjs usando normalizePath()
- [x] Componente Testar Conexão detalhado (URLs + status + latência)
- [x] Edge super-admin-status
- [x] Migration trava super_admin (2 triggers + helper)
- [x] Aba Comandos Úteis
- [x] Nenhum secret/token/URL interna real no diff
- [ ] Deploy VPS (aguarda PERMITO PIVETE separado)
- [ ] Migration aplicada no HUB (aguarda PERMITO PIVETE separado)

## Risco

- Migration cria triggers que **impedem 2º super_admin** — se rodar e já existir mais de 1 super_admin, INSERT antigo continua válido, próximos bloqueiam. Verificar antes do apply.
- `server.mjs` mantém compat com `AUTH_KEY` legado — sem regressão pra clientes atuais.
- Edge super-admin-status é pública (verify_jwt=false) mas só devolve boolean.

## Próximo passo

Aguardar "PERMITO PIVETE" separado pra:
1. `pm2 reload CentralDark-ArsenalAdapter` na VPS.
2. `supabase db push` no HUB (lyoigsqluyktoclwdaft).
3. `supabase functions deploy super-admin-status --project-ref lyoigsqluyktoclwdaft`.
