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
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
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

- Owner CURRENT do CHECK-LIST/Rendezvous: `apps/modulos/Bolt/source/app/components/centraldark/CentralDarkUnifiedHud.client.tsx`.
- Agregador já existente consumido pelo HUD: `apps/modulos/Bolt/source/app/routes/api.github-stats.ts`.
- Histórico/provenance do checklist: `docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md`.
- Receipts duráveis continuam no repositório; HUD é projeção e nunca autoridade.
- Espelhos Obsidian podem continuar como mirrors locais, mas não são owner nem gatilho para PR diária.

```text
HUD_IS_CURRENT_PROJECTION=true
HUD_IS_NOT_AUTHORITY=true
CHECKLIST_DAILY_OWNER=HUD
RECEIPTS_OWNER=repository
PR_MOTHER_ROLE=RETIRED
NO_NEW_PR_MOTHER=true
NO_DAILY_PR=true
```

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

3. **Projetar CURRENT no HUD existente — nunca abrir PR diária.**
   O estado vivo é derivado no owner já existente `/api/github-stats` e
   renderizado em `CentralDarkUnifiedHud.client.tsx`. A reconciliação mede,
   classifica e deixa o HUD refletir o estado atual sem criar branch,
   `cristal/<data>`, PR de checklist ou nova PR-MÃE.
   - PASS/FAIL/UNKNOWN/BLOCKED vêm da mesma medição do HUD.
   - filhos/lanes ativos vêm dos PRs abertos, excluindo #1562/#1757 aposentadas.
   - receipt fingerprint vem do owner versionado de receipts.
   - `NEXT_CURSOR` aponta para o primeiro BLOCKED, FAIL ou UNKNOWN; sem ferida,
     vira `FIXED_POINT_WAIT_FOR_DELTA`.
   - delta material que precise memória durável entra em receipt/owner existente
     no repositório; a projeção diária em si não exige commit diário.

4. **Preservar histórico sem fazê-lo virar CURRENT.**
   `docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md` permanece como provenance
   histórica e índice de aprendizados. Não bumpar data só para satisfazer gate.
   `HISTORY != CURRENT`; CURRENT vem do HUD medido.

5. **Espelhos locais são opcionais e derivados.**
   Obsidian/vault podem espelhar a projeção, mas não criam owner, scheduler,
   branch ou PR. Divergência do espelho é delta local; não altera o CURRENT
   canônico sem readback da fonte viva.

## Toda pendência nova → HUD + Pendências.md (regra travada, sem pedir autorização de novo)

Regra atual: qualquer pendência material aparece na projeção CURRENT do HUD pela
mesma fonte viva que alimenta as lanes. `Pendências.md` e HUDs Obsidian antigos
podem sobreviver como espelhos/histórico, mas não recebem escrita obrigatória e
não criam segunda projeção.

O HUD oficial é o `CentralDarkUnifiedHud` já montado no cockpit. Ele combina:
- estado GitHub/current pela rota existente `/api/github-stats`;
- runtime/health já medido pelo bridge e `/heartbeat` quando aplicável;
- PASS/FAIL/UNKNOWN/BLOCKED sem inferir verde;
- receipts fingerprint + source fingerprint + NEXT_CURSOR.

Contrato: `ONE_HEART=true`; `HUD_CURRENT_OWNER=CentralDarkUnifiedHud`;
`HUD_IS_CURRENT_PROJECTION=true`; `HUD_IS_NOT_AUTHORITY=true`;
`CHECKLIST_DAILY_OWNER=HUD`; `UNKNOWN_ON_FETCH_FAILURE=true`;
`NO_SECOND_HEALTH_AGGREGATOR=true`; `NO_DAILY_PR=true`.

## Regras que não podem ser violadas

- `UNKNOWN != PASS` — nunca reportar algo como resolvido sem prova.
- `HISTORY != CURRENT` — receipt/estado antigo não vira "current" sem
  remedição.
- `CASA-VAULT != AUTO_UPDATE` — isso é sempre uma ação deliberada de quem
  está rodando a skill, nunca assumir que outro processo já fez.
- `LOCAL_EDIT != COMMIT` — espelho local não é memória durável. Delta
  material reutilizável vira receipt/owner versionado quando necessário;
  a remedição diária sem delta material é somente projeção HUD e `NO_CHANGE`.
- `NO_DAILY_PR=true`; `NO_NEW_PR_MOTHER=true`; PR só nasce por necessidade
  material independente do checklist, nunca por passagem do calendário.
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
