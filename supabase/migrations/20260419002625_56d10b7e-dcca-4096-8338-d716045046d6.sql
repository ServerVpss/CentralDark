-- Habilitar extensões necessárias para cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Função que limpa pagamentos pendentes antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_pending_payments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Deleta pix_transactions pendentes com mais de 24h
  DELETE FROM public.pix_transactions
  WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '24 hours';

  -- Deleta pending_payments com mais de 24h (PENDING ou já expirados)
  DELETE FROM public.pending_payments
  WHERE created_at < NOW() - INTERVAL '24 hours'
    AND (status = 'PENDING' OR status IS NULL OR expires_at < NOW() - INTERVAL '24 hours');
END;
$$;

-- Remover job anterior se existir (idempotência)
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-old-pending-payments');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Agendar execução a cada hora
SELECT cron.schedule(
  'cleanup-old-pending-payments',
  '0 * * * *',
  $$ SELECT public.cleanup_old_pending_payments(); $$
);