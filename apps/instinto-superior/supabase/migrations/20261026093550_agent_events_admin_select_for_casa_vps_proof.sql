-- CentralDark: reutilizar agent_events como recibo de leitura SSH Casa <-> VPS.
-- Supabase migration 20261026093550 aplicada no projeto CentralDark.
-- Admin deve ser o unico usuario autenticado a enxergar este log.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='agent_events' AND cmd='SELECT'
      AND roles::text LIKE '%authenticated%'
      AND qual ILIKE '%has_role%admin%'
  ) THEN
    RAISE EXCEPTION 'ADMIN_READ_POLICY_NOT_FOUND';
  END IF;
END $$;
GRANT SELECT ON TABLE public.agent_events TO authenticated;
-- Politica admin-only permanece ativa. Sem grant de escrita ou bypass de RLS.