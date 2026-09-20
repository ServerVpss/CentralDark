# 👑🪬 GARIMPO-CHEFE — duplicatas exatas SHA-256

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
TARGET=E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE

## Hash direcionado

HASH_CANDIDATE_FILES=39
SIZE_GROUPS=18
DUP_HASH_GROUPS=13
TOTAL_RECLAIMABLE_BYTES=183890359
TOTAL_RECLAIMABLE_MB=175.37

## Grupos grandes provados

- CentralDark-Capability-Cristal-20260913-OMNI-INGEST-DETERMINISTIC-HARDENED.zip
  == ... (1).zip
  SHA256=EE70D1...E4B36
  128,988,624 bytes cada.

- CentralDark-Unified-OneShot (1).zip
  == CentralDark-Unified-OneShot (2).zip
  SHA256=80C727...68592
  50,993,001 bytes cada.

- centraldark-capability-bundle-v1.zip
  == centraldark-capability-bundle-v1 (1).zip
  SHA256=B1B0EB...DDFAE
  3,351,585 bytes cada.

Outros grupos exatos incluem tool-call-data, SEGREDO.txt, devtools*.md, deep-research-report, scripts e READMEs.

## Política de limpeza

AUTO_DELETE_SAFE:
- exact duplicate;
- suffix inequívoco de cópia: (1), (2), etc.;
- uma cópia preservada.

DEFER:
- nomes semanticamente distintos, mesmo com hash igual;
- scripts/readmes que podem ser referenciados por nome;
- secrets;
- non-empty extracted folders ainda sem prova de reprodutibilidade.

## Próxima mutação autorizada

1. Remover 37 diretórios vazios.
2. Remover somente duplicatas exatas com copy-suffix inequívoco.
3. Medir bytes reais liberados.
4. Zero force/zero blind delete.

## NEXT_CURSOR

Limpeza mínima → verificação → continuar mineração de cache/.extracted não-vazio.
