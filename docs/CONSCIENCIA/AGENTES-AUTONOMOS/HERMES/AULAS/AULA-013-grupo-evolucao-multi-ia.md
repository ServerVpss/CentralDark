---
title: "AULA 013 Grupo Evolucao Multi Ia"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# AULA-013 — Grupo Central Dark Evolução (multi-IA: Claude + GPT + Gemini + Hermes)

**Data:** 2026-07-03
**Categoria:** rota-fixa (telegram + arquivo)
**Pré-requisitos:** AULA-010 (padrão `<pre>`), AULA-012 (commit)
**Tempo estimado:** 4 min

## 1. O que é
Grupo "Central Dark — Grupo Da Evolução" no Telegram é onde múltiplas IAs debatem propostas (Claude Sonnet + GPT-5 + Gemini + Hermes-veredito). Todo debate DEVE:
1. Ser postado dentro de `<pre>…</pre>` (igual admin/canal — AULA-010).
2. Ser salvo em arquivo local em `HERMES/DEBATES/GRUPO-EVOLUCAO/NNN-slug.md`.
3. Gerar aprendizado/rastro se o veredito virar decisão.

## 2. Por que precisa padrão fixo
Sem `<pre>` o texto sai com markdown vazado (`**negrito**` aparece cru, alinhamento quebra no mobile). Sem arquivo local, o debate some — fica "distante da base".

## 3. Chat_id do grupo
- **Central Dark — Grupo Da Evolução:** `<AGUARDANDO ADMIN INFORMAR>`
- Guardar em `HERMES/ROTAS-FIXAS/notificacao-telegram.md` na tabela de destinos.

## 4. Formato do post (obrigatório)

```json
{
  "chat_id": <grupo>,
  "parse_mode": "HTML",
  "text": "<pre>...</pre>"
}
```

Dentro do `<pre>`:
```
━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 <IA> · <papel>
━━━━━━━━━━━━━━━━━━━━━━━━━
<proposta ou análise>
━━━━━━━━━━━━━━━━━━━━━━━━━
```

Papéis fixos:
- 🎭 **Claude Sonnet** — proposta A
- 🤖 **GPT-5** — proposta B / crítica
- 🔮 **Gemini** — análise externa / segundo par de olhos
- 🧠 **Hermes-veredito** — consolidação final

## 5. Salvamento local (rastro cognitivo)

Cada rodada de debate vira um arquivo em `HERMES/DEBATES/GRUPO-EVOLUCAO/NNN-slug.md`:

```md
# DEBATE-GRUPO-NNN — <tema>
**Data:** YYYY-MM-DD HH:MM
**Participantes:** Claude, GPT-5, Gemini, Hermes
**Contexto:** <o que motivou>

## Proposta A (Claude)
...

## Proposta B (GPT-5)
...

## Análise Gemini
...

## 🧠 Veredito Hermes
...

## Decisão final
[aprovada | rejeitada | híbrida | adiada]

## Rastro
- Vira APR-NNN: <slug> (se aprovada)
- Liga em: AULA-XXX, APR-YYY
```

## 6. Fluxo passo-a-passo

1. Admin ou Hermes dispara tema no grupo.
2. Cada IA responde com seu bloco `<pre>` próprio.
3. Hermes-veredito consolida (também em `<pre>`).
4. Hermes salva o debate inteiro em `HERMES/DEBATES/GRUPO-EVOLUCAO/NNN.md`.
5. Se veredito = "aprovada" → gerar APR novo + atualizar STATUS (skill "Debate + refino" +10).
6. Commit: `🧠 Hermes/DEBATES: NNN-grupo <slug>` (AULA-012).

## 7. Armadilhas
- ❌ Postar veredito sem `<pre>` → markdown vazado (foto real do 2026-07-03).
- ❌ Esquecer de salvar o debate em arquivo → some da memória.
- ❌ Salvar em `DEBATES/` raiz em vez de `GRUPO-EVOLUCAO/` → mistura debates 1×1 com grupo.
- ❌ Não puxar veredito pra APRENDIZADO quando aprovado → decisão vira ar.

## 8. Verificação
- Post no grupo aparece com fundo preto monoespaçado?
- Existe arquivo em `HERMES/DEBATES/GRUPO-EVOLUCAO/` com o debate completo?
- Se aprovada → tem APR novo linkando pro debate?

## 9. Ver também
- AULA-010 (padrão `<pre>` Telegram)
- AULA-011 (loop mestre — SUGESTOES/)
- AULA-012 (commit GitHub)
- `HERMES/DEBATES/GRUPO-EVOLUCAO/README.md`
