
-- Anti-rajada: cooldown entre consultas + limite por minuto + mute automático
ALTER TABLE public.bot_security_settings
  ADD COLUMN IF NOT EXISTS query_rate_limit_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS query_cooldown_seconds integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS query_max_per_minute integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS query_mute_minutes integer NOT NULL DEFAULT 5;

-- Tabela de rastreio por usuário/bot (anti-rajada de consultas)
CREATE TABLE IF NOT EXISTS public.bot_query_rate_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id uuid NOT NULL,
  telegram_user_id bigint NOT NULL,
  last_query_at timestamptz NOT NULL DEFAULT now(),
  window_start timestamptz NOT NULL DEFAULT now(),
  count_in_window integer NOT NULL DEFAULT 0,
  muted_until timestamptz,
  total_violations integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bot_id, telegram_user_id)
);

GRANT SELECT ON public.bot_query_rate_tracking TO authenticated;
GRANT ALL ON public.bot_query_rate_tracking TO service_role;

ALTER TABLE public.bot_query_rate_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role gerencia rate tracking"
  ON public.bot_query_rate_tracking
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Dono do bot pode ver rastreio"
  ON public.bot_query_rate_tracking
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.telegram_bots tb
    WHERE tb.id = bot_query_rate_tracking.bot_id
      AND (tb.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  ));

CREATE INDEX IF NOT EXISTS idx_rate_tracking_bot_user
  ON public.bot_query_rate_tracking (bot_id, telegram_user_id);

CREATE INDEX IF NOT EXISTS idx_rate_tracking_muted_until
  ON public.bot_query_rate_tracking (muted_until) WHERE muted_until IS NOT NULL;
