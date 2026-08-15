-- Provider Control Plane — extensão da fundação privada existente.
-- ZERO DEPLOY nesta mudança: estrutura versionada, runtime continua UNPROVEN até aplicação/medição.
-- Não armazena credencial de provider, cartão, token, senha ou payload bruto não redigido.

create schema if not exists centraldark_private;
revoke all on schema centraldark_private from public, anon, authenticated;

create table if not exists centraldark_private.provider_operation_receipt (
  idempotency_key uuid primary key,
  provider text not null check (provider in ('cloudflare','contabo','supabase')),
  capability text not null check (capability ~ '^[A-Za-z0-9._-]{1,100}$'),
  actor_fingerprint text not null check (actor_fingerprint ~ '^[0-9a-f]{24}$'),
  request_fingerprint text not null check (request_fingerprint ~ '^[0-9a-f]{64}$'),
  state text not null check (state in ('PENDING','SUCCEEDED','FAILED','UNKNOWN')) default 'PENDING',
  amount numeric(20,6) null check (amount is null or amount >= 0),
  currency text null check (currency is null or currency ~ '^[A-Z]{3}$'),
  started_at timestamptz not null default now(),
  finished_at timestamptz null,
  provider_status integer null,
  result_redacted jsonb null,
  updated_at timestamptz not null default now()
);

create index if not exists provider_operation_receipt_provider_state_idx
  on centraldark_private.provider_operation_receipt(provider, state, started_at desc);

alter table centraldark_private.provider_operation_receipt enable row level security;
revoke all on centraldark_private.provider_operation_receipt from public, anon, authenticated;

