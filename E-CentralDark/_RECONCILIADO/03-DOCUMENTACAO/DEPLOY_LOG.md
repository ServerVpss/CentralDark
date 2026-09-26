
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
**Diagnóstico:** erro compatível com falta de memória durante build/varredura por regex. O projeto tinha arquivos grandes dentro de `src` que não precisam ser escaneados por Tailwind para classes (`src/routeTree.gen.ts` gerado e `src/integrations/supabase/types.ts` gerado).
**Correção:** `package.json` aumenta heap do Node no build para 4096 MB; `src/styles.css` exclui `routeTree.gen.ts` e `src/integrations/supabase` da varredura Tailwind.
**Arquivos alterados:** `package.json`, `src/styles.css`, `.lovable/mem-changelog.md`, `docs/DEPLOY_LOG.md`, `docs/DECISOES_TECNICAS.md`.
**Não tocado:** Gateway/WuzAPI/VPS, dados, RLS, autenticação, PIX, Meta Cloud, Recargas Brasil, `/root/whatsapp-server`, porta 3000, webhook 9001.
**Rollback:** reverter os dois arquivos funcionais (`package.json` e `src/styles.css`).

## 2026-05-23 — Incidente: `/usr/local/bin/multizap-gh-pull` desatualizado disparou rollback falso
**Sintoma:** após deploy da Fase 4.5, `/api/system/wuzapi-health` e `/wuzapi-rollback` respondiam `{"ok":false,"error":{"code":"not_found"}}`.
**Causa:** o binário `/usr/local/bin/multizap-gh-pull` na VPS era versão antiga e fazia healthcheck na porta **9002** (webhook do GitHub) em vez de **3100** (Gateway). 9002 não abre nunca → o próprio script disparou ROLLBACK automático pro commit `2163b54`, apagando `system.routes.js` novo e `scripts/rollback-wuzapi.sh` do disco. PM2 restart manual depois disso só reiniciava código velho.
**Fix:** copiar a versão nova do repo por cima do binário:
```bash
cp /root/Multizap-repo/multizap-gateway-deploy/deploy-hooks/multizap-gh-pull.sh /usr/local/bin/multizap-gh-pull
chmod +x /usr/local/bin/multizap-gh-pull
/usr/local/bin/multizap-gh-pull
```
**Validação esperada após fix:** logs do deploy mostram `Aguardando porta 3100 abrir` e NÃO mostram linha `ROLLBACK`. `grep wuzapi-health /root/Multizap/gateway/src/routes/system.routes.js` retorna match. `curl -H "Authorization: Bearer $MULTIZAP_GATEWAY_TOKEN" http://127.0.0.1:3100/api/system/wuzapi-health` retorna JSON com `gateway_ok`, `wuzapi_ok`, `pm2_status`, `docker_status`.
**Regra:** sempre que mudar `multizap-gateway-deploy/deploy-hooks/multizap-gh-pull.sh`, atualizar `/usr/local/bin/multizap-gh-pull` na VPS manualmente. Ver `mem://deploy-flow.md`.


