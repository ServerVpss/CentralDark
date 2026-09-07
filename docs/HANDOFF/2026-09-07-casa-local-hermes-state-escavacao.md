# 🏠 Escavação Casa — Hermes local state / PR-mãe #1444

`MISSION_ID=CASA_HERMES_LOCAL_STATE_EXCAVATION_20260907`

## Intenção do CHEFE

Registrar no PR-mãe #1444 a escavação da Casa local observada nesta passagem, usando `!FABLE_LOOP` a favor da CentralDark:

```text
/GOAL !FABLE_LOOP
→ usar a favor da CentralDark
→ testar antes de promover
→ cristalizar no PR
→ não criar sistema paralelo
→ não perder ouro local
```

## Baseline do PR-mãe

```text
REPO=ServerVpss/CentralDark
PR_MAE=#1444
BRANCH=reconcile/garimpo-one-site-one-mcp-admin-20260906
MAIN_MEDIDA_ANTES=b3de3d82067c9476657d8fff3c6115f05afa079a
PR_ROLE=UMBRELLA_TRACKER_NOT_GLOBAL_WRITER
```

Este arquivo é handoff e receipt de escavação. Não é prova de runtime atual; a prova final depende de execução local do Hermes na Casa.

## Evidência local apresentada pelo CHEFE

### Screenshot 1 — `C:\Users\danda\AppData\Local\hermes`

Observação visual enviada:

```text
C:\Users\danda\AppData\Local\hermes
├── gateway_state.json
├── gateway-starts.log
├── gateway-stderr.log
├── hermes-setup.exe
├── kanban.db
├── kanban.db.dispatch.lock
├── kanban.db.init.lock
├── mission_card_messages.json
├── mission_results.jsonl
├── model-definitions.json
├── models.json
├── models_dev_cache.json
├── ollama_cloud_models_cache.json
├── processes.json
├── projects.db
├── provider_models_cache.json
└── providers.json
```

Leitura técnica:

```text
HERMES_LOCAL_STATE_EXISTS=OBSERVED_FROM_USER_SCREENSHOT
GATEWAY_STATE_PRESENT=OBSERVED
KANBAN_DB_PRESENT=OBSERVED
MISSION_RESULTS_PRESENT=OBSERVED
MODEL_CACHE_PRESENT=OBSERVED
PROVIDERS_PRESENT=OBSERVED
```

Contraprova:

```text
SCREENSHOT != CURRENT_RUNTIME_PROOF
FILE_VISIBLE != FILE_VALIDATED
DB_PRESENT != DB_SCHEMA_VALIDATED
```

### Screenshot 2 — `hermes-agent/apps/desktop/e2e`

Observação visual enviada:

```text
C:\Users\danda\AppData\Local\hermes\hermes-agent\apps\desktop\e2e
├── at-rest-connection-token.spec.ts
├── batch-clarify.spec.ts
├── boot.spec.ts
├── boot-failure.spec.ts
├── bot-mode-row-click-mirrors-registry.spec.ts
├── bot-mode-tab-shows-bot-name.spec.ts
├── bot-roster-user-sections.spec.ts
├── chat.spec.ts
├── context-menu-editables.spec.ts
├── correction-session-switch.spec.ts
├── electron-binary.ts
├── electron-binary.unit.test.ts
├── fix-electron-tracing.ts
├── fixtures.ts
├── fleet-profile-rail.spec.ts
├── glyph-spinner.spec.ts
├── group-to-local-bot-handoff.spec.ts
├── hidden-history-message.spec.ts
├── image-attachment-resume.spec.ts
├── interim-messages.spec.ts
├── large-session-resume.spec.ts
├── launch-packaged-app.spec.ts
├── mock-backend-setup.spec.ts
├── mock-server.ts
├── onboarding.spec.ts
├── queue-turn-boundary.spec.ts
├── real-session-builder.ts
├── right-pane.spec.ts
├── session-compression-and-queue-stop.spec.ts
└── sidebar-states.spec.ts
```

Leitura técnica:

