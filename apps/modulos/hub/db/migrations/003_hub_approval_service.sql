-- =====================================================================
-- CentralDark Hub — 003_hub_approval_service.sql
-- Destino: apps/hub/db/migrations/003_hub_approval_service.sql
-- Requer: 001 + 002
--
-- Implementa:
--   (a) hub.approval_request()  — cria pedido pendente com hash+nonce
--   (b) hub.approval_decide()   — humano aprova/rejeita (verifica hash)
--   (c) hub.approval_consume()  — PEP consome aprovação e emite capability
--   (d) hub.expire_approvals()  — marca expiradas (rodar periodicamente)
-- =====================================================================

-- =====================================================================
-- (a) Criar pedido de aprovação
--     Chamado pelo PEP quando PDP retorna 'require_approval'.
--     Gera nonce, calcula hash, insere linha 'pending'.
-- =====================================================================
create or replace function hub.approval_request(
  p_agent_identity text,
  p_tool           text,
  p_args_hash      text,
  p_resource       text  default null,
  p_environment    text  default '*',
  p_ttl_minutes    int   default 15
) returns jsonb
language plpgsql security definer
as $$
declare
  v_nonce       text;
  v_issued_at   timestamptz := now();
  v_expires_at  timestamptz := now() + (p_ttl_minutes || ' minutes')::interval;
  v_req_hash    text;
  v_id          uuid;
begin
  -- Nonce aleatório (hex 32 bytes)
  v_nonce := encode(gen_random_bytes(32), 'hex');

  -- Hash canônico
  v_req_hash := hub.compute_request_hash(
    p_agent_identity, p_tool, p_args_hash,
    p_resource, p_environment,
    v_nonce, v_issued_at, v_expires_at
  );

  insert into hub.approvals (
    agent_identity, tool, args_hash, resource,
    environment, nonce, request_hash,
    status, requested_at, expires_at
  ) values (
    p_agent_identity, p_tool, p_args_hash, p_resource,
    p_environment, v_nonce, v_req_hash,
    'pending', v_issued_at, v_expires_at
  )
  returning id into v_id;

  return jsonb_build_object(
    'approval_id',   v_id,
    'nonce',         v_nonce,
    'request_hash',  v_req_hash,
    'expires_at',    v_expires_at
  );
end;
$$;

grant execute on function hub.approval_request to mcp_agent;

-- =====================================================================
-- (b) Decidir aprovação (humano autenticado)
--     Só usuário autenticado no painel pode chamar.
--     Verifica que status ainda é 'pending' e não expirou.
-- =====================================================================
create or replace function hub.approval_decide(
  p_approval_id uuid,
  p_verdict     text  -- 'approved' | 'rejected'
) returns jsonb
language plpgsql security definer
as $$
declare
  v_ap hub.approvals%rowtype;
begin
  -- Somente humano autenticado
  if auth.role() != 'authenticated' then
    return jsonb_build_object('error', 'unauthorized');
  end if;

  if p_verdict not in ('approved', 'rejected') then
    return jsonb_build_object('error', 'invalid_verdict');
  end if;

  select * into v_ap from hub.approvals where id = p_approval_id;

  if not found then
    return jsonb_build_object('error', 'not_found');
  end if;

  if v_ap.status != 'pending' then
    return jsonb_build_object('error', 'already_decided', 'status', v_ap.status);
  end if;

  if v_ap.expires_at < now() then
    update hub.approvals set status = 'expired' where id = p_approval_id;
    return jsonb_build_object('error', 'expired');
  end if;

  update hub.approvals
  set
    status     = p_verdict,
    decided_at = now(),
    decided_by = auth.uid()
  where id = p_approval_id;

  -- Registra no audit
  insert into hub.audit_log (agent_identity, tool, args_hash, decision, tier, approval_id, row_hash)
  values (
    'human:' || auth.uid()::text,
    v_ap.tool,
    v_ap.args_hash,
    case p_verdict when 'approved' then 'allow' else 'deny' end,
    2,
    p_approval_id,
    '' -- preenchido pelo trigger
  );

  return jsonb_build_object('ok', true, 'verdict', p_verdict, 'approval_id', p_approval_id);
end;
$$;

-- Apenas usuário autenticado chama
grant execute on function hub.approval_decide to authenticated;

-- =====================================================================
-- (c) Consumir aprovação → emite capability (PEP)
--     Valida hash + nonce + status.
--     Marca approval como 'consumed' (não pode usar 2x).
--     Insere capability com TTL curto.
-- =====================================================================
create or replace function hub.approval_consume(
  p_approval_id uuid,
  p_nonce       text,
  p_request_hash text
) returns jsonb
language plpgsql security definer
as $$
declare
  v_ap hub.approvals%rowtype;
  v_cap_id uuid;
  v_cap_nonce text;
begin
  select * into v_ap from hub.approvals where id = p_approval_id;

  if not found then
    return jsonb_build_object('error', 'not_found');
  end if;

  -- Validações de segurança
  if v_ap.status != 'approved' then
    return jsonb_build_object('error', 'not_approved', 'status', v_ap.status);
  end if;

  if v_ap.nonce != p_nonce then
    return jsonb_build_object('error', 'nonce_mismatch');
  end if;

  if v_ap.request_hash != p_request_hash then
    return jsonb_build_object('error', 'hash_mismatch');
  end if;

  if v_ap.expires_at < now() then
    update hub.approvals set status = 'expired' where id = p_approval_id;
    return jsonb_build_object('error', 'expired');
  end if;

  -- Marca como consumida (não pode usar 2x)
  update hub.approvals set status = 'consumed' where id = p_approval_id;

  -- Emite capability (TTL 5 min)
  v_cap_nonce := encode(gen_random_bytes(32), 'hex');

  insert into hub.capabilities (
    nonce, request_hash, tool, environment,
    tier, expires_at, approval_id
  ) values (
    v_cap_nonce, p_request_hash, v_ap.tool, v_ap.environment,
    2, now() + interval '5 minutes', p_approval_id
  )
  returning id into v_cap_id;

  return jsonb_build_object(
    'ok',          true,
    'capability_id', v_cap_id,
    'cap_nonce',   v_cap_nonce,
    'expires_at',  now() + interval '5 minutes'
  );
end;
$$;

-- service_role (PEP) chama, não mcp_agent
-- grant execute on function hub.approval_consume to service_role;

-- =====================================================================
-- (d) Expirar aprovações velhas (cron job / pg_cron)
-- =====================================================================
create or replace function hub.expire_approvals()
returns int language plpgsql security definer
as $$
declare v_count int;
begin
  update hub.approvals
  set status = 'expired'
  where status = 'pending' and expires_at < now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Rodar a cada 5 min via pg_cron:
-- select cron.schedule('expire-hub-approvals','*/5 * * * *','select hub.expire_approvals()');

-- =====================================================================
-- FIM. Próximo: 004 integração com Telegram (Approval Service webhook).
-- =====================================================================
