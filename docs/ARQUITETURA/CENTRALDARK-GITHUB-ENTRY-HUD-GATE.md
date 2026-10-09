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

<!-- PR1788_HUD_OBSIDIAN_DETERMINISTIC_SEAL_CONTINUITY_20261009 -->
## Lei complementar do CHEFE — entrou, tem que selar; sem reprova cerimonial (09/10/2026)

Esta é uma extensão do **mesmo gate**, não outro porteiro, agregador, manifesto ou HUD. Para GitHub/PR/MCP/Hermes/Obsidian, primeiro consultar o **HUD CURRENT nas três abas** e reconciliar sua projeção com `main`, PR ativo, receipts e runtime real; `docs/HUD/HUD.html` continua **projeção obrigatória, não autoridade independente dos fatos**. Obsidian apresenta o mesmo conteúdo aprovado; não ganha writer canônico paralelo.

```text
ENTER -> READ_HUD_CURRENT + READ_ACTIVE_PR + CURRENT_MAIN + APPLICABLE_OWNER
-> CHECK_EXISTING_SEAL(PROOF_KEY, SOURCE_SHA, ARTIFACT_FINGERPRINT,
                       DEPENDENCY_FINGERPRINT, POLICY_VERSION, TARGET_BINDINGS)
-> VALID_SEAL + SAME_EXPECTED_EFFECT -> REUSE_EXISTING_EXECUTABLE_RECIPE
   -> DETERMINISTIC_OWNER_RUNNER -> MINIMUM_READBACK -> RECEIPT -> HUD
-> INVALID|ABSENT|STALE|UNKNOWN -> PLACA/VER_PENDENCIA(OWNER, ROUTE,
   REASON, PROOF_KEY, EVIDENCE, NEXT_CURSOR); revalidar somente o delta
```

Selo válido exige `OWNER, SCOPE, PROOF_KEY, SOURCE_SHA, RECEIPT, READBACK, OBSERVED_AT, NEXT_CURSOR`, além de receita, expected effect e eventos de invalidação definidos pelo **owner existente**. Um selo **histórico** não certifica serviço CURRENT. Mesmo selo/fingerprint/binding/efeito compatíveis **dispensam redescoberta com IA**, mas não dispensam o **readback mínimo do executor determinístico**; se o runner ou binding estiver indisponível, manter a PLACA e não afirmar automação funcionando. Sem escrita cega, sem bypass de autorização.

Rendezvous de API/MCP/One Heart corrente: **PR #1788**, enquanto aberto. Os `API01–API16` continuam sendo os critérios; o HUD mostra quais estão selados, pendentes, e qual PR é o dono de cada delta. Comentário de PR **não é ledger primário**: evidência sobrevivente fica nos arquivos/receipts dos owners. Quando o PR vigente terminar ou atingir limite operacional **e ainda houver critérios não selados**, reusar a regra de rollover em `docs/CONSCIENCIA/RECEIPTS/2026-10-06-pr-mae-ledger-rollover.md`: preservar predecessor, transferir somente pendências + fingerprint + receipt + NEXT_CURSOR para **um sucessor explícito**, atualizar a referência de PR no HUD existente e não iniciar trabalho concorrente. **Não abrir sucessor enquanto #1788 continuar apto a operar.**

`CONTRACT_DOCUMENTED != RUNTIME_HOOK_IMPLEMENTED`. Execução automática global só recebe PASS após teste no consumer existente.
<!-- /PR1788_HUD_OBSIDIAN_DETERMINISTIC_SEAL_CONTINUITY_20261009 -->
