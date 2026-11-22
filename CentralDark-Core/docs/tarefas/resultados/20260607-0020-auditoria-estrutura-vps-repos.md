---
id: 20260607-0020-auditoria-estrutura-vps-repos
executor: grok
status: recebido
finalizado_em: 2026-06-07 00:31:20
---

# Resultado

```txt
============================================================
[GROK] AUDITORIA DE ESTRUTURA FINALIZADA
============================================================
Status: Concluído
Resumo executivo: /root é checkout do repositório oficial ServerVpss/CentralDark (main). Migração parcial em andamento: MCP já vive e roda em /root/CentralDark/apps/mcp/ (PM2 MCP-CentralDark online) com estrutura-esqueleto + .example/ pronta; código bulk do produto (bot, crm, portal, web, gateway) ainda está em estrutura legada plana em root/apps/ (no repo) + /root/Multizap/apps/bot + Multizap/apps/clone-deck (clone antigo completo com .git). Multizap/ (2.7G) contém toda a produção ativa (wuzapi, gateway/server.js, bots, crm, central-notificacoes, consciencia, backups, quarantine, 99k+ arquivos em revisoes/ ~1G). clone-deck persiste como alias em nomes de scripts, workflows antigos, bootstrap.sh (hardcoded paths antigos), webhooks dirs, docs legados e scripts dentro do bot em produção. CentralDark/ no repo e em /root/CentralDark é a "fonte da verdade" pretendida (README/PLANO confirmam). GitHub público inacessível (repo privado). Task system (docs/tarefas + monitor_tarefas.py) ativo em nível raiz do repo/checkout. Nenhuma ação de escrita/movimento/execução sensível realizada.
Estado atual encontrado:
- Git: origin https://github.com/ServerVpss/CentralDark.git (branch main); tracked top dirs incluem .agents/, .github/, CentralDark/ (130 itens), apps/ (1043 itens), docs/ (tarefas/ + monitor), scripts/, infra/, conexao-ia/, central-horario/, security/, tools/ etc. Multizap/ não está no git tree (local/ignorado).
- /root/CentralDark/: apps/mcp/ (build + node_modules + logs + .env), apps/modulos/{multizap,telepainel,financeiro}/ (só PLANO/README placeholders), apps/{install-callback,portal,web}/, infra/, scripts/{deploy,installer,monitor,run-once}/ organizados, logs/, secrets/ (real), revisoes/ pequena, security/, .example/.
- /root/Multizap/: estrutura operacional completa legada (api/gateway, gateway/server.js + data, wuzapi/, apps/{bot (com scripts hardcoded clone-deck), bot-telegram, crm, portal, web, clone-deck (clone git antigo completo), central-notificacoes/, consciencia/, guarda/, backups/, quarantine/, logs/, secrets/, deploy-hooks/, revisoes/ gigante).
- Outros em /root: apps/ (flat, código atual), docs/ (tarefas/abertas|em_andamento|concluidas|resultados + monitor_tarefas.py + muitos .md de estado), clone-deck-webhook/ + multizap-webhook/ (node_modules + .env), infra/clone-deck-webhook-deploy/, scripts/ misturados (alguns nomes clone-deck-*.sh + vps-clean-clone-deck-*.sh), conexao-ia/ (memória de transição), .github/workflows/ (mix de antigos com "clone-deck"/"segredounlock" e novos para CentralDark/MCP/monitor).
- clone-deck ainda aparece em: bootstrap.sh (REPO_URL e REPO_DIR antigos), scripts com nome/path clone-deck, .github/workflows com nomes legados, post-deploy/install scripts, ecosystem.config.js logs, docs/START_HERE.md + STATE.md + SYNC_REPOS.md + conexao-ia/* (maioria em Multizap/apps/bot/scripts/ são cópias do legado), CentralDark/apps/modulos/multizap/README (documenta o alias e destino futuro).
- REGRAS_DA_EQUIPE.md (correto): ServerVpss/CentralDark oficial; clone-deck só alias/histórico/espelho.
- .github/sync-excludes.txt já protege CentralDark/secrets/ etc.
- Produção preservada: MCP novo online; gateway/wuzapi em Multizap/; task system ativo.
O que preservar:
- /root/Multizap/ inteiro (produção: wuzapi, gateway, apps/bot+CRM+portal, WhatsApp sessions, docker, PM2 atual, Caddy, dados reais, backups, quarantine).
- /root/CentralDark/ runtime (MCP-CentralDark + secrets + logs + mcp build atual).
- docs/tarefas/ + monitor_tarefas.py + workflows de tarefas/monitor (sistema ChatGPT→Grok).
- Todas revisoes/ (histórico; ~1G Multizap + pequena CentralDark).
- .agents/, skills/, conexao-ia/ (memória operacional).
- Git history + .github/workflows atuais (deploy, supabase, mcp, monitor-tarefas).
- Estrutura .example/ + CentralDark/ scaffolding já versionado.
O que está bagunçado:
- Duplicação massiva de árvore (root/apps/ + CentralDark/apps/ (só esqueleto) + Multizap/apps/{bot,crm,clone-deck completo}).
- Nomes técnicos "clone-deck" em scripts ativos/legados, nomes de arquivos de workflow, bootstrap.sh, webhooks dirs, logs em ecosystem, docs de estado.
- Migração de código do produto incompleta (multizap só tem planos em CentralDark/apps/modulos/multizap/; código real ainda em apps/ flat e Multizap/apps/clone-deck + apps/bot).
- bootstrap.sh e vários *-deploy*.sh ainda apontam para segredounlock/clone-deck e /root/Multizap/apps/clone-deck.
- Docs misturados (START_HERE/STATE/SYNC_REPOS/ORGANIZACAO_VPS antigos vs REGRAS/PLANO/CentralDark/README novos).
- Dirs de transição soltos (clone-deck-webhook/, multizap-webhook/, central-horario/, conexao-ia/).
- Scripts/ raiz misturado (novos organizados em CentralDark/scripts/ vs legados com nomes antigos).
Riscos:
- Qualquer rename/move em /root/Multizap/* ou root/apps/* quebra PM2, gateway, bots, webhooks registrados, deploys automáticos, volumes docker/wuzapi, sessões WhatsApp.
- Hardcodes em scripts do bot em produção (Multizap/apps/bot/scripts/*) e top-level deploy scripts referenciam paths antigos; mudança sem cutover coordenado causa falha de auto-deploy/pull.
- Workflows sync antigos e webhooks clone-deck podem estar ativos para compatibilidade.
- Checkout raiz = /root (repo inteiro); alterações em root afetam tudo.
- Repo privado (web/api 404 do tool); todo estado via clone local.
- Secrets e revisoes grandes — exposição ou perda catastrófica (evitado aqui por só-leitura + resumos).
- Task system e MCP já no "novo" — não mexer sem validar.
Árvore ideal recomendada:
VPS (oficial /root/CentralDark conforme CentralDark/README + PLANO):
/root/CentralDark/
├── apps/
│   ├── mcp/                 # já rodando
│   ├── portal/
│   ├── web/
│   └── modulos/
│       ├── multizap/        # destino final do produto (mover/adaptar bot+gateway+crm+consciencia etc.)
│       ├── telepainel/
│       └── financeiro/
├── infra/{caddy,pm2,docker,cloudflare}/
├── scripts/{installer,deploy,monitor,run-once}/
├── docs/ (leve, produto)
├── security/
├── secrets/ (VPS-only)
├── logs/
├── backups/
├── revisoes/
└── quarantine/
+ em /root (checkout raiz, cross-cutting): docs/tarefas/ + monitor_tarefas.py, .github/, .agents/ + skills/, conexao-ia/ (transição), CentralDark/ (fonte), scripts/ globais/legado-compat (deprecar aos poucos).
Repo ServerVpss/CentralDark: mesma ideia — raiz do repo contém ops (docs/tarefas, .github, .agents, conexao-ia, scripts globais) + CentralDark/ subdir como "fonte da verdade" espelhando /root/CentralDark na VPS. Mover gradualmente conteúdo de root/apps/* para CentralDark/apps/modulos/multizap/ (com adaptação de paths). Manter Multizap/ local apenas como snapshot legado até cutover validado + archive (nunca delete).
Migrar ou começar limpo: Migrar o que existe (recomendado forte). Não começar do zero: perderia histórico git, 99k+ revisoes, produção rodando (wuzapi/gateway/bots/CRM/sessões), MCP já migrado e online, task system, Supabase migrations, Caddy/Docker existente, e o scaffolding CentralDark/ já iniciado. Começar limpo só faz sentido em VPS nova ou greenfield total.
Plano em 5 passos seguros:
1. Padronização não-ativa de nomes/referências (somente docs, comentários, nomes de arquivos inativos, cabeçalhos de bootstrap.sh): trocar "clone-deck"/"segredounlock/clone-deck" por CentralDark/ServerVpss/CentralDark onde não afeta paths runtime ou scripts linkados em PM2/deploy/webhook. Commit seletivo (ex: git add docs/... CentralDark/... scripts/ não-executados no momento). Sem restart, sem alterar comportamento atual.
2. Consolidar CentralDark/ no repo como fonte da verdade: completar PLANO/README em todas subpastas de CentralDark/, garantir .example/ e templates de infra/scripts atualizados, atualizar docs de alto nível (ORGANIZACAO_VPS.md, SYNC_REPOS.md ou marcar legacy, adicionar migration-status.md). Push. (Pull na VPS só afeta CentralDark/ e docs não-ativos.)
3. Preparar módulo multizap na nova árvore (branch isolado ou draft, sem tocar prod): copiar/adaptar lógica de root/apps/{bot,crm,modulos,portal,web} + gateway relevante para CentralDark/apps/modulos/multizap/ (atualizar paths internos para relativos ou /root/CentralDark/... targets, manter compat com paths antigos por enquanto). Build/test isolado (quarantine ou dir temporário). Só arquivos da nova árvore + docs. (Multizap/apps e root/apps intactos.)
4. Validar/estender o que já está no novo (MCP + scripts novos): confirmar MCP-CentralDark ponta-a-ponta (task flow, OAuth, Caddy snippet, secrets em /root/CentralDark/secrets/, logs), ativar watchdog de CentralDark/scripts/monitor/, rodar inventários via run-once novos (somente leitura), atualizar workflows que tocam só CentralDark/ ou docs. Manter deploys antigos rodando em paralelo.
5. Cutover controlado (só após aprovação ChatGPT + validação dual): introduzir deploys paralelos/side-by-side ou switches de config para nova árvore (um serviço por vez: e.g. novo listener webhook, PM2 para módulo multizap validado, portal apontando novo). Atualizar post-deploy/pull scripts e symlinks só depois de healthcheck verde. Arquivar (não apagar) Multizap/apps/clone-deck e paths legados. Atualizar bootstrap/install para novo só no final. Manter Multizap/ inteiro como snapshot por tempo indeterminado. Nunca git add .; commits sempre seletivos (ex: git add docs/tarefas CentralDark/...).
Aguardando decisão final do ChatGPT.
============================================================
```


