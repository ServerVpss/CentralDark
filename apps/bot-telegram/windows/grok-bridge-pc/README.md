# Grok Bridge PC (Windows 24/7)

## Arquitetura

```
Telegram → VPS bot (mensageiro)
         → /tmp/grok_request.json
         → PC worker (SSH pull)
         → Grok local + assinatura
         → /tmp/grok_response.json (SSH push)
         → VPS bot → Telegram
```

Claude / Plano na VPS **não** usam este fluxo.

## Requisitos no Windows

1. OpenSSH Client (`ssh`, `scp` no PATH)
2. Chave SSH da VPS (sem senha interativa)
3. CLI `grok` no PATH (ou `GROK_BIN`)
4. Node + PM2

## Setup

```powershell
mkdir E:\grok-bridge -Force
cd E:\grok-bridge
# copia worker.js deste repo:
#   apps/bot-telegram/windows/grok-bridge-pc/worker.js

$env:VPS_HOST="SEU_IP_VPS"
$env:VPS_USER="root"
$env:VPS_SSH_KEY="C:\Users\danda\.ssh\id_ed25519"
$env:GROK_BIN="grok"
$env:GROK_SIGNATURE="`n`n— via CentralDark Terminal (PC local)"

# teste SSH
ssh -i $env:VPS_SSH_KEY root@$env:VPS_HOST "echo ok && ls /tmp/grok_*.json 2>/dev/null"

pm2 delete grok-bridge-pc 2>$null
pm2 start worker.js --name grok-bridge-pc --update-env
pm2 save
pm2 logs grok-bridge-pc
```

## Teste

1. Telegram → @Guardiaonotify_bot → 🟣 Grok → 🟢 LIGAR → manda `oi`
2. No PC: `pm2 logs grok-bridge-pc` deve mostrar `pedido` + `resposta enviada`
3. Na VPS: `cat /tmp/grok_response.json`

## Formato

**Request (VPS escreve):**
```json
{ "id": "...", "chat_id": 123, "text": "oi", "history": [], "ts": "..." }
```

**Response (PC escreve):**
```json
{ "id": "mesmo-id", "chat_id": 123, "reply": "texto...\n\n— via ...", "ts": "..." }
```
