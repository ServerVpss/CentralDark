-- ============================================================
-- AUDITORIA RLS — Roda antes de cada deploy
-- Uso: psql -f scripts/audit-rls.sql
-- Saída: linhas só aparecem quando há problema. Silêncio = OK.
-- ============================================================

\echo '🔍 1. Tabelas SEM RLS habilitado (CRÍTICO):'
SELECT schemaname || '.' || tablename AS tabela_sem_rls
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
  AND tablename NOT LIKE 'pg_%';

\echo ''
\echo '🔍 2. Policies abertas (USING true / WITH CHECK true) para roles públicos (CRÍTICO):'
SELECT
  tablename,
  policyname,
  cmd,
  roles::text AS aplica_a,
  COALESCE(qual, '-') AS using_expr,
  COALESCE(with_check, '-') AS check_expr
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual = 'true' OR with_check = 'true')
  AND NOT ('service_role' = ANY (roles))
  AND cmd <> 'SELECT'  -- SELECT USING(true) pode ser leitura pública intencional
ORDER BY tablename, policyname;

\echo ''
\echo '🔍 3. Tabelas COM RLS mas SEM nenhuma policy (acesso negado a tudo, geralmente bug):'
SELECT t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p
  ON p.schemaname = t.schemaname AND p.tablename = t.tablename
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
  AND p.policyname IS NULL;

\echo ''
\echo '🔍 4. Policies marcadas como "service role" mas SEM TO service_role (CRÍTICO):'
SELECT tablename, policyname, roles::text, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname ILIKE '%service%role%'
  AND NOT ('service_role' = ANY (roles))
ORDER BY tablename;

\echo ''
\echo '✅ Auditoria concluída. Se nada apareceu acima, está tudo blindado.'
