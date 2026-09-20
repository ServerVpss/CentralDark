# 👑🪬 GARIMPO-CHEFE — Limpeza 1 comprovada

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
TARGET=E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE

## Ação

Remoção limitada a:
1. diretórios candidatos com zero arquivos;
2. arquivos SHA-256 idênticos quando o removido era cópia inequívoca com sufixo (N).

## Resultado

REMOVED_EMPTY_DIRS=37
REMOVED_DUP_FILES=8
FREED_BY_DUP_FILES=183759958
FREE_BEFORE=202601365504
FREE_AFTER=202785337344
FREE_DELTA=183971840

≈ 175.45 MiB efetivamente liberados.

## Duplicatas removidas

- centraldark-capability-bundle-v1 (1).zip
- CentralDark-Capability-Cristal-20260913-OMNI-INGEST-DETERMINISTIC-HARDENED (1).zip
- CentralDark-Unified-OneShot (2).zip
- deep-research-report (3).md
- devtools... (1).md
- devtools... (2).md
- INICIAR-CENTRALDARK-REMOTE (1).cmd
- tool-call-data (6).json

Uma cópia exata de cada conteúdo foi preservada.

## Guardrails

NO_SECRET_CONTENT_READ=true
NO_NONEMPTY_UNPROVED_DIRECTORY_DELETED=true
NO_SEMANTICALLY_DIFFERENT_NAME_AUTODELETE=true
ZERO_FORCE=true

## NEXT_CURSOR

Minerar cache + .extracted_* não vazios + Compressed; mapear origem/arquivo e reprodutibilidade antes de nova limpeza.
