-- Migration HUB (projeto lyoigsqluyktoclwdaft)
-- Tabela api.button_log_events + RLS + TTL 30 dias.
-- Deploy: SUPABASE_ACCESS_TOKEN=$HUB_SUPABASE_PAT supabase db push \
--          --project-ref lyoigsqluyktoclwdaft --workdir apps/modulos/hub

CREATE TABLE IF NOT EXISTS api.button_log_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text,
  ts timestamptz NOT NULL DEFAULT now(),
  action text NOT NULL,
  level text NOT NULL CHECK (level IN ('info','ok','warn','error')),
  status int,
  latency_ms int,
  correlation_id text,
  error text,
  detail jsonb,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ble_user_ts       ON api.button_log_events (user_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_ble_correlation   ON api.button_log_events (correlation_id);
CREATE INDEX IF NOT EXISTS idx_ble_action_ts     ON api.button_log_events (action, ts DESC);
CREATE INDEX IF NOT EXISTS idx_ble_ts_cleanup    ON api.button_log_events (ts);

GRANT SELECT, INSERT ON api.button_log_events TO authenticated;
GRANT ALL ON api.button_log_events TO service_role;

ALTER TABLE api.button_log_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_read"   ON api.button_log_events;
DROP POLICY IF EXISTS "own_insert" ON api.button_log_events;
CREATE POLICY "own_read"   ON api.button_log_events FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own_insert" ON api.button_log_events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION api.button_log_events_cleanup()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = api, public AS $$
DECLARE v_count integer;
BEGIN
  DELETE FROM api.button_log_events WHERE ts < now() - interval '30 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END; $$;

CREATE OR REPLACE FUNCTION api.button_log_events_cleanup_trg()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = api, public AS $$
BEGIN
  IF random() < 0.01 THEN PERFORM api.button_log_events_cleanup(); END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_button_log_events_cleanup ON api.button_log_events;
CREATE TRIGGER trg_button_log_events_cleanup
AFTER INSERT ON api.button_log_events
FOR EACH ROW EXECUTE FUNCTION api.button_log_events_cleanup_trg();

-- pg_cron (opcional):
--   SELECT cron.schedule('button-log-cleanup-30d','0 3 * * *',
--     $$SELECT api.button_log_events_cleanup();$$);
