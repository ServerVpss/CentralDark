# CONTRATO - rigor-mutant-tap-verify.json
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\rigor-mutant-tap-verify.json
**SHA:** edc730ae46c2bb04
**Timestamp:** 2026-08-26T19:10:23.629325
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
    "total": 17,
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
      "total": 55,
      "pass": 55,
      "fail": 0,
      "skipped": 0,
      "cancelled": 0,
      "todo": 0
    },
    "output": "TAP version 13\n# \\# tests 55\n# \\# pass 55\n# \\# fail 0\n# \\# skipped 0\n# \\# cancelled 0\n# \\# todo 0\n# Subtest: real pass\nok 1 - real pass\n  ---\n  duration_ms: 1.678898\n  type: 'test'\n  ...\n# Subtest: real skipped hidden by spoof\nok 2 - real skipped hidden by spoof # SKIP\n  ---\n  duration_ms: 0.296263\n  type: 'test'\n  ...\n# Subtest: consulta seletiva — progressive disclosure real\n    # Subtest: carrega no máximo 3 documentos únicos\n    ok 1 - carrega no máximo 3 documentos únicos\n      ---\n      duration_ms: 57.22019\n      type: 'test'\n      ...\n    # Subtest: retorna janela relevante e limitada\n    ok 2 - retorna janela relevante e limitada\n      ---\n      duration_ms: 22.254784\n      type: 'test'\n      ...\n    # Subtest: path traversal é bloqueado sem ler arquivo externo\n    ok 3 - path traversal é bloqueado sem ler arquivo externo\n      ---\n      duration_ms: 1.223048\n      type: 'test'\n      ...\n    # Subtest: falha de leitura não vira STATUS=OK\n    ok 4 - falha de leitura não vira STATUS=OK\n      ---\n      duration_ms: 2.585236\n      type: 'test'\n      ...\n    # Subtest: ausência de match retorna INCONCLUSIVO\n    ok 5 - ausência de match retorna INCONCLUSIVO\n      ---\n      duration_ms: 21.273418\n      type: 'test'\n      ...\n    # Subtest: sanitizador preserva o nome do campo e remove o valor\n    ok 6 - sanitizador preserva o nome do campo e remove o valor\n      ---\n      duration_ms: 1.333525\n      type: 'test'\n      ...\n    # Subtest: delta não expõe segredo trazido no erro\n    ok 7 - delta não expõe segredo trazido no erro\n      ---\n      duration_ms: 27.924356\n      type: 'test'\n      ...\n    1..7\nok 3 - consulta seletiva — progressive disclosure real\n  ---\n  duration_ms: 137.626925\n  type: 'suite'\n  ...\n# Subtest: GAP-001 missão ausente não inventa preservação\n    # Subtest: sem mission.id/state/nextState → PRESERVADA=NAO e PROXIMO_ESTADO=INALTERADO\n    ok 1 - sem mission.id/state/nextState → PRESERVADA=NAO e PROXIMO_ESTADO=INALTERADO\n      ---\n      duration_ms: 48.275887\n      type: 'test'\n      ...\n    1..1\nok 4 - GAP-001 missão ausente não inventa preservação\n  ---\n  duration_ms: 51.199614\n  type: 'suite'\n  ...\n# Subtest: GAP-002 isZero não aceita SIM\n    # Subtest: FAIL/SKIPPED/UNKNOWN/ARQUIVOS=SIM bloqueia AUTO_APPLY\n    ok 1 - FAIL/SKIPPED/UNKNOWN/ARQUIVOS=SIM bloqueia AUTO_APPLY\n      ---\n      duration_ms: 1.685444\n      type: 'test'\n      ...\n    # Subtest: contadores numéricos 0 liberam quando resto completo\n    ok 2 - contadores numéricos 0 liberam quando resto completo\n      ---\n      duration_ms: 0.964801\n      type: 'test'\n      ...\n    1..2\nok 5 - GAP-002 isZero não aceita SIM\n  ---\n  duration_ms: 3.323033\n  type: 'suite'\n  ...\n# Subtest: GAP-007 injeção no receipt\n    # Subtest: singleLineField remove quebras e neutraliza KEY=VALUE\n    ok 1 - singleLineField remove quebras e neutraliza KEY=VALUE\n      ---\n      duration_ms: 0.628526\n      type: 'test'\n      ...\n    # Subtest: delta não carrega linhas forjadas de nextState\n    ok 2 - delta não carrega linhas forjadas de nextState\n      ---\n      duration_ms: 39.946568\n      type: 'test'\n      ...\n    1..2\nok 6 - GAP-007 injeção no receipt\n  ---\n  duration_ms: 41.50078\n  type: 'suite'\n  ...\n# Subtest: GAP-008 sanitização de tokens\n    # Subtest: redige github_pat e JWT isolados\n    ok 1 - redige github_pat e JWT isolados\n      ---\n      duration_ms: 0.700979\n      type: 'test'\n      ...\n    1..1\nok 7 - GAP-008 sanitização de tokens\n  ---\n  duration_ms: 1.497962\n  type: 'suite'\n  ...\n# Subtest: GAP-005 aprendizado inventado\n    # Subtest: rejeita finalHead banana e sourceIds inventado\n    ok 1 - rejeita finalHead banana e sourceIds inventado\n      ---\n      duration_ms: 8.481954\n      type: 'test'\n      ...\n    1..1\nok 8 - GAP-005 aprendizado inventado\n  ---\n  duration_ms: 9.191445\n  type: 'suite'\n  ...\n# Subtest: GAP-006 lock concorrente\n    # Subtest: duas chamadas simultaneas do mesmo evento: uma PROCESSED e outra DUPLICATE ou ambas sem crash\n    ok 1 -\n...[truncado]"
  },
  "demo": {
    "statusOk": true,
    "delta": "QA_CONTEXT_DELTA=\n\nEVENTO=TEST_FAILED\nMANIFEST_HASH=57c6274bb168a416f7744a8796d60ccd704a7fcfec79f50c26fd8beb391a9518\n\nSTATUS=OK\nHEURISTICAS_ATIVADAS=\n- FAILUR
```