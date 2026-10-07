# CentralDark — GitHub Entry HUD Gate

Data: 2026-10-06
Status: CANONICAL_REQUIRED
Owner: docs/ARQUITETURA/CENTRALDARK-GITHUB-ENTRY-HUD-GATE.md
Runtime consumer: apps/modulos/Bolt/source/app/components/centraldark/CentralDarkUnifiedHud.client.tsx
Current source: apps/modulos/Bolt/source/app/routes/api.github-stats.ts
PR-mae: RETIRED (#1562/#1757 preservadas como provenance)

## Lei do CHEFE

```text
GITHUB_ENTRY_HUD_FIRST=true
FIRST_GITHUB_ACTION_MUST_REFRESH_HUD_CURRENT_PROJECTION=true
AGENT_DEPENDENCY_MAP_REQUIRED=true
GITHUB_REALITY_CROSSCHECK_REQUIRED=true
UI_SURFACE_INVENTORY_REQUIRED=true
SKILL_INVENTORY_REQUIRED=true
WORKFLOW_INVENTORY_REQUIRED=true
BUTTON_TAB_SECTOR_SURFACE_MAP_REQUIRED=true
HUD_UPDATE_IS_ENTRY_GATE_NOT_OPTIONAL=true
```

Quem entra pelo GitHub primeiro mede o GitHub real e atualiza o HUD vivo antes de concluir qualquer diagnostico humano.

## Sequencia obrigatoria

```text
GITHUB_ENTRY
-> GET repo/main/current
-> GET open PR lanes/current checks
-> GET repository receipts fingerprint
-> atualizar HUD CURRENT se mudou main/open-lane-set/checks/receipt
-> inventariar dependencias de agente
-> cruzar com owners reais no repo
-> separar PASS/UNKNOWN/BLOCKED
-> so entao responder ao CHEFE
```

## Inventario minimo

```text
SETORES=docs|apps|.agents|.github|scripts|central-horario|runtime
SUPERFICIES=GitHub_UI|HUD_CURRENT|Actions|PullRequests|Issues|Workflows|MCP|HermesDesktop|AionUi|Casa|VPS
AGENT_DEPENDENCIES=workflow_runner|provider_model|Desktop_app|MCP_tool|secret_or_var|runtime_service|local_sensor|VPS_service|browser_surface
UI_DEPENDENCIES=button|tab|sidebar|command_palette|provider_picker|retry|switch_provider|desktop_logs|diagnostics
```

## Fronteiras

```text
HUD_UPDATED != RUNTIME_PASS
GITHUB_REAL != VPS_RUNTIME
BUTTON_VISIBLE != CAPABILITY_PROVEN
SKILL_EXISTS != SKILL_LOADED
WORKFLOW_EXISTS != WORKFLOW_ACTIVE
AGENT_DEPENDENCY_EXISTS != AGENT_DEPENDENCY_HEALTHY
UNKNOWN_IS_NOT_PASS=true
REALITY_IS_JUDGE=true
```

## Estado observado na criacao

```text
REPO=ServerVpss/CentralDark
MAIN_AT_INVENTORY=d600f0efb1ed386779f519404ca0c802a82d8302
SKILLS_COUNT=992
WORKFLOWS_COUNT=71
DOCS_FILES_COUNT=2411
APPS_SECTORS_COUNT=47
MCP_SRC_TOOL_FILES_COUNT=40
UI_SIGNAL_MATCHES=7717
HUD_RELATED_FILES=535
PR_MOTHER_ROLE=RETIRED
LEGACY_PR_MOTHERS=1562,1757
HUD_CURRENT_PROJECTION=CentralDarkUnifiedHud/CURRENT
```

## Done condition

```text
HUD_FIRST_GATE=PASS
REPO_REALITY_MEASURED=PASS
AGENT_DEPENDENCY_MAP_UPDATED=PASS
UNMAPPED_AGENT_DEPENDENCY=0_OR_EXPLICIT_UNKNOWN
NEXT_CURSOR_REGISTERED=PASS
```
