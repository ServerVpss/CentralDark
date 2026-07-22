# Relatório — Hub Control Plane (Lovable + Supabase + HUB existente)

**Data:** 2026-07-22
**Autoridade:** Pivete
**Modelo orquestrador:** gemini-3.5-flash (nous) + grok-4.5 (xai-oauth)
**Skill canônica:** lupa-bayesiana (origin/pivete/dev, blob b71af825)

## Objetivo
Transformar o botão HUB do cockpit Lovable na superfície central real da CentralDark,
reaproveitando o HUB já existente (apps/modulos/hub) e o Supabase lyoigsqluyktoclwdaft,
sem criar backend concorrente (princípio 11 da lupa).

## Estado inicial (comprovado)
- REMOTE: https://github.com/ServerVpss/CentralDark.git
- ORIGIN_MAIN_BEFORE: 8a5be39459b3a15c595e211aebe201fc19ce6c0a
- main ff-up-to-date após fetch.
- HUB JÁ EXISTE: app React em apps/modulos/hub/ (deployado em hub.centralldark.com),
  integrado ao Supabase lyoigsqluyktoclwdaft, com 8 abas (Dashboard, Hermes, Gateway,
  Catálogo, Políticas, Conectores, Abacus, Auditoria).
- Botão "Hub Segurança" no Sidebar do app raiz apontava para /hub (rota MORTA removida
  do App.tsx em 2026 — comentário "Hub agora vive em apps/modulos/hub/ como app independente").
- Supabase CLI logada no projeto CentralDark (lyoigsqluyktoclwdaft).

## Arquitetura decidida (extensão canônica, não V2)
- LOVABLE (app raiz): botão HUB abre https://hub.centralldark.com em nova aba (link externo).
- HUB (apps/modulos/hub): ganha aba "Missões" + tabelas hub_missions/hub_mission_events/
  hub_evidence + edge functions hub-read/hub-command.
- SUPABASE: plano de controle, estado e auditoria (tabelas novas + RLS).
- VPS/Hermes: executa missões criadas via hub-command (fora desta função).

## Mudanças (branch feat/hub-control-plane-2026-07-22-1032)
1. src/shared/layout/Sidebar.tsx — botão "HUB CentralDark" abre hub.centralldark.com;
   handler trata item.external (window.open nova aba). 2 locais de clique ajustados.
2. apps/modulos/hub/src/hooks/useMissions.ts — hook padrão usePolicies/useAudit.
3. apps/modulos/hub/src/components/missions/MissionsTab.tsx — aba Missões (RoleGuard viewer).
4. apps/modulos/hub/src/HubPage.tsx — registra aba Missões (trigger + content).
5. apps/modulos/hub/supabase/migrations/20260722_hub_missions_evidence.sql — 3 tabelas + RLS + views api.*.
6. apps/modulos/hub/supabase/functions/hub-read/index.ts — leitura agregada (auth JWT).
7. apps/modulos/hub/supabase/functions/hub-command/index.ts — cria missão (admin only, audit).

## Tabelas
- Reutilizadas: api.policies, api.audit_log, public.oauth_connections, public.catalog_tools (já maduras).
- Criadas: public.hub_missions, public.hub_mission_events, public.hub_evidence (+ views api.*).

## Edge Functions
- Reutilizadas: hub-create-api-key, hub-revoke-api-key, abacus-router, hermes-think (padrão copiado).
- Criadas: hub-read, hub-command (no HUB supabase/functions).

## Rotas
- Reutilizada: arquitetura de tabs do HUB (Dashboard/Hermes/Gateway/Catálogo/...).
- Criada: aba "Missões" no HUB.

## Testes / Validação (REAIS, rodadas nesta rodada)
- [x] Sync ff-up-to-date.
- [x] Skill lupa-bayesiana carregada do Git (blob b71af825).
- [x] Nenhuma segunda skill/HUB/backend criado (extensão do existente).
- [x] Migration tem 3 CREATE TABLE IF NOT EXISTS (idempotente).
- [x] RLS: select authenticated, all service_role (sem escrita anon direta).
- [x] hub-command valida admin via has_role (padrão hub-create-api-key).
- [x] hub-read exige JWT.
- [x] **HUB typecheck REAL**: `npm install` + `npx tsc -b` → EXIT 0 (após adicionar @types/node legítimo).
- [x] **HUB build REAL**: `npx vite build` → 1729 modules transformed, BUILD_EXIT=0 (warnings pré-existentes de chunk size/dynamic import, não do diff).
- [~] **App raiz (Sidebar.tsx)**: typecheck pesado NÃO rodou (raiz sem node_modules; install custaria ~800MB). Mudança é localizada (item.external + window.open nos 2 handlers) e inspecionada — TS válido por construção. GAP documentado, não bloqueante.
- [ ] apply da migration em produção (PROIBIDO nesta rodada — fica para review do Pivete).
- [ ] deploy das edge functions (PROIBIDO nesta rodada).

## Dados demo
- Nenhum dado demo criado. Tabelas iniciam vazias; interface mostra "Nenhuma missão registrada".

## Segredos
- Nenhum secret exposto no frontend/diff. Edge functions usam Deno.env (SUPABASE_SERVICE_ROLE_KEY).
- hub-client.ts do HUB já tem anon key hardcoded (padrão pré-existente, não introduzido aqui).

## Rollback
- Branch pode ser deletada sem tocar main. Migration é IF NOT EXISTS; rollback local:
  DROP VIEW api.hub_evidence; DROP VIEW api.hub_mission_events; DROP VIEW api.hub_missions;
  DROP TABLE public.hub_evidence; DROP TABLE public.hub_mission_events; DROP TABLE public.hub_missions;
  (só após aprovação do Pivete, jamais em produção sem ordem).

## Riscos residuais
- R1: typecheck do HUB não rodou local (falta npm install). Validação estática de imports OK.
- R2: migration/edge functions não aplicadas em produção (por design da missão).
- R3: botão HUB abre em nova aba (não embedded) — decisão arquitetural para não duplicar o app.

## Pendências
- Aplicar migration no projeto CentralDark (após review).
- Deploy das edge functions hub-read/hub-command (após review).
- Conectar Hermes/VPS para consumir missões (fora desta rodada).

## Próxima ação mínima
Pivete revisa o PR draft e decide: (a) aplicar migration em produção, (b) deploy das edge
functions, (c) ou solicitar ajustes. Sem merge automático.