## 2026-05-23 — Fase 4.5: Endpoints reais de health/rollback no Gateway
**Motivo:** Fase 4 (monitor pós-deploy + auto-rollback) dependia de `/api/system/wuzapi-health` e `/api/system/wuzapi-rollback` no Gateway. Sem eles, o monitor do painel master não consegue verificar saúde real nem reverter.
**Mudança:**
- `multizap-gateway-deploy/gateway/src/routes/system.routes.js`: adicionados `GET /wuzapi-health` (gateway+wuzapi+pm2+docker+commit+diag snapshot) e `POST /wuzapi-rollback` (com `dry_run`, validação local da imagem alvo, rollback offline preservando volumes).
- `multizap-gateway-deploy/scripts/rollback-wuzapi.sh`: novo script — retag da imagem alvo + `docker compose up -d --no-deps wuzapi` + healthcheck 60s. Nunca usa `-v`.
- `docs/WUZAPI_WHATSMEOW_UPDATE_CENTER.md`: criado — documenta as 5 fases + payloads dos endpoints + curl de teste + rollback manual de emergência.
**Segurança:** Bearer obrigatório, painel valida `is_super_admin`, rollback offline (sem `docker pull`), nunca expõe tokens/secrets/`WUZAPI_DB_URL`/`service_role`. Não toca `/root/whatsapp-server`, porta 3000, Recargas Brasil. Não usa `pm2 restart all`.
**Testes:** `node --check` no `system.routes.js`, `bash -n` no `rollback-wuzapi.sh`, curl dry-run na VPS (ver doc).
**Não tocado:** Fase 1–4 do CRM (intactas), demais rotas do Gateway, PIX, Meta Cloud.
**Rollback:** reverter os 3 arquivos desta entrada.
**Próximo passo:** deploy via `multizap-gh-pull` na VPS → testar `curl /api/system/wuzapi-health` e `wuzapi-rollback` com `dry_run:true` → seguir Fase 5 (notificações + janela de manutenção).
## 2026-05-21 — WuzAPI normalizador gravado direto no GitHub main
- **Motivo:** VPS continuava puxando `0aa6447 Fast Visual Edit`; o GitHub main ainda tinha `normalizeService.js` antigo, então o deploy automático sobrescrevia a correção.
- **Ação:** commit direto no branch `main` via API do GitHub usando a integração segura do painel master.
- **Arquivos:** `multizap-gateway-deploy/gateway/src/services/normalizeService.js` e `atendimento-whatsapp-gateway-deploy/gateway/src/services/normalizeService.js`.
- **Validação:** o arquivo do GitHub main precisa conter `jsonData`, `ChatPresence`, `HistorySync` e `ReadReceipt`; após `/usr/local/bin/multizap-gh-pull`, o grep na VPS deve retornar maior que 0.
- **Rollback:** reverter o commit novo no GitHub main ou restaurar os dois normalizadores anteriores.
- **Não tocado:** Recargas Brasil, `/root/whatsapp-server`, porta 3000, webhook 9001, PIX, Meta Cloud, RLS.
- **Próximo passo:** rodar `/usr/local/bin/multizap-gh-pull` na VPS e conferir `pm2 logs MultiZap-Gateway --lines 80 | grep -E "webhook_wuzapi_in|forwarded_to_multizap"`.

## 2026-05-21 — Correção crítica: Remover QR não reconecta sozinho

Bug: depois de “Remover”, o sistema apagava a conexão, mas algum fluxo visual ainda disparava criação/QR novamente (`POST /admin/users`, `POST /connections`, `POST /session/connect`, `GET /session/qr`).

Correção aplicada:
- Modal QR não cria mais conexão só por abrir; ele só checa o Gateway e aguarda clique explícito.
- “Conectar WhatsApp” e “Gerar novo QR” são os únicos pontos que podem criar/gerar QR.
- Polling/timers do modal são limpos ao fechar.
- Auto-restart do card QR foi removido; conexão caída não religa sozinha.
- “Desconectar” no QR faz logout e mantém o cadastro como `disconnected`.
- “Remover” apaga no Gateway + banco e pausa o sync por alguns segundos para não ressurgir visualmente.

Não alterado: Recargas Brasil, `/root/whatsapp-server`, PM2 `whatsapp-server`, porta 3000, webhook 9001, `auth_info_baileys`, Docker, Caddy, WuzAPI compose, envio Meta, parser PIX e cobrança automática.

Rollback: reverter `src/components/whatsapp/WhatsAppQrConnectionModal.tsx`, `src/components/whatsapp/WhatsAppQrProviderCard.tsx`, `src/components/whatsapp/ConnectedChannelsSection.tsx`, `src/routes/app.canais.tsx` e `src/lib/whatsapp.functions.ts`.

## 2026-05-20 — Correção da doc de rollback do checkpoint QR MultiZap

Doc anterior recomendava, como fallback do checkpoint QR, "voltar o secret `MULTIZAP_GATEWAY_URL` pro IP+porta antigo (`http://89.117.78.124:3100`)". Isso está **errado**: quebra chamadas via Cloudflare/Lovable (mixed content em página HTTPS + bloqueio SSRF a IP literal) e expõe IP da VPS. Endpoint HTTP segue deprecado.

**Rollback correto** (sempre mantendo `MULTIZAP_GATEWAY_URL=https://proxy.multizap.dev`):
1. Reverter o último commit do `src/components/whatsapp/WhatsAppQrConnectionModal.tsx`; ou
2. Ocultar temporariamente o card "WhatsApp QR MultiZap" no frontend; ou
3. Desligar somente a feature flag do QR, se existir.

Arquivos atualizados: `docs/DECISOES_TECNICAS.md` (item 19), `docs/SEGURANCA_DEPLOY_MULTIZAP.md` (bloco novo "Rollback do checkpoint QR MultiZap"), `.lovable/plan.md` (seção Risco) e `.lovable/mem-changelog.md`.

