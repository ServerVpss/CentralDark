
-- =========================================================
-- 1) query_modules: escrita só admin
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can delete modules" ON public.query_modules;
DROP POLICY IF EXISTS "Authenticated users can insert modules" ON public.query_modules;
DROP POLICY IF EXISTS "Authenticated users can update modules" ON public.query_modules;

CREATE POLICY "Admins gerenciam query_modules"
  ON public.query_modules
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =========================================================
-- 2) telegram_referrals: leitura restrita ao dono do bot
-- =========================================================
DROP POLICY IF EXISTS "Autenticados podem ver indicacoes" ON public.telegram_referrals;

CREATE POLICY "Donos veem indicacoes dos proprios bots"
  ON public.telegram_referrals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.telegram_bots tb
      WHERE tb.id = telegram_referrals.bot_id
        AND (tb.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

-- =========================================================
-- 3) telegram_users: leitura restrita ao dono do bot
-- =========================================================
DROP POLICY IF EXISTS "Authenticated can view telegram users" ON public.telegram_users;

CREATE POLICY "Donos veem telegram_users dos proprios bots"
  ON public.telegram_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.telegram_bots tb
      WHERE tb.id = telegram_users.bot_id
        AND (tb.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

-- =========================================================
-- 4) telegram_user_terms: tirar policy ALL aberta
--    Service role bypassa RLS naturalmente; precisamos só
--    de leitura para admin (backup) — escrita é via bot (service role).
-- =========================================================
DROP POLICY IF EXISTS "Service role can manage terms" ON public.telegram_user_terms;

CREATE POLICY "Admins leem telegram_user_terms"
  ON public.telegram_user_terms
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =========================================================
-- 5) bot_conversation_states: mesmo padrão
-- =========================================================
DROP POLICY IF EXISTS "Service role can manage conversation states" ON public.bot_conversation_states;

CREATE POLICY "Admins leem bot_conversation_states"
  ON public.bot_conversation_states
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =========================================================
-- 6) api_providers: exige login
-- =========================================================
DROP POLICY IF EXISTS "Anyone can view active providers" ON public.api_providers;

REVOKE SELECT ON public.api_providers FROM anon;

CREATE POLICY "Autenticados veem provedores ativos"
  ON public.api_providers
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- =========================================================
-- 7) Fix do run_data_cleanup: UPDATE precisa de WHERE
-- =========================================================
CREATE OR REPLACE FUNCTION public.run_data_cleanup()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_days integer;
  v_enabled boolean;
  v_cutoff timestamptz;
  v_total integer := 0;
  v_count integer;
BEGIN
  SELECT id, retention_days, enabled
  INTO v_id, v_days, v_enabled
  FROM public.cleanup_settings
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_id IS NULL OR NOT v_enabled THEN
    RETURN 0;
  END IF;

  v_cutoff := now() - (v_days || ' days')::interval;

  DELETE FROM public.query_history        WHERE created_at < v_cutoff;
  GET DIAGNOSTICS v_count = ROW_COUNT; v_total := v_total + v_count;

  DELETE FROM public.telegram_messages    WHERE created_at < v_cutoff;
  GET DIAGNOSTICS v_count = ROW_COUNT; v_total := v_total + v_count;

  DELETE FROM public.api_usage_logs       WHERE created_at < v_cutoff;
  GET DIAGNOSTICS v_count = ROW_COUNT; v_total := v_total + v_count;

  DELETE FROM public.edge_function_health WHERE checked_at < v_cutoff;
  GET DIAGNOSTICS v_count = ROW_COUNT; v_total := v_total + v_count;

  UPDATE public.cleanup_settings
  SET last_run_at = now(),
      last_deleted_count = v_total
  WHERE id = v_id;

  RETURN v_total;
END;
$$;
