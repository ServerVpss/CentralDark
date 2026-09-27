# HUD VOZ → CONSULTA → VISUALIZAÇÃO — 2026-09-24

PR_MOTHER=#1562
PR_ROLE=CHILD_PROMOTION_PR
WRITER=SOL
WRITER_SCOPE=hud/voz-consulta-visualizacao-20260924
MAIN_BASE=2f3ef85b9ef415a610e58f7ace1ae9bd37ff5e0a
REALITY_IS_JUDGE=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
UNKNOWN != PASS

## Rumo

CHEFE fala → CentralDark consulta/executa pelos owners existentes → CHEFE ouve e visualiza o resultado.

## Owners reconciliados no main

- coração/saúde: `GET https://api.centralldark.com/heartbeat` em `apps/modulos/mcp/src/index.js`
- roteamento: `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`
- trigger/receipt: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml`
- entrada de artefatos Telegram/Hub/Drive: `apps/bot-telegram/skills/externas/artifact-ingest.cjs`
- cockpit: `src/paginas/admin-cockpit/PainelOps.tsx`
- status legado: `apps/modulos/status/painel-data.json`

## Delta desta caneta

### Cockpit fail-closed

O hero do `PainelOps` não pode mais afirmar `SISTEMA Rodando` por mock.
Ele mede `/heartbeat` a cada 15 s e classifica:

- `PASS`: HTTP OK + `self` explicitamente `alive|healthy|ok|pass`
- `FAIL`: `self` explicitamente `lost|down|failed|fail|error`
- `UNKNOWN`: timeout, erro, CORS, payload sem estado vivo explícito, `stale` ou qualquer ausência de prova suficiente

Isso preserva `UI_TRUNCATED != CONFIG_INVALID`, `UNKNOWN != PASS` e `REALITY_IS_JUDGE`.

## HUD consolidado da missão

1. Cabine de voz — conversa observada; integração canônica completa ainda UNKNOWN.
2. VPS — leitura/comando observado em sessão; saúde atual precisa remedição.
3. GitHub — main e contrato reconciliados.
4. Lovable — inventário total ainda pendente.
5. Instinto Superior — ligação real API/Hub/Telegram ainda pendente.
6. Rotinas determinísticas — converter apenas trechos provados.
7. Sentinela/S-beat — reutilizar Trigger Fabric + heartbeat; nenhum novo núcleo.
8. Provas/cadeados — receipts + hash + SAME_HEAD quando aplicável.
9. Status/notificações — verde apenas enquanto saúde atual estiver provada.
10. Builder — permanece dentro de admin/casca única.
11. Telegram + Hub MCP — reutilizar artifact-ingest e owners existentes.
12. VPS limpeza — somente após medição atual.
13. Cache/migração Lovable — preservar origem/dependências.
14. Dispositivo local — indisponível != desligado.
15. Voz Windows 11 — investigação permanece UNKNOWN.
16. Gravação — arquivo ainda não provado/localizado.
17. Registro definitivo — receipt volta ao PR-mãe #1562; PR-mãe não mergeia.

## Anti-regressão

DOCUMENTED != EXECUTED
ACTION != PROOF
MERGED != DEPLOYED
EXISTS != RUNNING
CURRENT > HISTORY
NO_NEW_SENTINEL_CORE=true
NO_SECOND_HEARTBEAT=true
NO_SECOND_ROUTER=true

## NEXT_CURSOR

1. validar build/lint do cockpit no mesmo HEAD
2. observar CI do filho
3. medir runtime atual de heartbeat/VPS
4. somente depois atualizar PASS/UNKNOWN no ledger #1562


## Registro durável — CASA / GARIMPO / Remote Desktop — 2026-09-25

EVIDENCE_SOURCE=CHEFE_UPLOADS+REPO_MAIN
EVIDENCE_CLASS=RECEIPT+SOURCE_CODE+SCREENSHOT
CURRENT_ROUTE_PROOF=PARTIAL_STRONG

### Cadeia provada

```text
E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE
→ CentralDark Remote Tray / Remote Bridge
→ npx @wonderwhy-er/desktop-commander remote
→ https://mcp.desktopcommander.app/mcp
→ autorização por device code
→ Device ID atribuído
→ Channel subscribed
→ Device marked as online
→ Device ready
→ Device Name = SEGREDO
```

### Evidências locais recebidas do CHEFE

- receipts de `remote-bridge` registram repetidamente `device_label/device = SEGREDO`;
- os mesmos receipts registram `workdir = E:\\CentralDark\\_MAPA_CASA\\GARIMPO-CHEFE`;
- logs `centraldark-remote-tray-*.log` registram `WORKDIR=...GARIMPO-CHEFE`, `REMOTE_MCP_CONNECT=https://mcp.desktopcommander.app/mcp` e inicialização do owner Remote MCP para `SEGREDO`;
- logs `desktop-commander-*.log` registram conexão ao Remote MCP e `Device Name: SEGREDO`;
- receipt antigo preserva um Device ID estável em múltiplas sessões antes das recriações posteriores;
- screenshot de nova autorização mostra explicitamente `Device Name: SEGREDO` após `Device ID assigned`, `Channel subscribed`, `Device marked as online` e `Device ready`.

