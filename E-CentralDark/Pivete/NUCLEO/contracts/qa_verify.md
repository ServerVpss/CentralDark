# CONTRATO - qa_verify.json
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\qa_verify.json
**SHA:** c41109ef5065fec5
**Timestamp:** 2026-08-26T19:10:23.474514
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
    "total": 15,
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
      "total": 44,
      "pass": 44,
      "fail": 0,
      "skipped": 0,
      "cancelled": 0,
      "todo": 0
    },
    "output": "TAP version 13\n# Subtest: consulta seletiva — progressive disclosure real\n    # Subtest: carrega no máximo 3 documentos únicos\n    ok 1 - carrega no máximo 3 documentos únicos\n      ---\n      duration_ms: 61.723227\n      type: 'test'\n      ...\n    # Subtest: retorna janela relevante e limitada\n    ok 2 - retorna janela relevante e limitada\n      ---\n      duration_ms: 17.808491\n      type: 'test'\n      ...\n    # Subtest: path traversal é bloqueado sem ler arquivo externo\n    ok 3 - path traversal é bloqueado sem ler arquivo externo\n      ---\n      duration_ms: 1.986914\n      type: 'test'\n      ...\n    # Subtest: falha de leitura não vira STATUS=OK\n    ok 4 - falha de leitura não vira STATUS=OK\n      ---\n      duration_ms: 1.205272\n      type: 'test'\n      ...\n    # Subtest: ausência de match retorna INCONCLUSIVO\n    ok 5 - ausência de match retorna INCONCLUSIVO\n      ---\n      duration_ms: 17.348777\n      type: 'test'\n      ...\n    # Subtest: sanitizador preserva o nome do campo e remove o valor\n    ok 6 - sanitizador preserva o nome do campo e remove o valor\n      ---\n      duration_ms: 0.870481\n      type: 'test'\n      ...\n    # Subtest: delta não expõe segredo trazido no erro\n    ok 7 - delta não expõe segredo trazido no erro\n      ---\n      duration_ms: 14.795743\n      type: 'test'\n      ...\n    1..7\nok 1 - consulta seletiva — progressive disclosure real\n  ---\n  duration_ms: 119.889536\n  type: 'suite'\n  ...\n# Subtest: Enxame — fallback real, Fable e segredo protegido\n    # Subtest: detecta provedores na ordem declarada e não serializa chaves\n    ok 1 - detecta provedores na ordem declarada e não serializa chaves\n      ---\n      duration_ms: 6.832622\n      type: 'test'\n      ...\n    # Subtest: sem variável de API retorna indisponível\n    ok 2 - sem variável de API retorna indisponível\n      ---\n      duration_ms: 2.42308\n      type: 'test'\n      ...\n    # Subtest: CentralDark falha e OpenAI assume automaticamente\n    ok 3 - CentralDark falha e OpenAI assume automaticamente\n      ---\n      duration_ms: 49.002424\n      type: 'test'\n      ...\n    # Subtest: tenta outro modelo do mesmo provedor antes de desistir\n    ok 4 - tenta outro modelo do mesmo provedor antes de desistir\n      ---\n      duration_ms: 17.760853\n      type: 'test'\n      ...\n    # Subtest: HTTP 200 com corpo de erro não é resposta verde\n    ok 5 - HTTP 200 com corpo de erro não é resposta verde\n      ---\n      duration_ms: 1.822373\n      type: 'test'\n      ...\n    # Subtest: todas as APIs falhando retorna indisponível e nunca inventa veredito\n    ok 6 - todas as APIs falhando retorna indisponível e nunca inventa veredito\n      ---\n      duration_ms: 3.664708\n      type: 'test'\n      ...\n    # Subtest: Judge informa quando reutiliza o mesmo modelo\n    ok 7 - Judge informa quando reutiliza o mesmo modelo\n      ---\n      duration_ms: 20.492762\n      type: 'test'\n      ...\n    # Subtest: modo grande exige autorização explícita\n    ok 8 - modo grande exige autorização explícita\n      ---\n      duration_ms: 1.63811\n      type: 'test'\n      ...\n    1..8\nok 2 - Enxame — fallback real, Fable e segredo protegido\n  ---\n  duration_ms: 115.029594\n  type: 'suite'\n  ...\n# Subtest: orquestrador e atualização entre sessões\n    # Subtest: duas execuções iguais preservam o mesmo delta estrutural\n    ok 1 - duas execuções iguais preservam o mesmo delta estrutural\n      ---\n      duration_ms: 104.222496\n      type: 'test'\n      ...\n    # Subtest: não chama Enxame em falha comum\n    ok 2 - não chama Enxame em falha comum\n      ---\n      duration_ms: 32.482509\n      type: 'test'\n      ...\n    # Subtest: chama Enxame somente quando explicitamente solicitado\n    ok 3 - chama Enxame somente quando explicitamente solicitado\n      ---\n      duration_ms: 20.542175\n      type: 'test'\n      ...\n    # Subtest: SESSION_RESUME reutiliza aprendizado comprovado\n    ok 4 - SESSION_RESUME reutiliza aprendizado comprovado\n      ---\n      duration_ms: 55.098631\n      type: 'test'\n      ...\n    # Su\n...[truncado]"
  },
  "demo": {
    "statusOk": true,
    "delta": "QA_CONTEXT_DELTA=\n\nEVENTO=TEST_FAILED\nMANIFEST_HASH=57c6274bb168a416f7744a8796d60ccd704a7fcfec79f50c26fd8beb391a9518\n\nSTATUS=OK\nHEURISTICAS_ATIVADAS=\n- FAILURE\n\nDOCUMENTOS_CONSULT
```