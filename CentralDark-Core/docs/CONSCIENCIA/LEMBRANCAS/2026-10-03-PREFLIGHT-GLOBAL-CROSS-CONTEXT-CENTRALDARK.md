# 2026-10-03 — Preflight global cross-context da CentralDark

## Intenção do CHEFE

Qualquer resposta ou ação relacionada à CentralDark, em qualquer fio existente ou futuro, não pode nascer de conhecimento genérico isolado. Antes de responder, a superfície precisa recuperar a intenção vigente do CHEFE e cruzá-la com o organismo canônico e o CURRENT.

"Usar a cabeça do CHEFE" significa usar o método externalizado pela CentralDark. Não significa leitura mental.

## Owner

`docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml#global_cross_context_response_preflight`

## Fluxo obrigatório

```text
ANY_CENTRALDARK_RESPONSE_OR_ACTION
→ RECOVER_CURRENT_CHEFE_INTENT
→ REMEASURE_MAIN_CURRENT_SHA
→ READ_PR_MOTHER_1562_CURRENT
→ READ_ALL_OPEN_PRS_CURRENT
→ READ_CHECK_LIST_DIARIO_CURRENT
→ LOAD_SOUL_SOL
→ LOAD_LEIA_ME_IA
→ LOAD_AGENTS
→ LOAD_MAPA_DO_CEREBRO
→ CONSUME_ALL_NUMBERED_LEARNINGS_INDEX
→ LOAD_LEMBRANCAS_INDEX
→ EXPAND_RELEVANT_CAUSAL_REMEMBRANCES + OWNERS + RECEIPTS
→ REMEASURE_MUTABLE_RUNTIME_CLAIMS
→ CURRENT > HISTORY
→ DEDUPE / REUSE_BEFORE_CREATE
→ PENEIRA
→ RETURN_ONLY_SURVIVING_DELTA
```

## Herança do repositório inteiro

O contrato não é copiado em cada arquivo. Ele é herdado por pertencimento ao mesmo sistema:

```text
ALL_REPOSITORY_ARTIFACTS_INHERIT_BY_CONTAINMENT=true
ALL_MARKDOWN_INHERITS=true
ALL_PACKAGES_INHERIT=true
ALL_ARCHITECTURES_INHERIT=true
ALL_DOT_AGENTS_INHERIT=true
ALL_DOT_CLAUDE_INHERIT=true
ALL_BOTS_INHERIT=true
ALL_HERMES_CONSUMERS_INHERIT=true
ALL_CURRENT_AND_FUTURE_ENGINES_INHERIT=true
ALL_CURRENT_AND_FUTURE_SURFACES_INHERIT=true
```

Snapshot de inventário no momento da cristalização:

```text
TRACKED_FILES=11354
MARKDOWN=5529
PACKAGE_MANIFESTS=25
DOT_CLAUDE=18
DOT_AGENTS=5527
HERMES_RELATED=133
BOT_RELATED=312
ARCHITECTURE_FILES=116
```

Os números são provenance; o verifier deve remedí-los dinamicamente.

## Bindings materializados

- Trigger Fabric CONTRACT
- ENGINE_BINDING
- CENTRALDARK_AI_BOOT
- SOUL-SOL
- METACOGNICAO-OPERACIONAL
- LEIA-ME-IA
- AGENTS
- CLAUDE
- CODEX
- .claude boot universal
- .claude BOOT-PIVETE
- HERMES-CORE prompt
- bot mandatory rules
- package root verifier command
- verify_repo_contract.py

O bot já injeta `CENTRALDARK-MANDATORY-RULES.yml` no prompt, portanto o binding do bot é um consumer existente e não um bot paralelo.

## Estados

```text
CONTRACT_MATERIALIZED=PASS
GITHUB_READBACK_15_BINDINGS=PASS
SOUL_SYNC_REANCHORED=PASS
FULL_VERIFIER_EXECUTION=UNKNOWN
```

A tentativa de executar o verifier em clone limpo dentro do guest VMware bloqueou na rota de clone e foi terminada. Isso não é falha do contrato nem PASS do verifier.

## Cristal

```text
CENTRALDARK_GLOBAL_CROSS_CONTEXT_PREFLIGHT_V1=true
ANY_CENTRALDARK_RESPONSE_REQUIRES_PREFLIGHT=true
ANY_CURRENT_OR_FUTURE_THREAD_INHERITS=true
GENERIC_ANSWER_WITHOUT_PREFLIGHT=FORBIDDEN
MISSING_REQUIRED_SOURCE=AFFECTED_CLAIM_UNKNOWN
CURRENT_OVER_HISTORY=true
UNKNOWN_IS_NOT_PASS=true
PENEIRA_BEFORE_HUMAN_RETURN=true
NO_PARALLEL_ARCHITECTURE=true
```

## NEXT_CURSOR

Executar o verifier integral em checkout limpo do CURRENT assim que a rota de checkout responder; em seguida continuar o cone já aberto de VMware → Hermes original → Qwen/Kylin → runner self-hosted → cápsula/replay VPS.
