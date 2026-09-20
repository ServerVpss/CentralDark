
-- Tabela singleton de configuração de limpeza automática
CREATE TABLE public.cleanup_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retention_days integer NOT NULL DEFAULT 30,
  enabled boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  last_deleted_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cleanup_settings_retention_valid CHECK (retention_days BETWEEN 1 AND 365)
);

GRANT SELECT, INSERT, UPDATE ON public.cleanup_settings TO authenticated;
GRANT ALL ON public.cleanup_settings TO service_role;

ALTER TABLE public.cleanup_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerenciam cleanup_settings"
  ON public.cleanup_settings
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_cleanup_settings_updated_at
  BEFORE UPDATE ON public.cleanup_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Linha singleton inicial
INSERT INTO public.cleanup_settings (retention_days, enabled) VALUES (30, true);

-- Função que executa a limpeza segundo a configuração
CREATE OR REPLACE FUNCTION public.run_data_cleanup()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days integer;
  v_enabled boolean;
  v_cutoff timestamptz;
  v_total integer := 0;
  v_count integer;
BEGIN
  SELECT retention_days, enabled INTO v_days, v_enabled
  FROM public.cleanup_settings
  ORDER BY created_at ASC
  LIMIT 1;

  IF NOT FOUND OR NOT v_enabled THEN
    RETURN 0;
  END IF;

  v_cutoff := now() - (v_days || ' days')::interval;

  DELETE FROM public.query_history WHERE created_at < v_cutoff;
  GET DIAGNOSTICS v_count = ROW_COUNT; v_total := v_total + v_count;

  DELETE FROM public.telegram_messages WHERE created_at < v_cutoff;
  GET DIAGNOSTICS v_count = ROW_COUNT; v_total := v_total + v_count;

  DELETE FROM public.api_usage_logs WHERE created_at < v_cutoff;
  GET DIAGNOSTICS v_count = ROW_COUNT; v_total := v_total + v_count;

  DELETE FROM public.edge_function_health WHERE checked_at < v_cutoff;
  GET DIAGNOSTICS v_count = ROW_COUNT; v_total := v_total + v_count;

  UPDATE public.cleanup_settings
  SET last_run_at = now(),
      last_deleted_count = v_total;

  RETURN v_total;
END;
$$;

GRANT EXECUTE ON FUNCTION public.run_data_cleanup() TO authenticated;