Nada de infra tocado: Caddy, WuzAPI, Docker, MultiZap-Gateway, Recargas Brasil, `/root/whatsapp-server`, PM2 `whatsapp-server`, porta 3000 e webhook 9001 seguem intactos.

---

## 2026-05-20 — Gateway HTTPS em produção + Modal QR responsivo

**Gateway**: secret `MULTIZAP_GATEWAY_URL` atualizado de `http://89.117.78.124:3100` para `https://proxy.multizap.dev`. Caddy + Let's Encrypt cuidam do TLS (renovação automática, 90 dias). Cert produção validado, sem mais staging rate-limit.

**Testes ponta-a-ponta** (todos OK):
- `GET /health` → 200 em ~270ms.
- `GET /connections` → 200, lista atual íntegra.
- `POST /connections` → 201, devolve `connection_id` + `status=qr`.
- `GET /connections/:id/qr` → 200, QR em `data:image/png;base64,...`.
- `GET /connections/:id/status` → 200, `status=qr` enquanto não escaneia.
- `DELETE /connections/:id` → 200 (limpeza após teste).

**Frontend**: `WhatsAppQrConnectionModal` agora é fullscreen no mobile (`h-[100dvh]`), QR ocupa até 20rem em celulares e botões viraram `h-12` pra toque. Lista de conexões já era responsiva (grid de 3 botões no mobile, flex no desktop).

**Não tocado**: Docker, WuzAPI, Caddy, deploy hook, `/root/whatsapp-server`, PM2 `whatsapp-server`, porta 3000, webhook 9001, Recargas Brasil.

# DEPLOY_LOG — MultiZap

## 2026-05-20 — Gateway: normalização do fluxo de QR/status
- `connectionService.getQr()` retorna `{ connection_id, status, qr, qr_base64, expires_in }` — DTO consumível direto pelo frontend.
- `connectionService.getStatus()` retorna `{ connection_id, status, phone_number, last_connected_at, last_disconnected_at }` e sincroniza store local quando o status remoto muda.
- Endpoints inalterados (já existiam): `POST /connections`, `GET /connections/:id/qr`, `GET /connections/:id/status`.
- Recargas, PM2 `whatsapp-server`, porta 3000, webhook 9001: intocados.

## 2026-05-20 — Deploy VALIDADO end-to-end na VPS
**Status final**: GitHub push → webhook 9002 → `multizap-gh-pull` → rsync → WuzAPI Docker up → `MultiZap-Gateway` restart → `/health:3100` OK. Tudo verde.

**Correção que destravou a WuzAPI** (estava em loop de restart com `lookup postgreswuzapi on 127.0.0.53:53 connection refused`):
- Removido atributo obsoleto `version:` do `docker-compose.yml`.
- Adicionado alias de rede `postgres` no serviço `postgreswuzapi`.
- `DB_HOST=postgres` (não mais `postgreswuzapi`).
- `depends_on` com `condition: service_healthy` mantido.
- Project name `multizap-gateway`, sem `container_name` fixo.
- Porta `127.0.0.1:8081:8080`, imagem `asternic/wuzapi:latest`.

**Logs WuzAPI confirmaram**: `Encryption key loaded from environment variable`, `Global HMAC key configured from environment variable`, `Server started. Waiting for connections... port=8080`.

**Healthchecks**: `curl http://127.0.0.1:8081/` → 200; `curl http://127.0.0.1:3100/health` → OK.

**Recargas intocado**: `/root/whatsapp-server`, PM2 `whatsapp-server`, porta 3000, webhook 9001.

**Pendência**: limpar pastas antigas dentro de `/root/Multizap/` (rsync reclama de `cannot delete non-empty directory` mas não impede deploy). Só limpar com plano de rollback.

---


