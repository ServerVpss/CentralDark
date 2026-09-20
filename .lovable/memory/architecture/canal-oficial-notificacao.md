---
name: Canal oficial de notificação
description: Sempre usar a edge function notify-telegram para qualquer aviso importante. Nunca chamar /telegram/sendMessage direto.
type: preference
---
**Regra:** todo aviso, alerta, relatório de etapa ou notificação relevante deve ser disparado via edge function **`notify-telegram`** (POST em `https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/notify-telegram`, header `x-notify-key: $NOTIFY_API_KEY`).

**Por quê:** essa função grava em `notifications_log`, que é a tabela lida pelo **Mega Painel** (`/mega-painel` e `/status`) via Supabase Realtime. Chamar `connector-gateway.lovable.dev/telegram/sendMessage` direto entrega no Telegram mas **não aparece no painel** — quebra a visibilidade.

**Como aplicar:**
- Payload mínimo: `{ origem, tipo, titulo, mensagem, metadata? }`
- `tipo` ∈ `info | sucesso | aviso | erro | critico | venda | pagamento | sistema`
- A própria função roteia pro bot/chat correto e faz dedupe de 60s.
- Só usar o gateway direto se for resposta a uma mensagem do usuário no bot (fluxo conversacional), nunca pra eventos do sistema.
