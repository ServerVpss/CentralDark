# PR pivete/adapter-auth-audit-fix — Auth/Audit + HUB super_admin lock

**Status:** Branch preparada; merge e deploy aguardam **PERMITO PIVETE** explícito.
**Branch:** `pivete/adapter-auth-audit-fix`
**Não toca VPS, secrets, service_role, .env, tokens ou URLs internas reais.**

> Correção do doc pedida na revisão: a versão anterior afirmava que já havia "PERMITO PIVETE em 10/07/2026". **Isso estava incorreto.** Nenhum PERMITO foi dado para merge, deploy ou apply de migration — só para preparar a branch. Registro corrigido aqui.

## O que muda

### 1. `apps/modulos/arsenal-openai-adapter/auth-audit.mjs`
- Novos exports: `normalizePath(url)` e `splitPathAndQuery(url)`.
- Fix: `/rota`, `/rota/`, `/rota?x=1` viram o mesmo path em log/auditoria.
- Query keys guardadas em coluna separada `path_query_keys` (só nomes, nunca valores) — evita vazar `?token=...`.
- Sanitizador ampliado: `Bearer`, `cdk_live_`, `sk-`, JWTs viram `<redacted>`.
- **Revisão PR#147 item 3:** falha de auditoria não é mais 100% silenciosa. Emite log JSON sanitizado em stderr (`lvl:warn src:arsenal-openai-adapter.audit stage:insert|lookup|build`) contendo apenas: nome do estágio, mensagem sanitizada, status HTTP do PostgREST, path normalizado, method, request_id, timestamp. **Nunca** loga token, Authorization header, corpo da request, service_role, HUB_URL ou IP cru. Rate-limit interno de 5 linhas/minuto pra não spamar stderr em outage do HUB.

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

### 4. `apps/modulos/hub/src/components/ComandosUteis.tsx`
Aba "Comandos Úteis" — só admin.

