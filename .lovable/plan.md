## Objetivo
Colocar o diamante 💎 animado (Premium Custom Emoji) no topo das mensagens de engajamento enviadas no grupo, mantendo o botão "💎 ADQUIRIR VIP" como está (limitação do Telegram).

## Arquivo
`supabase/functions/fake-engagement/index.ts`

## Mudanças

1. **Trocar `parse_mode`** de `'Markdown'` para `'HTML'` nas duas chamadas de `sendMessage` (mensagem personalizada e mensagem padrão de simulação).

2. **Converter o template padrão** `DEFAULT_MESSAGE_TEMPLATE` de Markdown para HTML:
   - `*texto*` → `<b>texto</b>`
   - Prefixar com `<tg-emoji emoji-id="5471952986970267163">💎</tg-emoji>` antes do título.

3. **Mensagens personalizadas (do banco)**: prefixar o texto final com o mesmo `<tg-emoji>` antes de enviar (sem alterar o template salvo pelo usuário, só na hora do envio).

4. **Escapar variáveis dinâmicas** (`{nome}`, `{plano}`, `{valor}`) com função `escapeHtml` para evitar quebra de tags caso algum nome contenha `<`, `>` ou `&`.

5. **Botão "💎 ADQUIRIR VIP"**: mantém igual — Telegram não permite emoji animado em botões inline.

## Resultado
- Usuários Telegram Premium veem o 💎 animado no topo da mensagem.
- Usuários comuns veem o 💎 normal (fallback automático do Telegram).
- Sem quebras se o nome tiver caracteres especiais.
