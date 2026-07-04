-- =========================================================================
-- 004 — OAuth Connectors (HUB Supabase lyoigsqluyktoclwdaft)
-- Tabelas pra grid de conexões OAuth do HUB v2 (aba Conectores).
-- Front lê via schema "api" (views); origem em "hub".
-- =========================================================================

create schema if not exists hub;
create schema if not exists api;

-- ------------------ providers (catálogo) ---------------------------------
create table if not exists hub.oauth_providers (
  id            text primary key,
  display_name  text not null,
  color         text not null default '#000000',
  icon          text not null default 'plug',
  scopes        text not null default '',
  enabled       boolean not null default true,
  sort_order    int not null default 100,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table hub.oauth_providers enable row level security;
drop policy if exists oauth_providers_read on hub.oauth_providers;
create policy oauth_providers_read on hub.oauth_providers for select using (true);

-- ------------------ connections (por usuário) ----------------------------
create table if not exists hub.oauth_connections (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null,
  provider_id    text not null references hub.oauth_providers(id) on delete cascade,
  account_label  text,
  access_token   text,
  refresh_token  text,
  scopes         text,
  status         text not null default 'active',
  expires_at     timestamptz not null default now() + interval '30 days',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id, provider_id)
);

alter table hub.oauth_connections enable row level security;
drop policy if exists oauth_conn_owner_all on hub.oauth_connections;
create policy oauth_conn_owner_all on hub.oauth_connections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------ grants -----------------------------------------------
grant usage on schema hub to anon, authenticated, service_role;
grant select on hub.oauth_providers to anon, authenticated;
grant select, insert, update, delete on hub.oauth_connections to authenticated;
grant all on hub.oauth_providers, hub.oauth_connections to service_role;

-- ------------------ views no schema "api" (front usa esse) ---------------
create or replace view api.oauth_providers as
  select id, display_name, color, icon, scopes, enabled, sort_order
  from hub.oauth_providers;

create or replace view api.oauth_connections as
  select id, user_id, provider_id, account_label, scopes, status, expires_at, created_at, updated_at
  from hub.oauth_connections;

grant usage on schema api to anon, authenticated, service_role;
grant select on api.oauth_providers to anon, authenticated;
grant select, insert, update, delete on api.oauth_connections to authenticated;

-- ------------------ seed inicial -----------------------------------------
insert into hub.oauth_providers (id, display_name, color, icon, scopes, sort_order) values
  ('grok',   'Grok / X',     '#000000', 'grok',   'chat.read chat.write',       10),
  ('notion', 'Notion',       '#000000', 'notion', 'read.content update.content',20),
  ('gdrive', 'Google Drive', '#1a73e8', 'drive',  'drive.file drive.readonly',  30),
  ('github', 'GitHub',       '#24292f', 'github', 'repo read:user',             40)
on conflict (id) do update set
  display_name = excluded.display_name,
  color        = excluded.color,
  icon         = excluded.icon,
  scopes       = excluded.scopes,
  sort_order   = excluded.sort_order,
  updated_at   = now();
