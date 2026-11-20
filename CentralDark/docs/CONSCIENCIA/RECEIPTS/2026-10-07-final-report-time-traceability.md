# 💎 Receipt — final_report com tempo humano + âncora UTC

RECEIPT_ID=FINAL_REPORT_TIME_TRACEABILITY_2026_10_07
OWNER=central-horario
RECIPE=central-horario.finalReportTimeHeader
STATUS=PASS
CURRENT_HEAD_AT_PROOF=7951a0dbfe7432efe0ae444e4a1f2106d97be716

## Intenção

Todo `final_report` humano deve carregar o mesmo instante em duas projeções:

- `Date: DD/MM/AAAA HH:mm:ss BRT`
- `Date-UTC: UTC_RFC3339`

A primeira é leitura humana em `America/Sao_Paulo`; a segunda é correlação, ordenação e auditoria de máquina.

## Receita executável

`central-horario/node.cjs` expõe:

- `formatFinalReportBrasilia(value)`
- `finalReportTimeFields(value)`
- `finalReportTimeHeader(value)`

`central-horario/node.mjs` reexporta a mesma receita.

Exemplo de efeito esperado:

```text
Date: 07/10/2026 00:41:29 BRT
Date-UTC: 2026-10-07T03:41:29.000Z
```

Os dois campos MUST derivar do mesmo `Date`/instante.

## Invariantes

FINAL_REPORT_TIME_FIELDS_REQUIRED=true
FINAL_REPORT_DATE_FIELD=DD/MM/AAAA HH:mm:ss BRT
FINAL_REPORT_DATE_UTC_FIELD=UTC_RFC3339
FINAL_REPORT_DATE_ONLY_IS_INSUFFICIENT=true
SAME_INSTANT_BOTH_FIELDS=true
HUMAN_TIMEZONE=America/Sao_Paulo
MACHINE_TIMEZONE=UTC
REPLAY_BEFORE_REDISCOVERY=true
ONE_TIME_SYSTEM_ONLY=true

## Fingerprint

OWNER_FILES=
- central-horario/node.cjs
- central-horario/node.mjs
- central-horario/self-test.mjs
- central-horario/README.md
- scripts/trigger-fabric/verify_repo_contract.py

FINGERPRINT_HEAD=7951a0dbfe7432efe0ae444e4a1f2106d97be716
SELF_TEST_MARKER=FINAL_REPORT_TIME_RECIPE=PASS
CONTRACT_MARKER=REPO_CONTRACT_VERIFY=PASS

## Prova

Em worktree isolado de `origin/main@7951a0dbfe7432efe0ae444e4a1f2106d97be716`:

- `node central-horario/self-test.mjs` → PASS
- `FINAL_REPORT_TIME_RECIPE=PASS`
- `TIME_FIXED_POINT_SELF_TEST=PASS`
- `python scripts/trigger-fabric/verify_repo_contract.py .` → `REPO_CONTRACT_VERIFY=PASS`

## Contraprova

- Não altera `formatBrasilia()` global: evita regressão em consumidores legados.
- O formatter específico de `final_report` monta `DD/MM/AAAA HH:mm:ss BRT` por `formatToParts`, sem depender de vírgula/localização incidental do runtime.
- `Date` e `Date-UTC` usam o mesmo objeto `Date`; duas leituras independentes do relógio são proibidas.

## Replay

1. Importar `finalReportTimeHeader` ou `finalReportTimeFields` do owner `central-horario`.
2. Gerar ambos os campos a partir do mesmo instante.
3. Renderizar `Date` humano primeiro e `Date-UTC` como âncora técnica.
4. Rodar `node central-horario/self-test.mjs`.
5. Rodar o gate de contrato aplicável.
6. Se fingerprint mudou, revalidar somente o cone afetado.

EXPECTED_EFFECT=FINAL_REPORT_HUMAN_AND_MACHINE_TIME_TRACEABLE
NEXT_CURSOR=REUSE_FINAL_REPORT_TIME_RECIPE_ON_EVERY_HUMAN_REPORT
