# Plano — Criar os 4 bots do Debate Arena

## A real crua sobre a API do Telegram

Fui olhar `core.telegram.org/api` pra ver se dava pra automatizar. Resposta curta: **não dá**.

- **Bot API** (a que a gente usa via connector): só serve pra *operar* um bot que já existe. Não cria bot novo.
- **Login Widget do Telegram**: só conecta *conta de usuário* pra login em site (tipo "entrar com Telegram"). Não cria bot.
- **MTProto / API de cliente**: teoricamente conversaria com o @BotFather como se fosse você, mas exige `api_id` + `api_hash` da sua conta pessoal, número de telefone, código SMS e, honestamente, é gambiarra frágil que a Telegram pode banir. Não vale a pena.

**Conclusão:** criar bot no Telegram é **manual, no @BotFather, uma vez só**. Depois disso eu cuido de 100% do resto (webhooks, permissões no grupo, orquestração, animação).

## O que você faz (5 minutos, uma vez)

Abre o @BotFather no Telegram e manda `/newbot` 4 vezes. Pra cada um:

1. **Nome público** (aparece no chat) — sugestão:
   - `Dark GPT`
   - `Dark Gemini`
   - `Dark Claude`
   - `Dark Juiz` (o que dá o veredito final)

2. **Username** (tem que terminar em `bot`) — sugestão:
   - `@DarkGPT_arena_bot`
   - `@DarkGemini_arena_bot`
   - `@DarkClaude_arena_bot`
   - `@DarkJuiz_arena_bot`
   (se algum já tiver dono, o BotFather avisa e você troca)

3. BotFather cospe um **token** tipo `8057486730:AAH...`. Copia os 4 tokens.

4. Adiciona os 4 bots como **membro do grupo** `Central Dark - Grupo Da Evolução` (`-5365750004`). Não precisa ser admin, só membro com permissão de mandar mensagem.

## O que eu faço (depois que você me passar os 4 tokens)

1. **Salvar os tokens como secret no HUB** (não aqui no TelePainel — memória sua diz que OAuth/API keys de provider vão SÓ pro HUB):
   - `TELEGRAM_BOT_GPT_TOKEN`
   - `TELEGRAM_BOT_GEMINI_TOKEN`
   - `TELEGRAM_BOT_CLAUDE_TOKEN`
   - `TELEGRAM_BOT_JUIZ_TOKEN`

2. **Serviço na VPS** `CentralDark-DebateArena` (PM2 novo, em `/root/CentralDark/apps/modulos/debate-arena/`):
   - recebe gatilho HTTP (do painel Hermes ou de comando `/debate <tema>` no grupo)
   - roda a rodada: cada bot manda `sendChatAction: typing` → espera 2-4s → `sendMessage` no grupo `-5365750004`
   - 2-3 rodadas de troca + veredito do juiz
   - salva transcript no HUB Supabase (tabela `debate_transcripts`)

3. **Aqui no TelePainel** (Lovable):
   - chip "🎭 Debate ao vivo" no card Hermes que dispara o webhook da VPS
   - **menu de config** em Configurações → Debate Arena:
     - grupo destino (chat_id, default `-5365750004`)
     - nº de rodadas (1-5)
     - delay do typing (1-6s)
     - liga/desliga cada bot individualmente
     - trocar modelo de cada bot (GPT-5, Gemini 3, Claude Sonnet 4.5, etc.)
   - painel de histórico dos debates puxando do HUB

## Detalhes técnicos

- Zero código de bot vai pro connector Telegram atual (`@srver1bot`) — ele continua sendo só o Central.
- Os 4 novos bots **não** entram no connector do Lovable (respeita a trava "conexões OAuth/API keys sempre no HUB"). Ficam como secrets diretos do serviço PM2.
- Idempotência: cada rodada tem `debate_id` (uuid) pra não duplicar se webhook reentregar.
- Rate limit do Telegram: 20 msgs/min por bot no mesmo grupo — os delays já cobrem.

## Próximo passo

Você abre o @BotFather, cria os 4, me manda os tokens (pode colar aqui que eu já disparo o `add_secret` pro HUB).

Se preferir **menos bots** (ex: 2 modelos + juiz = 3 bots, ou tudo num bot só com nomes diferentes no texto), me fala agora que eu ajusto o plano.
