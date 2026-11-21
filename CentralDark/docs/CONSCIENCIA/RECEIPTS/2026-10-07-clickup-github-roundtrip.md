# ClickUp ↔ GitHub round-trip — 2026-10-07

CLICKUP_TASK=CU-86e3m6j7g
REPOSITORY=ServerVpss/CentralDark
BASE_MAIN=9bdf7d0abab7ca2acbce9c476a4bfb171228860c
BRANCH=chore/clickup-github-roundtrip-20261007

## Intenção

Provar a integração ClickUp ↔ GitHub sem alterar a main diretamente.

## Prova criada

- commit em branch isolada com o ID da tarefa ClickUp no commit;
- PR separado para inspeção;
- nenhuma mudança de runtime;
- nenhum segredo armazenado.

## Leitura correta

GITHUB_WRITE=PROVEN_ON_ISOLATED_BRANCH
CLICKUP_TASK_ID_IN_COMMIT=PROVEN
CLICKUP_ACTIVITY_INGESTION=UNKNOWN_UNTIL_READBACK
MAIN_MUTATION=false
RUNTIME_MUTATION=false

## Regra

ClickUp é superfície de coordenação e contexto. GitHub/main continua sendo a fonte verificável do código e dos artefatos.

NEXT_CURSOR=VERIFY_CLICKUP_READBACK
