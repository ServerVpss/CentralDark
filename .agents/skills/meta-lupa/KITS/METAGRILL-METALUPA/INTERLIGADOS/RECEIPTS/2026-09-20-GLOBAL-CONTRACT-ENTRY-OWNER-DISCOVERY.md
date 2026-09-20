---
title: "Global Contract Entry — owner discovery"
status: "OBSERVED"
owner: "meta-lupa"
---

# 👑🪬 Global Contract Entry — owners encontrados

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Intenção do CHEFE

Todo agente/modelo/CLI/executor da CentralDark deve operar pelo mesmo contrato global.

Se um caso não estiver coberto:
- não criar rota paralela;
- localizar owner;
- acrescentar delta mínimo ao contrato;
- medir;
- contraprovar;
- avançar.

## Busca material

Owners encontrados:

- CENTRALDARK_AI_BOOT.yaml
- docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml
- docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml
- docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml
- .agents/skills/centraldark-operational-method/SKILL.md
- apps/modulos/HERMES-CORE/core/universal-method-contract.mjs

O consumer executável do HERMES já referencia:
- operationalMethod
- contract
- triggers
- master
- engine
- aureola

## Veredito

NEW_GLOBAL_CONTRACT=false.
NEW_ROUTER=false.
NEW_KERNEL=false.
NEW_CONTROL_PLANE=false.

EXTEND_EXISTING_GLOBAL_CONTRACT=true.
ONE_SYSTEM_ONLY=true.
REUSE_BEFORE_CREATE=true.

## Delta útil proposto

GLOBAL_CONTRACT_ENTRY_REQUIRED=true.

Qualquer worker/model/CLI/executor:
1. carrega o contrato global;
2. valida herança/owners;
3. se o pedido não estiver coberto, falha fechado para mutação;
4. identifica owner existente;
5. adiciona somente o delta mínimo necessário ao contrato/owner;
6. reexecuta gates;
7. só então continua.

OUTSIDE_GLOBAL_CONTRACT_CANNOT_MUTATE=true.
UNSUPPORTED_CASE_REQUIRES_MINIMAL_CONTRACT_DELTA=true.
NO_PARALLEL_WORKAROUND=true.

## NEXT_CURSOR

Ler CONTRACT.yml + universal-method-contract.mjs + boot/master/engine atuais e encaixar o menor delta executável.
