# WuzAPI QR Gateway — Recebimento

> **Doc canônico da integração**: ver [docs/WUZAPI_API_MODELAGEM_COMPLETA.md](./WUZAPI_API_MODELAGEM_COMPLETA.md).
> Este arquivo trata só do problema histórico `subscribedEvents=[]` e da solução em camadas.



## Causa raiz
Sessões WuzAPI ficavam com `subscribedEvents=[]` mesmo após `/session/connect` mandar a lista — o log da WuzAPI mostrava `Skipping webhook` e nenhuma mensagem chegava no MultiZap.

## Solução em camadas
1. **`reapplyWebhook` (POST /connections/:id/reapply-webhook)** — reaplica webhook + eventos sem gerar QR novo.
2. **Auto-fix interno** — se `events` continuar vazio, faz `disconnect→connect→setWebhook` automaticamente.
3. **Fallback SQL (opt-in via `WUZAPI_DB_URL`)** — última linha de defesa: `UPDATE users SET events=$1 WHERE token=$2`. Sem a env, não roda.
4. **`repair-all-webhooks`** — roda tudo acima em lote pra todas as conexões; botão "Reparar recebimento (todas)" no `/admin/whatsapp`.
5. **Auto-repair no reconnect** — quando status/webhook indicar `connected`, o Gateway agenda `reapplyWebhook` em background. Não gera QR novo.
6. **Watchdog periódico** — a cada 5 minutos (`WUZAPI_WEBHOOK_WATCHDOG_INTERVAL_MS`), verifica conexões QR conectadas; se webhook/eventos estiverem vazios, reaplica automaticamente.
7. **`GET /__diag/wuzapi`** — devolve por conexão: `session_connected`, `logged_in`, `webhook_configured`, `events_configured`, `events`, `last_webhook_at`. Sem token/secret.

## UI
- `/app/canais` — botão "Reaplicar webhook" no card de cada conexão MultiZap QR.
- `/admin/whatsapp` — botão "Reparar recebimento (todas)" (super admin).

## Testes
```bash
/usr/local/bin/multizap-gh-pull
grep -E -c "jsonData|ChatPresence|HistorySync|ReadReceipt" /root/Multizap/gateway/src/services/normalizeService.js   # esperado: 9
curl -X POST http://127.0.0.1:3100/connections/repair-all-webhooks -H "Authorization: Bearer $MULTIZAP_GATEWAY_TOKEN"
```
Logs WuzAPI: deve aparecer `Calling user webhook` / `Webhook call successful` (e NÃO `subscribedEvents=[]`/`Skipping webhook`).
Logs Gateway: `webhook_wuzapi_in event=message.received` / `forwarded_to_multizap event=message.received status=200`.
Mensagem real deve aparecer em `/app/chat` e `/app/inbox`.

## Rollback
Remover env `WUZAPI_DB_URL` desativa o fallback SQL. Para desativar só o watchdog, defina `WUZAPI_WEBHOOK_WATCHDOG_INTERVAL_MS=0`. Reverter `reapplyWebhook`/`repairAllWebhooks`/`startWebhookWatchdog` no `connectionService.js` reverte a solução completa.

## UI /app/canais (cliente)
- Card QR mostra badges: WhatsApp/Webhook/Eventos (verde/vermelho).
- "Ver diagnóstico" expande detalhes: eventos ativos, último webhook recebido, última mensagem, último erro.
- Alerta vermelho "Recebimento desativado" quando events vazio.
- Botão "Reparar recebimento" chama POST /connections/:id/reapply-webhook (não gera QR novo, não desloga).
- Botão "Reconectar com QR novo" continua separado e faz reset completo.


## 2026-05-22 — Force-push: /__diag/wuzapi + /connections/repair-all-webhooks
Commit 68460f3 no main estava sem as rotas novas registradas (smoke-test VPS retornou `not_found`). Bumpei `sync-marker` em `multizap-gateway-deploy/gateway/src/routes/diag.routes.js` pra gerar commit novo com o estado correto do gateway (diagRoutes registrado em `app.js`, `POST /connections/repair-all-webhooks` em `connections.routes.js`, `repairAllWebhooks()` em `connectionService.js`, `wuzapiDbFallback.js` e `pg` no `package.json`). Validação: `grep -R "__diag\|repair-all-webhooks\|diag.routes\|repairAllWebhooks" multizap-gateway-deploy/gateway/src` → 9 hits. Próximo: `multizap-gh-pull` + `pm2 restart multizap-gateway`.
