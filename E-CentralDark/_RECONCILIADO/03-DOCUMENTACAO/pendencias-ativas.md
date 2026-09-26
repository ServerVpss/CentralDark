# Pendências ativas — auto-gerado

> Espelho automático de `docs/PENDENCIAS.md` mantido pelo workflow `.github/workflows/consciencia-sync.yml`.
>
> **Não editar à mão.** Atualize `docs/PENDENCIAS.md` direto.

Última sincronização: 2026-06-07 16:02:23 -03

---

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

### 36. Arquivar e apagar pastas apps antigas após validação
- **Status:** Aberto
- **Descrição:** Depois da migração das apps antigas para a pasta principal, validar serviços, Git, HTTP e conteúdo migrado. Em seguida, colocar as pastas antigas em quarentena/backup e só depois apagar definitivamente com confirmação explícita.
- **Onde mexer:** VPS: pastas antigas de apps e pasta principal de apps do CentralDark
- **Como fechar:** Confirmar que PM2/HTTP continuam online, que os arquivos migrados úteis estão no local correto, que o GitHub recebeu o que deve receber sem arquivos privados abertos, mover antigas para quarentena, validar novamente e apagar somente após confirmação literal do usuário.
- **Aberto em:** 2026-06-07 (via MCP)

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
- **Descrição:** O espelho segredounlock/clone-deck ainda possui secrets como VPS_HOST, VPS_USER, AUTO_PR_TOKEN e secrets mascaradas. Como o espelho será backup passivo, essas secrets não devem ficar operacionais no espelho.
- **Onde mexer:** Settings/Secrets do repo segredounlock/clone-deck ou ferramenta GitHub equivalente
- **Como fechar:** Remover ou inutilizar secrets operacionais do espelho. Não copiar valores para o chat. Se alguma secret for necessária no principal, migrar uma por vez e só quando workflow do principal exigir.
- **Aberto em:** 2026-06-07 (via MCP)

### 31. Transformar espelho segredounlock/clone-deck em backup passivo
- **Status:** Aberto
- **Descrição:** O repo espelho deve apenas receber conteúdo do repo principal ServerVpss/CentralDark. Ele não deve executar deploy, Actions, PM2, VPS, webhooks operacionais ou qualquer automação própria.
- **Onde mexer:** segredounlock/clone-deck, workflows do espelho e workflow de sync no ServerVpss/CentralDark
- **Como fechar:** Garantir que o espelho receba arquivos do principal, mas não execute workflows, não use secrets de VPS e não dispare deploys.
- **Aberto em:** 2026-06-07 (via MCP)

### 9. Instalador precisa ter CHECKER END-TO-END completo — 🟡 PARCIAL em 2026-06-04
- **Status:** Base implementada — `scripts/checker/` com 11 blocos + agregador `run-all.sh` + flag `./install.sh --check-final` + integração automática no `--install`. Códigos de saída 0/1/2 bloqueiam "instalação concluída" se houver ERRO. Relatório salvo em `/root/Multizap/revisoes/<data>/checker-final/relatorio.md` com STATUS OK/ALERTA/ERRO + detalhes por bloco. Tudo sanitizado.
- **Falta:** validações mais profundas — ping real de chat ao vivo, query Supabase com `SELECT 1`, comparar com revisão anterior pra detectar regressão, modo `--json` pro painel admin, alerta no Telegram quando STATUS=ERRO. Detalhes em `scripts/checker/PLANO.md`.
- **Onde mexer (próximo passo):** `scripts/checker/` (criar novos módulos ou estender 08-chat-ao-vivo.sh / 06-supabase-sync.sh).

**O que o checker tem que validar (12 blocos):**

1. **Estrutura de pastas:** `/root/Multizap`, `/root/Multizap/apps/{bot,bot-telegram}`, `/root/Multizap/api/whatsapp/qrcode/` (QR temporário consolidado aqui), `/root/Multizap/revisoes/`.
2. **Logs e relatórios:** salvar log completo em `/root/Multizap/revisoes/YYYYMMDD-HHMMSS/NOME-DA-TAREFA/`. No chat/terminal, só resumo sanitizado (nunca token/senha/cookie/connection string/sessão).
3. **GitHub + workflow + webhook + run-once:** GitHub conectado, workflow disponível, webhook ativo, run-once funcional, post-deploy disponível, logs sanitizados. Fluxo oficial: `GitHub → workflow/webhook → run-once → validação → relatório`. Zero comando manual na VPS pra operação normal.
4. **PM2 (10 serviços esperados):** `CloneDeck-CRM`, `CloneDeck-Supabase-Sync`, `MCP-CentralDark`, `MultiZap-Gateway`, `MultiZap-GitHub-Webhook`, `MultiZap-TelegramBot`, `github-webhook`, `wabot-bridge`, `webhook-bot`, `whatsapp-server`. Pra cada um mostrar: online/parado, restarts, memória, log recente com erro, alerta se "online mas falhando por dentro". **NÃO reiniciar sensível sem confirmação.**
5. **Bot Telegram (`MultiZap-TelegramBot`):** online, sem restart excessivo, sem `MODULE_NOT_FOUND`, sem import ausente, sem erro recorrente de polling, `apps/bot-telegram` sincronizado repo↔VPS. **Achados que NÃO podem ser esquecidos:** `Cannot find module '../../skills/core/consciousness.cjs'` e `[Poll] fetch failed` — o checker precisa detectar esses padrões automaticamente.
6. **Supabase Sync (`CloneDeck-Supabase-Sync`):** online, sem restart excessivo, sem erro recorrente, instâncias pausadas documentadas, status da "Recargas Brasil", erro 401 WuzAPI tratado como pendência/configuração (não como sucesso). **NÃO mexer no banco real sem confirmação.**
7. **WhatsApp / WuzAPI / QR:** pasta do QR temporário, geração do QR quando aplicável, leitura pelo painel/bot, status da instância, bridge ativa, WuzAPI acessível quando configurada, `whatsapp-server` no estado esperado. **NÃO resetar WhatsApp, NÃO logout, NÃO apagar sessão, NÃO reiniciar WuzAPI/Docker sem confirmação.**
8. **Chat ao vivo + contatos + fotos + grupos:** depois de validar QR e conexão base, checker confere chat ao vivo, recebimento/envio de mensagens (quando ambiente permite), contatos, avatar/fotos, grupos, eventos via webhook, sincronização no painel.
9. **Caddy / domínios (somente leitura):** domínios configurados, HTTP/HTTPS respondendo, `bot.multizap.dev`, `crm.multizap.dev`, gateway/webhook respondendo. **NÃO alterar Caddy sem confirmação.**
10. **CRM:** só leitura/saúde básica. **NÃO mover, alterar ou reorganizar o CRM nessa etapa.**
11. **Segurança:** arquivos sensíveis com permissão segura, zero valor privado impresso, zero secret em log/commit/sessão exposta, relatório sempre sanitizado.
12. **Relatório final:** `STATUS: OK / ALERTA / ERRO` + itens aprovados + itens com alerta + itens com erro + próximos passos + caminho do log completo + data/hora em BRT + recomendação do que corrigir primeiro.

