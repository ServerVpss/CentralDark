-- apps/modulos/hub/supabase/migrations/20260710_audit_log_path_query_keys.sql
--
-- Correção pedida na revisão do PR #147.
-- Objetivo:
--   A migration original `infra/hub-migrations/2026-07-09_apikeys_audit.sql`
--   criou `api.audit_log_api` SEM a coluna `path_query_keys`.
--   O módulo `apps/modulos/arsenal-openai-adapter/auth-audit.mjs` já escreve
--   nessa coluna (nomes das keys de query, nunca valores) — sem ela, o insert
--   é rejeitado silenciosamente pelo PostgREST e a auditoria perde o campo.
--
-- Regras:
--   - Idempotente (ADD COLUMN IF NOT EXISTS + CREATE INDEX IF NOT EXISTS).
--   - Só ALTER — não recria a tabela, não mexe em RLS/grants existentes.
--   - Não aplica automaticamente. Rodar SÓ após "PERMITO PIVETE" explícito:
--       psql "$HUB_SUPABASE_DB_URL" -f 20260710_audit_log_path_query_keys.sql
--
-- Sem segredo, sem URL interna, sem service_role no arquivo.

alter table api.audit_log_api
  add column if not exists path_query_keys text;

comment on column api.audit_log_api.path_query_keys is
  'Nomes (CSV) das keys de query string da request — NUNCA os valores. Ex.: "model,stream". Preenchido por auth-audit.mjs via splitPathAndQuery(). Evita duplicar rota entre /rota e /rota?x=1 sem vazar tokens.';

-- Índice opcional (útil se algum dia filtrarmos por presença de query),
-- barato mesmo em tabela grande porque a coluna é curta.
create index if not exists audit_log_api_path_query_keys_idx
  on api.audit_log_api (path_query_keys)
  where path_query_keys is not null;
