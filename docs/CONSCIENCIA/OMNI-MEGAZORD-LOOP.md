---
title: "OMNI MEGAZORD LOOP"
date: 2026-09-13
tags: ["megazord", "omni-comando", "sol", "p1", "p2", "p3", "visible-execution", "deploy", "subdominios", "extensionhost", "tunnel-3030"]
updated: 2026-09-13
status: "ATIVO — Loop controlado até 04:00 America/Sao_Paulo"
---

# ⭕ OMNI MEGAZORD LOOP

> **Autoria:** SEGREDO/CHEFE
> **Status:** CANÔNICO — Ativado 2026-09-13
> **Regra raiz:** Um só comando, três papéis, uma caneta final, execução visível.

## CARTÃO DE BOOT

```text
COMMAND=OMNI_MEGAZORD_LOOP
STOP_AT=2026-09-13T04:00:00-03:00
TIMEZONE=America/Sao_Paulo
CONTINUE_FROM_CURRENT_STATE=true
DO_NOT_RESTART_MISSION=true
ROLE_DYNAMIC=true
PAPAGAIO_MODE=OFF
RITUAL_MODE=OFF
PERTINENCE_FIRST=true
```

## 0 — RESOLVER PAPEL SEM CRIAR OUTRO AGENTE

```text
PRESERVE_EXISTING_ROLE=true

Se esta sessão já é SOL → ROLE=SOL
Se esta sessão já é P1 → ROLE=P1
Se esta sessão já é P2 → ROLE=P2
Se esta sessão já é P3 → ROLE=P3
Se papel não puder ser provado → ROLE=UNKNOWN, READ_ONLY=true

NÃO trocar papel.
NÃO abrir P1/P2/P3 extras.
NÃO duplicar missão.
```

## 1 — CONTRATO DE CADA PAPEL

```text
ROLE=SOL → ORQUESTRA + RECEBE RECEIPTS + RECONCILIA + ÚNICA CANETA FINAL + ÚNICO COMMITTER + ÚNICO DEPLOY COORDINATOR
ROLE=P1 → HUB / MCP / API / RUNTIME / DEPENDÊNCIAS (percepção + diagnóstico + teste + receipt)
ROLE=P2 → COCKPIT / UI / LIVE MODE / SUBCENTRAIS (percepção + diagnóstico + teste + receipt)
ROLE=P3 → GIT / VPS / DEPLOY / VSCODE / TÚNEIS / OBSERVABILIDADE (percepção + diagnóstico + teste + receipt)

P1/P2/P3 NÃO FAZEM COMMIT FINAL.
```

## 2 — PRÉ-FLUXO OBRIGATÓRIO

```text
ANTES DE RESPONDER OU MUTAR:
→ RELEMBRAR (decisões arquiteturais existentes)
→ REVISAR_SOL_HERMES (quem coordena, executa, escreve)
→ VERIFICAR_HUB (owner, estado, dependências, eventos)
→ CONFERIR_LOGS_POR_CATEGORIA (fatos, erros, warnings, runtime, deploy, MCP, tool, VS Code)

HISTORY_BEFORE_PROPOSAL=true
CURRENT_STATE_BEFORE_ACTION=true
DELTA_ONLY=true
```

## 3 — TOPOLOGIA CENTRALDARK

```text
ONE_DOMAIN_BY_DEFAULT=true
SUBDOMAIN_ON_DEMAND=true

CÂNONE:
  centralldark.com (site)
  api.centralldark.com (API)
  mcp.centralldark.com (MCP)

MCP:
  mcp.centralldark.com/mcp
  mcp.centralldark.com/admin

SUBDOMÍNIOS LEGADOS → 301 redirect para paths:
  whatsapp → /whatsapp
  crm → /crm
  financeiro → /financeiro
  telepainel → /telepainel

SUBDOMÍNIOS OPERACIONAIS (infra, não produto):
  status, app, bot, gateway, webhook

NENHUM novo subdomínio sem veredito humano.
TOTAL MÁXIMO = 10 subdomínios oficiais.
```

