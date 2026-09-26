# COMANDO - PENDENCIAS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\docs\PENDENCIAS.md
**SHA:** 2dff284be5029111
**Timestamp:** 2026-08-26T19:31:58.747364
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- - **Decisão:** Manter UM menu único com 3 temas selecionáveis (AIO atual + default + netflix), TODOS expondo as mesmas 10 opções do painel AIO + as ações de manutenção do cdmenu (restart, logs, git pu

### Gaps
- - **Falta:** validações mais profundas — ping real de chat ao vivo, query Supabase com `SELECT 1`, comparar com revisão anterior pra detectar regressão, modo `--json` pro painel admin, alerta no Teleg
- - **O que falta:** alerta automático no checker end-to-end (#9) — adicionar bloco que mede `du -sh /root/.grok/worktrees/ 2>/dev/null` e emite ALERTA se >1GB, ERRO se >5GB. Idealmente também olhar `/r
- - **O que falta:**
- - **Falta:**

### Ouro Bruto (primeiros 5000 chars)
```
# 📌 PENDÊNCIAS — MultiZap / clone-deck

> **Setor único de pendências do projeto.** Sempre que algo ficar pra depois, registra aqui. Quando o usuário pedir "olha as pendências", esse é o arquivo. A IA também mantém uma cópia resumida em `mem://pendencias`.

**Última atualização:** 2026-06-06 BRT (✅ Caddy revivido + watchdog do MCP + página pública `/status` no install.centralldark.com + alertas Telegram)
**Como ler:** prioridade (🔴 alta · 🟡 média · 🟢 baixa) · status · descrição curta · onde mexer · critério pra fechar.

---

### Caddy quebrado após cleanup + watchdog do MCP — ✅ FECHADO em 2026-06-06
- **Sintoma:** `mcp.centralldark.com` devolvia Cloudflare 521 — Caddy `failed` desde 16:01 do dia 06/06 (durante o cleanup de disco que liberou 56GB).
- **Causa raiz:** `/etc/caddy/Caddyfile` linha 51 fazia `import /root/CentralDark/infra/caddy/install.Caddyfile`, mas o arquivo nunca existiu no FS (nem no repo). Caddy se recusava a subir.
- **Correção:** criado `CentralDark/infra/caddy/install.Caddyfile` (proxy `install.centralldark.com` → `127.0.0.1:9200`), permissão do `/var/log/caddy/install-access.log` ajustada, Caddy reiniciado e validado.
- **Bônus pedido pelo usuário (entregue no mesmo turno):**
  - **Watchdog** em `CentralDark/scripts/monitor/mcp-watchdog.sh` — roda via cron a cada 1 min, checa `/health` do MCP + install + Caddy systemd, detecta Cloudflare 521/502/504, manda alerta no Telegram (curl direto na Bot API, não depende do `MultiZap-TelegramBot` que tá quebrado), com debounce por incidente e mensagem de recovery quando volta.
  - **Página pública de status** em https://install.centralldark.com/status — mostra dot verde/vermelho, uptime do PM2, contagem de tools (56), HTTP code de cada endpoint, problemas detectados e últimos erros. Auto-refresh 30s. JSON em `/status.json`.
  - **Credenciais** propagadas pra `/root/CentralDark/secrets/telegram-alerts.env` (origem: secrets do sandbox Lovable).
- **Cadeia validada 7/7:** repo OK · install.Caddyfile no FS · Caddy `active` · 127.0.0.1:9100/9200 200 · Caddyfile aponta certo · `mcp.centralldark.com/health` 200 · `install.centralldark.com/status` 200 com marcador novo.

### MCP-CentralDark fora do ar (502) — ✅ FECHADO em 2026-06-06
- **Sintoma:** `https://mcp.centralldark.com/health` e `/tools.json` devolviam 502; PM2 mostrava `online` mas com 24 restarts e porta 9100 livre (loop de crash).
- **Causa raiz (5 Porquês):** `CentralDark/apps/mcp/src/tools/supabase.ts` ganhou `import { config } from 'dotenv'` numa alteração manual, mas `dotenv` não está em `package.json` do MCP → `ERR_MODULE_NOT_FOUND` no boot.
- **Correção:** reescrito `tools/supabase.ts` com mini-parser .env inline (sem dep externa). Mesma lógica de prioridade (cofre oficial `/root/CentralDark/secrets/*` primeiro, legados `/root/Multizap/*` como fallback). Comportamento idêntico aos callers.
- **Blindagem:** `scripts/run-once/1005-bot-enable-mcp-creation-mode.sh` ganhou pré-check de `/health`, pós-check com retry 3× e rollback automático se o serviço cair após restart.
- **Higiene:** `.github/workflows/deploy.yml` ganhou `run-name` com `#FASE` pro histórico do Actions ficar legível.


## 🔴 Alta prioridade

### 35. Migrar apps antigas para /root/[oculto] após comparação VPS + GitHub
- **Status:** Aberto
- **Descrição:** Depois de comparar /root/[oculto], /root/[oculto], /root/[oculto] e o repositório ServerVpss/CentralDark, criar plano controlado para migrar somente o que for necessário para a pasta principal /root/[oculto] e remover/arquivar pastas antigas com segurança.
- **Onde mexer:** VPS: pastas apps antigas e /root/[oculto]; repositório ServerVpss/CentralDark para refletir o estado correto depois
- **Como fechar:** Gerar relatório final de comparação, escolher o que migrar, fazer backup/arquivo das pastas antigas, migrar uma pasta/app por vez, validar PM2/HTTP, e só apagar antigas após confirmação explícita do usuário.
- **Aberto em:** 2026-06-07 (via MCP)

### 33. Garantir sync principal -> espelho sem executar Actions no espelho
- **Status:** Aberto
- **Descrição:** O fluxo de sync deve copiar o conteúdo do repo principal ServerVpss/CentralDark para o espelho segredounlock/clone-deck, mas sem fazer o espelho executar workflows/deploy. Idealmente, Actions do espelho ficam desativadas no nível do repo; se não houver ferramenta, o sync deve preservar stubs inofensivos em .github/workflows no espelho ou excluir workflows executáveis.
- **Onde mexer:** .github/workflows/sync-to-segredounlock.yml no principal e .github/workflows no espelho
- **Como fechar:** Fazer uma execução de sync e validar que o espelho recebeu arquivos, mas nenhum workflow de deploy foi disparado no espelho.
- **Aberto em:** 2026-06-07 (via MCP)

### 32. Remover ou inutilizar secrets operacionais do espelho
- **Status:** Aberto
- **Descrição:** O espelho segredounlock/clone-deck ainda possui secrets como VPS_HOST, VPS_USER, AUTO_PR_TOKEN e secrets mascaradas. Como o espelho será backup passivo, essas secrets não d
```

---

# COMANDO - PENDENCIAS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\docs\PENDENCIAS.md
**SHA:** 271109a12f06f806
**Timestamp:** 2026-08-26T19:32:47.500554
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- - **Decisão:** workflows que escrevem **DADO GERADO** (não código) voltam a fazer `git push` direto na `main`. São snapshots/relatórios de status — não precisam de revisão humana pra serem corretos. S
- - **Decisão:** Manter UM menu único com 3 temas selecionáveis (AIO atual + default + netflix), TODOS expondo as mesmas 10 opções do painel AIO + as ações de manutenção do cdmenu (restart, logs, git pu

### Padroes
- - **Regra:** `apps/bot` continua frontend; `apps/bot-server` será central dos bots.

### Riscos
- - **Risco:** `git reset --hard` cego perde divergência local útil. Recriar `webhook-bot` sem entender por que sumiu pode reabrir bug antigo.
- - **Risco:** `git reset --hard` cego perde divergência local útil. Recriar `webhook-bot` sem entender por que sumiu pode reabrir bug antigo.
- - **Bloqueio:** não apagar diretório antigo sem provar que não está em produção, PM2, Caddy, Docker/WuzAPI, workflow ou referência ativa.

### Gaps
- - **Falta:** rodar `CD_CONFIRM=1 bash scripts/deploy/install-bot-server.sh` na VPS (e depois, com `CD_INSTALL_CADDY=1`, abrir o domínio). Tudo isolado: zero impacto em WuzAPI, MultiZap-Gateway, CRM ou
- - **Falta:**
- - **Falta:** validações mais profundas — ping real de chat ao vivo, query Supabase com `SELECT 1`, comparar com revisão anterior pra detectar regressão, modo `--json` pro painel admin, alerta no Teleg
- - **O que falta:** alerta automático no checker end-to-end (#9) — adicionar bloco que mede `du -sh /root/.grok/worktrees/ 2>/dev/null` e emite ALERTA se >1GB, ERRO se >5GB. Idealmente também olhar `/r
- - **O que falta:**
- - **Falta:**

### Ouro Bruto (primeiros 5000 chars)
```
# 📌 PENDÊNCIAS — MultiZap / clone-deck

> **Setor único de pendências do projeto.** Sempre que algo ficar pra depois, registra aqui. Quando o usuário pedir "olha as pendências", esse é o arquivo. A IA também mantém uma cópia resumida em `mem://pendencias`.

**Última atualização:** 2026-06-10 BRT (➕ 27 issues abertas migradas pro Linear SEG-14..SEG-40 · ➕ workflow `linear-pendencias-sync` bidirecional · ➕ #119 Mega Painel Auto-Vivo entregue)

**🔗 Linear board:** https://linear.app/segredo/team/SEG · sync bidirecional roda a cada 30min via `.github/workflows/linear-pendencias-sync.yml` (precisa secret `LINEAR_API_KEY`).
**Como ler:** prioridade (🔴 alta · 🟡 média · 🟢 baixa) · status · descrição curta · onde mexer · critério pra fechar.

---

### #129 🟢 Lote 1 — quarentena `.env` fechada

- **Status:** Fechada
- **Contexto:** O Lote 1 da quarentena de `.env` foi concluído sem tocar em VPS, sem abrir secrets e sem executar o Lote 2.
- **Resultado registrado:**
  - conforme relatório operacional do Lote 1, arquivos `.env` foram movidos para quarentena;
  - conforme relatório operacional do Lote 1, itens sensíveis foram preservados sem leitura/exposição;
  - cofre oficial centralizado em `/root/CentralDark/secrets/`;
  - conforme relatório operacional do Lote 1, o MCP foi validado com resultado sanitizado e sem erro;
  - script de quarentena restaurado e sem diff.
- **Regra derivada:** qualquer auditoria futura sobre segredos deve continuar read-only, sanitizada e com aprovação humana explícita para qualquer leitura/edição real.
- **Fora de escopo agora:** Lote 2 permanece pausado e não deve ser executado nesta etapa.

### #130 🟡 Ambiente local/Codex com clone/fetch Git Windows quebrado

- **Status:** Aberta
- **Contexto:** A sessão do Codex teve falha de clone/fetch no Git Windows e chegou a abrir workspace parcial; o repo limpo passou a valer como base segura.
- **Onde mexer:** workspace local do Codex e o processo de bootstrap do clone.
- **Como fechar:** validar sempre um clone limpo antes de editar e nunca reaproveitar o workspace parcial antigo.

### #127 🟢 Monitor de sessões MultiZap/WuzAPI + alertas + seção no painel — ✅ ENTREGUE (2026-06-10)

- **Contexto:** depois da limpeza da sessão fantasma (sobrou só "WhatsApp Principal" — `jid 5535****55676:41`, conectado+logado), o usuário pediu monitoramento contínuo, alerta automático quando alguma sessão cair / pedir QR, e seção visual no painel.
- **Entregue:**
  - **Bot read-only** `scripts/bots/wuzapi-sessions-monitor.mjs`: SSH na VPS, consulta `WuzAPI /admin/users`, sanitiza TUDO (JID `5535****55676:41`, ID `10b1c03c***`, token nunca aparece, webhook só `origin+path?…(mascarado)`), grava snapshot em `CentralDark/apps/projeto-dashboard/wuzapi-sessions.json`.
  - **Alerta automático:** abre/atualiza Issue única (marcador `<!-- bot:wuzapi-sessions -->`) só quando há sessão off/sem login. Severidade P1 (todas off) · P2 (parcial) · P3 (tudo ok — não cria, só atualiza se já existir). Labels: `auto` + `revisao-humana` + `assign:grok` + `severidade:pX` + `multizap`.
  - **Workflow** `.github/workflows/wuzapi-sessions-monitor.yml`: cron a cada **15 min** + manual. Carrega `VPS_SSH_KEY_LOVABLE`, valida com `ssh-keygen -y`, limpa em `always()`. Commita o JSON com retry+rebase.
  - **Painel** `status.centralldark.com`: nova seção **"📡 Sessões do bot"** com cards coloridos (verde=ok / amarelo=QR pendente / vermelho=off), mostra JID/ID/eventos/webhook mascarados + botão "Logs/alertas no GitHub" filtrando label `multizap`.
  - **Alertas push opcionais (2026-06-10):** Telegram (`TELEGRAM_BOT_TOKEN`+`TELEGRAM_CHAT_ID`) e/ou Discord (`DISCORD_WEBHOOK_URL`) — só dispara em mudança de estado, dedup em `wuzapi-sessions.state.json`. Sem os secrets, segue só painel+Issue.
- **Restrições respeitadas:** zero alteração em Docker, WuzAPI, sessão WhatsApp, Caddy ou CRM. Read-only ponta a ponta.
- **Pré-requisito:** mesmos secrets do healthcheck (`VPS_HOST_LOVABLE`, `VPS_USER_LOVABLE`, `VPS_SSH_KEY_LOVABLE`).


---

### #128 🟡 Bot-server (Lote 11) — pacote pronto, falta aplicar na VPS

- **Pronto no repo:**
  - `CentralDark/apps/bot-server/server.mjs` — HTTP nativo Node 18+ (zero dep externa), porta `9210`, expõe `/health`, `/v1/whatsapp/sessions`, `/v1/whatsapp/chats`, `/v1/whatsapp/messages?jid=&count=`. Tudo read-only via WuzAPI (`/admin/users`, `/user/contacts`, `/group/list`, `/chat/history`). Sanitização total (JID `5535****55676:41`, IDs `10b1c03c***`, tokens nunca aparecem). Auth opcional por header `x-bot-token`.
  - `ecosystem.config.cjs` + `start.sh` (wrapper que lê `WUZAPI_ADMIN_TOKEN` de `/root/Multizap/wuzapi/.env` e cofre `/root/CentralDark/secrets/bot-server.env`).
  - `scripts/deploy/install-bot-server.sh` — idempotente, sensível. Sobe PM2 em 2 modos: `CD_CONFIRM=1` (só PM2) ou `CD_CONFIRM=1 CD_INSTALL_CADDY=1` (PM2 + snippet Caddy + reload).
  - Snippet Caddy mapeando `bot.centralldark.com` → `127.0.0.1:9210` (`/health` + `/v1/*`).
  - Doc viva: `docs/INSTALADOR/24-bot
```

---

# COMANDO - PENDENCIAS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\PENDENCIAS.md
**SHA:** b351ec1b7fc022fd
**Timestamp:** 2026-08-28T02:56:42.824495
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- - **Sintoma:** sentry_listar_issues falha por falta de SENTRY_ORG — decisão: não usar Sentry, é serviço externo desnecessário
- - **Sintoma:** Pack base pronto em apps/modulos/comando-mobile (renomeado de centraldecomandomobile): assets, design-system, arquitetura, api-map e esqueleto Expo. Falta decidir e executar a rota de e

### Padroes
- 3. Confirmar comigo pra eu editar o Caddyfile (regra: Caddy não muda sem OK).
- - **Problema:** prefixos numéricos duplicados — `00`, `01`, `02`, `11`, `12` (triplicado!), `21` — além de possíveis números fora de ordem / buracos na sequência. Bagunça visual que o Pivete quer elim
- Regra: fica rodando só até o Hub ficar pronto. Depois desliga e remove.
- **Regra:** NÃO mexer agora. Só registro pra não esquecer.

### Riscos
- - **Sintoma:** Secrets hoje vivem em arquivos .env (modo 0600) na VPS. Pivete cogitou centralizar no Supabase. Risco: tabela public exporia tudo via service_key.

### Gaps
- **Por que ficou pendente:** envolve criar tabela nova (`cerebro_memoria` + `cerebro_memoria_log`), RLS + GRANTs, 2 edge functions (`get-cerebro` público e `update-cerebro` admin), trigger de log autom
- Padrão mono: já é regra (ver memória do padrão visual). Falta: o gatilho de notificação no MCP por uso/sessão.

### Ouro Bruto (primeiros 5000 chars)
```
# Pendências — CentralDark

Fonte ÚNICA de pendências do projeto. Qualquer item novo entra aqui.
Status: 🔴 alta · 🟡 média · 🟢 baixa · ✅ concluído

---

## 🟡 #1 — Migração centralldark.com + telepainel.centralldark.com
**Status:** em andamento (código pronto, falta executar na VPS)
**Sintoma:** site só responde pelo preview do Lovable; domínios próprios ainda não apontam.
**Como fechar:**
1. Apontar DNS dos 3 hostnames pro IP da VPS (`89.117.78.124`):
   - `centralldark.com` → A `89.117.78.124`
   - `www.centralldark.com` → A `89.117.78.124`
   - `telepainel.centralldark.com` → A `89.117.78.124`
2. Na VPS rodar `bash install.sh setup_centraldark_portal` (cria pastas, clona, builda).
3. Confirmar comigo pra eu editar o Caddyfile (regra: Caddy não muda sem OK).
4. `curl -I https://centralldark.com` e `curl -I https://telepainel.centralldark.com/dashboard` devem retornar `200`.
5. Atualizar este item pra ✅ com a data.

Detalhes técnicos: `docs/INSTALADOR/13-centraldark-portal.md`.

---

## ✅ #2 — Reestruturação do repo no padrão VPS (concluído 2026-06-20)
**O que foi feito:** `src/` reorganizado pra espelhar `/root/CentralDark/apps/`.
Páginas e componentes do TelePainel movidos pra `src/apps/modulos/telepainel/`,
landings dos outros módulos pra `src/apps/modulos/{bot-whatsapp,crm,financeiro}/`,
portal público pra `src/apps/web/`, código compartilhado pra `src/shared/`.
READMEs criados em cada módulo + `INSTALACAO.md` na raiz com mapa de migração.
**Exceção mantida:** `src/integrations/` ficou no lugar (regra Lovable: auto-gerado).

---

## 🟡 #3 — bot-whatsapp, crm, financeiro são só landing
**Sintoma:** os três módulos têm página pública bonita, mas zero produto por trás.
**Como fechar:** definir escopo de cada um, modelar tabelas, implementar.
Cada módulo tem seu README com a lista do que falta.

---

## 🟢 #4 — Arquitetura CentralDark 2026 — Versão Consolidada (Cloud + API pra IAs externas)
**Status:** adiado / expansão futura (complexo demais pra agora)
**Data de registro:** 25/06/2026
**Pedido original:** consolidar a arquitetura num doc único oficial, gravar nas 3 camadas do cérebro (repo `cerebro/`, `mem://`, e Cloud Supabase) e expor via edge function pública pra qualquer IA externa (Claude, Grok, Jarvis) ler/atualizar.

**Por que ficou pendente:** envolve criar tabela nova (`cerebro_memoria` + `cerebro_memoria_log`), RLS + GRANTs, 2 edge functions (`get-cerebro` público e `update-cerebro` admin), trigger de log automático, popular 6 seções, espelhar nos 3 mirrors da Sincronia 4-Point e atualizar `mem://index.md`. Hoje é overkill — o `cerebro/` no GitHub + `.claude/prompts/reload-centraldark-v3.md` já cobrem o caso de uso.

**Escopo das 6 seções previstas:**
1. Visão Geral 2026 (diagrama do fluxo Usuário → IA → Ferramentas/Memória/Notion/VPS)
2. Ferramentas Cognitivas (tabela conceitual ↔ real Lovable, já existe em `cerebro/ferramentas-cognitivas-e-comandos.md`)
3. Sistema de Memória Inteligente (protocolo detectar → comparar → atualizar → logar)
4. Comandos e Gatilhos (RELOAD V3, AUDITORIA DE MEMÓRIAS, Sincronia 4-Point, audit-rls, Swarm Mode, etc.)
5. Registro de Atualizações de Memória (log vivo lido da tabela `cerebro_memoria_log`)
6. Artefatos do Sistema (lista viva dos docs-chave)

**Como fechar quando reabrir:**
1. Confirmar com o usuário que vale a complexidade (vs. manter só em `cerebro/` no GitHub).
2. Rodar skill `audit-rls` antes de qualquer migration.
3. Criar migration `cerebro_memoria` + `cerebro_memoria_log` com RLS, GRANTs e trigger de log.
4. Deploy `get-cerebro` (público) e `update-cerebro` (JWT admin).
5. Popular 6 seções via `update-cerebro`.
6. Espelhar em `cerebro/arquitetura-centraldark-2026.md` e `/mnt/documents/`.
7. Atualizar `mem://index.md` com regra Core nova ("consultar `cerebro_memoria` antes de afirmar arquitetura").

**Por enquanto basta:** seguir usando `cerebro/` + `.claude/prompts/reload-centraldark-v3.md` + gatilho `RELOAD V3`.

---

## 🟡 #5 — Revisão de migração `docs/` do legado (`CentralDark1VPS` → `CentralDark`)

**Status:** mapeamento em andamento. Apenas pendências de revisão — nada migrado ainda.
**Data de registro:** 25/06/2026
**Contexto:** o repositório antigo `ServerVpss/CentralDark1VPS` continua de pé como servidor de operação ativa, mas tem 234 arquivos em `docs/` que nunca vieram pro principal. Esta pendência guarda o mapeamento completo, pasta por pasta, pra eu revisar com calma e só depois decidir o que entra.

**Legenda de status (por sub-pendência):**
- 🔴 **Não iniciado** — migração ainda nem começou, falta decisão
- 🟡 **Em progresso** — em revisão / parcialmente migrado
- ✅ **Concluído** — decisão tomada e aplicada (migrado, descartado ou arquivado)

**Resumo visual:**

| # | Pasta no legado | Arquivos | Status |
|---|---|---|---|
| 5.1 | `INSTALADOR/` | 23 | 🔴 Não iniciado |
| 5.2 | `tarefas/` | 33 | 🔴 Não iniciado |
| 5.3 | `WHATSAPP-API/` | 16 | 🔴 Não iniciado |
| 5.4 | `CONSCIENCIA/` | 45 (+3 ARQUIVO-MORTO) | 🟡 Em progresso (já sincronizada ante
```

---

# COMANDO - PENDENCIAS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\CONSCIENCIA\PENDENCIAS.md
**SHA:** 5bfce9702d2c3f41
**Timestamp:** 2026-08-28T02:56:49.048421
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- 3. Confirmar comigo pra eu editar o Caddyfile (regra: Caddy não muda sem OK).
- - **Problema:** prefixos numéricos duplicados — `00`, `01`, `02`, `11`, `12` (triplicado!), `21` — além de possíveis números fora de ordem / buracos na sequência. Bagunça visual que o Pivete quer elim
- Regra: fica rodando só até o Hub ficar pronto. Depois desliga e remove.

### Riscos
- - **Sintoma:** Secrets hoje vivem em arquivos .env (modo 0600) na VPS. Pivete cogitou centralizar no Supabase. Risco: tabela public exporia tudo via service_key.

### Gaps
- **Por que ficou pendente:** envolve criar tabela nova (`cerebro_memoria` + `cerebro_memoria_log`), RLS + GRANTs, 2 edge functions (`get-cerebro` público e `update-cerebro` admin), trigger de log autom
- Padrão mono: já é regra (ver memória do padrão visual). Falta: o gatilho de notificação no MCP por uso/sessão.

### Ouro Bruto (primeiros 5000 chars)
```
---
title: "PENDENCIAS"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# Pendências — CentralDark

Fonte ÚNICA de pendências do projeto. Qualquer item novo entra aqui.
Status: 🔴 alta · 🟡 média · 🟢 baixa · ✅ concluído

---

## 🟡 #1 — Migração centralldark.com + telepainel.centralldark.com
**Status:** em andamento (código pronto, falta executar na VPS)
**Sintoma:** site só responde pelo preview do Lovable; domínios próprios ainda não apontam.
**Como fechar:**
1. Apontar DNS dos 3 hostnames pro IP da VPS (`89.117.78.124`):
   - `centralldark.com` → A `89.117.78.124`
   - `www.centralldark.com` → A `89.117.78.124`
   - `telepainel.centralldark.com` → A `89.117.78.124`
2. Na VPS rodar `bash install.sh setup_centraldark_portal` (cria pastas, clona, builda).
3. Confirmar comigo pra eu editar o Caddyfile (regra: Caddy não muda sem OK).
4. `curl -I https://centralldark.com` e `curl -I https://telepainel.centralldark.com/dashboard` devem retornar `200`.
5. Atualizar este item pra ✅ com a data.

Detalhes técnicos: `docs/INSTALADOR/13-centraldark-portal.md`.

---

## ✅ #2 — Reestruturação do repo no padrão VPS (concluído 2026-06-20)
**O que foi feito:** `src/` reorganizado pra espelhar `/root/CentralDark/apps/`.
Páginas e componentes do TelePainel movidos pra `src/apps/modulos/telepainel/`,
landings dos outros módulos pra `src/apps/modulos/{bot-whatsapp,crm,financeiro}/`,
portal público pra `src/apps/web/`, código compartilhado pra `src/shared/`.
READMEs criados em cada módulo + `INSTALACAO.md` na raiz com mapa de migração.
**Exceção mantida:** `src/integrations/` ficou no lugar (regra Lovable: auto-gerado).

---

## 🟡 #3 — bot-whatsapp, crm, financeiro são só landing
**Sintoma:** os três módulos têm página pública bonita, mas zero produto por trás.
**Como fechar:** definir escopo de cada um, modelar tabelas, implementar.
Cada módulo tem seu README com a lista do que falta.

---

## 🟢 #4 — Arquitetura CentralDark 2026 — Versão Consolidada (Cloud + API pra IAs externas)
**Status:** adiado / expansão futura (complexo demais pra agora)
**Data de registro:** 25/06/2026
**Pedido original:** consolidar a arquitetura num doc único oficial, gravar nas 3 camadas do cérebro (repo `cerebro/`, `mem://`, e Cloud Supabase) e expor via edge function pública pra qualquer IA externa (Claude, Grok, Jarvis) ler/atualizar.

**Por que ficou pendente:** envolve criar tabela nova (`cerebro_memoria` + `cerebro_memoria_log`), RLS + GRANTs, 2 edge functions (`get-cerebro` público e `update-cerebro` admin), trigger de log automático, popular 6 seções, espelhar nos 3 mirrors da Sincronia 4-Point e atualizar `mem://index.md`. Hoje é overkill — o `cerebro/` no GitHub + `.claude/prompts/reload-centraldark-v3.md` já cobrem o caso de uso.

**Escopo das 6 seções previstas:**
1. Visão Geral 2026 (diagrama do fluxo Usuário → IA → Ferramentas/Memória/Notion/VPS)
2. Ferramentas Cognitivas (tabela conceitual ↔ real Lovable, já existe em `cerebro/ferramentas-cognitivas-e-comandos.md`)
3. Sistema de Memória Inteligente (protocolo detectar → comparar → atualizar → logar)
4. Comandos e Gatilhos (RELOAD V3, AUDITORIA DE MEMÓRIAS, Sincronia 4-Point, audit-rls, Swarm Mode, etc.)
5. Registro de Atualizações de Memória (log vivo lido da tabela `cerebro_memoria_log`)
6. Artefatos do Sistema (lista viva dos docs-chave)

**Como fechar quando reabrir:**
1. Confirmar com o usuário que vale a complexidade (vs. manter só em `cerebro/` no GitHub).
2. Rodar skill `audit-rls` antes de qualquer migration.
3. Criar migration `cerebro_memoria` + `cerebro_memoria_log` com RLS, GRANTs e trigger de log.
4. Deploy `get-cerebro` (público) e `update-cerebro` (JWT admin).
5. Popular 6 seções via `update-cerebro`.
6. Espelhar em `cerebro/arquitetura-centraldark-2026.md` e `/mnt/documents/`.
7. Atualizar `mem://index.md` com regra Core nova ("consultar `cerebro_memoria` antes de afirmar arquitetura").

**Por enquanto basta:** seguir usando `cerebro/` + `.claude/prompts/reload-centraldark-v3.md` + gatilho `RELOAD V3`.

---

## 🟡 #5 — Revisão de migração `docs/` do legado (`CentralDark1VPS` → `CentralDark`)

**Status:** mapeamento em andamento. Apenas pendências de revisão — nada migrado ainda.
**Data de registro:** 25/06/2026
**Contexto:** o repositório antigo `ServerVpss/CentralDark1VPS` continua de pé como servidor de operação ativa, mas tem 234 arquivos em `docs/` que nunca vieram pro principal. Esta pendência guarda o mapeamento completo, pasta por pasta, pra eu revisar com calma e só depois decidir o que entra.

**Legenda de status (por sub-pendência):**
- 🔴 **Não iniciado** — migração ainda nem começou, falta decisão
- 🟡 **Em progresso** — em revisão / parcialmente migrado
- ✅ **Concluído** — decisão tomada e aplicada (migrado, descartado ou arquivado)

**Resumo visual:**

| # | Pasta no legado | Arquivos | Status |
|---|---|---|---|
| 5.1 | `INSTALADOR/` | 23 | 🔴 Não iniciado |
| 5.2 | `tarefas/` | 33 | 🔴 Não iniciado |
| 5.3 | `WHATSAPP-API/` | 16 | 🔴 Não iniciado
```

---

# COMANDO - PENDENCIAS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\_LEGADO_ROOT_DOCS_CONFLITOS\20260703T075750Z\PENDENCIAS.md
**SHA:** 65156bd906e36d56
**Timestamp:** 2026-08-28T02:57:22.078031
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- - **Decisão:** workflows que escrevem **DADO GERADO** (não código) voltam a fazer `git push` direto na `main`. São snapshots/relatórios de status — não precisam de revisão humana pra serem corretos. S
- - **Decisão:** Manter UM menu único com 3 temas selecionáveis (AIO atual + default + netflix), TODOS expondo as mesmas 10 opções do painel AIO + as ações de manutenção do cdmenu (restart, logs, git pu

### Padroes
- - **Regra:** `apps/bot` continua frontend; `apps/bot-server` será central dos bots.

### Riscos
- - **Risco:** `git reset --hard` cego perde divergência local útil. Recriar `webhook-bot` sem entender por que sumiu pode reabrir bug antigo.
- - **Risco:** `git reset --hard` cego perde divergência local útil. Recriar `webhook-bot` sem entender por que sumiu pode reabrir bug antigo.
- - **Bloqueio:** não apagar diretório antigo sem provar que não está em produção, PM2, Caddy, Docker/WuzAPI, workflow ou referência ativa.

### Gaps
- - **Falta:** rodar `CD_CONFIRM=1 bash scripts/deploy/install-bot-server.sh` na VPS (e depois, com `CD_INSTALL_CADDY=1`, abrir o domínio). Tudo isolado: zero impacto em WuzAPI, MultiZap-Gateway, CRM ou
- - **Falta:**
- - **Falta:** validações mais profundas — ping real de chat ao vivo, query Supabase com `SELECT 1`, comparar com revisão anterior pra detectar regressão, modo `--json` pro painel admin, alerta no Teleg
- - **O que falta:** alerta automático no checker end-to-end (#9) — adicionar bloco que mede `du -sh /root/.grok/worktrees/ 2>/dev/null` e emite ALERTA se >1GB, ERRO se >5GB. Idealmente também olhar `/r
- - **O que falta:**
- - **Falta:**

### Ouro Bruto (primeiros 5000 chars)
```
# 📌 PENDÊNCIAS — MultiZap / clone-deck

> **Setor único de pendências do projeto.** Sempre que algo ficar pra depois, registra aqui. Quando o usuário pedir "olha as pendências", esse é o arquivo. A IA também mantém uma cópia resumida em `mem://pendencias`.

**Última atualização:** 2026-06-16 BRT (✅ Builder Bolt público ativo em builder.centralldark.com)

**🔗 Linear board:** https://linear.app/segredo/team/SEG · sync bidirecional roda a cada 30min via `.github/workflows/linear-pendencias-sync.yml` (precisa secret `LINEAR_API_KEY`).
**Como ler:** prioridade (🔴 alta · 🟡 média · 🟢 baixa) · status · descrição curta · onde mexer · critério pra fechar.

---

### #131 🟢 Builder Bolt (`bolt.diy`) — Caddy público ativo

- **Status:** Fechada em 2026-06-16
- **Contexto:** Foi preparada a base versionável para uma instância isolada do `bolt.diy` em `apps/builder-bolt`, com container planejado `centraldark-builder-bolt`, porta local `127.0.0.1:5174` e domínio futuro `https://builder.centralldark.com`.
- **Pronto no repo:**
  - `apps/builder-bolt/README.md` e `apps/builder-bolt/PLANO.md`;
  - `apps/builder-bolt/docker-compose.yml` com bind local sem porta `3000`;
  - `apps/builder-bolt/.env.example` sem secrets;
  - `scripts/deploy/install-builder-bolt.sh` para validar Docker/porta, clonar upstream `bolt.diy`, subir só o container novo e gerar relatório em `/root/CentralDark/revisoes/`;
  - `infra/caddy/builder.centralldark.com.Caddyfile` como snippet isolado para `builder.centralldark.com -> 127.0.0.1:5174`;
  - relatório `docs/RELATORIOS/2026-06-15-builder-bolt.md`.
- **Atualização 2026-06-16:** container local já validado como `running/healthy`, sem restart, HTTP 200 em `127.0.0.1:5174`, com COOP/COEP vindos do upstream. DNS de `builder.centralldark.com` resolve, mas HTTPS público ainda não abre porque o Caddy real não importa o snippet do Builder Bolt.
- **Preparado agora:** `scripts/deploy/ativar-builder-bolt-caddy.sh` faz precheck, backup do Caddy real, instalação do snippet, `caddy validate`, reload e validação pública, mas só aplica com `CD_CONFIRM_CADDY_BUILDER_BOLT=1` e frase literal `CONFIRMO CADDY BUILDER BOLT`.
- **Tentativa real 2026-06-16:** confirmação humana recebida para Builder Bolt, mas o reload foi bloqueado antes de aplicar porque `caddy validate` falhou em import pré-existente ausente: `/root/CentralDark/infra/caddy/portal.Caddyfile`. O Caddy continuou `active`; não houve reload.
- **Correção autorizada:** criado `/root/CentralDark/infra/caddy/portal.Caddyfile` inerte/comentado somente para satisfazer o import pré-existente, sem site block, proxy ou domínio de portal.
- **Resultado final:** `caddy validate` OK, reload do Caddy executado, certificado Let's Encrypt emitido, `https://builder.centralldark.com` respondendo `HTTP/2 200`, HTML e asset JS principal carregando, headers COOP/COEP preservados e container `centraldark-builder-bolt` permaneceu `running/healthy`, `RESTARTING=false`, `EXIT=0`, `RESTARTS=0`.
- **Observação:** primeira validação HTTPS logo após reload falhou por timing enquanto o ACME finalizava; rerun validou `200`. O ativador agora aguarda/retry no pós-reload.
- **Critério de fechamento:** concluído para Caddy público. Configuração interna de provedores/admin/login do Builder Bolt fica para fase separada.
- **Restrições:** não tocar Open WebUI, porta `3000`, WuzAPI, WhatsApp, CRM, Supabase, banco real, secrets ou containers antigos.

### #129 🟢 Lote 1 — quarentena `.env` fechada

- **Status:** Fechada
- **Contexto:** O Lote 1 da quarentena de `.env` foi concluído sem tocar em VPS, sem abrir secrets e sem executar o Lote 2.
- **Resultado registrado:**
  - conforme relatório operacional do Lote 1, arquivos `.env` foram movidos para quarentena;
  - conforme relatório operacional do Lote 1, itens sensíveis foram preservados sem leitura/exposição;
  - cofre oficial centralizado em `/root/CentralDark/secrets/`;
  - conforme relatório operacional do Lote 1, o MCP foi validado com resultado sanitizado e sem erro;
  - script de quarentena restaurado e sem diff.
- **Regra derivada:** qualquer auditoria futura sobre segredos deve continuar read-only, sanitizada e com aprovação humana explícita para qualquer leitura/edição real.
- **Fora de escopo agora:** Lote 2 permanece pausado e não deve ser executado nesta etapa.

### #130 🟡 Ambiente local/Codex com clone/fetch Git Windows quebrado

- **Status:** Aberta
- **Contexto:** A sessão do Codex teve falha de clone/fetch no Git Windows e chegou a abrir workspace parcial; o repo limpo passou a valer como base segura.
- **Onde mexer:** workspace local do Codex e o processo de bootstrap do clone.
- **Como fechar:** validar sempre um clone limpo antes de editar e nunca reaproveitar o workspace parcial antigo.

### #127 🟢 Monitor de sessões MultiZap/WuzAPI + alertas + seção no painel — ✅ ENTREGUE (2026-06-10)

- **Contexto:** depois da limpeza da sessão fantasma (sobrou só "WhatsApp Principal" — `jid 5535****55676:41`, conectado+logado), o usuário pe
```