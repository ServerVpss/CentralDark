# 👑🪬 SESSÃO TOTAL — PR-MÃE / ROTA ÚNICA / DELTA CONTÍNUO

DATE=2026-09-20  
PR_MOTHER=#1562  
PR_MOTHER_ROLE=RENDEZVOUS_LEDGER_NOT_RUNTIME_WRITER  
CHILD_GLOBAL_CONTRACT=#1597  
ONE_SYSTEM_ONLY=true  
REUSE_BEFORE_CREATE=true  
CURRENT_OVER_HISTORY=true  
UNKNOWN_IS_NOT_PASS=true  
REALITY_IS_JUDGE=true

## Intenção consolidada do CHEFE

Transformar CentralDark em um organismo operacional único, simples para o humano e complexo somente debaixo do capô:

- um Admin;
- uma Control API;
- um MCP;
- um coração/heartbeat;
- muitos sensores subordinados;
- HERMES absorvendo toil autorizado;
- Casa + VPS como superfícies do mesmo sistema;
- Desktop bridge e Screenpipe como capacidades, não novos cérebros;
- múltiplos monitores/workspaces como superfícies flexíveis;
- notificações event-driven;
- PR-MÃE como ledger/rendezvous;
- PR-filho/owner como trilho de mutação;
- contratos falsificáveis pela realidade.

## Arquitetura cristalizada nesta sessão

CHEFE  
↕  
ONE ADMIN  
↕  
ONE CONTROL API  
↕  
ONE MCP  
↓  
HERMES  
↓  
OWNER/CAPABILITY  
↓  
RUNTIME  
↑  
TELEMETRIA/RECEIPTS  
↑  
RENDEZVOUS/REALITY JUDGE  
↑  
CONTROL API  
→ notifications_log / Supabase Realtime  
→ Admin / sininho.

Princípios:

ONE_ADMIN=true.  
ONE_CONTROL_API=true.  
ONE_HEART=true.  
ONE_MCP=true.  
MANY_SENSORS=true.  
SENSORS_ARE_SUBORDINATE=true.  
DIRECT_API_PRIMARY=true.  
DESKTOP_BRIDGE_FALLBACK=true.  
SCREENPIPE_OPTIONAL_SENSOR=true.  
HERMES_MAX_TOIL=true.  
HERMES_MAX_AUTHORITY=false.  
COMPLEXITY_WITHOUT_CAPABILITY_GAIN=REGRESSION.  
CHEFE_COGNITIVE_LOAD_IS_SYSTEM_COST=true.

## Multibússola e observabilidade

Contrato operacional:

SENSOR_FAILURE != WORLD_FAILURE.  
CONNECTOR_FAILURE != PROVIDER_FAILURE.  
HTTP_200 != GLOBAL_PASS.  
REMOTE_ONLINE != SAME_HEAD.  
SOURCE != RUNTIME.  
DOCUMENTED != EXECUTED.

Fluxo:

OBSERVE  
→ ALTERNATE SENSOR  
→ RENDEZVOUS  
→ DISCRIMINATING TEST  
→ OWNER  
→ MINIMUM CAUSAL ACTION  
→ T1  
→ RECEIPT  
→ REALITY JUDGE.

Nenhum sensor ganha autoridade por sobreviver sozinho.

## Desktop/kernel lógico

Foi integrado ao contrato global do #1597:

CENTRALDARK_CORE=LOGICAL_AGENTIC_KERNEL.  
NATIVE_OS_KERNEL=SEPARATE_LAYER.  
SOURCE_PRESENT != RUNTIME_PASS.  
CONTRACT_TEST_PASS != PACKAGED_PASS.  
EXE_EXISTS != FIXED_POINT.  
REMOTE_BRIDGE_ONLINE != GLOBAL_FIXED_POINT.

Fixed Point Desktop exige, quando aplicável:

