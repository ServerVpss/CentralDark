# CASA + VPS + KANBAN — handoff por host sem segundo cérebro

**Data:** 2026-09-06  
**Autoridade de intenção:** SEGREDO/CHEFE  
**PR:** #1444  
**Baseline anterior desta rodada:** `main@f60ad71810fb9009bcc1a576d77305d61f9d1add`, `PR_HEAD@3aa9f3b50d4cdced390ffe667e20f09aeffacdec`  
**Natureza:** cristalização de arquitetura operacional + próximo cursor.  
**Este commit não executa deploy, restart, DNS, PM2, Docker, secret ou cutover.**

## 1. Correção de entendimento

A Casa local já é runtime operacional observado. O gap não é "fazer funcionar"; o gap é **não depender exclusivamente da Casa para continuidade**.

```text
CASA_RUNTIME = OPERACIONAL_QUANDO_LIGADA
VPS_RUNTIME = CAPACIDADE_EXISTENTE_A_REMEDIR/COMPLETAR
GAP = REDUNDANCIA + CONTINUIDADE + HANDOFF ENTRE HOSTS
```

A promoção correta não substitui a Casa pela VPS. Ela cria **dois hosts capazes dentro de um só sistema**, com autoridade/estado canônico compartilhado por receipts e GitHub, mas execução local isolada por host.

## 2. Divisão de superfície aprovada pela intenção do CHEFE

```text
HERMES DESKTOP / CASA
├─ chat operacional humano
├─ GitHub
├─ Kanban local
├─ garimpo / arquivos / Screenpipe / browser
├─ desenvolvimento e teste local
└─ coordenação de tarefas da Casa

TERMINAL LATERAL / VPS
├─ ações exclusivas da VPS
├─ runtime de produção
├─ serviços persistentes
├─ health / logs / processos / portas
├─ runner self-hosted quando aplicável
└─ executor Hermes da VPS

GITHUB MAIN
└─ verdade estrutural canônica, receipts e aprendizado promovido
```

Isso não cria dois cérebros:

```text
ONE_SYSTEM_ONLY=true
ONE_CANONICAL_MAIN=true
ONE_INTENT=true
HOSTS=CASA|VPS
HOST_RUNTIME_STATE_IS_LOCAL=true
```

## 3. Kanban: verdade da tarefa, não verdade estrutural do projeto

O Hermes Kanban upstream é single-host por desenho; cada board usa SQLite local e o dispatcher assume PIDs/workspaces do mesmo host. Portanto **Casa e VPS não devem compartilhar o mesmo `kanban.db`**.

```text
CASA_KANBAN_DB != VPS_KANBAN_DB
SHARED_SQLITE_ACROSS_HOSTS = FORBIDDEN
```

A ponte deve transportar envelope/receipt, não o arquivo SQLite:

```text
TASK_ENVELOPE
├─ mission_id
├─ task_key
├─ owner
├─ head_sha
├─ execution_target
├─ capability
├─ evidence_refs
├─ writer_lease
└─ next_cursor
```

Destino:

```text
CASA BOARD
   │
   ├── CentralDark API/MCP / receipt / GitHub canonical state
   │
VPS BOARD
```

`execution_target`:

```text
CASA
VPS
EITHER
BOTH_READONLY
```

Idempotência mínima:

```text
TASK_KEY = MISSION_ID + OWNER + HEAD_SHA + CAPABILITY
```

Se o outro host já produzir receipt compatível:

```text
REUSE_PROOF=true
DO_NOT_REPEAT=true
```

## 4. Lanes do Kanban CentralDark

A integração deve usar o Kanban como control plane visível e preservar papéis:

```text
DEPENDABOT_LANE
= produz atualização candidata / PR de dependência

RABBIT_REVIEW_LANE
= produz finding consultivo

CODEX_REVIEW_LANE
= produz finding consultivo quando disponível

ZENDRIVE_REVIEW_LANE
= fallback consultivo quando Codex estiver indisponível/inutilizável

HERMES_WRITER_LANE
= executa mutação autorizada

DETERMINISTIC_GATES_LANE
= teste/lint/policy/CI

META_LUPA_LANE
= contraprova

RECEIPT_LANE
= cristalização + próximo cursor
```

Regra:

```text
AI_OUTPUT = CANDIDATE_SIGNAL
DETERMINISTIC_ROUTING = REQUIRED
REVIEWER != WRITER
REVIEWER != MERGE_AUTHORITY
DEPENDABOT != SECOND_WRITER
```

## 5. Handoff Casa → VPS sem downtime lógico

Mesmo com autorização do CHEFE para a VPS, a sequência deve preservar last-good-state:

```text
1. MEASURE_CASA_CURRENT
2. SEAL_CASA_LAST_GOOD_RECEIPT
3. MEASURE_VPS_CURRENT
4. SYNC_VPS_TO_APPROVED_MAIN_SHA
5. START_OR_VERIFY_VPS_HERMES_RUNTIME
6. START_OR_VERIFY_VPS_KANBAN_BOARD
7. PROVE_VPS_HEALTH
8. SEND_CANARY_TASK_TO_VPS
9. PROVE_CANARY_RECEIPT
10. TRANSFER_WRITER_LEASE_FOR_VPS_SCOPE
11. CASA_MUTATING_WORKER -> READ_ONLY/STANDBY
12. KEEP_CASA_AVAILABLE_FOR_FAILBACK
13. REMEASURE_BOTH_HOSTS
```

