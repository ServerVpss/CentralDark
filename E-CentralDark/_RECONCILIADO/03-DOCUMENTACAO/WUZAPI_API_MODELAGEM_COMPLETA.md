# Modelagem completa MultiZap QR / WuzAPI

> Documento canônico. Fonte da verdade da integração QR.
> Spec oficial WuzAPI v3.0.0: https://www.xn--automaomkt-k5a1c.com.br/api/ (`spec.yml`).
> Última revisão: 22/05/2026.

## 1. Princípio de arquitetura

- **MultiZap QR (WuzAPI/Whatsmeow)** é o canal principal de continuidade de atendimento. Sem regra de janela 24h.
- **Meta Cloud API** é canal oficial separado, com regra de 24h e template obrigatório fora dela. NÃO é fallback livre do QR.
- **Ticket pertence ao par `workspace_id + telefone normalizado`**, não ao `connection_id`. Trocar conexão QR não pode quebrar histórico.
- **Gateway nunca pode travar por causa da WuzAPI**: tudo que chama WuzAPI roda com timeout e devolve `wuzapi_online:false` em vez de pendurar.
- **Nenhum segredo (token de sessão, ADMIN_TOKEN, WUZAPI_DB_URL) pode aparecer em log, resposta HTTP ou frontend.**

## 2. Endpoints WuzAPI oficiais usados

Confirmados na `spec.yml` v3.0.0. Headers:
- Admin: `Authorization: <WUZAPI_ADMIN_TOKEN>`
- Sessão/User/Webhook: `Token: <SESSION_TOKEN>` (capital "T")

| Endpoint | Método | Uso | Headers | Body relevante |
|---|---|---|---|---|
| `/admin/users` | POST | criar usuário (sessão) | Admin | `{name, token?}` |
| `/admin/users/{id}` | DELETE | apagar usuário | Admin | — |
| `/session/connect` | POST | conectar Whatsmeow | Sessão | `{Subscribe:[…], Immediate:true}` |
| `/session/disconnect` | POST | desconectar socket (mantém pareamento) | Sessão | — |
| `/session/qr` | GET | obter QR base64 | Sessão | — |
| `/session/status` | GET | `connected`/`loggedIn`/`jid` | Sessão | — |
| `/session/logout` | POST | desparear (exige QR novo) | Sessão | — |
| `/webhook` | GET | ler URL + `subscribe[]` atual | Sessão | — |
| `/webhook` | POST | criar webhook + eventos | Sessão | `{webhook, events:[…]}` |
| `/webhook` | PUT | **atualizar webhook/eventos sem reconectar** | Sessão | `{webhook, events:[…], Active}` |
| `/webhook` | DELETE | remover webhook | Sessão | — |
| `/user/avatar` | POST | foto de perfil de um número | Sessão | `{Phone, Preview?}` |
| `/user/check` | POST | conferir se número tem WhatsApp | Sessão | `{Phone:[…]}` |
| `/chat/send/text` | POST | enviar texto | Sessão | `{Phone, Body}` |
| `/chat/send/{image\|video\|audio\|document}` | POST | enviar mídia | Sessão | `{Phone, Url, Caption?}` |

### Formato dos campos — o que a spec diz × o que mandamos

| Campo | Spec oficial | Nosso gateway hoje | Decisão |
|---|---|---|---|
| URL no POST `/webhook` | `webhook` (string) | `webhookurl` (minúsculo) | **mandar os 3** (`webhookurl`+`webhook`+`webhookURL`) para compatibilidade máxima — servidor ignora os que não conhece |
| Lista de eventos no POST `/webhook` | `events` (array) | `events` (array) | manter array; redundar com `Events` + `Subscribe` quando útil |
| Assinatura no POST `/session/connect` | `Subscribe` (array) + `Immediate` | `Subscribe` (array) + `events` CSV + `Immediate` | manter ambos — `events` CSV é ignorado pela spec mas tolerado por forks |
| Resposta GET `/webhook` | `{subscribe:[…], webhook:"…"}` | hoje lemos via fallback SQL | **substituir** por GET oficial sempre que possível |
| Resposta `/user/avatar` | `{URL, ID, Type, DirectPath}` | tratamos `data.data || data` ✅ | já correto |