**Exemplo do relatório esperado:**
```
STATUS FINAL: ALERTA
OK: estrutura criada, PM2 instalado, webhook ativo, gateway online
ALERTA: TelegramBot online com restarts altos, Supabase-Sync com restarts altos
ERRO: módulo ausente em apps/bot-telegram/bot.cjs, whatsapp-server parado
PRÓXIMO PASSO: corrigir import do bot Telegram, sincronizar apps/bot-telegram no deploy, validar QR em /root/Multizap/api/whatsapp/qrcode/
```

- **Critério pra fechar (TODOS obrigatórios):**
  1. Instalador com checker end-to-end real implementado
  2. Checker valida PM2, webhook, run-once, QR, Telegram bot, WhatsApp bridge, Supabase Sync, chat ao vivo, contatos, fotos, grupos
  3. Relatório final salvo em `/root/Multizap/revisoes/`
  4. Relatório mostra OK / ALERTA / ERRO de forma clara
  5. Zero dado privado exposto em qualquer saída
  6. Instalador NÃO se declara concluído se houver erro crítico
  7. Tudo que já foi planejado/corrigido/descoberto até hoje está coberto pelo checklist

### 1. Religar sync da instância "Recargas Brasil"
- **Status:** Pausado (token WuzAPI 401)
- **Onde:** variável `SYNC_PAUSED_INSTANCES` no serviço `CloneDeck-Supabase-Sync` (PM2 na VPS)
- **Quando religar:** depois que o usuário avisar que terminou de mexer na pasta `bot` E renovou o token WuzAPI
- **Como fechar:** remover "recargas brasil" do `SYNC_PAUSED_INSTANCES` no `wabot.env`, `pm2 restart CloneDeck-Supabase-Sync --update-env`, conferir log sem 401 por uns 2 min
- **Detalhes:** `mem://sync-pausado-recargas-brasil`

### 2. ~~Post-deploy do webhook está falhando~~ (FALSO POSITIVO — verificado 03/06/2026)
- **Status:** Fechado. Foi um erro isolado de 25ms em 03/06 13:23 UTC; rodadas antes e depois funcionaram. Script `scripts/post-deploy.sh` roda limpo em ~3s. Mantido aqui só pra contexto histórico — pode ser removido na próxima limpeza.

### 10. Workflow `atualiza-memoria-consciencia.yml` quebrando por SSH — ✅ CONCLUÍDO em 2026-06-04
- **Sintoma:** todas as execuções do workflow falhando (ver Actions: 4 ❌ seguidas). Causa: o passo "Configurar chave SSH" usava `echo "$VPS_SSH_KEY_LOVABLE" > id_vps`, que falha 100% das vezes (chave chega em linha única, OpenSSH rejeita com `error in libcrypto`).
- **Fix:** workflow reescrito pra usar o **mesmo reconstrutor Python** do `scripts/lovable-agent/setup-vps-ssh.sh` (detecta PEM achatada / base64 / multi-linha), salva em `/tmp/vps_key`, valida com `ssh-keygen -y` antes de tentar SSH.
- **Regra nova:** adicionada na CONSCIENCIA seção 3 — qualquer workflow novo que precise SSH DEVE embutir o reconstrutor Python, NUNCA `echo` direto. Referência viva: `.github/workflows/atualiza-memoria-consciencia.yml`.

### 11. Ciclo de consciência universal (Lovable ↔ Repo ↔ MCP ↔ ChatGPT) — ✅ CONCLUÍDO em 2026-06-04
- **Status:** Fechado — leitura ✅, escrita ✅
- **O que ficou pronto:**
  - ✅ `LEIA-ME-IA.md` na raiz como porta de entrada universal
  - ✅ `docs/CONSCIENCIA/CONSCIENCIA.md` espelha a `mem://` do Lovable
  - ✅ MCP CentralDark com **4 tools de leitura**: `ler_consciencia`, `ler_pendencias`, `ler_regras_invioláveis`, `ler_instalador`
  - ✅ MCP CentralDark com **3 tools de escrita**: `adicionar_pendencia`, `fechar_pendencia`, `atualizar_consciencia` (com co-autoria `SegredoiDev` em todo commit pra farmar Pair Extraordinaire)
  - ✅ Função `createOrUpdateFile` em `CentralDark/apps/mcp/src/github.ts` (GitHub Contents API)
  - ✅ Doc `docs/INSTALADOR/14-conectar-ia-externa.md` documentando todas as 7 tools
  - ✅ MCP buildado e reiniciado na VPS (HTTPS respondendo, healthcheck verde)
- **Como o ciclo funciona agora:** ChatGPT/Claude/Cursor conectados via OAuth conseguem ler E escrever direto no repo via MCP. Eu (Lovable) leio o commit deles na próxima sessão e atualizo `mem://pendencias` se aplicável.

