-- Tabela de cache para consultas indexadas
CREATE TABLE public.query_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query_type TEXT NOT NULL,
  query_input TEXT NOT NULL,
  query_hash TEXT NOT NULL,
  cached_result JSONB NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_accessed TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice único para o hash (busca rápida)
CREATE UNIQUE INDEX idx_query_cache_hash ON public.query_cache(query_hash);

-- Índice para limpeza de expirados
CREATE INDEX idx_query_cache_expires ON public.query_cache(expires_at);

-- Índice composto para busca por tipo e input
CREATE INDEX idx_query_cache_type_input ON public.query_cache(query_type, query_input);

-- Enable RLS
ALTER TABLE public.query_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Service role tem acesso total (edge functions usam service role)
CREATE POLICY "Service role full access to query cache"
  ON public.query_cache
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy: Usuários autenticados podem ler cache
CREATE POLICY "Authenticated users can read cache"
  ON public.query_cache
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Função para limpar cache expirado
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM query_cache WHERE expires_at < NOW();
  RETURN NEW;
END;
$$;

-- Trigger para limpar cache expirado a cada nova inserção
CREATE TRIGGER trigger_cleanup_expired_cache
  AFTER INSERT ON public.query_cache
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.cleanup_expired_cache();