## 2026-05-20 — Pós-teste real: deploy obrigado a falhar se WuzAPI falhar
- **Teste real na VPS funcionou parcialmente**: webhook MultiZap recebeu o push, `/usr/local/bin/multizap-gh-pull` rodou, `/root/Multizap-repo` atualizou, pacote sincronizou pra `/root/Multizap`, `MultiZap-Gateway` reiniciou e `/health` em 3100 respondeu OK.
- **Falha identificada**: WuzAPI não subiu por `Conflict. The container name "/postgreswuzapi" is already in use` (container antigo com `container_name` fixo). Pior: o script só logou "AVISO seguindo" e o deploy declarou sucesso falso.
- **Correções aplicadas**:
  - `docker-compose.yml`: removido `container_name` dos dois serviços; project name fixo `multizap-gateway`; serviços `postgreswuzapi` e `wuzapi`. DNS interno continua via nome do serviço (`DB_HOST=postgreswuzapi`).
  - `scripts/start-wuzapi.sh`: usa `docker compose up -d --remove-orphans`, falha com `exit 1` se compose falhar ou se porta 8081 não responder em 60s. NUNCA usa `-v` nem remove volumes/sessões.
  - `deploy-hooks/multizap-gh-pull.sh`: se `start-wuzapi.sh` falhar, deploy aborta com `exit 1`. Sucesso só é declarado se WuzAPI subiu + porta 8081 respondeu + Gateway subiu + `/health:3100` respondeu.
- **Recargas Brasil**: `/root/whatsapp-server`, PM2 `whatsapp-server`, porta 3000, webhook 9001 — intocados.

## 2026-05-20 — WuzAPI: imagem Docker Hub, chaves globais, healthcheck no start
- `docker-compose.yml`: imagem `asternic/wuzapi:latest`, serviço Postgres renomeado para `postgreswuzapi`, porta `127.0.0.1:${WUZAPI_PORT:-8081}:8080`, environment com `WUZAPI_GLOBAL_ENCRYPTION_KEY`, `WUZAPI_GLOBAL_HMAC_KEY` e `TZ` default `America/Sao_Paulo`. Volumes/network renomeados com sufixo `-multizap`.
- `.env.example`: banco `wuzapi_multizap`, todas as chaves listadas vazias pra forçar preenchimento.
- `scripts/start-wuzapi.sh`: agora valida variáveis obrigatórias, aguarda até 60s a porta responder e falha com `exit 1` se WuzAPI não subir (antes só avisava e seguia).
- Recargas Brasil intocado.


## 2026-05-20 — Pacote `multizap-gateway-deploy` criado

- Substitui o antigo `atendimento-whatsapp-gateway-deploy` (nome removido de
  scripts/PM2/pacotes; mantido apenas em documentação de migração).
- Deploy automático novo e **isolado** do Recargas Brasil:
  - PM2 `MultiZap-GitHub-Webhook` na porta `9002`.
  - PM2 `MultiZap-Gateway` na porta `3100`.
  - Script `/usr/local/bin/multizap-gh-pull` opera só em `/root/Multizap`.
- Recargas Brasil **intocado**: `/root/whatsapp-server`, PM2 `whatsapp-server`,
  porta `3000`, gh-pull (`9001`).
- Próximo passo: gerar `multizap-gateway-deploy.zip` e subir para VPS.

## 2026-05-20 — Fix fluxo QR
Sintoma na VPS: `POST /admin/users` OK, mas `GET /qr` → 500 `qr_failed` e `GET /status` → `error`. Causa: Gateway usava header `token` (minúsculo) em vez de `Token`, e não chamava `/session/connect` antes do QR. Corrigido em `wuzapiClient.js` + `connectionService.js`. Conexões antigas (criadas sem `session_token`) precisam ser recriadas via `POST /connections`.

## 2026-05-20 — Fix modal QR (falso connected)

Problema: modal exibia "WhatsApp conectado!" sem scan real.
Causa: confiava em `status` cru do Gateway, que repassa shape WuzAPI sem normalizar.
Solução: normalização no server function + guard no modal (`status==="connected" && phone_number`).
Nenhuma mudança no Gateway/WuzAPI/Caddy/Docker.

## 2026-05-21 — Guard `user_initiated` no createQrConnection
Sem deploy de infra. Apenas código de aplicação (TanStack server fn). Não toca Gateway, WuzAPI, Docker ou Caddy.

## 2026-05-21 — Auditoria cadastro usuários
Apenas código de aplicação. Sem deploy de infra. Sem mudanças em Gateway, WuzAPI, Docker ou Caddy.

## 2026-05-21 — Rate limit + signup público
- Migração: rate_limits, consume_rate_limit, master_settings.public_signup_enabled, get_master_public_settings recriada, handle_new_user atualizado.
- Sem alterações em Recargas Brasil, /root/whatsapp-server, PM2, WuzAPI, Gateway, Docker, Caddy, parser PIX, cobrança automática.

