-- Migration: expõe public.ai_requests como view api.ai_requests
-- Idempotente. Sem DROP destrutivo. Sem apagar dados.
-- Aliases de coluna casam com o hook useAiRequests do frontend.

CREATE SCHEMA IF NOT EXISTS api;

CREATE OR REPLACE VIEW api.ai_requests AS
SELECT
  id,
  model,
  status,
  latency_ms,
  input_tokens        AS tokens_in,
  output_tokens       AS tokens_out,
  (status = 'fallback') AS fallback_used,
  error_code          AS error,
  created_at
FROM public.ai_requests;

GRANT USAGE  ON SCHEMA api                TO anon, authenticated;
GRANT SELECT ON api.ai_requests           TO anon, authenticated;

-- reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
