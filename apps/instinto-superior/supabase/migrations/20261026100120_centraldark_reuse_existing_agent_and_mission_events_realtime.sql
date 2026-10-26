-- Supabase migration 20261026100120 aplicada no projeto CentralDark.
-- Extende publication existente sem alterar tabelas ou politicas.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='agent_events') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_events;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='hub_mission_events') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.hub_mission_events;
  END IF;
END $$;