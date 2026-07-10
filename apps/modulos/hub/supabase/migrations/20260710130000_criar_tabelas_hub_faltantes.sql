-- Tabelas faltantes consumidas pelo frontend do HUB (Catálogo)
--
-- HISTÓRICO (10/07/2026): esta migration originalmente tentava criar 6 tabelas
-- (policies, audit_logs, catalog_tools, catalog_sync_runs, oauth_providers, oauth_connections).
-- Investigação direta no banco (lyoigsqluyktoclwdaft) mostrou que 4 dessas já existiam
-- de verdade e maduras, só com nomes/colunas diferentes do que o frontend esperava:
--   - api.policies       -> view de hub.policies (sistema PDP oficial)
--   - api.audit_log      -> view de hub.audit_log (sistema PDP oficial, hash-chain)
--   - public.oauth_providers  -> já existe, 12 provedores reais cadastrados
--   - public.oauth_connections -> já existe, com criptografia de token (access_token_enc)
-- Essas 4 NÃO foram recriadas aqui — o frontend foi ajustado (usePolicies.ts, useAudit.ts,
-- OAuthConnectors.tsx) para consumir o schema real em vez de inventar tabela nova.
--
-- Only 2 tabelas realmente não existiam e foram criadas por esta migration:
--   - public.catalog_tools
--   - public.catalog_sync_runs
-- + views de compatibilidade em api.* (schema usado pelo hubClient do frontend).

-- ============================================================
-- 1. catalog_tools (aba Catálogo — CatalogTab.tsx)
-- ============================================================
create table if not exists public.catalog_tools (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  description        text not null default '',
  category           text not null default 'geral',
  tags               text[] not null default '{}',
  version            text not null default '1.0.0',
  is_deprecated      boolean not null default false,
  health_status      text check (health_status in ('healthy', 'degraded', 'down', 'unknown')) default 'unknown',
  last_health_check  timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create unique index if not exists catalog_tools_name_idx on public.catalog_tools (name);

grant select on public.catalog_tools to authenticated;
grant all on public.catalog_tools to service_role;

alter table public.catalog_tools enable row level security;

drop policy if exists "authenticated_le_catalog_tools" on public.catalog_tools;
create policy "authenticated_le_catalog_tools"
  on public.catalog_tools
  for select
  to authenticated
  using (true);

drop policy if exists "service_role_full_catalog_tools" on public.catalog_tools;
create policy "service_role_full_catalog_tools"
  on public.catalog_tools
  for all
  to service_role
  using (true)
  with check (true);

-- ============================================================
-- 2. catalog_sync_runs (aba Catálogo — histórico de sincronizações)
-- ============================================================
create table if not exists public.catalog_sync_runs (
  id            uuid primary key default gen_random_uuid(),
  status        text not null check (status in ('running', 'completed', 'failed')) default 'running',
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  tools_found   int not null default 0,
  tools_added   int not null default 0,
  tools_updated int not null default 0
);

create index if not exists catalog_sync_runs_started_idx on public.catalog_sync_runs (started_at desc);

grant select on public.catalog_sync_runs to authenticated;
grant all on public.catalog_sync_runs to service_role;

alter table public.catalog_sync_runs enable row level security;

drop policy if exists "authenticated_le_catalog_sync_runs" on public.catalog_sync_runs;
create policy "authenticated_le_catalog_sync_runs"
  on public.catalog_sync_runs
  for select
  to authenticated
  using (true);

drop policy if exists "service_role_full_catalog_sync_runs" on public.catalog_sync_runs;
create policy "service_role_full_catalog_sync_runs"
  on public.catalog_sync_runs
  for all
  to service_role
  using (true)
  with check (true);

-- ============================================================
-- 3. Views de compatibilidade no schema api (frontend usa hubClient com schema 'api')
-- ============================================================
create schema if not exists api;

create or replace view api.catalog_tools as select * from public.catalog_tools;
grant select on api.catalog_tools to authenticated, anon;

create or replace view api.catalog_sync_runs as select * from public.catalog_sync_runs;
grant select on api.catalog_sync_runs to authenticated, anon;

notify pgrst, 'reload schema';
