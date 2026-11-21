-- Tabela para armazenar dados de paginação temporária
CREATE TABLE public.paginated_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  message_id BIGINT,
  pages JSONB NOT NULL,
  current_page INTEGER NOT NULL DEFAULT 0,
  total_pages INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 hour')
);

-- Index para buscar por chat_id e message_id
CREATE INDEX idx_paginated_results_lookup ON public.paginated_results(chat_id, message_id);

-- Index para limpeza de expirados
CREATE INDEX idx_paginated_results_expires ON public.paginated_results(expires_at);

-- Função para limpar resultados expirados
CREATE OR REPLACE FUNCTION public.cleanup_paginated_results()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM paginated_results WHERE expires_at < NOW();
  RETURN NEW;
END;
$function$;

-- Trigger para auto-limpeza
CREATE TRIGGER cleanup_paginated_results_trigger
AFTER INSERT ON public.paginated_results
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_paginated_results();

-- RLS (desabilitar pois é acessado via service role)
ALTER TABLE public.paginated_results ENABLE ROW LEVEL SECURITY;

-- Policy para service role
CREATE POLICY "Service role full access" ON public.paginated_results
FOR ALL USING (true) WITH CHECK (true);