# Receipt — Auto-Ingestão Delta Útil

Data: 2026-09-15
Base medida: `fa08d79a42789c3940e7b29175cb39f07073a41f`
Origem: `DELTAUNIFICADOCENTRALDARK.md` no Google Drive + pedido do CHEFE nesta sessão.

## Escopo

- Cristalizar ingestão autônoma no owner existente `MATERIAL-INGEST.md`.
- Adicionar contrato complementar `AUTO-INGESTAO-DELTA-UTIL.md`.
- Adicionar gate executável `verify_auto_ingestao_delta_util.py`.
- Permitir até 50 frentes leitoras por lado para evidência, lineage, dedupe e contraprova.
- Manter um writer por escopo de conflito.

## Provas locais

```text
AUTO_INGESTAO_DELTA_UTIL=PASS readers_max_per_side=50 one_writer=true provenance_required=true no_second_brain=true
HUD_STATUS_UNIVERSAL=PASS human_first=TRUE technical_preserved=TRUE unknown_not_pass=TRUE
FORJA_VIVA_ARTIFACT_GATE=PASS
REPO_CONTRACT_VERIFY=PASS
git diff --check=PASS
```
## Invariantes

```text
MODEL_OUTPUT_IS_NOT_USER_INPUT=true
TOOL_OUTPUT_IS_NOT_USER_INPUT=true
INGESTION_DOES_NOT_GRANT_AUTHORITY=true
INGESTION_DOES_NOT_PROVE_RUNTIME=true
CRYSTAL_REQUIRES_OWNER_CONSUMER_TEST_GATE=true
UNKNOWN_IS_PASS=false
MIRROR != SOURCE_OF_TRUTH
PERSISTENCE != PROMOTION
```

## Julgamento

Este delta deixa o sistema pronto para ingerir automaticamente matéria necessária com provenance e rastro. Ele não declara runtime vivo, não cola segredo, não cria segundo cérebro e não transforma Drive mirror em main.
