# CONTRATO - VALIDACAO-FINAL.json
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\audit-rigor\qa.teste-de-software.MARKDOWN\AUDITORIA\VALIDACAO-FINAL.json
**SHA:** 28e17a6547b11bdd
**Timestamp:** 2026-08-26T19:10:24.124384
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- "delta": "QA_CONTEXT_DELTA=\n\nEVENTO=TEST_FAILED\nMANIFEST_HASH=f274fc4b968391eda23b1cb9f8591915d451dd133fe775301be1023d5b9f6115\nMISSION_ID=VERIFY\n\nSTATUS=OK\nHEURISTICAS_ATIVADAS=\n- FAILURE\n\nD

### Ouro Bruto (primeiros 5000 chars)
```
{
  "status": "PASS",
  "manifest": {
    "count": 17,
    "hash": "f274fc4b968391eda23b1cb9f8591915d451dd133fe775301be1023d5b9f6115",
    "selfMap": {
      "totalMarkdownDetected": 24,
      "indexedUniquePaths": 17,
      "missing": [],
      "status": "SYNCED",
      "applied": 0
    }
  },
  "auditHashManifest": {
    "pass": true,
    "entries": 76,
    "checked": 76,
    "manifestSha256": "02b1daed4cc8b98c337e6c88222346e229cbc650bd9bfaabf0ddaf6d638a4672",
    "errors": []
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
    "files": 6,
    "exitCode": 0,
    "complete": true,
    "summary": {
      "total": 59,
      "pass": 59,
      "fail": 0,
      "skipped": 0,
      "cancelled": 0,
      "todo": 0
    },
    "output": "TAP version 13\n# Subtest: consulta seletiva — progressive disclosure real\n    # Subtest: carrega no máximo 3 documentos únicos\n    ok 1 - carrega no máximo 3 documentos únicos\n      ---\n      duration_ms: 17.717376\n      type: 'test'\n      ...\n    # Subtest: retorna janela relevante e limitada\n    ok 2 - retorna janela relevante e limitada\n      ---\n      duration_ms: 5.164717\n      type: 'test'\n      ...\n    # Subtest: path traversal é bloqueado sem ler arquivo externo\n    ok 3 - path traversal é bloqueado sem ler arquivo externo\n      ---\n      duration_ms: 0.379405\n      type: 'test'\n      ...\n    # Subtest: falha de leitura não vira STATUS=OK\n    ok 4 - falha de leitura não vira STATUS=OK\n      ---\n      duration_ms: 0.539663\n      type: 'test'\n      ...\n    # Subtest: ausência de match retorna INCONCLUSIVO\n    ok 5 - ausência de match retorna INCONCLUSIVO\n      ---\n      duration_ms: 3.966534\n      type: 'test'\n      ...\n    # Subtest: sanitizador preserva o nome do campo e remove o valor\n    ok 6 - sanitizador preserva o nome do campo e remove o valor\n      ---\n      duration_ms: 0.264694\n      type: 'test'\n      ...\n    # Subtest: delta não expõe segredo trazido no erro\n    ok 7 - delta não expõe segredo trazido no erro\n      ---\n      duration_ms: 7.997153\n      type: 'test'\n      ...\n    1..7\nok 1 - consulta seletiva — progressive disclosure real\n  ---\n  duration_ms: 37.161336\n  type: 'suite'\n  ...\n# Subtest: contraprovas P0/P1 — falso completo bloqueado\n    # Subtest: GAP-001: missão ausente nunca é declarada preservada nem recebe próximo estado inventado\n    ok 1 - GAP-001: missão ausente nunca é declarada preservada nem recebe próximo estado inventado\n      ---\n      duration_ms: 2.244691\n      type: 'test'\n      ...\n    # Subtest: GAP-002: SIM em FAIL/SKIPPED/UNKNOWN/fora do escopo nunca equivale a zero\n    ok 2 - GAP-002: SIM em FAIL/SKIPPED/UNKNOWN/fora do escopo nunca equivale a zero\n      ---\n      duration_ms: 0.552452\n      type: 'test'\n      ...\n    # Subtest: GAP-003: verify com zero arquivos de teste retorna FAIL\n    ok 3 - GAP-003: verify com zero arquivos de teste retorna FAIL\n      ---\n      duration_ms: 23.150016\n      type: 'test'\n      ...\n    # Subtest: GAP-004: junction/symlink que resolve fora da raiz é recusado\n    ok 4 - GAP-004: junction/symlink que resolve fora da raiz é recusado\n      ---\n      duration_ms: 1.39114\n      type: 'test'\n      ...\n    # Subtest: GAP-005: learning com source inventado e HEAD inválido não é promovido\n    ok 5 - GAP-005: learning com source inventado e HEAD inválido não é promovido\n      ---\n      duration_ms: 1.14903\n      type: 'test'\n      ...\n    # Subtest: GAP-006: duas chamadas simultâneas do mesmo evento executam o orquestrador uma vez\n    ok 6 - GAP-006: duas chamadas simultâneas do mesmo evento executam o orquestrador uma vez\n      ---\n      duration_ms: 89.094358\n      type: 'test'\n      ...\n    # Subtest: GAP-007: quebra de linha em próximo estado não injeta campos no receipt\n    ok 7 - GAP-007: quebra de linha em próximo estado não injeta campos no receipt\n      ---\n      duration_ms: 0.399404\n      type: 'test'\n      ...\n    # Subtest: GAP-008: github_pat e JWT isolados são redigidos\n    ok 8 - GAP-008: github_pat e JWT isolados são redigidos\n      ---\n      duration_ms: 0.209953\n      type: 'test'\n      ...\n    # Subtest: INCONCLUSIVO não avança checkpoint e é reavaliado na próxima execução\n    ok 9 - INCONCLUSIVO não avança checkpoint e é reavaliado na próxima execução\n      ---\n      duration_ms: 10.970529\n      type: 'test'\n      ...\n    # Subtest: GAP-012: lock antigo de processo vivo não é roubado durante operação longa\n    ok 10 - GAP-012: lock antigo de processo vivo não é roubado durante operação longa\n      ---\n      duration_ms: 102.872095\n      type: 'test'\n      ...\n    # Subtest: GAP-013: chaves sensíveis em camelCase são redigidas sem depender do formato do valor\n    ok 11 - GAP-013: chaves sensíveis em camelCase são redigidas sem depend\n...[truncado]"
  },
  "demo": {
    "status
```