### Fonte canônica já existente

- `scripts/remote-bridge/CentralDark-Remote-Bridge.ps1` usa `GARIMPO-CHEFE` como `Workdir` padrão e executa dali o owner Remote MCP;
- `scripts/remote-bridge/CentralDark-Remote-One.go` usa o mesmo `defaultWorkdir`, grava receipts em `GARIMPO-CHEFE\\receipts\\remote-bridge` e registra `Device: SEGREDO`;
- `docs/RELATORIOS/2026-09-16-casa-garimpo-reconciliation.md` já registra que o pacote Remote Tray/NPX do GARIMPO foi absorvido pelo contrato canônico.

### Conclusão

```text
GARIMPO_CHEFE_WAS_REMOTE_BRIDGE_WORKDIR = PROVEN
REMOTE_MCP_ROUTE_FROM_GARIMPO = PROVEN
DEVICE_NAME_SEGREDO_OBSERVED_AFTER_AUTH = PROVEN
GARIMPO_PATH_ITSELF_GENERATES_DEVICE_NAME = NOT_PROVEN
EXACT_DEVICE_NAME_SOURCE = UNKNOWN
```

Não inferir que o caminho da pasta cria o nome do device. O próximo teste discriminante deve localizar se `SEGREDO` vem de hostname Windows, estado local do Desktop Commander, wrapper/bridge, variável/configuração ou registro persistente de autenticação.

### Invariantes cristalizadas

```text
UI_CONNECTED != REMOTE_COMMANDER_ROUTABLE
DEVICE_REGISTERED != DEVICE_ONLINE
WORKDIR != DEVICE_IDENTITY
HISTORICAL_DEVICE != CURRENT_ROUTABLE_DEVICE
TOOL_FAILURE != WORLD_FAILURE
```


## Registro durável — Execução determinística sem IA — 2026-09-25

HEAD_VERIFIED=f4d3130e9d5f842165b2a6327b2d505e67ddfd5a
PR_CHILD=#1684
PR_MOTHER=#1562
AI_REQUIRED_FOR_STATUS=false
SAME_HEAD_BUILD=PASS
TESTS=15_PASS_0_FAIL

### Frente 1 — MCP / topologia de execução

Owner reutilizado: `apps/modulos/mcp/src/operational-telemetry.js`.

O snapshot `centraldark_operational_snapshot` agora inclui `executionTopology` determinístico, baseado em:

- `/proc/*/cmdline` para presença de runtimes;
- `logs/mcp-audit-*.jsonl*` para atividade recente real de `tools/call`;
- sem LLM para classificar quem está vivo/executando.

Leis:

