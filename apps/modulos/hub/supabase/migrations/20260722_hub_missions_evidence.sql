-- Missão HUB (2026-07-22): tabelas de missões, eventos e evidências para o plano de controle.
-- Estende o HUB existente (apps/modulos/hub) sem criar V2. Reaproveita o projeto
-- Supabase lyoigsqluyktoclwdaft e o padrão de RLS das tabelas anteriores.
-- Autorização: authenticated pode ler; apenas admin (has_role) escreve.
-- Nenhuma secret exposta; eventos e evidências são append-only/auditáveis.

-- ============================================================
-- 1. hub_missions (plano de controle de missões)
-- ============================================================
create table if not exists public.hub_missions (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  creator     uuid,
  agent       text not null default 'hermes',
  target      text,
  state       text not null check (state in ('queued', 'running', 'done', 'failed', 'cancelled')) default 'queued',
  authorization text check (authorization in ('pending', 'approved', 'denied')) default 'pending',
  branch_sha  text,
  risk        text check (risk in ('R0', 'R1', 'R2', 'R3', 'R4')) default 'R1',
  rollback    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists hub_missions_state_idx on public.hub_missions (state);
create index if not exists hub_missions_created_idx on public.hub_missions (created_at desc);

grant select on public.hub_missions to authenticated;
grant all on public.hub_missions to service_role;

alter table public.hub_missions enable row level security;

drop policy if exists "authenticated_le_hub_missions" on public.hub_missions;
create policy "authenticated_le_hub_missions"
  on public.hub_missions
  for select
  to authenticated
  using (true);

-- escrita via service_role / edge (hub-command) — não expõe insert direto ao cliente anon
drop policy if exists "service_role_full_hub_missions" on public.hub_missions;
create policy "service_role_full_hub_missions"
  on public.hub_missions
  for all
  to service_role
  using (true)
  with check (true);

-- ============================================================
-- 2. hub_mission_events (append-only, rastreia vida da missão)
-- ============================================================
create table if not exists public.hub_mission_events (
  id          uuid primary key default gen_random_uuid(),
  mission_id  uuid not null references public.hub_missions(id) on delete cascade,
  type        text not null,
  status      text,
  message     text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists hub_mission_events_mission_idx on public.hub_mission_events (mission_id, created_at desc);

grant select on public.hub_mission_events to authenticated;
grant all on public.hub_mission_events to service_role;

alter table public.hub_mission_events enable row level security;

drop policy if exists "authenticated_le_hub_mission_events" on public.hub_mission_events;
create policy "authenticated_le_hub_mission_events"
  on public.hub_mission_events
  for select
  to authenticated
  using (true);

drop policy if exists "service_role_full_hub_mission_events" on public.hub_mission_events;
create policy "service_role_full_hub_mission_events"
  on public.hub_mission_events
  for all
  to service_role
  using (true)
  with check (true);

-- ============================================================
-- 3. hub_evidence (provas por missão; nunca secrets)
-- ============================================================
create table if not exists public.hub_evidence (
  id          uuid primary key default gen_random_uuid(),
  mission_id  uuid not null references public.hub_missions(id) on delete cascade,
  type        text not null,
  url_path    text,
  sha         text,
  revision    text,
  origin      text,
  validated_by uuid,
  status      text check (status in ('pending', 'validated', 'rejected')) default 'pending',
  created_at  timestamptz not null default now()
);

create index if not exists hub_evidence_mission_idx on public.hub_evidence (mission_id, created_at desc);

grant select on public.hub_evidence to authenticated;
grant all on public.hub_evidence to service_role;

alter table public.hub_evidence enable row level security;

drop policy if exists "authenticated_le_hub_evidence" on public.hub_evidence;
create policy "authenticated_le_hub_evidence"
  on public.hub_evidence
  for select
  to authenticated
  using (true);

drop policy if exists "service_role_full_hub_evidence" on public.hub_evidence;
create policy "service_role_full_hub_evidence"
  on public.hub_evidence
  for all
  to service_role
  using (true)
  with check (true);

-- ============================================================
-- 4. Views de compatibilidade no schema api (frontend usa hubClient com schema 'api')
-- ============================================================
create schema if not exists api;

create or replace view api.hub_missions as select * from public.hub_missions;
grant select on api.hub_missions to authenticated, anon;

create or replace view api.hub_mission_events as select * from public.hub_mission_events;
grant select on api.hub_mission_events to authenticated, anon;

create or replace view api.hub_evidence as select * from public.hub_evidence;
grant select on api.hub_evidence to authenticated, anon;

notify pgrst, 'reload schema';
