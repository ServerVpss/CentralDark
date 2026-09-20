---
title: "HUB PostgREST 403 — regressão runtime pós-fix"
status: "REGRESSION_OBSERVED"
date: 2026-09-19
owner: "apps/modulos/mcp/src/hub-mission-consumer.js"
pr: 1580
source_sha256: "8d5557a84e8fc963d301fb6b74c14f6bc7ff8ac18b8263cd2471ca113ed20d81"
source_bytes: 16470
source_lines: 71
---

# HUB PostgREST 403 — regressão runtime pós-fix

## Intenção

Cristalizar evidência runtime posterior à prova anterior do PR #1580 sem fabricar causa e sem abrir segundo consumer, schema, fila ou arquitetura.

```text
CURRENT > HISTORY
RUNTIME_LOG > PREVIOUS_CLEAN_WINDOW_FOR_CURRENT_CLAIM
SOURCE_PRESENT != RUNTIME_ACTIVE
TEST_PASS != DEPLOYMENT_PROOF
UNKNOWN != PASS
REALITY = JUDGE
```

## Evidência observada

Fonte recebida em 2026-09-19, SHA-256:

```text
8d5557a84e8fc963d301fb6b74c14f6bc7ff8ac18b8263cd2471ca113ed20d81
bytes=16470
lines=71
```

Janela observada no arquivo:

```text
05:14:02 → 06:24:05
workerId=centraldark-mcp-373463
event=hub_mission_consumer_error
HTTP=403
database_code=42501
message=permission denied for view hub_missions
cadence≈1 minuto
```

A repetição contínua invalida qualquer claim de `POST_FIX_WORKER_70S=clean` como estado CURRENT. A prova anterior continua histórica e válida para aquela janela, mas não para esta nova janela.

## Relação com o source do PR #1580

No HEAD pré-cristal desta observação, o consumer candidato já contém:

```text
Accept-Profile: public
Content-Profile: public para mutações
HUB_SUPABASE_PROJECT_REF
project mismatch fail-closed
```

O teste candidato também exige explicitamente o profile `public`.

Portanto:

```text
SOURCE_CONTRACT_PRESENT=PROVEN
RUNTIME_USING_THAT_SOURCE=UNKNOWN
RUNTIME_CONFIG_MATCH=UNKNOWN
RUNTIME_PROCESS_REVISION=UNKNOWN
POSTGREST_PROFILE_EFFECTIVE_AT_RUNTIME=UNKNOWN
DATABASE_GRANTS_CURRENT=UNKNOWN
ROOT_CAUSE=UNKNOWN
```

## Hipóteses discriminantes — nenhuma promovida a fato

1. processo runtime está executando build/revisão anterior;
2. reinício/deploy restaurou artefato stale;
3. profile efetivo no runtime não é `public`;
4. URL/project/key atuais diferem da janela limpa anterior;
5. permissões/grants do alvo mudaram;
6. outro caminho de código/worker não usa o helper `rest()` candidato.

```text
HYPOTHESIS != CAUSE
CORRELATION != CAUSATION
```

## Próximo cursor

```text
MEASURE_RUNTIME_PID_AND_START_TIME
→ MEASURE_RUNTIME_GIT_HEAD / BUILD_FINGERPRINT
→ INSPECT_EFFECTIVE_ENV_NAMES_WITHOUT_SECRET_VALUES
→ PROVE_EFFECTIVE_ACCEPT_PROFILE
→ DIRECT_POSTGREST_COUNTERPROOF_SAME_PROJECT
→ COMPARE_PROCESS_SOURCE_HASH_WITH_PR_HEAD
→ RESTART_ONLY_IF_EXPLICITLY_AUTHORIZED
→ OBSERVE >= 2 POLL WINDOWS
→ REMEASURE health/deep + lastError
→ SAME_HEAD_CI
→ RECEIPT
```

## Veredito

```text
REGRESSION_OBSERVED=PROVEN
SOURCE_FIX_PRESENT=PROVEN
ROOT_CAUSE_CURRENT=UNKNOWN
RUNTIME_FIXED_CURRENT=NOT_PROVEN
GLOBAL_FIXED_POINT=NOT_PROVEN
```