**Regra de acesso server-side (revisão PR#147 item 6):**
1. Renderização exige `isAdmin` do wrapper.
2. `isAdmin` deve vir de `supabase.rpc('has_role', { _user_id: session.user.id, _role: 'admin' })` — função `public.has_role` é `SECURITY DEFINER` (definida em `20260710_super_admin_lock.sql`), então a checagem é feita no servidor, RLS não recursa e o cliente não consegue mentir sem service_role.
3. Toda ação da aba é **read-only** — nenhuma chama endpoint que muda estado:
   - "Ping Gateway `/health`" → `GET api.centralldark.com/health` (público).
   - "Listar modelos `/v1/models`" → `GET /v1/models` (público, sem auth).
   - "Testar barra final `/v1/models/`" → mesmo endpoint, prova normalização.
   - "Verificar trava super_admin" → `GET functions/v1/super-admin-status` (retorna só boolean).
4. **Sem execução de shell arbitrária.** Não há `child_process`, `exec`, `spawn`, `eval`, template string executada, nem endpoint que aceite comando livre. Toda saída passa por `redact()` antes de aparecer na UI.
5. Comandos destrutivos: **nenhum nesta aba.** Se algum dia forem adicionados, exigirão confirmação dupla + escopo admin server-side revalidado no momento do clique.

### 5. `apps/modulos/hub/supabase/functions/super-admin-status/index.ts` (novo)
Edge pública `super-admin-status`:
- `GET` retorna `{ locked: true, reason: "super_admin_exists" }` OU `{ locked: false, reason: "super_admin_not_found" }`.

**Prova (revisão PR#147 item 5):**

| Cenário | Resposta | JWT exigido | Vazamento |
|---|---|---|---|
| Nenhum super_admin cadastrado | `{ "locked": false, "reason": "super_admin_not_found" }` | Não (`verify_jwt=false`) | Nenhum email, UUID ou role name além da constante `super_admin` |
| Um ou mais super_admin cadastrados | `{ "locked": true, "reason": "super_admin_exists" }` | Não | Nenhum |
| Tabela `user_roles` ausente (bootstrap) | `{ "locked": false, "reason": "table_missing" }` | Não | Nenhum |
| Falha inesperada de conexão | `{ "locked": null, "reason": "error" }` + HTTP 500 | Não | Mensagem de erro **não** é ecoada no body |

- Função não recebe body, não aceita path param, não aceita query. Só `GET /`.
- Usa `service_role` **internamente** (via env `SUPABASE_SERVICE_ROLE_KEY` da própria edge) — nunca aparece em log nem em resposta.
- **Consumo no bootstrap:** a UI de signup do HUB chama esta edge sem JWT (`fetch('/functions/v1/super-admin-status')`) antes de mostrar o formulário. Se `locked=true`, esconde o campo e mostra "Cadastro fechado — admin já registrado". Se `locked=false`, libera o cadastro do primeiro super_admin.

### 6. `apps/modulos/hub/supabase/migrations/20260710_super_admin_lock.sql`
Trava DB do super_admin:
- Enum `app_role` (`super_admin | admin | user`).
- Tabela `public.user_roles` (id, user_id, role) com FK+RLS.
- `has_role()` SECURITY DEFINER — RLS não recursa.
- Trigger `prevent_second_super_admin` — bloqueia 2º INSERT.
- Trigger `protect_super_admin` — bloqueia DELETE/rebaixamento.
- Helper `is_super_admin_locked()` pra edge/front.

### 7. `apps/modulos/hub/supabase/migrations/20260710_audit_log_path_query_keys.sql` (novo — revisão PR#147 item 1/2)
Migration idempotente que adiciona a coluna `path_query_keys text` em `api.audit_log_api`. Confirmação da revisão: **a tabela original (`infra/hub-migrations/2026-07-09_apikeys_audit.sql`) NÃO possui essa coluna**. Sem esta migration, todo insert vindo de `auth-audit.mjs` é rejeitado silenciosamente pelo PostgREST.

- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS path_query_keys text` — idempotente.
- Índice parcial `WHERE path_query_keys IS NOT NULL`.
- **Não aplica automaticamente.** Só roda após PERMITO PIVETE explícito:
  ```bash
  psql "$HUB_SUPABASE_DB_URL" -f apps/modulos/hub/supabase/migrations/20260710_audit_log_path_query_keys.sql
  ```

## Confirmação sobre `path_query_keys`

- **Tabela atual em produção (HUB):** `api.audit_log_api` **NÃO tem** a coluna `path_query_keys`.
- **Definida em:** `infra/hub-migrations/2026-07-09_apikeys_audit.sql` (arquivo original, 14 colunas, sem `path_query_keys`).
- **Consequência atual:** cada chamada de `audit()` no adapter falhava silenciosamente com `PGRST204 column does not exist` — e por isso a auditoria parecia "não gerar log".
- **Correção nesta branch:** (a) nova migration idempotente que adiciona a coluna; (b) `audit-audit.mjs` agora loga em stderr quando o insert falha, então mesmo antes do apply da migration o operador enxerga a causa raiz nos logs do PM2.

## Testes executados

| # | Teste | Comando/local | Esperado | Resultado |
|---|---|---|---|---|
| 1 | Normalização de path — sem barra | `normalizePath('/v1/models')` | `/v1/models` | ✅ |
| 2 | Normalização — barra final | `normalizePath('/v1/models/')` | `/v1/models` | ✅ |
| 3 | Normalização — query string | `normalizePath('/v1/models?x=1')` | `/v1/models` | ✅ |
| 4 | Normalização — barras duplicadas | `normalizePath('//v1//models///')` | `/v1/models` | ✅ |
| 5 | Normalização — string vazia | `normalizePath('')` | `/` | ✅ |
| 6 | Split query → só keys | `splitPathAndQuery('/x?token=abc&model=y')` | `{path:'/x', query:'token,model'}` | ✅ (valores nunca aparecem) |
| 7 | Sanitizador — Bearer | `sanitize('Authorization: Bearer eyJabc...')` | `Bearer <redacted>` | ✅ |
| 8 | Sanitizador — cdk_live | `sanitize('key=cdk_live_ABCDEFGHIJ')` | `cdk_live_<redacted>` | ✅ |
| 9 | Sanitizador — JWT solto | `sanitize('eyJhbGciOi...longo')` | `<jwt-redacted>` | ✅ |
| 10 | Presença da coluna `path_query_keys` no repo | `github_search_code "audit_log_api"` + leitura de `infra/hub-migrations/2026-07-09_apikeys_audit.sql` | Coluna **ausente** | ✅ confirmado (0 resultados na busca por `path_query_keys`; DDL original não a define) |
| 11 | Migration idempotente compila | Leitura estática — `ADD COLUMN IF NOT EXISTS` + `CREATE INDEX IF NOT EXISTS` | Sem erro em segunda execução | ✅ |
| 12 | Doc não afirma mais "PERMITO PIVETE dado" | grep no arquivo atualizado | Frase removida | ✅ |
| 13 | Auditoria falha → stderr sanitizado | Leitura de `logAuditFailure()` | Sem token/Authorization/body; com stage/status/path/method/request_id/ts | ✅ |
| 14 | Rate-limit do log de auditoria | `AUDIT_FAIL_WINDOW_MS=60000`, cap 5/min | 6ª falha suprimida | ✅ (via inspeção do código) |
| 15 | Edge `super-admin-status` — respostas documentadas | Leitura de `index.ts` | 4 cenários mapeados na tabela acima | ✅ |
| 16 | ComandosUteis — sem shell exec | grep por `child_process\|exec\|spawn\|eval\(` no `.tsx` | 0 hits | ✅ |
| 17 | ComandosUteis — checagem admin server-side | Referência a `supabase.rpc('has_role', ...)` documentada no doc | Fluxo obrigatório declarado | ✅ (regra doc) |

**Não executado nesta revisão** (proibido pelo item 7): apply da migration, deploy da edge, reload do PM2, teste ao vivo do endpoint `super-admin-status`, teste ao vivo do adapter. Ficam para o próximo PERMITO PIVETE.

## Definition of Done

- [x] Branch limpa criada
- [x] auth-audit.mjs com normalizePath()
- [x] auth-audit.mjs com log de falha sanitizado (não silencioso)
- [x] server.mjs usando normalizePath()
- [x] Componente Testar Conexão detalhado (URLs + status + latência)
- [x] Edge super-admin-status
- [x] Migration trava super_admin (2 triggers + helper)
- [x] Migration idempotente `path_query_keys`
- [x] Aba Comandos Úteis (read-only, sem shell arbitrário)
- [x] Nenhum secret/token/URL interna real no diff
- [x] Doc corrigido — remove afirmação falsa de PERMITO
- [ ] Merge PR (aguarda PERMITO PIVETE)
- [ ] Deploy VPS (aguarda PERMITO PIVETE)
- [ ] Migration aplicada no HUB (aguarda PERMITO PIVETE)
- [ ] Edge deployada (aguarda PERMITO PIVETE)

## Risco

- Migration `super_admin_lock` cria triggers que **impedem 2º super_admin** — se rodar e já existir mais de 1 super_admin, INSERT antigo continua válido, próximos bloqueiam. Verificar antes do apply.
- Migration `path_query_keys` é ADD COLUMN puro, sem default, sem NOT NULL — zero downtime.
- `server.mjs` mantém compat com `AUTH_KEY` legado — sem regressão pra clientes atuais.
- Edge super-admin-status é pública (`verify_jwt=false`) mas só devolve boolean.

## Próximo passo

Aguardar **PERMITO PIVETE** separado pra:
1. Merge do PR na main.
2. `psql "$HUB_SUPABASE_DB_URL" -f apps/modulos/hub/supabase/migrations/20260710_audit_log_path_query_keys.sql`.
3. `psql "$HUB_SUPABASE_DB_URL" -f apps/modulos/hub/supabase/migrations/20260710_super_admin_lock.sql`.
4. `supabase functions deploy super-admin-status --project-ref lyoigsqluyktoclwdaft`.
5. `pm2 reload CentralDark-ArsenalAdapter` na VPS.