## 3. Lista central de eventos (WUZAPI_EVENTS_FULL)

Mantida em `multizap-gateway-deploy/gateway/src/services/wuzapiClient.js`. Modo controlado por `WUZAPI_SUBSCRIBE_MODE` (`basic` / `full` / `debug`, default `full`).

```
Message, ReadReceipt, Receipt, UndecryptableMessage, MediaRetry,
GroupInfo, JoinedGroup, Picture, BlocklistChange,
Connected, Disconnected, ConnectFailure, LoggedOut,
PairSuccess, PairError, QR, QRTimeout, StreamReplaced,
TemporaryBan, ClientOutdated,
IdentityChange, PushNameSetting,
HistorySync, OfflineSyncCompleted,
Presence, ChatPresence,
CallOffer, CallAccept, CallTerminate, CallOfferNotice
```

Também exportar `WUZAPI_EVENTS_CSV = WUZAPI_EVENTS_FULL.join(',')` para compatibilidade com forks que esperam CSV.

## 4. Fluxos

### 4.1 Conectar nova sessão QR
1. `POST /admin/users {name, token}` → cria usuário com token pré-gerado (UUID). Persistir `{connection_id, session_token, workspace_id}` em `data/connections.json` (token **só** no backend).
2. `POST /webhook {webhookurl, webhook, webhookURL, events:[…], Events:[…], Subscribe:[…]}` → grava webhook ANTES de conectar.
3. `POST /session/connect {Subscribe:[…], events:"<csv>", Immediate:true}`.
4. `GET /session/qr` → devolve QR base64 pro frontend exibir.
5. Frontend faz polling em `GET /connections/:id/status` (gateway).
6. Ao detectar `logged_in:true` + `jid` preenchido → marcar `status=connected`, gravar `last_connected_at`, disparar `repairWebhook` uma vez pra garantir `subscribedEvents` persistido.

### 4.2 Reconectar sessão existente (sem QR novo)
1. `POST /session/disconnect` (tolera 400/404).
2. `POST /webhook` com payload completo (recria assinatura).
3. `POST /session/connect`.
4. `GET /session/status` para confirmar `connected:true`.
5. Validar via `GET /webhook` que `subscribe` não voltou vazio.

### 4.3 Reaplicar webhook (sem mexer na sessão) — **`POST /connections/:id/reapply-webhook`**
1. `PUT /webhook {webhook, events:[…], Active:true}` (canônico) → se 404/405, cair pra `POST /webhook`.
2. `GET /webhook` → ler `subscribe`. Se vazio, ir pro fallback SQL.
3. Fallback SQL controlado: se `WUZAPI_DB_URL` definida, `UPDATE users SET events=$1 WHERE token=$2`; se não, marcar `db_fallback_enabled:false`.
4. `POST /session/disconnect` + `POST /session/connect` (refresca cache de assinatura na WuzAPI).
5. Retornar `{webhook_url_saved, events_configured, events, db_fallback_enabled, db_fallback_result, session_status, logged_in, subscribed_events_empty_after_fix}`.

### 4.4 Repair em lote — **`POST /connections/repair-all-webhooks`**
Itera todas as conexões `status=connected`, chama o fluxo 4.3 com timeout de 5s por conexão e devolve relatório `{ok, total, results:[…]}`. Nunca trava: cada conexão é isolada em Promise.race.

### 4.5 Diagnóstico — **`GET /__diag/wuzapi`** (auth Bearer)
Devolve, por conexão, blindado contra timeout (1.5s por conexão, 4s total):

```json
{
  "connection_id": "…",
  "workspace_id": "…",
  "status": "connected",
  "wuzapi_online": true,
  "session_connected": true,
  "logged_in": true,
  "jid": "5511…@s.whatsapp.net",
  "webhook_configured": true,
  "events_configured": true,
  "events": ["Message","ReadReceipt",…],
  "last_webhook_at": "2026-05-22T…Z",
  "last_webhook_kind": "message.received",
  "last_message_at": "2026-05-22T…Z",
  "last_error": null
}
```
Topo da resposta: `{ok, subscribe:{mode, events, webhookConfigured}, counters, connections, connections_timed_out, timeouts_ms}`.

