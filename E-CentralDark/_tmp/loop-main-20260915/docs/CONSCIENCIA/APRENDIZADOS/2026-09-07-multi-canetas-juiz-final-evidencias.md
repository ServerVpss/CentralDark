# Evidências — multi-canetas, adapters, micro-passos e Judge

Este ledger pertence à PR #1447 e não cria novo owner. Ele aponta para provas já existentes e separa fato histórico de estado temporal.

## 1. Writer lease e handoff

Owner: `CENTRALDARK_AI_BOOT.yaml`

Prova declarada no owner canônico:

```text
writer_requires_shared_lease: true
one_writer_per_mutable_scope: true
readers_may_parallelize_perception: true
writer_handoff_requires:
  OLD_WRITER_RELEASE
  HANDOFF_RECEIPT
  NEW_WRITER_ACQUIRE
```

Também está definido que uma ativação recupera `LAST_GOOD_STATE_AND_NEXT_CURSOR`, mede Writer/trace, serializa mutação e registra receipt/cursor.

Classificação: `PROVADO_NO_REPO`.

## 2. Motores/adapters sob um core

Owner: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml`

Fatos:

```text
engine_is_owner: false
engines = grok_build | mistral_vibe | openai | claude_code | hermes | nous | other_models
resource_discovery inclui MCP, CENTRALDARK_API, GITHUB, TOOLS, MODELS, ADAPTERS
selection_policy: MINIMUM_SUFFICIENT_SET
one_system_only: true
one_writer_per_scope: true
reality_is_judge: true
```

No runtime plug, troca de adapter/runtime preserva `INTENT`, `STATE`, `EVIDENCE_REFS`, `WRITER_SCOPE`, `PROOF_TARGET`, `RECEIPT`, `NEXT_CURSOR`, `SPIRAL_CURSOR` e `UNRESOLVED_SET`.

Classificação: arquitetura/binding `PROVADO_NO_REPO`; invocação atual de cada adapter = `MEASURE_AT_RUNTIME`.

## 3. Passagem multi-caneta histórica já incorporada

Commit: `667603fbe1a2577e2845fbec847ee523756dacb4` (#733).

O commit registra Writers sucessivos com `Writer-Scope`, incluindo:

```text
GPT-5.6-Sol
GPT_CODEX_CONNECTOR
CLAUDE_SONNET_JUDGE
```

A mesma convergência contém trabalho no bridge HUB/MCP, dispatcher, schema, dist e gates. A `main` atual é descendente desse commit, então o fato histórico está preservado na linhagem.

Classificação: `HISTORICAL_PROVENANCE_ON_MAIN`.

Regra: não rerodar a história para provar que aconteceu; medir novamente somente claims temporais atuais.

## 4. Proof Ownership e Judge

Owner: `docs/CONSCIENCIA/PROOF-OWNERSHIP.json`

Regras relevantes:

```text
self_validation_without_independent_counterproof = UNPROVEN
circular_proof = UNPROVEN
historical_pass_is_current_pass = false
proof_target_must_match_claim = true
reality_judges_claims_not_people = true
```

A cadeia operacional exigida inclui `execution`, `observable_effect`, `proof_target`, `receipt`, `counterproof`, `live_state`, `judge` e `fixed_point_scope`.

Classificação: `CANONICAL_PROOF_CONTRACT`.

## 5. Micro-passos e rota visível

Owner/runtime: `scripts/trigger-fabric/centraldark_master_cycle.py`.

A guided telemetry já materializa:

```text
phase/status
visual_chain
failure exact phase
previous_failure
NEXT_CURSOR
unknown_is_pass = false
same_path_can_be_replayed_by_another_agent = true
telemetry_is_authority = false
telemetry_requires_external_proof_for_green = true
```

Classificação: `IMPLEMENTED_IN_REPO`.

Interpretação correta:

```text
VISIBLE_OPERATIONAL_TRACE != PRIVATE_CHAIN_OF_THOUGHT
```

## 6. Auréola baianês-bíblica

Owner: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AUREOLA-BAHIA-BIBLICA.yml`.

O contrato diz explicitamente que a Auréola é debugger de rota operacional, não raciocínio privado; referência bíblica, verso e metáfora não substituem prova; estado GitHub/runtime/CI exige evidência do alvo correspondente.

Classificação: contrato canônico presente; runtime da superfície = `UNKNOWN_UNTIL_SAME_HEAD_CI_AND_SURFACE_OBSERVATION` conforme o próprio owner.

## Veredito do levantamento

```text
MULTI_HANDS_ACROSS_SCOPES_OR_TIME = PROVED_IN_REPO
SAME_SCOPE_CONCURRENT_WRITERS = FORBIDDEN_BY_CURRENT_CANON
SAFE_WRITER_HANDOFF = CANONICAL
MULTI_ENGINE_SINGLE_CORE = CANONICAL
GITHUB_MCP_ADAPTERS_ARE_CAPABILITIES_NOT_AUTHORITY = CANONICAL
VISIBLE_MICROSTEP_TELEMETRY = IMPLEMENTED_IN_REPO
FINAL_CLAIM_CONSOLIDATION_BY_REALITY_JUDGE = CANONICAL
CURRENT_RUNTIME_INVOCATION_OF_EVERY_ADAPTER = UNKNOWN_UNLESS_MEASURED
```
