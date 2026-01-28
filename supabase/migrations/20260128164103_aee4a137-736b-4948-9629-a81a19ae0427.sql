-- Adicionar constraint única para telegram_user_id + bot_id
ALTER TABLE public.telegram_subscriptions 
DROP CONSTRAINT IF EXISTS telegram_subscriptions_telegram_user_id_bot_id_key;

ALTER TABLE public.telegram_subscriptions 
ADD CONSTRAINT telegram_subscriptions_telegram_user_id_bot_id_key 
UNIQUE (telegram_user_id, bot_id);