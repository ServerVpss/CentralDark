# COMANDO - DEPLOY_LOG.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\docs\DEPLOY_LOG.md
**SHA:** c11973757026c328
**Timestamp:** 2026-08-26T19:31:30.098440
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- **Próximo passo:** deploy via `multizap-gh-pull` na VPS → testar `curl /api/system/wuzapi-health` e `wuzapi-rollback` com `dry_run:true` → seguir Fase 5 (notificações + janela de manutenção).

### Padroes
- **Resumo:** documentação atualizada após incidente real na VPS: `.env` do Gateway estava correto, mas o dump do PM2 segurou `MULTIZAP_WEBHOOK_URL=https://atendimentoo.lovable.app/...` mesmo após `pm2 
- **Regra:** sempre que mudar `multizap-gateway-deploy/deploy-hooks/multizap-gh-pull.sh`, atualizar `/usr/local/bin/multizap-gh-pull` na VPS manualmente. Ver `mem://deploy-flow.md`.

### Ouro Bruto (primeiros 5000 chars)
```

## 2026-05-27 — Doc: regra anti-URL Lovable + drift de ENV no PM2
**Resumo:** documentação atualizada após incidente real na VPS: `.env` do Gateway estava correto, mas o dump do PM2 segurou `MULTIZAP_WEBHOOK_URL=https://atendimentoo.lovable.app/...` mesmo após `pm2 restart --update-env`. Healthcheck devolveu `degraded`, `URL_PROIBIDA_LOVABLE_PREVIEW`, `ENV_DIVERGENTE`. Nova regra: nunca confiar só no `.env`, sempre validar `pm2 env $ID`; se houver drift, fazer `delete` + `start` (não basta `restart`).
**Arquivos alterados:** `multizap-gateway-deploy/README_DEPLOY.md`, `multizap-gateway-deploy/README_ROLLBACK.md`, `multizap-gateway-deploy/SECURITY.md`, `multizap-gateway-deploy/CHANGELOG.md`, `docs/DEPLOY_LOG.md`, `.lovable/mem-changelog.md`, `mem://index.md`, `mem://pm2-env-drift.md`.
**Não tocado:** código do Gateway, WuzAPI, Docker, PM2 em si (só doc), CRM, banco/RLS, PIX, Central de IA, Meta, Recargas Brasil.
**Testes:** docs revisadas; build TanStack `EXIT=0`. Receita oficial de recuperação documentada e pronta para uso na VPS.
**Riscos:** zero (só documentação).
**Rollback:** reverter os 6 arquivos de doc + 2 de memória.
**Próximo passo:** quando houver novo deploy, seguir o pós-check obrigatório do `README_DEPLOY.md`.

## 2026-05-25 — HOTFIX 3B.0.1.c.1: aba Grupos do /app/chat
**Resumo:** corrigido filtro visual de grupos no `/app/chat`; grupos agora aparecem somente em “Grupos”, e não em “Todas”, “Não lidas” ou “Canais”.
**Arquivos alterados:** `src/components/nexchat/NexChatPage.tsx`, `.lovable/mem-changelog.md`, `mem://changelog.md`, `docs/DEPLOY_LOG.md`, `docs/DECISOES_TECNICAS.md`.
**Não tocado:** envio, webhook, banco/migration, Gateway, WuzAPI, Meta, RLS, service_role, PIX, recargas, pagamentos, `/root/whatsapp-server`, PM2, portas, permissões/transferências.
**Testes:** banco mostrou 0 `tickets.channel_type='group'`, 469 privados, e no feed recente 49/50 tickets com última mensagem `channel_type='group'`; código validado por busca nos filtros e clique lateral de Grupos.
**Rollback:** reverter `src/components/nexchat/NexChatPage.tsx` e esta documentação.

## 2026-05-24 — Backup: progresso real da VPS no painel
**Resumo:** o painel não ficava travado sem explicação em “aguardando a VPS”. Agora a VPS assume o pedido por `/api/public/backup-progress`, manda sinal de vida e atualiza cada etapa com mensagem simples até 100%.
**Arquivos alterados:** `src/routes/api/public/backup-progress.ts`, `src/components/backups/backup-live-progress.tsx`, `scripts/vps/multizap-backup-quick.sh`, `scripts/vps/INSTALL-backup.md`, migration `20260524133758_61f802dc-a853-4bb0-ab4d-0945d7636afe.sql`.
**Não tocado:** Recargas Brasil, `/root/whatsapp-server`, PM2 whatsapp-server, porta 3000, webhook 9001, PIX, Meta Cloud, Gateway de atendimento, WuzAPI core, RLS sensível.
**Testes:** `bash -n scripts/vps/multizap-backup-quick.sh` OK e busca confirmou rota/progresso/cron.
**Riscos:** precisa publicar e atualizar o script instalado na VPS; sem cron `--process-pending`, pedido manual ainda não será pego.
**Rollback:** reverter os arquivos acima e remover a rota `/api/public/backup-progress`; campos novos do banco podem ficar sem uso.
**Próximo passo:** publicar, rodar `multizap-gh-pull`, copiar `multizap-backup-quick.sh` para `/usr/local/bin/multizap-backup` e instalar o cron de 1 minuto.

## 2026-05-24 — Hotfix webhook QR privado: compatibilidade do endpoint antigo
**Sintoma:** logs do PM2 mostravam `Webhook recebido da WuzAPI` no Gateway, porém as mensagens privadas QR não apareciam no chat. O endpoint antigo do CRM `https://multizap.dev/api/public/wuzapi.webhook` retornava 404, enquanto o endpoint novo `/api/public/wuzapi/webhook` retornava 200.
**Correção:** criado alias TanStack para `/api/public/wuzapi.webhook` usando o mesmo handler autenticado do endpoint novo.
**Arquivos alterados:** `src/routes/api/public/wuzapi.webhook.ts`, `src/routes/api/public/wuzapi[.]webhook.ts`, `docs/WUZAPI_INBOUND_MULTIZAP.md`, `docs/DECISOES_TECNICAS.md`, `.lovable/mem-changelog.md`, `docs/DEPLOY_LOG.md`, `mem://changelog.md`, `mem://implementation-log.md`.
**Não tocado:** Gateway, WuzAPI/Whatsmeow, Meta Cloud, Recargas Brasil, `/root/whatsapp-server`, porta 3000, webhook 9001, PIX, banco/RLS/service_role.
**Testes:** antes do hotfix: `/api/public/wuzapi.webhook` = 404; `/api/public/wuzapi/webhook` = 200; `node --check` do Gateway OK.
**Riscos:** enquanto não publicar, produção ainda responde 404 no endpoint antigo.
**Rollback:** reverter os dois arquivos de rota do webhook.
**Próximo passo VPS:** após publicar, validar os dois GETs e enviar uma mensagem privada QR; se necessário reaplicar webhook da conexão pelo painel/Gateway.


## 2026-05-23 — Hotfix build produção: SIGABRT por falta de memória
**Sintoma:** publicação falhava com `AllocateRawWithRetryOrFailSlowPath`, `String::SlowFlatten`, `RegExpImpl::IrregexpExec` e `script "build" was terminated by signal SIGABRT`.
**Diagnóstico:** erro compatível com falta de memória durante build
```