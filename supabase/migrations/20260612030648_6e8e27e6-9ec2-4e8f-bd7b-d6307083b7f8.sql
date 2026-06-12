
-- 1) pix_transactions
DROP POLICY IF EXISTS "Service role full access to pix transactions" ON public.pix_transactions;
CREATE POLICY "Service role full access to pix transactions"
  ON public.pix_transactions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own pix transactions" ON public.pix_transactions;
CREATE POLICY "Users can delete own pix transactions"
  ON public.pix_transactions FOR DELETE
  TO authenticated
  USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- 2) telegram_subscriptions: ownership via bot
DROP POLICY IF EXISTS "Service role can manage telegram subscriptions" ON public.telegram_subscriptions;
CREATE POLICY "Service role can manage telegram subscriptions"
  ON public.telegram_subscriptions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Bot owners and admins view subscriptions"
  ON public.telegram_subscriptions FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.telegram_bots b
      WHERE b.id = telegram_subscriptions.bot_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage telegram subscriptions"
  ON public.telegram_subscriptions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3) audit_logs INSERT só service_role
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;
CREATE POLICY "Service role can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO service_role
  WITH CHECK (true);
