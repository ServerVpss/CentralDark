# APPLY PLAN — HERMES

## Fase 0 — leitura
Sem mutação.

- medir repo;
- confirmar PR/Writer;
- abrir owners;
- comparar APIs reais com este kit.

## Fase 1 — teste do kit isolado
```bash
npm test
node scripts/verify-package.mjs
node bin/centraldark-one-flow.mjs --input examples/source-snapshot.json
```

## Fase 2 — mapa de encaixe
Para cada módulo `src/`:
- `EXISTS_EQUIVALENT` → usar owner existente;
- `PARTIAL_GAP` → absorver menor função;
- `NO_GAP` → NO_CHANGE;
- `REAL_GAP` → extensão mínima.

## Fase 3 — uma cadeia E2E
Escolher uma única superfície real e provar:

`surface → adapter → envelope → Harvester → delta → counterproof → receipt`

Read-only primeiro.

## Fase 4 — somente depois
Generalizar para outras superfícies.

## Rollback
Qualquer mutação material deve ter caminho de volta conforme owner canônico de execução reversível.
