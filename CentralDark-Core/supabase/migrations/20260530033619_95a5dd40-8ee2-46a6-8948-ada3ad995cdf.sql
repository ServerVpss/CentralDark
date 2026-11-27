
-- Agenda central de usuários do Telegram
CREATE TABLE IF NOT EXISTS public.telegram_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id bigint NOT NULL,
  bot_id uuid,
  username text,
  first_name text,
  last_name text,
  language_code text,
  is_premium boolean DEFAULT false,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (telegram_user_id, bot_id)
);

CREATE INDEX IF NOT EXISTS idx_telegram_users_username ON public.telegram_users (lower(username));
CREATE INDEX IF NOT EXISTS idx_telegram_users_telegram_user_id ON public.telegram_users (telegram_user_id);

GRANT SELECT ON public.telegram_users TO authenticated;
GRANT ALL ON public.telegram_users TO service_role;

ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view telegram users"
  ON public.telegram_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages telegram users"
  ON public.telegram_users FOR ALL
  USING (true) WITH CHECK (true);

-- Adicionar username também nas tabelas de assinatura e pagamento
ALTER TABLE public.telegram_subscriptions
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS first_name text;

ALTER TABLE public.pending_payments
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS first_name text;

CREATE INDEX IF NOT EXISTS idx_telegram_subscriptions_username ON public.telegram_subscriptions (lower(username));
CREATE INDEX IF NOT EXISTS idx_pending_payments_username ON public.pending_payments (lower(username));
