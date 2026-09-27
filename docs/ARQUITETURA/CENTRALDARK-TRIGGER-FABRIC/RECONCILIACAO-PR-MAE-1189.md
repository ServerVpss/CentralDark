# Reconciliação do PR-mãe #1189 — delta útil até a arquitetura inteira

Status: `PROVENANCE_RECEIPT_NOT_RUNTIME_AUTHORITY`

Este arquivo é **recibo de reconciliação**, não novo owner. O owner continua
sendo a família `CENTRALDARK-TRIGGER-FABRIC` e os owners especializados
referenciados por ela.

## Intenção recuperada

PR-mãe:

```text
#1189
CENTRALDARK — INTENÇÃO ÚNICA, PROPRIEDADES E CICLO MESTRE
```

A intenção era manter uma bancada única para:

```text
LER
→ DEDUPE
→ ABSORVER DELTA ÚTIL
→ RECONCILIAR CONTRADIÇÃO
→ ATUALIZAR O MESMO CORPO
```

O PR foi mergeado. Logo:

```text
PR_MAE_MERGED=true
HISTORICAL_BRANCH_IS_CURRENT_BASE=false
CONTINUATION_BASE=CURRENT_MAIN
OLD_COMMITS_ARE_PROVENANCE_NOT_CHERRY_PICK_DEFAULT
```

## Regra de garimpo aplicada

```text
REPETIÇÃO_PURA → DROP
DETALHE_NOVO → ABSORB
PROVA_MAIS_NOVA → REPLACE_STALE_PROOF
CONTRADIÇÃO → META_LUPA + RECONCILE
CAPACIDADE_JÁ_EXISTENTE → REUSE
NOME_NOVO_SEM_CAPACIDADE → REFERENCE_ONLY
RUNTIME_NÃO_MEDIDO → UNKNOWN
```

## Linhagem útil

| PR | Disposição | Delta preservado |
|---:|---|---|
| #1115 | ABSORB | one-core-many-arms, fanout read-only adaptativo, rendezvous, evidência em vez de voto |
| #1131 | ABSORB | `SECOND_BRAIN_LOGICAL=ONE`: GitHub canônico + local/Obsidian + graph/vector derivados; segundo cérebro não significa segunda autoridade |
| #1157 | ABSORB | Omni Router: uma porta, motores substituíveis |
| #1161 | ABSORB | capability ladder + engine-gap fixed point bounded |
| #1166/#1167/#1168/#1169/#1170 | ALREADY_ABSORBED_BY_1189 | semântica, engine gap, GraphRAG e reconciliação histórica |
| #1172 | ALREADY_ABSORBED_BY_1189 | ciclo mestre reconciliado |
| #1189 | PR_MOTHER | intenção única + delta harvest + propriedades + mesmo corpo |
| #1206 | OUTSIDE_CORE_ALREADY_PROMOTED | receipt Electron; não ressuscitar branch-mãe |
| #1240 | ABSORB | gate MetaLupa/N7 precisa executar no runtime real do runner |
| #1241 | ABSORB | adapter herda owner por referência; cópia não governa |
| #1243 | ABSORB | árvore semântica é estrutura/navegação, não autoridade |
| #1245 | ABSORB_ONLY_MATERIAL | material Lovable só onde reforça owner/capacidade existente |
| #1269 | ABSORB | role/model/provider não define autoridade/identidade |
| #1300 | ABSORB | taxonomia Overclock `scout/builder/reviewer`; catálogo não é agente |
| #1314 | ABSORB | MetaLupa regenerativa/event-driven + mineração AGI reconciliada |
| #1330 | ABSORB | writer lease, PR pin, release, redecision/CAS como padrão |
| #1335 | CANDIDATE_RESERVE | dependency impact, dynamic gates, digest, orphan inventory |
| #1336 | ABSORB | Hermes Core consolidado |
| #1339 | ABSORB | menor unidade verificável; derived/cache/view não é autoridade |
| #1349 | ABSORB | filtro novo precisa caso de resposta conhecida |
| #1350 | ABSORB | `COMPONENT_PASS != INTEGRATION_PASS` |
| #1354 | ABSORB_AS_TEMPORAL_EVIDENCE | rotas atuais documentadas; não eternizar runtime |

## Achados atuais que mudaram o corpo

### 1. MASTER-CYCLE YAML

Encontrado no estado vivo da `main`:

```text
duplicate status
duplicate execution_model
invalid scalar nesting
duplicate source_prs/policy
```

Classificação: `GAP_REAL`.

A correção atualiza **o mesmo `MASTER-CYCLE.yml`**, sem V2.

