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
  - Doc viva: `docs/INSTALADOR/24-bot-server.md`.
- **Falta:** rodar `CD_CONFIRM=1 bash scripts/deploy/install-bot-server.sh` na VPS (e depois, com `CD_INSTALL_CADDY=1`, abrir o domínio). Tudo isolado: zero impacto em WuzAPI, MultiZap-Gateway, CRM ou Caddy existente (snippet vai em `conf.d/`).
- **Critério de fechamento:** checklist 7 passos OK, `curl https://bot.centralldark.com/health` = 200 com `version: 0.1.0-lote11`, painel `status.centralldark.com` mostra contagem real de mensagens da sessão "WhatsApp Principal".

---


### #125 🟢 Painel — histórico do vps-healthcheck (30 dias) com link pra Issue atual — ✅ ENTREGUE (2026-06-10)



- **Entregue:** seção nova "🩺 Histórico do vps-healthcheck" no `status.centralldark.com` mostrando 30 barras (uma por dia) coloridas pela **pior severidade do dia** (P0 vermelho · P1 laranja · P2 amarelo · P3 verde · cinza = sem run). Hover mostra data + nº de runs + severidade + nº da Issue; clique abre a Issue daquele dia.
- **Cabeçalho da seção:** contadores agregados P0/P1/P2/P3 dos últimos 30d + botão direto pra **Issue mais recente** do bot.
- **Fonte de dados:** novo arquivo `CentralDark/apps/projeto-dashboard/healthcheck-history.json` (append-only, máx 30 dias). O bot `vps-healthcheck.mjs` foi estendido pra registrar cada execução (timestamp, severidade, findings, número/URL da Issue, % de disco, status do Caddy) e o workflow agora commita o histórico atualizado de volta no repo (`permissions: contents: write` + retry com rebase em caso de race).
- **UI:** `index.html` + `app.js` (`renderHealthcheck()`) + `styles.css` (.hc-bars, .hc-count, .hc-link). Render é fail-soft: se o arquivo ainda não existe (primeiro run pendente), mostra "sem histórico ainda" sem quebrar o resto do painel.

---

### #124 🟢 Time de Bots — Lote 7: `vps-healthcheck` read-only via SSH — ✅ ENTREGUE (2026-06-10)


