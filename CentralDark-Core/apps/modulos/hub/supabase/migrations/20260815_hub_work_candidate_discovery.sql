-- Extensão aditiva do plano de controle existente para work discovery.
-- NÃO cria fila/tabela paralela: candidatos continuam sendo public.hub_missions.
-- Candidato descoberto nasce sempre authorization=pending; o worker nunca se autoaprova.

alter table public.hub_missions
  add column if not exists parent_mission_id uuid,
  add column if not exists work_fingerprint text,
  add column if not exists source_receipt_sha text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'hub_missions_parent_mission_fk'
      and conrelid = 'public.hub_missions'::regclass
  ) then
    alter table public.hub_missions
      add constraint hub_missions_parent_mission_fk
      foreign key (parent_mission_id)
      references public.hub_missions(id)
      on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'hub_missions_parent_not_self_ck'
      and conrelid = 'public.hub_missions'::regclass
  ) then
    alter table public.hub_missions
      add constraint hub_missions_parent_not_self_ck
      check (parent_mission_id is null or parent_mission_id <> id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'hub_missions_work_fingerprint_ck'
      and conrelid = 'public.hub_missions'::regclass
  ) then
    alter table public.hub_missions
      add constraint hub_missions_work_fingerprint_ck
      check (work_fingerprint is null or work_fingerprint ~ '^[0-9a-f]{64}$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'hub_missions_source_receipt_sha_ck'
      and conrelid = 'public.hub_missions'::regclass
  ) then
    alter table public.hub_missions
      add constraint hub_missions_source_receipt_sha_ck
      check (source_receipt_sha is null or source_receipt_sha ~ '^[0-9a-f]{64}$');
  end if;
end $$;

-- Dedupe material: a mesma ferida não pode reaparecer enquanto já estiver
-- queued/running nem depois de concluída. failed/cancelled liberam retry.
create unique index if not exists hub_missions_active_work_fingerprint_uidx
  on public.hub_missions (work_fingerprint)
  where work_fingerprint is not null
    and state in ('queued', 'running', 'done');

create index if not exists hub_missions_parent_mission_idx
  on public.hub_missions (parent_mission_id, created_at desc)
  where parent_mission_id is not null;

