-- Create unique constraint on bot_analytics for atomic upsert operations
ALTER TABLE public.bot_analytics
ADD CONSTRAINT bot_analytics_bot_id_date_unique UNIQUE (bot_id, date);

-- Create function to atomically increment bot analytics counters
CREATE OR REPLACE FUNCTION public.increment_bot_analytics(
  p_bot_id UUID,
  p_messages_received INT DEFAULT 0,
  p_messages_sent INT DEFAULT 0,
  p_new_users INT DEFAULT 0,
  p_active_users INT DEFAULT 0,
  p_blocked_messages INT DEFAULT 0,
  p_spam_detected INT DEFAULT 0,
  p_links_blocked INT DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO bot_analytics (
    bot_id, 
    date, 
    messages_received, 
    messages_sent, 
    new_users, 
    active_users,
    blocked_messages, 
    spam_detected, 
    links_blocked
  )
  VALUES (
    p_bot_id, 
    CURRENT_DATE,
    p_messages_received, 
    p_messages_sent, 
    p_new_users, 
    p_active_users,
    p_blocked_messages, 
    p_spam_detected, 
    p_links_blocked
  )
  ON CONFLICT (bot_id, date) DO UPDATE SET
    messages_received = bot_analytics.messages_received + EXCLUDED.messages_received,
    messages_sent = bot_analytics.messages_sent + EXCLUDED.messages_sent,
    new_users = bot_analytics.new_users + EXCLUDED.new_users,
    active_users = bot_analytics.active_users + EXCLUDED.active_users,
    blocked_messages = bot_analytics.blocked_messages + EXCLUDED.blocked_messages,
    spam_detected = bot_analytics.spam_detected + EXCLUDED.spam_detected,
    links_blocked = bot_analytics.links_blocked + EXCLUDED.links_blocked;
END;
$$;

-- Grant execute permission to service role and authenticated users
GRANT EXECUTE ON FUNCTION public.increment_bot_analytics TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_bot_analytics TO authenticated;