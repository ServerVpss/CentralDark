# 2026-08-07 — Virada filosófica: Router por CAPACIDADE

## Movimento (Pivete 07/08 14:30)

Pivete reposicionou a skill inteira. Antes: "espelho reprodutivo por
modelo". Agora: **"router por capacidade"** — a IA pensa em objetivo, o
router escolhe o melhor modelo por **score** (não por nome).

Frase-âncora:
> "O roteador não deveria conhecer provedores. Deveria conhecer apenas
> capacidades."
> "Não orquestrar modelos, mas capacidades."

## Estrutura nova

- `router/capability-router.md` — **tabela viva única**. Score por 5
  capacidades (reasoning, coding, context, latency, cost). Perfis de
  tarefa (5). Cálculo de score. Redundância 5-camadas.
- `modelos/MiniMax-M3.md` v0.1.0 — score 9/9/10/7/9, status
  `trial_exhausted (status_code 1008)`. Sem "Padrões de uso Pivete" porque
  saldo impossibilitou teste.
- `modelos/gpt-4o-mini.md` v0.1.0 — score 7/7/4/8/10, status `online`
  (free, OpenRouter). Comprovado em Casa.
- `modelos/gemini-2.5-flash.md` v0.1.0 — score 7/7/10/9/10, status
  `online`, **1M contexto** ⭐. Candidato natural a `gpt-5.5` como
  padrão enquanto Codex estiver em quota.
- `INDEX-MODELOS.md` — reescrito. **Tabela por score**, não por data.

## Princípios aplicados (Pivete 07/08)

✅ Custo inteligente > custo burro.
✅ Artefato vivo = refina, não substitui.
✅ Mesmo arquivo cresce: `router → router+ → router++`.
✅ Casa primeiro, VPS depois.
✅ Score decide, não humano.
✅ Tabela viva = fonte da verdade.

## Estado REAL (validado 07/08/2026)

| Modelo | Status | Rota |
|---|---|---|
| gpt-5.5 (openai-codex) | 🔴 quota_exceeded | OAuth ChatGPT |
| MiniMax-M3 | 🟡 trial_exhausted | Token Plan MiniMax |
| MiniMax-M2.7-highspeed | 🟡 trial_exhausted | idem |
| gpt-4o-mini | ✅ online | OpenRouter free |
| gemini-2.5-flash | ✅ online | OpenRouter free |

## Próximo

1. **Casa usa OpenRouter** até o MiniMax voltar.
2. Quando o Pivete recarregar MiniMax, refino M3 ⇨ v0.2.0 com score
   medido em prova real (latência, custo, qualidade).
3. Quando entrar Claude/GPT-5.5/Gemini-3.5 realmente online, adiciono
   ao router (sem v2).
4. VPS-rotação (R4) fica pra próxima missão, com calma.
