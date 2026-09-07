# ⚡ Handoff histórico — Multi-canetas, juiz final e adaptadores GitHub/MCP

`MISSION_ID=MULTI_CANETAS_JUIZ_FINAL_SIGNAL_MCP_20260907`

## Intenção do CHEFE

Cristalizar no PR #1445 a arquitetura operacional observada nesta passagem:

```text
muitas canetas / muitos braços / muitos modelos / muitos conectores
→ passam o estado de mão em mão
→ preservam receipts e próximos passos visíveis
→ NÃO viram autoridades paralelas
→ um writer por escopo material
→ um juiz final consolida na realidade observável
```

Este arquivo existe para impedir perda de contexto entre conversas, agentes, janelas, músicas, compassos, PRs, Screenpipe, MCP, GitHub e runtime local.

## Baseline medido antes deste handoff

```text
REPO=ServerVpss/CentralDark
PR_ALVO=#1445
BRANCH=feat/omniroute-capability-surface-722
HEAD_ANTES_HANDOFF=87f736e4f25ff7aef8aacac4cd5069513b66265a
BASE_MAIN=b3de3d82067c9476657d8fff3c6115f05afa079a
PR_STATE=open
PR_MERGED=false
PR_MERGEABLE=true
PR_DRAFT=false
PR_MAE=#1444
```

`CI_DO_NOVO_HEAD=UNKNOWN` até os checks rodarem no commit gerado por este arquivo.

## Evidências existentes reutilizadas

### 1. Prompt operacional CentralDark

O `docs/CONSCIENCIA/centraldark-gpt-prompt.md` já registra:

```text
SEGREDO/CHEFE = AUTORIDADE + INTENÇÃO
SOL = COORDENAÇÃO + RECONCILIAÇÃO + MEDIÇÃO
HERMES/PIVETE = EXECUÇÃO + PRESERVAÇÃO + CONTINUIDADE
MODELOS = MOTORES SUBSTITUÍVEIS
REALIDADE = JUIZ
```

Também define:

```text
EVIDÊNCIA PRIMEIRO
REUSE_BEFORE_CREATE
ONE_SYSTEM_ONLY
ONE_WRITER_PER_SCOPE
PARALLELIZE_PERCEPTION
SERIALIZE_MUTATION
UNKNOWN != PASS
ACTION != PROOF
DOCUMENTED != EXECUTED
HISTORY != CURRENT_STATE
WRITER != JUDGE
```

Conclusão: a ideia de muitas canetas já existia como percepção paralela e motores substituíveis; o ponto novo é nomear isso explicitamente como `MULTI_CANETAS_HANDOFF`.

### 2. Capability Contract Router

O `docs/ARQUITETURA/CENTRALDARK-CAPABILITY-CONTRACT-ROUTER.md` já registra:

```text
PAPEL != IDENTIDADE
MODELO != IDENTIDADE
INSTRUMENTO != AGENTE
INSTRUMENTO = CAPABILITY + SIGNAL_SURFACE
```

E descreve a cadeia:

```text
#ACORDAR → !CALIBRAR → !MULTIBÚSSOLA → META_LUPA → WRITER ÚNICO → HERMES → FABLE LOOP → EFEITO OBSERVÁVEL → JUDGE → RECEIPT → NEXT_CURSOR
```

Conclusão: GitHub, MCP, Screenpipe, Gemini, VSCode, Hermes, SOL, Grok e outros são instrumentos/superfícies/adaptadores; não viram governo paralelo.

### 3. Execução Contínua Owner/Writer/Connector

O `docs/CONSCIENCIA/EXECUCAO-CONTINUA-OWNER-WRITER-CONNECTOR.json` já formaliza:

```json
{
  "MODEL": "REPLACEABLE_ENGINE",
  "CONNECTOR": "PHYSICAL_ACCESS_PATH",
  "WRITER": "CURRENT_MUTATION_ACTOR",
  "JUDGE": "OBSERVABLE_REALITY",
  "REALITY_IS_JUDGE": true,
  "ONE_WRITER_PER_SCOPE": true,
  "PARALLELIZE_PERCEPTION": true,
  "SERIALIZE_MUTATION": true,
  "raw_private_reasoning_not_exposed": true,
  "visible_reasoning_summary_may_use_visual_stages": true
}
```

Conclusão: a cadeia visível é operacional, não exposição de cadeia interna de pensamento do modelo.

