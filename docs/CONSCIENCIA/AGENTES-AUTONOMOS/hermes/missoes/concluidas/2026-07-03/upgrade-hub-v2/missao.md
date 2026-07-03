---
title: "Missao"
date: 2026-07-03
tags: ["consciencia"]
updated: 2026-07-03
---

# MISSAO: Upgrade do CentralDark HUB v2

Alvo: /root/CentralDark/apps/modulos/hub/
Prioridade: ALTA
Notificacao: cada etapa concluida no privado admin (1901426549)

## Regra de ouro
- SEMPRE upgrade antes de rewrite. Se arquivo ja existe: le primeiro, faz diff minimo.
- NUNCA duplica endpoints ou componentes.
- NUNCA toca em: apps/bot-telegram/, apps/modulos/status/, apps/modulos/Bolt/, apps/modulos/WebUI/, infra/caddy/, secrets/, .env
- PROIBIDO usar comandos destrutivos do gerenciador de processos (aqueles que apagam/matam/reiniciam tudo em massa). So reload individual.
- Valida cada .ts/.tsx com `node --check` (ou tsc --noEmit) antes de commitar.
- Commit + push a cada etapa concluida.

## Etapa 1 - Auditoria (SO LEITURA)
Varre /root/CentralDark/apps/modulos/hub/ e devolve relatorio do que ja existe:
- Estrutura de pastas atual
- Arquivos .tsx/.ts em components/, hooks/, services/
- Se existem: CatalogTab.tsx, TelegramMTProtoCard.tsx, HubPage.tsx
- Se tabelas Supabase HUB ja tem: catalog_*, policies, audit_logs, access_logs
- Se ja tem WebSocket configurado
- Se ja tem auth/roles

## Etapa 2 - Estrutura de pastas (so cria se faltar)
apps/modulos/hub/src/{components/{dashboard,catalog,policies,audit,connectors,telegram,shared},hooks,services,types}

## Etapa 3 - Componentes P0 (critico)
Dashboard+Health: DashboardTab, HealthCard, AlertBanner, StatusTimeline
Catalog upgrade: CatalogTab (add indicador saude), ToolCard, SyncButton
Policies (novo): PoliciesTab, PolicyEditor (so admin), RuleBadge

## Etapa 4 - Componentes P1
Audit: AuditTab, DecisionRow, AuditExport (CSV)
Connectors: ConnectorsTab, GatewayCard
Telegram upgrade: TelegramMTProtoCard (add status + reconectar)
Shared: RoleGuard

## Etapa 5 - Hooks
useMCP (2min cache), usePolicies (5min), useAudit (paginacao), useHealth (WebSocket), useAuth

## Etapa 6 - Services
mcp-client (REST+WS), telegram-client (upgrade), supabase (upgrade se existir), api-client

## Etapa 7 - Types
mcp.ts, policies.ts, audit.ts, auth.ts

## Etapa 8 - Migrations HUB Supabase
Executar via `psql "$HUB_SUPABASE_DB_URL"` (NAO usar Supabase do Lovable atual - trava ativa).

Cria se nao existir:
- policies (id uuid pk, name, description, rule_type CHECK IN allow/block/require_veto, target_tool_id, target_server_id, enabled bool, created_by, created_at, updated_at)
- audit_logs IMUTAVEL (id uuid pk, event_type, agent, action, target, result CHECK approved/vetoed/pending/error, veto_reason, metadata jsonb, immutable bool default true, superseded_by uuid refs audit_logs, created_at)
- access_logs (id uuid pk, user_id, user_role, action, ip, user_agent, created_at)

## Criterio de sucesso
- Todos arquivos passam node --check / tsc --noEmit
- Git push OK a cada etapa
- Migrations HUB aplicadas (ou puladas com "ja existia")
- Relatorio final no Telegram: criados/atualizados/pulados/erros/tempo total
