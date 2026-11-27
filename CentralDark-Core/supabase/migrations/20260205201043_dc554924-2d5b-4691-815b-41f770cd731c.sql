-- Add UPDATE policy for bot_security_settings
CREATE POLICY "Users can update their own security settings"
ON public.bot_security_settings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Also add INSERT policy if missing (for upsert to work)
CREATE POLICY "Users can insert their own security settings"
ON public.bot_security_settings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());