- source same-head;
- desktop contract test;
- package;
- installer SHA;
- CentralDark.exe launch;
- renderer visible;
- Omni health;
- Hermes sidecar bundled;
- MCP health;
- T1;
- receipt.

## Casa + VPS + GitHub + API

Malha-base medida durante a sessão:

CASA_REMOTE=ONLINE.  
VPS_REMOTE=ONLINE.  
MCP_VPS_HEALTH=200.  
MCP_PUBLIC_HEALTH=200.  
ADMIN_PUBLIC_HEALTH=200.  
HERMES_VPS=RUNNING.  
GITHUB_PR_CI=CONNECTED.

Mas também:

CASA_HEAD=7d4fdaf54f8e0b45da10e20fb852d6eb4b7213a1.  
VPS_ROOT_HEAD=f3c00f9c73c6691ef044bb237623e88ce57aaf38.  
VPS_CANONICAL_MAIN=cead445aa2a9386352d701070a56dfe5c8e066b4.  
GLOBAL_SAME_HEAD=false.  
GLOBAL_KERNEL_FIXED_POINT=false.

## Multi-monitor/workspaces

Snapshot arquitetural preservado:

MULTI_MONITOR_ARCHITECTURE_PRESERVED=true.  
VIRTUAL_DESKTOPS_ARE_DYNAMIC=true.  
MONITOR_LAYOUT_NOW != PERMANENT_LAYOUT.  
SCREENSHOT_PRESENT != RUNTIME_PROVEN.  
ONLINE_DECLARADO != END_TO_END_PROVEN.

A futura captura de estado deve preferir:

timestamp + host/session + monitor count + geometry/scaling quando disponível + workspace identity quando observável + janelas/processos relevantes + owner/session + SHA/version + receipt + CURRENT/HISTORY.

## Contabo

A VPS está online, mas provider API não estava hidratado no runtime MCP.

Foram medidos como ausentes no runtime:

CONTABO_CLIENT_ID.  
CONTABO_CLIENT_SECRET.  
CONTABO_API_USER.  
CONTABO_API_PASSWORD.

Foi encontrada rota existente no workflow canônico:

.github/workflows/vps-reboot-forensic.yml

usando exatamente GitHub Actions Secrets com esses quatro nomes.

Nenhum valor foi lido/exposto/commitado.

Decisão:

REUSE_EXISTING_GITHUB_SECRETS_ROUTE=true.  
NO_NEW_SECRET=true.  
NO_PARALLEL_VAULT=true.

Lacuna: scripts/vps/hydrate-provider-secrets.sh hidrata Cloudflare/Buildkite, mas ainda não Contabo.

## PR-MÃE como ledger obrigatório

Foi cristalizado no KIT:

BUSCA_MATERIAL  
→ FATO OBSERVADO  
→ CLASSIFICAÇÃO  
→ DELTA ÚTIL  
→ RECEIPT NO PR-MÃE  
→ NEXT_CURSOR  
→ SÓ ENTÃO PRÓXIMA BUSCA.

PR_MOTHER_SESSION_LEDGER_REQUIRED=true.  
MATERIAL_SEARCH_WITHOUT_MOTHER_RECEIPT=INCOMPLETE.  
CRYSTALLIZE_BEFORE_NEXT_MATERIAL_SEARCH=true.  
PR_MOTHER_RUNTIME_WRITER=false.  
CHILD_OWNER_MUTATES=true.

## Trajetória do #1597 nesta sessão

Commits relevantes:

b09517b865e2850de121079d574869fa8c171650  
canon(desktop): bind app kernel ao contrato global

1486cf565dea87b3195a6d1105c9a343b8f67fec  
fix(contract): reconciliar gates do delta global

39e80e329053c022a25aa8cf088faa09cbd4474a  
fix(mcp): normalizar owner e repo do GitHub

6d3337c9201c84f53d00001d2f004c8c54b63536  
test(mcp): cobrir full_name GitHub sem owner duplicado

