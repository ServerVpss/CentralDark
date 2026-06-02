-- Adiciona coluna pra guardar versão formatada pela IA (cache de 24h junto com o resultado original)
ALTER TABLE public.webapp_results
  ADD COLUMN IF NOT EXISTS formatted_data jsonb;