# Inbound WuzAPI / MultiZap-Gateway

Documenta o caminho de mensagens recebidas pelo QR (WuzAPI) até o chat,
e a camada de segurança do fluxo de remover/desconectar/reconectar.

## Fluxo inbound

```
WhatsApp → WuzAPI (Docker) → MultiZap-Gateway (PM2 :3100)
        → POST /api/public/wuzapi.webhook ou /api/public/wuzapi/webhook (X-Gateway-Secret)
        → upsert contact + ticket + ticket_messages
        → runChatPaymentCommandInternal (parser PIX)
        → dispatchWhatsAppMessage (resposta via QR)
```

Idempotência: `ticket_messages.external_id` único por mensagem da WuzAPI.
Anti-loop: ignora quando `from` == número da própria conexão.

## Fluxo conexão QR (state machine)

```
idle
  └→ checking_gateway (/health)
       └→ ready_to_connect  ←──────── (espera clique do usuário)
            └→ creating_connection   (POST /connections, user_initiated)
                 └→ qr_ready (GET /qr)
                      └→ waiting_scan (polling status)
                           └→ connected (persiste em whatsapp_connections)

side: disconnecting → disconnected (POST /logout, mantém card)
side: removing     → removed       (DELETE /connections, tombstone, fecha modal)
side: error                         (mostra erro, sem auto retry)
```

## Guards de segurança

Ver `docs/SEGURANCA_WORKSPACE.md` para a lista completa. Resumo:

- Tombstone `removed_qr_connections` (TTL 7 dias)
- `createQrConnection` exige `user_initiated: true`
- Bloqueio de duplicidade (conexão `connected|qr|waiting_scan` já existente)
- Lock anti-duplo-clique (3 s por workspace)
- Polling para em `removing` / `removed` / modal fechado
- `attempt_reset` no `app.canais.tsx` pausa sync por 15 s após delete

## O que NUNCA é tocado por este fluxo

- Recargas Brasil
- `/root/whatsapp-server` (PM2 `whatsapp-server`, porta 3000, webhook 9001)
- `auth_info_baileys`
- Meta Cloud API e `sendMetaMessage`
- `/app/financeiro`, parser PIX, cobrança automática
- Docker / Caddy / WuzAPI compose (sem mudanças)

## 2026-05-21 — Subscribe obrigatório no /webhook

A WuzAPI exige no `POST /webhook` o payload completo:

```json
{ "webhookURL": "<url>", "Subscribe": ["Message", "ChatPresence", "ReadReceipt"] }
```

- Chave correta é `webhookURL` (URL maiúsculo). Mandar `webhookUrl` faz a WuzAPI registrar a URL mas com `subscribedEvents=[]`, e o log mostra `Skipping webhook. Not subscribed for this type`.
- O `Subscribe` no `/session/connect` também foi ampliado para os mesmos 3 eventos por consistência (antes só `Message`).
- `reapply-webhook` continua sem reiniciar sessão / sem novo QR / sem logout.
