---
name: reconciliacao-diaria-centraldark
description: Reconcile CentralDark state and update daily checklist.
version: 1.0.0
author: SOL (via Claude, sessão 2026-09-23)
license: internal
platforms: [windows]
metadata:
  hermes:
    tags: [centraldark, reconciliacao, checklist, delta, cron-candidate]
    category: devops
    requires_toolsets: [terminal, centraldark-mcp]
related_skills: [centraldark-ops, centraldark-hermes-operations, skill-synchronization]
environments:
  - centraldark
---

# Reconciliação Diária CentralDark

Mede o estado REAL do sistema (GitHub, VPS, PRs, pendências, vault) e atualiza o
CHECK-LIST DIARIO canônico com o que mudou. Qualquer motor/modelo rodando sob o
contrato SOL executa esta skill do mesmo jeito — não é exclusiva do Claude.

## Skill operacional pareada

Esta skill faz parte da família `centraldark-ops`. Quando a reconciliação tocar Hermes update/cron/SSH/porta, carregar também `centraldark-hermes-operations`; quando tocar skill drift/canônico de skills, carregar também `skill-synchronization`. Não criar skill paralela para o mesmo fluxo.

## Quando usar

- Chefe pediu update do checklist / "acha os delta" / "ficou abandonado".
- Pelo menos 1x por dia (regra já gravada no próprio checklist:
  `UPDATE_AT_LEAST_ONCE_PER_DAY=true`).
- Depois de qualquer sessão longa de trabalho técnico no CentralDark.

## Owners tocados

- Owner Git canônico do checklist: `docs/BRAIN/02-ENTRADA/CHECK-LIST-DIARIO.md`
  (repo `ServerVpss/CentralDark`).
- Espelho Obsidian (CASA-VAULT, read/write local):
  `E:\CentralDark\Pivete\CASA-VAULT\🧾CHECK-LIST DIARIO🤖.md`.
- Regra do próprio arquivo: `CASA-VAULT != SECOND_OWNER` — o Git manda; o vault é
  espelho operacional. Se os dois divergirem, registrar a divergência, não
  silenciar.

## Como rodar

1. **Medir estado real** (nunca deduzir):
   - `deploy_status` (MCP CentralDark) — GitHub HEAD vs VPS HEAD vs PM2.
   - `vps_git_status` (MCP CentralDark) — working tree da VPS: modificado /
     não rastreado / dirty.
   - `github_list_pull_requests(state=open)` — PRs abertos, comparar com os
     últimos números já registrados no checklist; qualquer PR novo é delta.
   - `pendencias_list(onlyOpen=true)` — `docs/PENDENCIAS.md`; checar se tem
     item novo desde a última leitura.
   - Se algum resultado estourar limite de tokens, delegar leitura pra
     subagente/worker separado — nunca pular a medição por ser grande.

2. **Classificar cada achado** com o filtro ΔU do próprio checklist:
   - `ΔU > 0 material` → entra no checklist.
   - `ΔU ≈ 0` → NO_CHANGE, não registra.
   - `UNKNOWN` (ex: PM2 não respondeu, JSON corrompido) → registra como
     UNKNOWN, nunca como PASS.

3. **Escrever a entrada nova NO GIT PRIMEIRO, SEMPRE — nunca só no vault.**
   `LOCAL_EDIT != COMMIT`. Incidente real de 2026-09-23: uma sessão inteira
   de reconciliação foi feita só no vault Obsidian local (CASA-VAULT) e no
   AppData do Hermes, sem nenhum commit/push — `main` ficou sem histórico
   do dia até o Chefe perguntar direto "já fez o commit ou tá conversando
   bobeira?". Passo obrigatório, nesta ordem:
   a. `github_get_file` no `docs/BRAIN/02-ENTRADA/CHECK-LIST-DIARIO.md` (ou
      owner Git equivalente) pra pegar o conteúdo REAL atual — nunca supor
      que o vault local e o Git têm o mesmo conteúdo; eles podem já estar
      divergentes (aconteceu: vault tinha 620+ linhas, Git tinha 60).
   b. `github_create_branch` a partir de `main`, nome no padrão
      `cristal/<assunto>-<data>`.
   c. `github_create_or_update_file` no branch novo, com o resumo do delta
      (não precisa duplicar um log verboso inteiro do vault — resumir é
      aceitável, sumir não é).
   d. `github_create_pull_request` ligado ao PR-mãe #1562 (citar no título
      e no corpo).
   e. Só DEPOIS disso, atualizar o espelho no vault Obsidian local — o
      vault é espelho, nunca o primeiro a receber o registro.
   f. Se algo impedir o commit/push (sem token, sem rede, MCP fora do ar),
      REGISTRAR ISSO EXPLICITAMENTE pro Chefe — nunca deixar implícito que
      "editei local" já resolveu o histórico.