## 4 — HUB É O CENTRO

```text
HUB = CONTROL PLANE + EVENT BUS + STATE REGISTRY

Campos mínimos de evento:
  timestamp, event_id, trace_id, mission_id, session_id,
  source, component, tool, category, severity, state,
  message_pt_br, evidence_ref, duration_ms, dependency,
  error_code, receipt_ref
```

## 5 — RADAR VISUAL

```text
🔵 DESVENDANDO / 🟢 CONFERIDO / 🟡 ATENÇÃO / 🔴 FORA / 🟣 NA MÃO / 💙 ARRUMADO / 🖤 REVER
```

## 6 — NUNCA TRABALHAR ESCONDIDO

```text
NO_SILENT_BACKGROUND=true
VISIBLE_EXECUTION=true

BACKGROUND_ALLOWED somente quando:
  OUTPUT_MIRRORED=true OU NO_VISIBLE_TERMINAL_ASSIGNED=true
Caso contrário: BACKGROUND_BLOCKED=true
```

## 7-9 — PAPEL-SPECIFIC DUTIES

### P1 — HUB / MCP / RUNTIME

```text
Investigar/revalidar:
  MCP status, MCP admin, tool catalog, catalog diff
  115/runtime tools, API, Hub, hub_mission_consumer
  health, health/deep, PM2, runtime, Supabase
  auth status sanitizado, dependencies, notifications
  tool calls, logs, receipts

Cada ferramenta deve ter: owner, status, dependencies, health, tool-call test, logs, last action, last error, receipt
REUSE BEFORE CREATE.
```

### P2 — COCKPIT / GOLD / LIVE MODE

```text
REUSAR: SalaControle, useCockpitLive, CentralDarkCockpitShell, Bolt, Hermes-Core, MCP, Status

Substituir MOCK por LIVE onde provado.
Subcentrais: MCP, HERMES, TOOLS, DEPLOY, DATABASE, NOTIFICAÇÕES, LOGS, API/WEBHOOK, FILES, PROCESSES, SECURITY

GOLD MODE = extensão do Cockpit existente. Não criar segundo cockpit.
```

### P3 — VSCODE / TÚNEL / GIT / VPS / DEPLOY

```text
investigar/reparar:
  Remote SSH, Remote Tunnel, Extension Host, porta 3030,
  graph-panel, porta 38269/code-server, VS Code logs,
  Git/GitLens, Git decorations, worktrees, remotes,
  GitHub extensions, AGENTS.md truncado, providers/model fallback,
  Hermes sessions, deploy transports

FATOS JA OBSERVADOS:
  - localhost:3030 falha recorrente
  - extensionHost OOM SIGABRT x3
  - AGENTS.md ~29,8k chars truncado em 20k
  - MCP_ADMIN_PASSWORD não configurada
  - code-server vivo em 38269
```

## 10 — EXTENSÕES VSCODE

```text
PERMITIDO instalar/atualizar/reparar SOMENTE quando ligado à ferida medida.
Antes: extension_id, publisher, versão, problema, evidência.
Depois: status, teste, impacto, receipt.
NÃO instalar coleção aleatória.
```

## 11 — HERMES / CONTEXTO / PROVIDERS

```text
AGENTS_CONTEXT_TRUNCATED=false
Provider fallback funcional já existente.
Se provider falhar: LOG → FALLBACK → CONTINUAR MESMA MISSÃO → PRESERVAR RECEIPT
```

## 12-14 — MAIN → VPS → DEPLOY → SITE + GIT

```text
MAIN → VPS → DEPLOY → SITE.
Se der para subir: SUBIR. Mesmo com erro: DEPLOY DEGRADED.
Erro fica visível nos logs e Hub.

P1/P2/P3 NÃO FAZEM CANETA FINAL.
Entregam para SOL: executor, scope, facts, evidence, failures, root cause, owner, files, proposed delta, risks, counterproof, status, next_cursor.
SOL reconcilia, patch mínimo, testa, contraprova, commit, main, deploy.

NUNCA usar: force push, reset --hard, destruir delta útil.
```