### 12. Deploy redundante em 3 camadas — ✅ CONCLUÍDO em 2026-06-04
- **Status:** Fechado. A "pendência" antiga de "Caddy 9002 vs serviço 9000" era **falso positivo** — o webhook do clone-deck SEMPRE rodou em `hook.multizap.dev/webhook` → `127.0.0.1:9003` (`webhook-bot`), o 9002 é de outro repo (`MultiZap-GitHub-Webhook` do `atendimentoo`).
- **Camada 1 (instantâneo, ~5s):** webhook GitHub→VPS já funcionava. GitHub `last_response=active`, listener responde `200` em `/health`.
- **Camada 2 (fallback ~40s):** `.github/workflows/deploy-fallback.yml` — em todo push na `main`, espera 30s e roda `clone-deck-gh-pull-with-deploy.sh` via SSH idempotente. Em 04/06 o workflow foi corrigido pra voltar ao padrão seguro do projeto: reconstrução de `VPS_SSH_KEY_LOVABLE` em `/tmp/vps_key` + validação com `ssh-keygen`, sem depender de `ssh-agent` nem de secret paralelo `VPS_SSH_KEY`.
- **Camada 3 (rede de segurança, 1min):** novo cron `* * * * *` na VPS rodando `clone-deck-gh-pull-with-deploy.sh` (já tem lock via `flock`, idempotente). NÃO mexi no `gh-pull` antigo (`*/5`) que cuida do `whatsapp-server`.
- **Como cair tudo:** se camada 1 cair, Actions cobre em 40s; se Actions cair, cron cobre em 60s. Pra ficar offline, as 3 precisariam falhar juntas.






### 15. Servir bootstrap por domínio próprio (`install.centralldark.com`)
- **Status:** Aberto — solução atual usa repo público espelho `segredounlock/centraldark-install` (funciona)
- **Objetivo:** trocar o one-liner do leigo de `raw.githubusercontent.com/.../centraldark-install/...` pra `install.centralldark.com`, mais bonito e estável
- **Onde mexer:** rota nova no Caddy (sensível — pedir confirmação) + DNS Cloudflare A record + redirect 302 pro raw atual
- **Critério pra fechar:** `curl -fsSL https://install.centralldark.com` devolver o `bootstrap.sh` válido e o README/docs/INSTALADOR usarem essa URL

### 16. Sincronizar bootstrap público automaticamente
- **Status:** Aberto — sync manual via `scripts/sync-bootstrap-public.sh` (roda na VPS)
- **Objetivo:** toda vez que `bootstrap.sh` mudar no repo privado, propagar pro `centraldark-install` sem precisar rodar à mão
- **Onde mexer:** novo passo no `clone-deck-gh-pull-with-deploy.sh` OU GitHub Action no repo privado com PAT que tenha push no público
- **Critério pra fechar:** alterar `bootstrap.sh`, fazer commit, e em < 1 min o raw público estar atualizado

---

### 17. Fallback Lovable ↔ GitHub — ✅ CRIADO em 2026-06-04 (falta teste em produção)
- **Status:** Scripts criados. Camada PAT pronta. Camada SSH com gancho (implementação completa pendente). Teste end-to-end ainda não rodado.
- **Onde mora:** `CentralDark/scripts/deploy/lovable-{check,sync-fallback,report}.sh` + libs `_lib-sanitize.sh` / `_lib-github-api.sh`.
- **Atalhos:** `centraldark-lovable-check` / `-sync` / `-report` (criados pelo `install.sh`).
- **Pra fechar:** rodar 2× em sequência sem quebrar, validar PR aparecendo no repo, conferir relatório em `/root/CentralDark/revisoes/.../sync-fallback-lovable/`, garantir 0 secrets nos logs.

---

### 18. Cloudflare Connect via Navegador (OAuth + 1-Click Token) — ✅ CONCLUÍDA em 2026-06-05
- **Status final:** Fluxo OAuth público funcionando end-to-end. `/oauth/cloudflare/start` retorna 302 pro `dash.cloudflare.com/oauth2/auth` com `client_id` válido (`d1a6550c...a525`), PKCE (`S256`) e scopes corretos. Backend `Install-Callback` online na VPS (porta 9200, PM2), HTTPS público OK em `install.centralldark.com`.
- **Como foi fechada (13:30 BRT):**
  1. Token "CentralDark Admin" criado pelo usuário com permissão `OAuth Client Write` (escopo de conta inteira) — guardado nos secrets do Lovable (`CLOUDFLARE_API_TOKEN`).
  2. OAuth Client criado **via API** (não pelo dashboard): `POST /accounts/{acc}/oauth_clients` com scopes do formato novo `zone.read dns.write user-details.read account-settings.read` (descobertos em `GET /oauth/scopes`). O formato antigo `zone:read dns_records:edit` foi descontinuado.
  3. `CF_OAUTH_CLIENT_ID`, `CF_OAUTH_CLIENT_SECRET`, `CF_ACCOUNT_ID` gravados em `/root/CentralDark/apps/install-callback/.env` (chmod 600, backup `.bak.<ts>`).
  4. Default de `CF_SCOPES` atualizado no `server.js` (linha 44) pra refletir o formato novo.
  5. `pm2 restart Install-Callback --update-env` — online, sem loop.
- **Validação cadeia completa (7 passos):** repo ✅, VPS HEAD ✅, PM2 online ✅, porta 9200 ✅, `curl 127.0.0.1:9200/session/new` 200 ✅, Caddy roteando ✅, `curl https://install.centralldark.com/oauth/cloudflare/start?sid=X` retorna 302 pro `dash.cloudflare.com` ✅.
- **Onde mora:** `CentralDark/apps/install-callback/` (servidor) + `CentralDark/scripts/installer/install-connect.sh` (cliente SSH com QR). Docs: `docs/INSTALADOR/15-cloudflare-api.md`, `16-cloudflare-dns.md`, `17-dns-wildcard.md`, `18-conectar-pelo-celular.md`.
- **Relatório técnico (modo cientista):** `docs/RELATORIOS/2026-06-05-oauth-cloudflare-ativado.md`.

