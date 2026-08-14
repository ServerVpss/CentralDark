# CANÁRIO E2E — intenção autorizada → squash main

Data: 2026-08-14

Objetivo: provar ponta a ponta, em mudança segura e reversível, que o promotor canônico absorve uma intenção já autorizada e conclui o squash para `main` sem pedir nova confirmação ao SEGREDO/CHEFE.

```text
CANARY_ID=AUTONOMIA_AUTO_SQUASH_E2E_20260814
EXPECTED_MODE=FAST
EXPECTED_TARGET=main
EXPECTED_MERGE_METHOD=squash
EXPECTED_REASK=NO
EXPECTED_PARALLEL_PROMOTER=NO
```

Critério de PASS:

1. PR do mesmo repositório e autor confiável é reconhecido pelo recibo `Intent-Authorized`.
2. O motor canônico `.github/workflows/autonomia-promocao.yml` executa seus testes e avalia o PR.
3. Não existe conflito, `CHANGES_REQUESTED` ou achado de segurança no diff.
4. O próprio promotor conclui o squash merge.
5. O PR fecha como `merged=true` sem merge manual desta rodada.
6. O merge SHA vira alcançável em `main` e deixa recibo rastreável.

Este arquivo contém apenas o canário documental; nenhum secret, runtime ou configuração de produção é alterado.
