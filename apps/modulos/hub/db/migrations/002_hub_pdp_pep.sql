-- =====================================================================
-- CentralDark Hub — 002_hub_pdp_pep.sql
-- Destino: apps/hub/db/migrations/002_hub_pdp_pep.sql
-- Requer: 001_hub_foundation.sql + pgcrypto
--
-- Implementa:
--   (a) hub.pdp_evaluate()        — motor de decisão (Default-Deny)
--   (b) hub.capabilities          — capabilities assinadas pelo PEP
--   (c) hub.audit_hash_chain()    — trigger de hash-chain imutável
--   (d) hub.audit_verify_chain()  — RPC de verificação da cadeia
--   (e) hub.compute_request_hash()— hash canônico do pedido
-- =====================================================================

-- Pgcrypto obrigatório para SHA-256
create extension if not exists pgcrypto;

-- =====================================================================
-- (a) PDP — motor de decisão
--     Entrada:  tool, environment, identity (opcional)
--     Saída:    {decision, tier, policy_id, matched_tool, environment}
--     Regra:    sem policy = DENY (Default-Deny)
--               Tier 4 = sempre DENY (desativado por padrão)
-- =====================================================================
create or replace function hub.pdp_evaluate(
  p_tool        text,
  p_environment text default '*',
  p_identity    text default null
) returns jsonb
language plpgsql security definer
as $$
declare
  v_pol hub.policies%rowtype;
begin
  -- Busca a política mais específica que casa com a tool e ambiente.
  -- Exact match de ambiente tem prioridade sobre wildcard '*'.
  -- Tool sem wildcard tem prioridade sobre tool com wildcard.
  select * into v_pol
  from hub.policies
  where enabled = true
    and (environment = p_environment or environment = '*')
    and p_tool like replace(replace(replace(tool,'*','%'),'?','_'),'.','\.')
  order by
    (environment = p_environment) desc,       -- exact env primeiro
    (position('*' in tool) = 0) desc,         -- sem wildcard é mais específico
    length(tool) desc,                         -- mais longa = mais específica
    created_at asc
  limit 1;

  -- Sem regra → DENY (Default-Deny)
  if not found then
    return jsonb_build_object(
      'decision',    'deny',
      'tier',        4,
      'reason',      'no_matching_policy',
      'policy_id',   null,
      'matched_tool', null
    );
  end if;

  -- Tier 4 nasce desativado — nunca autoriza
  if v_pol.tier = 4 then
    return jsonb_build_object(
      'decision',    'deny',
      'tier',        4,
      'reason',      'tier4_disabled',
      'policy_id',   v_pol.id,
      'matched_tool', v_pol.tool
    );
  end if;

  -- Precisa de aprovação humana?
  if v_pol.needs_approval then
    return jsonb_build_object(
      'decision',    'require_approval',
      'tier',        v_pol.tier,
      'reason',      'policy_needs_approval',
      'policy_id',   v_pol.id,
      'matched_tool', v_pol.tool
    );
  end if;

  -- ALLOW
  return jsonb_build_object(
    'decision',    'allow',
    'tier',        v_pol.tier,
    'reason',      'policy_match',
    'policy_id',   v_pol.id,
    'matched_tool', v_pol.tool
  );
end;
$$;

grant execute on function hub.pdp_evaluate to mcp_agent;

-- =====================================================================
-- (b) PEP — tabela de capabilities
--     Capabilities emitidas pelo PEP após decisão ALLOW ou aprovação.
--     Nonce de uso único. TTL curto (default: 5min).
--     Somente service_role insere. mcp_agent só lê pelo nonce.
-- =====================================================================
create table if not exists hub.capabilities (
  id           uuid primary key default gen_random_uuid(),
  nonce        text unique not null,
  request_hash text not null,         -- hash canônico vinculado ao pedido
  tool         text not null,
  environment  text not null default '*',
  tier         int  not null check (tier between 0 and 3), -- Tier 4 nunca emite
  issued_at    timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '5 minutes',
  consumed_at  timestamptz,           -- preenchido ao usar; nonce queimado
  approval_id  uuid references hub.approvals(id)
);

alter table hub.capabilities enable row level security;

-- mcp_agent lê capability pelo nonce (pra validar na execução)
create policy capabilities_read on hub.capabilities
  for select using (true);

-- Somente service_role (PEP) emite — mcp_agent NÃO insere
-- (não concedemos INSERT ao mcp_agent aqui)

