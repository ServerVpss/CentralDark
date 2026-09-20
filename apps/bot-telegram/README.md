# MultiZap Telegram Bot

> Bot de Telegram que serve como painel de controle e canal de alertas
> do ecossistema MultiZap. Identificado no PM2 como `MultiZap-TelegramBot`.

[![Node](https://img.shields.io/badge/node-%E2%89%A518-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Runtime](https://img.shields.io/badge/runtime-PM2-2b037a?logo=pm2&logoColor=white)](https://pm2.keymetrics.io/)
[![Status](https://img.shields.io/badge/status-produção-success)]()

---

## Sumário

- [Visão geral](#visão-geral)
- [Localização em produção](#localização-em-produção)
- [Árvore do projeto](#árvore-do-projeto)
- [Como funciona](#como-funciona)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Resolver tolerante de skills](#resolver-tolerante-de-skills)
- [Como rodar localmente](#como-rodar-localmente)
- [Deploy na VPS](#deploy-na-vps)
- [Operação (PM2)](#operação-pm2)
- [Troubleshooting](#troubleshooting)
- [Histórico relevante](#histórico-relevante)

---

## Visão geral

O `bot-telegram` é o canal humano-em-loop do MultiZap. Ele:

- Recebe comandos via Telegram (`/start`, `/status`, menus inline, etc.).
- Expõe um **painel** (`panel.cjs`) com ações operacionais.
- Envia alertas de eventos do sistema (`services/alerts.js`).
- Reage a webhooks de outros serviços (`services/webhook.js`).
- Usa **skills compartilhadas** do MultiZap (`consciousness`, `manager`, `memory`)
  carregadas da pasta `apps/bot/skills/core/` via um resolver tolerante a caminho.

Não é um servidor HTTP — usa **long polling** contra a API do Telegram.

---

## Localização em produção

| Onde | Caminho | Observação |
|---|---|---|
| Repo (versionado) | `apps/bot-telegram/` (este diretório) | Fonte da verdade |
| VPS (executado) | `/root/Multizap/apps/bot-telegram/` | Sincronizado a partir do repo |
| PM2 | nome: `MultiZap-TelegramBot` (id 14) | Modo `fork`, sem cluster |
| Logs | `/root/.pm2/logs/MultiZap-TelegramBot-{out,error}.log` | Rotacionados pelo PM2 |

> **Importante:** até 2026-06-03 esse código vivia **solo na VPS**, fora de
> qualquer repositório. Foi trazido pro repo `clone-deck` pra ficar versionado
> e portável para outros ambientes.

---

## Árvore do projeto

```
apps/bot-telegram/
├── README.md                    ← este arquivo
├── .gitignore                   ← ignora node_modules, .env, backups
│
├── bot.cjs                      ← entrypoint principal (PM2 fork)
├── bot.js                       ← versão ESM legada (não usada em produção)
├── config.js                    ← configuração geral (constantes, endpoints)
├── ecosystem.config.cjs         ← config do PM2 para este bot
├── panel.cjs                    ← painel de comandos/menus do bot
│
├── handlers/                    ← tratamento de eventos do Telegram
│   ├── callbacks.js             ↳ callback_query (cliques em botões inline)
│   └── commands.js              ↳ /start, /status, /help, etc.
│
├── menus/                       ← construção de teclados inline
│   └── skills-menu.js           ↳ menu de skills/ações do operador
│
└── services/                    ← integrações externas
    ├── alerts.js                ↳ envio de alertas formatados
    ├── messages.js              ↳ helpers para sendMessage/editMessage
    └── webhook.js               ↳ recepção de webhooks que viram mensagens
```

> Dependências NPM ficam em `node_modules/` (NÃO versionado). Instalar com
> `npm install` na primeira execução em qualquer ambiente.

---

## Como funciona

```
   ┌─────────────────┐                      ┌────────────────────────┐
   │  Telegram API   │ ◄─── long poll ──── │  bot.cjs (entrypoint)  │
   └─────────────────┘                      └───────────┬────────────┘
                                                        │
                       ┌────────────────────────────────┼─────────────────────────────────┐
                       ▼                                ▼                                 ▼
              ┌──────────────┐                 ┌───────────────┐                ┌──────────────┐
              │  handlers/   │                 │   panel.cjs   │                │  services/   │
              │  commands.js │                 │ (menus/ações) │                │  alerts.js   │
              │  callbacks.js│                 └───────┬───────┘                │  messages.js │
              └──────┬───────┘                         │                        │  webhook.js  │
                     │                                 │                        └──────┬───────┘
                     ▼                                 ▼                               │
              ┌────────────────────────────────────────────────────────┐               │
              │   Skills compartilhadas (apps/bot/skills/core/*.cjs)   │ ◄─────────────┘
              │   consciousness  ·  manager  ·  memory                 │
              └────────────────────────────────────────────────────────┘
```

1. O `bot.cjs` faz long polling do endpoint `getUpdates` do Telegram a cada poucos segundos.
2. Cada update é classificado: mensagem de texto → `handlers/commands.js`; clique em
   botão inline → `handlers/callbacks.js`.
3. Handlers chamam `panel.cjs` (que monta menus via `menus/skills-menu.js`) e
   `services/messages.js` (que envia/edita mensagens).
4. Eventos externos chegam por `services/webhook.js` (porta interna) e viram
   notificações via `services/alerts.js`.
5. Lógica de IA/orquestração vive em **skills externas** (`consciousness`,
   `manager`, `memory`) carregadas do projeto `apps/bot`.

---

## Variáveis de ambiente

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | sim¹ | — | Token do BotFather |
| `GUARDA_TELEGRAM_BOT_TOKEN` | sim¹ | — | Alias aceito como fallback |
| `LOG_LEVEL` | não | `info` | `debug` \| `info` \| `warn` \| `error` |

¹ Pelo menos uma das duas precisa estar definida.

Na VPS as envs ficam em `/root/Multizap/secrets/wabot.env` e são carregadas
pelo `ecosystem.config.cjs` ao subir via PM2.

---

## Resolver tolerante de skills

`bot.cjs` carrega skills core (`consciousness.cjs`, `manager.cjs`, `memory.cjs`)
via uma função interna `_resolveSkill()` que tenta múltiplos caminhos:

```js
const candidatos = [
  "../bot/skills/core/" + name,       // estrutura atual (apps/bot/skills)
  "../../skills/core/" + name,        // estrutura antiga (raiz/skills)
  "../../apps/bot/skills/core/" + name // fallback adicional
];
```

**Por quê?** Em 2026-06-03 o bot estava em loop de restart porque a pasta
`skills/` foi reorganizada e os `require('../../skills/...')` originais
quebraram. O resolver tolerante evita que reorganizações futuras voltem
a derrubar o serviço.

Se nenhum dos caminhos existir, o bot lança erro explícito apontando o nome
da skill faltante — fica fácil diagnosticar.

---

## Como rodar localmente

```bash
cd apps/bot-telegram
npm install
TELEGRAM_BOT_TOKEN=seu_token_aqui node bot.cjs
```

Ao subir, deve logar:

```
🤖 Bot online: @seu_bot_username
```

---

## Deploy na VPS

> ⚠️ Hoje o deploy desta pasta **não é automático** pelo `gh-pull` do
> `clone-deck`. Quando o `gh-pull` rodar, o código aqui atualiza
> `apps/clone-deck/apps/bot-telegram/` no clone do repo, **mas a pasta em
> produção (`/root/Multizap/apps/bot-telegram/`) precisa ser sincronizada**.

### Passo manual (até automatizar)

```bash
ssh-vps 'rsync -a --delete \
  --exclude=node_modules --exclude="*.bak-*" --exclude=.env \
  /root/Multizap/apps/clone-deck/apps/bot-telegram/ \
  /root/Multizap/apps/bot-telegram/ \
  && pm2 restart MultiZap-TelegramBot --update-env'
```

### TODO (acompanhar)

Adicionar ao `scripts/post-deploy.sh`:

```bash
# Sync bot-telegram em produção
rsync -a --delete \
  --exclude=node_modules --exclude="*.bak-*" --exclude=.env \
  "$REPO/apps/bot-telegram/" /root/Multizap/apps/bot-telegram/
pm2 restart MultiZap-TelegramBot --update-env >/dev/null 2>&1 || true
```

---

## Operação (PM2)

```bash
# status
pm2 ls | grep TelegramBot

# logs (sanitizados pelo bot, sem tokens)
pm2 logs MultiZap-TelegramBot --lines 50

# restart manual
pm2 restart MultiZap-TelegramBot --update-env

# zerar contador de restarts
pm2 reset MultiZap-TelegramBot

# parar
pm2 stop MultiZap-TelegramBot

# subir do zero (se removido)
cd /root/Multizap/apps/bot-telegram
pm2 start ecosystem.config.cjs
pm2 save
```

---

## Troubleshooting

| Sintoma | Causa provável | Como agir |
|---|---|---|
| `MODULE_NOT_FOUND: ../../skills/core/...` | Pasta `skills/` movida e o resolver não cobre o novo caminho | Adicionar o novo caminho em `_resolveSkill()` no `bot.cjs` |
| Restart em loop infinito | Token Telegram inválido / sem `TELEGRAM_BOT_TOKEN` | Verificar `/root/Multizap/secrets/wabot.env` |
| `[Poll] fetch failed` esporádico | Hiccup de rede com `api.telegram.org` | Ignorável se baixa frequência; investigar se >5/min |
| Bot online mas não responde | Outro processo polando o mesmo token (conflito) | `pm2 ls` na VPS, garantir só uma instância |
| Erro `409 Conflict` na API do Telegram | Mesmo que o anterior — duas pollings ativas | Parar a duplicada |

Para diagnóstico mais profundo, ler logs sanitizados (mascaramos `BOT_TOKEN`):

```bash
pm2 logs MultiZap-TelegramBot --lines 200 --nostream \
  | sed -E 's/(token|BOT_TOKEN)[=: ]+[^ ,"]+/\1=***/Ig'
```

---

## Histórico relevante

| Data | Mudança |
|---|---|
| 2026-06-03 | Trazido pro repo `clone-deck` (antes vivia solto em `/root/Multizap/apps/bot-telegram` na VPS) |
| 2026-06-03 | Adicionado `_resolveSkill()` em `bot.cjs` — corrigiu loop de restart causado por skill faltando após reorganização de pastas |
| 2026-06-03 | Backup do `bot.cjs` original salvo na VPS como `bot.cjs.bak-20260603-101004` |

---

## Licença / propriedade

Código proprietário do projeto MultiZap. Uso interno.
