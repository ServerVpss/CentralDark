-- Tabela leve para pulsos do radar CentralDark (Realtime)
-- Derivada do capsula-event.schema.json sem os 27 campos de governança
CREATE TABLE public.radar_pulses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source text NOT NULL,
  status text NOT NULL CHECK (status IN ('PASS','FAIL','UNKNOWN','RUNNING','BLOCKED','AUTH_REQUIRED','ANOMALY')),
  http_code smallint,
  error text,
  false_green boolean DEFAULT false NOT NULL,
  regression boolean DEFAULT false NOT NULL,
  host text NOT NULL,
  measured_at timestamptz DEFAULT now() NOT NULL,
  ttl_seconds int DEFAULT 120 NOT NULL
);

CREATE INDEX idx_radar_pulses_source_time ON public.radar_pulses (source, measured_at DESC);
CREATE INDEX idx_radar_pulses_measured_at ON public.radar_pulses (measured_at);

ALTER TABLE public.radar_pulses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read radar pulses"
  ON public.radar_pulses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role can insert radar pulses"
  ON public.radar_pulses FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can delete old radar pulses"
  ON public.radar_pulses FOR DELETE TO service_role USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.radar_pulses;

COMMENT ON TABLE public.radar_pulses IS 'Pulsos leves do radar CentralDark. Consumido via Supabase Realtime no Cockpit.';