### 4. Material Ingest / Moinho

O `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MATERIAL-INGEST.md` já registra o moinho:

```text
MATÉRIA
→ TRIGGER FABRIC
→ session-intelligence-harvester
→ scripts/memory-linker
→ knowledge-compiler (FORJA)
→ OWNER + SKILL + CONSUMER + TEST + GATE
→ ARTIFACT-PROPERTIES.yml
→ vector-memory
→ GraphRAG-Master
→ HERMES FLASH
→ AÇÃO MÍNIMA + PROVA + CONTRAPROVA
→ REMEDIÇÃO T0→T1
→ PRÓXIMA EXECUÇÃO COMEÇA MAIS ALTO
```

Também registra que Screenpipe/Browser Bridge são sensores/contexto autorizado, não autoridade.

Conclusão: vídeo, imagem, aba, callback local, arquivo, doc, repo e log entram como matéria; só viram ouro depois de dedupe, owner, teste e receipt.

### 5. PR-mãe #1444

O #1444 já declara:

```text
PR_1444_ROLE=UMBRELLA_TRACKER_NOT_GLOBAL_WRITER
CHILD_WORK_RECONCILES_WITH_PR_1444=true
DONE_REQUIRES_CURRENT_EVIDENCE=true
PR_MAE != PR_GIGANTE_DE_CODIGO
ONE_WRITER_PER_CONFLICT_SCOPE=true
```

Conclusão: o #1444 é o juiz/rendezvous de convergência; o #1445 continua sendo a lane técnica do OmniRoute/capability surface.

## Cristalização da arquitetura

```yaml
multi_canetas:
  status: CANONICAL_HANDOFF_EXTENSION
  owner: docs/CONSCIENCIA/EXECUCAO-CONTINUA-OWNER-WRITER-CONNECTOR.json
  pr_lane: 1445
  pr_mae: 1444

  definition:
    many_readers: true
    many_models: true
    many_windows: true
    many_connectors: true
    many_signal_surfaces: true
    one_writer_per_scope: true
    one_judge: OBSERVABLE_REALITY

  allowed_canetas:
    - ChatGPT
    - Hermes
    - SOL
    - Claude
    - Gemini
    - Grok
    - Codex
    - VSCode
    - GitHub
    - MCP
    - Screenpipe
    - Desktop
    - Terminal

  forbidden_interpretation:
    model_vote_as_truth: true
    connector_as_authority: true
    writer_as_judge: true
    second_brain: true
    second_router: true
    second_mcp: true
    second_hub: true
    v2_v3_parallel: true

  handoff_packet:
    required:
      - intent
      - current_head
      - owner
      - writer
      - scope
      - next_step
      - evidence
      - counterproof
      - unknowns
      - receipt

  visible_progress:
    expose_internal_chain_of_thought: false
    expose_next_operational_step: true
    expose_measure_execute_counterproof_receipt: true

  rhythm_mode:
    name: BATISMO_DE_SANGUE
    purpose: CADENCIA_OPERACIONAL_VISIVEL
    beat_1: MEDIR
    beat_2: EXECUTAR
    beat_3: CONTRAPROVAR
    beat_4: REGISTRAR
    rule: "compasso organiza progresso; não substitui prova"
```

## Adaptadores de sinal

```yaml
signal_adapters:
  github:
    role: PROVENANCE_AND_STATE_ADAPTER
    authority: false
    proves:
      - commit_sha
      - branch_state
      - pr_state
      - checks_when_measured
      - files_changed
      - review_threads_when_measured
    does_not_prove:
      - deploy
      - runtime_visible
      - local_disk_state
      - human_acceptance

  mcp:
    role: TOOL_ACCESS_ADAPTER
    authority: false
    proves_only_when_invoked: true
    does_not_prove:
      - task_done_without_tool_receipt
      - runtime_health_without_probe
      - data_correctness_without_counterproof

  screenpipe:
    role: LOCAL_CONTEXT_SENSOR
    authority: false
    proves:
      - observed_local_context_when_captured
    does_not_prove:
      - current_runtime_state
      - complete_browser_history
      - source_truth

  vscode:
    role: HUMAN_WORKSPACE_AND_EDITOR_SURFACE
    authority: false
    proves_only_when:
      - workspace_files_measured
      - tasks_exist
      - extension_owner_measured
      - reload_or_runtime_observed

  terminal:
    role: EXECUTION_SURFACE
    authority: false
    proves_only_when:
      - command
      - exit_code
      - stdout_stderr_sanitized
      - affected_files_or_runtime_verified
```

