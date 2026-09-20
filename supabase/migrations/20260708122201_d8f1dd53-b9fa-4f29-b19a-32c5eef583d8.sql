
-- processed_updates: só service_role
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='processed_updates'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.processed_updates', p.policyname); END LOOP;
END $$;
REVOKE ALL ON public.processed_updates FROM anon, authenticated, public;
GRANT ALL ON public.processed_updates TO service_role;
ALTER TABLE public.processed_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON public.processed_updates
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- telegram_message_queue: só service_role
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='telegram_message_queue'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.telegram_message_queue', p.policyname); END LOOP;
END $$;
REVOKE ALL ON public.telegram_message_queue FROM anon, authenticated, public;
GRANT ALL ON public.telegram_message_queue TO service_role;
ALTER TABLE public.telegram_message_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON public.telegram_message_queue
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);
