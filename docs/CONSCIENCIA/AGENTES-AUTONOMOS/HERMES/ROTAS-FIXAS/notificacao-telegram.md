# ROTA FIXA — Notificação Telegram (pós-ação obrigatória)

## Regra

Após toda tarefa: posts via connector Telegram já linkado (`@srver1bot`, `connection_id std_01kvw4jkcbekyr1t33vs4p5e9w`) segundo a tabela de destinos abaixo.

## Tabela de destinos

| Destino | chat_id | Quando postar | Formato | Bloco nível+skills? |
|---|---|---|---|---|
| Admin privado | `1901426549` | Toda tarefa fechada | Card AULA-006 completo em `<pre>` | ✅ SIM (no fim) |
| Canal Status | `-1003669176367` | Toda tarefa fechada | 1–3 linhas em `<pre>` | ❌ NUNCA |
| Grupo Evolução (multi-IA) | `<AGUARDANDO ADMIN>` | Debate entre IAs (AULA-013) | Cada IA em `<pre>` próprio + veredito Hermes em `<pre>` + salvar em `HERMES/DEBATES/GRUPO-EVOLUCAO/NNN.md` | ❌ (skills só admin) |

## Formato visual (obrigatório em TODOS)

- `parse_mode: "HTML"` + corpo dentro de `<pre>…</pre>` (fundo preto monoespaçado).
- Nunca postar markdown puro (`**negrito**` vaza) — sempre `<pre>`.

## Bloco NÍVEL+SKILLS do Hermes (SÓ no privado admin)

- Fonte da verdade: `docs/CONSCIENCIA/AGENTES-AUTONOMOS/HERMES/STATUS.md`.
- SEMPRE anexar o bloco `<pre>` de nível/XP/skills COLADO no final do card admin, depois do "PRÓXIMO PASSO".
- ❌ Canal público e grupo Evolução NUNCA levam esse bloco (poluição visual).
- Antes de postar: recalcular XP + skills se o bloco atual mexeu em algo, atualizar `STATUS.md`, regerar o `<pre>`.

## Proibido

- ❌ Postar em Monitoramento direto
- ❌ Pedir token (já tá no connector)
- ❌ Mexer em VPS pra isso
- ❌ Usar `atualizar_painel` (dispatcher bugado)
- ❌ Mandar bloco de nível/skills no canal público

## Endpoint

```
POST https://connector-gateway.lovable.dev/telegram/sendMessage
Headers:
  Authorization: Bearer $LOVABLE_API_KEY
  X-Connection-Api-Key: $TELEGRAM_API_KEY
Body: { "chat_id": ..., "text": "...", "parse_mode": "HTML" }
```

## Script pronto

`scripts/notificar-rollout-arsenal.mjs` no repo Lovable atual.

## Verificação

Se retornar `ok: true` no JSON, entregou. Se `401` ou `403`, connector precisa reconectar.
