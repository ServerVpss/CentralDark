# CentralDark — GitHub Entry HUD Gate

Data: 2026-10-06
Status: CANONICAL_REQUIRED
Owner: docs/ARQUITETURA/CENTRALDARK-GITHUB-ENTRY-HUD-GATE.md
Runtime consumer: .github/workflows/selo-fabric.yml
PR-mae viva: #1757

## Lei do CHEFE

```text
GITHUB_ENTRY_HUD_FIRST=true
FIRST_GITHUB_ACTION_MUST_REFRESH_PR_MOTHER_HUD=true
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
-> GET PR-mae #1757
-> listar PRs filhos abertos
-> atualizar HUD vivo se mudou main/open-child-set/evento
-> inventariar dependencias de agente
-> cruzar com owners reais no repo
-> separar PASS/UNKNOWN/BLOCKED
-> so entao responder ao CHEFE
```

## Inventario minimo

```text
SETORES=docs|apps|.agents|.github|scripts|central-horario|runtime
SUPERFICIES=GitHub_UI|PR_MOTHER_HUD|Actions|PullRequests|Issues|Workflows|MCP|HermesDesktop|AionUi|Casa|VPS
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
PR_MOTHER=1757
```

## Done condition

```text
HUD_FIRST_GATE=PASS
REPO_REALITY_MEASURED=PASS
AGENT_DEPENDENCY_MAP_UPDATED=PASS
UNMAPPED_AGENT_DEPENDENCY=0_OR_EXPLICIT_UNKNOWN
NEXT_CURSOR_REGISTERED=PASS
```


## Agent cartographer binding — 2026-10-06

```text
HUD_CARTOGRAPHER_AGENT=true
AGENT_OWNER=.agents/skills/centraldark-capability-hud/SKILL.md
AGENT_SURFACE=.agents/skills/centraldark-capability-hud/agents/openai.yaml
MACHINE_GENERATOR=scripts/hud/generate-hud-inventory.mjs
MACHINE_INVENTORY=docs/HUD/CENTRALDARK-HUD-INVENTORY.json
HUD_CONSUMER=docs/HUD/HUD.html
PR_MOTHER_CONSUMER=.github/workflows/selo-fabric.yml
SEAL_LIVE_SPLIT_REQUIRED=true
FULL_UI_BUTTON_TAB_MAP=MACHINE_ENUMERATED
```

O inventário não cria segunda verdade. Ele projeta owners existentes e carrega somente o cone pertinente.

```text
SELO = última prova válida + fingerprint + rollback
LIVE = medição atual + timestamp + fonte
SELO != LIVE
OWNER_PRESENT != RUNTIME_PASS
INVENTORY_ENTRY != CAPABILITY_HEALTH
```

A geração é determinística e deve permanecer em fixed point:

```bash
node scripts/hud/generate-hud-inventory.mjs --write
node scripts/hud/generate-hud-inventory.mjs --check
```

A PR-mãe consome apenas o resumo/fingerprint do JSON; o JSON completo fica no repo para consulta seletiva por agente, HUD e verifier.
