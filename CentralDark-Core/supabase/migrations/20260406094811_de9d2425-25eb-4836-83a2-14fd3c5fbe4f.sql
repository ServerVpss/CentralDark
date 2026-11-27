
-- Add context column to telegram_subscriptions
ALTER TABLE public.telegram_subscriptions
ADD COLUMN IF NOT EXISTS context text NOT NULL DEFAULT 'group';

-- Add context column to pending_payments
ALTER TABLE public.pending_payments
ADD COLUMN IF NOT EXISTS context text NOT NULL DEFAULT 'group';

-- Index for fast lookups by user + context
CREATE INDEX IF NOT EXISTS idx_telegram_subscriptions_user_context
ON public.telegram_subscriptions (telegram_user_id, context, expires_at DESC);
