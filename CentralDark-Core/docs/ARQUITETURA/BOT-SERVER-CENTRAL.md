# Arquitetura oficial — BOT e BOT Server Central

## Objetivo

Organizar a área de bots sem espalhar múltiplas pastas de gateway, worker e integrações diretamente em `apps/`.

A regra definida é:

```txt
apps/bot
→ frontend React do BOT

apps/bot-server
→ central backend dos bots
```

## Estado atual observado em `apps/`

Foi feita leitura somente de árvore, sem abrir secrets ou conteúdo sensível.

Existem atualmente itens como:

- `bot`;
- `bot-telegram`;
- `central-logs`;
- `central-notificacoes`;
- `clone-deck` legado/aninhado;
- `consciencia`;
- `crm`;
- `install-callback`;
- `mcp`;
- `modulos`;
- `notificacoes`;
- `portal`;
- `web`.

O `bot` atual é o frontend React. O domínio `bot.multizap.dev` é servido pelo Caddy a partir de `apps/bot/dist`.

## Estrutura desejada

```txt
/root/CentralDark/apps/
├── bot/
│   ├── src/
│   ├── dist/
│   ├── package.json
│   └── ...
│
└── bot-server/
    ├── README.md
    ├── package.json
    ├── ecosystem.config.js
    ├── src/
    │   ├── index.ts
    │   ├── api/
    │   │   ├── routes/
    │   │   └── middlewares/
    │   │
    │   ├── gateways/
    │   │   ├── whatsapp/
    │   │   │   ├── wuzapiClient.ts
    │   │   │   ├── sessionManager.ts
    │   │   │   ├── qrManager.ts
    │   │   │   ├── messageSender.ts
    │   │   │   ├── contactSync.ts
    │   │   │   ├── avatarSync.ts
    │   │   │   └── groupsSync.ts
    │   │   │
    │   │   └── telegram/
    │   │       ├── telegramClient.ts
    │   │       ├── webhookHandler.ts
    │   │       └── messageSender.ts
    │   │
    │   ├── workers/
    │   │   ├── messageWorker.ts
    │   │   ├── webhookWorker.ts
    │   │   ├── syncContactsWorker.ts
    │   │   └── syncGroupsWorker.ts
    │   │
    │   ├── webhooks/
    │   │   ├── wuzapiWebhook.ts
    │   │   └── telegramWebhook.ts
    │   │
    │   ├── services/
    │   │   ├── contactsService.ts
    │   │   ├── messagesService.ts
    │   │   ├── instancesService.ts
    │   │   └── workspacesService.ts
    │   │
    │   ├── shared/
    │   │   ├── types/
    │   │   ├── utils/
    │   │   ├── logger/
    │   │   └── constants/
    │   │
    │   └── config/
    │       ├── env.ts
    │       └── ports.ts
    │
    ├── scripts/
    │   └── run-once/
    │
    └── tests/
```

## Responsabilidade de cada parte

### `apps/bot`

Somente frontend/site:

- React/Vite;
- telas do BOT;
- build `dist`;
- servido pelo Caddy em `bot.multizap.dev`.

Não deve concentrar backend pesado, workers, gateway WhatsApp ou Telegram.

### `apps/bot-server`

Central backend dos bots:

- API própria do BOT;
- orquestração por workspace/cliente;
- integração com WuzAPI;
- integração futura com Telegram;
- workers;
- webhooks;
- helpers compartilhados;
- logs internos;
- entrypoint PM2.

## Modelo de instâncias

A decisão é usar uma central de bots, não um processo por cliente.

```txt
bot-server PM2
→ gerencia workspace A / sessão WhatsApp A
→ gerencia workspace B / sessão WhatsApp B
→ gerencia workspace C / sessão WhatsApp C
```

Não criar um PM2 separado para cada cliente/QR.

## WhatsApp / WuzAPI

O Docker/WuzAPI real atual não deve ser movido agora.

A pasta dentro de `bot-server` será apenas a camada de código que conversa com o WuzAPI:

```txt
apps/bot-server/src/gateways/whatsapp/
```

Qualquer ação em Docker/WuzAPI, sessão, QR, logout ou reset exige confirmação explícita.

## Telegram

A integração Telegram pode ser organizada futuramente dentro de:

```txt
apps/bot-server/src/gateways/telegram/
```

O `apps/bot-telegram` existente deve ser auditado antes de qualquer migração.

## Referências técnicas

- Fonte principal prática para API WhatsApp: `asternic/wuzapi/API.md`.
- Fonte auxiliar conceitual: `tulir/whatsmeow`.
- Fonte visual/organização: `wazapi.net/docs`.

## Regras de implantação

Antes de criar ou mover estrutura:

1. Validar o que já existe.
2. Documentar o plano.
3. Criar estrutura vazia/segura.
4. Não mover produção sem confirmação.
5. Não alterar PM2 sem confirmação.
6. Não alterar Docker/WuzAPI sem confirmação.
7. Gerar relatório.

## Próximo passo recomendado

Criar um relatório de validação da estrutura atual e depois uma pendência controlada para criar `apps/bot-server` como esqueleto inicial, sem ligar PM2 e sem mover código produtivo ainda.
