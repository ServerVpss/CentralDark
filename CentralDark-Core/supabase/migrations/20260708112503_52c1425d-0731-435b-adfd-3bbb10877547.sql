
-- bot_query_rate_tracking: só service_role
DROP POLICY IF EXISTS "Service role gerencia rate tracking" ON public.bot_query_rate_tracking;
CREATE POLICY "Service role gerencia rate tracking"
  ON public.bot_query_rate_tracking
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.bot_query_rate_tracking FROM anon, authenticated, public;
GRANT ALL ON public.bot_query_rate_tracking TO service_role;

-- webapp_results: só service_role
DROP POLICY IF EXISTS "Service role gerencia webapp_results" ON public.webapp_results;
CREATE POLICY "Service role gerencia webapp_results"
  ON public.webapp_results
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.webapp_results FROM anon, authenticated, public;
GRANT ALL ON public.webapp_results TO service_role;
