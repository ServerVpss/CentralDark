DROP POLICY IF EXISTS "Service role gerencia telegram_referrals" ON public.telegram_referrals;
CREATE POLICY "Service role gerencia telegram_referrals"
ON public.telegram_referrals
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);