-- =====================================================================
-- (c) Audit — trigger de hash-chain imutável
--     Calcula prev_hash + row_hash antes de cada INSERT.
--     SHA-256 via pgcrypto. Fallback: md5 se pgcrypto indisponível.
--     UPDATE/DELETE continuam bloqueados (revoke da 001).
-- =====================================================================
create or replace function hub.audit_hash_chain()
returns trigger language plpgsql
as $$
declare
  v_prev text;
  v_data text;
begin
  -- Hash da linha anterior (ou constante inicial se for a primeira)
  select row_hash into v_prev
  from hub.audit_log
  order by id desc
  limit 1;

  new.prev_hash := coalesce(v_prev, '0000000000000000000000000000000000000000000000000000000000000000');

  -- Concatenação canônica dos campos relevantes
  v_data := concat_ws('|',
    new.ts::text,
    coalesce(new.agent_identity, ''),
    coalesce(new.tool,           ''),
    coalesce(new.args_hash,      ''),
    coalesce(new.decision,       ''),
    coalesce(new.tier::text,     ''),
    new.prev_hash
  );

  begin
    new.row_hash := encode(digest(v_data, 'sha256'), 'hex');
  exception when undefined_function then
    -- pgcrypto não disponível: fallback md5 (ainda determinístico)
    new.row_hash := md5(v_data);
  end;

  return new;
end;
$$;

drop trigger if exists audit_chain on hub.audit_log;
create trigger audit_chain
  before insert on hub.audit_log
  for each row execute function hub.audit_hash_chain();

-- =====================================================================
-- (d) Audit — verificação da cadeia
--     Usado pelo Audit Service para detectar adulteração.
--     Retorna is_tampered=true se qualquer prev_hash não bater.
-- =====================================================================
create or replace function hub.audit_verify_chain(
  p_limit int default 200
) returns table(
  id          bigint,
  ts          timestamptz,
  tool        text,
  decision    text,
  tier        int,
  row_hash    text,
  prev_hash   text,
  chain_ok    boolean
)
language sql security definer stable
as $$
  with ordered as (
    select
      a.id, a.ts, a.tool, a.decision, a.tier,
      a.row_hash, a.prev_hash,
      lag(a.row_hash) over (order by a.id) as expected_prev
    from hub.audit_log a
    order by a.id desc
    limit p_limit
  )
  select
    o.id, o.ts, o.tool, o.decision, o.tier,
    o.row_hash, o.prev_hash,
    (
      o.prev_hash = coalesce(
        o.expected_prev,
        '0000000000000000000000000000000000000000000000000000000000000000'
      )
    ) as chain_ok
  from ordered o;
$$;

grant execute on function hub.audit_verify_chain to mcp_agent;

-- =====================================================================
-- (e) PEP — hash canônico do pedido
--     hash = SHA-256( identity | tool | args_hash | resource |
--                     environment | nonce | issued_at | expires_at )
--     Aprovação é vinculada a este hash — muda 1 arg = hash diferente.
-- =====================================================================
create or replace function hub.compute_request_hash(
  p_identity    text,
  p_tool        text,
  p_args_hash   text,
  p_resource    text,
  p_environment text,
  p_nonce       text,
  p_issued_at   timestamptz,
  p_expires_at  timestamptz
) returns text
language plpgsql immutable security definer
as $$
declare
  v_data text;
begin
  v_data := concat_ws('|',
    coalesce(p_identity,    ''),
    coalesce(p_tool,        ''),
    coalesce(p_args_hash,   ''),
    coalesce(p_resource,    ''),
    coalesce(p_environment, ''),
    coalesce(p_nonce,       ''),
    p_issued_at::text,
    p_expires_at::text
  );
  begin
    return encode(digest(v_data, 'sha256'), 'hex');
  exception when undefined_function then
    return md5(v_data);
  end;
end;
$$;

grant execute on function hub.compute_request_hash to mcp_agent;

-- =====================================================================
-- TESTES RÁPIDOS (rodar manualmente no SQL Editor)
-- =====================================================================
-- -- Deve retornar 'allow', tier 1:
-- select hub.pdp_evaluate('deploy_status', '*');
--
-- -- Deve retornar 'require_approval', tier 2:
-- select hub.pdp_evaluate('github_commit', 'prod');
--
-- -- Deve retornar 'deny' (Tier 4 desativado):
-- select hub.pdp_evaluate('rm -rf /', 'prod');
--
-- -- Verifica cadeia de audit:
-- select * from hub.audit_verify_chain(50);
-- =====================================================================

-- FIM. Próximo: 003 cria o Approval Service RPC
-- (pedido, validação de hash+nonce, consumo de capability).
