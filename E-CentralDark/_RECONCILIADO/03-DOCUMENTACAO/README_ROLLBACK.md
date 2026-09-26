# Rollback — Atendimento WhatsApp Gateway

Se algo der errado, basta remover o stack Atendimento. **O Baileys de Recargas Brasil não é afetado.**

```bash
# 1) Parar Gateway no PM2
pm2 stop MultiZap-Gateway
pm2 delete MultiZap-Gateway
pm2 save

# 2) Parar WuzAPI Atendimento (Docker)
cd /root/Multizap/wuzapi
docker compose down
# se quiser apagar dados:
# docker volume rm postgres-wuzapi-atendimento-data wuzapi-atendimento-data wuzapi-atendimento-files

# 3) Remover pasta
rm -rf /root/Multizap

# 4) Confirmar que Recargas Brasil continua intacto
pm2 status whatsapp-server
ls -la /root/whatsapp-server
ss -ltnp | grep ':3000'
```

Esperado: `whatsapp-server` ainda **online**, pasta `/root/whatsapp-server` intacta, porta 3000 ouvida pelo Baileys antigo.

---

## Recuperação parcial — PM2 com ENV antigo (drift de dump)

Se o problema for apenas o ENV errado no PM2 (e não código quebrado), **não** faça rollback total. Use a receita do `README_DEPLOY.md` → seção "Pós-deploy obrigatório — validar ENV real do PM2" → "Se `.env` está certo mas PM2 está errado".

Resumo:

```bash
cp /root/.pm2/dump.pm2 /root/.pm2/dump.pm2.bak-$(date +%F-%H%M%S)
set -a; . /root/Multizap/gateway/.env; set +a
pm2 delete MultiZap-Gateway
pm2 start /root/Multizap/gateway/server.js --name MultiZap-Gateway \
  --cwd /root/Multizap/gateway --update-env
pm2 save
ID=$(pm2 id MultiZap-Gateway | tr -d '[] ')
pm2 env "$ID" | grep -E 'MULTIZAP_WEBHOOK_URL|NODE_ENV|LOG_LEVEL'
curl -s http://127.0.0.1:3100/health | head -c 800; echo
```

O dump antigo fica salvo em `/root/.pm2/dump.pm2.bak-<timestamp>` caso precise restaurar.

**Importante:** `pm2 restart --update-env` sozinho **não resolve** drift de dump. Tem que `delete` + `start` para reconstruir o env do processo.
