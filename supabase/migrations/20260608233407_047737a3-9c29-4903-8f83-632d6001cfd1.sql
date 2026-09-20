ALTER TABLE public.pix_transactions
  ADD COLUMN IF NOT EXISTS payer_name text,
  ADD COLUMN IF NOT EXISTS payer_document text,
  ADD COLUMN IF NOT EXISTS payer_info jsonb,
  ADD COLUMN IF NOT EXISTS gateway_fee numeric,
  ADD COLUMN IF NOT EXISTS raw_create_response jsonb,
  ADD COLUMN IF NOT EXISTS raw_webhook jsonb;

CREATE INDEX IF NOT EXISTS idx_pix_transactions_payer_document
  ON public.pix_transactions (payer_document)
  WHERE payer_document IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pix_transactions_raw_webhook_gin
  ON public.pix_transactions USING gin (raw_webhook)
  WHERE raw_webhook IS NOT NULL;