```text
HERMES_DESKTOP_E2E_SUITE_EXISTS=OBSERVED_FROM_USER_SCREENSHOT
BOT_ROSTER_TESTS_PRESENT=OBSERVED
LOCAL_BOT_HANDOFF_TEST_PRESENT=OBSERVED
SESSION_COMPRESSION_TEST_PRESENT=OBSERVED
QUEUE_BOUNDARY_TEST_PRESENT=OBSERVED
PACKAGED_APP_LAUNCH_TEST_PRESENT=OBSERVED
```

Contraprova:

```text
TEST_FILE_VISIBLE != TEST_PASS
E2E_SUITE_PRESENT != DESKTOP_RUNTIME_PROVEN
```

## Evidência de `state.db` anexado

Arquivo recebido nesta passagem:

```text
uploaded_name=state.db
size_bytes=41058304
sha256=3ddca1eae947a718ede0ddc75cc01f1d5e8d83bb73e55d384c9559b169216af0
```

Inspeção segura executada: metadata SQLite, sem despejar mensagens, prompts, tokens, conteúdo de conversa, credenciais ou valores sensíveis.

Objetos observados:

```text
sqlite_objects=64
```

Tabelas e contagens observadas:

```text
async_delegations=0
compression_locks=0
delivery_obligations=0
desktop_session_context_folders=0
desktop_session_continuations=3
desktop_session_local_errors=4
desktop_session_model_overrides=10
gateway_routing=0
messages=2373
messages_fts=2373
messages_fts_content=2373
messages_fts_trigram=2373
session_model_usage=39
sessions=19
state_meta=4
system_prompts=15
```

Campos relevantes observados por schema, sem conteúdo bruto:

```text
sessions:
  - id
  - source
  - session_key
  - model
  - cwd
  - git_branch
  - git_repo_root
  - handoff_state
  - profile_name
  - system_prompt_hash
  - last_activity_at
  - last_activity_description
  - last_activity_provenance

messages:
  - session_id
  - role
  - content
  - tool_calls
  - tool_name
  - reasoning
  - reasoning_content
  - active
  - compacted
  - display_kind
  - display_metadata

desktop_session_model_overrides:
  - session_id
  - provider
  - model
  - base_url

desktop_session_local_errors:
  - session_id
  - user_content
  - error_text
```

Leitura técnica:

```text
HERMES_STATE_DB_SCHEMA_PRESENT=PROVED_BY_SAFE_METADATA_INSPECTION
MESSAGES_INDEX_PRESENT=PROVED_BY_ROW_COUNTS
SESSIONS_PRESENT=PROVED_BY_ROW_COUNTS
MODEL_USAGE_PRESENT=PROVED_BY_ROW_COUNTS
SYSTEM_PROMPTS_PRESENT=PROVED_BY_ROW_COUNTS
LOCAL_ERRORS_PRESENT=PROVED_BY_ROW_COUNTS
```

Contraprova:

```text
DB_SCHEMA_PRESENT != APP_RUNNING
DB_ROWS_PRESENT != DATA_CANONICAL
DB_CONTENT_NOT_EXTRACTED_FOR_SECRET_SAFETY=true
```

## Encaixe canônico na CentralDark

```yaml
casa_excavation:
  owner: PR_1444
  child_lane: local_hermes_state_discovery
  purpose: preservar ouro local sem despejar dado bruto no Git
  mutation_policy: metadata_only_until_local_owner_review

  inputs:
    - screenshots
    - state_db_metadata
    - local_paths_observed

  target_owners:
    hermes_local_state:
      candidate_paths:
        - "C:\\Users\\danda\\AppData\\Local\\hermes"
        - "E:\\CentralDark\\.hermes"
        - "E:\\CentralDark\\runtime"
        - "E:\\CentralDark\\EVIDENCE_ROOT"

    desktop_e2e:
      candidate_owner: "apps/modulos/Bolt/source or hermes desktop owner"
      state: OWNER_REMEASURE_REQUIRED

    kanban:
      candidate_owner: "Casa/Hermes Kanban"
      state: OWNER_REMEASURE_REQUIRED

    model_cache:
      candidate_owner: "Omni Router / provider control"
      state: OWNER_REMEASURE_REQUIRED

  forbidden:
    commit_state_db: true
    dump_messages_to_repo: true
    dump_system_prompts_to_repo: true
    dump_tokens_or_credentials: true
    blind_copy_appdata_to_repo: true
```