- **Entregue:** `.github/workflows/vps-healthcheck.yml` (cron 6h + manual + push) roda `scripts/bots/vps-healthcheck.mjs` que faz 10 checks read-only via SSH (PM2 jlist, ss -tlnp, df -h, df -i, free -h, uptime, systemctl is-active caddy, git HEAD em /root, uptime -p, du /root/.grok/worktrees).
- **Segurança:** chave SSH carregada de `secrets.VPS_SSH_KEY_LOVABLE`, validada com `ssh-keygen -y`, removida no `always()`. BatchMode=yes (sem prompt), ConnectTimeout=20s, timeout total 8min. **Nada de restart, edição, Caddy/Docker/WuzAPI ou sessão WhatsApp.**
- **Auto-classificação:** P0 se SSH cair ou disco ≥95%; P1 se Caddy não-ativo, disco ≥85% ou PM2 com processo não-online; P2 se /root/.grok/worktrees >5G (proteção contra recursão Grok, pendência #30); P3 caso contrário.
- **Issue consolidada:** marcador HTML `<!-- bot:vps-healthcheck -->` garante 1 Issue só (criar OU atualizar in-place). Labels: `auto` + `revisao-humana` + `assign:grok` + severidade calculada.
- **Mini-lib:** `scripts/bots/lib/gh.mjs` (fetch nativo, sem dep externa) — `findBotIssue` + `createIssue` + `updateIssue` + `commentIssue`.
- **Pré-requisito:** secrets `VPS_HOST_LOVABLE`, `VPS_USER_LOVABLE`, `VPS_SSH_KEY_LOVABLE` no repo. Se faltar, workflow loga warning e pula sem quebrar.

---

### #122 🟢 Time de Bots — Lote 1: labels oficiais + protocolo `revisao-humana` — ✅ ENTREGUE (2026-06-10)

- **Entregue:** workflow `.github/workflows/bots-labels-seed.yml` (idempotente, cron mensal + manual) cria/atualiza 22 labels oficiais — governança (`revisao-humana`, `auto`, `stale`, `needs-codex-review`), severidade (`p0`-`p3`) e assign por IA/bot.
- **Novo doc:** `docs/BOTS/PROTOCOLO-REVISAO-HUMANA.md` — fluxo curto e prático, anatomia mínima de Issue/PR de bot, TTL 7d/30d, travas duras (nunca mergear/reiniciar/apagar/tocar secret).
- **Atualizado:** `docs/BOTS/README.md` aponta pro protocolo + workflow; `docs/BOTS/TIME-DE-BOTS.md` marca Lote 1 como ✅.
- **Como rodar agora:** abrir Actions → "Bots — seed de labels oficiais" → Run workflow. Saída sai como notice (criadas/atualizadas/iguais/falhas).
- **Pronto pra Lote 2:** `doc-guardiao` (cobrar README/PLANO por pasta) já tem label `assign:doc-guardiao` pré-cadastrada.

---

### #121 🟢 Time de Bots — Lote 0: corrigir `vigia-actions-vermelhos` — ✅ ENTREGUE (2026-06-10)

- **Root cause encontrado:** o vigia tinha 2 problemas. (1) Histórico antigo: import via URL `https://esm.sh/...` quebrava no Node 22 (`ERR_UNSUPPORTED_ESM_URL_SCHEME`) — já corrigido antes pra `@octokit/rest` local. (2) Bug de classificação ainda ativo: `const ok = run.conclusion === "success"` tratava `skipped` e `cancelled` como falha real → abria Issue indevida (foi o caso de `CodeQL — análise de segurança` que está sendo pulado, não falhando).
- **Conserto aplicado:** em `scripts/vigia/actions-vermelhos.mjs`, conclusões neutras (`skipped`, `cancelled`, `neutral`, `action_required`, `null`) agora retornam `{acao:"neutro"}` sem abrir nem fechar Issue. Em `.github/workflows/vigia-actions-vermelhos.yml`, troca de `npm install` por `npm ci` (com fallback) usando `scripts/vigia/package-lock.json` pra build determinístico.
- **Limpeza:** 5 Issues residuais (#27, #28, #29, #30, #31) fechadas via API com comentário explicando o fix.
- **Validação:** últimos 7 runs do vigia já estavam verdes (`success`). Próximo run vai confirmar que o classificador novo não reabre Issue por skip/cancel.
- **Aprendizado:** salvo no painel + virou trava do Lote 1 → todo bot novo precisa distinguir conclusão neutra de falha real antes de abrir Issue.

---

### #120 🟡 MCP `status.json` devolve `ok:false` mesmo com catálogo vivo (`toolCount:84`)


- **Sintoma:** `https://mcp.centralldark.com/status.json` responde com `ok:false` enquanto `toolCount:84` e demais subchecks parecem OK. O Mega Painel já foi ajustado pra tratar o card como verde quando `toolCount>0 && !error` (ver APRENDIZADOS #110), mas a raiz no MCP segue.
- **Onde investigar:** `CentralDark/apps/mcp/` — função que monta `status.json` (provavelmente algum subcheck — Supabase ping, GitHub PAT, webhook, etc — que está retornando false e contaminando o `ok` agregado). Logs no PM2 `mcp-centraldark`.
- **Critério pra fechar:** `status.json` retorna `ok:true` quando todos os subchecks reais estão saudáveis, ou o agregador passa a ignorar subcheck cosmético. Reverter o "fallback `toolCount`" em `app.js` quando a fonte voltar a ser verdadeira.

---

### #119 🟢 Mega Painel Auto-Vivo — ✅ ENTREGUE (2026-06-10)


- **O que mudou em `CentralDark/apps/projeto-dashboard/`:** painel-data.json ganhou 8 chaves novas (`iaCards`, `botCards`, `sectorCards`, `humanReview`, `iaTimeline`, `phases`, `weights`, `mcpTest`). `index.html` ganhou 7 seções novas (MCP Teste, Cards IA, Cards Bot, Cards Setor, Revisão Humana, Linha do Tempo IAs, Fases). `app.js` ganhou renderizadores auto-vivos, IDs determinísticos (`slug(tipo+setor+titulo)`), cálculo objetivo `floor(done/total*100)` com trava em 99% se bloqueado/erro, e MCP Teste read-only com 6 botões públicos (Status, Health, README, CONSCIENCIA, PENDENCIAS, Relatórios) — sem token exposto.
- **Validação:** JSON parse ✅, `node -c app.js` ✅, nenhuma tool sensível chamada (só fetch de endpoint público), nada de Docker/WuzAPI/Caddy/PM2/CRM/banco/sessão WhatsApp/secrets tocado.
- **Próximo passo:** ChatGPT fazer pente fino, ligar a fonte de dados live (GitHub API pra Issues/PRs `revisao-humana` e workflows vermelhos), e o bot `painel-vivo` passar a popular `iaTimeline` automaticamente a cada deploy.
- **Critério pra fechar:** painel em `status.centralldark.com` mostrando cards reais (não seed), com timeline atualizada por commit.

---

### #118 🟢 Dependabot diário + auto-merge só patches — ✅ ENTREGUE (2026-06-09)
- **Mudança no `.github/dependabot.yml`:** `interval: weekly` → `daily` nos 5 escopos (github-actions, bot-server, mcp, install-callback, frontend). Limite caiu de 5/3 pra **2 PRs abertos por escopo**. Majors continuam bloqueadas (`semver-major` no ignore). Label `security` somada às existentes.
- **Novo workflow `.github/workflows/dependabot-auto-merge.yml`:** ouve PR do Dependabot, aprova sempre, e só faz `gh pr merge --auto --squash` se for `semver-patch`. Minor fica aberto com comentário pedindo revisão humana. Major nem chega (bloqueada).
- **Pré-requisito:** repo precisa ter "Allow auto-merge" habilitado em Settings → General (já é padrão no ServerVpss/CentralDark). Branch protection se quiser exigir checks verdes antes do merge.
- **Limitação do GitHub:** Dependabot só aceita `daily | weekly | monthly` — não dá pra colocar "a cada 5 minutos". Pra testar agora, abra Insights → Dependency graph → Dependabot e clique em "Check for updates" no escopo desejado.
- **Pra voltar pra semanal depois:** trocar `daily` por `weekly` no `dependabot.yml` e pronto.

### #117 🟢 Exceção à regra "PR-only" pra DADOS gerados — ✅ ENTREGUE (2026-06-09)

- **Problema:** depois de #116, o `painel-auto-update` parou de atualizar `status.centralldark.com`. O bot continuava rodando a cada poucos minutos, mas commitava em `bots/painel-auto-update` (PR) em vez da `main`. Resultado: painel travado em `updatedAt 07:53Z` enquanto o snapshot novo (19:12Z, progresso 86%) ficava preso na branch do bot.
- **Decisão:** workflows que escrevem **DADO GERADO** (não código) voltam a fazer `git push` direto na `main`. São snapshots/relatórios de status — não precisam de revisão humana pra serem corretos. Se ficarem em PR aberto, o painel vira mentira.
- **Workflows com push direto restaurado:** `painel-auto-update` (painel-data.json), `painel-validacao` (`docs/RELATORIOS/painel-vivo-validacao/`), `painel-vivo` (idem), `sentinela-divergencias` (`docs/sentinela/` + `docs/RELATORIOS/sentinela/`), `supabase-bot` (`docs/RELATORIOS/supabase-bot/`).
- **Regra mantida:** qualquer workflow que mexa em CÓDIGO (`src/`, `apps/**/src/`, workflows, scripts, configs, docs editoriais) continua obrigado a abrir PR via `scripts/bots/commit-via-pr.sh`.
- **Fix imediato:** baixei o `painel-data.json` mais novo da branch `bots/painel-auto-update` e commitei direto na main pra status ficar verde agora.

### #116 🟢 Bots NUNCA mergeiam pra main — via PR com revisão humana — ✅ ENTREGUE (2026-06-09)
- **Regra inquebrável:** todo bot que escreve arquivo no repo abre **PR pra revisão** em vez de `git push` direto na main. Quem mergeia é só o humano.
- **Exceção #117:** workflows que só produzem DADO/SNAPSHOT (painel-data.json, relatórios em `docs/RELATORIOS/**`, `docs/sentinela/**`) voltam a push direto. Não são código.
- **Helper:** `scripts/bots/commit-via-pr.sh` — empurra commits pra `bots/<nome>`, abre PR (ou comenta se já existe) com labels `revisao-humana` + `auto` + `bot:<nome>`. Nunca chama `gh pr merge`.
- **Pra revisar PRs de bots:** `gh pr list -R ServerVpss/CentralDark -l revisao-humana --state open`.
- **Auditoria:** `grep -rE "git push|gh pr merge|--auto-merge|merge_method" .github/workflows/` — qualquer match novo em workflows de CÓDIGO precisa ser PR-ificado.



### #115 🟢 Vigia de Actions Vermelhos — 🟠 EM ANDAMENTO (entregue, aguardando 1ª falha real) · [`SEG-11`](https://linear.app/segredo/issue/SEG-11)

- **Bot 24/7** que detecta qualquer workflow do GitHub Actions falhando e abre Issue automática com label `vigia` + `red-action:<slug>` + `assign:<bot>`. Quando o mesmo workflow volta ao verde, a Issue fecha sozinha.
- **Arquivos:** `.github/workflows/vigia-actions-vermelhos.yml` (gatilhos: `workflow_run completed` + cron `7 * * * *` + dispatch) · `scripts/vigia/actions-vermelhos.mjs` (dedupe por label, comentário em re-falha, fechamento auto) · `scripts/vigia/README.md`.
- **Como revisar:** `gh issue list -R ServerVpss/clone-deck -l vigia --state open` — cada Issue traz run+commit+autor+job+step+log.
- **Roteamento:** codeql/security→codex · painel/ui→lovable · deploy/vps→grok · supabase/db→supabase-bot · bot-server/whatsapp→codex.
- **Anti-loop:** ignora o próprio `vigia-actions-vermelhos` (não vigia a si mesmo).
- **Critério pra fechar:** 1ª Issue criada de verdade + Dispatcher comentando + auto-close confirmado quando workflow voltar ao verde.

### #114 🔴 CentralDark GitHub Bot Controller + webhook-bot — 🔴 ABERTA · [`SEG-5`](https://linear.app/segredo/issue/SEG-5)

- **Objetivo:** plano-mãe que unifica os 3 webhooks históricos (`webhook-bot` :9003, `MultiZap-GitHub-Webhook` :9002, `github-webhook` :9001) num **GitHub Bot Controller** oficial que recebe push/PR, comenta PR, atualiza Mega Painel, dispara validação, roda deploy/run-once quando permitido, avisa Telegram e registra relatório sanitizado.
- **Componentes:** `webhook-bot` · `MultiZap-GitHub-Webhook` · `github-webhook` · `CentralDark/scripts/github-bot-controller.mjs` · GitHub Actions · Mega Painel · Telegram · `scripts/post-deploy.sh` · `scripts/clone-deck-gh-pull-with-deploy.sh`.
- **Fluxo antigo (referência):** `hook.multizap.dev/webhook → webhook-bot :9003 → clone-deck-gh-pull-with-deploy.sh → post-deploy.sh`.
- **Funções esperadas:** receber push/PR, comentar PR, label/checklist, disparar validação (Codex, bot-server-validate), atualizar painel, deploy/run-once permitido, notificar Telegram, gravar log em `/root/CentralDark/revisoes/<stamp>-bot-controller/`.
- **Bloqueios (sensíveis, exigem OK):** recriar `webhook-bot` sem entender por que sumiu do PM2 · mexer em Caddy · mexer em secrets · reset VPS · `pm2 delete` · alterar deploy sem auditoria.
- **Depende de:** #109 (auditoria working-tree decide destino do `webhook-bot`) + #111 (Sentinela alimenta eventos).
- **Critério pra fechar:** webhook-bot resolvido (ressuscitado ou aposentado) · eventos GitHub na VPS confirmados em log sanitizado · logs em `/root/CentralDark/revisoes/` · Mega Painel recebendo updates · PR/push gerando comentário+checklist+validação · fallback via `deploy-fallback.yml` + cron documentado.

### #113 🟢 CORS do MCP pro painel — ✅ FECHADA (2026-06-09)
- **Resolução:** `CentralDark/infra/caddy/mcp.Caddyfile` ganhou matchers `@cors_origin` (status) e `@cors_origin_install` (install) liberando `https://status.centralldark.com` e `https://install.centralldark.com` com `Allow-Methods: GET, POST, OPTIONS`, `Allow-Headers: Content-Type, Authorization, mcp-protocol-version, mcp-session-id`, `Expose-Headers: mcp-session-id`, `Max-Age: 86400`, `Vary: Origin`. Preflight `OPTIONS` responde 204 direto no Caddy.
- **Deploy ao vivo:** backup em `/root/CentralDark/revisoes/<stamp>-caddy-mcp-cors/`, `caddy validate` OK, `systemctl reload caddy` OK, serviço `active`, zero downtime.
- **Validação curl ao vivo:** `GET https://mcp.centralldark.com/health` com `Origin: https://status.centralldark.com` → 200 + headers CORS completos · `OPTIONS` → 204 + headers CORS.
- **Próximo:** reload do painel `status.centralldark.com` pra MCP Health/Status virarem 🟢.


### #112 🟡 Supabase Bot integrado ao GitHub — 🟠 EM ANDAMENTO · [`SEG-7`](https://linear.app/segredo/issue/SEG-7)
- **Entregue agora:** `CentralDark/apps/supabase-bot/` (Node + @supabase/supabase-js), workflow `.github/workflows/supabase-bot.yml` (cron daily 06:00 BRT + push em migrations + label `assign:supabase-bot`), relatório em `docs/RELATORIOS/supabase-bot/`.
- **Capacidades read-only:** health, schema overview, lista de migrations do repo.
- **Bloqueado:** escrita exige label `confirm:write`; sem isso bot só lê.
- **A fazer:** propagar `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` pros repo secrets, RPC `list_tables_rls` no banco pra audit completa, integração com Sentinela.
- **Onde mexer:** `CentralDark/apps/supabase-bot/`, `.github/workflows/supabase-bot.yml`.
- **Critério pra fechar:** bot rodando daily, relatórios commitados, Sentinela abrindo Issue se RLS sumir.

### #111 🟡 Sentinela 24/7 + Dispatcher de bots — 🟠 EM ANDAMENTO · [`SEG-8`](https://linear.app/segredo/issue/SEG-8)
- **Entregue agora:**
  - `.github/workflows/sentinela-divergencias.yml` (cron 6h + dispatch) → `scripts/sentinela/run.mjs` checa endpoints públicos (MCP, install, painel, api), CORS, workflows vermelhos 24h, abre Issue com dedupe por hash SHA1 + label `sentinela`, `auto`, `p1/p2/p3`, `assign:<bot>`.
  - `.github/workflows/sentinela-stale.yml` (daily) → marca Issues sem PR em 7d como `stale`.
  - `.github/workflows/dispatcher-bots.yml` (on `issues.labeled`) → posta briefing operacional pro bot dono (codex/supabase-bot/lovable/grok/chatgpt).
  - `.github/workflows/painel-validacao.yml` (daily + push) → `scripts/validar-painel-vivo.mjs` valida campos do `painel-data.json` + faz HEAD nos endpoints `liveStatus[]` + grava relatório verde/amarelo/vermelho.
  - `docs/BOTS/README.md` com matriz "quem faz o quê" + fluxo end-to-end.
- **Anti-loop:** TTL 7d, dedupe por hash, bot só age com label `assign:<self>`.
- **A fazer:** primeira execução real (esperar próximo cron ou disparar manual), validar que labels sobem na conta do repo, confirmar dispatcher comentando.
- **Critério pra fechar:** 3 ciclos consecutivos da sentinela rodando, todas as Issues com bot dono respondendo dentro do TTL, painel mostrando evento "Sentinela rodou" em tempo real.



### #110 🟢 Evolução contínua dos bots GitHub — 🟠 EM ANDAMENTO (1ª onda concluída) · [`SEG-12`](https://linear.app/segredo/issue/SEG-12)
- **1ª onda concluída em 2026-06-09:** auditoria dos 31 workflows (`docs/RELATORIOS/2026-06-09-auditoria-workflows-bots.md`) + 6 novos workflows ativos: `dependabot.yml` (5 escopos: actions, bot-server, mcp, install-callback, frontend), `codeql.yml` (JS/TS push+PR+weekly), `pr-auto-review.yml` (label + checklist PT-BR + heart em todo PR), `bot-server-validate.yml` (9 validadores offline Lotes 2–10), `farm-co-author.yml` (trailer SegredoiDev), `painel-auto-update.yml` (status.centralldark.com vive a cada push). Total: **10 workflows ativos úteis** (antes eram 4).
- **2ª onda planejada:** `release-please` (versionamento + changelog) · `semantic-pull-request` (Conventional Commits no título do PR) · `actionlint` (lint dos próprios YAMLs em CI) · `gitleaks` (escaneia segredo vazado em commit) · `codecov` quando houver suíte de testes.
- **3ª onda (pós-SSH):** reativar `deploy-fallback.yml` (SSH idempotente 30s após push) só depois que `webhook-bot` for resolvido (#109) e que decidirmos secret SSH na conta atual.
- **Limpeza dos 27 stubs zumbis:** PR dedicado quando ninguém depender mais dos nomes — auditoria já documentou cada um.
- **Onde mexer:** `.github/workflows/`, `.github/dependabot.yml`, `.lovable/memory/workflows-ativos-auditoria.md`.
- **Critério pra fechar:** 2ª onda em produção + decisão sobre SSH + limpeza dos stubs feita + Mega Painel mostrando todos os bots como agentes próprios.

### #109 🟡 Auditoria working-tree VPS pós-Lote 10 (Modo Segredo) — 🟠 EM ANDAMENTO · [`SEG-13`](https://linear.app/segredo/issue/SEG-13)
- **Contexto:** depois do Lote 10 (`4374df7`) e do commit `d5e9ba2` (#108), `git status` da VPS aparece sujo: muitos arquivos versionados marcados como deletados em `CentralDark/apps/...`, dois modificados (`central-horario/node.cjs`, `apps/bot/package-lock.json`) e untracked variados (`dist/`, `build/`, `.wrangler/`, `skills/`, etc). `webhook-bot` sumiu do PM2 (sobraram 7 processos). Sync repo↔VPS reportou OK, mas working tree precisa ser classificado antes de qualquer limpeza.
- **Risco:** `git reset --hard` cego perde divergência local útil. Recriar `webhook-bot` sem entender por que sumiu pode reabrir bug antigo.
- **Etapa atual (read-only, sem tocar em nada):** rodar `bash /root/CentralDark/scripts/auditoria/working-tree-vps.sh` na VPS (via MCP `runShell` ou SSH). O script gera pacote em `/root/CentralDark/revisoes/<stamp>-auditoria-working-tree/` com: status v2, diffs sanitizados dos modificados, lista de deletados versionados, untracked com hash+tamanho (pulando `.env`/`secrets`/`tokens`/`sessions`/`.ssh`/`*.pem`/`*.key`), `pm2 jlist`, checagem dos 7 handlers Lote 4–10, confirmação de ausência do `webhook-bot`, e classificação automática em buckets A/B/C/D.
- **Bloqueado nesta fase (precisa OK separado depois):** `git reset --hard`, `git checkout --` em modificados, `pm2 start/delete webhook-bot`, truncate do log de 20MB, apagar ou mover untracked, cherry-pick dos commits locais, qualquer `rm -rf`.
- **Onde mexer:** `CentralDark/scripts/auditoria/working-tree-vps.sh`, relatório futuro em `docs/RELATORIOS/2026-06-09-auditoria-working-tree-vps.md`.
- **Critério pra fechar:** pacote da auditoria revisado pelo usuário + decisão registrada pra cada bucket (preservar / descartar / quarentena) + working tree limpo + `webhook-bot` resolvido (ressuscitado ou oficialmente aposentado).



### #109 🟡 Auditoria working-tree VPS pós-Lote 10 (Modo Segredo) — 🟠 EM ANDAMENTO · [`SEG-13`](https://linear.app/segredo/issue/SEG-13)
- **Contexto:** depois do Lote 10 (`4374df7`) e do commit `d5e9ba2` (#108), `git status` da VPS aparece sujo: muitos arquivos versionados marcados como deletados em `CentralDark/apps/...`, dois modificados (`central-horario/node.cjs`, `apps/bot/package-lock.json`) e untracked variados (`dist/`, `build/`, `.wrangler/`, `skills/`, etc). `webhook-bot` sumiu do PM2 (sobraram 7 processos). Sync repo↔VPS reportou OK, mas working tree precisa ser classificado antes de qualquer limpeza.
- **Risco:** `git reset --hard` cego perde divergência local útil. Recriar `webhook-bot` sem entender por que sumiu pode reabrir bug antigo.
- **Etapa atual (read-only, sem tocar em nada):** rodar `bash /root/CentralDark/scripts/auditoria/working-tree-vps.sh` na VPS (via MCP `runShell` ou SSH). O script gera pacote em `/root/CentralDark/revisoes/<stamp>-auditoria-working-tree/` com: status v2, diffs sanitizados dos modificados, lista de deletados versionados, untracked com hash+tamanho (pulando `.env`/`secrets`/`tokens`/`sessions`/`.ssh`/`*.pem`/`*.key`), `pm2 jlist`, checagem dos 7 handlers Lote 4–10, confirmação de ausência do `webhook-bot`, e classificação automática em buckets A/B/C/D.
- **Bloqueado nesta fase (precisa OK separado depois):** `git reset --hard`, `git checkout --` em modificados, `pm2 start/delete webhook-bot`, truncate do log de 20MB, apagar ou mover untracked, cherry-pick dos commits locais, qualquer `rm -rf`.
- **Onde mexer:** `CentralDark/scripts/auditoria/working-tree-vps.sh`, relatório futuro em `docs/RELATORIOS/2026-06-09-auditoria-working-tree-vps.md`.
- **Critério pra fechar:** pacote da auditoria revisado pelo usuário + decisão registrada pra cada bucket (preservar / descartar / quarentena) + working tree limpo + `webhook-bot` resolvido (ressuscitado ou oficialmente aposentado).

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


### api.centralldark.com agora serve a documentação estilo WazAPI — ✅ FECHADO em 2026-06-09
- **Entregue:** página única `CentralDark/apps/api-docs/public/index.html` (sidebar com grupos colapsáveis, busca, blocos de endpoint com badges GET/POST/PUT/DELETE, blocos de código com tabs e copy, dark + verde neon, Inter + JetBrains Mono).
- **Caddy:** `CentralDark/infra/caddy/api.centralldark.com.Caddyfile` reescrito com `handle` blocks — `/health`, `/v1/*`, `/api/*` continuam indo pro `MultiZap-Gateway:3100`, tudo o resto serve estático de `/var/www/api-docs/`.
- **Cadeia 7/7 validada:** repo OK · snippet no FS · `caddy validate` ok · `systemctl reload caddy` ok · `curl /` 200 com marcador novo · `curl /health` JSON do gateway · `curl /v1/anything` 404 do gateway (não SPA fallback).
- **Doc:** `docs/INSTALADOR/24-api-docs.md`.

### Lote 2 WhatsApp read-only — endpoint `listChats` mapeado + consolidação — ✅ FECHADO em 2026-06-09
- **Achado:** WuzAPI (asternic) não expõe `listChats` nativo. Auditoria read-only (run-once `audit-list-chats-endpoint.mjs`) testou 9 candidatos sintéticos → 9/9 retornaram 404. Inspeção do `/api/spec.yml` confirmou: chats são decompostos em `/user/contacts` (GET) + `/group/list` (GET); histórico em `/chat/history` (GET).
- **Aplicado:** `wuzapi-readonly-audit.ts` atualizado — `listChats` agora aponta `/user/contacts`, `<configuravel>` removido.
- **Consolidação:** adaptador, service e scripts movidos de `apps/bot-server/` (duplicata órfã) para o pacote operacional oficial `CentralDark/apps/bot-server/`. Casca duplicada removida do repo. Validador `npm run validate:whatsapp` passa no destino consolidado.
- **Doc:** `docs/WHATSAPP-API/LOTE-2-listChats.md` · relatório bruto em `/root/CentralDark/revisoes/20260609-135511-listchats-audit/relatorio.json`.
- **Segurança:** token nunca saiu da VPS, nenhuma rota de escrita disparada, sessão WhatsApp/Docker/Caddy intactos.
- **Próximo:** Lote 3 — implementar `getCentralDarkChats()` em `CentralDark/apps/bot-server/src/services/whatsapp/` combinando contatos + grupos.

### Lote 3 WhatsApp read-only — `getCentralDarkChats()` composto — ✅ FECHADO em 2026-06-09
- **Entrega:** `service.getCentralDarkChats()` em `CentralDark/apps/bot-server/src/services/whatsapp/read-only-whatsapp-service.ts` faz `Promise.all([client.listContacts(), client.listGroups()])` e compõe um `CentralDarkChatSummary[]` deduplicado por `chatId` e ordenado por título.
- **Novidades no gateway:** método `client.listContacts()` consumindo `GET /user/contacts` (aceita payload `Array` ou `Record<jid, contact>`); tipo `WuzApiContactRecord`; operações novas (`listContacts`, `getCentralDarkChats`); mapper `composeCentralDarkChats()` + `mapWuzApiContactRecordToChatSummary()` escolhendo título por `PushName → FullName → FirstName → BusinessName → Name`.
- **Allowlist:** `wuzapi-readonly-audit.ts` ganhou entrada `listContacts` apontando `/user/contacts`; bloqueios de write (`/chat/send/`, `/session/logout`, etc.) intactos.
- **Validação:** `cd CentralDark/apps/bot-server && npm run validate:chats` → 14/14 OK (offline, sem secrets, sem HTTP). Script: `scripts/validate-get-central-dark-chats.mjs`.
- **Doc:** `docs/WHATSAPP-API/LOTE-3-getCentralDarkChats.md` (árvore + fluxo + garantias + próximos lotes).
- **Segurança:** zero `process.env`, zero chamadas a Docker/WuzAPI runtime, Caddy/CRM/banco/WhatsApp session intactos. Token só seria usado em runtime real via `WuzApiReadOnlyConfig.authValue` (fora do escopo deste commit).
- **Próximo:** Lote 4 — expor `GET /v1/whatsapp/chats` no bot-server consumindo o service, com auth + cache curto.

### Lote 4 WhatsApp read-only — rota `GET /v1/whatsapp/chats` — ✅ FECHADO em 2026-06-09
- **Entrega:** `createGetWhatsAppChatsHandler({ service })` em `CentralDark/apps/bot-server/src/api/routes/whatsapp-chats.ts`. Handler puro (request → `{ statusCode, body }`), pronto pra ligar em Express/Fastify/Hono via DI. Constante `WHATSAPP_CHATS_ROUTE = { method: 'GET', path: '/v1/whatsapp/chats', readOnly: true, composedFrom: ['/user/contacts', '/group/list'] }`.
- **Segurança:** sem `process.env` no handler (service injetado no boot), `resolveWorkspaceContext` obrigatório (multi-tenant), `resolveRequestId` propagado, `handleSafeError` sanitizando erros, zero fragmentos destrutivos.
- **Validação:** `npm run validate:route:chats` → 13/13 OK (offline, sem rede, sem secrets). Script: `scripts/validate-whatsapp-chats-route.mjs`.
- **Doc:** `docs/WHATSAPP-API/LOTE-4-rota-chats.md` (contrato + exemplo de resposta + DI + garantias).
- **Próximo:** Lote 5 — `GET /v1/whatsapp/contacts` (lista crua de `/user/contacts`), seguido por avatar, groups e participants.

### Lote 5 WhatsApp read-only — rota `GET /v1/whatsapp/contacts` — ✅ FECHADO em 2026-06-09
- **Entrega:** `createGetWhatsAppContactsHandler({ service })` em `CentralDark/apps/bot-server/src/api/routes/whatsapp-contacts.ts`. Handler puro (request → `{ statusCode, body }`), consome `service.listContacts()` (`GET /user/contacts` do WuzAPI). Constante `WHATSAPP_CONTACTS_ROUTE = { method: 'GET', path: '/v1/whatsapp/contacts', readOnly: true, composedFrom: ['/user/contacts'] }`.
- **Service:** `listContacts()` adicionado ao tipo `WhatsAppReadOnlyService` e à implementação em `read-only-whatsapp-service.ts`.
- **Segurança:** sem `process.env` no handler (service injetado no boot), `resolveWorkspaceContext` obrigatório (multi-tenant), `resolveRequestId` propagado, `handleSafeError` sanitizando erros, zero fragmentos destrutivos.
- **Validação:** `npm run validate:route:contacts` → 13/13 OK (offline, sem rede, sem secrets). Script: `scripts/validate-whatsapp-contacts-route.mjs`.
- **Doc:** `docs/WHATSAPP-API/LOTE-5-rota-contacts.md` (contrato + exemplo de resposta + DI + garantias).
- **Próximo:** Lote 6 — `GET /v1/whatsapp/contacts/:phone/avatar` (consumindo `service.getContactAvatar`), seguido por groups e participants.

### Lote 6 WhatsApp read-only — rota `GET /v1/whatsapp/contacts/:phone/avatar` — ✅ FECHADO em 2026-06-09
- **Entrega:** `createGetWhatsAppContactAvatarHandler({ service })` em `CentralDark/apps/bot-server/src/api/routes/whatsapp-contact-avatar.ts`. Handler puro (request → `{ statusCode, body }`), consome `service.getContactAvatar(phone, preview)` (`GET /user/avatar` do WuzAPI). Constante `WHATSAPP_CONTACT_AVATAR_ROUTE = { method: 'GET', path: '/v1/whatsapp/contacts/:phone/avatar', readOnly: true, composedFrom: ['/user/avatar'] }`.
- **Service:** `getContactAvatar(phoneOrJid, preview?)` adicionado ao tipo `WhatsAppReadOnlyService` e à implementação em `read-only-whatsapp-service.ts` (delega a `client.getProfileAvatar`).
- **Normalização:** `:phone` aceita E.164, número cru e JID (`@s.whatsapp.net` / `@lid`) — sanitizado antes de bater no upstream. Query `preview` opcional (default `true`; `false`/`full` pede avatar completo).
- **Segurança:** sem `process.env` no handler, `resolveWorkspaceContext` obrigatório (multi-tenant), `resolveRequestId` propagado, `handleSafeError` sanitizando erros, zero fragmentos destrutivos, nenhum byte de mídia binária persistido (só metadados URL/ID/Type/DirectPath).
- **Validação:** `npm run validate:route:contact-avatar` → 15/15 OK (offline, sem rede, sem secrets). Script: `scripts/validate-whatsapp-contact-avatar-route.mjs`.
  - **Doc:** `docs/WHATSAPP-API/LOTE-6-rota-contact-avatar.md` + atualização em `docs/WHATSAPP-API/07-contacts.md`.
  - **Próximo:** Lote 7 — `GET /v1/whatsapp/groups` (lista crua de `/group/list`), seguido por `/v1/whatsapp/groups/:groupJid/participants`.

### Lote 7 WhatsApp read-only — rota `GET /v1/whatsapp/groups` — ✅ FECHADO em 2026-06-09
  - **Entrega:** `createGetWhatsAppGroupsHandler({ service })` em `CentralDark/apps/bot-server/src/api/routes/whatsapp-groups.ts`. Handler puro (request → `{ statusCode, body }`), consome `service.listGroups()` (`GET /group/list` do WuzAPI). Constante `WHATSAPP_GROUPS_ROUTE = { method: 'GET', path: '/v1/whatsapp/groups', readOnly: true, composedFrom: ['/group/list'] }`.
  - **Service:** `listGroups()` já existia no tipo `WhatsAppReadOnlyService` e na implementação em `read-only-whatsapp-service.ts` (delega a `client.listGroups()` com mapper `mapWuzApiGroupToSummary`).
  - **Segurança:** sem `process.env` no handler, `resolveWorkspaceContext` obrigatório (multi-tenant), `resolveRequestId` propagado, `handleSafeError` sanitizando erros, zero fragmentos destrutivos.
  - **Validação:** `npm run validate:route:groups` → 11/11 OK (offline, sem rede, sem secrets). Script: `scripts/validate-whatsapp-groups-route.mjs`.
  - **Doc:** `docs/WHATSAPP-API/LOTE-7-rota-groups.md` + atualização em `docs/WHATSAPP-API/08-groups.md`.
  - **Próximo:** Lote 8 — `GET /v1/whatsapp/groups/:groupJid/participants`.

### Lote 8 WhatsApp read-only — rota `GET /v1/whatsapp/groups/:groupJid/participants` — ✅ FECHADO em 2026-06-09
  - **Entrega:** `createGetWhatsAppGroupParticipantsHandler({ service })` em `CentralDark/apps/bot-server/src/api/routes/whatsapp-group-participants.ts`. Handler puro (request → `{ statusCode, body }`), consome `service.listGroupParticipants(groupJid)` (`GET /group/info` do WuzAPI, campo `Participants`). Constante `WHATSAPP_GROUP_PARTICIPANTS_ROUTE = { method: 'GET', path: '/v1/whatsapp/groups/:groupJid/participants', readOnly: true, composedFrom: ['/group/info'] }`.
  - **Service:** `listGroupParticipants(groupJid)` já existia no tipo `WhatsAppReadOnlyService` e na implementação em `read-only-whatsapp-service.ts` (delega a `client.listGroupParticipants(groupJid)` que valida `GroupJID` com `@g.us`).
  - **Segurança:** sem `process.env` no handler, `resolveWorkspaceContext` obrigatório (multi-tenant), `resolveRequestId` propagado, `handleSafeError` sanitizando erros, validação de `groupJid` (só `@g.us` aceito) no handler antes do upstream, zero fragmentos destrutivos.
  - **Validação:** `npm run validate:route:group-participants` → 15/15 OK (offline, sem rede, sem secrets). Script: `scripts/validate-whatsapp-group-participants-route.mjs`.
  - **Doc:** `docs/WHATSAPP-API/LOTE-8-rota-group-participants.md` + atualização em `docs/WHATSAPP-API/08-groups.md`.
  - **Próximo:** Lote 9 — `GET /v1/whatsapp/groups/:groupJid` (detalhes completos de um grupo).

### Lote 9 WhatsApp read-only — rota `GET /v1/whatsapp/groups/:groupJid` — ✅ FECHADO em 2026-06-09
  - **Entrega:** `createGetWhatsAppGroupDetailsHandler({ service })` em `CentralDark/apps/bot-server/src/api/routes/whatsapp-group-details.ts`. Handler puro (request → `{ statusCode, body }`), consome `service.getGroup(groupJid)` (`GET /group/info` do WuzAPI, retorna metadados completos do grupo). Constante `WHATSAPP_GROUP_DETAILS_ROUTE = { method: 'GET', path: '/v1/whatsapp/groups/:groupJid', readOnly: true, composedFrom: ['/group/info'] }`.
  - **Service:** `getGroup(groupJid)` adicionado ao tipo `WhatsAppReadOnlyService` e à implementação em `read-only-whatsapp-service.ts` (delega a `client.getGroup(groupJid)`). Client atualizado em `wuzapi-readonly-client.ts` com novo método chamando `/group/info` e tipos atualizados em `wuzapi-readonly-types.ts`.
  - **Segurança:** sem `process.env` no handler, `resolveWorkspaceContext` obrigatório (multi-tenant), `resolveRequestId` propagado, `handleSafeError` sanitizando erros, validação de `groupJid` (só `@g.us` aceito) no handler antes do upstream, zero fragmentos destrutivos.
  - **Validação:** `npm run validate:route:group-details` → 20/20 OK (offline, sem rede, sem secrets). Script: `scripts/validate-whatsapp-group-details-route.mjs`.
  - **Doc:** `docs/WHATSAPP-API/LOTE-9-rota-group-details.md` + atualização em `docs/WHATSAPP-API/08-groups.md`.
  - **Próximo:** Lote 10 — histórico read-only de mensagens (`GET /v1/whatsapp/messages/:chatId/history`).

### Lote 10 WhatsApp read-only — rota `GET /v1/whatsapp/messages/:chatId/history` — ✅ FECHADO em 2026-06-09
  - **Entrega:** `createGetWhatsAppMessageHistoryHandler({ service })` em `CentralDark/apps/bot-server/src/api/routes/whatsapp-message-history.ts`. Handler puro (request → `{ statusCode, body }`), consome `service.getChatHistory({ chatJid, limit, cursor })` por baixo (`GET /chat/history` do WuzAPI). Constante `WHATSAPP_MESSAGE_HISTORY_ROUTE = { method: 'GET', path: '/v1/whatsapp/messages/:chatId/history', readOnly: true, composedFrom: ['/chat/history'] }`.
  - **Aceita contato e grupo:** `:chatId` validado por sufixo (`@s.whatsapp.net` | `@g.us` | `@lid`), com `chatKind` na resposta.
  - **Query segura:** `limit` opcional (default 50, teto `WHATSAPP_HISTORY_MAX_LIMIT=200` via `Math.min`) — evita puxar histórico gigante. `cursor` opcional pra paginação, propagado pro upstream e devolvido como `nextCursor`.
  - **Service/Client/Types:** `getChatHistory` adicionado ao tipo `WhatsAppReadOnlyService`, à implementação em `read-only-whatsapp-service.ts` (delega a `client.getChatHistory`), ao gateway em `wuzapi-readonly-client.ts`, aos tipos em `wuzapi-readonly-types.ts` e à allowlist em `wuzapi-readonly-audit.ts` (`/chat/history` documentado).
  - **Segurança:** sem `process.env` no handler, `resolveWorkspaceContext` obrigatório (multi-tenant), `resolveRequestId` propagado, `handleSafeError` sanitizando erros, zero fragmentos destrutivos (`/chat/send/`, `/session/logout`, `DELETE` etc. bloqueados pela allowlist).
  - **Validação:** `npm run validate:route:message-history` → 22/22 OK (offline, sem rede, sem secrets). Script: `scripts/validate-whatsapp-message-history-route.mjs`.
  - **Doc:** `docs/WHATSAPP-API/LOTE-10-rota-message-history.md`.
  - **Próximo:** Lote 11 — a definir. Envio (`POST /v1/whatsapp/send`) fica para depois, com confirmação separada e guardrails próprios (sai do modo 100% read-only).


## 🔴 Alta prioridade

### 53. Formalizar comando RECARREGAR MEMORIA ATUAL
- **Status:** Aberto
- **Descrição:** Registrar nos documentos oficiais do CentralDark que o usuario deve poder abrir qualquer conversa nova ou continuar uma conversa e falar apenas RECARREGAR MEMORIA ATUAL, RELOAD MEMORIA ATUAL, CARREGAR MEMORIA ou frase equivalente para a IA carregar o contexto do projeto e continuar no padrao CentralDark sem exigir prompt longo.
- **Onde mexer:** Documentacao de consciencia, README raiz, CentralDark/agentes e documentos de handoff quando a etapa de agentes for aplicada.
- **Como fechar:** Fechar quando o README e a documentacao de agentes deixarem claro que esses comandos acionam o carregamento de contexto, com resposta esperada MEMORIA CARREGADA, STATUS, FASE ATUAL, FASE PAUSADA, PROXIMO PASSO SEGURO, O QUE NAO DEVE SER TOCADO e HANDOFF.
- **Aberto em:** 2026-06-16 (via MCP)

### 48. vps_pm2_ls retorna status unknown para todos os processos
- **Status:** Aberto
- **Descrição:** Tool le dump.pm2 local mas nao consegue extrair status real. Os 8 processos aparecem com status=unknown, impossibilitando saber se algo caiu. Fix sugerido: usar pm2 jlist via fs.readFileSync de ~/.pm2/dump.pm2 parseando corretamente, ou ps -p $PID.
- **Aberto em:** 2026-06-11 (via MCP)

### 47. Expandir PM2_ALLOWED_RESTART na VPS
- **Status:** Aberto
- **Descrição:** vps_list_allowed_services so retorna [MCP-CentralDark] mas pm2 tem 8 processos (whatsapp-server, CloneDeck-CRM, Install-Callback, MultiZap-Gateway, monitor_tarefas, CloneDeck-Supabase-Sync, CentralDark-BotServer). Workflow ativar-monitor-tarefas.yml falha por causa disso.
- **Aberto em:** 2026-06-11 (via MCP)


### 41. OAuth Cloudflare grava cofre quebrado — `CF_ZONE_NAME=s` + token inválido · [`SEG-9`](https://linear.app/segredo/issue/SEG-9)
- **Sintoma:** `./install.sh` → `ativar-validar-api-centralldark.sh` quebra em 3/9 com `curl: (22) ... 403`. Diagnosticado em 2026-06-09: `/root/CentralDark/secrets/cloudflare.env` gravado pelo OAuth em 05/jun tem `CF_API_TOKEN=cfoa…` (access token OAuth, rejeitado pela API REST como "Invalid API Token") e `CF_ZONE_NAME=s` (literalmente o caractere "s").
- **Mitigação aplicada em 2026-06-09 (este commit):**
  1. `CentralDark/apps/install-callback/server.js` — `saveCloudflareSecret` agora valida `zoneName` por regex de domínio real (≥4 chars, com ponto). Lixo tipo "s" é descartado.
  2. Callback OAuth chama `verifyToken` antes de gravar; se o access token não passar em `/user/tokens/verify`, mostra erro pro usuário e NÃO grava cofre.
  3. `HAS_OAUTH` agora exige `CF_OAUTH_ENABLED=1` no `.env` do install-callback. Default desligado — 1-Click Token vira o caminho oficial.
- **Falta:**
  - Usuário rodar `./install.sh --connect` pelo celular e gerar cofre novo via **🔑 Criar token 1-Click** (`Zone:Read + DNS:Edit`).
  - Validar com `ativar-validar-api-centralldark.sh` rodando até o passo 9/9.
  - Decidir destino do OAuth: consertar (trocar `cfoa…` por API token via `POST /accounts/{id}/tokens`, exige scope `account:write`) ou aposentar de vez.
- **Critério pra fechar:** cofre novo gravado, `curl /user/tokens/verify` HTTP 200 + `status:active`, e cadeia DNS → Caddy → health passando em `api.centralldark.com`.
- **Reabre na prática a #18.** Origem do bug: `install-callback/server.js` linha 477+2058 (versão de 05/jun, antes do regex de zone e do verifyToken no callback).

### 40. `post-deploy.sh` não reinicia `Install-Callback` ao mudar server.js · [`SEG-10`](https://linear.app/segredo/issue/SEG-10)
- **Sintoma:** Após push que altera `CentralDark/apps/install-callback/server.js`, o PM2 `Install-Callback` continua servindo o JS antigo carregado em memória. Visto em 2026-06-08: redesign Emerald Prestige no FS, mas `install.centralldark.com/docs` servindo HTML antigo por 43h após o pull.
- **Onde mexer:** `scripts/post-deploy.sh` (raiz do repo) — adicionar detecção de mudança em `CentralDark/apps/install-callback/**` e `pm2 restart Install-Callback --update-env` quando houver diff.
- **Critério pra fechar:** push que toca o `server.js` do install-callback faz o serviço reiniciar automaticamente, e o domínio público serve a versão nova sem intervenção manual. Validar com `curl https://install.centralldark.com/docs` mostrando marcador da versão nova logo após o deploy.
- **Aprendizado-fonte:** APRENDIZADOS.md item #34.

### 38. Corrigir referências legadas antes de apagar pastas antigas · [`SEG-14`](https://linear.app/segredo/issue/SEG-14)
- **Status:** Aberto
- **Descrição:** A auditoria encontrou 217 referências a /root/[oculto] ou /root/[oculto], incluindo Caddyfile atual e scripts dentro de apps migrados. Essas referências precisam ser corrigidas ou classificadas antes de quarentena/apagamento das pastas antigas.
- **Onde mexer:** Código/docs em /root/[oculto] e, com confirmação explícita, /etc/caddy/Caddyfile
- **Como fechar:** Separar referências em docs vs código ativo vs Caddy; corrigir docs/código seguro; solicitar confirmação antes de alterar Caddy; validar PM2/HTTP; só depois mover /root/[oculto] e /root/[oculto] para quarentena/apagar.
- **Aberto em:** 2026-06-07 (via MCP)

### 36. Arquivar e apagar pastas apps antigas após validação · [`SEG-15`](https://linear.app/segredo/issue/SEG-15)
- **Status:** Aberto
- **Descrição:** Depois da migração das apps antigas para a pasta principal, validar serviços, Git, HTTP e conteúdo migrado. Em seguida, colocar as pastas antigas em quarentena/backup e só depois apagar definitivamente com confirmação explícita.
- **Onde mexer:** VPS: pastas antigas de apps e pasta principal de apps do CentralDark
- **Como fechar:** Confirmar que PM2/HTTP continuam online, que os arquivos migrados úteis estão no local correto, que o GitHub recebeu o que deve receber sem arquivos privados abertos, mover antigas para quarentena, validar novamente e apagar somente após confirmação literal do usuário.
- **Aberto em:** 2026-06-07 (via MCP)

### 35. Migrar apps antigas para /root/[oculto] após comparação VPS + GitHub · [`SEG-16`](https://linear.app/segredo/issue/SEG-16)
- **Status:** Aberto
- **Descrição:** Depois de comparar /root/[oculto], /root/[oculto], /root/[oculto] e o repositório ServerVpss/CentralDark, criar plano controlado para migrar somente o que for necessário para a pasta principal /root/[oculto] e remover/arquivar pastas antigas com segurança.
- **Onde mexer:** VPS: pastas apps antigas e /root/[oculto]; repositório ServerVpss/CentralDark para refletir o estado correto depois
- **Como fechar:** Gerar relatório final de comparação, escolher o que migrar, fazer backup/arquivo das pastas antigas, migrar uma pasta/app por vez, validar PM2/HTTP, e só apagar antigas após confirmação explícita do usuário.
- **Aberto em:** 2026-06-07 (via MCP)

### 33. Garantir sync principal -> espelho sem executar Actions no espelho · [`SEG-17`](https://linear.app/segredo/issue/SEG-17)
- **Status:** Aberto
- **Descrição:** O fluxo de sync deve copiar o conteúdo do repo principal ServerVpss/CentralDark para o espelho segredounlock/clone-deck, mas sem fazer o espelho executar workflows/deploy. Idealmente, Actions do espelho ficam desativadas no nível do repo; se não houver ferramenta, o sync deve preservar stubs inofensivos em .github/workflows no espelho ou excluir workflows executáveis.
- **Onde mexer:** .github/workflows/sync-to-segredounlock.yml no principal e .github/workflows no espelho
- **Como fechar:** Fazer uma execução de sync e validar que o espelho recebeu arquivos, mas nenhum workflow de deploy foi disparado no espelho.
- **Aberto em:** 2026-06-07 (via MCP)

### 32. Remover ou inutilizar secrets operacionais do espelho · [`SEG-18`](https://linear.app/segredo/issue/SEG-18)
- **Status:** Aberto
- **Descrição:** O espelho segredounlock/clone-deck ainda possui secrets como VPS_HOST, VPS_USER, AUTO_PR_TOKEN e secrets mascaradas. Como o espelho será backup passivo, essas secrets não devem ficar operacionais no espelho.
- **Onde mexer:** Settings/Secrets do repo segredounlock/clone-deck ou ferramenta GitHub equivalente
- **Como fechar:** Remover ou inutilizar secrets operacionais do espelho. Não copiar valores para o chat. Se alguma secret for necessária no principal, migrar uma por vez e só quando workflow do principal exigir.
- **Aberto em:** 2026-06-07 (via MCP)

### 31. Transformar espelho segredounlock/clone-deck em backup passivo · [`SEG-19`](https://linear.app/segredo/issue/SEG-19)
- **Status:** Aberto
- **Descrição:** O repo espelho deve apenas receber conteúdo do repo principal ServerVpss/CentralDark. Ele não deve executar deploy, Actions, PM2, VPS, webhooks operacionais ou qualquer automação própria.
- **Onde mexer:** segredounlock/clone-deck, workflows do espelho e workflow de sync no ServerVpss/CentralDark
- **Como fechar:** Garantir que o espelho receba arquivos do principal, mas não execute workflows, não use secrets de VPS e não dispare deploys.
- **Aberto em:** 2026-06-07 (via MCP)

### 9. Instalador precisa ter CHECKER END-TO-END completo — 🟡 PARCIAL em 2026-06-04 · [`SEG-20`](https://linear.app/segredo/issue/SEG-20)
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

### 1. Religar sync da instância "Recargas Brasil" · [`SEG-21`](https://linear.app/segredo/issue/SEG-21)
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






### 15. Servir bootstrap por domínio próprio (`install.centralldark.com`) · [`SEG-22`](https://linear.app/segredo/issue/SEG-22)
- **Status:** Aberto — solução atual usa repo público espelho `segredounlock/centraldark-install` (funciona)
- **Objetivo:** trocar o one-liner do leigo de `raw.githubusercontent.com/.../centraldark-install/...` pra `install.centralldark.com`, mais bonito e estável
- **Onde mexer:** rota nova no Caddy (sensível — pedir confirmação) + DNS Cloudflare A record + redirect 302 pro raw atual
- **Critério pra fechar:** `curl -fsSL https://install.centralldark.com` devolver o `bootstrap.sh` válido e o README/docs/INSTALADOR usarem essa URL

### 16. Sincronizar bootstrap público automaticamente · [`SEG-23`](https://linear.app/segredo/issue/SEG-23)
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

### 54. Avaliar OpenClaw.ai para servidor próprio de IA
- **Status:** Aberto
- **Descrição:** Registrar avaliação futura do OpenClaw.ai como possibilidade para instalar e operar um servidor próprio de IA dentro do ecossistema CentralDark. Esta pendência deve ser tratada somente depois de concluir a fase #132.1 — Agente Mestre de Memória — e retomar/fechar a fase #131.4 — Builder Bolt provider/modelo/key/config.
- **Onde mexer:** Somente documentação, pesquisa técnica, plano de arquitetura e prova controlada. Locais relacionados: docs/PENDENCIAS.md, docs/RELATORIOS, docs/CONSCIENCIA/APRENDIZADOS.md e CentralDark/agentes. Não mexer em produção na primeira etapa.
- **Como fechar:** Fechar quando houver relatório técnico sobre OpenClaw.ai com requisitos, forma de instalação, compatibilidade com VPS, Docker/Coolify/Caddy, riscos, rollback, consumo de recursos, segurança, custos e decisão humana aprovada. Não instalar nem migrar serviço de IA sem confirmação explícita.
- **Aberto em:** 2026-06-16 (via MCP)

### 52. Avaliar Coolify para deploys e gestão dos serviços de IA
- **Status:** Aberto
- **Descrição:** Estudar Coolify como melhoria de infraestrutura para o CentralDark: GitOps/deploy automático, gerenciamento visual de containers, variáveis de ambiente seguras, logs, monitoramento CPU/RAM, banco/Redis, proxy/SSL e suporte aos serviços de IA como Builder Bolt, OpenWebUI e futuros módulos. Esta pendência nasceu durante a pausa da fase #131.4, quando o Builder Bolt abriu publicamente, mas a geração falhou por provider/modelo/key/config.
- **Onde mexer:** Somente documentação, planejamento, diagnóstico read-only e prova controlada em ambiente seguro. Referências: README.md, CentralDark/agentes, docs/PENDENCIAS.md, docs/RELATORIOS e docs/CONSCIENCIA/APRENDIZADOS.md.
- **Como fechar:** Fechar quando houver relatório comparando fluxo atual vs Coolify, riscos, benefícios, checklist de rollback, plano de prova controlada e decisão humana aprovada. Não migrar produção, Caddy, Docker atual, secrets, banco, WuzAPI, WhatsApp, CRM ou Builder Bolt sem confirmação explícita.
- **Aberto em:** 2026-06-16 (via MCP)

### 51. Adicionar integração ElevenLabs TTS ao bot Telegram
- **Status:** Aberto
- **Descrição:** Criar fluxo Telegram -> bot da VPS -> ElevenLabs API -> áudio de volta no Telegram. Incluir comandos /voz, /vozpro, /vozexp, /vozcfg e /vozhelp; botão 'Gerar Áudio' no painel; serviço interno elevenlabs-tts com modos econômico, profissional e expressivo; padrão de texto TTS CentralDark para transformar respostas de IA em narração clara para leigos sem perder informações. Usar modelo econômico por padrão, sem tags expressivas salvo quando solicitado, e retornar resumo com modo, modelo, formato e quantidade de caracteres. Não gravar chave da API no código nem no chat; usar variável de ambiente/cofre local.
- **Onde mexer:** apps/bot-telegram/bot.cjs; apps/bot-telegram/services/elevenlabs-tts.cjs; apps/bot-telegram/panel.cjs; docs/PENDENCIAS.md
- **Como fechar:** Implementar o serviço ElevenLabs TTS, adicionar comandos e botão no Telegram, validar geração de áudio mp3 pelo bot, documentar variáveis ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL_FAST e ELEVENLABS_MODEL_PRO, testar modo econômico e modo profissional sem expor credenciais.
- **Aberto em:** 2026-06-14 (via MCP)

### 49. 13 tools sem credenciais (Sentry/Linear/Notion)
- **Status:** Aberto
- **Descrição:** sentry_status_credenciais retorna sentry:AUSENTE linear:AUSENTE notion:AUSENTE. Sao 13 tools (4 sentry + 5 linear + 4 notion) inuteis ate cofre receber SENTRY_DSN, LINEAR_API_KEY e NOTION_TOKEN. 13.4% do catalogo MCP esta decorativo.
- **Aberto em:** 2026-06-11 (via MCP)

### 39. Corrigir opção 11 do instalador para atualizar sistema/site · [`SEG-24`](https://linear.app/segredo/issue/SEG-24)
- **Status:** Aberto
- **Descrição:** A opção 11 criada no pacote anterior foi interpretada como atualização visual, mas a decisão correta é que a opção 11 do menu seja para atualizar o sistema/site CentralDark, alinhada ao comando único de deploy/redeploy. A opção de visual/tema deve ficar separada em outra opção futura, se necessário.
- **Onde mexer:** Menu do instalador, scripts/installer, scripts/deploy, docs/INSTALADOR e docs/PENDENCIAS.md
- **Como fechar:** Menu exibir opção 10 como Atualizar Instalador e opção 11 como Atualizar Sistema/Site CentralDark; opção 11 chamar rotina segura de atualização/redeploy com relatório, sem tocar em Caddy, Docker/WuzAPI, CRM, banco real ou WhatsApp sem confirmação; documentação atualizada e teste do menu concluído.
- **Aberto em:** 2026-06-07 (via MCP)

### 37. Modernizar instalador com UI Chalk sem quebrar lógica atual · [`SEG-25`](https://linear.app/segredo/issue/SEG-25)
- **Status:** Aberto
- **Descrição:** Criar uma camada visual elegante para o instalador usando Chalk/progresso moderno, com fallback sem cor, sem misturar com a lógica atual de instalação. Primeiro fazer wrapper/check/dry-run, depois integrar por fases.
- **Onde mexer:** docs/INSTALADOR, install.sh, scripts/installer/ui.cjs ou pasta equivalente de helpers do instalador
- **Como fechar:** Ter helper UI isolado, documentação atualizada, teste --check/--dry-run verde, nenhum serviço afetado, e relatório salvo em /root/[oculto] antes de integrar em fases reais.
- **Aberto em:** 2026-06-07 (via MCP)

### 29. Evoluir CentralDark para hub multi-IA (ChatGPT + Grok + Lovable + GitHub + outras) · [`SEG-26`](https://linear.app/segredo/issue/SEG-26)
- **Status:** Aberta (2026-06-06) — salvo como pendência futura oficial. Não bloqueia nenhuma fase atual.
- **Visão:** todas as IAs conectadas ao CentralDark/MCP, herdando memória, pendências, fases e checkpoint atual.
- **Guard-rails obrigatórios:** read-only por padrão · permissões por papel · fila de tarefas · locks pra evitar conflito · logs sanitizados · aprovação humana pra ações sensíveis (Docker, WuzAPI, WhatsApp, Caddy, CRM, banco real, rm -rf, secrets, domínio).
- **Pré-requisitos:** fases 05.x fechadas (menu instalador, cofre Supabase, contatos, chat ao vivo) + OAuth próprio CentralDark (#13) maduro.
- **Critério pra fechar:** pelo menos 2 IAs externas conectadas via MCP escrevendo no repo com co-autoria, sem nenhum vazamento de secret nos logs, e fila de tarefas funcional com lock.

### 30. Monitoramento preventivo de `/root/.grok/worktrees/` na VPS · [`SEG-27`](https://linear.app/segredo/issue/SEG-27)
- **Status:** Aberta (2026-06-06) — nasceu do incidente do disco 100% cheio: agente Grok externo entrou em loop e criou recursão infinita de worktrees, cada uma com cópia do binário de 132MB, totalizando ~56GB. Limpeza manual feita com `rm -rf /root/.grok/worktrees/`.
- **O que falta:** alerta automático no checker end-to-end (#9) — adicionar bloco que mede `du -sh /root/.grok/worktrees/ 2>/dev/null` e emite ALERTA se >1GB, ERRO se >5GB. Idealmente também olhar `/root/.claude/worktrees/` e qualquer `*/worktrees/` recursivo em `/root/.*`.
- **Onde mexer:** `scripts/checker/` (novo módulo tipo `12-disco-agentes-externos.sh`) + integrar no `run-all.sh`.
- **Critério pra fechar:** checker rodando, detectando crescimento anômalo, e instrução clara no relatório sobre como limpar com segurança.

### 34. Mapear "comando único de deploy" por pasta + comando global do site inteiro · [`SEG-28`](https://linear.app/segredo/issue/SEG-28)
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

### 28. Testar instalação real via curl do cérebro em IA nova · [`SEG-29`](https://linear.app/segredo/issue/SEG-29)
- **Status:** Aberto (2026-06-05) — após o deploy chegar na VPS (`MCP-CentralDark` e `Install-Callback` reiniciados), validar:
  1. `curl https://mcp.centralldark.com/skills` retorna JSON com `centraldark-consciencia`
  2. `curl https://mcp.centralldark.com/skills/centraldark-consciencia/SKILL.md` retorna o markdown completo
  3. Rodar `curl -sL https://mcp.centralldark.com/skills/centraldark-consciencia/install.sh | bash` num Claude Code novo e confirmar que o arquivo aparece em `~/.claude/skills/centraldark-consciencia/SKILL.md`
  4. Idem pelo espelho `install.centralldark.com`

### 21. Rota `/raw/install.sh` no backend `install.centralldark.com` — 🟢 CÓDIGO PRONTO, falta deploy · [`SEG-30`](https://linear.app/segredo/issue/SEG-30)
- **Status:** Código já existe em `CentralDark/apps/install-callback/server.js` (linhas 524-528: serve `INSTALL_SH` direto do filesystem). Só não funciona porque o serviço PM2 `install-callback` na VPS ainda está na versão antiga.
- **Como fechar:** após o próximo `git pull` + `pm2 restart install-callback` na VPS, validar `curl -fI https://install.centralldark.com/raw/install.sh` retornando 200. Daí o auto-update do `install.sh` volta a funcionar.
- **Sintoma original:** terminal mostrava `curl: (22) The requested URL returned error: 404` duas vezes logo após "baixando instalador..." em todo `curl ... | bash -s -- --check`. O erro foi suprimido no `install.sh` enquanto o deploy não chega.





### 20. Auditoria de `set -e` em funções do `install.sh` · [`SEG-31`](https://linear.app/segredo/issue/SEG-31)
- **Status:** Aberto (2026-06-05) — bug pontual corrigido, mas padrão merece varredura.
- **Contexto:** `_aio_detect_width` terminava com `[ cond ] && cmd` como última instrução. Quando a condição era falsa, a função retornava 1 e o `set -euo pipefail` matava o instalador em silêncio (`curl ... | bash -s -- --check` só imprimia "baixando instalador..." e voltava ao prompt). Corrigido adicionando `return 0`.
- **Achado extra corrigido em 2026-06-05:** no fluxo `--check`, depois de validar o ambiente o script chamava `info "Ambiente OK — abrindo painel CentralDark..."`, mas a função `info` não existia. Resultado: o shell abortava antes de abrir o menu e parecia que ele “fechava direto”. Corrigido trocando para `log`, mantendo a abertura automática do painel.
- **Como fechar:** revisar TODAS as funções do `install.sh` (e dos scripts em `CentralDark/scripts/installer/`) que terminam em `cond && cmd` ou `cmd || cmd`. Adicionar `return 0` / `|| true` / converter pra `if/then/fi`. Idealmente, criar um teste smoke (`./install.sh --self-test`) que rode as funções de init e sai 0, pra travar regressão em CI.



### 19. Unificar os 3 temas de menu (AIO + default + netflix) com as MESMAS opções · [`SEG-32`](https://linear.app/segredo/issue/SEG-32)
- **Status:** Aberto (2026-06-05)
- **Problema:** Existem múltiplos menus na VPS — o painel do `install.sh` (CENTRALDARK PANEL MENU, tema "AIO" vermelho) tem 10 opções completas (Verificar Ambiente, Instalar Base, Estrutura, Cloudflare/DNS, MCP, Checker, Conectar QR, Wildcard, Deps, Auto-update). Já o `scripts/menu/cdmenu.sh` tem 2 temas (`default` e `netflix`) com OUTRO conjunto de opções (status PM2, restart serviços, logs, git pull, limpar cache, etc) e SEM Cloudflare/Instalar/MCP. Confunde o teste do fluxo do zero.
- **Decisão:** Manter UM menu único com 3 temas selecionáveis (AIO atual + default + netflix), TODOS expondo as mesmas 10 opções do painel AIO + as ações de manutenção do cdmenu (restart, logs, git pull). Tema escolhe só a aparência.
- **Como fechar:**
  1. Extrair as 10 funções principais do `install.sh` (verify_environment, install_base, prepare_structure, configure_cloudflare, configure_mcp, run_check_final, run_install_connect, run_wildcard_wizard, ensure_deps, update_repo) + manutenção do cdmenu (restart, logs, status) num módulo único `scripts/menu/actions.sh`
  2. Reescrever `cdmenu.sh` pra reusar esse módulo e mostrar TODAS as opções, mudando só o visual via tema
  3. Adicionar 3º tema (a definir — sugestão: "minimal" limpo sem ASCII)
  4. Apontar `./install.sh --menu` e `cdmenu` pro mesmo entrypoint
- **Fora de escopo agora:** estamos travados na validação do Cloudflare (item #18). Fechar #18 primeiro, depois atacar esse.



### 3. Atualizar fuso horário (BR) nas pastas restantes · [`SEG-33`](https://linear.app/segredo/issue/SEG-33)
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

### 4. Sincronizar `apps/bot-telegram` (repo ↔ VPS) no deploy · [`SEG-34`](https://linear.app/segredo/issue/SEG-34)
- **Status:** Aberto
- **Contexto:** a pasta foi importada da VPS pro repo, mas mudanças no repo ainda não voltam automaticamente pra `/root/Multizap/apps/bot-telegram` no deploy
- **Como fechar:** adicionar etapa no `post-deploy.sh` (rsync + `pm2 restart MultiZap-TelegramBot`) — só fazer depois da Pendência 2 estar resolvida

### 6. Instalador completo com wizard interativo + restauração de backup · [`SEG-35`](https://linear.app/segredo/issue/SEG-35)
- **Status:** Aberto (base já criada em `install.sh` + `docs/INSTALADOR/`)
- **O que falta pra ficar "completo de verdade":**
  - Wizard passo-a-passo perguntando cada token/senha (Supabase, WuzAPI, Telegram bot, GitHub deploy key, domínio, e-mail Caddy, Cloudflare, etc.)
  - Pra cada pergunta, mostrar **onde conseguir** o valor (link/descrição curta)
  - Modo `--restore` funcional: apontar pra um backup (local, S3, ou outra VPS) e restaurar banco + secrets + WuzAPI + sessões WhatsApp
  - Instalar TUDO de uma vez: site + módulo `multizap` + bot WhatsApp + bot Telegram + gateway + WuzAPI (Docker) + Caddy + cron + webhook
  - Healthcheck final de cada serviço + relatório
- **NÃO criar sistema separado de "update via repositório":** já temos (GitHub → VPS via webhook + cron `gh-pull`). O instalador é só pra VPS nova ou restauração.

### 7. Reorganizar projeto como módulo da CentralDark · [`SEG-36`](https://linear.app/segredo/issue/SEG-36)
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




### 9. Memória eterna do agente ChatGPT — ✅ CONCLUÍDO em 2026-06-04 · [`SEG-20`](https://linear.app/segredo/issue/SEG-20)
- **Status:** Estrutura no ar. Falta o usuário criar o Custom GPT no ChatGPT (5 cliques, passo-a-passo em `docs/CONSCIENCIA/CUSTOM-GPT-SETUP.md`).
- **O que foi feito:**
  - Pasta `docs/CONSCIENCIA/` com 10 arquivos numerados + README + PLANO + setup do Custom GPT
  - Pasta `/root/CentralDark/memoria-consciencia/` na VPS com 3 arquivos privados (secrets-context, endpoints-internos, incidentes)
  - Workflow `.github/workflows/atualiza-memoria-consciencia.yml` roda a cada 6h pra atualizar `09-ESTADO-ATUAL.md`
- **Pendente do usuário:** criar o Custom GPT seguindo `docs/CONSCIENCIA/CUSTOM-GPT-SETUP.md`.

---

## 🟢 Baixa prioridade

### 50. VPS com 12 arquivos modificados sem commit
- **Status:** Aberto
- **Descrição:** vps_git_status mostra mudancas em apps/bot/* (pages, hooks, components deletados/modificados) sem PR. Risco de perder trabalho local se vps_git_pull rodar.
- **Aberto em:** 2026-06-11 (via MCP)

### 43. Refinar Mega Painel com setores e layout premium · [`SEG-37`](https://linear.app/segredo/issue/SEG-37)
- **Status:** Aberto
- **Descrição:** Melhorar depois o status.centralldark.com com layout mais refinado, responsivo e dividido por setores como Resumo, IA, Produção, Pendências, Fases, Logs e Mapa Vivo. Esta melhoria deve ficar pausada por enquanto porque o painel já cumpriu o papel inicial de facilitar acompanhamento e o foco volta para as tarefas principais do projeto.
- **Onde mexer:** CentralDark/apps/projeto-dashboard/
- **Como fechar:** Criar uma versão premium do painel com navegação por setores, visual refinado, responsividade completa e atualização viva sem expor dados sensíveis.
- **Aberto em:** 2026-06-08 (via MCP)

### 5. Container `multizap-gateway-postgreswuzapi-1` loga em UTC · [`SEG-38`](https://linear.app/segredo/issue/SEG-38)
- **Status:** Aberto (cosmético)
- **Sintoma:** logs internos do Postgres do WuzAPI saem em UTC. Não afeta operação — é o log do banco, não da aplicação.
- **Como fechar:** adicionar `TZ=America/Sao_Paulo` no `docker-compose.yml` do WuzAPI (serviço `postgreswuzapi`) e recriar o container — **requer confirmação do usuário** (mexe em Docker do WhatsApp).

### 6. PM2 `whatsapp-server` desligado por falta de dependência · [`SEG-35`](https://linear.app/segredo/issue/SEG-35)
- **Status:** Parado de propósito (2026-06-04) — `pm2 stop whatsapp-server` + `pm2 save` feitos
- **Sintoma:** crashava em loop com `ERR_MODULE_NOT_FOUND: pino-roll` ao iniciar `/root/whatsapp-server/whatsapp-server/server.js`
- **Como religar:** `cd /root/whatsapp-server/whatsapp-server && npm install pino-roll` (ou `npm install` se o `package.json` já tiver) e `pm2 restart whatsapp-server`
- **Antes de religar:** confirmar se esse serviço ainda é usado — o fluxo atual de WhatsApp passa por WuzAPI (`multizap-gateway-wuzapi-1`) → `proxy.multizap.dev`, então pode ser legado e candidato a remover do PM2 de vez.

### 13. OAuth próprio CentralDark (substituir GitHub OAuth no MCP) · [`SEG-40`](https://linear.app/segredo/issue/SEG-40)
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

### 41. Criar esqueleto seguro `apps/bot-server` — 🟡 média · [`SEG-9`](https://linear.app/segredo/issue/SEG-9)
- **Sintoma:** o frontend do BOT já existe em `apps/bot`, mas ainda falta uma central backend organizada para gateways, workers, webhooks e shared.
- **Onde mexer:** criar somente esqueleto em `apps/bot-server`, seguindo `docs/ARQUITETURA/BOT-SERVER-CENTRAL.md`.
- **Critério pra fechar:** estrutura inicial criada sem ligar PM2, sem mover produção, sem mexer em Docker/WuzAPI, CRM, Caddy, banco real ou sessões WhatsApp; gerar relatório e validar árvore.
- **Regra:** `apps/bot` continua frontend; `apps/bot-server` será central dos bots.

### 42. Auditar e limpar diretórios antigos em `apps/` — 🟡 média
- **Sintoma:** existem diretórios antigos/legados em `apps/` que podem confundir a organização após a criação de `apps/bot-server`.
- **Regra de destino:** `apps/bot` fica para o frontend do bot; `apps/crm` fica para o sistema CRM; `apps/bot-server` concentra backend/gateways/workers/webhooks/shared de bots, inclusive bots usados pelo CRM.
- **Onde mexer:** auditar `apps/clone-deck`, `apps/bot-telegram` e demais diretórios legados antes de qualquer remoção.
- **Critério pra fechar:** relatório mostrando o que está em uso, o que é legado, o que pode ser arquivado e o que pode ser apagado; apagar/mover somente com confirmação explícita.
- **Bloqueio:** não apagar diretório antigo sem provar que não está em produção, PM2, Caddy, Docker/WuzAPI, workflow ou referência ativa.


<!-- BEGIN ESTADO_POS_CONECTOR_20260608 -->

# Estado consolidado pós-queda do conector

## MCP / Modo Obra / conector

Status atual:

- MCP online.
- Modo Obra ativo.
- Secrets reais continuam bloqueados.
- OAuth MCP validado no processo real.
- Loader seguro criado para carregar env real.
- Build MCP passou.
- PM2 reiniciado com MCP online.
- Health público validado.
- Callback falso não retornou erro de secret ausente.
- Mega Painel atualizado sem expor segredo.
- PM2 jlist na VPS mostrou todos os serviços online.

Pendente de confirmação quando o conector estiver estável:

- validar `vps_pm2_ls` pelo próprio conector;
- registrar oficialmente, se ainda faltar, os aprendizados no fluxo MCP;
- conferir se o catálogo público continua batendo com runtime.

## Codex integrado ao fluxo

Próximo bloco depois do MCP:

- completar `AGENTS.md`;
- completar `CODEX.md`;
- template de PR;
- workflow `codex-validate`;
- autoajuste consciente no Codex;
- Codex atualizando/lembrando do Mega Painel;
- Codex nunca agir no escuro em caso de risco, dúvida ou inconsistência.

## Bot / WhatsApp

Depois do Codex:

- QR;
- chat ao vivo;
- contatos;
- fotos;
- grupos.

## CRM

CRM permanece depois, sem atropelar produção.

<!-- END ESTADO_POS_CONECTOR_20260608 -->
### 44. Integrar Linear Notion e Sentry ao conector CentralDark — 🔴 ABERTO (09/06/2026, 20:55 BRT) · [`SEG-6`](https://linear.app/segredo/issue/SEG-6)
- **Sintoma:** Conectores foram ativados e precisam entrar no fluxo vivo do projeto sem expor tokens nem criar ações sensíveis automáticas.
- **Onde mexer:** MCP CentralDark, mcp-proxy, Mega Painel, docs/CONSCIENCIA, docs/PENDENCIAS, docs/BOTS
- **Critério pra fechar:** Linear espelha pendências com prioridade/status; Notion espelha documentação viva; Sentry mostra erros dos serviços; Mega Painel exibe contadores e cards; frontend usa apenas tools read-only; tokens ficam só no servidor.
### 45. Consolidar fonte de verdade do frontend apps/bot — 🟡 EM ANDAMENTO (10/06/2026, 14:30 BRT)
- **Sintoma:** O preview novo do frontend ficou em árvore diferente da árvore servida pelo domínio público, causando build no lugar errado e site antigo no ar.
- **Decisão tomada (10/06 14:00):** Pasta oficial = `CentralDark/apps/bot/`. Regra registrada em `docs/CONSCIENCIA/12-PASTA-OFICIAL-BOT.md`.
- **Já feito no repo:**
  - ✅ Conteúdo de `apps/bot/` (atualizado, 206 arquivos com chat ao vivo, LiveBotStatus, LiveMessagesPreview, useLiveMessages, apiBase, mockWhatsapp) copiado para `CentralDark/apps/bot/`.
  - ✅ Criado `apps/bot/DEPRECATED.md` marcando pasta antiga como obsoleta.
  - ✅ Criado `docs/CONSCIENCIA/12-PASTA-OFICIAL-BOT.md` com regra inquebrável.
  - ✅ Relatório completo em `docs/RELATORIOS/2026-06-10-bot-duplicado-vps.md`.
- **Falta (precisa de confirmação do usuário pra rodar na VPS):**
  - ⏳ `cd /root && git pull` + `git checkout -- CentralDark/apps/bot/` (zera o git status sujo).
  - ⏳ `cd /root/CentralDark/apps/bot && npm ci && npm run build`.
  - ⏳ Validar `https://bot.multizap.dev` com curl + marcador da versão nova.
  - ⏳ Mover `/root/CentralDark/apps/bot.aposentada-20260610-030613` → `/root/CentralDark/quarantine/`.
  - ⏳ Após 7 dias estáveis: mover `/root/apps/bot` → quarantine e remover `apps/bot/` do repo.
  - ⏳ Investigar e desativar script que renomeou a pasta às 03:03 (origem não identificada).
- **Critério pra fechar:** `https://bot.multizap.dev` servindo `CentralDark/apps/bot/dist` com chat ao vivo + cadeia completa validada (7 passos) + checker preventivo no sentinela.
### 46. MultiZap/Bot: validar QR, chat ao vivo, contatos, fotos e grupos — 🟡 ABERTO (11/06/2026, 03:22 BRT)
- **Sintoma:** Assim que o chat ao vivo começar a exibir conversas, fotos/avatares, contatos e grupos, executar o lote de validação/correção de QR, chat ao vivo, contatos, fotos e grupos.
- **Onde mexer:** MultiZap/Bot, frontend oficial `CentralDark/apps/bot/` e integrações read-only do bot-server, sem mexer em Lote 2.
- **Critério pra fechar:** QR, conversas, fotos/avatares, contatos e grupos aparecem corretamente no fluxo do chat ao vivo, com validação documentada e sem tocar em secrets, WuzAPI/WhatsApp runtime, produção sensível, CRM, banco real, PM2, Docker ou Caddy sem aprovação explícita.
