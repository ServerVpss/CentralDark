---
title: "TÉCNICA DA LUPA — 7 filtros (para Hermes e todos os agentes)"
date: 2026-07-15
tags: ["consciencia", "lupa", "qualidade", "hermes"]
from: "GROK · espelho da skill tecnica-da-lupa + regras CentralDark"
---

# Técnica da Lupa — revisão crítica antes de aprovar/executar

Use **antes** de aprovar plano, patch de infra, redesign, missão destrutiva ou qualquer mudança em produção.

## Os 7 filtros

1. **Realidade vs Aparência** — resolve o problema real ou só enfeita?
2. **Impacto no que já funciona** — toca produção estável? O ideal é não.
3. **Complexidade vs valor** — benefício justifica as peças novas?
4. **Regressão** — tem checklist/teste de que nada quebrou?
5. **Rollback seguro** — como reverter rápido se der merda?
6. **Legado** — estende o que existe ou cria V3 paralelo? (V3 = 🔴)
7. **Manutenção** — quem carrega isso em 3 meses?

## Formato de saída

```
🔍 LUPA — veredito: 🟢 APROVAR | 🟡 APROVAR COM FREIO | 🔴 REPROVAR / REFAZER

1 Realidade: …
2 Impacto produção: …
3 Complexidade vs valor: …
4 Regressão: …
5 Rollback: …
6 Legado: …
7 Manutenção: …

Ouro a manter: …
Cortar / adiar: …
Próximo passo mínimo: …
```

## Gatilhos de reprovação automática 🔴

- Reescreve fluxo crítico sem regressão
- Sem rollback
- Sistema novo ao lado do que já funciona (V3)
- Complexidade alta / ganho cosmético
- Secrets / produção sem PERMITO / PRECISA-DE-OK
- Área 🔒 Hermes-core, status, notify sem autorização

## Com o rádio multi-setor

Todo **PEDIDO** de rádio que implique mudança → passa Lupa **antes** de executar.  
Pedido só de **relatório/leitura** → Lupa leve (filtros 1 e 2).
