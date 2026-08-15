-- CentralDark private security foundation.
-- REPO-ONLY until this migration is applied and measured in the HUB Supabase runtime.
-- No raw secret value columns; secret inventory is status-only.
-- No direct anon/authenticated access to the private schema.

create schema if not exists centraldark_private;
revoke all on schema centraldark_private from public, anon, authenticated;

create table if not exists centraldark_private.security_control (
  control_id text primary key,
  surface text not null,
  name text not null,
  status text not null check (status in ('PASS','WARN','FAIL','UNKNOWN','UNPROVEN')),
  summary text not null,
  observed_at timestamptz null,
  evidence_ref text null,
  updated_at timestamptz not null default now()
);

create table if not exists centraldark_private.security_incident (
  id uuid primary key default gen_random_uuid(),
  opened_at timestamptz not null default now(),
  closed_at timestamptz null,
  severity text not null check (severity in ('LOW','MEDIUM','HIGH','CRITICAL')),
  status text not null check (status in ('OPEN','CONTAINED','RECOVERING','CLOSED')),
  title text not null,
  summary_redacted text not null,
  containment_redacted text null,
  evidence_refs text[] not null default '{}',
  owner text null
);

create table if not exists centraldark_private.session_revocation (
  session_fingerprint text primary key,
  principal_fingerprint text null,
  revoked_at timestamptz not null default now(),
  expires_at timestamptz null,
  reason_code text not null,
  evidence_ref text null
);

create table if not exists centraldark_private.asset_posture (
  asset_id text primary key,
  asset_type text not null,
  status text not null check (status in ('PASS','WARN','FAIL','UNKNOWN','UNPROVEN')),
  summary_redacted text not null,
  last_seen_at timestamptz null,
  evidence_ref text null,
  updated_at timestamptz not null default now()
);

create table if not exists centraldark_private.backup_restore_evidence (
  id uuid primary key default gen_random_uuid(),
  asset_id text not null,
  backup_ref text not null,
  backup_observed_at timestamptz not null,
  restore_tested_at timestamptz null,
  restore_status text not null check (restore_status in ('PASS','FAIL','UNKNOWN','NOT_TESTED')),
  evidence_ref text null
);

create table if not exists centraldark_private.secret_status (
  secret_name text primary key,
  consumer text not null,
  status text not null check (status in ('CONFIGURED','MISSING','INVALID','UNVERIFIED','EXPIRED','ROTATION_RECOMMENDED','NOT_APPLICABLE')),
  checked_at timestamptz null,
  evidence_ref text null
);

alter table centraldark_private.security_control enable row level security;
alter table centraldark_private.security_incident enable row level security;
alter table centraldark_private.session_revocation enable row level security;
alter table centraldark_private.asset_posture enable row level security;
alter table centraldark_private.backup_restore_evidence enable row level security;
alter table centraldark_private.secret_status enable row level security;

revoke all on all tables in schema centraldark_private from public, anon, authenticated;
revoke all on all sequences in schema centraldark_private from public, anon, authenticated;
alter default privileges in schema centraldark_private revoke all on tables from public, anon, authenticated;
alter default privileges in schema centraldark_private revoke all on sequences from public, anon, authenticated;

create index if not exists private_security_control_status_idx
  on centraldark_private.security_control(status, surface, updated_at desc);
create index if not exists private_security_incident_status_idx
  on centraldark_private.security_incident(status, severity, opened_at desc);
create index if not exists private_session_revocation_exp_idx
  on centraldark_private.session_revocation(expires_at)
  where expires_at is not null;
create index if not exists private_asset_posture_status_idx
  on centraldark_private.asset_posture(status, asset_type, updated_at desc);

-- Seed only honest UNKNOWN/UNPROVEN state. Measurements may later update these rows.
insert into centraldark_private.security_control
  (control_id, surface, name, status, summary, evidence_ref)
