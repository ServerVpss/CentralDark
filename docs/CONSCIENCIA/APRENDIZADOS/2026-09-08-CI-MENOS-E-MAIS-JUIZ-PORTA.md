---
title: "2026 09 08 CI MENOS E MAIS JUIZ PORTA"
date: 2026-09-08
tags: ["consciencia", "ci", "protecao"]
updated: 2026-09-08
---

# 2026-09-08 — CI Menos é Mais (Juiz + Porta) / recibo de proteção

## Flags (não confundir)

```text
MAIN_SERVER_PROTECTION=false
HOUSE_PROTECTION_REQUIRED=true
HOUSE_GATE != GitHub physical
NUNCA MAIN_PROTECTED=true
```

- **MAIN_SERVER_PROTECTION=false** — este PR não afirma trava física do servidor main; só enxuga gatilhos de CI.
- **HOUSE_PROTECTION_REQUIRED** — a Casa exige gate consciente (Porta / Juiz), não “proteção” declarada no ar.
- **HOUSE_GATE ≠ GitHub physical** — o gate da Casa (labels, Porta, Juiz) não é o mesmo que proteção física do host; não misturar.
- **Nunca `MAIN_PROTECTED=true`** — não inventar nem ecoar essa flag; ela não é canônica neste recibo.

## O que mudou

1. `autonomia-promocao.yml`: remove cron `*/5`; `workflow_run` só escuta `porta-de-entrada`; `cancel-in-progress: true`; PR types sem edited/labeled/unlabeled.
2. Porta / identidade: `before` = 40 zeros → caminho **SEM_BASE** (FABLE JUDGE) — sem merge-base/diff contra null OID.
3. Teste: `node --test scripts/ci/null-oid-sem-base.test.mjs`.