```text
UI_LOOP_PAUSED != GLOBAL_EXECUTION_PAUSED
PLANNER != EXECUTOR
MONITOR != EXECUTOR
PROCESS_PRESENT != EXECUTION_PROOF
RECENT_MCP_TOOL_CALL = EXECUTION_EVIDENCE
UNKNOWN != PASS
```

Lanes medidas: MCP, Telegram Bot, Hermes runtime, Hermes cron/external worker, GitHub runner, Remote Desktop e Guardião.

### Frente 2 — Telegram /status sem IA

Owner reutilizado: `apps/bot-telegram/unified-bot.cjs`.

`/status` consome `/health/deep -> operationalSnapshot.executionTopology` e exibe:

- verdict de execução;
- idade da última tool-call MCP;
- multiplicidade do unified-bot;
- lanes RUNNING/NOT_OBSERVED.

Se `/health/deep` não provar topologia, retorna `UNKNOWN`. Nenhum fallback LLM é usado para esse status.

### Frente 3 — GuardiaoCasa / perfil

Owner preservado: `scripts/set-bot-profile.sh`.

Contrato testável:

```text
GUARDA_PRINCIPAL_BOT_TOKEN -> GuardiaoCasa
ONLY_GUARDIAO=1 -> não toca srver1bot
MPRVA = getMe -> setMyShortDescription -> setMyDescription -> getMyDescription
```

O teste impede regressão para `TOK_GUARDA`/owner antigo.

### Frente 4 — Shell / operador / contexto de auth

Novo diagnóstico dentro do owner de diagnostics existente:
`scripts/diagnostics/centraldark-operator-preflight.sh`.

Ele é read-only e classifica deterministicamente:

- `gh STATUS` -> `gh status`;
- path `.cjs/.mjs/.js/.ts/.tsx` digitado como comando -> SOURCE_PATH_NOT_SHELL_COMMAND;
- placeholder com `...` -> PLACEHOLDER_NOT_EXECUTABLE;
- `~/.cargo/env` ausente -> ruído opcional/guard necessário;
- auth `gh` do HOME atual vs config canônica;
- helper Git HTTPS separado do auth do GitHub CLI;
- caminhos reais de consciousness, hub-mission-consumer e orchestrator.

Prova viva via Remote Desktop:

```text
WHOAMI=root
HOME=/root/.centraldark/mcp-auth/profiles/conta2/home
/root/.config/gh/hosts.yml=PRESENT
GH_AUTH(current profile)=FAIL
GH_AUTH(GH_CONFIG_DIR=/root/.config/gh)=PASS
GH_LOGIN=segredounlock
GIT_HTTPS_CREDENTIAL_HELPER=PASS
ORCHESTRATOR_PATH=apps/modulos/HERMES-CORE/core/orchestrator.mjs
```

Novas invariantes:

```text
SAME_USER != SAME_AUTH_CONTEXT
GH_AUTH_FAIL_IN_PROFILE != ROOT_GH_AUTH_FAIL
GH_AUTH_PASS != GIT_HTTPS_CREDENTIAL_HELPER_READY
SOURCE_PATH != SHELL_COMMAND
PLACEHOLDER != EXECUTABLE_PATH
```

### Contraprova SAME_HEAD

No HEAD `f4d3130e9d5f842165b2a6327b2d505e67ddfd5a`:

- operational telemetry tests: 6/6 PASS;
- bot deterministic status tests: 2/2 PASS;
- GuardiaoCasa profile tests: 3/3 PASS;
- operator preflight tests: 4/4 PASS;
- shell syntax: PASS;
- MCP typecheck: PASS;
- MCP build: PASS;
- segundo build após commit do `dist`: `git diff --exit-code -- apps/modulos/mcp/dist` PASS.

Conclusão:

```text
DETERMINISTIC_EXECUTION_STATUS = IMPLEMENTED_IN_SOURCE
AI_DEPENDENCY_FOR_STATUS = REMOVED
BUILD_REPRODUCIBILITY = SAME_HEAD_PASS
DEPLOYED_RUNTIME = UNKNOWN_UNTIL_PROMOTION
```
