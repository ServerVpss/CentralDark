-- 1) Índice composto para telegram_messages (is_blocked + created_at desc)
CREATE INDEX IF NOT EXISTS idx_telegram_messages_blocked_created
  ON public.telegram_messages (is_blocked, created_at DESC);

-- 2) Índice composto para pix_transactions (gateway + status + created_at desc)
CREATE INDEX IF NOT EXISTS idx_pix_transactions_gateway_status_created
  ON public.pix_transactions (gateway, status, created_at DESC);

-- 3) Índice parcial para bot_settings (fake_engagement ativo)
CREATE INDEX IF NOT EXISTS idx_bot_settings_fake_engagement_active
  ON public.bot_settings (bot_id)
  WHERE fake_engagement_enabled = true AND group_chat_id IS NOT NULL;

-- 4) Função de retenção agressiva pra edge_function_health (24h)
CREATE OR REPLACE FUNCTION public.cleanup_edge_function_health()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM public.edge_function_health
  WHERE checked_at < now() - interval '24 hours';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;