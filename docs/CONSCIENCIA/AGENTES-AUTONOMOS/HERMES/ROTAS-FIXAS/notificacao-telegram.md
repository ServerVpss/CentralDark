# ROTA FIXA — Notificação Telegram (pós-ação obrigatória)

## Regra

Após toda tarefa: 2 posts via connector Telegram já linkado (`@srver1bot`, `connection_id std_01kvw4jkcbekyr1t33vs4p5e9w`):

1. **Card completo** no privado admin `1901426549` (`TELEGRAM_ADMIN_CHAT_ID`)
2. **Linha curta** no canal Status `-1003669176367` (`TELEGRAM_STATUS_CHANNEL_ID`)

## Formato visual (obrigatório nos DOIS)

- `parse_mode: "HTML"` + corpo dentro de `<pre>…</pre>` (fundo preto monoespaçado).
- Admin = card AULA-006 completo. Canal = 1–3 linhas dentro de `<pre>`.

## Bloco NÍVEL+SKILLS do Hermes (SÓ no privado admin)

- Fonte da verdade: `docs/CONSCIENCIA/AGENTES-AUTONOMOS/HERMES/STATUS.md`.
- SEMPRE anexar o bloco `<pre>` de nível/XP/skills COLADO no final do card admin, depois do "PRÓXIMO PASSO".
- ❌ Canal público NUNCA leva esse bloco (poluição visual).
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