## Tarefa lida

```md
---
id: 20260607-0020-auditoria-estrutura-vps-repos
status: aberta
origem: chatgpt
destino: grok
risco: baixo
---

# Tarefa

Grok, faça uma auditoria SOMENTE LEITURA da estrutura atual do projeto CentralDark/MultiZap.

## Contexto oficial

- ChatGPT é supervisor e tomador de decisão final.
- Grok é executor/analisador, sem decisão final sozinho.
- Repositório oficial: `ServerVpss/CentralDark`.
- `clone-deck` pode aparecer como alias/espelho operacional por compatibilidade, mas a decisão final deve considerar `ServerVpss/CentralDark` como fonte oficial atual.
- A VPS possui histórico em `/root/Multizap`, `/root/CentralDark` e repo operacional em `/root`/estrutura atual. Não mover nada agora.

## Objetivo

Entregar uma análise clara para o ChatGPT decidir a árvore ideal e o plano de organização.

## O que analisar

1. Estrutura de pastas atual na VPS, com foco em:
   - `/root`
   - `/root/CentralDark`
   - `/root/Multizap`
   - pastas de apps, bots, gateway, MCP, docs, scripts, revisoes, logs e backups.

2. Estrutura do repo oficial `ServerVpss/CentralDark`, com foco em:
   - apps
   - CentralDark
   - docs
   - scripts
   - infra
   - docs/tarefas
   - docs/CONSCIENCIA

3. Relação com espelho/alias `clone-deck`:
   - onde ainda aparece `clone-deck` como nome técnico;
   - o que precisa ser atualizado depois;
   - o que não deve ser mexido agora.

4. Identificar:
   - o que está funcionando e deve ser preservado;
   - o que está bagunçado;
   - o que é legado;
   - o que parece duplicado;
   - riscos de migrar.

5. Propor uma árvore ideal para a VPS e para o repo.

## Regras obrigatórias

- Somente leitura.
- Não executar limpeza.
- Não apagar, mover ou renomear arquivos.
- Não reiniciar serviços.
- Não mexer em Docker, WuzAPI, WhatsApp, Caddy, CRM, Gateway, banco real, domínio ou secrets.
- Não expor caminhos sensíveis com valores privados, tokens, senhas, cookies, sessões ou connection strings.
- Não usar `git add .`.
- Logs grandes devem ser resumidos.

## Perguntas que você deve responder

1. A recomendação é migrar o que existe para uma estrutura nova ou começar do zero?
2. Qual árvore ideal você sugere para `/root/CentralDark` ou caminho oficial da VPS?
3. Qual árvore ideal você sugere para o repositório `ServerVpss/CentralDark`?
4. Como manter `ServerVpss/CentralDark` e espelhos/aliases sincronizados sem confusão?
5. Quais são os 5 primeiros passos seguros para organizar, sem quebrar produção?

## Formato obrigatório da resposta

Use este formato:

```txt
============================================================
[GROK] AUDITORIA DE ESTRUTURA FINALIZADA
============================================================
Status: Concluído / Com erro / Precisa de revisão
Resumo executivo: ...
Estado atual encontrado: ...
O que preservar: ...
O que está bagunçado: ...
Riscos: ...
Árvore ideal recomendada: ...
Migrar ou começar limpo: ...
Plano em 5 passos seguros: ...
Aguardando decisão final do ChatGPT.
============================================================
```

```
