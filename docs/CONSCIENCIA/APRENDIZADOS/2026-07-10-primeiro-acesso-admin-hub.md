---
title: "Primeiro Acesso Admin Hub"
date: 2026-07-10
tags: ["consciencia", "hub", "supabase", "auth"]
updated: 2026-07-10
---

```txt
┌─────────────────────────────────────────────────────────────┐
│ 🟢 HUB — Logs IA corrigidos + Pivete promovido a admin       │
│ Data: 10/07/2026                                              │
│ Autor: Claude (sessão CLI)                                     │
│ Projeto: lyoigsqluyktoclwdaft (HUB Supabase)                  │
├─────────────────────────────────────────────────────────────┤
│ 1) "Invalid API key" nos Logs IA → anon key hardcoded em      │
│    hub-client.ts estava REVOGADA (rotação de key no projeto). │
│    Trocada pela key válida já usada em hub-public.ts.         │
│ 2) Pivete promovido a admin em api.user_roles (único usuário  │
│    com created_at mais antigo + email bate com userEmail).    │
│ 3) Basta dar F5 no HUB — role é buscada do banco a cada       │
│    mudança de sessão, não fica presa em JWT antigo.           │
└─────────────────────────────────────────────────────────────┘
```

# 🟢 Primeiro acesso admin no HUB — 10/07/2026

## Contexto
Pivete testando o HUB ao vivo (`hub.centralldark.com`) reportou dois problemas na aba Gateway:
1. "Logs IA · ai_requests" com erro `Invalid API key` e 0 registros.
2. Seção de API Keys (`ApiKeysManager.tsx`, com `RoleGuard requiredRole="admin"`) bloqueada com "Acesso Restrito" — esperado, pois ninguém tinha sido inserido em `api.user_roles` como admin ainda.

## Tarefa 1 — causa raiz do "Invalid API key"

**Investigação (tudo via psql direto no banco `lyoigsqluyktoclwdaft`, sem criar migration nova):**
- `\dv api.*` confirmou que a view `api.ai_requests` existe (criada pela migration `20260709_api_ai_requests_view.sql`).
- Grants de tabela (`information_schema.table_privileges`) já estavam corretos: `anon SELECT` e `authenticated SELECT` em `api.ai_requests`.
- RLS em `public.ai_requests` também OK (policy `"leitura autenticada"` para `authenticated`).
- Testado direto contra o REST (`curl .../rest/v1/ai_requests` com `Accept-Profile: api`) usando a anon key hardcoded em `hub-client.ts` → **401 `UNAUTHORIZED_INVALID_API_KEY` vindo do gateway Supabase**, não do PostgREST. Ou seja: erro real de key inválida, não de grants/RLS/schema cache.
- Comparado o JWT hardcoded (`iat: 1762115222`) com outro JWT usado em `hub-public.ts` (`iat: 1780019400`, mesmo projeto/role `anon`, mais recente) e com a `sb_publishable_...` usada em `/root/CentralDark/src/integrations/supabase/hub-client.ts`. Testadas as duas via curl direto no REST → **ambas retornam 200 e dados reais** (4 registros na tabela, incluindo um `model: "smoke-test"`).
- **Causa raiz confirmada:** a anon key antiga em `apps/modulos/hub/src/integrations/supabase/hub-client.ts` foi rotacionada/revogada no projeto Supabase em algum momento após ter sido hardcoded, e ninguém atualizou o fallback do código.

**Correção aplicada:**
- Trocado o fallback de `HUB_KEY` em `apps/modulos/hub/src/integrations/supabase/hub-client.ts` pela key JWT válida (mesma já usada em `hub-public.ts`, testada via curl antes da troca).
- Rodado `NOTIFY pgrst, 'reload schema';` por precaução (não era a causa, mas não custa).
- `npm run build` em `apps/modulos/hub/` rodou limpo, `dist/` atualizado.

## Tarefa 2 — Pivete promovido a admin

- `SELECT id, email, created_at FROM auth.users ORDER BY created_at ASC` retornou 14 usuários.
- O primeiro (mais antigo, `created_at: 2026-01-27`) é `contacobra3467@gmail.com` — bate exatamente com o e-mail conhecido do Pivete.
- Executado:
  ```sql
  INSERT INTO api.user_roles (user_id, role)
  VALUES ('43077305-3aba-4902-b91c-cc17cf2ba137', 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  ```
- Confirmado via join com `auth.users`: `contacobra3467@gmail.com` → `role = admin`.

## Caminho pro Pivete ver a seção de API Keys liberada
`useAuth.ts` busca a role em `hubClient.from('user_roles')` toda vez que a sessão muda (login, refresh de token, `onAuthStateChange`) — **não fica presa em claim de JWT antigo**. Então **basta dar F5 na página do HUB** (não precisa logout/login). Se por algum motivo não atualizar, um logout + login resolve de qualquer forma.

## Regra permanente
Ao trocar/rotacionar uma anon key de qualquer projeto Supabase, **grep em todo o repo** por hardcodes dessa key (`grep -rn "<ref-do-projeto>"`) — existem múltiplos arquivos com fallback hardcoded do mesmo projeto (`hub-client.ts`, `hub-public.ts`, `src/integrations/supabase/hub-client.ts`) e é fácil um ficar desatualizado enquanto os outros são corrigidos.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