Não parar a Casa antes do receipt do canário VPS:

```text
STOP_CASA_BEFORE_VPS_PROOF = FORBIDDEN
VPS_PROVED_THEN_CASA_STANDBY = REQUIRED
```

Failback:

```text
VPS_FAILS
→ REVOKE_VPS_WRITER_LEASE
→ REUSE_LAST_GOOD_STATE
→ CASA_RESUMES_MUTATION
→ RECORD_RECEIPT
```

## 6. `.ci-housekeeping` e `.gitmodules` — estado medido

### `.ci-housekeeping`

No branch atual, `.ci-housekeeping` **não é um diretório versionado na raiz**. A referência encontrada vive em `.github/workflows/vps-exec-selfhosted.yml`, onde `actions/checkout` usa:

```text
path: .ci-housekeeping
```

Depois o workflow espera:

```text
$GITHUB_WORKSPACE/.ci-housekeeping/scripts/vps/vps-housekeeping-scan.mjs
```

Logo:

```text
CI_HOUSEKEEPING_ROOT_ABSENT_IN_GIT = EXPECTED_POSSIBLE_STATE
CI_HOUSEKEEPING_CHECKOUT_FAILURE = REQUIRES_JOB_LOG
```

Não criar pasta `.ci-housekeeping` manualmente só porque ela não aparece no repo.

### `.gitmodules`

`.gitmodules` existe no branch e declara:

```ini
[submodule "skills/pretty-mermaid"]
    path = skills/pretty-mermaid
    url = https://github.com/imxv/Pretty-mermaid-skills.git
    branch = main
```

Portanto a frase "faltou submodule .gitmodules" só pode virar correção depois de medir o gitlink/checkout exato que falhou.

```text
GITMODULES_FILE_PRESENT=true
SUBMODULE_FAILURE_CAUSE=UNKNOWN_UNTIL_EXACT_JOB_LOG
NO_BLIND_GITMODULES_EDIT=true
```

## 7. Relação com o workflow VPS existente

`.github/workflows/vps-exec-selfhosted.yml` já é owner de deploy canônico do MCP e inclui lock, validação de SHA, build isolado, rollback, PM2 e health. Ele deve ser **reutilizado/estendido**, não substituído por workflow V2/V3.

O novo plano não autoriza duplicar esse owner.

```text
VPS_DEPLOY_OWNER=.github/workflows/vps-exec-selfhosted.yml
EXTEND_DONT_REPLACE=true
NO_PARALLEL_DEPLOY_WORKFLOW=true
```

## 8. Critério para dizer "VPS assumiu"

```text
VPS_CHECKOUT_SHA = APPROVED_MAIN_SHA
VPS_HERMES_PROCESS = ONLINE
VPS_KANBAN_BOARD = HEALTHY
VPS_DISPATCHER = HEALTHY
VPS_CANARY_TASK = COMPLETED
VPS_CANARY_RECEIPT = VALID
VPS_WRITER_LEASE = ACTIVE_FOR_VPS_SCOPE
CASA_WRITER_LEASE = RELEASED_OR_READ_ONLY
DUPLICATE_MUTATION = 0
FAILBACK = PROVED
```

Se qualquer item estiver ausente:

```text
VPS_HANDOFF = EVIDENCIA_FALTANTE
```

## 9. Próximo cursor

```text
!CENTRALDARK
→ MEASURE_EXACT_PR_1444_HEAD_AND_CHECKS
→ INSPECT_CI_HOUSEKEEPING_FAILURE_LOG_IF_ANY
→ INSPECT_SUBMODULE_GITLINK_IF_ANY
→ MEASURE_CASA_HERMES_KANBAN
→ MEASURE_VPS_HERMES_RUNTIME
→ MEASURE_VPS_KANBAN
→ CREATE_OR_REUSE_HOST_TASK_ENVELOPE_BRIDGE
→ VPS_CANARY
→ WRITER_LEASE_HANDOFF
→ CASA_READ_ONLY_STANDBY
→ CONTRAPROVA
→ RECEIPT
→ FIXED_POINT_OR_NEXT_CURSOR
```

## 10. Regra final

```text
HERMES_DESKTOP = CASA_CONTROL_SURFACE
VPS_TERMINAL = VPS_OPERATION_SURFACE
GITHUB_MAIN = STRUCTURAL_SOURCE_OF_TRUTH
KANBAN_PER_HOST = OPERATIONAL_TASK_LIFECYCLE
CENTRALDARK = ONE_SYSTEM_BRIDGING_HOSTS
```

A Casa não desaparece quando a VPS entra. A VPS remove a dependência de a Casa estar ligada para o trabalho persistente continuar.