---
title: "Global Contract Entry — patched in child"
status: "PATCHED_AWAITING_T1"
owner: "meta-lupa"
---

# 👑🪬 Global Contract Entry — patch no CHILD

PR_MOTHER=#1562
CHILD_PR=#1597

## Commits

CONTRACT_COMMIT=85a151b3fa8baf01f81f8015ed070eac3d6b4978
CONSUMER_COMMIT=86ca2a5ff204afc15ccab9d4a9ad1d03b4bcffb3

## CONTRACT.yml

Novo bloco:
global_contract_entry_policy

Lei:
- contrato global obrigatório antes de mutação operacional;
- model/tool não pode bypass;
- mutação fora do contrato = FAIL_CLOSED;
- workaround paralelo para caso não coberto = FORBIDDEN;
- caso não coberto:
  FIND_EXISTING_OWNER
  → IDENTIFY_MINIMAL_CONTRACT_DELTA
  → PATCH_EXISTING_OWNER
  → REVALIDATE_GLOBAL_CONTRACT
  → CONTINUE_CURRENT_MISSION.

Abrangência explícita:
- ChatGPT
- Gemini
- Claude
- Grok
- current/future model adapters
- current/future agents
- current/future CLIs
- Hermes
- Pivete
- MCP workers
- new tab
- model change
- agent handoff

## Consumer

apps/modulos/HERMES-CORE/core/universal-method-contract.mjs

Agora requireTokens() exige a policy global e o self-test expõe:
- global_contract_entry_policy=true
- outside_contract_mutation_fail_closed=true
- uncovered_case_minimal_contract_delta=true

## Guardrails

NEW_GATE=false
NEW_WORKFLOW=false
NEW_ROUTER=false
NEW_KERNEL=false
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true

## Status

SOURCE_PATCHED=true
EXACT_HEAD_T1=UNKNOWN
NEGATIVE_COUNTERPROOF=UNKNOWN
SAME_HEAD_CI=UNKNOWN
PROMOTION=NOT_YET_ALLOWED

## NEXT_CURSOR

Remeasure #1597 current head; run exact-head universal-method self-test; then counterprove by removing one required policy token only in ephemeral worktree and require FAIL.