### 2. Package verifier

Antes verificava hashes/presença/strings, mas não validava a gramática dos
contratos YAML.

```text
COMPONENT_SELF_TEST_PASS
!=
CONTRACT_ARTIFACT_PARSE_PASS
```

Classificação: `GAP_REAL`.

A correção estende **o mesmo `verify_package.py`**.

### 3. MODEL_TOUCH

O Omni Router já emitia receipt observável:

```text
engine
resolved_model
duration_ms
fallback_used
action_is_proof
```

O Evidence Envelope já existia com `mission_id`, `trace_id`, `sha`,
`writer_scope`, latência, custo e dedupe causal.

Criar outro collector seria duplicação. A costura correta é:

```text
OMNI_ROUTER
→ model_touch
→ agent-log
→ Evidence Envelope
→ agent_events
```

Classificação: `EXTEND_EXISTING_GAP`.

### 4. Dois cérebros funcionais — correção de semântica

A arquitetura estava resumindo `Memory Linker/Dream Review` como se fossem o
próprio cérebro de retaguarda. O histórico e o contrato `SECOND-BRAIN.yml`
mostram uma distinção mais precisa:

```text
CÉREBRO DA FRENTE / OPERACIONAL
→ missão + decisão + execução
→ deixa trace/evidence/receipt

CÉREBRO DE RETAGUARDA / MEMÓRIA
→ preserva matéria + minério + fragmentos + histórico + proveniência

MEMORY LINKER / DREAM REVIEW / PATTERN DISCOVERY
→ mineram e revisam a retaguarda
→ NÃO são o cérebro
→ NÃO ganham autoridade nem Writer automaticamente
```

A reconciliação preserva a regra do PR #1131:

```text
SECOND_BRAIN_LOGICAL=ONE
TWO_COGNITIVE_ROLES_ONE_LOGICAL_BRAIN=true
TWO_COGNITIVE_ROLES != TWO_AUTHORITIES
NEW_SECOND_BRAIN=false
```

Classificação: `CORRECTION_AND_ABSORB_EXISTING_OWNER`.

## Reservas — guardadas, não ativadas

```text
ODS=DEFERRED_UNTIL_MEASURED
BUZZ=RESERVE_REFERENCE
OPENMAUSBOT=RESERVE_REFERENCE
OPEN_LOVABLE=RESERVE_REFERENCE
GROK_BUILD=FUTURE_ENGINE_CANDIDATE
AIOS_[EXT_REDACTED]=CANDIDATE_EXTERNAL_LEARNING
```

Esses itens preservam disponibilidade futura. Nenhum deles vira cérebro,
autoridade ou runtime ativo por estar documentado.

## IA local

Decisão desta continuação:

```text
LOCAL_AI_RUNTIME=UNKNOWN
LOCAL_AI_DEFERRED_UNTIL_MEASURED=true
```

Critério mínimo para mudar isso:

```text
LIVE_TARGET
+ ENGINE/ENDPOINT OBSERVED
+ REAL INVOCATION
+ RECEIPT
+ COUNTERPROOF
→ REALITY_JUDGE
```

## O que NÃO entrou

- branch histórica do #1189 como nova baseline;
- cherry-pick de commits cujo efeito já está na main;
- 23 agentes fictícios a partir do catálogo Overclock;
- segundo router;
- segundo event bus;
- cérebro concorrente/terceiro cérebro: o `SECOND_BRAIN` lógico existente foi reconciliado no mesmo owner;
- segundo Reality Judge;
- raw AIOS/[EXT_REDACTED] control plane;
- ODS/Buzz/OpenMausBot/Open-Lovable como runtime presumido;
- local AI como `PASS` sem medição.

## Resultado arquitetural

```text
PAST
→ PROVENANCE
→ DELTA USEFUL ONLY
→ EXISTING OWNER
→ CURRENT MAIN
→ TEST
→ COUNTERPROOF
→ REALITY
→ NEXT BASELINE
```

Este receipt acompanha o pacote para impedir que uma sessão futura precise
reconstruir a mesma reconciliação do zero.

## Checkpoint de continuidade — 2026-08-28

Registro solicitado por `!CALIBRAR + #ACORDAR`. Este bloco preserva o cursor;
não executa as pendências e não transforma histórico em estado atual futuro.