create or replace function public.publish_hub_work_candidate(
  p_parent_mission_id uuid,
  p_worker_id text,
  p_work_fingerprint text,
  p_capability text,
  p_input jsonb,
  p_branch_sha text,
  p_title text,
  p_target text default null,
  p_risk text default 'R1',
  p_receipt_sha text default null
)
returns table(mission_id uuid, created boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_worker_id text := left(nullif(btrim(p_worker_id), ''), 120);
  v_capability text := btrim(p_capability);
  v_scope text;
  v_parent public.hub_missions%rowtype;
  v_id uuid;
begin
  if v_worker_id is null then
    raise exception 'worker_id_required';
  end if;
  if p_parent_mission_id is null then
    raise exception 'parent_mission_required';
  end if;
  if p_work_fingerprint is null or p_work_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception 'work_fingerprint_invalid';
  end if;
  if v_capability is null or v_capability !~ '^[A-Za-z0-9_-]{1,64}$' then
    raise exception 'capability_invalid';
  end if;
  if p_input is null or jsonb_typeof(p_input) <> 'object' then
    raise exception 'input_must_be_object';
  end if;
  if p_branch_sha is null or p_branch_sha !~ '^[0-9a-fA-F]{40}$' then
    raise exception 'branch_sha_invalid';
  end if;
  if p_receipt_sha is null or p_receipt_sha !~ '^[0-9a-f]{64}$' then
    raise exception 'receipt_sha_invalid';
  end if;
  if nullif(btrim(p_title), '') is null then
    raise exception 'title_required';
  end if;
  if p_risk not in ('R0', 'R1', 'R2', 'R3', 'R4') then
    raise exception 'risk_invalid';
  end if;

  select *
    into v_parent
    from public.hub_missions
   where id = p_parent_mission_id;

  if not found then
    raise exception 'parent_mission_not_found';
  end if;
  if v_parent.state <> 'running' or v_parent.claimed_by is distinct from v_worker_id then
    raise exception 'parent_claim_not_owned';
  end if;
  if lower(coalesce(v_parent.branch_sha, '')) <> lower(p_branch_sha) then
    raise exception 'candidate_revision_mismatch';
  end if;

  -- Resultado só vira candidato depois que o receipt do mesmo pai já entrou
  -- em hub_evidence. Status pending continua evidência não validada, mas é
  -- âncora suficiente para publicar CANDIDATO pending; nunca para aprovar.
  if not exists (
    select 1
      from public.hub_evidence evidence
     where evidence.mission_id = p_parent_mission_id
       and evidence.type = 'mcp_tool_receipt'
       and evidence.sha = p_receipt_sha
  ) then
    raise exception 'candidate_evidence_required';
  end if;

  v_scope := 'capability:' || lower(v_capability);

  insert into public.hub_missions (
    title,
    creator,
    agent,
    target,
    state,
    "authorization",
    branch_sha,
    risk,
    capability,
    input,
    writer_scope,
    execution_status,
    parent_mission_id,
    work_fingerprint,
    source_receipt_sha
  )
  values (
    left(btrim(p_title), 200),
    v_parent.creator,
    'work-discovery',
    nullif(left(btrim(coalesce(p_target, '')), 200), ''),
    'queued',
    'pending',
    lower(p_branch_sha),
    p_risk,
    v_capability,
    p_input,
    v_scope,
    'WORK_CANDIDATE_PENDING',
    p_parent_mission_id,
    p_work_fingerprint,
    p_receipt_sha
  )
  on conflict (work_fingerprint)
    where work_fingerprint is not null
      and state in ('queued', 'running', 'done')
  do nothing
  returning id into v_id;

  if v_id is not null then
    return query select v_id, true;
    return;
  end if;

  select existing.id
    into v_id
    from public.hub_missions existing
   where existing.work_fingerprint = p_work_fingerprint
     and existing.state in ('queued', 'running', 'done')
   order by existing.created_at asc
   limit 1;

  if v_id is null then
    raise exception 'work_candidate_dedupe_readback_failed';
  end if;

  return query select v_id, false;
end;
$$;

revoke all on function public.publish_hub_work_candidate(
  uuid, text, text, text, jsonb, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.publish_hub_work_candidate(
  uuid, text, text, text, jsonb, text, text, text, text, text
) to service_role;

comment on function public.publish_hub_work_candidate(
  uuid, text, text, text, jsonb, text, text, text, text, text
) is
  'Publica work candidate pending no hub_missions existente; exige claim do pai + receipt evidence e deduplica atomicamente por fingerprint. Nunca autoaprova.';

comment on column public.hub_missions.parent_mission_id is
  'Missão cuja execução/evidência revelou este candidato de trabalho.';
comment on column public.hub_missions.work_fingerprint is
  'SHA-256 semântico do trabalho para dedupe entre queued/running/done.';
comment on column public.hub_missions.source_receipt_sha is
  'SHA-256 do execution receipt do pai que ancorou a descoberta.';

-- Mantém input privado; expõe apenas proveniência/dedupe observável.
revoke select on public.hub_missions from authenticated;
grant select (
  id, title, creator, agent, target, state, "authorization", branch_sha, risk,
  rollback, created_at, updated_at, capability, writer_scope, claimed_by, claimed_at,
  finished_at, execution_status, parent_mission_id, work_fingerprint, source_receipt_sha
) on public.hub_missions to authenticated;

create or replace view api.hub_missions as
  select
    id,
    title,
    creator,
    agent,
    target,
    state,
    "authorization",
    branch_sha,
    risk,
    rollback,
    created_at,
    updated_at,
    capability,
    writer_scope,
    claimed_by,
    claimed_at,
    finished_at,
    execution_status,
    parent_mission_id,
    work_fingerprint,
    source_receipt_sha
  from public.hub_missions;
revoke all on api.hub_missions from anon;
grant select on api.hub_missions to authenticated;

notify pgrst, 'reload schema';
