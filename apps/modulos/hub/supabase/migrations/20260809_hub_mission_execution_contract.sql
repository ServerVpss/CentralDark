-- Estende o plano de controle existente; não cria fila, serviço ou tabela paralela.
-- A missão passa a carregar uma CAPACIDADE do catálogo MCP + argumentos JSON.
-- O claim é condicional no próprio UPDATE do consumidor (queued + approved),
-- preservando um único executor vencedor mesmo com mais de uma instância.

alter table public.hub_missions
  add column if not exists capability text,
  add column if not exists input jsonb not null default '{}'::jsonb,
  add column if not exists claimed_by text,
  add column if not exists claimed_at timestamptz,
  add column if not exists finished_at timestamptz,
  add column if not exists execution_status text;

-- Contrato machine-readable: capacidade é nome de tool MCP, nunca shell livre.
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
    claimed_by,
    claimed_at,
    finished_at,
    execution_status
  from public.hub_missions;
grant select on api.hub_missions to authenticated, anon;

notify pgrst, 'reload schema';
