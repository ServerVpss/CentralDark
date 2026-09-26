# COMANDO - 001_hub_foundation.sql
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\hub\db\migrations\001_hub_foundation.sql
**SHA:** b9e95c533a5181fb
**Timestamp:** 2026-08-28T02:56:27.163762
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- -- 3. POLICIES — fonte de decisão do PDP. Sem regra = DENY.
- -- A IA SÓ lê o que monta a UI e consulta regra:

### Ouro Bruto (primeiros 5000 chars)
```
-- =====================================================================
-- CentralDark Hub — 001_foundation.sql
-- Destino no repo: apps/hub/db/migrations/001_hub_foundation.sql
-- Rodar em: Supabase > SQL Editor (ou via migration)
--
-- Sustenta:
--   (a) tema + conectores vindos do banco  -> editar SEM build
--   (b) camada de segurança: policies, approvals, audit append-only
--
-- Princípios travados: Default-Deny, Fail-Closed, Tier 4 desativado,
-- a IA nunca aprova a si mesma, audit imutável.
-- =====================================================================

create schema if not exists hub;

-- ---------------------------------------------------------------------
-- 1. CONNECTORS  — alimenta o grid do hub (editar = sem build)
-- ---------------------------------------------------------------------
create table if not exists hub.connectors (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  icon_url    text,
  category    text,
  status      text not null default 'disabled'
              check (status in ('enabled','disabled','new')),
  kind        text not null default 'app'
              check (kind in ('app','mcp','chat')),
  sort_order  int  not null default 100,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. THEME_TOKENS — cores, logo, marca (editar = sem build)
--    key-value: ('color.accent','#7C5CFF'), ('logo.url','https://...')
-- ---------------------------------------------------------------------
create table if not exists hub.theme_tokens (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. POLICIES — fonte de decisão do PDP. Sem regra = DENY.
-- ---------------------------------------------------------------------
create table if not exists hub.policies (
  id             uuid primary key default gen_random_uuid(),
  tool           text not null,
  environment    text not null default '*',
  tier           int  not null check (tier between 0 and 4),
  needs_approval boolean not null default true,
  enabled        boolean not null default true,
  created_at     timestamptz not null default now(),
  unique (tool, environment)
);

-- ---------------------------------------------------------------------
-- 4. APPROVALS — registro de aprovação (NUNCA arquivo). Uso único.
--    request_hash = H(identity, tool, args, resource, env, nonce, exp)
-- ---------------------------------------------------------------------
create table if not exists hub.approvals (
  id             uuid primary key default gen_random_uuid(),
  agent_identity text not null,
  tool           text not null,
  args_hash      text not null,
  resource       text,
  environment    text not null,
  nonce          text unique not null,
  request_hash   text not null,
  status         text not null default 'pending'
                 check (status in ('pending','approved','rejected','expired','consumed')),
  requested_at   timestamptz not null default now(),
  expires_at     timestamptz not null,
  decided_at     timestamptz,
  decided_by     uuid
);

-- ---------------------------------------------------------------------
-- 5. AUDIT_LOG — append-only, encadeado por hash. Sem UPDATE/DELETE.
-- ---------------------------------------------------------------------
create table if not exists hub.audit_log (
  id             bigint generated always as identity primary key,
  ts             timestamptz not null default now(),
  agent_identity text,
  tool           text,
  args_hash      text,
  decision       text,        -- allow | deny | require_approval
  tier           int,
  approval_id    uuid,
  prev_hash      text,
  row_hash       text not null
);

-- =====================================================================
-- SEGURANÇA — role restrito pro MCP/IA  (NÃO usar service_role no MCP!)
-- =====================================================================
do $$ begin
  if not exists (select from pg_roles where rolname = 'mcp_agent') then
    create role mcp_agent nologin;
  end if;
end $$;

grant usage on schema hub to mcp_agent;

-- A IA SÓ lê o que monta a UI e consulta regra:
grant select on hub.connectors   to mcp_agent;
grant select on hub.theme_tokens to mcp_agent;
grant select on hub.policies     to mcp_agent;

-- A IA pode criar PEDIDO e LOG — nada além disso:
grant insert on hub.approvals to mcp_agent;
grant insert on hub.audit_log to mcp_agent;

-- Ninguém faz update/delete em audit_log (nem admin via API):
revoke update, delete on hub.audit_log from public;

-- =====================================================================
-- RLS
-- =====================================================================
alter table hub.connectors 
```