### 4.6 Webhook inbound (WuzAPI → Gateway → MultiZap)
1. WuzAPI faz POST no webhook configurado.
2. `normalizeService.normalize(payload)` resolve `jsonData|Message|ChatPresence|ReadReceipt|HistorySync|Picture` em eventos internos:
   - `message.received`
   - `presence.updated`
   - `message.receipt`
   - `history.sync`
   - `profile.photo.updated`
3. `webhookService.forwardToMultizap(event)` envia POST autenticado para o endpoint TanStack `src/routes/api/public/wuzapi.webhook.ts` (HMAC + secret).
4. Gateway grava `last_webhook_at`, `last_webhook_kind`, contadores `byKind`, e mantém ring buffer dos últimos 50 eventos pra `/__diag/wuzapi`.
5. Se a forward der erro, registra `last_error` mas NÃO bloqueia o webhook (devolve 200 pra WuzAPI não reenfileirar).

### 4.7 Recebimento no MultiZap (`/api/public/wuzapi.webhook`)
- Valida HMAC.
- Resolve `connection_id` → `workspace_id`.
- Identifica/cria contato por `workspace_id + phone normalizado` (E.164 sem `+`).
- Resolve ticket aberto por `workspace_id + contact_id`. Se não existir, cria.
- Insere `ticket_messages`. Triggers já cuidam de `last_message_at`, `unread_count`, CRM card.
- Dispara `refreshContactAvatarAsync` em background (fire-and-forget) se contato sem foto ou `avatar_synced_at` > 24h.

### 4.8 Envio (`POST /messages/send`)
1. Ler `whatsapp_connections.provider` do `connection_id` do ticket.
2. Se `meta_cloud` → aplicar regra 24h/template (já existe).
3. Se `wuzapi_gateway` / `multizap_qr` → enviar direto pelo QR ativo, sem regra 24h.
4. Se ticket aponta pra QR antigo (sem `session_token` ou `status<>connected`):
   - Buscar QR `status=connected` mais recente do workspace.
   - Se achar: atualizar `tickets.connection_id`, gravar `audit_log` com `action='ticket_qr_connection_auto_relinked'`, enviar.
   - Se não achar: erro claro "Nenhuma conexão QR ativa neste workspace" — **não** cair pra Meta Cloud automático.

### 4.9 Foto de perfil (automático, sem botão manual)
- Disparado por: (a) toda mensagem inbound via QR; (b) evento `profile.photo.updated`.
- Função: `refreshContactAvatarFromQr({workspaceId, phone, preferredConnectionId})`.
- Pula silenciosamente quando: provider ≠ QR, `avatar_synced_at < 24h`, sem conexão QR ativa.
- Sempre carimba `contacts.avatar_synced_at = now()` mesmo quando WuzAPI devolve 404 — evita loop.
- **Nunca** chamado para conexões Meta Cloud (API Meta não suporta).

## 5. Fallback SQL controlado (`wuzapiDbFallback.js`)

- Só ativa se `WUZAPI_DB_URL` estiver no `.env` do gateway.
- Operação única permitida: `UPDATE users SET events=$1 WHERE token=$2`.
- Nunca lê `token` do banco (já temos em `connections.json`).
- Nunca aparece em log nem em resposta HTTP — apenas booleans `db_fallback_enabled` e `db_fallback_result`.
- Após `UPDATE`, sempre fazer `disconnect + connect` pra forçar WuzAPI a recarregar a lista em memória.

## 6. Painel `/app/canais` — estados visuais

Saudável só quando TODOS verdadeiros:
- `wuzapi_online`
- `session_connected`
- `logged_in`
- `webhook_configured`
- `events_configured`

Senão, badge específico:
- `precisa_reconectar` (logged_in=false)
- `webhook_pendente` (webhook_configured=false ou events=[])
- `gateway_offline` (wuzapi_online=false)
- `sem_token` (faltou `session_token` no `connections.json`)
- `unauthorized` (admin token errado)

## 7. Identidade da conversa (regra anti-perda de histórico)

