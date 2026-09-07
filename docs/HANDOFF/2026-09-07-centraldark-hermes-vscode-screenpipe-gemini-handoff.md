# 🧭 Handoff histórico — Hermes VSCode + Screenpipe + Gemini + Casa

`MISSION_ID=HERMES_VSCODE_CENTRALDARK_AUTO_CONFIG_20260907`

## Intenção do CHEFE

Registrar no próprio PR #1445 o delta operacional desta sessão: CentralDark deve usar a arquitetura já cristalizada como lane oficial e configurar Hermes/VSCode/Desktop/Screenpipe/Gemini/Casa sem criar V1/V2/V3, sem duplicar router, hub, API, MCP, brain ou app.

Este handoff é obrigatório para evitar que o contexto fique só na conversa.

## Baseline medido antes deste handoff

```text
PR=#1445
BRANCH=feat/omniroute-capability-surface-722
HEAD_ANTES_HANDOFF=24c37357ea6af66b045099fd8975b1615d0fd6c6
BASE_MAIN=b3de3d82067c9476657d8fff3c6115f05afa079a
STATE=open
MERGED=false
MERGEABLE=true
DRAFT=false
```

Após este commit, o novo HEAD deve ser remedirdo. `CI_DO_NOVO_HEAD=UNKNOWN` até nova execução.

## Regra zero operacional

```text
CHEFE_INTENT
→ !CENTRALDARK
→ DESTINATION_LOCK
→ MEASURE_LIVE_STATE
→ VERIFY_ALIGNMENT
→ SEARCH_EXISTING_MATERIAL
→ RESOLVE_CANONICAL_OWNER
→ EXECUTE_MINIMAL_DELTA
→ EVIDENCE
→ COUNTERPROOF
→ REALITY_JUDGE
→ CONTINUE / FIX / HUMAN_FRONTIER
```

Invariantes:

```text
ONE_SYSTEM_ONLY=true
ONE_CORE=true
ONE_API=true
ONE_MCP=true
ONE_ROUTER=true
ONE_ADMIN_PANEL=true
REUSE_BEFORE_CREATE=true
ONE_WRITER_PER_SCOPE=true
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION=true
UNKNOWN != PASS
DOCUMENTED != EXECUTED
CONFIGURED != INVOCATION_PROVEN
ACTION != PROOF
HISTORICAL != CURRENT
REALITY = JUDGE
```

## Owners já existentes que devem ser reutilizados

```yaml
owners:
  vscode_provider:
    path: apps/modulos/HERMES-CORE/extensions/hermes-vscode-router-provider
    role: VSCode + Hermes Router + Git Intelligence
    policy: REUSE_OWNER

  desktop:
    path: apps/modulos/Bolt/source
    role: CentralDark Desktop / Electron / SOL / Hermes por baixo
    policy: REUSE_OWNER

  desktop_installer:
    path: scripts/windows/build-centraldark-installer.ps1
    role: build Windows installer
    policy: REUSE_OWNER

  screenpipe:
    role: sensor/contexto autorizado local
    policy: SENSOR_NOT_AUTHORITY

  trigger_fabric:
    role: eventos, cron, webhook, material ingest
    policy: REUSE_OWNER

  omni_router:
    role: provider/model/capability router
    policy: ONE_ROUTER_OWNER

  crystallized_architecture:
    path: docs/ARQUITETURA/CENTRALDARK-CRYSTALLIZED-PLUG-PLAY.yml
    role: contrato Plug & Play da sessão
    policy: REUSE_AS_CONTRACT
```

## Ideias novas classificadas contra o legado

