---
name: nivel-e-skills-so-privado
description: Bloco de nível/XP/skills do Hermes vai só no card do admin, nunca no canal público
type: preference
---

# APR-009 — NÍVEL + SKILLS: só no privado do admin

## Regra
Todo card do admin fecha com o bloco `<pre>` de nível + XP + skills do Hermes (fonte: `HERMES/STATUS.md`). O canal público segue enxuto (1–3 linhas em `<pre>`), sem bloco de skills.

## Por quê
- Admin quer ver evolução do Hermes em tempo real (nível atual, quanto falta pro próximo, quais skills subiram).
- Canal público é status operacional pra galera — bloco de skills poluiria feed.

## Como aplicar
1. Ler `HERMES/STATUS.md` antes de montar o card.
2. Se o bloco recém-fechado mexeu em algo (Telegram, WebUI, carga…), somar XP + bumpar skill(s) + salvar `STATUS.md`.
3. Regerar o `<pre>` (template está no próprio `STATUS.md`).
4. Colar no fim do card admin, DEPOIS do "PRÓXIMO PASSO".
5. Canal: NUNCA anexar esse bloco.

## Rastro
- Liga em APR-008 (canal também mono) — mesmo padrão visual `<pre>`, só muda o conteúdo por destino.
- Fonte: `HERMES/STATUS.md`.
- Rota: `HERMES/ROTAS-FIXAS/notificacao-telegram.md`.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