9397a27ffe600f4f46c80c329535a283a42f8b87  
fix(mcp): corrigir regex do normalizador GitHub

## Bug GitHub 404 revisado

Sintoma:

/repos/ServerVpss/ServerVpss/CentralDark → 404.

Causa:

github-read.js aceita owner e repo separados.  
github.js montava /repos/{owner}/{repo}.  
Se repo chegava como full_name ServerVpss/CentralDark junto com owner=ServerVpss, o owner era duplicado.

ROOT_CAUSE=REPO_INPUT_NORMALIZATION_MISSING.

Contrato corretivo:

OWNER_CANONICAL=ServerVpss.  
REPO_CANONICAL=CentralDark.  
FULL_NAME_CANONICAL=ServerVpss/CentralDark.  
DUPLICATED_OWNER_PATH=FORBIDDEN.

Foi adicionado normalizador compartilhado + teste discriminante no #1597.

## Contraprovas e erros do próprio executor

### Patch 1 do normalizador

A primeira regex foi materializada com escape inválido.

Resultado:

SyntaxError antes dos asserts.

Classificação:

PATCH_REGRESSION=true.  
TEST_GATE_CAUGHT_BEFORE_DEPLOY=true.  
RUNTIME_DEPLOYED=false.

Foi corrigido no mesmo filho.

### Worktree Casa

Depois da correção de sintaxe, o teste parou em:

ERR_MODULE_NOT_FOUND: winston.

Causa:

worktree não possuía node_modules.

CASA root node_modules e MCP node_modules também foram medidos como ausentes.

Classificação:

TEST_ENVIRONMENT_MISSING_DEPENDENCY=true.  
PRODUCT_REGRESSION_NOT_PROVEN=true.

### Executor VPS

Tentativa de usar VPS como executor parou antes do checkout por Git remote HTTPS sem credencial para fetch naquele processo.

Classificação:

VPS_GIT_REMOTE_AUTH_BLOCKED=true.  
TARGET_TESTED=false.  
PRODUCT_FAILURE=false.

Decisão:

não expandir escopo para mudar auth global; usar SAME-HEAD CI como executor da prova.

## SAME-HEAD CI do HEAD 9397a27...

Na última observação:

SUCCESS:
- Pipeline — Telegram + Painel.

QUEUED:
- grafo-vivo-markdown;
- PR Title Contract;
- porta-de-entrada;
- aprendizado automático;
- lupa-conformance;
- nivel-7-tests;
- PR auto-review;
- Hermes Core Signal Watch.

PENDING:
- Trigger Fabric;
- codex-validate;
- CodeQL.

IN_PROGRESS:
- Lupa Drift Guard.

SAME_HEAD_CI_COMPLETE=false.  
KNOWN_RED_ON_THIS_HEAD=false_AT_LAST_OBSERVATION.  
PROMOTION_ALLOWED=false.

## Aprendizados duráveis acumulados

