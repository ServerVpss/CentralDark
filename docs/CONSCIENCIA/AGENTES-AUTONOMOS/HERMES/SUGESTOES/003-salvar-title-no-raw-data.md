# SUG-003 — Salvar `chat.title` completo no `telegram_messages.raw_data`

## Problema
Hoje, 790 mensagens do supergrupo `-1002205387838` estão sem título salvo. Ao mapear, o Hermes precisa fazer `getChat` extra (que falha se o bot não estiver mais no grupo).

## Solução
No `telepainel-webhook` (edge function), ao fazer `INSERT` em `telegram_messages`, garantir que `raw_data` contenha **o objeto `chat` inteiro** vindo do update, incluindo `title`, `username`, `type`, `invite_link`.

## Ganho
- Mapa fica auto-suficiente do banco, sem chamar API do Telegram.
- Histórico preservado mesmo se o bot for removido do grupo depois.

## Prioridade
Média. Fazer junto com a próxima manutenção do `telepainel-webhook`.

## Owner
Hermes propõe → Fabler valida no HUB → Lovable aplica migration + edge deploy.
