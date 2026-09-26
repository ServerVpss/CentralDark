# Atendimento WhatsApp Gateway — Deploy

## Endpoints (todos exigem `Authorization: Bearer $MULTIZAP_GATEWAY_TOKEN`, exceto `/health` e `/webhooks/wuzapi`)

### Conexões
- `POST /connections` — body `{ workspace_id, name, label? }` → cria sessão na WuzAPI e retorna `{ connection_id, workspace_id, provider:"wuzapi", status:"qr", ... }` (token interno **não** é retornado).
- `GET /connections?workspace_id=...` — lista conexões do workspace (sem tokens).
- `GET /connections/:id/qr` → `{ connection_id, status:"qr", qr, qr_base64, expires_in:60 }`.
- `GET /connections/:id/status` → `{ connection_id, status, phone_number, last_connected_at, last_disconnected_at }`.
- `POST /connections/:id/restart` — reconecta a sessão.
- `POST /connections/:id/logout` — desconecta.
- `DELETE /connections/:id` — remove sessão na WuzAPI e no store local.

### Mensagens
- `POST /messages/send-text` — body `{ connection_id, to, message }`.
- `POST /messages/send-media` — body `{ connection_id, to, type:"image|video|audio|document", media_url, caption? }`.

### Webhook
- `POST /webhooks/wuzapi?connection_id=...` — recebe eventos da WuzAPI (header `x-wuzapi-secret`), normaliza e encaminha pra `MULTIZAP_WEBHOOK_URL`.

## Como testar (na VPS)
```bash
TOKEN="$MULTIZAP_GATEWAY_TOKEN"
curl -sS http://127.0.0.1:3100/health
curl -sS -X POST http://127.0.0.1:3100/connections \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"workspace_id":"teste-workspace","name":"WhatsApp Principal","label":"Atendimento Comercial"}'
# pegar connection_id da resposta
CID="..."
curl -sS http://127.0.0.1:3100/connections/$CID/qr     -H "Authorization: Bearer $TOKEN"
curl -sS http://127.0.0.1:3100/connections/$CID/status -H "Authorization: Bearer $TOKEN"
curl -sS http://127.0.0.1:8081/ -o /dev/null -w "WUZAPI HTTP %{http_code}\n"
pm2 list
```

## 🛡️ Pré-deploy obrigatório — guardião de URLs de produção

Antes de qualquer deploy/commit, rode na raiz do repo:

```bash
bash scripts/check-production-urls.sh
```

O que ele faz:
- Procura qualquer URL `lovable.app`, `lovable.dev`, `lovableproject.com` ou `atendimentoo.lovable.app` em arquivos ativos de produção.
- Ignora `.git`, `node_modules`, `dist`, `build`, e arquivos de histórico (changelog, deploy log, rollback) que só explicam o incidente antigo.
- **Sai com código 1 se achar** → deploy NÃO pode ser considerado saudável.

Se falhar, corrige automaticamente (sem tocar em token/secret/.env):

```bash
bash scripts/fix-production-urls.sh           # dry-run, mostra o que mudaria
bash scripts/fix-production-urls.sh --apply   # aplica de verdade
bash scripts/check-production-urls.sh         # revalida
```

Substituições que o `fix` faz:
- `*.lovable.app/api/public/wuzapi/webhook` → `https://multizap.dev/api/public/wuzapi/webhook`
- `*proxy*.lovable.app` → `https://proxy.multizap.dev`
- `*.lovable.app` / `*.lovable.dev` / `*.lovableproject.com` → `https://multizap.dev`

Como interpretar o erro: o script imprime `arquivo:linha:conteúdo` de cada ocorrência. Toda linha listada precisa virar `multizap.dev` antes de seguir. Se a ocorrência for legítima (ex.: doc histórica nova), adicione o caminho do arquivo em `EXCLUIR_ARQUIVOS` dentro do próprio script.

## ⚠️ Pós-deploy obrigatório — validar ENV real do PM2

> Aprendizado do incidente 2026-05-27: o arquivo `.env` estava correto, mas o **dump do PM2** continuava com `MULTIZAP_WEBHOOK_URL` apontando pra `https://atendimentoo.lovable.app/...` (URL de preview, proibida em produção). O `pm2 restart --update-env` **não foi suficiente** — o dump segurou o env antigo.

### Regra permanente

**Nunca confiar só no `.env`.** Sempre conferir o ENV real que o PM2 carregou no processo:

```bash
ID=$(pm2 id MultiZap-Gateway | tr -d '[] ')
pm2 env "$ID" | grep -E 'MULTIZAP_WEBHOOK_URL|NODE_ENV|LOG_LEVEL'
```

**Resultado esperado:**
```
MULTIZAP_WEBHOOK_URL: https://multizap.dev/api/public/wuzapi/webhook
NODE_ENV: production
```

**Proibido aparecer:** `lovable.app`, `lovable.dev`, `lovableproject.com`, `atendimentoo.lovable.app`.

### Healthcheck também precisa estar limpo

