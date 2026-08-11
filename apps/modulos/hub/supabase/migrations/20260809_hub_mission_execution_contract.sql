-- Estende o plano de controle existente; não cria fila, serviço ou tabela paralela.
-- A missão passa a carregar uma CAPACIDADE do catálogo MCP + argumentos JSON.
-- O claim é condicional no próprio UPDATE do consumidor (queued + approved),
-- e o banco garante no máximo um Writer running por scope, mesmo com várias instâncias.

alter table public.hub_missions
  add column if not exists capability text,
  add column if not exists input jsonb not null default '{}'::jsonb,
  add column if not exists writer_scope text,
  add column if not exists claimed_by text,
  add column if not exists claimed_at timestamptz,
  add column if not exists finished_at timestamptz,
  add column if not exists execution_status text;

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

-- PEN_POOL sem subsistema paralelo:
-- queued = caneta em STOCK; running = LEASED. Várias canetas podem existir,
-- mas a transição queued->running é serializada pelo banco por writer_scope.
-- A unicidade é atômica: duas missões diferentes do mesmo scope não podem
-- manter dois Writers ativos ao mesmo tempo.
create unique index if not exists hub_missions_one_running_writer_scope_idx
  on public.hub_missions (writer_scope)
  where state = 'running' and writer_scope is not null;

comment on column public.hub_missions.capability is
  'Nome exato de uma tool do catálogo MCP CentralDark. NULL = missão sem execução automática.';
comment on column public.hub_missions.input is
  'Argumentos JSON internos da capability; não expor na view api nem em SELECT authenticated da tabela public.';
comment on column public.hub_missions.writer_scope is
  'Escopo lógico da caneta. Apenas uma missão pode permanecer running por writer_scope.';
comment on column public.hub_missions.claimed_by is
  'Instância que venceu o claim condicional queued->running.';

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
revoke all on api.hub_missions from anon;
grant select on api.hub_missions to authenticated;

notify pgrst, 'reload schema';
