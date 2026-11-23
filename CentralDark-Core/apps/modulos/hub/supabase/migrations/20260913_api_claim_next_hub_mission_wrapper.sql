-- Wrapper PostgREST no schema exposto `api`.
-- Causa: PostgREST deste projeto expoe `api`; a funcao canonica vive em
-- public.claim_next_hub_mission e o consumer chama /rest/v1/rpc/claim_next_hub_mission,
-- que resolvia para api.claim_next_hub_mission inexistente (PGRST202).
-- Preserva public como implementacao unica; api apenas delega.
create schema if not exists api;

create or replace function api.claim_next_hub_mission(p_worker_id text)
returns setof public.hub_missions
language sql
security definer
set search_path = public, api
as $$
  select * from public.claim_next_hub_mission(p_worker_id);
$$;

revoke all on function api.claim_next_hub_mission(text) from public, anon, authenticated;
grant execute on function api.claim_next_hub_mission(text) to service_role;

comment on function api.claim_next_hub_mission(text) is
  'Wrapper PostgREST: delega ao claim atomico public.claim_next_hub_mission; api existe porque o schema exposto e api.';

notify pgrst, 'reload schema';