```bash
curl -s http://127.0.0.1:3100/health | head -c 800; echo
```

Se vier `status: degraded`, `urls_ok: false`, `parity_ok: false`, `URL_PROIBIDA_LOVABLE_PREVIEW` ou `ENV_DIVERGENTE` → **deploy NÃO está saudável**, não considerar concluído.

### Se `.env` está certo mas PM2 está errado — receita oficial

Quando o dump do PM2 está preso no env antigo, `pm2 restart --update-env` **não resolve**. Precisa recriar só o processo MultiZap-Gateway:

```bash
cd /root/Multizap/gateway || exit 1

# 1) Backup do dump atual
cp /root/.pm2/dump.pm2 /root/.pm2/dump.pm2.bak-$(date +%F-%H%M%S)

# 2) Carrega .env no shell
set -a
. /root/Multizap/gateway/.env
set +a

# 3) Recria o processo (delete + start)
pm2 delete MultiZap-Gateway
pm2 start /root/Multizap/gateway/server.js \
  --name MultiZap-Gateway \
  --cwd /root/Multizap/gateway \
  --update-env
pm2 save

# 4) Confirma ENV real
ID=$(pm2 id MultiZap-Gateway | tr -d '[] ')
pm2 env "$ID" | grep -E 'MULTIZAP_WEBHOOK_URL|NODE_ENV|LOG_LEVEL'

# 5) Confirma healthcheck
curl -s http://127.0.0.1:3100/health | head -c 800; echo
```

Não fazer `pm2 restart all` nem `pm2 resurrect` durante essa receita — só atua no `MultiZap-Gateway`.

## Rollback
- Reverter commit no GitHub → `multizap-gh-pull` aplica.
- Não toca em `/root/whatsapp-server`, PM2 `whatsapp-server`, porta 3000, webhook 9001, `auth_info_baileys`.

---



Pacote isolado para subir o **CRM Atendimento** com WuzAPI/Whatsmeow, **sem tocar** no servidor Baileys de Recargas Brasil.

## Portas

| Serviço | Porta | Observação |
|---|---|---|
| Baileys antigo (Recargas Brasil) | **3000** | NÃO USAR. NÃO PARAR. |
| Atendimento Node Gateway | **3100** | novo, isolado |
| WuzAPI local (Docker) | **8081** | só loopback `127.0.0.1` |

## Passo a passo na VPS

```bash
# 1) Criar pasta
mkdir -p /root/Multizap

# 2) Subir/extrair o zip
unzip multizap-gateway-deploy.zip -d /root/Multizap

# 3) Entrar
cd /root/Multizap

# 4) Instalar Docker (somente se ainda não tiver)
bash scripts/install-docker.sh

# 5) Configurar WuzAPI
cd wuzapi
cp .env.example .env
nano .env       # trocar TODOS os tokens/senhas
cd ..

# 6) Configurar Gateway
cd gateway
cp .env.example .env
nano .env       # trocar MULTIZAP_GATEWAY_TOKEN, WUZAPI_ADMIN_TOKEN, WUZAPI_WEBHOOK_SECRET
                # e configurar MULTIZAP_WEBHOOK_URL/SECRET apontando para o CRM
cd ..

# 7) Subir WuzAPI (Docker)
bash scripts/start-wuzapi.sh

# 8) Subir Gateway (PM2)
bash scripts/start-gateway.sh

# 9) Testar saúde
curl http://127.0.0.1:3100/health

# 10) Criar conexão
curl -X POST http://127.0.0.1:3100/connections \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"workspace_id":"teste","name":"WhatsApp Principal","label":"Atendimento Comercial"}'

# 11) Ver QR
curl http://127.0.0.1:3100/connections/CONNECTION_ID/qr \
  -H "Authorization: Bearer SEU_TOKEN"

# 12) Enviar teste
curl -X POST http://127.0.0.1:3100/messages/send-text \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"connection_id":"CONNECTION_ID","to":"5585999999999","message":"Teste Atendimento Gateway"}'
```

## Status e logs

```bash
bash scripts/status.sh
bash scripts/logs.sh
```

## Encerrar (sem afetar Recargas Brasil)

```bash
bash scripts/stop-gateway.sh
```

Veja também: `README_ROLLBACK.md`, `SECURITY.md`.

## Fluxo de conexão WhatsApp (corrigido em 2026-05-20)
1. `POST /connections` → Gateway gera `session_token` e cria usuário na WuzAPI (`POST /admin/users` com `{name, token}`).
2. `GET /connections/:id/qr` → Gateway chama `POST /session/connect` (Subscribe=["Message"], Immediate=true) + `GET /session/qrcode`. Retorna `{connection_id, status:"qr", qr, qr_base64, expires_in:60}`.
3. `GET /connections/:id/status` → Gateway consulta `GET /session/status` e sincroniza `connections.json`. Retorna `qr` antes do scan, `connected` + `phone_number` após.

Códigos de erro do `/qr`: `no_credentials` (400), `connect_failed` (502), `qr_failed` (502), `qr_empty` (502).