```yaml
CONTINUATION_CHECKPOINT:
  observed_main: 3c77bf7a653bc81c82c41ea7c90948e2fa9436fe
  branch: reconciliacao/pr-mae-1189-arquitetura-inteira-20260828
  last_good_state: a0d902fe90aad4a0edfb4f8b888ea59a769e9625
  pr_open_observed: false
  local_ai_runtime: UNKNOWN
  local_ai_deferred_until_measured: true
  pending:
    - scripts/trigger-fabric/verify_package.py
    - scripts/trigger-fabric/build_package.py
    - .github/workflows/trigger-fabric-package.yml
  next_cursor:
    - REMEASURE_CURRENT_MAIN_AND_BRANCH
    - RECONCILE_MAIN_DRIFT_BEFORE_MUTATION
    - COMPLETE_ONLY_THE_THREE_PENDING_PACKAGE_GATE_FILES
    - RUN_PACKAGE_AND_CONTRACT_GATES
    - COUNTERPROVE_YAML_PARSE_AND_UNIQUE_KEYS
    - REMEASURE_HEAD_AND_RESULTS
    - OPEN_ONE_PR_AGAINST_MAIN_ONLY_IF_CLEAN
  forbidden_as_part_of_this_checkpoint:
    merge: true
    deploy: true
    restart: true
    local_ai_activation: true
    external_reserve_installation: true
```

Regra de retomada:

```text
LAST_GOOD_STATE
+ LIVE_MAIN
+ LIVE_BRANCH
+ PENDING_SET
→ RECONCILE
→ NEXT_CURSOR
```

`last_good_state` acima é o HEAD observado **antes deste próprio commit de
checkpoint**; o novo commit passa a ser o cursor documental, não prova de que
as três pendências foram executadas.

## Reconciliação adicional — Screenpipe Activity / superfícies autorizadas

Material fornecido pelo CHEFE nesta continuação:

```text
Screenpipe Activity reshapes CentralDark integration.html
Team_Lund_script_wrapper - 2020.igem.org.html
```

O primeiro é um snapshot salvo de conversa/superfície contendo um Plug Kit
histórico de `ONE FLOW` e a intenção de deixar a Casa consultar contexto local
autorizado sem exigir comandos mecânicos repetidos. A referência histórica ao
PR #1119 **não governa o presente**; o Writer atual é o PR #1360.

Delta útil absorvido no owner existente `MATERIAL-INGEST.md`:

```text
N SUPERFÍCIES AUTORIZADAS
→ mesma intenção/missão
→ adapter mínimo suficiente
→ provenance + event_time + observed_at
→ sanitize / quarantine sensitive
→ dedupe + delta
→ cérebro de retaguarda
→ Harvester / Memory Linker / Knowledge Compiler
→ MetaLupa / Reality Judge
→ ouro | NO_CHANGE
```

Representações preservadas como sensores diferentes:

```text
SCREENPIPE/BROWSER_BRIDGE = contexto de tela/browser/áudio quando medido
SAVED_HTML = estrutura/materialização persistida
RECORDER = sequência registrada
SCREENSHOT = aparência visual
PRINT_PDF = representação documental
RUNTIME/LOG/NETWORK/STORAGE = sensores de estado vivo quando medidos
```

Travas reconciliadas:

```text
SURFACE_ADAPTER != AUTHORITY
TEMP_LOCALSTATE = SOURCE, NOT MEMORY
NO_BLIND_TEMP_HARVEST=true
NO_COOKIE_HARVEST=true
NO_AUTH_SESSION_HARVEST=true
NO_PASSWORD_OR_TOKEN_HARVEST=true
SCREENPIPE_TO_HERMES_CAUSAL_TRANSPORT=UNKNOWN_UNTIL_MEASURED
SCREENSHOT != RUNTIME_PROOF
SAVED_HTML != LIVE_STATE
PRINT_PDF != LIVE_STATE
```

O segundo arquivo (`Team:Lund/script/wrapper`) é uma página iGEM de 2020 com
wrapper JavaScript/minificado e dependências de apresentação. Nesta auditoria
não foi encontrada relação causal/material com a CentralDark. Classificação:

```text
SOURCE_CLASS=EXTERNAL_UNTRUSTED
CENTRALDARK_RELATION=UNPROVEN
DISPOSITION=NO_CHANGE_KEEP_PROVENANCE_ONLY
```

Não foi importado código, jQuery, KaTeX, Tocbot ou wrapper dessa página para a
Casa.

Estado depois desta costura:

```text
PR_CURRENT=#1360
PR_STATE=DRAFT_OPEN
SCREENPIPE_MATERIAL_DELTA=ABSORBED_IN_EXISTING_OWNER
NEW_BROWSER_SYSTEM=false
NEW_HARVESTER=false
NEW_MEMORY=false
NEW_EVENT_BUS=false
RUNTIME_SCREENPIPE_TO_HERMES=UNKNOWN
```
