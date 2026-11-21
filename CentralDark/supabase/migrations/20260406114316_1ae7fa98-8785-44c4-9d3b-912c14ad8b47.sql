CREATE TABLE public.telegram_message_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  method text NOT NULL,
  payload jsonb NOT NULL,
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 5,
  retry_after timestamp with time zone DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_message_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.telegram_message_queue
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE INDEX idx_queue_status_retry ON public.telegram_message_queue (status, retry_after);
CREATE INDEX idx_queue_created ON public.telegram_message_queue (created_at);