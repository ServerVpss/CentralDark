
CREATE TABLE public.graph_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'vps',
  backend TEXT,
  model TEXT,
  graph_json JSONB NOT NULL,
  report_md TEXT,
  audit_md TEXT,
  stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  nodes_count INTEGER NOT NULL DEFAULT 0,
  edges_count INTEGER NOT NULL DEFAULT 0,
  communities_count INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'success'
);

GRANT SELECT ON public.graph_runs TO authenticated;
GRANT ALL ON public.graph_runs TO service_role;

ALTER TABLE public.graph_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver runs do grafo"
ON public.graph_runs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role gerencia runs do grafo"
ON public.graph_runs FOR ALL
TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_graph_runs_created_at ON public.graph_runs(created_at DESC);

CREATE TRIGGER update_graph_runs_updated_at
BEFORE UPDATE ON public.graph_runs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
