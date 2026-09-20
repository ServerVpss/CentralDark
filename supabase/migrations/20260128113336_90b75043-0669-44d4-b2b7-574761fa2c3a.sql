-- 1. Remover tabela duplicada user_subscriptions
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;

-- 2. Habilitar realtime para tabelas principais (ignorando as que já existem)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.telegram_subscriptions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_plans;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.query_history;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_payments;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_telegram_subscriptions_expires_at ON public.telegram_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_telegram_subscriptions_bot_id ON public.telegram_subscriptions(bot_id);
CREATE INDEX IF NOT EXISTS idx_telegram_subscriptions_status ON public.telegram_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_query_history_created_at ON public.query_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON public.pending_payments(status);