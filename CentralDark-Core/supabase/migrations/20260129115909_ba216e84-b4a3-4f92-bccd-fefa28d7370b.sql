-- Adicionar coluna last_sent_at para rastrear envio individual de cada mensagem
ALTER TABLE public.engagement_messages 
ADD COLUMN IF NOT EXISTS last_sent_at timestamp with time zone DEFAULT NULL;

COMMENT ON COLUMN public.engagement_messages.last_sent_at IS 'Timestamp do último envio desta mensagem específica';