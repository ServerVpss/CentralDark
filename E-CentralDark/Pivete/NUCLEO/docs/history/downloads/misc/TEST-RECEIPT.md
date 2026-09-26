# TEST RECEIPT

Data: 2026-08-23

## Runtime de validação
- Node.js: v22.16.0
- Test runner: `node --test`

## Resultado
- tests: 5
- pass: 5
- fail: 0

## Package verify
`PACKAGE_VERIFY=PASS`

## Example round-trip
`examples/source-snapshot.json`
→ `bin/centraldark-one-flow.mjs`
→ `out/example-receipt.json`

## Escopo da prova
PASS prova somente o pipeline de referência isolado deste ZIP:
normalização, sanitização, hash/delta, dedupe, capability routing,
causal frame e Reality Judge de referência.

Não prova integração E2E com HERMES/browser/runtime real.
Essa parte permanece `UNKNOWN` até remedição na Casa.