1. CURRENT > HISTORY.
2. UNKNOWN != PASS.
3. CONNECTED != CONVERGED.
4. SOURCE != RUNTIME.
5. TEST_PASS != PACKAGED_RUNTIME.
6. HTTP_200 != GLOBAL_PASS.
7. DOCUMENTED != EXECUTED.
8. CANONICAL_BUT_UNREACHABLE = CANONICAL_ORPHAN.
9. NEW_TRIGGER_REQUIRES_LEARNING_BINDING.
10. COMMITTED_DIST_MUST_MATCH_REPRODUCIBLE_BUILD.
11. FAILURE_AT_LATER_GATE_CAN_BE_LATENT_DEBT_EXPOSED_BY_PROGRESS.
12. PROVIDER_RATE_LIMIT != PRODUCT_REGRESSION.
13. TOOL_WRAPPER_FAILURE != TARGET_FAILURE.
14. WRONG_CWD_FAILURE != PRODUCT_FAILURE.
15. TOUCH_LEGACY_MONOLITH MAY ACTIVATE WHOLE_FILE_GATES.
16. SECRET_SCANNER MUST DISTINGUISH LITERAL FROM EXECUTABLE_REFERENCE.
17. ONE_WRITER_PER_MUTABLE_SCOPE.
18. PARALLEL_READS_REQUIRE_RENDEZVOUS_BEFORE_MUTATION.
19. PR_MOTHER_RECORDS; CHILD_PR_MUTATES.
20. REALITY_JUDGE_CLOSES_THE_CLAIM.
21. BOUNDARY_NORMALIZATION_MUST_BE_TESTED.
22. AMBIGUOUS_EXTERNAL_IDENTIFIER_MUST_BE_CANONICALIZED_ONCE.
23. WORKTREE_SOURCE != WORKTREE_DEPENDENCIES.
24. EXECUTOR_AUTH_FAILURE != TARGET_FAILURE.
25. TEST_EXECUTOR_CAN_CHANGE_WITHOUT_CHANGING_TARGET.
26. DO_NOT_ADD_LOCAL_COMPLEXITY_WITHOUT_CAPABILITY_GAIN.
27. EVERY_MATERIAL_SEARCH_REQUIRES_MOTHER_RECEIPT.

## Receipts desta fase

- 2026-09-20-BUSCA-01-GITHUB-404-OWNER-DUPLICADO.md
- 2026-09-20-BUSCA-02-GITHUB-TOOLS-SEM-CONTRAPROVA.md
- 2026-09-20-BUSCA-03-GITHUB-TEST-BUILD-PATTERN.md
- 2026-09-20-T1-GITHUB-NORMALIZER-SYNTAX-FAIL.md
- 2026-09-20-T1-GITHUB-NORMALIZER-ENV-MISSING-DEPS.md
- 2026-09-20-T1-CASA-SEM-NODE-MODULES-REUSE-VPS.md
- 2026-09-20-T1-VPS-FETCH-BLOCKED-GIT-AUTH.md
- 2026-09-20-T1-CASA-SEM-DEPS-CI-COMO-EXECUTOR.md
- 2026-09-20-BUSCA-04-CI-HEAD-9397A27.md
- 2026-09-20-CONTABO-SECRET-ROUTE-MICRODEPLOY.md
- 2026-09-20-SNAPSHOT-HIBRIDO-MULTIMONITOR-CASA-VPS.md
- 2026-09-20-ROTA-UNICA-TRAJETORIA-E-APRENDIZADOS.md
- 2026-09-20-ONE-ADMIN-ONE-CONTROL-API-ONE-HEART.md

## Estado de promoção

MAIN_PROMOTED_BY_THIS_SESSION=false.  
VPS_FORCE_SYNC=false.  
RESET_HARD=false.  
FORCE_PUSH=false.

Nenhuma promoção deve ocorrer enquanto SAME-HEAD obrigatório estiver incompleto/vermelho e enquanto Casa/VPS não forem reconciliadas de forma não destrutiva.

## NEXT_CURSOR mestre

HEAD 9397a27 SAME-HEAD CI  
→ cristalizar resultado no #1562  
→ corrigir somente eventual vermelho provado  
→ reconcile/build dist se CI exigir  
→ SAME-HEAD verde  
→ promoção canônica  
→ reconciliar VPS dirty tree sem perda  
→ sincronizar Casa/VPS ao SHA promovido  
→ package/launch Desktop  
→ Omni + Hermes + MCP T1  
→ monitor/workspace discovery runtime  
→ hidratar Contabo pelo secret route existente quando gate permitir  
→ rendezvous GitHub + Casa + VPS + API  
→ Reality Judge  
→ novo snapshot CURRENT no PR-MÃE.

SESSION_CRYSTALLIZED=true.  
ROUTE_SINGLE=true.  
PARALLEL_ARCHITECTURE_CREATED=false.  
GLOBAL_FIXED_POINT=false.
