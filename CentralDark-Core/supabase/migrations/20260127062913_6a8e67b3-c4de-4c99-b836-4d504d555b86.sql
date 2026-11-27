-- Fix RLS policies for bot_analytics (link to user)
ALTER TABLE public.bot_analytics ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Allow all operations on bot_analytics" ON public.bot_analytics;

CREATE POLICY "Users can view own analytics"
ON public.bot_analytics FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own analytics"
ON public.bot_analytics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
ON public.bot_analytics FOR UPDATE
USING (auth.uid() = user_id);

-- Fix RLS policies for bot_security_settings (link to user)
ALTER TABLE public.bot_security_settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Allow all operations on bot_security_settings" ON public.bot_security_settings;

CREATE POLICY "Users can view own security settings"
ON public.bot_security_settings FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own security settings"
ON public.bot_security_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own security settings"
ON public.bot_security_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own security settings"
ON public.bot_security_settings FOR DELETE
USING (auth.uid() = user_id);

-- Fix RLS policies for telegram_messages (link to user)
ALTER TABLE public.telegram_messages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Allow all operations on telegram_messages" ON public.telegram_messages;

CREATE POLICY "Users can view own messages"
ON public.telegram_messages FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own messages"
ON public.telegram_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
ON public.telegram_messages FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
ON public.telegram_messages FOR DELETE
USING (auth.uid() = user_id);