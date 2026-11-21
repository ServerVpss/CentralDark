
CREATE TABLE public.notifications_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  origem text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('info','sucesso','aviso','erro','critico')),
  titulo text NOT NULL,
  mensagem text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  telegram_message_id bigint,
  telegram_chat_id bigint,
  sent_ok boolean NOT NULL DEFAULT false,
  send_error text,
  dedupe_hash text
);

CREATE INDEX idx_notifications_log_created_at ON public.notifications_log (created_at DESC);
CREATE INDEX idx_notifications_log_origem ON public.notifications_log (origem);
CREATE INDEX idx_notifications_log_tipo ON public.notifications_log (tipo);
CREATE INDEX idx_notifications_log_dedupe ON public.notifications_log (dedupe_hash, created_at DESC);

GRANT SELECT ON public.notifications_log TO authenticated;
GRANT ALL ON public.notifications_log TO service_role;

ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins leem notifications_log"
  ON public.notifications_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
