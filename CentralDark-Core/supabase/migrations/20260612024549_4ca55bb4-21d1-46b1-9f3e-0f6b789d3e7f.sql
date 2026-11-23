-- Restringe policy ALL USING(true) em telegram_users para apenas service_role
DROP POLICY IF EXISTS "Service role manages telegram users" ON public.telegram_users;
CREATE POLICY "Service role manages telegram users"
ON public.telegram_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);