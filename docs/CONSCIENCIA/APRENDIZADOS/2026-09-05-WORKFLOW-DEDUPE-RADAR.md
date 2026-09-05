# 2026-09-05 — Workflow Dedupe Radar / Compressão sem regressão

📜 **“Ajunta os pedaços que sobraram, para que nada se perca.”**

## Intenção

Reduzir duplicação de função, step, job e workflow sem confundir paralelismo legítimo com código repetido.

A Casa já usa amplamente o mesmo pool `runs-on: [self-hosted, Linux]`. Isso **não é duplicação por si só**: vários jobs diferentes podem e devem usar o mesmo pool em paralelo.

## Lei

```text
MESMO_RUNNER + LOGICA_DIFERENTE
→ INTENTIONAL_PARALLEL

MESMA_LOGICA + MESMO_CONTRATO
→ REUSE_CANDIDATE

MESMO_JOB_VARIANDO_SO_ENTRADA
→ MATRIX_CANDIDATE

MESMO_STEP_REPETIDO
→ COMPOSITE_ACTION_OR_SCRIPT_CANDIDATE

MESMO_WORKFLOW_PARAMETRIZAVEL
→ WORKFLOW_CALL_CANDIDATE
```

## Ordem de reuso

1. usar script/action owner já existente;
2. usar reusable workflow existente;
3. converter diferenças de dados em matrix;
4. criar composite action quando a repetição for um bloco de steps;
5. criar `workflow_call` quando o owner natural for um job/workflow inteiro;
6. criar código novo só por último.

## Radar determinístico

Owner:

`scripts/ci/workflow_dedupe_radar.py`

Ele mede:

- quantidade de workflows;
- quantidade de jobs;
- presença de `workflow_call`;
- jobs com fingerprint idêntico;
- blocos de steps repetidos;
- uso de pools `runs-on`;
- candidatos de reuso.

O radar **não refatora sozinho**. Isso evita uma compressão automática apagar fronteiras de segurança.

## Registry

Owner:

`.github/workflow-reuse-registry.json`

Ele separa:

- pool compartilhado;
- paralelismo intencional;
- candidatos de extração;
- ordem de escolha do mecanismo de reuso.

## Primeiro minério encontrado

O step:

`Bloquear HEAD de fork no runner persistente`

aparece em múltiplos workflows. Isso é candidato real de reuso, porém não deve ser extraído cegamente: em runner persistente, a posição do guard em relação ao checkout é parte da segurança.

Por isso:

`REPEATED != SAFE_TO_EXTRACT`

Primeiro provar equivalência semântica; depois escolher owner.

## Política de leveza

```text
REUSE_BEFORE_CREATE=true
AUTO_REFACTOR=false
DUPLICATE_EXACT_JOB=REUSE_CANDIDATE
DUPLICATE_STEP=REUSE_CANDIDATE
RUNNER_POOL_REUSE=ALLOWED
PARALLEL_EXECUTION=ALLOWED
ONE_MUTABLE_OWNER_PER_SCOPE=true
UNKNOWN_IS_NOT_PASS=true
```

## Próximo cursor

1. rodar o radar no HEAD do PR;
2. ordenar candidatos por repetição × tamanho;
3. começar pelo maior bloco cuja extração não reduza segurança;
4. comparar bytes/linhas antes/depois;
5. rodar same-head CI;
6. só então marcar `COMPRESSION_PROVEN=PASS`.
