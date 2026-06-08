## O que vou fazer

Mandar um aviso único de manutenção do PIX para **todos os usuários no privado** do bot principal de consultas e também **postar no grupo oficial e fixar lá no topo**. Tudo num disparo só, sem mexer em código novo — usando o sistema de broadcast que já existe no painel + uma chamada direta pra fixar a mensagem do grupo.

## Mensagem que vou usar

```
🔧 AVISO IMPORTANTE — MANUTENÇÃO DO PIX 🔧

Galera, tô passando aqui pra avisar! 💚

Hoje vamos configurar um novo sistema de PIX provisório pra manter tudo funcionando enquanto resolvemos uns ajustes no sistema principal.

⚠️ O que muda por enquanto:
• Os depósitos via PIX vão aceitar apenas planos a partir de R$ 5,00 ou R$ 10,00
• Planos menores (R$ 2,00 e R$ 5,00) ficam temporariamente indisponíveis
• Assim que normalizar, voltamos com todos os valores 🚀

🙏 Pedimos desculpa pelo transtorno e agradecemos demais a paciência de vocês!

Qualquer dúvida, é só chamar no suporte. 💬
Equipe TelePainel 💚
```

> Se quiser ajustar alguma palavra antes do disparo, me fala que eu mudo.

## Passo a passo

1. **Identificar o bot** — buscar no banco o `telegram_bots` ativo (deve ser só um conectado ao sistema de consultas) e o `group_chat_id` configurado em `bot_settings`.
2. **Disparo no privado** — usar o sistema de broadcast já existente (`scheduled-broadcasts` / `telegram-bot`) com `target_audience: "all"` pra atingir toda a base de assinantes. O sistema já respeita o rate-limit do Telegram (25 msgs/pausa).
3. **Disparo no grupo + fixar** — enviar a mesma mensagem no `group_chat_id` via `sendMessage` e em seguida chamar `pinChatMessage` com o `message_id` retornado, marcando `disable_notification: false` pra todo mundo ser notificado da fixação.
4. **Confirmação** — te devolvo aqui no chat quantos privados receberam, se o post do grupo subiu e se a fixação deu certo.

## Detalhes técnicos

- Reutilizo a edge function `scheduled-broadcasts` (já tem rate-limit, fallback e contagem de enviados/falhos).
- Pra fixação no grupo, faço uma chamada extra direto na Telegram Bot API (`pinChatMessage`) — não precisa criar função nova, posso disparar de um script pontual usando o token do bot que já tá no `telegram_bots.token`.
- Sem alteração de schema, sem migração, sem código novo persistente — é um disparo pontual.

Confirma que tá ok pra eu disparar?