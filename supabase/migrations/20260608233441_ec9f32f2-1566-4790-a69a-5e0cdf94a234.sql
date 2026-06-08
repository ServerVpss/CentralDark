ALTER TABLE public.pix_transactions
  ADD COLUMN IF NOT EXISTS raw_webhook_events jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS dispute_status text,
  ADD COLUMN IF NOT EXISTS dispute_details jsonb;

CREATE INDEX IF NOT EXISTS idx_pix_transactions_dispute_status
  ON public.pix_transactions (dispute_status)
  WHERE dispute_status IS NOT NULL;