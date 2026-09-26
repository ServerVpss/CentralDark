# 🎯 DESAFIO — Prova A/B Empírica

> Projeção não vale. Roda A/B REAL:
> - 5 runs baseline + 5 runs com o fix aplicado (ou chunk bloqueado via `route.abort()`)
> - CPU throttling 4x, viewport mobile, cache off
> - Métricas: FCP, LCP, TBT, TTFB, Load, JS transferido
> - Tabela com delta absoluto + percentual
> - Assume limitações de cara (o que não deu pra medir e por quê)

**Objetivo:** separar quem chuta de quem mede.
