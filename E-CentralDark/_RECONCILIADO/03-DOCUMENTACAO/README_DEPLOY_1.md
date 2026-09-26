# Atendimento WhatsApp Gateway — Deploy

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
mkdir -p /root/atendimento-whatsapp-gateway

# 2) Subir/extrair o zip
unzip atendimento-whatsapp-gateway-deploy.zip -d /root/atendimento-whatsapp-gateway

# 3) Entrar
cd /root/atendimento-whatsapp-gateway

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
nano .env       # trocar GATEWAY_SERVER_TOKEN, WUZAPI_ADMIN_TOKEN, WUZAPI_WEBHOOK_SECRET
                # e configurar ATENDIMENTO_WEBHOOK_URL/SECRET apontando para o CRM
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
