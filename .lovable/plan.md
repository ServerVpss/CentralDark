## Migração Total — Lovable Cloud → Supabase próprio (`lyoigsqluyktoclwdaft`)

Execução em paralelo com sub-agentes. Zero downtime no bot. Dual-write durante transição.

---

### Fase 0 — Captura de chaves (5 min, paralelo)

Sub-agente na VPS lê `/root/CentralDark/secrets/` via `mcp_custom_X4tUu--execute_command` com escalonamento (sudo se preciso). Extrai:
- `SUPABASE_ANON_KEY` do lyoig
- `SUPABASE_SERVICE_ROLE_KEY` do lyoig
- `SUPABASE_DB_URL` do lyoig (postgres://…)

Grava no Lovable via `set_secret` como `HUB_SUPABASE_URL`, `HUB_SUPABASE_ANON_KEY`, `HUB_SUPABASE_SERVICE_ROLE_KEY`, `HUB_SUPABASE_DB_URL`.

Fallback se MCP não conseguir ler: rodar script na VPS que exporta as chaves via túnel curl pra edge function temporária.

---

### Fase 1 — Dump completo do schema atual (10 min, paralelo)

Sub-agente 1: dump do schema (DDL) das 44 tabelas + policies + functions + triggers do Lovable via `pg_dump --schema-only` (só estrutura, sem dados) usando `PGHOST` já setado.

Sub-agente 2: dump dos dados (`pg_dump --data-only --column-inserts`) das 44 tabelas. 1,5 GB, streaming direto pro destino via pipe.

Sub-agente 3: dump do `auth.users` (14 users) + `auth.identities` — precisa via SQL direto porque pg_dump não pega auth schema em Supabase gerenciado.

---

### Fase 2 — Restore no destino (15 min)

Roda o schema dump no `lyoigsqluyktoclwdaft` via `psql "$HUB_SUPABASE_DB_URL"`. Ajusta:
- Remove qualquer `CREATE ROLE` (roles já existem)
- Preserva tabelas que já existem no hub (`contatos`, `hub_*`, `system_logs`) — usa `CREATE TABLE IF NOT EXISTS`
- Reaplica GRANTs pro `anon`/`authenticated`/`service_role`

Restore dos dados em ordem topológica (FKs) via `psql -f`.

Restore dos users via `INSERT INTO auth.users` com SQL raw (mantém `id`, `email`, `encrypted_password`).

---

### Fase 3 — Migração das 50 edge functions (30 min, paralelo)

Sub-agentes paralelos, 10 funções cada:

**44 funções fáceis:** duplicar cada uma trocando `SUPABASE_URL` → `HUB_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` → `HUB_SUPABASE_SERVICE_ROLE_KEY`. Publicar como `<nome>-hub` inicialmente, testar, depois substituir.

**6 funções com deps duras Lovable** (ai-proxy, graph-mapper, hub-services-check, mcp-status-notify, notify-telegram, webapp-format-ai):
- Mantém `LOVABLE_API_KEY` (é grátis, roda de qualquer lugar)
- Só troca as chaves Supabase
- Ficam idênticas em funcionamento

---

### Fase 4 — Dual-write transitório (validação, 24-48h)

Bot Telegram (produção) escreve nos DOIS bancos simultaneamente por 24h:
- Wrapper no `bot-telegram-proxy` que faz `insert` no Lovable **e** no hub Supabase
- Se hub falhar, log warning; se Lovable falhar, alerta crítico
- Reads continuam do Lovable

Objetivo: garantir que estrutura, RLS e volumes batem antes do corte.

---

### Fase 5 — Corte (5 min)

1. Atualizar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no `.env` do frontend pra apontar pro `lyoig`
2. Regenerar `src/integrations/supabase/client.ts` (mesmo path, novo backend)
3. Reads passam a vir do hub
4. Manter Lovable Cloud rodando como backup **por 7 dias** (custo zero se não escrever)

---

### Fase 6 — Realtime nativo do MCP (bônus, 15 min)

Tabela `mcp_heartbeat` já no hub. VPS manda POST direto. Hub e Obsidian plugin fazem subscribe via Realtime. Sem polling.

---

### Detalhes técnicos

**Ordem de restore FK-safe:**
```text
profiles → user_roles → query_modules → telegram_bots
→ telegram_users → telegram_subscriptions → telegram_messages
→ (demais em qualquer ordem)
```

**Comandos-chave da Fase 1/2:**
```bash
pg_dump "$PG_LOVABLE" --schema=public --schema-only -f /tmp/schema.sql
pg_dump "$PG_LOVABLE" --schema=public --data-only --column-inserts \
  -f /tmp/data.sql
psql "$HUB_SUPABASE_DB_URL" -f /tmp/schema.sql
psql "$HUB_SUPABASE_DB_URL" -f /tmp/data.sql
```

**Migração de auth.users** (SQL manual, porque Supabase não expõe auth schema no pg_dump gerenciado):
```sql
-- roda no source, exporta CSV
COPY (SELECT id, email, encrypted_password, email_confirmed_at, 
      raw_user_meta_data FROM auth.users) TO STDOUT WITH CSV;
-- roda no destino
INSERT INTO auth.users (id, email, encrypted_password, ...) 
SELECT ... FROM stdin;
```

**Rollback:** se qualquer coisa quebrar, `git revert` no `.env` do frontend + `client.ts` volta tudo em 30s. Dados no Lovable ficam intactos até corte final.

---

### Riscos e mitigações

| Risco | Mitigação |
|---|---|
| `lyoig` no plano free/starter e 1,5GB estoura limite | Sub-agente Fase 0 checa plano via Management API antes de dumpar. Se estourar, aviso pra upgrade antes de continuar |
| Auth users perdem senha | Copiamos `encrypted_password` bruto (mesmo algoritmo bcrypt do Supabase) — funciona |
| Realtime publications não vêm no pg_dump | Reaplicar manualmente: `ALTER PUBLICATION supabase_realtime ADD TABLE …` |
| RLS policies com `auth.uid()` — dependem do JWT do destino | Já funciona nativo porque ambos são Supabase (mesmo esquema auth) |
| Bot cai durante corte | Dual-write da Fase 4 elimina esse risco — corte é só flip de env var |
| Tabelas do hub (`contatos`, `hub_*`) conflitam com nomes do Lovable | Sub-agente Fase 1 checa colisões antes; se houver, renomeia com prefixo `lovable_` |

---

### Placar estimado

```text
Fase 0  ▓░░░░░░░░░  5 min   captura chaves
Fase 1  ▓▓░░░░░░░░  15 min  dump
Fase 2  ▓▓▓░░░░░░░  30 min  restore
Fase 3  ▓▓▓▓▓░░░░░  60 min  50 edge functions em paralelo
Fase 4  (24-48h)    dual-write validação
Fase 5  ▓░░░░░░░░░  5 min   corte
Fase 6  ▓▓░░░░░░░░  15 min  realtime MCP
```

Tempo real ativo de trabalho (excluindo espera dual-write): ~2h corridas.

---

### Confirma pra eu executar?

Se der GO, entro em build mode e disparo Fase 0 + 1 em paralelo imediatamente. Se `lyoig` estiver em plano free e não couber 1,5GB, paro e te aviso antes de continuar.