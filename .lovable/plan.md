## Objetivo

Deixar cada bot no seu lugar, sem gambiarra:

- **@srver1bot (Central)** → HUB Supabase + PM2 id 27 na VPS. Continua como está.
- **@SEGREDOPUXADASBOT (TelePainel/Fiscal)** → projeto Lovable Cloud atual (`kagejpghnwdfymddwxuf`), com edge function **dedicada** só pra ele (e futuros bots do TelePainel).

Hoje as duas galáxias compartilham a mesma função `telegram-webhook` e eu tive que colocar um fallback "se não achou no HUB, tenta no local" — que resolveu na hora mas mistura os dois mundos. Vamos separar de verdade.

## O que vai ser feito

### 1. Nova edge function `telepainel-webhook` (projeto atual)

Cópia da lógica atual de `telegram-webhook`, mas com uma única diferença de fundo: consulta **sempre e apenas** o Supabase deste projeto (`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`), nunca o HUB. É a casa oficial do Fiscal e dos próximos bots do TelePainel.

- Rota: `https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/telepainel-webhook?botId=<uuid>`
- CORS padrão + `verify_jwt = false` (Telegram não manda JWT).
- Log com tag `[TELEPAINEL]` pra distinguir dos logs do Hub.

### 2. `telegram-webhook` volta ao original (só HUB)

Removo o fallback local que coloquei ontem. Essa função passa a ser exclusiva do @srver1bot e do resto do ecossistema Hub.

### 3. Repontar o webhook do Fiscal no Telegram

Chamada `setWebhook` no Telegram trocando a URL do bot 65915466-… para `.../telepainel-webhook?botId=…`. Feito via edge function ou via curl direto usando o token que já está em `telegram_bots.token`.

Depois do repointing, confirmo com `getWebhookInfo` que subiu certo e mando um `/start` sintético pra ver o log `[TELEPAINEL] UPDATE_IN` chegando.

### 4. Atualizar o banco

- `telegram_bots.webhook_url` do Fiscal → nova URL (`telepainel-webhook`).
- Sem alteração de schema.

### 5. Documentar a separação

- **CLAUDE.md** → nova seção "Arquitetura de Bots" com o mapa oficial:
  - `@srver1bot` = Central, HUB + VPS PM2 27, função `telegram-webhook`
  - `@SEGREDOPUXADASBOT` = TelePainel/Fiscal, Lovable Cloud atual, função `telepainel-webhook`
- **mem://architecture/bots-separacao** → mesma info em memória viva pra qualquer IA nova entender de cara.
- **`.lovable/plan.md`** → registrar a decisão.

## Ordem de execução (segura, sem downtime)

```
1. Cria telepainel-webhook (função nova, ninguém aponta pra ela ainda)
2. Deploy + teste sintético (POST direto)  → tem que responder OK
3. setWebhook do Fiscal → nova URL
4. Confirma com getWebhookInfo + /start sintético
5. Atualiza telegram_bots.webhook_url no banco
6. Reverte o fallback da telegram-webhook (só HUB)
7. Deploy da telegram-webhook original
8. Documenta em CLAUDE.md + mem + plan.md
```

Se qualquer passo falhar entre 3 e 7, dá pra voltar o webhook do Fiscal pra `telegram-webhook` num segundo — o fallback ainda estará lá até o passo 6.

## Detalhes técnicos

- A função `telepainel-webhook` fica em `supabase/functions/telepainel-webhook/index.ts`. É basicamente `telegram-webhook` com as 14+ ocorrências de `HUB_SUPABASE_URL` / `HUB_SUPABASE_SERVICE_ROLE_KEY` trocadas por `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`.
- `supabase/config.toml` ganha bloco `[functions.telepainel-webhook]` só se precisar de `verify_jwt = false` explícito (a maioria das funções Lovable já vem assim por padrão).
- O `setWebhook` usa o token gravado em `telegram_bots.token` (`7634758557:AAHH…`) — chamada direta à API do Telegram, sem passar pelo connector gateway (esse token é do Fiscal, não do bot do connector).
- Rollback rápido: `setWebhook` de novo apontando pra URL antiga.

## O que NÃO muda

- Nada no HUB Supabase.
- Nada no PM2 da VPS (id 27 continua rodando o @srver1bot).
- Nada no Caddy (webhook do Fiscal já vai direto pro Lovable Cloud, não passa por `status.centralldark.com`).
- Nenhum outro bot é tocado.

## Entrega final

Print/log mostrando:
- `getWebhookInfo` do Fiscal apontando pra `telepainel-webhook` ✅
- Log `[TELEPAINEL] UPDATE_IN` aparecendo quando você manda `/start` ✅
- `telegram-webhook` sem o fallback, respondendo normal pro Hub ✅
- CLAUDE.md e mem atualizados com o mapa oficial ✅
