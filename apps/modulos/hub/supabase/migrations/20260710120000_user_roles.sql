-- Migration HUB (projeto lyoigsqluyktoclwdaft)
-- Tabela api.user_roles + RLS — corrige bug: useAuth.ts consultava 'user_profiles'
-- (tabela que só existe no projeto do TelePainel, kagejpghnwdfymddwxuf), erro ignorado
-- em .single(), fallback silencioso jogava TODO usuário (inclusive admin) pra 'viewer'.
-- Deploy: SUPABASE_ACCESS_TOKEN=$HUB_SUPABASE_PAT supabase db push \
--          --project-ref lyoigsqluyktoclwdaft --workdir apps/modulos/hub

CREATE TABLE IF NOT EXISTS api.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'operator', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_user_id ON api.user_roles (user_id);

GRANT SELECT ON api.user_roles TO authenticated;
GRANT ALL ON api.user_roles TO service_role;

ALTER TABLE api.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_read" ON api.user_roles;
CREATE POLICY "own_read" ON api.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Escrita apenas via service_role (sem policy pra authenticated = negado por padrão com RLS habilitado).

-- Após aplicar, promover o admin real do Pivete (substituir o UUID do usuário admin):
-- INSERT INTO api.user_roles (user_id, role) VALUES ('<uuid-do-pivete>', 'admin')
--   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