create table if not exists centraldark_private.provider_budget (
  provider text primary key check (provider in ('cloudflare','contabo','supabase','ai')),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  monthly_budget numeric(20,6) not null check (monthly_budget >= 0),
  warn_percent numeric(7,2) not null default 80 check (warn_percent >= 0),
  alert_percent numeric(7,2) not null default 100 check (alert_percent >= warn_percent),
  block_optional_percent numeric(7,2) not null default 120 check (block_optional_percent >= alert_percent),
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table centraldark_private.provider_budget enable row level security;
revoke all on centraldark_private.provider_budget from public, anon, authenticated;

alter default privileges in schema centraldark_private revoke all on tables from public, anon, authenticated;
alter default privileges in schema centraldark_private revoke all on sequences from public, anon, authenticated;

-- Reserva idempotente de uma operação externa. Service-role only.
-- A mesma key + mesmo fingerprint retorna a reserva existente; fingerprint diferente falha.
create or replace function public.reserve_provider_operation(
  p_idempotency_key uuid,
  p_provider text,
  p_capability text,
  p_actor_fingerprint text,
  p_request_fingerprint text,
  p_amount numeric default null,
  p_currency text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_row centraldark_private.provider_operation_receipt%rowtype;
begin
  if p_idempotency_key is null then raise exception 'IDEMPOTENCY_KEY_REQUIRED'; end if;
  if p_provider not in ('cloudflare','contabo','supabase') then raise exception 'PROVIDER_INVALID'; end if;
  if p_capability is null or p_capability !~ '^[A-Za-z0-9._-]{1,100}$' then raise exception 'CAPABILITY_INVALID'; end if;
  if p_actor_fingerprint is null or p_actor_fingerprint !~ '^[0-9a-f]{24}$' then raise exception 'ACTOR_FINGERPRINT_INVALID'; end if;
  if p_request_fingerprint is null or p_request_fingerprint !~ '^[0-9a-f]{64}$' then raise exception 'REQUEST_FINGERPRINT_INVALID'; end if;
  if p_amount is not null and p_amount < 0 then raise exception 'AMOUNT_INVALID'; end if;
  if p_currency is not null and p_currency !~ '^[A-Z]{3}$' then raise exception 'CURRENCY_INVALID'; end if;

  insert into centraldark_private.provider_operation_receipt (
    idempotency_key, provider, capability, actor_fingerprint, request_fingerprint,
    state, amount, currency, started_at, updated_at
  ) values (
    p_idempotency_key, p_provider, p_capability, p_actor_fingerprint, p_request_fingerprint,
    'PENDING', p_amount, p_currency, now(), now()
  )
  on conflict (idempotency_key) do nothing;

  select * into v_row
    from centraldark_private.provider_operation_receipt
   where idempotency_key = p_idempotency_key
   for update;

  if not found then raise exception 'IDEMPOTENCY_RESERVATION_FAILED'; end if;
  if v_row.request_fingerprint <> p_request_fingerprint then
    raise exception 'IDEMPOTENCY_KEY_REUSE_MISMATCH';
  end if;
  if v_row.provider <> p_provider or v_row.capability <> p_capability then
    raise exception 'IDEMPOTENCY_KEY_SCOPE_MISMATCH';
  end if;

  return jsonb_build_object(
    'idempotency_key', v_row.idempotency_key,
    'provider', v_row.provider,
    'capability', v_row.capability,
    'state', v_row.state,
    'request_fingerprint', v_row.request_fingerprint,
    'started_at', v_row.started_at,
    'finished_at', v_row.finished_at,
    'provider_status', v_row.provider_status
  );
end;
$$;

revoke all on function public.reserve_provider_operation(uuid,text,text,text,text,numeric,text)
  from public, anon, authenticated;
grant execute on function public.reserve_provider_operation(uuid,text,text,text,text,numeric,text)
  to service_role;

create or replace function public.finalize_provider_operation(
  p_idempotency_key uuid,
  p_state text,
  p_provider_status integer default null,
  p_result_redacted jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_row centraldark_private.provider_operation_receipt%rowtype;
begin
  if p_idempotency_key is null then raise exception 'IDEMPOTENCY_KEY_REQUIRED'; end if;
  if p_state not in ('SUCCEEDED','FAILED','UNKNOWN') then raise exception 'TERMINAL_STATE_INVALID'; end if;

  update centraldark_private.provider_operation_receipt
     set state = p_state,
         provider_status = p_provider_status,
         result_redacted = p_result_redacted,
         finished_at = now(),
         updated_at = now()
   where idempotency_key = p_idempotency_key
     and state = 'PENDING'
  returning * into v_row;

  if not found then
    select * into v_row
      from centraldark_private.provider_operation_receipt
     where idempotency_key = p_idempotency_key;
    if not found then raise exception 'IDEMPOTENCY_RESERVATION_NOT_FOUND'; end if;
    -- Terminal repetido só é idempotente quando não tenta trocar o resultado final.
    if v_row.state <> p_state then raise exception 'IDEMPOTENCY_TERMINAL_STATE_MISMATCH'; end if;
  end if;

  return jsonb_build_object(
    'idempotency_key', v_row.idempotency_key,
    'provider', v_row.provider,
    'capability', v_row.capability,
    'state', v_row.state,
    'request_fingerprint', v_row.request_fingerprint,
    'started_at', v_row.started_at,
    'finished_at', v_row.finished_at,
    'provider_status', v_row.provider_status
  );
end;
$$;

revoke all on function public.finalize_provider_operation(uuid,text,integer,jsonb)
  from public, anon, authenticated;
grant execute on function public.finalize_provider_operation(uuid,text,integer,jsonb)
  to service_role;

-- Budget Guard: gravação somente service_role; leitura apenas por projeção admin.
create or replace function public.set_provider_budget(
  p_provider text,
  p_currency text,
  p_monthly_budget numeric,
  p_warn_percent numeric default 80,
  p_alert_percent numeric default 100,
  p_block_optional_percent numeric default 120,
  p_enabled boolean default true
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if p_provider not in ('cloudflare','contabo','supabase','ai') then raise exception 'PROVIDER_INVALID'; end if;
  if p_currency !~ '^[A-Z]{3}$' then raise exception 'CURRENCY_INVALID'; end if;
  if p_monthly_budget < 0 then raise exception 'BUDGET_INVALID'; end if;
  if p_warn_percent < 0 or p_alert_percent < p_warn_percent or p_block_optional_percent < p_alert_percent then
    raise exception 'BUDGET_THRESHOLDS_INVALID';
  end if;

  insert into centraldark_private.provider_budget (
    provider, currency, monthly_budget, warn_percent, alert_percent, block_optional_percent, enabled, updated_at
  ) values (
    p_provider, p_currency, p_monthly_budget, p_warn_percent, p_alert_percent, p_block_optional_percent, p_enabled, now()
  )
  on conflict (provider) do update set
    currency = excluded.currency,
    monthly_budget = excluded.monthly_budget,
    warn_percent = excluded.warn_percent,
    alert_percent = excluded.alert_percent,
    block_optional_percent = excluded.block_optional_percent,
    enabled = excluded.enabled,
    updated_at = now();
end;
$$;

revoke all on function public.set_provider_budget(text,text,numeric,numeric,numeric,numeric,boolean)
  from public, anon, authenticated;
grant execute on function public.set_provider_budget(text,text,numeric,numeric,numeric,numeric,boolean)
  to service_role;

create or replace function public.get_provider_budget_overview()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_is_admin boolean := false;
  v_has_role_owner boolean := false;
  v_rows jsonb;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;

  select exists (
    select 1 from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'has_role'
  ) into v_has_role_owner;

  if v_has_role_owner then
    execute 'select public.has_role($1, ''admin'')' into v_is_admin using v_user_id;
  else
    select exists (
      select 1 from api.user_roles r where r.user_id = v_user_id and r.role = 'admin'
    ) into v_is_admin;
  end if;

  if not coalesce(v_is_admin, false) then raise exception 'ADMIN_REQUIRED' using errcode = '42501'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'provider', b.provider,
    'currency', b.currency,
    'monthly_budget', b.monthly_budget,
    'warn_percent', b.warn_percent,
    'alert_percent', b.alert_percent,
    'block_optional_percent', b.block_optional_percent,
    'enabled', b.enabled,
    'updated_at', b.updated_at
  ) order by b.provider), '[]'::jsonb)
  into v_rows
  from centraldark_private.provider_budget b;

  return jsonb_build_object('budgets', v_rows);
end;
$$;

revoke all on function public.get_provider_budget_overview() from public, anon;
grant execute on function public.get_provider_budget_overview() to authenticated;

comment on table centraldark_private.provider_operation_receipt is
  'Idempotency + receipt metadata for external provider mutations. Never store raw credentials or card material.';
comment on table centraldark_private.provider_budget is
  'Owner-defined monthly guardrails. Observation/alerting data, not autonomous permission to spend.';

notify pgrst, 'reload schema';