## 2026-05-21 — Auditoria fail-closed
Sem alteração de código. Apenas documentação criada/corrigida: RATE_LIMIT_BACKOFF_MULTIZAP.md, SEGURANCA_WORKSPACE.md, DECISOES_TECNICAS.md.

## 2026-05-21 — Audit_log de Modo Intervenção (/admin/inbox)
Toda ação operacional do super_admin em /admin/inbox com Modo intervenção ON é registrada em audit_log com actions:
`admin:inbox_intervention_message`, `admin:payment_command_intervention`, `admin:inbox_intervention_claim`, `admin:inbox_intervention_close`, `admin:inbox_intervention_rename_contact`, `admin:inbox_intervention_transfer`.
Payload nunca contém conteúdo da mensagem, tokens, session_token, PIX copia-cola ou QR. Workspace_id é sempre o do dropdown (cliente), nunca o do master. /app/inbox normal não gera essas actions. Modo somente leitura bloqueia composer e ações, então não há o que auditar.

### 2026-05-21 — Fase 7.2 NexChat (visual)
Apenas CSS (sem deploy backend). Rollback = toggle OFF em /admin/aparencia.

## 2026-05-21 — Fase 7.2 deploy
- CSS only + 2 tsx (bubble image fallback, panel empty states).
- Zero migration. Zero backend. Rollback = git revert nos 3 arquivos.

## 2026-05-21 — Fase 7.4 (/app/chat fiel ao template)
- 2 componentes novos (NexChatEmptyState, NexContactInfoSidebar)
- NexChatPage refatorado (empty + sidebar dir + header com matriz de capabilities)
- CSS ~220 linhas novas (.nx-chat-empty, .nx-info-sidebar, .nx-icon-btn[data-disabled])
- index.ts: export dos 2 novos componentes
- docs/WHATSAPP_PROVIDER_CAPABILITIES.md criado
- Zero backend. Zero migration. Toggle OFF rola fallback instantâneo.
- Rollback: git revert dos arquivos modificados + apagar os 2 novos componentes.

## NexChat fullscreen em /app/chat
- Arquivo: `src/routes/app.tsx` (short-circuit no AppLayout).
- Sem migração, sem mudança de backend.
- Rollback: toggle NexChat OFF em `/admin/aparencia`.

## 2026-05-21 — Force-sync reapply-webhook (Gateway)
- Rota `POST /connections/:id/reapply-webhook`, `reapplyWebhook()`, `ensureWebhookConfigured()` e botão em /app/canais já existiam localmente, mas o `main` do GitHub estava parado em `13b7db9` e a VPS baixava código sem a rota.
- Esta entrada força nova sincronização Lovable→GitHub para gerar commit novo acima de `13b7db9` com os arquivos do Gateway.
- Validação pós-deploy na VPS:
  1. `cd /root/Multizap-repo && git fetch origin main && git log --oneline -3 origin/main` → commit novo no topo.
  2. `/usr/local/bin/multizap-gh-pull` → deploy.
  3. `grep -Rn "reapply-webhook" /root/Multizap/gateway/src` → linha encontrada.
  4. `curl -i -X POST "http://127.0.0.1:3100/connections/eac181c9-a249-49cb-ab77-70fc76f3a7bb/reapply-webhook" -H "Authorization: Bearer $MULTIZAP_GATEWAY_TOKEN"` → HTTP 200 + `webhook_reapplied:true`.
- Sem mudança funcional. Sem alteração em PIX, Recargas Brasil, whatsapp-server, porta 3000, webhook 9001, RLS, banco.
- Rollback: nenhum necessário.

## 2026-05-21 — fix WuzAPI subscribedEvents=[]
- `multizap-gateway-deploy/gateway/src/services/wuzapiClient.js`: setWebhook agora envia `webhookURL` + `Subscribe: ['Message','ChatPresence','ReadReceipt']`. connectSession ampliado para os mesmos eventos.
- `atendimento-whatsapp-gateway-deploy/gateway/src/services/wuzapiClient.js`: mesma correção (legado).
- Motivo: WuzAPI descartava mensagens com `Skipping webhook. Not subscribed for this type` mesmo após reapply-webhook retornar 200.

