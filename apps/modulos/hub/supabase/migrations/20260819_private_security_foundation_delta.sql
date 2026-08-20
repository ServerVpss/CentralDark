-- CentralDark private security foundation — DELTA from CENTRALDARK-PRIVATE-SECURITY-BANK-FOUNDATION
-- Adds: security_event (audit hash chain), idempotency_record, missing indexes
-- Repo-only until applied and measured in HUB Supabase runtime.
-- No raw secret value columns; secret inventory is status-only.
-- No direct anon/authenticated access to the private schema.

-- 1. security_event table (audit event store with hash chain from audit.mjs)
create table if not exists centraldark_private.security_event (
  id uuid primary key default gen_random_uuid(),
  observed_at timestamptz not null default now(),
  event_time timestamptz null,
  kind text not null,
  severity text not null check (severity in ('INFO','LOW','MEDIUM','HIGH','CRITICAL')),
  decision text not null,
  request_id text not null,
  principal_id text null,
  source_ip inet null,
  session_fingerprint text null,
  target text null,
  reason text null,
  evidence jsonb not null default '{}'::jsonb,
  previous_hash text null,
  event_hash text null
);

-- 2. idempotency_record table (for exactly-once semantics)
create table if not exists centraldark_private.idempotency_record (
  scope text not null,
  idempotency_key text not null,
  fingerprint text not null,
  response_hash text null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (scope, idempotency_key)
);

-- 3. Enable RLS and revoke direct access (defense in depth)
alter table centraldark_private.security_event enable row level security;
alter table centraldark_private.idempotency_record enable row level security;

revoke all on all tables in schema centraldark_private from public, anon, authenticated;
revoke all on all sequences in schema centraldark_private from public, anon, authenticated;
alter default privileges in schema centraldark_private revoke all on tables from public, anon, authenticated;
alter default privileges in schema centraldark_private revoke all on sequences from public, anon, authenticated;

-- 4. Indexes for security_event (audit queries)
create index if not exists security_event_observed_idx
  on centraldark_private.security_event(observed_at desc);
create index if not exists security_event_ip_idx
  on centraldark_private.security_event(source_ip, observed_at desc)
  where source_ip is not null;
create index if not exists security_event_kind_idx
  on centraldark_private.security_event(kind, observed_at desc);
create index if not exists security_event_session_idx
  on centraldark_private.security_event(session_fingerprint, observed_at desc)
  where session_fingerprint is not null;

-- 5. Indexes for idempotency_record
create index if not exists idempotency_exp_idx
  on centraldark_private.idempotency_record(expires_at);

-- 6. Update existing indexes to match naming convention (defensive, idempotent)
create index if not exists private_security_control_status_idx
  on centraldark_private.security_control(status, surface, updated_at desc);
create index if not exists private_security_incident_status_idx
  on centraldark_private.security_incident(status, severity, opened_at desc);
create index if not exists private_session_revocation_exp_idx
  on centraldark_private.session_revocation(expires_at)
  where expires_at is not null;
create index if not exists private_asset_posture_status_idx
  on centraldark_private.asset_posture(status, asset_type, updated_at desc);

-- 7. Admin read projection: security_overview view (complements get_private_security_overview RPC)
create or replace view centraldark_private.security_overview as
select
  (select count(*) from centraldark_private.security_incident where status <> 'CLOSED') as open_incidents,
  (select count(*) from centraldark_private.session_revocation where expires_at is null or expires_at > now()) as revoked_sessions,
  (select count(*) from centraldark_private.security_control where status = 'FAIL') as failed_controls,
  (select count(*) from centraldark_private.security_control where status in ('UNKNOWN','UNPROVEN')) as unknown_controls,
  (select max(restore_tested_at) from centraldark_private.backup_restore_evidence where restore_status = 'PASS') as last_restore_test,
  (select count(*) from centraldark_private.security_event where severity in ('HIGH','CRITICAL') and observed_at > now() - interval '24 hours') as critical_events_24h
;

revoke all on centraldark_private.security_overview from public, anon, authenticated;
grant select on centraldark_private.security_overview to service_role;

-- 8. Comment for traceability
comment on table centraldark_private.security_event is
  'Audit event store with SHA-256 hash chain (previous_hash -> event_hash). Immutable append-only. Source: security/audit.mjs hashAuditEvent.';
comment on table centraldark_private.idempotency_record is
  'Exactly-once execution records. Keyed by (scope, idempotency_key). TTL via expires_at. Source: security/policy.mjs DECISIONS idempotency path.';
comment on view centraldark_private.security_overview is
  'Admin read projection (service_role only). Aggregates status across private tables. Complements get_private_security_overview() RPC.';