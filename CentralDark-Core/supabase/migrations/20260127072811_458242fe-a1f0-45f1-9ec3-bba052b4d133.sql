-- Tabela para armazenar aceite dos termos por usuário do Telegram
CREATE TABLE public.telegram_user_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  bot_id UUID REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  accepted BOOLEAN NOT NULL DEFAULT false,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(telegram_user_id, bot_id)
);

-- Enable RLS
ALTER TABLE public.telegram_user_terms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Service role can manage terms"
ON public.telegram_user_terms
FOR ALL
USING (true)
WITH CHECK (true);

-- Tabela para armazenar estados de conversa do admin (broadcast, criação de planos, etc.)
CREATE TABLE public.bot_conversation_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  bot_id UUID REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  state_type TEXT NOT NULL, -- 'broadcast', 'new_plan', 'change_price', etc.
  state_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour'),
  UNIQUE(telegram_user_id, bot_id, state_type)
);

-- Enable RLS
ALTER TABLE public.bot_conversation_states ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Service role can manage conversation states"
ON public.bot_conversation_states
FOR ALL
USING (true)
WITH CHECK (true);

-- Tabela para configurações do bot (grupo, admins, termos, etc.)
CREATE TABLE public.bot_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.telegram_bots(id) ON DELETE CASCADE UNIQUE,
  owner_ids BIGINT[] DEFAULT '{}',
  group_chat_id BIGINT,
  group_url TEXT,
  terms_text TEXT DEFAULT '📄 <b>Termos de Uso</b>

Bem-vindo ao nosso sistema de assinatura!

Ao utilizar este bot, você concorda com:

1. O acesso é liberado automaticamente após confirmação do pagamento
2. As assinaturas têm validade conforme o plano escolhido
3. Não há reembolso após a confirmação do pagamento
4. Você se compromete a utilizar o serviço de forma legal e ética

✅ Ao clicar em "Aceitar", você concorda com todos os termos acima.',
  terms_enabled BOOLEAN DEFAULT true,
  mute_new_members BOOLEAN DEFAULT true,
  announce_payments BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;

-- Policies - Users can manage their own bot settings
CREATE POLICY "Users can view own bot settings"
ON public.bot_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.telegram_bots tb 
    WHERE tb.id = bot_settings.bot_id 
    AND (tb.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Users can insert own bot settings"
ON public.bot_settings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.telegram_bots tb 
    WHERE tb.id = bot_settings.bot_id 
    AND tb.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own bot settings"
ON public.bot_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.telegram_bots tb 
    WHERE tb.id = bot_settings.bot_id 
    AND (tb.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Users can delete own bot settings"
ON public.bot_settings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.telegram_bots tb 
    WHERE tb.id = bot_settings.bot_id 
    AND (tb.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Tabela para assinaturas do Telegram (vincular telegram_user_id ao plano)
CREATE TABLE public.telegram_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  bot_id UUID REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  plan_code TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_days INTEGER NOT NULL,
  value NUMERIC NOT NULL,
  txid TEXT,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telegram_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Service role can manage telegram subscriptions"
ON public.telegram_subscriptions
FOR ALL
USING (true)
WITH CHECK (true);

-- Criar índices para melhorar performance
CREATE INDEX idx_telegram_subscriptions_user ON public.telegram_subscriptions(telegram_user_id, bot_id);
CREATE INDEX idx_telegram_subscriptions_expires ON public.telegram_subscriptions(expires_at);
CREATE INDEX idx_pending_payments_status ON public.pending_payments(status);
CREATE INDEX idx_pending_payments_expires ON public.pending_payments(expires_at);

-- Adicionar telegram_user_id aos pending_payments para tracking
ALTER TABLE public.pending_payments ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT;
ALTER TABLE public.pending_payments ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;
ALTER TABLE public.pending_payments ADD COLUMN IF NOT EXISTS telegram_message_id BIGINT;
ALTER TABLE public.pending_payments ADD COLUMN IF NOT EXISTS bot_id UUID REFERENCES public.telegram_bots(id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_bot_settings_updated_at
BEFORE UPDATE ON public.bot_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_telegram_user_terms_updated_at
BEFORE UPDATE ON public.telegram_user_terms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();