## FABLE Loop aplicado

```text
FABLE_LOOP = método de calibração, não router.
```

```text
OBSERVAR:
  Hermes local possui estado, DBs, logs, caches, providers, mission results e suíte e2e observável.

MEDIR:
  state.db foi medido por hash, tamanho, schema e contagens; screenshots foram tratados como evidência observacional.

CONTRAPOR:
  Screenshot e DB presente não provam runtime, pass de teste nem canonicalidade.

APLICAR_DELTA_MINIMO:
  registrar handoff metadata-only no #1444, sem mover segredo e sem inserir DB bruto.

CRISTALIZAR:
  PR #1444 recebe este receipt para Hermes reutilizar na escavação local.
```

## Comando para Hermes continuar na Casa

```text
#ACORDAR
!CALIBRAR
!CENTRALDARK
!FABLE_LOOP
!META_LUPA
!RECONCILIAR
!CONTRAPROVA
!REGISTRA

MISSION_ID=HERMES_CASA_LOCAL_STATE_EXCAVATION_CONTINUE_20260907

OBJECTIVE:
  Reconciliar o estado local Hermes/AppData com a Casa E:\CentralDark e com
  o repo C:\centraldark-repo, sem despejar dados sensíveis no Git e sem criar
  V2/V3.

INPUTS:
  - C:\Users\danda\AppData\Local\hermes
  - C:\Users\danda\AppData\Local\hermes\hermes-agent\apps\desktop\e2e
  - E:\CentralDark
  - E:\CentralDark\_MAPA_CASA
  - C:\centraldark-repo
  - PR #1444
  - PR #1445

RULES:
  NO_SECRET_EXPOSURE=true
  NO_DB_RAW_COMMIT=true
  NO_BROWSER_HISTORY_DUMP=true
  NO_PROMPT_DUMP=true
  MOVE=COPY_HASH_VERIFY_CONSUMER_CHECK_DELETE
  ONE_WRITER_PER_SCOPE=true
  REUSE_BEFORE_CREATE=true
  UNKNOWN_IS_NOT_PASS=true

STEPS:
  1. medir estado vivo do processo Hermes sem imprimir segredo;
  2. medir hashes de gateway_state, kanban, mission_results, providers e caches;
  3. classificar cada arquivo como RUNTIME_STATE | CACHE | LOG | EVIDENCE | SECRET_RISK | DUPLICATE | UNIQUE_GOLD | UNKNOWN;
  4. mapear owner canônico em E:\CentralDark ou C:\centraldark-repo;
  5. mover somente por copy→hash→consumer-check→delete quando seguro;
  6. para state.db, exportar apenas inventário sanitizado, jamais conteúdo bruto;
  7. rodar e2e somente no owner correto do Desktop/Hermes;
  8. registrar POMBO64/receipt com hashes, contagens e decisão;
  9. devolver resultado para PR #1444;
  10. manter UNKNOWN onde runtime/teste não foi medido.

OUTPUT_REQUIRED:
  HERMES_PROCESS_STATE=
  STATE_DB_HASH=
  STATE_DB_SCHEMA_OK=
  APPDATA_FILES_CLASSIFIED=
  E2E_OWNER=
  E2E_TEST_RESULT=
  MOVED_TO_E=
  KEPT_IN_C=
  NOT_TOUCHED_SECRET_RISK=
  RECEIPT=
  NEXT_CURSOR=
```

## Veredito desta escavação

```text
LOCAL_HERMES_FILES_OBSERVED=PROVED_BY_SCREENSHOT
LOCAL_HERMES_STATE_DB_ATTACHED=PROVED_BY_UPLOAD
STATE_DB_METADATA_INSPECTED=PROVED
RAW_DB_CONTENT_EXTRACTED=false
SECRETS_EXPOSED=false
RUNTIME_CURRENT=UNKNOWN
E2E_PASS=UNKNOWN
CANONICAL_OWNER_FINAL=OWNER_REMEASURE_REQUIRED
```

> Baianês + bíblico: a Casa mostrou baú, mapa e livro de registro. Mas baú aberto não é tesouro contado; Hermes agora tem que pesar moeda por moeda, sem jogar segredo na praça e sem chamar sombra de prova.
