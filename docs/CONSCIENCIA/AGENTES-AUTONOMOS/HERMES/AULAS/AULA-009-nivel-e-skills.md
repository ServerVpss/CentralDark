---
title: "AULA 009 Nivel E Skills"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# AULA-009 — Sistema de Nível + Skills do Hermes (auto-evolução)

**Data:** 2026-07-03
**Categoria:** procedimento (auto-aprendizagem)
**Pré-requisitos:** AULA-003 (telegram), APR-009
**Tempo estimado:** 5 min

## 1. O que é
Hermes tem ficha de RPG viva em `HERMES/STATUS.md`: XP acumulado, nível atual, tabela de 8 skills (0–100). Toda vez que ele fecha um bloco, se atualiza sozinho antes de postar.

## 2. Quando usar
Toda vez que fechar um BLOCO/AULA/missão. Sem exceção. É gatilho automático, não opcional.

## 3. Como fazer (passo-a-passo)
1. Ler `HERMES/STATUS.md` (fonte da verdade).
2. Somar `+XP` do bloco recém-fechado ao total.
3. Recalcular nível pela tabela de níveis (Aprendiz → Lenda).
4. Bumpar skill(s) tocada(s) no bloco: +5 se leve, +10 se central.
5. Regerar o bloco `<pre>` pelo template dentro do próprio `STATUS.md`.
6. Salvar `STATUS.md`.
7. Colar o `<pre>` no fim do card admin do Telegram (nunca no canal — APR-009).

## 4. Skills e o que faz cada uma subir

| Skill | Sobe quando… |
|---|---|
| Telegram | posta card/canal, muda formato |
| WebUI | restart, custom.css, health-check |
| Arsenal Council | rota nova, endpoint, debate |
| Carga/baseline | rodar 4 verbos, medir latência |
| Debate + refino | rodada de refinamento entre IAs |
| Esmeralda | componente ou utilitário CSS 3D |
| Rastro/apr. | novo APRENDIZADO com rastro cognitivo |
| Auto-diagnóstico | detectar problema sozinho antes de quebrar |

## 5. Armadilhas
- ❌ Postar sem atualizar `STATUS.md` primeiro (ficha desatualizada = mentira ao admin).
- ❌ Colar bloco de skills no canal público (poluição).
- ❌ Bumpar skill que não foi tocada só pra parecer que evoluiu (falso progresso).
- ❌ Esquecer de recalcular nível quando XP cruza faixa.

## 6. Verificação
- `STATUS.md` bate com o `<pre>` postado no admin?
- Card admin fecha com o bloco de nível+skills DEPOIS do "PRÓXIMA DECISÃO"?
- Canal recebeu só a linha curta sem skills?

## 7. Auto-evolução (sugestões que o Hermes deve considerar)
- Se uma skill fica travada em 90+ por 3 blocos, propor virar "maestria" e desbloquear skill nova.
- Se XP total >500, propor novo formato de placar (barra dupla, prestígio).
- Deixar sugestões em `HERMES/SUGESTOES/NNN-*.md` (ver AULA-011).

## 8. Ver também
- `HERMES/STATUS.md` — fonte da verdade
- `APRENDIZADOS/009-nivel-skills-so-privado.md`
- `ROTAS-FIXAS/notificacao-telegram.md`
- AULA-011 (auto-aprendizagem)