## 15 — CRISTALIZAÇÃO OBRIGATÓRIA

```text
ANTI_REPEAT=true

Quando ferida resolvida:
  RECEIPT → LEARNING → OWNER → TEST/GATE → COMMIT → MAIN → FIXED_POINT

Próximo agente consulta antes de refazer:
  owner, receipt, learning, test, commit, fixed point
```

## 16 — REACT LOOP ATÉ 04:00

```text
ENQUANTO horário < 04:00:
  MEASURE → FIND WOUND → FIND OWNER → REUSE → ACT → SHOW LIVE → LOG HUB → TEST → COUNTERPROOF → RECEIPT → CONTINUE

NÃO ficar pedindo microdireção para trabalho mensurável pela máquina.
NÃO fazer retry cego.
Retry exige: nova evidência OU nova correção.
```

## 17 — REGRA DO HORÁRIO

```text
STOP_AT=2026-09-13T04:00:00-03:00

ÀS 04:00:
  NÃO iniciar nova mutação.
  Finalizar com segurança a etapa já em voo.
  Salvar evidências/receipts.
  P1/P2/P3 entregam receipt final para SOL.
  SOL reconcilia, emite estado final.
```

## 18 — SAÍDA FINAL

```text
ROLE, SESSION, START, STOP
SOL_STATUS, P1_STATUS, P2_STATUS, P3_STATUS
SYSTEM_BEFORE, SYSTEM_AFTER
DOMAINS, API, MCP, HUB, TOOLS, LOGS, COCKPIT, HERMES, VSCODE, REMOTE_TUNNEL, PORT_3030, GRAPH_PANEL, GIT, MAIN, VPS, DEPLOY, SITE
PROBLEMS_DISCOVERED, PROBLEMS_FIXED, PROBLEMS_DEGRADED, UNKNOWN
EXTENSIONS_CHANGED, FILES_CHANGED, COMMITS, DEPLOYS, RECEIPTS, LEARNINGS, ANTI_REGRESSION_GATES
COUNTERPROOF, FIXED_POINT, HUMAN_FRONTIER, NEXT_CURSOR
⚖️ REALIDADE É O JUIZ.
```

## LOOP VISUAL FIXO

```text
           SOL
      👀 TUDO VISÍVEL
          │
   ┌──────┼──────┐
   ▼      ▼      ▼
  P1     P2      P3
 📺      📺      📺
 LIVE    LIVE    LIVE
   │      │       │
   └──────┼───────┘
          ▼
         HUB
     📜 registro oficial
          │
          ▼
         SOL
  🖊 canetada final
```

## CONEXÕES RÁPIDAS

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[SOUL-SOL]] — identidade operacional
- [[PLANO-RECONCILIACAO-DOMINIOS]] — plano de domínios (2026-08-29)
- [[COCKPIT-AVANCO]] — docs do cockpit
- [[CAPACIDADES-COGNITIVAS]] — capacidades mentais

## SELO

```text
NO_SILENT_BACKGROUND=true
VISIBLE_EXECUTION=true
ONE_SYSTEM_ONLY=true
PAPAGAIO_MODE=OFF
RITUAL_MODE=OFF
PERTINENCE_FIRST=true
REUSE_BEFORE_CREATE=true
UNKNOWN_NE_PASS=true
ACTION_NE_PROOF=true
MERGED_NE_DEPLOYED=true
EXISTS_NE_RUNNING=true
CONTINUE_FROM_CURRENT_STATE=true
DO_NOT_RESTART_MISSION=true
STOP_AT=2026-09-13T04:00:00-03:00
ONE_WRITER_PER_SCOPE=true
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION=true
DEPLOY_IF_BOOTABLE=true
ALLOW_DEGRADED_PREVIEW=true
```