```yaml
new_inputs:
  batismo_de_sangue:
    classification: CADENCIA_OPERACIONAL_VISIVEL
    meaning: "ritmo de execução em 4/4: medir, executar, contraprovar, registrar"
    chain_of_thought_visible: false
    operational_progress_visible: true

  vscode_github_auth_callback:
    classification: LOCAL_OAUTH_CALLBACK
    persistence_policy: DO_NOT_COMMIT_RAW_URL
    proof_status: AUTH_FLOW_HINT_NOT_FULL_CONFIG_PROOF

  signed_oaiusercontent_url:
    classification: TEMPORARY_SIGNED_FILE_URL
    persistence_policy: DO_NOT_COMMIT_RAW_URL
    action: baixar/localizar material, hashear, classificar e salvar no owner correto se útil

  google_gemini_gemini_cli:
    classification: CANDIDATE_ENGINE_ADAPTER
    role: terminal agent / MCP client-server candidate
    authority: false
    policy: ADAPTER_ONLY_NOT_NEW_BRAIN

  gemkick_corpus:
    classification: OWNER_DISCOVERY_REQUIRED
    action: procurar em E:, C:, Screenpipe, BRAIN, Drive, issues, PRs e branches antes de criar
```

## Topologia local desejada

```yaml
storage:
  C_fast_runtime:
    path: C:\centraldark-repo
    purpose:
      - clone limpo do repo canônico
      - build
      - lint
      - test
      - preview local
      - worktree rápida do VSCode
    rule: EXECUTION_FAST_ONLY

  E_house:
    path: E:\CentralDark
    purpose:
      - BRAIN
      - MAPA_CASA
      - backups
      - downloads
      - sources
      - packages
      - logs preserváveis
      - Screenpipe relevante
      - modelos/cache pesado
      - evidências
      - arquivos históricos
    rule: PERSISTENT_HOUSE

  temp_c:
    path: C:\tmp
    rule: COPY_VERIFY_DELETE_NOT_BLIND_CUT
```

Protocolar limpeza/migração:

```text
inventariar
→ hashear origem
→ classificar owner/destino
→ copiar para E:\CentralDark quando for ouro/dado persistente
→ hashear destino
→ comparar bytes/hash
→ validar consumidor
→ marcar reconciliado
→ só então apagar origem
```

## Auto-configuração VSCode esperada

Criar ou reconciliar, sempre com backup/hash antes de replace:

```text
.vscode/settings.json
.vscode/tasks.json
.vscode/launch.json
.vscode/extensions.json
.vscode/centraldark.workspace.json
.vscode/centraldark.routes.json
.vscode/centraldark.terminals.json
.vscode/centraldark.buttons.json
.vscode/centraldark.receipts.json
```

Rotas/caminhos esperados:

```text
centraldark.houseRoot=E:\CentralDark
centraldark.fastRuntimeRoot=C:\centraldark-repo
centraldark.defaultRepo=ServerVpss/CentralDark
centraldark.prLane=1445
centraldark.routerSurface=/roteador
centraldark.apiSurface=/api
centraldark.mcpSurface=/mcp
centraldark.adminSurface=/admin
centraldark.cockpitSurface=/cockpit
centraldark.roomsSurface=/rooms
centraldark.voiceSurface=/voice
centraldark.maintenanceSurface=/maintenance
```

Terminais oficiais a materializar no VSCode:

```text
CENTRALDARK_ROOT  -> C:\centraldark-repo
HOUSE_E           -> E:\CentralDark
HERMES            -> C:\centraldark-repo
SOL_DESKTOP       -> C:\centraldark-repo\apps\modulos\Bolt\source
ROUTER            -> C:\centraldark-repo
SCREENPIPE        -> E:\CentralDark\screenpipe
DOCKER            -> C:\centraldark-repo
GEMINI_CLI        -> C:\centraldark-repo  # CANDIDATE_UNTIL_PROVEN
```

## Botões/casos de uso esperados

```yaml
buttons:
  "⚡ #ACORDAR": medir estado vivo
  "🧭 !CENTRALDARK": carregar contrato canônico + PR #1445
  "🔎 !CALIBRAR": comparar intenção/main/PR/casa/runtime
  "🧠 !META_LUPA": detectar contradição/falso-verde
  "🧪 CONTRAPROVA": rodar teste mínimo do cone causal
  "📜 RECEIPT": salvar receipt com sha/owner/resultado
  "🐝 BUZZ / SALAS": abrir visão de setores
  "🎙 SOL / VOZ": abrir widget voz/texto/missão
  "🔥 FORJA": manutenção gamificada e endurecimento
  "🧹 LIMPAR C: SEGURO": inventário/hash/copy/verify/delete
  "⛏ GARIMPO": fonte → pepita → owner existente
  "🐦 POMBO64": pacote/manifest/sha/linhagem
```

