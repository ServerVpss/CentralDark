-- Tabela de resultados acessíveis via Mini App
CREATE TABLE public.webapp_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path_token TEXT NOT NULL UNIQUE,
  secret_token TEXT NOT NULL,
  telegram_user_id BIGINT NOT NULL,
  bot_id UUID,
  query_type TEXT NOT NULL,
  query_input TEXT,
  result_data JSONB NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX idx_webapp_results_path_token ON public.webapp_results(path_token);
CREATE INDEX idx_webapp_results_expires_at ON public.webapp_results(expires_at);
CREATE INDEX idx_webapp_results_telegram_user_id ON public.webapp_results(telegram_user_id);

GRANT SELECT ON public.webapp_results TO anon;
GRANT SELECT ON public.webapp_results TO authenticated;
GRANT ALL ON public.webapp_results TO service_role;

ALTER TABLE public.webapp_results ENABLE ROW LEVEL SECURITY;

-- Leitura controlada pela edge function (que valida o initData do Telegram)
CREATE POLICY "Service role gerencia webapp_results"
ON public.webapp_results
FOR ALL
USING (true)
WITH CHECK (true);

-- Tabela de indicações
CREATE TABLE public.telegram_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_telegram_id BIGINT NOT NULL,
  referred_telegram_id BIGINT NOT NULL,
  bot_id UUID,
  source_payment_id UUID,
  commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  paid_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_payment_id)
);

CREATE INDEX idx_telegram_referrals_referrer ON public.telegram_referrals(referrer_telegram_id);
CREATE INDEX idx_telegram_referrals_referred ON public.telegram_referrals(referred_telegram_id);

GRANT SELECT ON public.telegram_referrals TO authenticated;
GRANT ALL ON public.telegram_referrals TO service_role;

ALTER TABLE public.telegram_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role gerencia telegram_referrals"
ON public.telegram_referrals
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Autenticados podem ver indicacoes"
ON public.telegram_referrals
FOR SELECT
TO authenticated
USING (true);

-- Campos novos em telegram_users
ALTER TABLE public.telegram_users
  ADD COLUMN IF NOT EXISTS referred_by BIGINT,
  ADD COLUMN IF NOT EXISTS referral_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_total_earned NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_telegram_users_referred_by ON public.telegram_users(referred_by);

-- Função de limpeza dos resultados expirados (executa via trigger no insert)
CREATE OR REPLACE FUNCTION public.cleanup_expired_webapp_results()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM webapp_results WHERE expires_at < now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cleanup_webapp_results
AFTER INSERT ON public.webapp_results
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_expired_webapp_results();