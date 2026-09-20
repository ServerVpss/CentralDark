# 👑🪬 GARIMPO-CHEFE — CRC das extrações

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Método

Para cada .extracted_* com ZIP de origem:
- enumerar arquivos extraídos;
- localizar entrada equivalente no ZIP;
- comparar tamanho;
- comparar CRC32;
- somente ALL_EXTRACTED_REPRODUCIBLE=true autoriza remoção.

## PASS

13 árvores passaram integralmente:
- .extracted_.cache
- .extracted_54756577-glitch-logo-ShareAE.com
- .extracted_CENTRALDARK-LIVING-LEARNING-OS-CRYSTALLIZED-PACK-20260823
- .extracted_CENTRALDARK_MEGA_HANDOFF_RUNTIME_2026-08-29
- .extracted_CentralDark-ONE-FLOW-PLUGKIT-20260823
- .extracted_CentralDark_Deploy_Package_2026-08-20
- .extracted_CentralDark_Fluxo_Bidirecional_Auditoria_RECUPERADO_2026-08-24
- .extracted_agi-self-improvement-main
- .extracted_aiox-core
- .extracted_danda
- .extracted_manual-oculto-ia-curso-main
- .extracted_meteor-decomp-develop
- .extracted_wo-mic-5-2

RECLAIMABLE_BYTES=611449878
RECLAIMABLE_MIB≈583.12

## NÃO PASSARAM

- .extracted_PERMITO SEGREDO:
  matched=1, unmatched=1, ALL_EXTRACTED_REPRODUCIBLE=false.
- .extracted_CADEADO TRANCADO SO COM PERMITO SEGREDO:
  NO_ZIP_ORIGIN.
- .extracted_screenpipe-main.zip:
  NO_ZIP_ORIGIN.

## Veredito

DELETE_13_REPRODUCIBLE_EXTRACTED_DIRS=AUTHORIZED.
DELETE_3_UNPROVED_DIRS=FORBIDDEN.

## NEXT_CURSOR

Remover somente os 13 PASS → medir espaço → continuar cache/Compressed.
