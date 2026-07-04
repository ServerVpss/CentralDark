-- ============================================================
-- Schema do HUB (projeto lyoigsqluyktoclwdaft) — tabelas do broker
-- Rodar UMA VEZ via SQL editor do Supabase HUB
-- ============================================================

create extension if not exists pgcrypto;

-- Tabela única que guarda tanto API keys (kind='api_key') quanto tokens OAuth (kind='oauth')
create table if not exists public.oauth_connections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  provider text not null,
  kind text not null check (kind in ('api_key', 'oauth')),
  encrypted_token text not null,
  encrypted_refresh text,
  expires_at timestamptz,
  raw_scope text,
  status text not null default 'connected',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create index if not exists idx_oauth_connections_user on public.oauth_connections(user_id);

-- GRANTs (service_role acessa via broker; ninguém mais precisa)
grant all on public.oauth_connections to service_role;

alter table public.oauth_connections enable row level security;

-- Nenhuma policy pra anon/authenticated: só o broker (service_role) escreve/lê.
-- Se um dia o frontend precisar listar as próprias conexões direto, criar policy então.

-- Catálogo de providers disponíveis (usado pelo frontend pra montar a lista de conectores)
create table if not exists public.oauth_providers (
  slug text primary key,
  display_name text not null,
  category text not null,           -- 'ai' | 'storage' | 'code' | 'docs' | ...
  kind text not null,               -- 'api_key' | 'oauth'
  tier text,                        -- 'T1' | 'T2' | 'T3'
  logo_url text,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

grant select on public.oauth_providers to anon, authenticated;
grant all on public.oauth_providers to service_role;
alter table public.oauth_providers enable row level security;
create policy "providers públicos leitura" on public.oauth_providers for select using (enabled = true);

-- Seed inicial
insert into public.oauth_providers(slug, display_name, category, kind, tier) values
  ('grok',   'Grok (xAI)',    'ai',      'api_key', 'T1'),
  ('claude', 'Claude',        'ai',      'api_key', 'T1'),
  ('openai', 'OpenAI',        'ai',      'api_key', 'T1'),
  ('gemini', 'Gemini',        'ai',      'api_key', 'T1'),
  ('github', 'GitHub',        'code',    'oauth',   'T2'),
  ('notion', 'Notion',        'docs',    'oauth',   'T2'),
  ('gdrive', 'Google Drive',  'storage', 'oauth',   'T2')
on conflict (slug) do nothing;
