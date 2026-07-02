## Fechar o loop das notificações (usando o que já existe)

Você tá certo — Telegram `@srver1bot` já tá conectado como connector neste projeto e a VPS já tá acessível. Não precisa criar nada novo, só usar.

### Passos

1. **Salvar o chat_id do canal Status como secret**
   `TELEGRAM_STATUS_CHANNEL_ID = -1003669176367` (MultiZap Status)
   → assim qualquer edge function futura acessa direto, sem hardcode.

2. **Postar retroativo do plugin v0.4.4 no canal Status**
   Uma mensagem curta via connector Telegram (`@srver1bot`) com o resumo da sprint — a mesma coisa que já foi pro seu privado, só que enxuta pro canal.

3. **Gravar regra permanente na memória do projeto**
   Adicionar em `mem://index.md` (Core):
   > **Notificação pós-ação (obrigatório)**: ao fim de toda tarefa concluída → 2 posts via connector Telegram já linkado (`@srver1bot`): (a) card completo no privado admin `1901426549`, (b) linha curta no canal Status `-1003669176367`. Nunca postar no Monitoramento direto (Status já espelha). Nunca pedir token/VPS pra isso — o connector resolve.

### O que NÃO vou fazer

- Não criar edge function nova.
- Não mexer em VPS/PM2.
- Não pedir mais nenhum secret.
- Não tentar `atualizar_painel` de novo (dispatcher quebrado, fica como pendência separada).

### Resultado esperado

Da próxima vez que eu terminar qualquer coisa (fix, deploy, ajuste), você vê a notificação chegar sem eu perguntar nada. Fluxo colado no `@srver1bot` que já existe.

Aprovo?
