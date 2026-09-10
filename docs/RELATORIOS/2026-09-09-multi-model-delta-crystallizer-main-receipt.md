# Receipt - Multi-Model Delta Crystallizer

MISSION_ID=MULTI_MODEL_DELTA_CRYSTALLIZER_20260909
REQUEST=cristalizar diferencas entre respostas/modelos como contrato da Casa
TARGET_BRANCH=main
BASE_MAIN_OBSERVED=5ea592457f156e4ea0fafedac10a41bee22714b5
FULL_MATERIALIZATION_COMMIT=e0c5292b8a8b22010e2b6dcd2df0870810ca26d0
SOURCE=CHEFE + tres capturas comparando respostas de chats/modelos

## Causa

Varios chats/modelos produziram respostas diferentes sobre o mesmo padrao operacional. A diferenca nao deve virar disputa de vencedor, nem soma de textos, nem troca de verdade. Deve virar algoritmo de reconciliacao: intersecao + delta sobrevivente + medicao + receipt.

## Correcao

Adicionado contrato e motor deterministico para cristalizar respostas paralelas sem escolher modelo como autoridade.

## Arquivos

- docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MULTI-MODEL-DELTA-CRYSTALLIZER.md
- scripts/lupa/multi-model-delta-crystallizer.mjs
- scripts/lupa/multi-model-delta-crystallizer.test.mjs
- docs/RELATORIOS/2026-09-09-multi-model-delta-crystallizer-main-receipt.md

## Prova local

```text
node --test /mnt/data/mmcrystal/multi-model-delta-crystallizer.test.mjs
1..4
# tests 4
# pass 4
# fail 0
```

## Hashes locais testados

```text
b413bd091eb33f27d659f018899b90806d07d0d46fa4f4e4ab7234456f69c91e  multi-model-delta-crystallizer.mjs
57319bdd399984b8d21affd2b4867323c23ca8adf60e0933a44e6aaef5ae0318  multi-model-delta-crystallizer.test.mjs
```

## Regras preservadas

```text
MODEL_IS_NOT_TRUTH
RESPONSE_IS_NOT_TRUTH
CONSENSUS_IS_NOT_FINAL_PROOF
PARALLEL_PERCEPTION_OK
MUTATION_SERIALIZED
UNKNOWN_IS_NOT_PASS
RECEIPT_REQUIRED
NEXT_CURSOR_REQUIRED
```

## Resultado

LOCAL_CONTRACT_TEST=PASS
FULL_MATERIALIZATION_COMMIT=e0c5292b8a8b22010e2b6dcd2df0870810ca26d0
CI_MAIN_FINAL=UNKNOWN

NEXT_CURSOR=ligar este crystallizer ao START_LINK/MetaLupa para resumir multiplas respostas de agentes em intersecao, delta util e contradicao mensuravel antes de promover canon.
