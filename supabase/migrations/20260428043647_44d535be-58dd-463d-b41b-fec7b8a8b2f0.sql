-- Drop old unique constraint that ignored context
ALTER TABLE public.telegram_subscriptions
  DROP CONSTRAINT IF EXISTS telegram_subscriptions_telegram_user_id_bot_id_key;

-- Add new unique constraint including context
ALTER TABLE public.telegram_subscriptions
  ADD CONSTRAINT telegram_subscriptions_user_bot_context_unique
  UNIQUE (telegram_user_id, bot_id, context);