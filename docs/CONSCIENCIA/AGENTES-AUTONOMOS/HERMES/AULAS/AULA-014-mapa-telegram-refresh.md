---
title: "AULA 014 Mapa Telegram Refresh"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# AULA-014 — Refrescar o Mapa Telegram

> Como o Hermes mantém `ROTAS-FIXAS/mapa-telegram.md` sempre atualizado sem gastar token à toa.

---

## 🎯 Objetivo

Saber, em qualquer momento, **quem é dono, quais bots existem, em que grupos/canais os bots estão, quantos usuários já usaram**, sem precisar perguntar pro Pivete.

---

## 🔁 Quando rodar

- Sempre que um bot novo aparecer no ecossistema.
- Sempre que o Pivete falar em "grupo novo", "canal novo", "adicionei o bot em...".
- **Preventivo**: 1x por semana automático (cron do Fabler).
- Após qualquer restart do webhook.

---

## 🛠️ Receita (5 passos)

### 1) `getUpdates` sem quebrar o webhook

O `@srver1bot` roda com webhook em produção. Pra usar `getUpdates` sem estragar, **remove o webhook, coleta, religa no mesmo endpoint**:

```bash
# Salva a URL atual
WH=$(curl -s https://connector-gateway.lovable.dev/telegram/getWebhookInfo \
  -H "Authorization: Bearer $LOVABLE_API_KEY" \
  -H "X-Connection-Api-Key: $TELEGRAM_API_KEY" -d '{}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['result']['url'])")

# Remove
curl -s .../deleteWebhook -H ... -d '{"drop_pending_updates":false}'

# Coleta
curl -s .../getUpdates -H ... -d '{"limit":100,"allowed_updates":["message","channel_post","my_chat_member"]}'

# Religa (SHA-256 base64url do TELEGRAM_API_KEY como secret_token)
SECRET=$(node -e "console.log(require('crypto').createHash('sha256').update('telegram-webhook:'+process.env.TELEGRAM_API_KEY).digest('base64url'))")
curl -s .../setWebhook -H ... -d "{\"url\":\"$WH\",\"secret_token\":\"$SECRET\",\"allowed_updates\":[\"message\",\"callback_query\"]}"
```

⚠️ **CRÍTICO**: Sempre religar. Se falhar, o bot fica surdo em produção.

### 2) Banco local (TelePainel)

```sql
-- Bots
SELECT bot_username, bot_id, name, health_status FROM telegram_bots;

-- Chats + tipo + volume
SELECT chat_id, chat_type, COUNT(*) msgs, MAX(created_at) ultima
FROM telegram_messages GROUP BY 1,2 ORDER BY ultima DESC;

-- Usuários top
SELECT telegram_user_id, username, first_name, is_premium, last_seen_at
FROM telegram_users ORDER BY last_seen_at DESC LIMIT 50;

-- Totais
SELECT (SELECT COUNT(*) FROM telegram_users) usuarios,
       (SELECT COUNT(DISTINCT chat_id) FROM telegram_messages) chats,
       (SELECT COUNT(*) FROM telegram_bots) bots;
```

### 3) HUB (Central @srver1bot) — via Fabler/VPS

Fabler roda na VPS e tem `HUB_SUPABASE_DB_URL`. Pede pra ele executar as mesmas queries no HUB e devolver JSON.

### 4) Consolidar em `ROTAS-FIXAS/mapa-telegram.md`

Substitui a data no cabeçalho e as tabelas. Mantém a estrutura.

### 5) Commit padrão

```
🧠 Hermes/ROTAS-FIXAS: 015 mapa telegram refresh (2741→XXXX usuários)
```

---

## 💡 Truques pra não gastar token

- **Sempre passar por Graphy primeiro** (`apps/modulos/graph-panel/`) — se o mapa já foi atualizado nas últimas 24h, não repete.
- `getUpdates` só quando um chat novo aparece nos logs do webhook — não fica pollando.
- Título de grupo: se `getChat` falhar (bot não está no chat), pular sem drama.

---

## 🚨 Falhas comuns

| Erro | Causa | Fix |
|---|---|---|
| `chat not found` no `getChat` | Bot não está no chat | Ignora esse chat_id, marca como "só via updates" |
| `Wrong response from webhook 405` | Endpoint só aceita POST — normal em teste GET | Ignorar |
| Webhook não voltou | Cortou antes do `setWebhook` | Rodar setWebhook manual URGENTE |
| Título vazio no banco | `raw_data` salvo só com essencial | Ver SUG-003 (melhorar payload) |

---

## ✅ Definition of Done

- [ ] `mapa-telegram.md` atualizado com data de hoje.
- [ ] Webhook do `@srver1bot` funcionando (`getWebhookInfo` mostra URL certa).
- [ ] Commit com padrão AULA-012 feito.
- [ ] Se apareceu grupo/canal novo → post no Grupo Evolução (`<pre>`) contando a descoberta.

+15 XP · Skill "Mapeamento Telegram" +5
