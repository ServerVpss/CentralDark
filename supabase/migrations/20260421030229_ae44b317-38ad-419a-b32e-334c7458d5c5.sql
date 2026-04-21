
-- Tabela de status de saúde por módulo
CREATE TABLE public.module_health_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key text NOT NULL UNIQUE,
  total_attempts_24h integer NOT NULL DEFAULT 0,
  success_count_24h integer NOT NULL DEFAULT 0,
  notfound_count_24h integer NOT NULL DEFAULT 0,
  error_count_24h integer NOT NULL DEFAULT 0,
  success_rate numeric(5,2) NOT NULL DEFAULT 0,
  health_label text NOT NULL DEFAULT 'no_data',
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_check_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_module_health_module_key ON public.module_health_status(module_key);
CREATE INDEX idx_module_health_label ON public.module_health_status(health_label);

ALTER TABLE public.module_health_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view module health"
  ON public.module_health_status FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage module health"
  ON public.module_health_status FOR ALL
  USING (true) WITH CHECK (true);

-- Trigger updated_at
CREATE TRIGGER update_module_health_updated_at
  BEFORE UPDATE ON public.module_health_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.module_health_status;
ALTER TABLE public.module_health_status REPLICA IDENTITY FULL;

-- RPC atômico: registra uma tentativa (incremento)
CREATE OR REPLACE FUNCTION public.record_module_attempt(
  p_module_key text,
  p_outcome text  -- 'success' | 'notfound' | 'error'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO module_health_status (
    module_key,
    total_attempts_24h,
    success_count_24h,
    notfound_count_24h,
    error_count_24h,
    last_success_at,
    last_failure_at,
    last_check_at
  ) VALUES (
    p_module_key,
    1,
    CASE WHEN p_outcome = 'success' THEN 1 ELSE 0 END,
    CASE WHEN p_outcome = 'notfound' THEN 1 ELSE 0 END,
    CASE WHEN p_outcome = 'error' THEN 1 ELSE 0 END,
    CASE WHEN p_outcome = 'success' THEN now() ELSE NULL END,
    CASE WHEN p_outcome IN ('notfound','error') THEN now() ELSE NULL END,
    now()
  )
  ON CONFLICT (module_key) DO UPDATE SET
    total_attempts_24h = module_health_status.total_attempts_24h + 1,
    success_count_24h = module_health_status.success_count_24h + CASE WHEN p_outcome = 'success' THEN 1 ELSE 0 END,
    notfound_count_24h = module_health_status.notfound_count_24h + CASE WHEN p_outcome = 'notfound' THEN 1 ELSE 0 END,
    error_count_24h = module_health_status.error_count_24h + CASE WHEN p_outcome = 'error' THEN 1 ELSE 0 END,
    last_success_at = CASE WHEN p_outcome = 'success' THEN now() ELSE module_health_status.last_success_at END,
    last_failure_at = CASE WHEN p_outcome IN ('notfound','error') THEN now() ELSE module_health_status.last_failure_at END,
    last_check_at = now(),
    updated_at = now();
END;
$$;

-- RPC: recalcula janela móvel de 24h a partir do query_history
CREATE OR REPLACE FUNCTION public.recalc_module_health()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  v_total int;
  v_success int;
  v_notfound int;
  v_error int;
  v_rate numeric(5,2);
  v_label text;
  v_last_success timestamptz;
  v_last_failure timestamptz;
BEGIN
  FOR r IN SELECT module_key FROM query_modules LOOP
    SELECT
      COUNT(*),
      COUNT(*) FILTER (WHERE status = 'success'),
      COUNT(*) FILTER (WHERE status = 'notfound' OR status = 'not_found'),
      COUNT(*) FILTER (WHERE status NOT IN ('success','notfound','not_found') OR status IS NULL),
      MAX(created_at) FILTER (WHERE status = 'success'),
      MAX(created_at) FILTER (WHERE status <> 'success' OR status IS NULL)
    INTO v_total, v_success, v_notfound, v_error, v_last_success, v_last_failure
    FROM query_history
    WHERE query_type = r.module_key
      AND created_at >= now() - interval '24 hours';

    v_rate := CASE WHEN v_total > 0 THEN ROUND((v_success::numeric / v_total) * 100, 2) ELSE 0 END;

    v_label := CASE
      WHEN v_total < 3 THEN 'no_data'
      WHEN v_success = 0 AND (v_notfound + v_error) >= 3 THEN 'failing'
      WHEN v_rate >= 50 THEN 'healthy'
      WHEN v_rate >= 10 THEN 'degraded'
      ELSE 'failing'
    END;

    INSERT INTO module_health_status (
      module_key, total_attempts_24h, success_count_24h, notfound_count_24h,
      error_count_24h, success_rate, health_label,
      last_success_at, last_failure_at, last_check_at
    ) VALUES (
      r.module_key, v_total, v_success, v_notfound, v_error, v_rate, v_label,
      v_last_success, v_last_failure, now()
    )
    ON CONFLICT (module_key) DO UPDATE SET
      total_attempts_24h = EXCLUDED.total_attempts_24h,
      success_count_24h = EXCLUDED.success_count_24h,
      notfound_count_24h = EXCLUDED.notfound_count_24h,
      error_count_24h = EXCLUDED.error_count_24h,
      success_rate = EXCLUDED.success_rate,
      health_label = EXCLUDED.health_label,
      last_success_at = COALESCE(EXCLUDED.last_success_at, module_health_status.last_success_at),
      last_failure_at = COALESCE(EXCLUDED.last_failure_at, module_health_status.last_failure_at),
      last_check_at = now(),
      updated_at = now();
  END LOOP;
END;
$$;
