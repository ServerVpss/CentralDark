
-- ============ HUB 001: FOUNDATION ============
create schema if not exists hub;

create table if not exists hub.connectors (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  icon_url    text,
  category    text,
  status      text not null default 'disabled' check (status in ('enabled','disabled','new')),
  kind        text not null default 'app' check (kind in ('app','mcp','chat')),
  sort_order  int  not null default 100,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists hub.theme_tokens (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

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

create table if not exists hub.approvals (
  id             uuid primary key default gen_random_uuid(),
  agent_identity text not null,
  tool           text not null,
  args_hash      text not null,
  resource       text,
  environment    text not null,
  nonce          text unique not null,
  request_hash   text not null,
  status         text not null default 'pending' check (status in ('pending','approved','rejected','expired','consumed')),
  requested_at   timestamptz not null default now(),
  expires_at     timestamptz not null,
  decided_at     timestamptz,
  decided_by     uuid
);

create table if not exists hub.audit_log (
  id             bigint generated always as identity primary key,
  ts             timestamptz not null default now(),
  agent_identity text,
  tool           text,
  args_hash      text,
  decision       text,
  tier           int,
  approval_id    uuid,
  prev_hash      text,
  row_hash       text not null
);

do $$ begin
  if not exists (select from pg_roles where rolname = 'mcp_agent') then
    create role mcp_agent nologin;
  end if;
end $$;

grant usage on schema hub to mcp_agent, anon, authenticated, service_role;

grant select on hub.connectors   to mcp_agent, anon, authenticated;
grant select on hub.theme_tokens to mcp_agent, anon, authenticated;
grant select on hub.policies     to mcp_agent, authenticated;
grant select, insert, update on hub.approvals to authenticated;
grant insert on hub.approvals to mcp_agent;
grant insert on hub.audit_log to mcp_agent, authenticated;
grant select on hub.audit_log to authenticated;
grant all on all tables in schema hub to service_role;
grant all on all sequences in schema hub to service_role;

revoke update, delete on hub.audit_log from public;

alter table hub.connectors   enable row level security;
alter table hub.theme_tokens enable row level security;
alter table hub.policies     enable row level security;
alter table hub.approvals    enable row level security;
alter table hub.audit_log    enable row level security;

drop policy if exists connectors_read on hub.connectors;
create policy connectors_read on hub.connectors for select using (true);

drop policy if exists theme_read on hub.theme_tokens;
create policy theme_read on hub.theme_tokens for select using (true);

drop policy if exists policies_read on hub.policies;
create policy policies_read on hub.policies for select using (auth.role() = 'authenticated');

drop policy if exists approvals_read on hub.approvals;
create policy approvals_read on hub.approvals for select using (auth.role() = 'authenticated');

drop policy if exists approvals_insert on hub.approvals;
create policy approvals_insert on hub.approvals for insert with check (true);

drop policy if exists approvals_decide on hub.approvals;
create policy approvals_decide on hub.approvals
  for update using (auth.role() = 'authenticated')
  with check (status in ('approved','rejected'));

drop policy if exists audit_read on hub.audit_log;
create policy audit_read on hub.audit_log for select using (auth.role() = 'authenticated');

drop policy if exists audit_insert on hub.audit_log;
create policy audit_insert on hub.audit_log for insert with check (true);

insert into hub.policies (tool, environment, tier, needs_approval, enabled) values
  ('*read*',   '*', 1, false, true),
  ('*write*',  '*', 2, true,  true),
  ('*delete*', '*', 4, true,  false)
on conflict (tool, environment) do nothing;

insert into hub.connectors (slug, name, description, category, status, kind, sort_order) values
  ('centraldark','CentralDark','As 70 tools do teu MCP','Infra','enabled','mcp',10),
  ('telegram','Telegram','Bot API e notificações','Messaging','enabled','app',20),
  ('notion','Notion','Páginas e bancos','Productivity','enabled','mcp',30),
  ('linear','Linear','Issues e projetos','Productivity','enabled','mcp',40),
  ('supabase','Supabase','Banco do projeto','Infra','enabled','app',50)
on conflict (slug) do nothing;

insert into hub.theme_tokens (key, value) values
  ('brand.name','CentralDark'),
  ('logo.url',''),
  ('color.bg','hsl(0,0%,4%)'),
  ('color.surface','hsl(0,0%,6%)'),
  ('color.primary','hsl(152,76%,50%)'),
  ('color.text','hsl(0,0%,92%)'),
  ('font.sans','Geist, system-ui, sans-serif'),
  ('font.mono','Geist Mono, ui-monospace, monospace')
on conflict (key) do nothing;

-- ============ HUB 002: PDP/PEP ============
create extension if not exists pgcrypto;

create or replace function hub.pdp_evaluate(
  p_tool text, p_environment text default '*', p_identity text default null
) returns jsonb language plpgsql security definer set search_path = hub, public as $$
declare v_pol hub.policies%rowtype;
begin
  select * into v_pol from hub.policies
  where enabled = true
    and (environment = p_environment or environment = '*')
    and p_tool like replace(replace(replace(tool,'*','%'),'?','_'),'.','\.')
  order by (environment = p_environment) desc, (position('*' in tool) = 0) desc, length(tool) desc, created_at asc
  limit 1;
  if not found then
    return jsonb_build_object('decision','deny','tier',4,'reason','no_matching_policy','policy_id',null,'matched_tool',null);
  end if;
  if v_pol.tier = 4 then
    return jsonb_build_object('decision','deny','tier',4,'reason','tier4_disabled','policy_id',v_pol.id,'matched_tool',v_pol.tool);
  end if;
  if v_pol.needs_approval then
    return jsonb_build_object('decision','require_approval','tier',v_pol.tier,'reason','policy_needs_approval','policy_id',v_pol.id,'matched_tool',v_pol.tool);
  end if;
  return jsonb_build_object('decision','allow','tier',v_pol.tier,'reason','policy_match','policy_id',v_pol.id,'matched_tool',v_pol.tool);
end; $$;
grant execute on function hub.pdp_evaluate to mcp_agent, authenticated;

create table if not exists hub.capabilities (
  id           uuid primary key default gen_random_uuid(),
  nonce        text unique not null,
  request_hash text not null,
  tool         text not null,
  environment  text not null default '*',
  tier         int  not null check (tier between 0 and 3),
  issued_at    timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '5 minutes',
  consumed_at  timestamptz,
  approval_id  uuid references hub.approvals(id)
);
grant select on hub.capabilities to mcp_agent, authenticated;
grant all on hub.capabilities to service_role;
alter table hub.capabilities enable row level security;
drop policy if exists capabilities_read on hub.capabilities;
create policy capabilities_read on hub.capabilities for select using (true);

create or replace function hub.audit_hash_chain() returns trigger language plpgsql as $$
declare v_prev text; v_data text;
begin
  select row_hash into v_prev from hub.audit_log order by id desc limit 1;
  new.prev_hash := coalesce(v_prev, '0000000000000000000000000000000000000000000000000000000000000000');
  v_data := concat_ws('|', new.ts::text, coalesce(new.agent_identity,''), coalesce(new.tool,''),
    coalesce(new.args_hash,''), coalesce(new.decision,''), coalesce(new.tier::text,''), new.prev_hash);
  begin new.row_hash := encode(digest(v_data,'sha256'),'hex');
  exception when undefined_function then new.row_hash := md5(v_data); end;
  return new;
end; $$;

drop trigger if exists audit_chain on hub.audit_log;
create trigger audit_chain before insert on hub.audit_log
  for each row execute function hub.audit_hash_chain();

create or replace function hub.audit_verify_chain(p_limit int default 200)
returns table(id bigint, ts timestamptz, tool text, decision text, tier int, row_hash text, prev_hash text, chain_ok boolean)
language sql security definer stable set search_path = hub, public as $$
  with ordered as (
    select a.id, a.ts, a.tool, a.decision, a.tier, a.row_hash, a.prev_hash,
      lag(a.row_hash) over (order by a.id) as expected_prev
    from hub.audit_log a order by a.id desc limit p_limit
  )
  select o.id, o.ts, o.tool, o.decision, o.tier, o.row_hash, o.prev_hash,
    (o.prev_hash = coalesce(o.expected_prev,'0000000000000000000000000000000000000000000000000000000000000000')) as chain_ok
  from ordered o;
$$;
grant execute on function hub.audit_verify_chain to mcp_agent, authenticated;

create or replace function hub.compute_request_hash(
  p_identity text, p_tool text, p_args_hash text, p_resource text,
  p_environment text, p_nonce text, p_issued_at timestamptz, p_expires_at timestamptz
) returns text language plpgsql immutable security definer set search_path = hub, public as $$
declare v_data text;
begin
  v_data := concat_ws('|', coalesce(p_identity,''), coalesce(p_tool,''), coalesce(p_args_hash,''),
    coalesce(p_resource,''), coalesce(p_environment,''), coalesce(p_nonce,''),
    p_issued_at::text, p_expires_at::text);
  begin return encode(digest(v_data,'sha256'),'hex');
  exception when undefined_function then return md5(v_data); end;
end; $$;
grant execute on function hub.compute_request_hash to mcp_agent, authenticated;

-- ============ HUB 003: APPROVAL SERVICE ============
create or replace function hub.approval_request(
  p_agent_identity text, p_tool text, p_args_hash text,
  p_resource text default null, p_environment text default '*', p_ttl_minutes int default 15
) returns jsonb language plpgsql security definer set search_path = hub, public as $$
declare
  v_nonce text; v_issued_at timestamptz := now();
  v_expires_at timestamptz := now() + (p_ttl_minutes || ' minutes')::interval;
  v_req_hash text; v_id uuid;
begin
  v_nonce := encode(gen_random_bytes(32),'hex');
  v_req_hash := hub.compute_request_hash(p_agent_identity, p_tool, p_args_hash, p_resource, p_environment, v_nonce, v_issued_at, v_expires_at);
  insert into hub.approvals (agent_identity, tool, args_hash, resource, environment, nonce, request_hash, status, requested_at, expires_at)
  values (p_agent_identity, p_tool, p_args_hash, p_resource, p_environment, v_nonce, v_req_hash, 'pending', v_issued_at, v_expires_at)
  returning id into v_id;
  return jsonb_build_object('approval_id', v_id, 'nonce', v_nonce, 'request_hash', v_req_hash, 'expires_at', v_expires_at);
end; $$;
grant execute on function hub.approval_request to mcp_agent, authenticated;

create or replace function hub.approval_decide(p_approval_id uuid, p_verdict text)
returns jsonb language plpgsql security definer set search_path = hub, public as $$
declare v_ap hub.approvals%rowtype;
begin
  if auth.role() != 'authenticated' then return jsonb_build_object('error','unauthorized'); end if;
  if p_verdict not in ('approved','rejected') then return jsonb_build_object('error','invalid_verdict'); end if;
  select * into v_ap from hub.approvals where id = p_approval_id;
  if not found then return jsonb_build_object('error','not_found'); end if;
  if v_ap.status != 'pending' then return jsonb_build_object('error','already_decided','status',v_ap.status); end if;
  if v_ap.expires_at < now() then
    update hub.approvals set status='expired' where id = p_approval_id;
    return jsonb_build_object('error','expired');
  end if;
  update hub.approvals set status=p_verdict, decided_at=now(), decided_by=auth.uid() where id = p_approval_id;
  insert into hub.audit_log (agent_identity, tool, args_hash, decision, tier, approval_id, row_hash)
  values ('human:'||auth.uid()::text, v_ap.tool, v_ap.args_hash,
    case p_verdict when 'approved' then 'allow' else 'deny' end, 2, p_approval_id, '');
  return jsonb_build_object('ok',true,'verdict',p_verdict,'approval_id',p_approval_id);
end; $$;
grant execute on function hub.approval_decide to authenticated;

create or replace function hub.approval_consume(p_approval_id uuid, p_nonce text, p_request_hash text)
returns jsonb language plpgsql security definer set search_path = hub, public as $$
declare v_ap hub.approvals%rowtype; v_cap_id uuid; v_cap_nonce text;
begin
  select * into v_ap from hub.approvals where id = p_approval_id;
  if not found then return jsonb_build_object('error','not_found'); end if;
  if v_ap.status != 'approved' then return jsonb_build_object('error','not_approved','status',v_ap.status); end if;
  if v_ap.nonce != p_nonce then return jsonb_build_object('error','nonce_mismatch'); end if;
  if v_ap.request_hash != p_request_hash then return jsonb_build_object('error','hash_mismatch'); end if;
  if v_ap.expires_at < now() then
    update hub.approvals set status='expired' where id = p_approval_id;
    return jsonb_build_object('error','expired');
  end if;
  update hub.approvals set status='consumed' where id = p_approval_id;
  v_cap_nonce := encode(gen_random_bytes(32),'hex');
  insert into hub.capabilities (nonce, request_hash, tool, environment, tier, expires_at, approval_id)
  values (v_cap_nonce, p_request_hash, v_ap.tool, v_ap.environment, 2, now()+interval '5 minutes', p_approval_id)
  returning id into v_cap_id;
  return jsonb_build_object('ok',true,'capability_id',v_cap_id,'cap_nonce',v_cap_nonce,'expires_at', now()+interval '5 minutes');
end; $$;

create or replace function hub.expire_approvals() returns int language plpgsql security definer set search_path = hub, public as $$
declare v_count int;
begin
  update hub.approvals set status='expired' where status='pending' and expires_at < now();
  get diagnostics v_count = row_count;
  return v_count;
end; $$;
grant execute on function hub.expire_approvals to authenticated, service_role;
