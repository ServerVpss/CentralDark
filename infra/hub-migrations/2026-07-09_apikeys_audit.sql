-- =====================================================================
-- HUB Supabase (lyoigsqluyktoclwdaft) — Bootstrap Admin-Only
-- 2026-07-09 · api_keys + audit_log + views MCP sanitizadas
-- =====================================================================
-- Aplicado via: psql "$HUB_SUPABASE_DB_URL" -f 2026-07-09_apikeys_audit.sql
-- Idempotente (IF NOT EXISTS / CREATE OR REPLACE).
-- Regras: admin-only agora, modelagem pronta pra multi-cliente futuro.
-- =====================================================================

-- ---------- 1. api.api_keys -----------------------------------------
CREATE TABLE IF NOT EXISTS api.api_keys (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prefix          text NOT NULL UNIQUE,           -- ex: 'cdk_live_UW'  (12 chars)
  hash            text NOT NULL,                  -- sha256 hex do secret completo
  label           text NOT NULL,
  owner_email     text,                           -- futuro multi-cliente
  scopes          text[] NOT NULL DEFAULT ARRAY['read']::text[],
  status          text NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','revoked')),
  rate_limit_rpm  int  NOT NULL DEFAULT 60,
  usage_count     bigint NOT NULL DEFAULT 0,
  last_used_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  revoked_at      timestamptz,
  created_by      uuid                            -- auth.uid() do admin criador
);

CREATE INDEX IF NOT EXISTS api_keys_hash_idx    ON api.api_keys(hash);
CREATE INDEX IF NOT EXISTS api_keys_status_idx  ON api.api_keys(status);
CREATE INDEX IF NOT EXISTS api_keys_prefix_idx  ON api.api_keys(prefix);

-- ---------- 2. api.audit_log_api ------------------------------------
-- (nome _api pra não colidir com api.audit_log de governance que já existe)
CREATE TABLE IF NOT EXISTS api.audit_log_api (
  id                        bigserial PRIMARY KEY,
  ts                        timestamptz NOT NULL DEFAULT now(),
  request_id                text,
  key_prefix                text,             -- só prefix, NUNCA hash/secret
  path                      text NOT NULL,
  method                    text NOT NULL,
  status                    int  NOT NULL,
  model                     text,
  tokens_in                 int,
  tokens_out                int,
  latency_ms                int,
  error_code                text,
  error_message_sanitized   text,
  ip_hash                   text,             -- sha256(ip + salt)
  user_agent_family         text
);

CREATE INDEX IF NOT EXISTS audit_log_api_ts_idx      ON api.audit_log_api(ts DESC);
CREATE INDEX IF NOT EXISTS audit_log_api_status_idx  ON api.audit_log_api(status);
CREATE INDEX IF NOT EXISTS audit_log_api_prefix_idx  ON api.audit_log_api(key_prefix);
CREATE INDEX IF NOT EXISTS audit_log_api_path_idx    ON api.audit_log_api(path);

-- ---------- 3. Views sanitizadas ------------------------------------

-- Chaves sem hash (nem prefix completo é sensível, mas hash NUNCA sai)
CREATE OR REPLACE VIEW api.api_keys_safe AS
SELECT
  id,
  prefix,
  label,
  owner_email,
  scopes,
  status,
  rate_limit_rpm,
  usage_count,
  last_used_at,
  created_at,
  revoked_at
FROM api.api_keys;

-- Sumário agregado (MCP-safe): sem prefix, sem IP, sem request_id
CREATE OR REPLACE VIEW api.mcp_summary AS
SELECT
  date_trunc('hour', ts) AS hour,
  path,
  method,
  status,
  count(*)                        AS requests,
  avg(latency_ms)::int            AS avg_latency_ms,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms)::int AS p95_latency_ms,
  sum(coalesce(tokens_in,0))      AS tokens_in,
  sum(coalesce(tokens_out,0))     AS tokens_out
FROM api.audit_log_api
WHERE ts > now() - interval '7 days'
GROUP BY 1,2,3,4;

-- ---------- 4. GRANTs (Data API é obrigatório no HUB) ---------------
-- Base tables: service_role escreve, admin autenticado lê.
-- anon NUNCA toca.

REVOKE ALL ON api.api_keys       FROM PUBLIC, anon, authenticated;
REVOKE ALL ON api.audit_log_api  FROM PUBLIC, anon, authenticated;

GRANT ALL    ON api.api_keys       TO service_role;
GRANT ALL    ON api.audit_log_api  TO service_role;
GRANT USAGE, SELECT ON SEQUENCE api.audit_log_api_id_seq TO service_role;

-- Views seguras: authenticated lê (RLS ainda restringe por has_role).
GRANT SELECT ON api.api_keys_safe TO authenticated;
GRANT SELECT ON api.mcp_summary   TO authenticated;

-- ---------- 5. RLS admin-only ---------------------------------------
ALTER TABLE api.api_keys      ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.audit_log_api ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_api_keys"       ON api.api_keys;
DROP POLICY IF EXISTS "admin_read_audit_log_api"  ON api.audit_log_api;

-- Só admin (via public.has_role) lê a tabela base — service_role bypassa RLS.
CREATE POLICY "admin_read_api_keys"
  ON api.api_keys FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_read_audit_log_api"
  ON api.audit_log_api FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Nenhuma policy INSERT/UPDATE/DELETE pra authenticated → só service_role escreve.

-- ---------- 6. Comentário de doc ------------------------------------
COMMENT ON TABLE api.api_keys IS
  'Chaves API do Gateway CentralDark. hash=sha256 do secret completo (NUNCA armazenar o secret). Admin-only (public.has_role). Modelagem pronta pra multi-cliente via owner_email+scopes.';
COMMENT ON TABLE api.audit_log_api IS
  'Auditoria append-only de TODA request ao gateway. key_prefix=prefix (NUNCA hash/Authorization). error_message_sanitized já vem sem cdk_live_*/sk-*/Bearer.';
COMMENT ON VIEW  api.mcp_summary IS
  'View agregada 7d pra MCP: sem prefix, sem IP, sem request_id. Safe pra retornar em tools MCP.';
