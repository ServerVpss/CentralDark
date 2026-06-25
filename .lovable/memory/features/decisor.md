---
name: Decisor
description: Camada de decisão dentro do Analista. Calcula score (C/I/F), escolhe ação (propor/agrupar/ignorar/elevar) e respeita orçamento diário + modo pânico. Fonte oficial em docs/CONSCIENCIA/REGRA-OFICIAL-DECISOR.md.
type: feature
---

Fonte oficial: `docs/CONSCIENCIA/REGRA-OFICIAL-DECISOR.md`.

- Roda dentro do processo `guardiao-analista` (sem novo PM2).
- Score 0–100 = `100 * (0.4*C + 0.4*I + 0.2*F)`.
- Faixas: ≥70 `propor`, 40–69 `agrupar`, 20–39 `ignorar`, <20 `elevar`.
- `severity=critico` tem bypass — sempre `propor`.
- Orçamento diário 80 msgs/24h; modo pânico se ≥5 críticos em 60s.
- Decisões relevantes (score ≥70 OU `elevar`) vão pra `docs/CONSCIENCIA/APRENDIZADOS.md` — sem arquivo diário.
- Flag `DECISOR_ENABLED=false` reverte pro comportamento antigo.
