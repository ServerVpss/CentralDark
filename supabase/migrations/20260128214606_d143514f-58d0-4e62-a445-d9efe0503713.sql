-- Adicionar campo para efeito visual de mensagens
ALTER TABLE public.bot_settings 
ADD COLUMN IF NOT EXISTS message_effect TEXT DEFAULT 'party';

COMMENT ON COLUMN public.bot_settings.message_effect IS 'Efeito visual do Telegram para mensagens de resultado: fire, like, heart, party, none';