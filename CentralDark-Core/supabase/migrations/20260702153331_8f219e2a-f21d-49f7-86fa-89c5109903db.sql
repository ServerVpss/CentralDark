
CREATE TABLE public.agent_events (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  agent TEXT NOT NULL,
  area TEXT NOT NULL,
  acao TEXT NOT NULL,
  alvo TEXT,
  status TEXT NOT NULL DEFAULT 'info',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_agent_events_ts ON public.agent_events (ts DESC);
CREATE INDEX idx_agent_events_agent ON public.agent_events (agent);
CREATE INDEX idx_agent_events_area ON public.agent_events (area);

GRANT SELECT ON public.agent_events TO authenticated;
GRANT ALL ON public.agent_events TO service_role;

ALTER TABLE public.agent_events ENABLE ROW LEVEL SECURITY;

-- Só admins veem o feed
CREATE POLICY "Admins podem ler agent_events"
ON public.agent_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_events;
ALTER TABLE public.agent_events REPLICA IDENTITY FULL;
