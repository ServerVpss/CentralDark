-- Restaura os grants de public.vault_secrets definidos na migration 20260626053014
-- e remove TRUNCATE de anon, authenticated e service_role.
--
-- Motivo: no banco vivo, service_role não tinha SELECT/INSERT/UPDATE/DELETE e a
-- função vault não conseguia ler nem gravar. anon, authenticated e service_role
-- tinham TRUNCATE, que não é filtrado por RLS e apagaria a tabela inteira.
--
-- Não altera políticas de RLS, dados, funções nem a Edge Function vault.
-- Idempotente: GRANT e REVOKE podem ser reexecutados sem erro.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vault_secrets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vault_secrets TO service_role;

REVOKE TRUNCATE ON public.vault_secrets FROM anon, authenticated, service_role;
