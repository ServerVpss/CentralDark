
# Salvar usuários do Telegram também pelo @

## Problema
Hoje a base só guarda o `telegram_user_id` (número) nas tabelas de assinatura e pagamento. Quando você procura por `@aledrack12`, não acha nada — o username nunca foi salvo.

## Solução em 3 partes

### 1. Criar uma "agenda" de usuários do Telegram
Nova tabela `telegram_users` que funciona como um cadastro central, ligando ID ↔ @ ↔ nome:

- `telegram_user_id` (chave única)
- `username` (o @ sem o arroba)
- `first_name` / `last_name`
- `last_seen_at` (última vez que apareceu)
- `bot_id` (de qual bot ele veio)

Assim, mesmo que o usuário troque o @ depois, a gente mantém o histórico ligado pelo ID.

### 2. Preencher automaticamente
Sempre que o bot receber qualquer mensagem ou callback do usuário, ele faz um "upsert" nessa tabela (cria se não existe, atualiza se mudou o @ ou nome). Isso acontece dentro da função `telegram-bot` que já processa tudo.

Resultado: em pouquíssimo tempo, todo mundo que interage com o bot fica catalogado.

### 3. Adicionar busca por @ no painel
- Adicionar campo `username` também em `telegram_subscriptions` e `pending_payments` (preenchido no momento do pagamento, vindo da `telegram_users`).
- Na página de **Telegram Users** / **Subscription Audit**, permitir buscar por `@usuario` além do ID.
- Quando você me pedir de novo "procura o @fulano", consigo cruzar direto: pego o ID na `telegram_users` e checo plano/mute na `telegram_subscriptions`.

## O que muda na prática pra você
- Da próxima vez que o @aledrack12 mandar qualquer coisa pro bot, ele entra na agenda.
- Você consegue buscar por @ no painel web.
- Eu consigo te responder rápido se um @ está com plano ativo ou mutado.

## Observação importante
Os usuários **antigos** que nunca mais interagiram não vão aparecer automaticamente — só vão ser cadastrados quando mandarem a próxima mensagem. Pra eles, ainda vai precisar do ID numérico. Se quiser, posso adicionar também um botão "importar membros do grupo" depois.
