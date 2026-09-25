---
title: "Bridge OneShot Tray Route — Rota determinística de ponte autorizada"
date: 2026-09-24
status: "CANONICAL_ROUTE_CONTRACT"
authority: "SEGREDO/CHEFE"
canonical_rule: "REGRA-ZERO-CENTRALDARK"
truth_rule: "REALIDADE_IS_JUDGE"
source_event: "Remote Desktop Commander device verify + VPS GitHub credential route discovery"
owners:
  - "Remote Desktop Commander Remote MCP"
  - "SEGREDO Tray / Browser Verify"
  - "vmi3256920 VPS"
  - "GitHub connector / authorized repository writer"
  - "docs/CONSCIENCIA/PROGRAMAS/BRAIN-ARTIFACT-CAPTURE-20260924.md"
---

# Bridge OneShot Tray Route

## 1. O que ficou provado

A sessão mostrou uma rota real de autorização de ponte:

```text
SEGREDO Windows
→ Desktop Commander Remote MCP
→ browser verify / device code
→ Device ready / presence tracked
→ bridge/tray fica online
```

Também foi observado um shell da VPS com `gh auth status` funcional e credential helper do GitHub configurado. Porém a rota executada pelo conector Remote Commander nesta conversa não herdou esse mesmo estado de autenticação GitHub.

Logo, a conclusão correta é:

```text
GH_AUTH_VISUAL_SHELL = PASS
GH_AUTH_REMOTE_COMMANDER_CONTEXT = FAIL_OR_UNKNOWN
SEGREDO_BROWSER_AUTH = PASS_VISUAL
SEGREDO_CONNECTOR_VISIBLE_IN_THIS_SESSION = UNKNOWN
```

## 2. Regra determinística

A rota OneShot Tray não cria novo cérebro, novo router ou novo executor. Ela é uma ponte autorizada de presença, verificação e canal.

```text
BRIDGE_ONESHOT_TRAY_ROUTE=true
NO_NEW_ROUTER=true
NO_NEW_BRAIN=true
NO_SECRET_IN_CHAT=true
NO_SECRET_IN_GIT=true
UI_TRUNCATED != CONFIG_INVALID
DEVICE_VERIFY != RUNTIME_AUTH_FOR_ALL_CONTEXTS
GH_AUTH_IN_ONE_SHELL != GH_AUTH_IN_ALL_EXECUTION_CONTEXTS
```

## 3. Caminho canônico

```text
CHEFE autoriza pareamento
→ SEGREDO abre browser verify
→ Desktop Commander device code confere
→ Remote MCP marca device online
→ Bridge/Tray expõe presença
→ runtime escolhe rota autorizada disponível
→ GitHub connector ou GH helper escreve somente no escopo permitido
→ TIK-TAK remede depois
→ Greg/Dex/Realidade decidem promoção
```

## 4. O que essa rota permite

```text
CAN_READ_STATE_WHEN_AUTHORIZED=true
CAN_BRIDGE_LOCAL_CONTEXT_WHEN_DEVICE_ONLINE=true
CAN_ROUTE_ARTIFACT_INGEST_EVENTS=true
CAN_HELP_SYNC_OBSIDIAN_BRAIN_WHEN_LOCAL_API_ENABLED=true
CAN_SUPPORT_BOT_HUB_VPS_RENDEZVOUS=true
```

## 5. O que essa rota não permite

```text
CANNOT_EXPOSE_TOKENS=true
CANNOT_ASSUME_ALL_CONTEXTS_AUTHENTICATED=true
CANNOT_AUTO_DEPLOY=true
CANNOT_AUTO_RUN_BINARY_ARTIFACTS=true
CANNOT_PROMOTE_UNKNOWN_TO_PASS=true
CANNOT_TREAT_VISUAL_PASS_AS_CONNECTOR_PASS=true
```

## 6. Integração com Artifact Capture

Quando o BRAIN receber arquivo/nota/evento por Telegram, Hub, API, Obsidian, Google Drive ou ponte local, a Bridge OneShot Tray pode ser usada apenas como canal de entrada/presença.

A promoção do conhecimento segue o pipeline:

```text
artifact/event received
→ store bytes/content
→ SHA256
→ sidecar markdown
→ manifest
→ BRAIN index
→ CI/CD gates
→ VPS knowledge runtime
→ receipt
```

Nada executa automaticamente.

## 7. Aceite operacional

```text
DEVICE_ONLINE_OBSERVED=true
AUTHORIZED_ROUTE_SELECTED=true
SAME_TARGET_REMEASURED=true
NO_SECRET_LEAK=true
NO_PARALLEL_OWNER=true
ONE_WRITER_PER_SCOPE=true
GREG_VERDICT_REQUIRED_BEFORE_GREEN=true
DEX_APPROVAL_REQUIRED_FOR_CRITICAL_DELTA=true
```

## 8. NEXT_CURSOR

```text
SEGREDO_CONNECTOR_VISIBILITY
→ compare browser/device-ready with connector list
→ bind bridge presence to Hub/BRAIN event route
→ artifact-ingest runtime implementation
→ Obsidian Local REST/MCP optional local bridge
→ CI/CD receipt
```