4. **Bumpar `updated:` do frontmatter** pra data/hora real da medição — nunca
   deixar o frontmatter mentir sobre quando foi a última atualização real.

5. **Checar wikilinks do `related:`** — se algum `[[Nome]]` não resolve pra
   nenhum arquivo do vault, é link morto. Não inventar conteúdo; criar um
   stub explícito (`status: seedling`, frontmatter dizendo que é stub) ou
   avisar o Chefe, nunca deixar quebrado em silêncio.

## Toda pendência nova → HUD + Pendências.md (regra travada, sem pedir autorização de novo)

Regra gravada em 2026-09-23 a pedido explícito do Chefe: "tudo que for fazer
agora passa por ali... tem que ser autônomo." Qualquer pendência criada por
qualquer motor/skill/sessão rodando sob o contrato SOL — não só esta skill —
tem que refletir nos DOIS lugares abaixo, sem esperar o Chefe pedir:

1. `C:\Users\Administrador\Documents\Obsidian Vault\🪬Centraldark -HUD🪬\HUD.html`
   — adicionar 1 item no array `missions` (perto da linha 929), padrão
   `{tag:'chefe'|'agente', label:'...', text:'...'}`, e bumpar o número em
   `<span class="section-count">N abertas</span>` (seção "Missões").
2. `C:\Users\Administrador\Documents\Obsidian Vault\🪬Centraldark -HUD🪬\Pendências.md`
   — mesma pendência, mesma frase, na seção certa (`🧍 Do Chefe` = decisão
   humana; `🤖 Do agente` = o próprio agente resolve sozinho).

Importante: desde 2026-10-04 o CHEFE autorizou a evolução deste owner para monitoramento vivo sem criar segundo coração. O `HUD.html` continua arquivo local/Obsidian, mas dados mutáveis devem vir do owner existente `https://api.centralldark.com/heartbeat`, com refresh periódico e fail-closed: fetch falhou = `UNKNOWN`, nunca PASS.

O HUD deve renderizar, quando presentes, `operational.modelBinding.orchestrator`, `operational.modelBinding.localWorker`, `operational.modelBinding.selfEvolution`, `operational.executionTopology` e o timestamp da medição. O arquivo é projeção; `/heartbeat` é o agregador vivo; nenhum dos dois vira autoridade.

Contrato: `ONE_HEART=true`; `HUD_LIVE_SOURCE=/heartbeat`; `MODEL_BINDING_VISIBLE=true`; `ORCHESTRATOR_CURRENT_VISIBLE=true`; `LOCAL_WORKER_CURRENT_VISIBLE=true`; `SELF_EVOLUTION_VISIBLE=true`; `UNKNOWN_ON_FETCH_FAILURE=true`; `NO_SECOND_HEALTH_AGGREGATOR=true`.

## Regras que não podem ser violadas

- `UNKNOWN != PASS` — nunca reportar algo como resolvido sem prova.
- `HISTORY != CURRENT` — receipt/estado antigo não vira "current" sem
  remedição.
- `CASA-VAULT != AUTO_UPDATE` — isso é sempre uma ação deliberada de quem
  está rodando a skill, nunca assumir que outro processo já fez.
- `LOCAL_EDIT != COMMIT` — editar o vault Obsidian ou qualquer arquivo em
  AppData NÃO é registrar histórico. Só commit+push em `main` (via PR)
  conta como registrado pro resto da Casa/VPS enxergar.
- Nunca prometer automação (cron, webhook) que não foi de fato registrada e
  provada rodando.

## Cron — status real (verificar sempre com `hermes cron status`, não supor)

Job registrado em 2026-09-23: `f052f0dc37ed`, nome "Reconciliacao Diaria
CentralDark", schedule `0 8 * * *`, `--skill reconciliacao-diaria-centraldark`,
workdir `E:\CentralDark\CentralDark`, `--deliver local`. Comando usado:
`hermes cron create "0 8 * * *" [prompt] --name ... --skill ... --workdir ... --deliver local`
(atenção: o prompt posicional tem que vir logo depois do schedule, ANTES das
flags — passar as flags primeiro faz o parser do Hermes rejeitar o prompt
como "unrecognized arguments").

**Job existir != rodar sozinho** — mas isso já foi resolvido em 2026-09-23:
`hermes gateway install` rodado no perfil `Administrador`, Scheduled Task
criada pro login do Windows, gateway confirmado rodando (PID 39188). Cron
`f052f0dc37ed` ativo, próxima execução real esperada. Se `hermes cron status`
voltar a mostrar `✗ Gateway is not running`, é regressão — registrar como
delta, não assumir que "já tava resolvido" sem remedir.

Achado separado, ainda pendente: existe um segundo perfil Windows (`danda`)
com Hermes mais maduro (849 skills, webui configurada) mas sem gateway
ativo — decisão de consolidar num perfil só está registrada como pendência
`chefe` no HUD/Pendências.md, não decidir isso sozinho.
