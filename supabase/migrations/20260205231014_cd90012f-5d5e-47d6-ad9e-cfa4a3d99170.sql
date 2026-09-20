-- Tabela para armazenar histórico de health checks das Edge Functions
CREATE TABLE public.edge_function_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_functions INTEGER NOT NULL,
  online_count INTEGER NOT NULL,
  offline_count INTEGER NOT NULL,
  error_count INTEGER NOT NULL,
  all_healthy BOOLEAN NOT NULL DEFAULT false,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index para consultas por data
CREATE INDEX idx_edge_function_health_checked_at ON public.edge_function_health(checked_at DESC);

-- RLS - permitir leitura para usuários autenticados
ALTER TABLE public.edge_function_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view health checks"
ON public.edge_function_health
FOR SELECT
TO authenticated
USING (true);

-- Limpar registros antigos (manter últimos 7 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_health_checks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM edge_function_health WHERE checked_at < NOW() - INTERVAL '7 days';
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_health_checks_trigger
AFTER INSERT ON public.edge_function_health
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_old_health_checks();