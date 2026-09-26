# COMANDO - 002_hub_pdp_pep.sql
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\hub\db\migrations\002_hub_pdp_pep.sql
**SHA:** f05026f8b280c595
**Timestamp:** 2026-08-28T02:56:27.181267
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- --     Regra:    sem policy = DENY (Default-Deny)

### Ouro Bruto (primeiros 5000 chars)
```
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
  -- Hash da linha anterior (ou constante inicial se fo
```