### 22. Pós-OAuth grava cofre COMPLETO e dispara `--cloudflare-apply` — ✅ CONCLUÍDA em 2026-06-05
- **Problema:** Depois do OAuth, o cofre só recebia `CF_API_TOKEN` + `CF_ACCOUNT_ID`. O `install-connect.sh` chamava `install.sh --cloudflare-apply`, que exige `CF_ZONE_NAME` e morria com "Config ausente". Resultado: nada acontecia na VPS depois do login no celular.
- **Solução server-side (`server.js`):** `fetchZones()` + `detectPublicIp()` + `finalizeAuth()` decide 1 zona → grava cofre completo / 2+ zonas → `pageChooseZone` / 0 zonas → `pageNoZone`. Nova rota `POST /zone/choose?sid=...` grava cofre final. Modal de áudio.
- **Solução client-side (`install.sh` + `cloudflare-wizard.sh`) — hardening 2026-06-05:**
  1. `SECRETS_DIR` deixou de ser `readonly` (era reatribuído inline em `run_cf_sync`, causando `SECRETS_DIR: readonly variable`).
  2. `cmd_apply` ganhou defaults pra `CF_SUBDOMAINS` (`@ www app api bot crm mcp gateway webhook status install`) e `CF_PROXIED` — era `unbound variable`.
  3. `cloudflare_apply()` agora auto-detecta zona via API Cloudflare (1 zona → usa direto, 2+ → pergunta, 0 → erro claro) e IP público via `ipify`/`ifconfig.me`. Cobre o caso do cofre vir só com token+account.
- **Como fechar:** ✅ tudo já no repo. Sync repo→VPS (webhook ou cron), `pm2 reload Install-Callback --update-env`, próximo teste pelo celular deve emendar do "Cloudflare conectada" direto pro APPLY sem travar.
- **Onde mexer:** `install.sh` (linhas 30, 580, 610), `CentralDark/scripts/installer/cloudflare-wizard.sh` (linha 374), `CentralDark/apps/install-callback/server.js`, `CentralDark/scripts/installer/install-connect.sh`.




---





## 🟡 Média prioridade

