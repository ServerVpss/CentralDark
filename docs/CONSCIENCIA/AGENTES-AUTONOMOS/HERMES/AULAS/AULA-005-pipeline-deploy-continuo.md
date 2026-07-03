# AULA-005 — Pipeline Deploy Contínuo (Webhook + PM2 + Docker + Supabase)

**Data:** 2026-07-03  
**Categoria:** procedimento  
**Pré-requisitos:** AULA-001 (Arsenal Council)  
**Tempo estimado:** 6 min  
**Origem:** DEBATE-001 (sugerida pelo Gemini como AULA faltante)

## 1. O que é
O elo que tira código do local e coloca em produção na VPS de forma automática, resiliente e observável. Fluxo: **Editor (Local/Lovable) → GitHub push → Webhook VPS → Pull + restart PM2/Docker → Notificação Telegram**.

## 2. Quando usar
- Toda vez que um microsserviço/bot/edge function precisar rodar 24/7 na VPS
- Quando quiser que `git push` seja o único gatilho de deploy
- Pra evitar "editei na VPS direto e esqueci de commitar" (proibido pela regra do CLAUDE.md)

## 3. Como fazer (passo-a-passo)
1. **Código no GitHub** — commit + push na `main` (Lovable ou local)
2. **Webhook dispara** em `scripts/webhook/` na VPS (área protegida 🔒)
3. **Pull automático** em `/root/CentralDark/`
4. **Restart do serviço afetado**: `pm2 restart <nome>` OU `docker restart <container>` OU `supabase functions deploy <nome>`
5. **`pm2 save`** após qualquer mudança de estado (senão perde no reboot)
6. **Notificação Telegram** (AULA-003) reporta sucesso/falha

## 4. Comandos prontos
```bash
# Verificar estado atual dos serviços
pm2 list && docker ps

# Restart de módulo específico
pm2 restart CentralDark-HubBot  # bot @srver1bot
docker restart open-webui        # tema Esmeralda
docker restart cd-tools          # sidecar Arsenal (porta 9077)

# Persistir estado após mudanças
pm2 save

# Ver logs pós-deploy
pm2 logs --lines 50
docker logs open-webui --tail 50
```

## 5. Armadilhas
- ❌ Editar arquivo na VPS direto — próximo pull sobrescreve (fonte da verdade é o GitHub)
- ❌ `pm2 restart all` — pode subir o `whatsapp-server` (PM2 id 1) que deve ficar `stopped`
- ❌ Esquecer `pm2 save` — no reboot volta pro estado antigo
- ❌ Mexer em `scripts/webhook/` sem autorização (área protegida 🔒)
- ❌ Deploy edge function sem rodar skill `audit-rls` antes (pré-deploy obrigatório)

## 6. Verificação
- ✅ `pm2 list` mostra o serviço `online` com uptime resetado
- ✅ `docker ps` mostra container `Up X seconds`
- ✅ Notificação Telegram entregue (admin + canal Status)
- ✅ `/health` do serviço retorna 200

## 7. Ver também
- AULA-001 (Arsenal Council — o que roda depois do deploy)
- AULA-003 (Telegram — como notificar)
- ROTAS-FIXAS/webui-reload.md (caso específico WebUI)
- DEBATES/001-gemini-sugere-aula-pipeline.md (origem desta aula)
