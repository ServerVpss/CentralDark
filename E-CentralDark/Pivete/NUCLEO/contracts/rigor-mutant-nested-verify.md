# CONTRATO - rigor-mutant-nested-verify.json
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\rigor-mutant-nested-verify.json
**SHA:** 309d10a0887b7323
**Timestamp:** 2026-08-26T19:10:23.613719
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- "delta": "QA_CONTEXT_DELTA=\n\nEVENTO=TEST_FAILED\nMANIFEST_HASH=57c6274bb168a416f7744a8796d60ccd704a7fcfec79f50c26fd8beb391a9518\n\nSTATUS=OK\nHEURISTICAS_ATIVADAS=\n- FAILURE\n\nDOCUMENTOS_CONSULTAD

### Ouro Bruto (primeiros 5000 chars)
```
{
  "status": "PASS",
  "manifest": {
    "count": 17,
    "hash": "57c6274bb168a416f7744a8796d60ccd704a7fcfec79f50c26fd8beb391a9518",
    "selfMap": {
      "totalMarkdownDetected": 23,
      "indexedUniquePaths": 15,
      "missing": [],
      "status": "SYNCED",
      "applied": 0
    }
  },
  "nodeCheck": {
    "total": 16,
    "fail": []
  },
  "shellSyntax": {
    "applicable": true,
    "total": 4,
    "fail": []
  },
  "tests": {
    "exitCode": 0,
    "summary": {
      "total": 53,
      "pass": 53,
      "fail": 0,
      "skipped": 0,
      "cancelled": 0,
      "todo": 0
    },
    "output": "TAP version 13\n# Subtest: consulta seletiva — progressive disclosure real\n    # Subtest: carrega no máximo 3 documentos únicos\n    ok 1 - carrega no máximo 3 documentos únicos\n      ---\n      duration_ms: 68.412999\n      type: 'test'\n      ...\n    # Subtest: retorna janela relevante e limitada\n    ok 2 - retorna janela relevante e limitada\n      ---\n      duration_ms: 23.299335\n      type: 'test'\n      ...\n    # Subtest: path traversal é bloqueado sem ler arquivo externo\n    ok 3 - path traversal é bloqueado sem ler arquivo externo\n      ---\n      duration_ms: 0.992493\n      type: 'test'\n      ...\n    # Subtest: falha de leitura não vira STATUS=OK\n    ok 4 - falha de leitura não vira STATUS=OK\n      ---\n      duration_ms: 2.079429\n      type: 'test'\n      ...\n    # Subtest: ausência de match retorna INCONCLUSIVO\n    ok 5 - ausência de match retorna INCONCLUSIVO\n      ---\n      duration_ms: 18.523559\n      type: 'test'\n      ...\n    # Subtest: sanitizador preserva o nome do campo e remove o valor\n    ok 6 - sanitizador preserva o nome do campo e remove o valor\n      ---\n      duration_ms: 1.491125\n      type: 'test'\n      ...\n    # Subtest: delta não expõe segredo trazido no erro\n    ok 7 - delta não expõe segredo trazido no erro\n      ---\n      duration_ms: 30.254702\n      type: 'test'\n      ...\n    1..7\nok 1 - consulta seletiva — progressive disclosure real\n  ---\n  duration_ms: 148.663356\n  type: 'suite'\n  ...\n# Subtest: GAP-001 missão ausente não inventa preservação\n    # Subtest: sem mission.id/state/nextState → PRESERVADA=NAO e PROXIMO_ESTADO=INALTERADO\n    ok 1 - sem mission.id/state/nextState → PRESERVADA=NAO e PROXIMO_ESTADO=INALTERADO\n      ---\n      duration_ms: 53.623755\n      type: 'test'\n      ...\n    1..1\nok 2 - GAP-001 missão ausente não inventa preservação\n  ---\n  duration_ms: 56.89462\n  type: 'suite'\n  ...\n# Subtest: GAP-002 isZero não aceita SIM\n    # Subtest: FAIL/SKIPPED/UNKNOWN/ARQUIVOS=SIM bloqueia AUTO_APPLY\n    ok 1 - FAIL/SKIPPED/UNKNOWN/ARQUIVOS=SIM bloqueia AUTO_APPLY\n      ---\n      duration_ms: 2.798215\n      type: 'test'\n      ...\n    # Subtest: contadores numéricos 0 liberam quando resto completo\n    ok 2 - contadores numéricos 0 liberam quando resto completo\n      ---\n      duration_ms: 1.251573\n      type: 'test'\n      ...\n    1..2\nok 3 - GAP-002 isZero não aceita SIM\n  ---\n  duration_ms: 4.910005\n  type: 'suite'\n  ...\n# Subtest: GAP-007 injeção no receipt\n    # Subtest: singleLineField remove quebras e neutraliza KEY=VALUE\n    ok 1 - singleLineField remove quebras e neutraliza KEY=VALUE\n      ---\n      duration_ms: 0.84593\n      type: 'test'\n      ...\n    # Subtest: delta não carrega linhas forjadas de nextState\n    ok 2 - delta não carrega linhas forjadas de nextState\n      ---\n      duration_ms: 63.733912\n      type: 'test'\n      ...\n    1..2\nok 4 - GAP-007 injeção no receipt\n  ---\n  duration_ms: 65.754434\n  type: 'suite'\n  ...\n# Subtest: GAP-008 sanitização de tokens\n    # Subtest: redige github_pat e JWT isolados\n    ok 1 - redige github_pat e JWT isolados\n      ---\n      duration_ms: 1.537733\n      type: 'test'\n      ...\n    1..1\nok 5 - GAP-008 sanitização de tokens\n  ---\n  duration_ms: 5.490871\n  type: 'suite'\n  ...\n# Subtest: GAP-005 aprendizado inventado\n    # Subtest: rejeita finalHead banana e sourceIds inventado\n    ok 1 - rejeita finalHead banana e sourceIds inventado\n      ---\n      duration_ms: 15.428654\n      type: 'test'\n      ...\n    1..1\nok 6 - GAP-005 aprendizado inventado\n  ---\n  duration_ms: 16.882094\n  type: 'suite'\n  ...\n# Subtest: GAP-006 lock concorrente\n    # Subtest: duas chamadas simultaneas do mesmo evento: uma PROCESSED e outra DUPLICATE ou ambas sem crash\n    ok 1 - duas chamadas simultaneas do mesmo evento: uma PROCESSED e outra DUPLICATE ou ambas sem crash\n      ---\n      duration_ms: 47.301491\n      type: 'test'\n      ...\n    1..1\nok 7 - GAP-006 lock concorrente\n  ---\n  duration_ms: 48.061318\n  type: 'suite'\n  ...\n# Subtest: GAP-INCONCLUSIVO não checkpointa\n   \n...[truncado]"
  },
  "demo": {
    "statusOk": true,
    "delta": "QA_CONTEXT_DELTA=\n\nEVENTO=TEST_FAILED\nMANIFEST_HASH=57c6274bb168a416f7744a8796d60ccd704a7fcfec79f50c26fd8beb391a9518\n\nSTATUS=OK\nHEURISTICAS_ATIVADAS=\n- FAILURE\n\nDOCUMEN
```