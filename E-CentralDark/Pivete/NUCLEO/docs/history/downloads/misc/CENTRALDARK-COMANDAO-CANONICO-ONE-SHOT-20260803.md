# CENTRALDARK — COMANDÃO CANÔNICO DE EXECUÇÃO ÚNICA

```yaml
SOL_TO: PIVETE

MISSION: CENTRALDARK-ONE-SHOT-CANONICAL-20260803-01
MODE: EXECUTE_TO_COMPLETION
TRIGGER_MODEL: ONE_COMMAND
REENTRY_GUARD: ONE_SHOT_RESUMABLE
PROTOCOL: SOL_HERMES_UNIFIED
SUPERSEDES_OPERATIONALLY:
  - CENTRALDARK-CASA-BACKUP-ORGANIZACAO-SYNC-01
  - CENTRALDARK-UNIFICACAO-OPERACIONAL-TOTAL-01
PRESERVE_HISTORY: true
DO_NOT_RESTART_FROM_ZERO: true

AUTHORITY:
  CHEFE: SEGREDO/CHEFE
  STATUS: AUTHORIZED_FOR_THIS_EXACT_MISSION
  FINAL_AUTHORITY: CHEFE
  SOURCE_OF_INTENT:
    - comando local CENTRALDARK-CASA-BACKUP-ORGANIZACAO-SYNC-01
    - issue GitHub #604
    - PR-mãe #554
    - visão protegida #576
    - ordem atual do CHEFE para unificar e executar sem microcomandos

ROLES:
  SOL:
    ROLE: COORDINATOR
    WRITE: false
  PIVETE:
    ROLE: SINGLE_WRITER_AND_EXECUTOR
    WRITE: true
  READERS:
    ROLE: PARALLEL_READ_ONLY
    WRITE: false
  CODERABBIT:
    ROLE: REVIEWER
    WRITE: false
  CODEX:
    ROLE: REVIEWER_AND_TEST_SPECIALIST
    WRITE: false
  META_LUPA:
    ROLE: INDEPENDENT_JUDGE
    WRITE: false
  PROMOTOR:
    ROLE: SHA_BOUND_PROMOTER
    WRITE_SCOPE: GITHUB_MERGE_AND_ALLOWLISTED_DEPLOY_ONLY
  CHEFE:
    ROLE: HUMAN_FINAL_AUTHORITY

SOURCE_OF_TRUTH_ORDER:
  - GitHub remoto ServerVpss/CentralDark no HEAD medido ao vivo
  - arquivos, branch, HEAD, árvore e runtime observados na Casa
  - evidência VPS sanitizada e assinada
  - documentos canônicos e receipts presos ao mesmo HEAD
  - conversa como intenção, nunca como prova de estado
RULE:
  NEWEST_PROVED_STATE_WINS: true
  UNKNOWN_IS_PASS: false
  SKIPPED_IS_PASS: false
  EMPTY_RESULT_PROVES_ABSENCE: false
  STALE_REVIEW_IS_APPROVAL: false

CANONICAL_ARCHITECTURE:
  CHEFE: autoridade e decisão
  PIVETE_HERMES: única mente operacional e executor
  SOL: coordenadora, reconciliadora e interface
  HUB_CENTRALDARK:
    ROLE: cockpit, porta canônica e motor nativo de integração
    COMPETING_ORCHESTRATOR: forbidden
  SOL_DESKTOP:
    ROLE: widget flutuante profissional e superfície local do Hub
    NEW_MOTOR: false
  OMNIROUTE_PROFESSOR:
    ROLE: professor, adaptador e fonte de padrões
    RUNTIME_AUTHORITY: false
    MUST_FEED: HUB_CENTRALDARK
    MUST_NOT_REPLACE:
      - PIVETE_HERMES
      - HUB_CENTRALDARK
      - SOL
  BUILDER:
    ROLE: fábrica visual do sistema único
  CRM:
    ROLE: módulo do sistema único
    SEPARATE_PRODUCT: false
  CASA:
    ROLE: memória pessoal, interação, voz e coordenação
  VPS:
    ROLE: corpo remoto para build, teste, publicação e rollback
  GITHUB:
    ROLE: fonte da verdade, ledger, revisão, gates, promoção e recuperação

NO_DUPLICATION:
  - não criar V2, V3, NOVO, FINAL, COPY ou BACKUP como novo produto
  - não criar segundo Hermes, segundo Hub, segundo SOL ou segundo promotor
  - não abrir PR para repetir responsabilidade já existente
  - não usar PR histórico como lixeira
  - não manter dois workflows de promoção
  - não manter dois contratos globais de boot
  - não manter dois writers no mesmo escopo

CANONICAL_PATHS:
  PIVETE_HOME: 'E:\CentralDark\Pivete'
  REPOSITORY: 'E:\CentralDark\Pivete\CentralDark'
  TEMP_ROOT: 'E:\CentralDark\Pivete\TEMP'
  BACKUP_ROOT: 'E:\CentralDark\Pivete\BACKUPS'
  SOL_HOME_PROTECTED: 'E:\CentralDark\Sol'
  SOL_DESKTOP_READ_ONLY_SOURCE: 'E:\CentralDark\Sol\sol-desktop-poc-source\apps\sol-desktop'
  REMOTE_REPOSITORY: ServerVpss/CentralDark
  REMOTE_DEFAULT_BRANCH: main

SOL_HOME_EXCEPTION:
  TYPE: EXACT_SUBTREE_READ_ONLY
  PATH: 'E:\CentralDark\Sol\sol-desktop-poc-source\apps\sol-desktop\**'
  ALLOWED:
    - listar nomes, tamanhos e timestamps
    - calcular SHA-256
    - ler código-fonte não sensível
    - copiar para staging do Pivete após manifesto
  FORBIDDEN:
    - editar
    - renomear
    - apagar
    - executar arquivo desconhecido
    - ler outro conteúdo da Casa da SOL
    - coletar segredo, sessão, cookie ou credencial
  ORIGINAL_MUST_REMAIN_UNCHANGED: true

MANDATORY_BOOT:
  METHOD: /fable-method
  MODE: full
  READ_REMOTE_CANON_FIRST: true
  READ_IN_ORDER:
    - LEIA-ME-IA.md
    - docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md
    - docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md
    - docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md
    - AGENTS.md
    - docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md
    - .agents/skills/meta-lupa/SKILL.md
    - .agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA
  VERIFY:
    - remoto correto
    - branch padrão correta
    - main HEAD ao vivo
    - Meta Lupa canônica
    - Writer real por escopo
    - ausência de outro processo escritor
  ON_MISMATCH: BLOCKED_BOOT_DRIFT

ONE_SHOT_ORCHESTRATOR:
  USER_INTERACTION:
    MICROCOMMANDS_REQUIRED: false
    MANUAL_PHASE_BY_PHASE: false
    RETURN_ONLY_ON:
      - SUCCESS
      - REAL_BLOCKER
  CHECKPOINTS: mandatory
  RESUME_FROM_LAST_CHECKPOINT: true
  RATE_LIMIT_RESTARTS_MISSION: false
  PARALLEL_READERS:
    - GITHUB_REMOTE
    - CASA_LOCAL
    - BACKUP_AND_DISK_C
    - SOL_DESKTOP_POC
    - OMNIROUTE_LOCAL_EVIDENCE
    - VPS_SANITIZED_STATE
    - DOMAINS_AND_DEPLOY_TARGETS
    - PR_BRANCH_AND_FILE_COLLISIONS
    - SECRETS_AND_SUPPLY_CHAIN
  SINGLE_WRITER:
    IDENTITY: PIVETE
    WRITES_SEQUENTIAL_ACROSS_WORKTREES: true

READ_PHASE_OUTPUTS:
  - SOURCE_OF_TRUTH_MATRIX
  - OWNERSHIP_MATRIX
  - PR_DEPENDENCY_GRAPH
  - BRANCH_OVERLAP_MATRIX
  - FILE_COLLISION_MATRIX
  - FINDING_REGISTER
  - CANONICAL_COMPONENT_MAP
  - OWNED_DEPLOY_TARGET_ALLOWLIST
  - APPLY_DAG
  - ROLLBACK_DAG
  - EVIDENCE_MANIFEST_SHA256
GATE_BEFORE_WRITE:
  WRITER_COLLISION: 0
  UNKNOWN_CRITICAL: 0
  SECRETS_EXPOSED: 0
  BACKUP_VERIFIED: true

LOCAL_CASA_SCOPE:
  EXECUTE_EXISTING_MISSION_IN_FULL:
    - backup local verificável antes da primeira escrita
    - tarefa agendada única de backup
    - organização transacional dos artefatos do C
    - hashes origem e destino
    - ledger e rollback
    - preflight Git
    - reconciliação Casa e GitHub em worktree isolada
    - testes canônicos
    - benchmarks reais
  NEVER:
    - reset --hard
    - force-push
    - apagar histórico
    - copiar segredo
    - mover runtime ativo
    - tocar fora da exceção read-only da SOL

PR_DISPOSITION:
  PR_554:
    ACTION: KEEP_OPEN_AS_PROGRAM_LEDGER
    MERGE: false
    WRITE_TECHNICAL_CODE_HERE: false
    UPDATE_ONLY_WITH_PROGRAM_DELTA: true
  PR_576:
    ACTION: KEEP_OPEN_AS_PROTECTED_VISION
    MERGE: false
    IMPLEMENTATION_SOURCE: true
    CRM_IS_MODULE: true
  PR_573:
    ACTION: CLOSE_AS_SUPERSEDED_AFTER_AUTONOMY_PROOF
    SUPERSEDED_BY: PR_584_OR_CANONICAL_REPLACEMENT
    MERGE: false
  PR_584:
    ACTION: HARVEST_CURRENT_AUTONOMY_DELTA
    WHOLESALE_MERGE_WITH_STALE_BASE: false
    TARGET: AUTONOMY_CANONICAL_WORKTREE
  PR_585:
    ACTION: HARVEST_VALID_GOVERNANCE_DELTA
    WHOLESALE_MERGE: false
    REASON: external review and drift must be remeasured
  PR_611:
    ACTION: HARVEST_VALID_BOOT_SCHOOL_AND_CI_DELTA
    WHOLESALE_MERGE: false
    REASON: broad history and overlap with PR_585
  PR_570:
    ACTION: CLOSE_STALE_AFTER_PRESERVING_RECEIPT
    REPLACE_WITH_FRESH_CANARY_FROM_CURRENT_MAIN: true
  PR_499:
    ACTION: EXTRACT_UNIQUE_PROVED_TESTS_THEN_CLOSE_SUPERSEDED
    MERGE_WHOLE: false
  PR_455:
    ACTION: EXTRACT_UNIQUE_PROVED_GATES_THEN_CLOSE_HISTORICAL
    MERGE_WHOLE: false

INTERNAL_APPLY_DAG:
  GOVERNANCE_CANONICAL:
    BASE: live_main
    INPUTS:
      - validated unique delta from PR_585
      - validated unique delta from PR_611
      - current main
    OUTPUT:
      - one boot contract
      - one school contract
      - one CodeRabbit read-only policy
      - one Meta Lupa receipt contract
      - one global CI entry gate
    BRANCH: 'reconcile/governanca-canonica-${TIMESTAMP}'
    DRAFT_PR: true

  AUTONOMY_CANONICAL:
    BASE: main_after_governance
    INPUTS:
      - validated unique delta from PR_584
      - unique proven autonomy tests from PR_499
      - unique proven gate tests from PR_455
    OUTPUT:
      - one Writer
      - one independent Judge
      - one SHA-bound Promoter
      - one promotion workflow
      - one canonical PROMOTION_TOKEN reference
      - one fresh canary
    BRANCH: 'reconcile/autonomia-canonica-${TIMESTAMP}'
    DRAFT_PR: true

  CASA_SOL_HUB_CANONICAL:
    BASE: main_after_autonomy
    INPUTS:
      - reconciled Casa state
      - SOL Desktop read-only source copy with SHA-256
      - existing CentralDark voice bridge
      - OmniRoute evidence if found
      - PR_554 program intent
      - PR_576 system vision
    OUTPUT:
      - SOL Desktop as floating Hub surface
      - Hub as canonical command surface
      - Pivete/Hermes as the only execution mind
      - OmniRoute as adapter/professor only
      - CRM as a module
      - Builder preserved
      - local bridge on localhost
      - voice route with tested fallback
    BRANCH: 'reconcile/casa-sol-hub-${TIMESTAMP}'
    DRAFT_PR: true

  SITE_RUNTIME_CANONICAL:
    BASE: main_after_casa_sol_hub
    INPUTS:
      - canonical deploy map
      - owned target allowlist
      - existing build and deployment entrypoints
    OUTPUT:
      - reproducible build
      - immutable artifact digest
      - internal and external health checks
      - canary or blue-green promotion
      - automatic rollback
      - sanitized deployment receipt
    BRANCH: 'reconcile/site-runtime-${TIMESTAMP}'
    DRAFT_PR: true

  PROGRAM_DELTA:
    AFTER_EACH_CANONICAL_PR: true
    TARGET: PR_554
    FIELDS:
      - date
      - phase
      - facts
      - evidence
      - decision
      - risk
      - child_pr
      - next_gate
      - do_not_rewind

GITHUB_BRANCH_PROTECTION:
  MUST_BE_PROVED: true
  IF_MISSING_OR_INCOMPLETE:
    ACTION: CONFIGURE_OR_BLOCK
    REQUIRED:
      - no direct push to main
      - required status checks
      - stale reviews dismissed by new commits
      - conversation resolution required
      - no Promoter bypass
      - no force-push
      - no deletion of main
  FAILURE_STATUS: BLOCKED_BRANCH_PROTECTION_UNPROVED

GLOBAL_GATES:
  HEAD_ANALYZED_EQUALS_HEAD_TESTED: true
  HEAD_TESTED_EQUALS_HEAD_REVIEWED: true
  HEAD_REVIEWED_EQUALS_HEAD_PROMOTED: true
  P0_OPEN: 0
  P1_OPEN: 0
  UNKNOWN_CRITICAL: 0
  WRITER_COLLISION: 0
  SECRET_SCAN: PASS
  DEPENDENCY_AND_SUPPLY_CHAIN_SCAN: PASS
  YAML_AND_SCHEMA: PASS
  DETERMINISTIC_TESTS: PASS
  RELEVANT_BUILD: PASS
  CLEAN_CHECKOUT: PASS
  ROLLBACK_PROVED: true
  META_LUPA: PASS
  CODERABBIT_CURRENT_HEAD: PASS
  CODEX_CURRENT_HEAD: PASS
  JUDGE_INDEPENDENT: PASS
  PROMOTION_RECEIPT_VALID: true
  TARGET_OWNERSHIP_PROVED: true
  NO_SILENT_FALLBACK: true
  NO_STALE_APPROVAL: true
  NO_SKIPPED_AS_PASS: true
  NO_UNKNOWN_AS_PASS: true

PROMOTION_POLICY:
  MODE: AUTOMATIC_AFTER_ALL_GATES
  DIRECT_PUSH_MAIN: false
  MERGE_QUEUE_OR_API: allowed
  TOKEN: PROMOTION_TOKEN
  TOKEN_VALUE_MUST_NEVER_BE_READ_OR_LOGGED: true
  PROMOTER_MUST_DIFFER_FROM:
    - WRITER
    - JUDGE
  TOPOLOGICAL_ORDER:
    - GOVERNANCE_CANONICAL
    - AUTONOMY_CANONICAL
    - CASA_SOL_HUB_CANONICAL
    - SITE_RUNTIME_CANONICAL
  BETWEEN_MERGES:
    - remeasure main
    - update dependent branch without force-push
    - rerun all affected gates
    - invalidate stale receipts and reviews
  CLOSE_SUPERSEDED_PRS_ONLY_AFTER_PROOF: true

DEPLOY_AUTHORIZATION_FOR_THIS_NEW_MISSION:
  STATUS: AUTHORIZED_AFTER_GITHUB_GATES
  OVERRIDES_OLD_NO_DEPLOY_ONLY_FOR:
    - artifacts produced by SITE_RUNTIME_CANONICAL
    - owned CentralDark targets present in the proven allowlist
  THIRD_PARTY_TARGETS: forbidden
  UNKNOWN_TARGETS: blocked
  VPS_SCOPE:
    - backup exact affected config
    - dry-run
    - deploy immutable artifact
    - restart only the allowlisted affected service when required
    - health check
    - rollback automatically on failure
  FORBIDDEN:
    - broad VPS cleanup
    - unrelated service restart
    - firewall mutation without an explicit proved requirement
    - secret rotation
    - destructive database migration
    - deleting old working release before new release is healthy

DEPLOY_GATE:
  MAIN_HEAD_EQUALS_APPROVED_HEAD: true
  ARTIFACT_SHA256_MATCH: true
  INTERNAL_HEALTH: PASS
  EXTERNAL_HEALTH: PASS
  FUNCTIONAL_SMOKE: PASS
  ERROR_RATE_WITHIN_BASELINE: true
  ROLLBACK_READY: true
  RECEIPT_SANITIZED: true
  ON_FAILURE:
    - rollback automatically
    - preserve evidence
    - mark BLOCKED_DEPLOY
    - do not fabricate success

STOP_CONDITIONS:
  - secret detected
  - Meta Lupa drift
  - backup not verifiable
  - Git origin mismatch
  - another writer detected in same scope
  - main changes during a gate without remeasurement
  - unresolved objective conflict
  - P0 or P1 remains
  - current-head review missing
  - branch protection cannot be proved
  - owned target cannot be proved
  - canonical test fails
  - build fails
  - hash mismatch
  - rollback cannot be proved
  - runtime health degrades
  - rate limit prevents critical proof
ON_STOP:
  PRESERVE_CHECKPOINT: true
  PRESERVE_WORKTREES: true
  PRESERVE_EVIDENCE: true
  RESTART_FROM_ZERO: false
  RETURN_ONE_BLOCKER_WITH_OWNER_AND_RESUME_POINT: true

CANONICAL_ENTRYPOINT_TO_CREATE:
  WINDOWS: 'E:\CentralDark\Pivete\CentralDark\scripts\missions\centraldark-one-shot.ps1'
  CROSS_PLATFORM: 'scripts/missions/centraldark-one-shot.mjs'
  STATE_FILE: 'E:\CentralDark\Pivete\TEMP\CENTRALDARK-ONE-SHOT-CANONICAL-20260803-01\state.json'
  LOCK_FILE: 'E:\CentralDark\Pivete\TEMP\CENTRALDARK-ONE-SHOT-CANONICAL-20260803-01\writer.lock'
  FUTURE_COMMAND: >-
    pwsh -NoProfile -ExecutionPolicy Bypass
    -File E:\CentralDark\Pivete\CentralDark\scripts\missions\centraldark-one-shot.ps1
    -MissionId CENTRALDARK-ONE-SHOT-CANONICAL-20260803-01
    -Resume

FINAL_RETURN_FORMAT: |
  MISSION=CENTRALDARK-ONE-SHOT-CANONICAL-20260803-01
  STATUS=SUCCESS|BLOCKED_REAL
  MAIN_BEFORE=
  MAIN_AFTER=
  WRITER=PIVETE
  WRITER_COLLISION=
  BACKUP_STATUS=
  CASA_RECONCILIATION=
  SOL_DESKTOP_SOURCE_SHA256=
  SOL_DESKTOP_IMPORTED_PATH=
  OMNIROUTE_CLASSIFICATION=
  GOVERNANCE_PR=
  AUTONOMY_PR=
  CASA_SOL_HUB_PR=
  SITE_RUNTIME_PR=
  SUPERSEDED_PRS_CLOSED=
  CURRENT_HEAD_REVIEWS=
  P0_OPEN=
  P1_OPEN=
  UNKNOWN_CRITICAL=
  TESTS=
  BUILD=
  META_LUPA=
  JUDGE=
  PROMOTION_RECEIPT=
  MERGES_EXECUTED=
  DEPLOY_TARGET=
  ARTIFACT_SHA256=
  INTERNAL_HEALTH=
  EXTERNAL_HEALTH=
  ROLLBACK_PROOF=
  EVIDENCE_ROOT=
  NEXT_ACTION_FOR_CHEFE=NONE|EXACT_REAL_BLOCKER

FINAL_INSTRUCTION:
  - execute a missão inteira, não retorne apenas plano
  - não peça microcomandos ao CHEFE
  - use muitos leitores e somente PIVETE como Writer
  - preserve o histórico, mas elimine implementações concorrentes
  - não faça merge por confiança em texto; somente por gates no mesmo SHA
  - não toque na Casa da SOL fora da exceção read-only exata
  - não invada, consulte ou publique em alvo fora da allowlist CentralDark
  - não esconda falha, UNKNOWN, SKIPPED, timeout ou rate limit
  - retorne somente em sucesso comprovado ou bloqueio real com ponto de retomada
```