```text
ticket.identity = (workspace_id, normalize_phone(contact.phone))
ticket.connection_id = transporte atual (pode trocar livremente)
```

Migrations/UNIQUEs envolvidas:
- `tickets(workspace_id, contact_id) WHERE status IN ('open','in_progress')` (parcial)
- `contacts(workspace_id, phone)` UNIQUE

Trocar QR banido → reativar QR novo → continuar atendendo no MESMO ticket.

## 8. Testes obrigatórios pós-deploy

```bash
/usr/local/bin/multizap-gh-pull
curl -s http://127.0.0.1:3100/health | jq
curl -s -H "Authorization: Bearer $MULTIZAP_GATEWAY_TOKEN" \
     http://127.0.0.1:3100/__diag/wuzapi | jq '.connections[] | {connection_id, logged_in, events_configured, events}'
curl -s -X POST -H "Authorization: Bearer $MULTIZAP_GATEWAY_TOKEN" \
     http://127.0.0.1:3100/connections/repair-all-webhooks | jq
```

Mandar uma mensagem real para o número QR e validar:

**Logs WuzAPI (`docker logs -f wuzapi-atendimento`):**
- ✅ `Calling user webhook`
- ✅ `Webhook call successful`
- ❌ NUNCA `subscribedEvents=[]`
- ❌ NUNCA `Skipping webhook`

**Logs Gateway (`pm2 logs multizap-gateway`):**
- ✅ `webhook_wuzapi_in event=message.received`
- ✅ `forwarded_to_multizap event=message.received status=200`

**MultiZap (`/app/chat`):**
- mensagem aparece em tempo real no ticket correto

## 9. Rollback

| Mudança | Rollback |
|---|---|
| Multi-campo no `setWebhook` | reverter `wuzapiClient.js` 1 commit |
| `PUT /webhook` adotado | re-priorizar POST (já é fallback) |
| Fallback SQL | desativar `WUZAPI_DB_URL` no `.env` do gateway |
| Auto-relink QR no envio | reverter `messageService.js` |
| Foto auto via inbound | reverter `wuzapi.webhook.ts` |

## 10. Riscos conhecidos

- WuzAPI tem bugs históricos com `subscribedEvents=[]` em sessões antigas — fluxo 4.3 + fallback SQL cobre.
- URL de foto da Whatsmeow expira em ~24h — estratégia atual é refrescar on-demand a cada mensagem; migrar pra Storage permanente fica no roadmap.
- `POST /chat/send/*` pode retornar 200 mas a mensagem ser bloqueada pelo WhatsApp (banimento progressivo) — rate-limiter de 250/h por conexão + cooldown protege.
- WuzAPI não tem endpoint pra listar todas as sessões com seus `subscribedEvents` — precisamos iterar `connections.json`.

## 11. Próximos passos (depende de OK)

1. ✅ Doc canônico (este arquivo).
2. ⏳ Trocar `setWebhook` pra mandar 3 nomes de URL — **já implementado em wuzapiClient.js (22/05)**.
3. ⏳ Adicionar `PUT /webhook` como caminho primário no `reapplyWebhook`, POST como fallback.
4. ⏳ Substituir leitura via fallback SQL por `GET /webhook` oficial no `/__diag/wuzapi`.
5. ⏳ Implementar `auto_relink_qr` no `messageService.js`.
6. ⏳ Garantir que envio Meta Cloud NÃO seja tentado quando ticket é QR (separação dura).
7. ⏳ Deploy: commit GitHub main → `multizap-gh-pull` + `pm2 restart multizap-gateway`.

## 12. Diferença Meta Cloud × MultiZap QR (resumo executivo)

| Aspecto | Meta Cloud | MultiZap QR |
|---|---|---|
| Janela 24h | obrigatória | não existe |
| Template fora de janela | obrigatório | não existe |
| Foto de perfil de terceiros | proibido | suportado (`/user/avatar`) |
| Banimento | risco baixo (oficial) | risco maior (anti-spam Whatsmeow) |
| Custo por mensagem | sim | não |
| Rate limit Meta | sim, por categoria | controlado pelo gateway (250/h) |
| Continuidade ao trocar número | precisa novo template | mantém ticket pelo telefone |
