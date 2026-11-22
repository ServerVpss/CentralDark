---
name: audit-rls
description: Checagem rápida de RLS, policies abertas e edge functions sem autenticação. Rode antes de cada deploy/publish para garantir que nenhum furo de acesso voltou.
---

# Auditoria RLS Pré-Deploy

Objetivo: garantir que nenhuma policy aberta, tabela sem RLS ou edge function sem auth tenha voltado ao código antes de subir pra produção.

## Quando usar
- **Sempre antes de publish/deploy.**
- Após qualquer migration que mexa em policies.
- Após criar nova edge function.
- Quando o usuário pedir "auditar segurança" ou similar.

## Passo 1 — Checar banco (SQL)

Rode o script `scripts/audit-rls.sql` via `supabase--read_query` quebrando em 4 queries:

```sql
-- (1) Tabelas SEM RLS
SELECT tablename FROM pg_tables
WHERE schemaname='public' AND rowsecurity=false AND tablename NOT LIKE 'pg_%';

-- (2) Policies abertas para roles não-service_role (UPDATE/INSERT/DELETE)
SELECT tablename, policyname, cmd, roles::text, qual, with_check
FROM pg_policies
WHERE schemaname='public'
  AND (qual='true' OR with_check='true')
  AND NOT ('service_role' = ANY(roles))
  AND cmd <> 'SELECT'
ORDER BY tablename;

-- (3) Tabelas com RLS mas sem policies (acesso totalmente negado, normalmente bug)
SELECT t.tablename FROM pg_tables t
LEFT JOIN pg_policies p ON p.schemaname=t.schemaname AND p.tablename=t.tablename
WHERE t.schemaname='public' AND t.rowsecurity=true AND p.policyname IS NULL;

-- (4) Policies "service role" sem TO service_role (falso senso de segurança)
SELECT tablename, policyname, roles::text, cmd FROM pg_policies
WHERE schemaname='public' AND policyname ILIKE '%service%role%'
  AND NOT ('service_role' = ANY(roles));
```

## Passo 2 — Checar edge functions

Rode no terminal:

```bash
for f in supabase/functions/*/index.ts; do
  name=$(basename $(dirname "$f"))
  # pula webhooks legítimos (validam assinatura própria)
  case "$name" in *-webhook|*webhook*) continue;; esac
  # procura sinal de auth: getClaims, getUser, ou comparação com SERVICE_ROLE_KEY
  if ! grep -qE 'getClaims|getUser\(|SUPABASE_SERVICE_ROLE_KEY|verifyTelegramInitData' "$f"; then
    echo "⚠️ SEM AUTH: $name"
  fi
done
```

Se aparecer função listada, exigir confirmação antes de deploy.

## Passo 3 — Linter Supabase

Chamar `supabase--linter` e separar avisos reais (RLS desabilitado, policy permissiva, sem CHECK) de ruído esperado (`USING(true) TO service_role`, extensões em public).

## Saída esperada

Reportar em PT-BR curto:
- ✅ Tudo limpo → liberar publish.
- 🔴 Achados → listar arquivo/tabela + 1 frase do problema + 1 frase do fix. Bloquear publish até corrigir ou usuário confirmar override explicitamente.

## Regras
- NÃO modificar nada nessa skill — só auditar e reportar.
- Webhooks externos (`efi-webhook`, `misticpay-webhook`) e a rota pública `/result/:token` (valida HMAC do Telegram) são exceções aceitas.
- `USING(true)` em policy `SELECT` para tabelas intencionalmente públicas (ex: `query_modules` view) é OK.
