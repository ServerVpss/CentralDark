# Deploy MultiZap — GitHub → VPS (totalmente isolado do Recargas)

> Regra de ouro: **não tocar** em `/root/whatsapp-server`, PM2 `whatsapp-server`,
> porta 3000, webhook 9001, gh-pull do Recargas, sessão `auth_info_baileys`.

## Nomes oficiais MultiZap

| Item | Valor |
|---|---|
| Pasta final na VPS | `/root/Multizap` |
| PM2 do Gateway | `MultiZap-Gateway` |
| PM2 do webhook | `MultiZap-GitHub-Webhook` |
| Script de deploy | `/usr/local/bin/multizap-gh-pull` |
| Listener | `/root/multizap-github-webhook-listener.js` |
| Porta do Gateway | `3100` |
| WuzAPI local | `127.0.0.1:8081` |
| Porta do webhook MultiZap | `9002` |
| Repo | `segredounlock/atendimentoo` |
| Branch | `main` |
| Log do deploy | `/var/log/multizap-gh-pull.log` |

## Passo a passo

1. **Baixar o pacote** `multizap-gateway-deploy.zip` (gerado pelo zip da pasta `multizap-gateway-deploy/`).
2. **Subir para VPS** (`scp` ou `rsync`) em `/tmp/multizap-gateway-deploy.zip`.
3. **Extrair em `/root/Multizap`**:
   ```bash
   mkdir -p /root/Multizap
   unzip /tmp/multizap-gateway-deploy.zip -d /tmp/mz && \
     rsync -a /tmp/mz/multizap-gateway-deploy/ /root/Multizap/
   ```
4. **Configurar segredos** (NÃO commitar):
   - `/root/Multizap/gateway/.env` (copiar de `.env.example` e preencher)
   - `/root/Multizap/wuzapi/.env`
5. **Instalar Docker** (se não tiver): `bash /root/Multizap/scripts/install-docker.sh`
6. **Subir WuzAPI**: `bash /root/Multizap/scripts/start-wuzapi.sh`
7. **Subir Gateway**:
   ```bash
   cd /root/Multizap/gateway && npm ci --omit=dev
   pm2 start ecosystem.config.cjs --only MultiZap-Gateway
   pm2 save
   ```
8. **Testar Gateway**:
   ```bash
   curl http://127.0.0.1:3100/health
   curl -H "Authorization: Bearer $MULTIZAP_GATEWAY_TOKEN" http://127.0.0.1:3100/connections
   ```
9. **Instalar deploy automático**:
   ```bash
   cp /root/Multizap/deploy-hooks/multizap-github-webhook-listener.js /root/
   cp /root/Multizap/deploy-hooks/multizap-gh-pull.sh /usr/local/bin/multizap-gh-pull
   chmod +x /usr/local/bin/multizap-gh-pull
   export MULTIZAP_GITHUB_WEBHOOK_SECRET="cole_aqui"
   pm2 start /root/Multizap/deploy-hooks/ecosystem.config.cjs
   pm2 save
   ```
10. **Configurar webhook no GitHub**:
    - Settings → Webhooks → Add
    - URL: `http://SEU_IP:9002/webhook`
    - Content type: `application/json`
    - Secret: idêntico a `MULTIZAP_GITHUB_WEBHOOK_SECRET`
    - Eventos: somente `push`
11. **Testar deploy automático**: faça commit em `main` e acompanhe
    `tail -f /var/log/multizap-gh-pull.log`.

## Confirmar que Recargas continua intacto

```bash
pm2 list                 # whatsapp-server e github-webhook devem estar online
ss -tulpn | grep -E "3000|3100|8081|9001|9002"
# 3000 = Recargas, 3100 = MultiZap, 8081 = WuzAPI, 9001 = Recargas, 9002 = MultiZap
```

## Rollback

- **Rollback do código MultiZap**: `git -C /root/Multizap-repo reset --hard <sha_anterior>` e
  rodar `/usr/local/bin/multizap-gh-pull`.
- **Parar MultiZap sem afetar Recargas**:
  ```bash
  pm2 stop MultiZap-Gateway
  pm2 stop MultiZap-GitHub-Webhook
  cd /root/Multizap/wuzapi && docker compose down
  ```
- **Remover MultiZap inteiro**: apagar `/root/Multizap`, `/root/Multizap-repo`,
  `/root/multizap-github-webhook-listener.js`, `/usr/local/bin/multizap-gh-pull`,
  `pm2 delete MultiZap-Gateway MultiZap-GitHub-Webhook`. Recargas segue inalterado.
