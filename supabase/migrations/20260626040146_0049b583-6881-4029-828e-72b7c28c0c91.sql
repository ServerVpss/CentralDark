-- Views espelho em public (Data API só expõe public)
create or replace view public.hub_connectors with (security_invoker=on) as
  select * from hub.connectors;

create or replace view public.hub_policies with (security_invoker=on) as
  select * from hub.policies;

create or replace view public.hub_approvals with (security_invoker=on) as
  select * from hub.approvals;

create or replace view public.hub_audit_log with (security_invoker=on) as
  select * from hub.audit_log;

create or replace view public.hub_capabilities with (security_invoker=on) as
  select * from hub.capabilities;

create or replace view public.hub_theme_tokens with (security_invoker=on) as
  select * from hub.theme_tokens;

grant select on public.hub_connectors   to anon, authenticated;
grant select on public.hub_theme_tokens to anon, authenticated;
grant select on public.hub_policies     to authenticated;
grant select on public.hub_approvals    to authenticated;
grant select on public.hub_audit_log    to authenticated;
grant select on public.hub_capabilities to authenticated;

-- Wrappers RPC em public pra chamar funções do schema hub
create or replace function public.hub_approval_decide(p_approval_id uuid, p_verdict text)
returns jsonb language sql security definer set search_path = public, hub as $$
  select hub.approval_decide(p_approval_id, p_verdict);
$$;
grant execute on function public.hub_approval_decide to authenticated;

create or replace function public.hub_pdp_evaluate(p_tool text, p_environment text default '*', p_identity text default null)
returns jsonb language sql security definer set search_path = public, hub as $$
  select hub.pdp_evaluate(p_tool, p_environment, p_identity);
$$;
grant execute on function public.hub_pdp_evaluate to authenticated;

create or replace function public.hub_approval_request(p_agent_identity text, p_tool text, p_args_hash text, p_resource text default null, p_environment text default '*', p_ttl_minutes int default 15)
returns jsonb language sql security definer set search_path = public, hub as $$
  select hub.approval_request(p_agent_identity, p_tool, p_args_hash, p_resource, p_environment, p_ttl_minutes);
$$;
grant execute on function public.hub_approval_request to authenticated;