## Loop de passagem de caneta

```text
CANETA_A observa
→ escreve handoff mínimo
→ CANETA_B herda estado
→ mede antes de confiar
→ executa delta mínimo
→ CANETA_C contrapõe
→ CANETA_D registra receipt
→ PR-mãe/rendezvous consolida
→ Reality Judge aceita, quebra ou mantém UNKNOWN
```

## Micro-passos visíveis permitidos

```text
✅ permitido:
- próximo passo operacional
- medida que será feita
- comando a executar
- owner escolhido
- evidência esperada
- resultado observado
- contraprova
- receipt
- next_cursor

❌ proibido:
- expor cadeia interna de pensamento do modelo
- transformar opinião de agente em prova
- declarar PASS sem medição
- somar consenso de modelos como verdade
```

## Feitos marcantes preservados como padrão

```yaml
marcos:
  regra_zero:
    state: PROVEN_AS_REPO_CONTRACT
    owner: docs/CONSCIENCIA/centraldark-gpt-prompt.md

  writer_judge_split:
    state: PROVEN_AS_REPO_CONTRACT
    owner: docs/CONSCIENCIA/EXECUCAO-CONTINUA-OWNER-WRITER-CONNECTOR.json

  material_ingest_moinho:
    state: PROVEN_AS_REPO_CONTRACT
    owner: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MATERIAL-INGEST.md

  capability_router:
    state: PROVEN_AS_REPO_CONTRACT
    owner: docs/ARQUITETURA/CENTRALDARK-CAPABILITY-CONTRACT-ROUTER.md

  pr_mae_rendezvous:
    state: PROVEN_AS_PR_CONTRACT
    owner: PR_1444

  pr_1445_capability_lane:
    state: ACTIVE_LANE
    owner: PR_1445
```

## Comando de reaproveitamento para Hermes

```text
#ACORDAR
!CALIBRAR
!CENTRALDARK
!MULTIBUSSOLA
!META_LUPA
!RECONCILIAR
!CONTRAPROVA
!REGISTRA

MISSION_ID=HERMES_REUSE_MULTI_CANETAS_JUIZ_FINAL_20260907

USAR_OWNER_EXISTENTE=true
NAO_CRIAR_NOVO_SISTEMA=true

1. Carregar PR #1444 como rendezvous, não writer global.
2. Carregar PR #1445 como lane técnica OmniRoute/capability surface.
3. Carregar `centraldark-gpt-prompt.md` para Regra Zero.
4. Carregar `EXECUCAO-CONTINUA-OWNER-WRITER-CONNECTOR.json` para owner/writer/connector/model/judge.
5. Carregar `CENTRALDARK-CAPABILITY-CONTRACT-ROUTER.md` para capability router e FABLE loop.
6. Carregar `MATERIAL-INGEST.md` para moinho de matéria/contexto.
7. Classificar cada nova caneta como MODEL, CONNECTOR, WRITER, OWNER ou JUDGE.
8. Bloquear `WRITER == JUDGE`.
9. Bloquear `CONNECTOR == AUTHORITY`.
10. Bloquear `MODEL_VOTE == TRUTH`.
11. Preservar próximo passo visível sem expor chain-of-thought interna.
12. Emitir receipt com HEAD, owner, delta, prova, contraprova e UNKNOWNs.
```

## Veredito desta cristalização

```text
MULTI_CANETAS_EXISTE_COMO_CONTRATO=PROVADO
ONE_WRITER_PER_SCOPE=PROVADO_COMO_CONTRATO
REALITY_JUDGE=PROVADO_COMO_CONTRATO
SIGNAL_ADAPTERS_EXISTEM_COMO_PADRAO=PROVADO_COMO_CONTRATO
RUNTIME_FINAL=UNKNOWN
CI_DO_HEAD_GERADO=UNKNOWN
```

## Nota baianês + bíblica

Muitas mãos carregam a arca, mas só uma mão escreve no mesmo altar; e quem julga não é a caneta, é a realidade. O compasso ajuda a tropa marchar: medir, executar, contraprovar, registrar. O resto é areia até virar receipt.