values
  ('house-windows', 'CASA', 'Casa / Windows', 'UNPROVEN', 'Configuração física ainda não medida por esta migration.', null),
  ('vps-linux', 'VPS', 'VPS / Linux', 'UNPROVEN', 'Postura do host ainda não medida por esta migration.', null),
  ('frontend', 'FRONTEND', 'Frontend', 'UNPROVEN', 'Controles de frontend ainda não consolidados nesta projeção.', null),
  ('backend', 'BACKEND', 'Backend', 'UNPROVEN', 'Controles de backend ainda não consolidados nesta projeção.', null),
  ('agents', 'AGENTS', 'Agentes / Agents', 'UNPROVEN', 'Postura dos agentes ainda não consolidada nesta projeção.', null),
  ('database', 'DATABASE', 'Banco privado / Private DB', 'UNKNOWN', 'Migration presente no repo; runtime só muda após aplicação e medição.', null),
  ('backup-restore', 'BACKUP', 'Backup / Restore', 'UNPROVEN', 'Restore test físico ainda não medido.', null),
  ('session-revocation', 'SESSIONS', 'Session Revocation', 'UNPROVEN', 'Store existe após deploy; consumidor runtime ainda precisa ser provado.', null)
on conflict (control_id) do nothing;

-- Read-only admin projection. Private tables remain inaccessible to the browser.
create or replace function public.get_private_security_overview()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_controls jsonb;
  v_open_incidents bigint;
  v_revoked_sessions bigint;
  v_last_restore_test timestamptz;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if not exists (
    select 1
      from api.user_roles r
     where r.user_id = v_user_id
       and r.role = 'admin'
  ) then
    raise exception 'ADMIN_REQUIRED' using errcode = '42501';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', c.control_id,
        'surface', c.surface,
        'name', c.name,
        'status', c.status,
        'summary', c.summary,
        'observed_at', c.observed_at,
        'evidence_ref', c.evidence_ref
      ) order by c.surface, c.control_id
    ),
    '[]'::jsonb
  ) into v_controls
  from centraldark_private.security_control c;

  select count(*) into v_open_incidents
    from centraldark_private.security_incident i
   where i.status <> 'CLOSED';

  select count(*) into v_revoked_sessions
    from centraldark_private.session_revocation s
   where s.expires_at is null or s.expires_at > now();

  select max(b.restore_tested_at) into v_last_restore_test
    from centraldark_private.backup_restore_evidence b
   where b.restore_status = 'PASS';

  return jsonb_build_object(
    'controls', v_controls,
    'open_incidents', v_open_incidents,
    'revoked_sessions', v_revoked_sessions,
    'last_restore_test', v_last_restore_test
  );
end;
$$;

revoke all on function public.get_private_security_overview() from public, anon;
grant execute on function public.get_private_security_overview() to authenticated;

-- Server-side writers update status through a narrow RPC. No browser write path.
create or replace function public.set_private_security_control(
  p_control_id text,
  p_surface text,
  p_name text,
  p_status text,
  p_summary_redacted text,
  p_evidence_ref text default null,
  p_observed_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if p_control_id is null or btrim(p_control_id) = '' then
    raise exception 'CONTROL_ID_REQUIRED';
  end if;
  if p_status not in ('PASS','WARN','FAIL','UNKNOWN','UNPROVEN') then
    raise exception 'INVALID_SECURITY_STATUS';
  end if;
  if p_summary_redacted is null or length(p_summary_redacted) > 1000 then
    raise exception 'INVALID_REDACTED_SUMMARY';
  end if;

  insert into centraldark_private.security_control (
    control_id, surface, name, status, summary, observed_at, evidence_ref, updated_at
  ) values (
    left(p_control_id, 160), left(coalesce(p_surface, 'UNKNOWN'), 80),
    left(coalesce(p_name, p_control_id), 160), p_status,
    p_summary_redacted, p_observed_at, nullif(left(coalesce(p_evidence_ref, ''), 500), ''), now()
  )
  on conflict (control_id) do update set
    surface = excluded.surface,
    name = excluded.name,
    status = excluded.status,
    summary = excluded.summary,
    observed_at = excluded.observed_at,
    evidence_ref = excluded.evidence_ref,
    updated_at = now();
end;
$$;

revoke all on function public.set_private_security_control(text,text,text,text,text,text,timestamptz)
  from public, anon, authenticated;
grant execute on function public.set_private_security_control(text,text,text,text,text,text,timestamptz)
  to service_role;

comment on schema centraldark_private is
  'Private defensive security state. No direct anon/authenticated access; projections are explicit admin RPCs.';
comment on table centraldark_private.secret_status is
  'Status-only inventory. Never store secret values here.';
comment on function public.get_private_security_overview() is
  'Admin-only read projection for TelePainel Security Center; returns status/evidence metadata, never secret values.';
