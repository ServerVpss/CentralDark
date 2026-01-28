-- Tabela para mensagens personalizadas de engajamento
CREATE TABLE public.engagement_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.engagement_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view their own messages"
ON public.engagement_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages"
ON public.engagement_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
ON public.engagement_messages
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON public.engagement_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_engagement_messages_updated_at
BEFORE UPDATE ON public.engagement_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir algumas mensagens padrão (serão copiadas quando um bot for configurado)
COMMENT ON TABLE public.engagement_messages IS 'Mensagens personalizadas de engajamento fake para bots';