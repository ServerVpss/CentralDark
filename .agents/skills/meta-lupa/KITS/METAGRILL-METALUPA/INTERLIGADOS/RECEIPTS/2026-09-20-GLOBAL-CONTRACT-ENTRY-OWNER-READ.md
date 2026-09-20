---
title: "Global Contract Entry — owner read"
status: "OBSERVED"
owner: "meta-lupa"
---

# 🪬 Global Contract Entry — leitura dos owners

PR_MOTHER=#1562
CHILD_PR=#1597

## CONTRACT.yml já possui

- ONE_SYSTEM_ONLY
- REUSE_BEFORE_CREATE
- ONE_OWNER_PER_CAPABILITY
- ONE_WRITER_PER_SCOPE
- PARALLELIZE_PERCEPTION
- SERIALIZE_MUTATION
- UNKNOWN_NEVER_PASS
- HISTORY_NE_CURRENT
- NO_NEW_WORKFLOW_WHEN_OWNER_EXISTS
- FAILURE_FLOW com FIND_OWNER + PATCH_EXISTING_OWNER + NEGATIVE_TEST
- MODEL_IMPORT_CONTRACT
- BOT_ENTRY obrigatório
- OPERATIONAL_AGENT_CONTRACT
- UNIFIED_ENTRY_PIPELINE
- SINGLE_COMMAND_PERSISTENT_CONTRACT
- DELTA_UTIL_CONTRACT

## Consumer executável já existe

apps/modulos/HERMES-CORE/core/universal-method-contract.mjs

Ele já referencia:
- CONTRACT.yml
- UNIVERSAL-ENGINE-METHOD.yml
- MASTER-CYCLE.yml
- ENGINE_BINDING.yml
- AUREOLA
- operational method
- HERMES prompt
- agent-call
- deploy guards

E já possui REQUIRED_GLOBAL_INHERITANCE.

## Lacuna mínima observada

A intenção nova do CHEFE ainda não está declarada como uma regra de entrada inequívoca com este significado:

ALL_OPERATIONAL_ACTORS_REQUIRE_GLOBAL_CONTRACT=true

ACTORS:
- ChatGPT
- Gemini
- Claude
- Grok/other model adapters
- CLI
- HERMES/PIVETE
- MCP-connected workers
- handoff/new tab/model change workers

Se um caso operacional não estiver coberto pelo contrato:
- não mutar fora do contrato;
- não criar workaround paralelo;
- encontrar owner existente;
- acrescentar delta mínimo ao owner/contrato;
- revalidar consumer/gates;
- continuar.

## Delta recomendado

Adicionar bloco explícito no CONTRACT.yml e fazer universal-method-contract.mjs exigir os tokens dessa lei.

NEW_SYSTEM=false.
NEW_ROUTER=false.
NEW_WORKFLOW=false.
EXTEND_EXISTING_OWNER=true.

## NEXT_CURSOR

Ler somente a validação/CLI/self-test do universal-method-contract.mjs para encaixar a menor verificação executável possível.
