# Receipt — Hermes delegated path + Screenpipe CLI no metabolismo CentralDark

Data: 2026-10-06
Claim: CENTRALDARK_METABOLISM_CATALOG_EXTENSION_2026_10_06
PR_MOTHER_CURRENT=#1757
Related PR=#1748

```text
HERMES_DELEGATED_COMMIT_PATH=PASS_ON_PR1748
HERMES_COMMIT=c893a949b3051ae8a96cc4bc8b910857534c55e7
HERMES_COMMIT_MESSAGE=test(hermes): prove delegated commit path
HERMES_PROOF_FILE=experiments/aionui-centraldark-instinto-superior/HERMES-DELEGATION-SMOKE-2026-10-06.md
ENGINE_USED=copilot/gpt-4.1
MODEL_IS_ENGINE_NOT_OWNER=true
ONE_WRITER_PER_SCOPE=true
SCREENPIPE_CLI_RECORDER=CATALOGED_RECIPE
SCREENPIPE_RUNTIME_ON_VPS=UNKNOWN_UNTIL_STATUS_JSON
DESKTOP_COMMANDER_REMOTE_ON_VPS=PASS_CURRENT_MEASUREMENT
```

## Entrada para o catálogo do metabolismo

- `HERMES_DELEGATED_COMMIT_PATH`: capacidade de delegação real do Hermes executor para criar arquivo, validar diff, commitar, dar push e deixar receita verificável.
- `SCREENPIPE_CLI_RECORDER`: rota de instalação/operação CLI-only do Screenpipe, com recorder-first service, status JSON, search local, pipes e regra de não inferir captura por PID/porta.

## Prova externa já medida

O commit `c893a949b3051ae8a96cc4bc8b910857534c55e7` existe no GitHub, criou apenas `HERMES-DELEGATION-SMOKE-2026-10-06.md`, e o próprio arquivo contém a receita de replay `bind PR head → clean worktree → Hermes tool call → one-file delta → git diff --check → commit → push → GitHub readback`.

## Screenpipe CLI — regra incorporada

A skill oficial exige executar comandos a partir de tempdir limpo, preservando `${SCREENPIPE_CLI:-bun x screenpipe@latest}`; `service install` é recorder mode por padrão; `status --json` é a prova preferida; `running:true` prova API, não captura; freshness de screen/audio precisa ser verificada antes de PASS.

## Fronteira

Não promover `SCREENPIPE_RUNTIME=PASS` sem `screenpipe status --json` ou health equivalente provando freshness. Não promover `HERMES+KYLIN_CURRENT=PASS` a partir do teste `c893a949`, porque o engine medido foi `copilot/gpt-4.1`.

## NEXT_CURSOR

`UPDATE_MCP_CATALOG → ROUTECOUNT_13 → VERIFIER → RUNTIME_READBACK → SCREENPIPE_STATUS_JSON → REPLAY_C893_WITH_KYLIN_CURRENT`
