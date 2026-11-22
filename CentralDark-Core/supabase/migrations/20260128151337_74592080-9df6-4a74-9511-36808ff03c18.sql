-- Tabela de transações PIX
CREATE TABLE IF NOT EXISTS public.pix_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  telegram_user_id BIGINT,
  bot_id UUID REFERENCES public.telegram_bots(id),
  amount NUMERIC(10,2) NOT NULL,
  gateway TEXT NOT NULL DEFAULT 'efi',
  external_id TEXT,
  loc_id TEXT,
  qr_code_text TEXT,
  qr_code_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'cancelled')),
  description TEXT,
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  e2e_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pix_transactions_gateway_status ON pix_transactions(gateway, status);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_external_id ON pix_transactions(external_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_user_id ON pix_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_telegram_user_id ON pix_transactions(telegram_user_id);

-- Tabela de configuração de gateways de pagamento
CREATE TABLE IF NOT EXISTS public.payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  gateway_type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  proxy_url TEXT,
  min_deposit NUMERIC DEFAULT 10,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_gateways_user_type ON payment_gateways(user_id, gateway_type);

-- Habilitar RLS
ALTER TABLE public.pix_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pix_transactions
CREATE POLICY "Users can view own pix transactions" ON public.pix_transactions
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own pix transactions" ON public.pix_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pix transactions" ON public.pix_transactions
  FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role full access to pix transactions" ON public.pix_transactions
  FOR ALL USING (true) WITH CHECK (true);

-- Políticas RLS para payment_gateways
CREATE POLICY "Users can manage own gateways" ON public.payment_gateways
  FOR ALL USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pix_transactions_updated_at
  BEFORE UPDATE ON public.pix_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_gateways_updated_at
  BEFORE UPDATE ON public.payment_gateways
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();