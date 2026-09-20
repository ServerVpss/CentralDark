---
title: "Global Contract Entry — executable binding plan"
status: "PROVEN_OWNER_PATH"
owner: "meta-lupa"
---

# 👑🪬 Global Contract Entry — binding executável

PR_MOTHER=#1562
CHILD_PR=#1597

## Consumer executável confirmado

apps/modulos/HERMES-CORE/core/universal-method-contract.mjs

O consumer:
- lê CONTRACT.yml;
- usa requireTokens();
- falha fechado quando token obrigatório não existe;
- valida ENGINE_BINDING;
- valida agent-call global gate;
- valida deploy entry/exit gates;
- valida HERMES prompt;
- emite UNIVERSAL_ENGINE_METHOD_SELF_TEST=PASS/FAIL.

## Binding mínimo

No CONTRACT.yml:
global_contract_entry_policy:
  applies_to:
    - CHATGPT
    - GEMINI
    - CLAUDE
    - GROK
    - MODEL_ADAPTERS
    - CLI
    - HERMES
    - PIVETE
    - MCP_WORKERS
    - NEW_TAB
    - MODEL_CHANGE
    - AGENT_HANDOFF
  contract_required_before_operational_mutation: true
  model_or_tool_may_bypass_contract: false
  outside_contract_mutation: FAIL_CLOSED
  parallel_workaround_for_uncovered_case: FORBIDDEN
  uncovered_case_flow:
    - FIND_EXISTING_OWNER
    - IDENTIFY_MINIMAL_CONTRACT_DELTA
    - PATCH_EXISTING_OWNER
    - REVALIDATE_GLOBAL_CONTRACT
    - CONTINUE_CURRENT_MISSION

No universal-method-contract.mjs:
- requireTokens() precisa exigir a policy acima;
- self-test deve expor global_contract_entry_policy=true.

## Veredito

NEW_GATE=false.
NEW_WORKFLOW=false.
NEW_ROUTER=false.
EXISTING_CONSUMER_EXTENDED=true.

Essa é a menor implementação que transforma a intenção do CHEFE em fail-closed verificável para qualquer engine/worker que consuma o método global.

## NEXT_CURSOR

Remeasure #1597 HEAD; aplicar os dois patches sequencialmente no mesmo branch; executar self-test no exact head; contraprovar removendo/alterando token somente em worktree efêmero.