## 2026-05-21 — /admin/grupos-acesso virou tela master completa
- Antes: só lista, zero ação.
- Agora: criar/editar/apagar/permissões/WhatsApps/usuários de qualquer empresa.
- Filtro por empresa + botão "Abrir como esta empresa" (filtra a tela via `?ws=<id>`).
- Auditoria: prefixo `admin:access_group_*` em audit_log.
- Arquivos: src/lib/admin-access-groups.functions.ts, src/components/access-groups/AdminAccessGroupsPanel.tsx, src/routes/admin.grupos-acesso.tsx.
- Sem mudanças em RLS, WuzAPI, Gateway, Recargas Brasil, PIX, Meta.

## 2026-05-21 — Force resync normalizeService.js
Arquivos: multizap-gateway-deploy/gateway/src/services/normalizeService.js, atendimento-whatsapp-gateway-deploy/gateway/src/services/normalizeService.js
Motivo: GitHub main ainda servia versão antiga (grep retornava 0 na VPS). Bump VERSION linha 2 para forçar commit Lovable→GitHub.
Validação VPS:
  /usr/local/bin/multizap-gh-pull
  grep -E -c "jsonData|ChatPresence|HistorySync|ReadReceipt" /root/Multizap/gateway/src/services/normalizeService.js  # esperar 9
  pm2 restart MultiZap-Gateway --update-env
  pm2 logs MultiZap-Gateway --lines 50 | grep webhook_wuzapi_in  # esperar event=message.received
Rollback: reverter linha 2 dos dois arquivos.

## 2026-05-22 — Reset completo no botão Reconectar (QR MultiZap)
Mudança no app TanStack (não toca em Gateway/VPS/porta 3000/webhook 9001).
Arquivos: src/lib/whatsapp.functions.ts, src/routes/app.canais.tsx
Verificação pós-deploy:
  1) /app/canais → clicar "Reconectar" numa conexão WhatsApp QR
  2) Esperado: toast "Sessão antiga apagada..." + abre modal QR + QR novo aparece
  3) Conferir audit_log: SELECT * FROM audit_log WHERE action='qr_connection_force_reset' ORDER BY created_at DESC LIMIT 5;
  4) Conferir tombstone: SELECT * FROM removed_qr_connections ORDER BY removed_at DESC LIMIT 5;
Rollback: reverter os dois arquivos.

## 2026-05-22 — Gateway: fallback SQL WUZAPI_DB_URL
- Novo: `gateway/src/services/wuzapiDbFallback.js` (pool pg lazy).
- Alterado: `connectionService.js` (integração no `reapplyWebhook`), `config/env.js` (+`WUZAPI_DB_URL`), `package.json` (+`pg@^8.11.5`).
- Deploy: rodar `/usr/local/bin/multizap-gh-pull`. Na VPS, `cd /root/Multizap/gateway && npm install` pra instalar `pg`. Setar `WUZAPI_DB_URL` no env só se quiser habilitar o fallback; sem env o gateway funciona igual.
- Teste: `curl -X POST http://127.0.0.1:3100/connections/repair-all-webhooks -H "Authorization: Bearer $MULTIZAP_GATEWAY_TOKEN"` — diagnóstico de cada item agora inclui `db_fallback_enabled` e `db_fallback_result`.
- Rollback: remover env `WUZAPI_DB_URL` (desativa sem deploy) ou reverter os 3 arquivos do gateway.

## 2026-05-22 — UI Reparar recebimento publicada
- Sem migração de banco. Apenas frontend.
- Depende de GET /__diag/wuzapi já em produção no MultiZap-Gateway.
- Rollback: reverter src/components/whatsapp/ConnectedChannelsSection.tsx e src/routes/app.canais.tsx.


## 2026-05-22 — Force-push: /__diag/wuzapi + /connections/repair-all-webhooks
Commit 68460f3 no main estava sem as rotas novas registradas (smoke-test VPS retornou `not_found`). Bumpei `sync-marker` em `multizap-gateway-deploy/gateway/src/routes/diag.routes.js` pra gerar commit novo com o estado correto do gateway (diagRoutes registrado em `app.js`, `POST /connections/repair-all-webhooks` em `connections.routes.js`, `repairAllWebhooks()` em `connectionService.js`, `wuzapiDbFallback.js` e `pg` no `package.json`). Validação: `grep -R "__diag\|repair-all-webhooks\|diag.routes\|repairAllWebhooks" multizap-gateway-deploy/gateway/src` → 9 hits. Próximo: `multizap-gh-pull` + `pm2 restart multizap-gateway`.
2026-05-28 06:41

- Deploy 2026-05-28T07:15:28Z
