-- MCP session binding: server-only verifier, never returns credentials.
-- Reuse the canonical private schema name and the existing Auth/user_roles data.
create schema if not exists centraldark_private;
revoke all on schema centraldark_private from public, anon, authenticated;
grant usage on schema centraldark_private to service_role;

create or replace function centraldark_private.mcp_validate_session_binding(p_user_id uuid, p_session_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_role text;
  v_not_after timestamptz;
begin
  -- Only the already-authenticated backend service role may invoke this.
  -- A user JWT (auth.uid() is not null) is never a service assertion.
  if current_setting('role', true) is distinct from 'service_role' or auth.uid() is not null then
    raise exception 'MCP session validation requires the service role' using errcode = '42501';
  end if;
  select ur.role::text, s.not_after into v_role, v_not_after
    from auth.sessions s
    join auth.users u on u.id = s.user_id
    join public.user_roles ur on ur.user_id = u.id
    where s.id = p_session_id and s.user_id = p_user_id
      and u.deleted_at is null
      and not coalesce(u.is_anonymous, false)
      and (u.banned_until is null or u.banned_until <= now())
      and (s.not_after is null or s.not_after > now())
      and ur.role::text in ('admin','moderator','user')
    order by case ur.role::text when 'admin' then 1 when 'moderator' then 2 else 3 end
    limit 1;
  if v_role is null then return jsonb_build_object('valid',false); end if;
  return jsonb_build_object('valid',true,'user_id',p_user_id,'session_id',p_session_id,
    'role',v_role,'not_after',v_not_after);
end;
$function$;
revoke all on function centraldark_private.mcp_validate_session_binding(uuid,uuid) from public, anon, authenticated, service_role;
grant execute on function centraldark_private.mcp_validate_session_binding(uuid,uuid) to service_role;

-- PostgREST only exposes the invoker wrapper; the definer remains private.
create or replace function public.mcp_validate_session_binding(p_user_id uuid, p_session_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $function$
  select centraldark_private.mcp_validate_session_binding(p_user_id,p_session_id);
$function$;
revoke all on function public.mcp_validate_session_binding(uuid,uuid) from public, anon, authenticated, service_role;
grant execute on function public.mcp_validate_session_binding(uuid,uuid) to service_role;
comment on function public.mcp_validate_session_binding(uuid,uuid) is 'Internal MCP session/role check; service_role only. No tokens or user profile data returned.';