## Cadência “Batismo de Sangue”

```yaml
rhythm_mode:
  style: DEEP_HOUSE_OPERATIONAL
  bpm_reference: 124
  time_signature: "4/4"
  beat_1: "◇ MEDIR"
  beat_2: "⚙ EXECUTAR"
  beat_3: "⚖ CONTRAPROVAR"
  beat_4: "📜 REGISTRAR"
  internal_chain_of_thought_visible: false
  visible_operational_progress: true
```

Baianês bíblico técnico: tambor não é prova, mas dá marcha. A batida organiza o agente para não atravessar o rio sem medir a ponte.

## 10 frentes de execução

```yaml
fronts:
  01_repo_main_pr: main, PR #1445, HEAD, workflows, checks, branches
  02_vscode: provider Hermes, tasks, launch, settings, buttons, workspace
  03_desktop_exe: centraldark-desktop, Electron, installer, SOL widget
  04_router_api_mcp: Omni Router, API, MCP, providers, Gemini adapter
  05_screenpipe_browser: Browser Bridge, páginas relevantes, contexto local
  06_storage_c_e: C:\tmp, C:\centraldark-repo, E:\CentralDark, AppData, Pivete
  07_brain_drive_docs: BRAIN, Ouro, docs, pendências, aprendizados, Drive se disponível
  08_forja_manutencao: locks, backup, restore, POMBO64, manutenção gamificada
  09_security: tokens, env, ssh, certificados, host-creds, OAuth callbacks
  10_final_judge: receipts, contraprova, fixed point, UNKNOWN preservado
```

## Falhas CI relevantes vistas no HEAD anterior

Não declarar verde global. Havia checks verdes, mas também falhas no HEAD `24c37357...`:

```text
Trigger Fabric Full Package = failure
lupa-conformance = failure
porta-de-entrada = failure
```

Falha cirúrgica principal aberta nos logs:

```text
test_master_chain_remains_single_and_fable_is_supporting_method
esperava: default_routing: false
encontrou: default_routing: true
```

Correção alvo:

```text
FABLE_LOOP = método de calibração/leitura
FABLE_LOOP != router
FABLE_LOOP != agente principal
FABLE_LOOP.default_routing=false
```

## Saída obrigatória do Hermes

```text
PROVADO:
QUEBRADO:
EVIDENCIA_FALTANTE:
UNKNOWN:
HEAD_MAIN:
HEAD_PR_1445:
C_FAST_REPO_STATE:
E_HOUSE_STATE:
VSCODE_STATE:
DESKTOP_STATE:
SCREENPIPE_STATE:
GEMINI_CLI_STATE:
GEMKICK_CORPUS_STATE:
FILES_MOVED:
FILES_PRESERVED:
FILES_NOT_TOUCHED_WITH_REASON:
SECRETS_DETECTED_WITHOUT_EXPOSURE:
POMBO64_FINAL:
NEXT_CURSOR:
```

## Stop condition

```text
STOP quando:
- C:\centraldark-repo existe, está medido e é o workspace rápido correto;
- E:\CentralDark está classificado como Casa persistente;
- C:\tmp foi inventariado antes de qualquer limpeza;
- VSCode tem tasks/botões/settings reconciliados por owner existente;
- centraldark-desktop permanece owner do app, sem segundo app;
- Screenpipe é sensor, não autoridade;
- Gemini CLI é adapter candidato, não cérebro novo;
- FABLE default_routing=false ou blocker exato registrado;
- novo HEAD/CI/remedição retornam PROVADO, QUEBRADO ou UNKNOWN explícito.
```
