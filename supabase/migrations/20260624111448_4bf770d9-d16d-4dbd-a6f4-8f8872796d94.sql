ALTER TABLE public.notifications_log DROP CONSTRAINT IF EXISTS notifications_log_tipo_check;

ALTER TABLE public.notifications_log
  ADD CONSTRAINT notifications_log_tipo_check
  CHECK (tipo = ANY (ARRAY['info','sucesso','aviso','erro','critico','venda','pagamento','sistema']::text[]));