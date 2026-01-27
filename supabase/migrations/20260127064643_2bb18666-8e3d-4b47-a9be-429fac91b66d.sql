-- Tabela de Planos de Assinatura
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  days INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  features TEXT[] DEFAULT '{}',
  max_bots INTEGER DEFAULT 1,
  max_messages_per_day INTEGER DEFAULT 100,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Assinaturas dos Usuários
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  plan_code TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_days INTEGER NOT NULL,
  txid TEXT,
  value DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Pagamentos Pendentes (PIX)
CREATE TABLE public.pending_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  plan_code TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_days INTEGER NOT NULL,
  txid TEXT NOT NULL UNIQUE,
  loc_id TEXT,
  value DECIMAL(10,2) NOT NULL,
  pix_qrcode TEXT,
  pix_copy_paste TEXT,
  status TEXT DEFAULT 'PENDING',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Histórico de Pagamentos
CREATE TABLE public.payment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  txid TEXT,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'pix',
  status TEXT NOT NULL,
  gateway_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Configurações de Gateway de Pagamento
CREATE TABLE public.payment_gateway_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  gateway_type TEXT DEFAULT 'efi',
  is_sandbox BOOLEAN DEFAULT false,
  pix_key TEXT,
  webhook_url TEXT,
  auto_approve BOOLEAN DEFAULT true,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateway_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read, owner write)
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can manage their plans" ON public.subscription_plans
  FOR ALL USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for pending_payments
CREATE POLICY "Users can view own pending payments" ON public.pending_payments
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own pending payments" ON public.pending_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending payments" ON public.pending_payments
  FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own pending payments" ON public.pending_payments
  FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for payment_history
CREATE POLICY "Users can view own payment history" ON public.payment_history
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own payment history" ON public.payment_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payment_gateway_settings
CREATE POLICY "Users can view own gateway settings" ON public.payment_gateway_settings
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage own gateway settings" ON public.payment_gateway_settings
  FOR ALL USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_gateway_settings_updated_at
  BEFORE UPDATE ON public.payment_gateway_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default plans
INSERT INTO public.subscription_plans (code, name, title, description, price, days, is_active, is_popular, features, max_bots, max_messages_per_day)
VALUES 
  ('free', 'Free', 'Plano Gratuito', 'Perfeito para começar', 0, 30, true, false, ARRAY['1 Bot', '100 mensagens/dia', 'Anti-spam básico', 'Suporte por email'], 1, 100),
  ('basic', 'Basic', 'Plano Básico', 'Para usuários casuais', 29.90, 30, true, false, ARRAY['3 Bots', '1.000 mensagens/dia', 'Anti-spam avançado', 'Anti-link', 'Suporte prioritário'], 3, 1000),
  ('pro', 'Pro', 'Plano Pro', 'Para profissionais', 99.90, 30, true, true, ARRAY['10 Bots', 'Mensagens ilimitadas', 'Todas as proteções', 'Gamificação', 'API Access', 'Suporte 24/7'], 10, -1),
  ('enterprise', 'Enterprise', 'Plano Enterprise', 'Solução corporativa', 299.90, 30, true, false, ARRAY['Bots ilimitados', 'White-label', 'Servidor dedicado', 'Consultoria mensal', 'SLA garantido', 'Gerente de conta'], -1, -1);