### 29. Evoluir CentralDark para hub multi-IA (ChatGPT + Grok + Lovable + GitHub + outras)
- **Status:** Aberta (2026-06-06) — salvo como pendência futura oficial. Não bloqueia nenhuma fase atual.
- **Visão:** todas as IAs conectadas ao CentralDark/MCP, herdando memória, pendências, fases e checkpoint atual.
- **Guard-rails obrigatórios:** read-only por padrão · permissões por papel · fila de tarefas · locks pra evitar conflito · logs sanitizados · aprovação humana pra ações sensíveis (Docker, WuzAPI, WhatsApp, Caddy, CRM, banco real, rm -rf, secrets, domínio).
- **Pré-requisitos:** fases 05.x fechadas (menu instalador, cofre Supabase, contatos, chat ao vivo) + OAuth próprio CentralDark (#13) maduro.
- **Critério pra fechar:** pelo menos 2 IAs externas conectadas via MCP escrevendo no repo com co-autoria, sem nenhum vazamento de secret nos logs, e fila de tarefas funcional com lock.

### 30. Monitoramento preventivo de `/root/.grok/worktrees/` na VPS
- **Status:** Aberta (2026-06-06) — nasceu do incidente do disco 100% cheio: agente Grok externo entrou em loop e criou recursão infinita de worktrees, cada uma com cópia do binário de 132MB, totalizando ~56GB. Limpeza manual feita com `rm -rf /root/.grok/worktrees/`.
- **O que falta:** alerta automático no checker end-to-end (#9) — adicionar bloco que mede `du -sh /root/.grok/worktrees/ 2>/dev/null` e emite ALERTA se >1GB, ERRO se >5GB. Idealmente também olhar `/root/.claude/worktrees/` e qualquer `*/worktrees/` recursivo em `/root/.*`.
- **Onde mexer:** `scripts/checker/` (novo módulo tipo `12-disco-agentes-externos.sh`) + integrar no `run-all.sh`.
- **Critério pra fechar:** checker rodando, detectando crescimento anômalo, e instrução clara no relatório sobre como limpar com segurança.

### 34. Mapear "comando único de deploy" por pasta + comando global do site inteiro
- **Status:** Aberta (2026-06-07) — nasceu da regra `mem://comando-unico-vps` (CONSCIENCIA/13-COMANDO-UNICO-VPS.md). Hoje cada serviço tem o bloco bash decorado de cabeça; precisa virar tabela + script + atalhos.
- **O que falta:**
  1. Mapear TODAS as pastas de `/root/CentralDark/apps/*` (mcp, install-callback, webhook-bot, telegram-bot, supabase-sync, futuras). Pra cada uma anotar: nome PM2, porta, domínio público, rota de health, se precisa `npm ci` + `npm run build` ou só restart.
  2. Completar a tabela mestra em `docs/CONSCIENCIA/13-COMANDO-UNICO-VPS.md` com TODAS as pastas (hoje tem 5 exemplos).
  3. Criar `scripts/deploy/redeploy.sh <app>` — recebe nome da pasta, roda o bloco certo (git pull + build condicional + pm2 restart + curl no domínio público pra validar cadeia completa).
  4. Criar `scripts/deploy/redeploy-all.sh` — o "deploy do site inteiro": `git -C /root pull` uma vez, depois itera por todos os apps em paralelo controlado, relatório final tipo `✅ mcp · ✅ install-callback · ❌ webhook-bot (build falhou)`.
  5. Expor como atalho em pelo menos um destes:
     - Botão no `/admin` do `install.centralldark.com` ("Redeployar tudo" / "Redeployar só X").
     - Comando `/deploy <app>` e `/deploy-tudo` no MultiZap-TelegramBot.
     - Opção no `cdmenu` da VPS.
- **Por que importa:** usuário aperta 1 botão (ou manda 1 comando no Telegram) e o site inteiro atualiza com prova de cadeia completa (regra `mem://validacao-cadeia-completa`). Acelera qualquer correção futura.
- **Critério pra fechar:** tabela completa no doc + 2 scripts funcionando + pelo menos UM dos 3 atalhos disparando `redeploy-all.sh` com sucesso end-to-end.





### 24. Criar repo público mirror `segredounlock/centraldark-consciencia` — ✅ DISPENSADO em 2026-06-05
- **Resolvido por outra via:** o cérebro CentralDark (MCP) agora serve a skill direto em rota pública, sem precisar de mirror externo.
- **Rotas novas (sem auth, CORS liberado, cache 5 min):**
  - `GET https://mcp.centralldark.com/skills` (lista)
  - `GET https://mcp.centralldark.com/skills/<nome>` (manifesto)
  - `GET https://mcp.centralldark.com/skills/<nome>/SKILL.md` (markdown cru)
  - `GET https://mcp.centralldark.com/skills/<nome>/install.sh` (script bash auto-detect)
  - Mesmas rotas espelhadas em `https://install.centralldark.com/skills/*`
- **Comando final pro usuário:** `curl -sL https://mcp.centralldark.com/skills/centraldark-consciencia/install.sh | bash`
- **Onde foi implementado:** `CentralDark/apps/mcp/src/skills-public.ts` + `CentralDark/apps/install-callback/server.js`.

### 28. Testar instalação real via curl do cérebro em IA nova
- **Status:** Aberto (2026-06-05) — após o deploy chegar na VPS (`MCP-CentralDark` e `Install-Callback` reiniciados), validar:
  1. `curl https://mcp.centralldark.com/skills` retorna JSON com `centraldark-consciencia`
  2. `curl https://mcp.centralldark.com/skills/centraldark-consciencia/SKILL.md` retorna o markdown completo
  3. Rodar `curl -sL https://mcp.centralldark.com/skills/centraldark-consciencia/install.sh | bash` num Claude Code novo e confirmar que o arquivo aparece em `~/.claude/skills/centraldark-consciencia/SKILL.md`
  4. Idem pelo espelho `install.centralldark.com`

### 21. Rota `/raw/install.sh` no backend `install.centralldark.com` — 🟢 CÓDIGO PRONTO, falta deploy
- **Status:** Código já existe em `CentralDark/apps/install-callback/server.js` (linhas 524-528: serve `INSTALL_SH` direto do filesystem). Só não funciona porque o serviço PM2 `install-callback` na VPS ainda está na versão antiga.
- **Como fechar:** após o próximo `git pull` + `pm2 restart install-callback` na VPS, validar `curl -fI https://install.centralldark.com/raw/install.sh` retornando 200. Daí o auto-update do `install.sh` volta a funcionar.
- **Sintoma original:** terminal mostrava `curl: (22) The requested URL returned error: 404` duas vezes logo após "baixando instalador..." em todo `curl ... | bash -s -- --check`. O erro foi suprimido no `install.sh` enquanto o deploy não chega.





### 20. Auditoria de `set -e` em funções do `install.sh`
- **Status:** Aberto (2026-06-05) — bug pontual corrigido, mas padrão merece varredura.
- **Contexto:** `_aio_detect_width` terminava com `[ cond ] && cmd` como última instrução. Quando a condição era falsa, a função retornava 1 e o `set -euo pipefail` matava o instalador em silêncio (`curl ... | bash -s -- --check` só imprimia "baixando instalador..." e voltava ao prompt). Corrigido adicionando `return 0`.
- **Achado extra corrigido em 2026-06-05:** no fluxo `--check`, depois de validar o ambiente o script chamava `info "Ambiente OK — abrindo painel CentralDark..."`, mas a função `info` não existia. Resultado: o shell abortava antes de abrir o menu e parecia que ele “fechava direto”. Corrigido trocando para `log`, mantendo a abertura automática do painel.
- **Como fechar:** revisar TODAS as funções do `install.sh` (e dos scripts em `CentralDark/scripts/installer/`) que terminam em `cond && cmd` ou `cmd || cmd`. Adicionar `return 0` / `|| true` / converter pra `if/then/fi`. Idealmente, criar um teste smoke (`./install.sh --self-test`) que rode as funções de init e sai 0, pra travar regressão em CI.



### 19. Unificar os 3 temas de menu (AIO + default + netflix) com as MESMAS opções
- **Status:** Aberto (2026-06-05)
- **Problema:** Existem múltiplos menus na VPS — o painel do `install.sh` (CENTRALDARK PANEL MENU, tema "AIO" vermelho) tem 10 opções completas (Verificar Ambiente, Instalar Base, Estrutura, Cloudflare/DNS, MCP, Checker, Conectar QR, Wildcard, Deps, Auto-update). Já o `scripts/menu/cdmenu.sh` tem 2 temas (`default` e `netflix`) com OUTRO conjunto de opções (status PM2, restart serviços, logs, git pull, limpar cache, etc) e SEM Cloudflare/Instalar/MCP. Confunde o teste do fluxo do zero.
- **Decisão:** Manter UM menu único com 3 temas selecionáveis (AIO atual + default + netflix), TODOS expondo as mesmas 10 opções do painel AIO + as ações de manutenção do cdmenu (restart, logs, git pull). Tema escolhe só a aparência.
- **Como fechar:**
  1. Extrair as 10 funções principais do `install.sh` (verify_environment, install_base, prepare_structure, configure_cloudflare, configure_mcp, run_check_final, run_install_connect, run_wildcard_wizard, ensure_deps, update_repo) + manutenção do cdmenu (restart, logs, status) num módulo único `scripts/menu/actions.sh`
  2. Reescrever `cdmenu.sh` pra reusar esse módulo e mostrar TODAS as opções, mudando só o visual via tema
  3. Adicionar 3º tema (a definir — sugestão: "minimal" limpo sem ASCII)
  4. Apontar `./install.sh --menu` e `cdmenu` pro mesmo entrypoint
- **Fora de escopo agora:** estamos travados na validação do Cloudflare (item #18). Fechar #18 primeiro, depois atacar esse.



### 3. Atualizar fuso horário (BR) nas pastas restantes
- **Status:** Aberto
- **Já feito:** `apps/bot` (frontend + logs do bridge/receiver) e `infra/clone-deck-webhook-deploy`
- **Falta:**
  - `apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/**` — vários `new Date().toISOString()` em logs e payloads (não tocar sem confirmação do usuário, regra do projeto)
  - `apps/crm/src/lib/wuzapi-*.functions.ts` e `apps/crm/src/routes/admin.auditoria.tsx`
  - `apps/crm/scripts/vps/multizap-backup.sh` e `multizap-autopull.sh` (usam `date -u`)
  - `apps/bot/integracoes/telegram/services/alerts.js` (cópia espelhada já corrigida em `apps/bot-telegram/`)
  - `apps/bot/integracoes/hub/hub.js`, `apps/bot/skills/core/*.cjs`, `apps/bot/integracoes/skills/manager.js`
- **Padrão de correção:** usar `apps/bot/server/src/lib/log-time.cjs` (Node) ou `apps/bot/src/lib/datetime.ts` (frontend) — nunca `new Date().toISOString()` em logs
- **Importante:** colunas de BD (`updated_at`, `last_seen_at`, etc.) devem continuar em ISO UTC — o helper é só pra LOGS LEGÍVEIS

### 4. Sincronizar `apps/bot-telegram` (repo ↔ VPS) no deploy
- **Status:** Aberto
- **Contexto:** a pasta foi importada da VPS pro repo, mas mudanças no repo ainda não voltam automaticamente pra `/root/Multizap/apps/bot-telegram` no deploy
- **Como fechar:** adicionar etapa no `post-deploy.sh` (rsync + `pm2 restart MultiZap-TelegramBot`) — só fazer depois da Pendência 2 estar resolvida

### 6. Instalador completo com wizard interativo + restauração de backup
- **Status:** Aberto (base já criada em `install.sh` + `docs/INSTALADOR/`)
- **O que falta pra ficar "completo de verdade":**
  - Wizard passo-a-passo perguntando cada token/senha (Supabase, WuzAPI, Telegram bot, GitHub deploy key, domínio, e-mail Caddy, Cloudflare, etc.)
  - Pra cada pergunta, mostrar **onde conseguir** o valor (link/descrição curta)
  - Modo `--restore` funcional: apontar pra um backup (local, S3, ou outra VPS) e restaurar banco + secrets + WuzAPI + sessões WhatsApp
  - Instalar TUDO de uma vez: site + módulo `multizap` + bot WhatsApp + bot Telegram + gateway + WuzAPI (Docker) + Caddy + cron + webhook
  - Healthcheck final de cada serviço + relatório
- **NÃO criar sistema separado de "update via repositório":** já temos (GitHub → VPS via webhook + cron `gh-pull`). O instalador é só pra VPS nova ou restauração.

### 7. Reorganizar projeto como módulo da CentralDark
- **Status:** Planejamento ativo — primeiro organizar repositório, depois VPS
- **Contexto:** CentralDark será a plataforma principal/marketplace de módulos. O produto atual passa a ser o módulo `multizap`.
- **Estrutura final planejada na VPS:**
  - Plataforma: `/root/CentralDark/`
  - Aplicações/módulos: `/root/CentralDark/apps/`
  - Módulo atual: `/root/CentralDark/apps/modulos/multizap/`
- **Regras:**
  - Não usar `APP` maiúsculo.
  - Não usar `crm-chatbot` como nome final.
  - `clone-deck` é apenas o nome técnico atual do repositório durante a transição.
  - Cada módulo precisa ser autocontido: instalador próprio, secrets próprios, banco próprio ou schema separado, painel próprio e bots próprios quando houver.
  - A CentralDark serve o mercado/cards, auth única e dispara o instalador de cada módulo comprado.
- **Quando mexer na VPS:** só depois do repositório estar organizado e o instalador conseguir verificar instalação atual, nova instalação, atualização e migração.

### 8. MCP server — ✅ FECHADO em 04/06/2026 (OAuth + tools expandidas)
- **Status:** MCP rodando 100% no ar, OAuth 2.1 validado, conector custom plugado no ChatGPT, tools respondendo.
- **Versão atual:** `0.3.0`
- **Onde:** repo `CentralDark/apps/mcp/`, VPS `/root/CentralDark/apps/mcp/`
- **Domínio:** `https://mcp.centralldark.com` (SSL automático via Caddy)
- **OAuth:** GitHub OAuth App "MCP CentralDark" + Dynamic Client Registration + PKCE S256
- **Tools ativas (v0.3.0):**
  - **GitHub leitura:** `github_viewer`, `github_list_repos`, `github_get_repo`, `github_list_issues`, `github_list_pull_requests`, `github_get_file`, `github_list_commits`, `github_list_workflow_runs`, `github_search_code`
  - **GitHub escrita:** `github_create_issue`, `github_comment_issue`, `github_create_pull_request`, `github_create_branch`, `github_merge_pull_request`
  - **VPS leitura:** `vps_list_allowed_services`, `vps_pm2_ls`, `vps_pm2_describe`, `vps_read_log`, `vps_tail_log_filter`, `vps_disk_usage`, `vps_memory`, `vps_uptime_load`, `vps_list_ports`, `vps_run_safe_command`
  - **VPS escrita:** `vps_git_pull`, `vps_restart_service` (só serviços da lista branca)
- **Annotations corretas:** `readOnlyHint`/`destructiveHint`/`openWorldHint` em todas as tools — o ChatGPT mostra os badges certos agora.
- **Lista branca PM2:** `CloneDeck-Supabase-Sync`, `MultiZap-TelegramBot`, `MCP-CentralDark`.
- **Sanitização:** toda saída de comando filtra tokens, JWTs, secrets, ghp_*, github_pat_*.

### 8b. Persistência OAuth + página de status — ✅ CONCLUÍDO em 2026-06-04
- **Sintoma original:** ChatGPT mostrava `client_id desconhecido. Faça /register antes.` após cada restart do PM2 do MCP, porque clients/codes/tokens viviam só em memória.
- **O que foi feito:**
  - `sessions.ts` agora persiste em `MCP_STATE_FILE` (padrão `/root/CentralDark/secrets/mcp-state.json`, permissão 0600), com save atômico (`.tmp` + rename) e debounce 500ms.
  - Flush no `SIGTERM`/`SIGINT`/`beforeExit` — nada se perde no restart.
  - Novo helper `fetch-retry.ts` com backoff exponencial (3 tentativas, respeita `Retry-After`) usado em todas as chamadas pro GitHub (`/login/oauth/access_token` e `/user`) — corrige erros transitórios de auth.
  - Rotas `/status` (HTML, auto-refresh 15s) e `/status.json` com saúde dos conectores + estado OAuth (clients, tokens, sessões, logins ativos).
- **Como validar:**
  - `pm2 restart MCP-CentralDark` → ChatGPT continua autenticado sem refazer registro.
  - Abrir `https://mcp.centralldark.com/status` no navegador.

### 14. Configurar e validar domínio principal e subdomínios (wildcard DNS)
- **Status:** ✅ CONCLUÍDO (2026-06-05) — caminho oficial agora é **wildcard DNS** (`@`, `www`, `*`). Usuário só cadastra 3 registros e o instalador faz o resto. Cloudflare API virou atalho opcional. Detalhes em `docs/INSTALADOR/17-dns-wildcard.md`.
- **Pronto agora (entrega 2026-06-05):**
  - `CentralDark/scripts/installer/wildcard-dns-wizard.sh` (6 etapas: pré-check → IP → domínio → 3 registros → validação wildcard com probe aleatório → Caddy auto → online-check → relatório)
  - Libs novas: `lib/precheck.sh`, `lib/wildcard.sh`, `lib/caddy-auto.sh`, `lib/online-check.sh`
  - Flags `--wildcard`, `--wildcard-check`, `--online-check` no `install.sh`
  - Bloco 12 do checker (`scripts/checker/12-wildcard-dns.sh`) integrado ao `run-all.sh`
  - Doc oficial em `docs/INSTALADOR/17-dns-wildcard.md`
- **Pronto agora:**
  - `CentralDark/scripts/installer/cloudflare-wizard.sh` (wizard SSH completo: token → validação API → zona → DNS → Caddy → relatório)
  - Libs `lib/cloudflare.sh`, `lib/dns-check.sh`, `lib/ui.sh`, `lib/report.sh`
  - Templates Caddy em `CentralDark/infra/caddy/templates/` (static + proxy)
  - Flags novas no `install.sh`: `--dns-check` e `--domains`
  - Doc viva em `docs/INSTALADOR/16-cloudflare-dns.md`
  - Sanitização universal de logs (token nunca aparece)
  - Idempotente, com lock (`flock`) e relatório por execução em `revisoes/*/cloudflare-connect/`
- **Onde:** Cloudflare DNS + Caddy + `docs/INSTALADOR/` (checker final)
- **Objetivo:** deixar registrado agora pra não esquecer nada depois. Quando o instalador definitivo rodar, ele já valida tudo sozinho.
- **Domínio principal:** `centralldark.com` (ou domínio definido pro usuário)
- **Subdomínios previstos:** `www`, `app`, `api`, `bot`, `crm`, `mcp`, `webhook`, `gateway`, `status` e outros necessários pra MultiZap/CentralDark
- **O que o checker deve validar pra cada domínio/subdomínio:**
  1. Registro DNS existe
  2. Aponta pro IP correto da VPS
  3. Proxy Cloudflare tá no modo certo
  4. HTTPS funciona
  5. Caddy reconhece o domínio
  6. Serviço correspondente responde
  7. Zero conflito entre domínio principal, CRM, bot, gateway, MCP e webhook
- **Onde refletir no instalador:** nova etapa do checker end-to-end (#9) chamada `Verificação de domínio, DNS, Cloudflare, Caddy e HTTPS`. Essa etapa deve:
  - perguntar o domínio principal
  - perguntar quais subdomínios serão usados
  - orientar quais registros DNS criar no Cloudflare
  - validar se os registros já existem
  - validar se os domínios respondem
  - validar HTTPS
  - validar roteamento Caddy
  - gerar relatório final com OK / ALERTA / ERRO
- **Exemplo de relatório esperado:**
  ```
  DOMÍNIOS / CLOUDFLARE
  OK:
    - centralldark.com respondendo
    - mcp.centralldark.com respondendo
    - webhook.centralldark.com respondendo
  ALERTA:
    - crm.centralldark.com configurado, mas não validado nesta etapa
  ERRO:
    - bot.centralldark.com sem DNS apontando para a VPS
  PRÓXIMO PASSO:
    - Criar ou corrigir o registro DNS do subdomínio bot
  ```
- **Lista final de links pro usuário salvar (saída obrigatória do checker):** o checker tem que gerar `revisoes/<data>/links-do-usuario.md` já preenchido com o domínio configurado, agrupado assim:
  - **Site / Landing:** `https://centralldark.com` · `https://www.centralldark.com`
  - **Painel / Login:** `https://app.centralldark.com`
  - **CRM:** `https://crm.centralldark.com`
  - **Bot Telegram (painel):** `https://bot.centralldark.com`
  - **Gateway / API:** `https://api.centralldark.com` · `https://gateway.centralldark.com`
  - **MCP (IA externa):** `https://mcp.centralldark.com` + `/status`
  - **Webhook GitHub → VPS:** `https://webhook.centralldark.com/webhook`
  - **Status público:** `https://status.centralldark.com`
- **Ação sensível:** não alterar Cloudflare, Caddy, domínio público, SSL, DNS ou roteamento sem confirmação explícita do usuário
- **Critério pra fechar:**
  1. Domínio principal definido e documentado
  2. Lista oficial de subdomínios documentada (`@ www app api bot crm mcp gateway webhook status`)
  3. Registros DNS criados ou pelo menos documentados
  4. Caddy preparado pros domínios necessários
  5. HTTPS validado
  6. Instalador/checker sabe validar DNS, Cloudflare, Caddy e serviços
  7. Relatório final indica OK / ALERTA / ERRO claramente
  8. Nenhuma alteração sensível foi feita sem confirmação
  9. Arquivo `links-do-usuario.md` gerado automaticamente pelo checker com todos os links ativos e testados




### 9. Memória eterna do agente ChatGPT — ✅ CONCLUÍDO em 2026-06-04
- **Status:** Estrutura no ar. Falta o usuário criar o Custom GPT no ChatGPT (5 cliques, passo-a-passo em `docs/CONSCIENCIA/CUSTOM-GPT-SETUP.md`).
- **O que foi feito:**
  - Pasta `docs/CONSCIENCIA/` com 10 arquivos numerados + README + PLANO + setup do Custom GPT
  - Pasta `/root/CentralDark/memoria-consciencia/` na VPS com 3 arquivos privados (secrets-context, endpoints-internos, incidentes)
  - Workflow `.github/workflows/atualiza-memoria-consciencia.yml` roda a cada 6h pra atualizar `09-ESTADO-ATUAL.md`
- **Pendente do usuário:** criar o Custom GPT seguindo `docs/CONSCIENCIA/CUSTOM-GPT-SETUP.md`.

---

## 🟢 Baixa prioridade

### 5. Container `multizap-gateway-postgreswuzapi-1` loga em UTC
- **Status:** Aberto (cosmético)
- **Sintoma:** logs internos do Postgres do WuzAPI saem em UTC. Não afeta operação — é o log do banco, não da aplicação.
- **Como fechar:** adicionar `TZ=America/Sao_Paulo` no `docker-compose.yml` do WuzAPI (serviço `postgreswuzapi`) e recriar o container — **requer confirmação do usuário** (mexe em Docker do WhatsApp).

### 6. PM2 `whatsapp-server` desligado por falta de dependência
- **Status:** Parado de propósito (2026-06-04) — `pm2 stop whatsapp-server` + `pm2 save` feitos
- **Sintoma:** crashava em loop com `ERR_MODULE_NOT_FOUND: pino-roll` ao iniciar `/root/whatsapp-server/whatsapp-server/server.js`
- **Como religar:** `cd /root/whatsapp-server/whatsapp-server && npm install pino-roll` (ou `npm install` se o `package.json` já tiver) e `pm2 restart whatsapp-server`
- **Antes de religar:** confirmar se esse serviço ainda é usado — o fluxo atual de WhatsApp passa por WuzAPI (`multizap-gateway-wuzapi-1`) → `proxy.multizap.dev`, então pode ser legado e candidato a remover do PM2 de vez.

### 13. OAuth próprio CentralDark (substituir GitHub OAuth no MCP)
- **Status:** Aberto — futuro distante, NÃO mexer agora
- **Hoje:** MCP autentica IA externa via OAuth do GitHub (Client ID `Ov23li1y2mZ3qbjVB4mC`, login `segredounlock`). Funciona 100%.
- **Objetivo futuro:** subir endpoints `/authorize` `/token` `/register` próprios em `mcp.centralldark.com` (ou `auth.centralldark.com`), com tela de login no visual do CentralDark — sem depender do GitHub.
- **Onde mexer:** `apps/mcp/` (novos handlers OAuth) + Cloudflare DNS + Caddy + `docs/INSTALADOR/13-mcp.md` + `docs/INSTALADOR/14-conectar-ia-externa.md`.
- **Quando fechar:** só quando o usuário pedir explicitamente — não é prioridade.

---


## Convenções deste arquivo

- **Adicionar nova pendência:** copie um bloco existente, mantenha as 5 linhas (Status / Onde / Como fechar / detalhes opcionais).
- **Fechar pendência:** mover pro final do arquivo na seção `## ✅ Fechadas` com data, OU apagar de vez se já não tiver valor histórico.
- **Atualizar "Última atualização"** sempre que mexer.
- **Espelhar na memória:** quando criar/fechar item importante, sincronizar com `mem://pendencias`.

---

## ✅ Fechadas

### [2026-06-05] Skin NETFLIX no `cdmenu` (sistema de temas)
- Novo diretório `scripts/menu/themes/` com `default.sh` (paleta cabrata atual) e `netflix.sh` (vermelho `#E50914` + banner ASCII "NETFLIX").
- `cdmenu.sh` e `cdstatus.sh` agora carregam o tema via `$CDMENU_THEME` ou flag `--netflix` / `--default`. Visual default 100% preservado.
- Opção 12 do menu permite trocar o tema e salva em `~/.cdmenu-theme`.
- Doc atualizada em `docs/INSTALADOR/22-menu-vps.md` (seção "Trocar tema (skins)").
- Inspirado em `shopeevpn/menu-themes` (paleta + ideia visual), sem copiar código nem comitar binários do repo de origem.



### [2026-06-05] MCP — tool `github_create_or_update_file` (escrita de arquivo)
- Adicionada em `CentralDark/apps/mcp/src/tools/github-write.ts`. Backend (`createOrUpdateFile`) já existia em `github.ts`.
- Aceita `owner/repo/path/content/message/branch?` (default `main`).
- Bloqueia `.env`, `*.pem|key|p12|pfx`, `secrets/`, `credenciais/`, `tokens/`, `session(s)/`, `wuzapi/`, `.ssh/`, `id_rsa`, `id_ed25519`, `authorized_keys` + termos `password|senha|apikey|bearer` no path.
- Allowlist de repos: `segredounlock/clone-deck`, `ServerVpss/clone-deck`.
- Co-autoria `SegredoiDev` em todo commit (farm Pair Extraordinaire).
- Resposta sanitizada: owner/repo/path/branch/commit_sha/commit_url/file_sha/html_url. Nunca devolve token/Authorization.
- Doc atualizada em `CentralDark/apps/mcp/README.md` (seção "GitHub — escrita").
- Próximo: após deploy (`git pull && npm install && npm run build && pm2 restart MCP-CentralDark`), validar criando `.github/workflows/sync-to-segredounlock.yml` no repo `ServerVpss/clone-deck`.

### [2026-06-04] Página `/admin/cofre` — status e rehidratação do cofre Lovable
- Criado `apps/bot/src/pages/admin/AdminCofreLovable.tsx` com cenário A (transferir workspace) e cenário B (conta nova com frase pronta pra colar no chat da IA).
- Rota registrada em `apps/bot/src/App.tsx` e item no menu "Sistema" em `apps/bot/src/layouts/AdminLayout.tsx`.
- README + PLANO criados em `apps/bot/src/pages/admin/`.
- Doc de fundo já existia em `docs/CONSCIENCIA/12-COFRE-LOVABLE.md`.

### [2026-06-03] Hora dos logs do bot WhatsApp em UTC em vez de BR
- Criado helper `apps/bot/server/src/lib/log-time.cjs`
- Substituídos os `console.log('[' + new Date().toISOString() + ']' ...)` em `supabase-sync.cjs`, `supabase-sync.js`, `webhook-receiver.cjs` e `clone-deck-github-webhook-listener.js`
- Frontend já tinha sido tratado em commit anterior (`apps/bot/src/lib/datetime.ts`)
- Validado: helper imprime `2026-06-03 10:29 -03` enquanto UTC marca `13:29Z`
<!-- housekeeping 2026-06-04T07:14:50+00:00 -->
<!-- teste-sync-lovable 2026-06-05 -->
