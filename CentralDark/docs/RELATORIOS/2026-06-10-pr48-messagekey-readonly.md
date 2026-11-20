# PR #48 — messageKey read-only para /instancias

Data: 2026-06-10

## Objetivo

Preparar o painel `/instancias` para carregar mensagens ao vivo com segurança, usando `messageKey` opaca em vez de depender de JID real no frontend.

## Alterações

- `apps/bot/src/components/dashboard/LiveMessagesPreview.tsx`
  - aceita payloads com `items` ou `chats`;
  - normaliza `jid/chatId`, `name/title`, `type/kind`;
  - seleciona `messageKey` quando disponível;
  - mantém fallback para `jid` se o backend ainda não entregar `messageKey`.

- `apps/bot/src/hooks/useLiveMessages.ts`
  - melhora tratamento de erro HTTP;
  - mantém polling incremental como fallback principal;
  - mantém SSE opcional sem transformar queda de SSE em erro permanente.

- `CentralDark/apps/bot-server/src/gateways/whatsapp/wuzapi-readonly-types.ts`
  - adiciona `messageKey?: string` em `CentralDarkChatSummary`.

- `CentralDark/apps/bot-server/src/gateways/whatsapp/wuzapi-readonly-mappers.ts`
  - cria `buildReadOnlyMessageKey(chatId)`;
  - adiciona `messageKey` nos mappers de contatos, grupos e chats desconhecidos.

## Segurança

- Sem envio de mensagem.
- Sem token no frontend.
- Sem exposição de sessão ou segredo.
- Sem Docker, WuzAPI, Caddy, CRM, banco real ou domínio.
- Escopo fechado por GitHub API, sem usar `git add .` na VPS suja.

## Validação necessária após merge/deploy

Endpoint correto:

```txt
https://bot.centralldark.com
```

Validar:

```txt
GET /health → 200
GET /v1/whatsapp/sessions → 200
GET /v1/whatsapp/chats → 200 e chats com messageKey quando houver chats
GET /v1/whatsapp/messages com messageKey → mensagens sanitizadas
/instancias → sem Failed to fetch
```

Observação: `https://mcp.centralldark.com/v1/whatsapp/chats` não é o endpoint correto para esse painel.
