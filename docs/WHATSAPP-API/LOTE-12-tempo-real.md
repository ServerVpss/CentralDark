# Lote 12 — Mensagens em tempo real (Fase 1 + Fase 2)

Data: 2026-06-10  
Status: Fase 1 ENTREGUE · Fase 2 PREP (webhook receptor + SSE prontos, sem ligação na WuzAPI ainda).

## Objetivo

Trazer chat ao vivo estilo WhatsApp Web no painel, sem mexer em Docker/WuzAPI/sessão/CRM/token.

## Fase 1 — polling incremental por cursor (LIVE)

### Backend (`bot-server`)
- `GET /v1/whatsapp/messages?jid=&count=&sinceTs=&sinceId=` agora aceita cursor.
- Ordena cronologicamente, filtra por `sinceTs`/`sinceId` e devolve `cursor` para a próxima chamada.
- Tudo continua sanitizado (`maskJid`, `maskId`, token nunca exposto).

### Frontend
- Hook novo `apps/bot/src/hooks/useLiveMessages.ts`:
  - Bootstrap puxa `initialCount` mensagens, depois só busca novas por cursor.
  - Polling roda a cada `pollMs` (default 3000 ms) **apenas com a aba visível** (`visibilitychange`).
  - Dedupe por `id` + ordenação cronológica; mantém últimas 500 em memória.
- Componente novo `apps/bot/src/components/dashboard/LiveMessagesPreview.tsx`:
  - Lista até 25 chats da sessão conectada.
  - Renderiza as últimas mensagens do chat selecionado, com badge indicando o transporte ativo (`SSE` / `POLLING`).
- Renderizado em `/instancias` logo abaixo do `LiveBotStatus`.

## Fase 2 — tempo real (PREP, ainda não ligado na WuzAPI)

### Backend (`bot-server`)
- `GET /v1/whatsapp/stream` (SSE): heartbeat a cada 25s, replay via `Last-Event-ID`, ring buffer de 200 eventos.
- `POST /v1/whatsapp/webhook` recebe eventos da WuzAPI, sanitiza (`maskJid`) e faz broadcast no canal SSE como `whatsapp.message`.
- Header `x-webhook-secret` exigido se a env `BOT_SERVER_WEBHOOK_SECRET` estiver setada.

### Frontend
- `useLiveMessages` tenta SSE primeiro; se cair, volta pra polling e tenta SSE de novo em 10s.
- Indicador visual mostra qual transporte está ativo.

## O que NÃO foi tocado

- Docker.
- WuzAPI (config, sessão, restart, logout, QR).
- Sessão WhatsApp.
- Caddy / DNS / SSL.
- CRM, banco real, secrets.
- Envio de mensagem.

## Próximos passos (precisam confirmação do usuário)

1. Setar `BOT_SERVER_WEBHOOK_SECRET` no `bot-server.env` da VPS.
2. Apontar o webhook da WuzAPI da sessão principal para `https://bot.centralldark.com/v1/whatsapp/webhook` com esse secret no header — **isso mexe na WuzAPI, exige liberação explícita**.
3. Validar SSE público (precisa garantir que o Caddy não buffere — já mandamos `x-accel-buffering: no` e header `content-type: text/event-stream`; talvez precise `flush_interval` no Caddy).
4. Quando tudo estiver verde, decidir se vamos pra Fase 3 (envio com guardrails) — **isso eu não faço sem ordem clara**.
