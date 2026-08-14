-- Estende o plano de controle existente; não cria fila, serviço ou tabela paralela.
-- A missão passa a carregar uma CAPACIDADE do catálogo MCP + argumentos JSON.
-- O claim é condicional no próprio UPDATE do consumidor (queued + approved),
-- preservando um único executor vencedor mesmo com mais de uma instância.
-- O claim é atômico no banco e escolhe somente scope sem Writer running,
-- preservando uma única caneta ativa por scope mesmo com várias instâncias.

alter table public.hub_missions
  add column if not exists capability text,
  add column if not exists input jsonb not null default '{}'::jsonb,
  add column if not exists writer_scope text,
  add column if not exists claimed_by text,
  add column if not exists claimed_at timestamptz,
  add column if not exists finished_at timestamptz,
  add column if not exists execution_status text;

-- Contrato machine-readable: capacidade é nome de tool MCP, nunca shell livre.
-- Contratos machine-readable: capability nunca é shell livre e toda missão
-- executável nova precisa declarar o escopo que receberá a caneta.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'hub_missions_capability_format_ck'
      and conrelid = 'public.hub_missions'::regclass
  ) then
    alter table public.hub_missions
      add constraint hub_missions_capability_format_ck
      check (capability is null or capability ~ '^[A-Za-z0-9_-]{1,64}$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'hub_missions_input_object_ck'
      and conrelid = 'public.hub_missions'::regclass
  ) then
    alter table public.hub_missions
      add constraint hub_missions_input_object_ck
      check (jsonb_typeof(input) = 'object');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'hub_missions_writer_scope_format_ck'
      and conrelid = 'public.hub_missions'::regclass
  ) then
    alter table public.hub_missions
      add constraint hub_missions_writer_scope_format_ck
      check (writer_scope is null or writer_scope ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{0,199}$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'hub_missions_executable_scope_ck'
      and conrelid = 'public.hub_missions'::regclass
  ) then
    alter table public.hub_missions
      add constraint hub_missions_executable_scope_ck
      check (capability is null or writer_scope is not null) not valid;
  end if;
end $$;

create index if not exists hub_missions_execution_queue_idx
  on public.hub_missions (state, "authorization", created_at)
  where capability is not null;

create index if not exists hub_missions_running_claim_idx
  on public.hub_missions (claimed_at)
  where state = 'running';

comment on column public.hub_missions.capability is
  'Nome exato de uma tool do catálogo MCP CentralDark. NULL = missão sem execução automática.';
comment on column public.hub_missions.input is
  'Argumentos JSON internos da capability; não expor na view api.';
comment on column public.hub_missions.claimed_by is
  'Instância que venceu o claim condicional queued->running.';

-- A view de frontend NÃO expõe input. Capability e estado de execução são
-- observáveis; argumentos ficam apenas na tabela public via service_role.
-- PEN_POOL sem subsistema paralelo:
-- queued = caneta em STOCK; running = LEASED. Várias canetas podem existir,
-- mas duas missões do mesmo scope jamais podem permanecer LEASED juntas.
create unique index if not exists hub_missions_one_running_writer_scope_idx
  on public.hub_missions (writer_scope)
  where state = 'running' and writer_scope is not null;

-- Claim único e sem starvation entre scopes: o banco escolhe a missão mais
-- antiga cujo scope não possui Writer ativo. FOR UPDATE SKIP LOCKED resolve
-- corrida entre consumers; o índice UNIQUE acima é a segunda barreira atômica.
create or replace function public.claim_next_hub_mission(p_worker_id text)
returns setof public.hub_missions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_worker_id text := left(nullif(btrim(p_worker_id), ''), 120);
begin
  if v_worker_id is null then
    raise exception 'worker_id_required';
  end if;

  return query
  with candidate as (
    select queued.id
    from public.hub_missions queued
    where queued.state = 'queued'
      and queued."authorization" = 'approved'
      and queued.capability is not null
      and queued.writer_scope is not null
      and not exists (
        select 1
        from public.hub_missions active
        where active.state = 'running'
          and active.writer_scope = queued.writer_scope
      )
    order by queued.created_at asc
    for update of queued skip locked
    limit 1
  )
  update public.hub_missions mission
  set state = 'running',
      claimed_by = v_worker_id,
      claimed_at = now(),
      execution_status = 'claimed',
      updated_at = now()
  from candidate
  where mission.id = candidate.id
    and mission.state = 'queued'
    and mission."authorization" = 'approved'
  returning mission.*;
end;
$$;

revoke all on function public.claim_next_hub_mission(text) from public, anon, authenticated;
grant execute on function public.claim_next_hub_mission(text) to service_role;

comment on function public.claim_next_hub_mission(text) is
  'Claim atômico: escolhe missão queued/approved cujo writer_scope não está running; máximo 1 Writer ativo por scope.';
comment on column public.hub_missions.capability is
  'Nome exato de uma tool do catálogo MCP CentralDark. NULL = missão sem execução automática.';
comment on column public.hub_missions.input is
  'Argumentos JSON internos da capability; não expor na view api nem em SELECT authenticated da tabela public.';
comment on column public.hub_missions.writer_scope is
  'Escopo lógico da caneta. Apenas uma missão pode permanecer running por writer_scope.';
comment on column public.hub_missions.claimed_by is
  'Instância que venceu o claim atômico queued->running.';

-- O grant antigo era SELECT de tabela inteira para authenticated. Depois que
-- `input` passou a existir isso exporia argumentos internos. Revoga o grant de
-- tabela e devolve somente as colunas operacionais não sensíveis.
revoke select on public.hub_missions from authenticated;
grant select (
  id, title, creator, agent, target, state, "authorization", branch_sha, risk,
  rollback, created_at, updated_at, capability, writer_scope, claimed_by, claimed_at,
  finished_at, execution_status
) on public.hub_missions to authenticated;

-- A view de frontend NÃO expõe input. Capability, scope e estado de execução
-- são observáveis; argumentos ficam apenas na tabela public via service_role.
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
    execution_status
  from public.hub_missions;
grant select on api.hub_missions to authenticated, anon;
revoke all on api.hub_missions from anon;
grant select on api.hub_missions to authenticated;

notify pgrst, 'reload schema';
