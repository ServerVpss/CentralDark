# MICRO-HANDOFF — drift missions da VPS absorvidas

Data: 2026-09-20
PR-mãe: #1562

Três arquivos gerados na VPS estavam fora do Git. Foram classificados como histórico material do Cartógrafo e absorvidos na main antes da reconciliação do checkout.

```text
drift-1789918250628.json → a3021ba445f591d9400940cd435bc39dc815d61f
drift-1789927258658.json → 100c82ea6a22cc2eaf5854742a4ea7a5ca758761
drift-1789932655952.json → b2e232fbc3af8c1e1a5fed23e0ebb80baf5d7f1d
```

`RUNTIME_GENERATED != DISCARDABLE`
`USEFUL_DELTA_ABSORBED_BEFORE_RESET=true`
`UNKNOWN_IS_NOT_PASS=true`

Próximo cursor: tornar o checkout VPS clean e alcançar a HEAD viva da main sem perder o ouro local.
