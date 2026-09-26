# Badge Fabric — Status Badges Persistentes

Cristalização do CHEFE 05/09/2026: cada obra tem seu sinal visível; o sinal mostra o estado mas não substitui o Juiz.

## Conceito

Substituir o clique manual em "Create status badge" por um owner determinístico que varre workflows, workflow runs históricos, branches e PRs, gerando o índice canônico `docs/STATUS-BADGES.md` com os `badge.svg` nativos do GitHub.

## Regras

- `BADGE_IS_TELEMETRY_NOT_PROOF=true`
- `UNKNOWN_IS_NOT_PASS=true`
- `SAME_HEAD_PROOF_REQUIRED_FOR_CI_CLAIM=true`
- `CREATE_STATIC_DUPLICATE_SVG=false`
- `REUSE_NATIVE_BADGE_BEFORE_CREATE=true`

## Coverage

- workflows atuais: todos os `.yml|yaml` em `.github/workflows`
- branches atuais: todas retornadas pela API
- histórico: workflow runs acessíveis
- PRs: abertos, fechados e mergeados (`state=all`)
- branch apagada sem run preservada: `HISTORICAL_UNKNOWN`, nunca PASS inventado

## Fixed Point

```
SCAN → CLASSIFY → DETERMINISTIC_FIX → VERIFY → COUNTERPROOF → RESCAN → NO_NEW_FAILURES → FIXED_POINT
```

## Auto-correção

O loop pode corrigir sozinho:
- badge ausente
- workflow novo não indexado
- branch/run/PR novo
- link SVG antigo
- duplicata exata
- ordenação
- índice fora de sincronia

Mas não pode maquiar o painel:
- `RED != GREEN`
- `YELLOW != PASS`
- `UNKNOWN != PASS`
- `BADGE != PROOF`

## Residual

`RUNTIME_WORKFLOW_CONSUMPTION=NOT_YET_PROVEN` — a regra já está no motor candidato; falta ligar as variáveis nos workflows de deploy reais que já existem.

## PRs

- PR #1431: `feat/status-badge-fabric-20260905` — MERGED

## Trigger persistente

A workflow roda: manual, a cada 6h, quando workflow ou gerador mudar.

## Referência canônica

Owner: `docs/CONSCIENCIA/APRENDIZADOS/2026-09-05-STATUS-BADGE-FABRIC-FIXED-POINT.md`
