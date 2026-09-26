# Rollback — Atendimento WhatsApp Gateway

Se algo der errado, basta remover o stack Atendimento. **O Baileys de Recargas Brasil não é afetado.**

```bash
# 1) Parar Gateway no PM2
pm2 stop atendimento-whatsapp-gateway
pm2 delete atendimento-whatsapp-gateway
pm2 save

# 2) Parar WuzAPI Atendimento (Docker)
cd /root/atendimento-whatsapp-gateway/wuzapi
docker compose down
# se quiser apagar dados:
# docker volume rm postgres-wuzapi-atendimento-data wuzapi-atendimento-data wuzapi-atendimento-files

# 3) Remover pasta
rm -rf /root/atendimento-whatsapp-gateway

# 4) Confirmar que Recargas Brasil continua intacto
pm2 status whatsapp-server
ls -la /root/whatsapp-server
ss -ltnp | grep ':3000'
```

Esperado: `whatsapp-server` ainda **online**, pasta `/root/whatsapp-server` intacta, porta 3000 ouvida pelo Baileys antigo.
