# Sistema Universal de Notificação — CentralDark

> Fundação do ecossistema. Qualquer parte do sistema (VPS, bots, IAs, crons, Lovable, scripts) notifica
> **do mesmo jeito**, fica registrado no banco e no Telegram, e aparece em tempo real no Mega Painel.
>
> **Zero dependência da Lovable.** Se você sair de lá, o sistema continua funcionando intacto.

---

## Visão geral

```text
       VPS / Cron / Bot / Script                  Lovable
              │                                       │
              │  notify "..." (bash/python)           │
              └──────POST X-Notify-Key──────┐  ┌──────┘
                                            ▼  ▼
                            edge function: notify-telegram
                                       │
                              ┌────────┴────────┐
                              ▼                 ▼
                      notifications_log   Telegram API
                       (Supabase)         (canal/admin)
                              │
                              ▼
                       Realtime → Mega Painel (/mega-painel)
```

## Componentes

| Componente | Onde vive | Função |
| --- | --- | --- |
| `notify-telegram` | Supabase Edge Function | recebe POST, autentica, grava log, envia Telegram, anti-spam |
| `notifications_log` | Tabela Postgres | histórico permanente + fonte do painel realtime |
| `/usr/local/bin/notify` | VPS (bash) | comando global pra qualquer script chamar |
| `notify.py` | VPS (Python) | módulo equivalente para integrar no Elite Mapper |
| `/mega-painel` | TelePainel (rota admin) | tela viva que pisca em tempo real |

---

## Tabela `notifications_log`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | uuid | PK |
| `created_at` | timestamptz | quando entrou |
| `origem` | text | quem mandou (`vps`, `bot`, `gateway`, `lovable`, `elite-mapper`...) |
| `tipo` | text | `info` \| `sucesso` \| `aviso` \| `erro` \| `critico` |
| `titulo` | text | título curto |
| `mensagem` | text | corpo (até 3500 chars) |
| `metadata` | jsonb | JSON livre — stats, link, contexto, `repeated` |
| `telegram_message_id` | bigint | id da msg enviada (pra editar/responder depois) |
| `telegram_chat_id` | bigint | chat de destino usado |
| `sent_ok` | bool | `true` se chegou no Telegram |
| `send_error` | text | mensagem de erro se falhou |
| `dedupe_hash` | text | SHA-256 de origem+tipo+titulo+mensagem (anti-spam) |

RLS: admin lê via app (`has_role(uid, 'admin')`). Edge function escreve via `service_role`.
Realtime: ligado (`supabase_realtime` publication).

---

## Endpoint

```text
POST https://<seu-supabase>/functions/v1/notify-telegram
Headers:
  X-Notify-Key: <NOTIFY_API_KEY>
  Content-Type: application/json
Body:
  {
    "origem":   "elite-mapper",
    "tipo":     "sucesso",
    "titulo":   "Varredura concluída",
    "mensagem": "21.3GB analisados em 8.3s",
    "metadata": { "duracao_s": 8.3, "tamanho_gb": 21.3 },
    "chat_id":  1901426549   // opcional — default = admin
  }
```

### Resposta de sucesso

```json
{ "ok": true, "id": "uuid", "telegram_message_id": 12345, "sent_ok": true }
```

### Resposta deduplicada (mesma notificação em <60s)

```json
{ "ok": true, "deduped": true, "id": "uuid", "repeated": 3 }
```

### Códigos de erro

| HTTP | error | causa |
| --- | --- | --- |
| 400 | `invalid_json` | body não é JSON |
| 400 | `invalid_input` | faltou origem/titulo/mensagem |
| 400 | `invalid_tipo` | tipo fora da lista permitida |
| 401 | `unauthorized` | `X-Notify-Key` ausente ou errada |
| 405 | `method_not_allowed` | não usou POST |
| 500 | `db_insert_failed` | erro gravando no banco |

---

## Tipos e emojis

| Tipo | Emoji | Quando usar |
| --- | --- | --- |
| `info` | ℹ️ | informação geral, status normal |
| `sucesso` | ✅ | algo terminou bem |
| `aviso` | ⚠️ | atenção, não bloqueante |
| `erro` | ❌ | falha recuperável |
| `critico` | 🚨 | acordar o admin agora |

---

## Anti-spam

A função calcula um hash SHA-256 de `origem|tipo|titulo|mensagem`. Se chegar uma
notificação idêntica nos últimos **60 segundos**, ela **não reenvia** ao Telegram —
só incrementa `metadata.repeated` no log existente. No Mega Painel aparece um badge `×N`.

Isso evita inundar o canal e estourar o rate-limit do Telegram (30 msgs/seg).

---

## Como chamar de cada lugar

### Bash (VPS)
```bash
notify gateway erro "GPT-4o caiu" "timeout após 30s"
notify backup sucesso "Dump concluído" "1.2GB em 4min"
```

### Python (Elite Mapper)
```python
from notify import notify
notify("elite-mapper", "sucesso", "Varredura ok", "21.3GB em 8.3s",
       metadata={"duracao_s": 8.3})
```

### Edge function (Deno)
```ts
await fetch(`${SUPABASE_URL}/functions/v1/notify-telegram`, {
  method: "POST",
  headers: {
    "X-Notify-Key": Deno.env.get("NOTIFY_API_KEY")!,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    origem: "edge:meu-handler",
    tipo: "aviso",
    titulo: "Webhook lento",
    mensagem: "latência >2s",
  }),
});
```

### Node.js
```js
await fetch(`${SUPABASE_URL}/functions/v1/notify-telegram`, {
  method: "POST",
  headers: {
    "X-Notify-Key": process.env.NOTIFY_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ origem, tipo, titulo, mensagem }),
});
```

---

## Mega Painel (`/mega-painel`)

- Acessível por `https://<seu-painel>/mega-painel` (rota admin)
- Visual 3D Tátil "Esmeralda" (mesmo design do resto do projeto)
- Light + dark
- Filtros: período (1h / 24h / 7d / 30d), tipo, origem
- Feed ao vivo (esquerda) com fade-in em notificação nova
- Cards de resumo (direita): saúde geral, distribuição por tipo, top 5 origens, último crítico

---

## Segurança

- `NOTIFY_API_KEY` 48 chars random, gerada via `secrets--generate_secret`
- Mesma chave no Supabase secrets e em `/etc/centraldark/notify.env` (chmod 600)
- Edge function rejeita qualquer request sem header válido (401 imediato)
- RLS no `notifications_log` — só admin lê pelo app
- Service role só nas edge functions, nunca no frontend
- Sanitização de strings (limite de tamanho) e escape HTML pro Telegram
- Não loga payload sensível em texto claro

---

## Próximos passos (roadmap)

- [x] Tabela, edge function, hook e página em produção
- [ ] Instalação dos wrappers na VPS (`docs/NOTIFY/INSTALAR-VPS.md`)
- [ ] Filtro de IA pra resumir mensagem longa (>500 chars → 1 linha)
- [ ] Botão exportar CSV (24h / 7d / 30d)
- [ ] Health check ativo via cron (dead-man's switch)
- [ ] Hook Lovable → notifica quando IA edita/deploy
