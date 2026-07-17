---
name: critico-refino
description: Protocolo obrigatório — toda entrega passa por CRÍTICO + REFINO antes de fechar. Usar em qualquer UI, demo, feature ou patch.
---

# Crítico + Refino (sempre)

## Regra
**Nunca entregar em 1 passe.** Todo trabalho relevante:

```
1. FAZER
2. CRÍTICO (achar falhas)
3. REFINAR (corrigir)
4. SÓ ENTÃO reportar
```

## Checklist do Crítico
- [ ] Comportamento pedido vs o que roda de fato
- [ ] Edge: loop infinito? wipe acidental? open/close errado?
- [ ] Visual: hierarquia, cor, tipo, motion
- [ ] Performance: timers, reflow, memory leaks no cleanup
- [ ] A11y: reduced-motion, contraste, focus
- [ ] Não inventar: tokens/cores/IDs do design real

## LIVE DEMO (se tocado)
- Cascata **por pane**, nunca `.mac-desktop` inteiro
- Loop **fluido** — sem clear total de chat/logs em ciclo
- 6 panes + Piloto + cost-strip
- Verde `#5ee4a8` no brand

## Tom do report
Curto: **Crítico** (achados) → **Refino** (o que mudou) → **Status**
