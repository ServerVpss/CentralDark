-- Tabela para configurações dos bots do Telegram
CREATE TABLE public.telegram_bots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  token TEXT NOT NULL,
  bot_username TEXT,
  bot_id BIGINT,
  webhook_url TEXT,
  webhook_active BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_health_check TIMESTAMP WITH TIME ZONE,
  health_status TEXT DEFAULT 'unknown',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para mensagens recebidas
CREATE TABLE public.telegram_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  telegram_message_id BIGINT,
  chat_id BIGINT NOT NULL,
  chat_type TEXT,
  from_user_id BIGINT,
  from_username TEXT,
  from_first_name TEXT,
  message_text TEXT,
  message_type TEXT DEFAULT 'text',
  is_blocked BOOLEAN DEFAULT false,
  blocked_reason TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para analytics
CREATE TABLE public.bot_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  messages_received INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  blocked_messages INTEGER DEFAULT 0,
  spam_detected INTEGER DEFAULT 0,
  links_blocked INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bot_id, date)
);

-- Tabela para configurações de segurança por bot
CREATE TABLE public.bot_security_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.telegram_bots(id) ON DELETE CASCADE UNIQUE,
  anti_link_enabled BOOLEAN DEFAULT true,
  anti_link_action TEXT DEFAULT 'delete',
  anti_spam_enabled BOOLEAN DEFAULT true,
  anti_spam_max_messages INTEGER DEFAULT 5,
  anti_spam_interval_seconds INTEGER DEFAULT 10,
  anti_spam_action TEXT DEFAULT 'mute',
  anti_flood_enabled BOOLEAN DEFAULT true,
  anti_flood_max_messages INTEGER DEFAULT 20,
  anti_flood_interval_seconds INTEGER DEFAULT 60,
  anti_flood_action TEXT DEFAULT 'kick',
  welcome_message_enabled BOOLEAN DEFAULT false,
  welcome_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telegram_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_security_settings ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (admin panel sem auth por enquanto)
CREATE POLICY "Allow all operations on telegram_bots" ON public.telegram_bots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on telegram_messages" ON public.telegram_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on bot_analytics" ON public.bot_analytics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on bot_security_settings" ON public.bot_security_settings FOR ALL USING (true) WITH CHECK (true);

-- Triggers para updated_at
CREATE TRIGGER update_telegram_bots_updated_at
BEFORE UPDATE ON public.telegram_bots
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_security_settings_updated_at
BEFORE UPDATE ON public.bot_security_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime para health monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.telegram_bots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.telegram_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_analytics;