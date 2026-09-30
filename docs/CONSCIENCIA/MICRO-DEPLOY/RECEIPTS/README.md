# Receipts de Micro Deploy

Esta pasta guarda receipts versionados de micro-deploys determinísticos.

Regra:

`QUALQUER_PASS_COMPROVADO → MICRO_DEPLOY_DO_ESCOPO_AFETADO → HEALTH/PROVA_RUNTIME → RECEIPT → NEXT_TIK_TAK`

Cada receipt deve separar:

- PASS comprovado;
- UNKNOWN/PENDING;
- falha separada;
- NEXT_CURSOR.

Nunca colocar segredo, token, senha ou credential material nesta pasta.
