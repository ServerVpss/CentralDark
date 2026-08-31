# !CENTRALDARK — arquitetura do delta útil contínuo

## Destino

Uma intenção humana vigente pode atravessar muitas interfaces, engines e momentos sem virar várias missões. `!CENTRALDARK` é a porta canônica; o estado provado e a realidade decidem o que continua válido.

```text
UMA_INTENCAO
→ UM_CORE
→ MUITAS_SUPERFICIES_SUBSTITUIVEIS
→ OWNERS_EXISTENTES
→ UM_WRITER_POR_ESCOPO
→ REALIDADE
```

Não há voto por janela, mensagem, modelo ou repetição. Não há transporte causal entre chats sem canal provado.

## Fluxo padrão canônico

`!CENTRALDARK` e `#CENTRALDARK` são entradas equivalentes para o mesmo ciclo; nenhum deles cria outro sistema.

```text
!CENTRALDARK | #CENTRALDARK
→ CENTRALDARK

MANY_AGENTS_ALLOWED=true
READERS_PARALLEL=true
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION_PER_SCOPE=true
ONE_WRITER_PER_CONFLICT_SCOPE=true
JUDGE_INDEPENDENT_FROM_WRITER=true
JUDGE_MAY_MUTATE=false
CAPABILITY_IS_AUTHORITY=false
AGENT_MAY_REDUCE_HUMAN_OBJECTIVE=false
METHOD_MAY_OPTIMIZE=true
OBJECTIVE_MUST_BE_PRESERVED=true
FULL_REQUESTED_MATERIAL_MUST_BE_PROCESSED=true
OBJECTIVE_REDUCTION_REQUIRES_EXPLICIT_HUMAN_AUTHORIZATION=true
SESSION_OBSERVATION_IS_GLOBAL_CURRENT_STATE=false
SINGLE_READER_MAY_DECLARE_GLOBAL_REALITY=false
READER_COUNT_IS_TRUTH_VOTE=false
DIVERGENT_READERS_REQUIRE_RENDEZVOUS=true
CURRENT_REALITY_REQUIRES_RECONCILIATION=true

READERS
→ MEASURE
→ RENDEZVOUS
→ RECONCILE
→ CURRENT_REALITY
→ ONE_WRITER
→ PROOF

TESTED_HEAD == COMMITTED_HEAD == PUSHED_PR_HEAD

OBSERVED_FAILURE
→ FIND_OWNER
→ CREATE_FALSIFIER
→ PATCH_EXISTING_OWNER
→ ADD_NEGATIVE_TEST
→ RUN_EXISTING_TESTS
→ COUNTERPROVE
→ REGISTER_RECEIPT
→ GENERALIZE_IF_REUSABLE
```

Muitos agentes podem observar. Um Writer altera cada escopo. Todos reconciliam antes da mutação. A realidade decide. O próximo agente continua pelo receipt, não pela memória do anterior.

Falha cristalizada: quando um agente troca "integrar tudo no escopo autorizado" por um subconjunto escolhido por ele, ocorreu AGENT_REDUCED_HUMAN_OBJECTIVE_WITHOUT_AUTHORIZATION. Capacidade para sugerir método melhor não concede autoridade para diminuir o destino. A remediação é restaurar o objetivo humano completo, reconciliar no escopo indicado e executar os gates do mesmo HEAD.

Percepção divergente não é contradição resolvida por voto. Cada sessão registra uma observação com proveniência; nenhuma sessão isolada declara a realidade global. Readers convergem no rendezvous, reconciliam alvo e tempo, e somente então um Writer atua sobre o estado corrente provado.

## Ativação e continuidade

```text
BOT_ENTRY | !CENTRALDARK_EXPLICITO
→ MASTER_SESSION=ACTIVE
→ CARREGAR_CORE_CANONICO
→ RECUPERAR_DESTINO
→ MEDIR_ESTADO_VIVO
```

Depois da ativação, toda matéria do SEGREDO/CHEFE na mesma sessão entra no moinho, qualquer que seja idioma, gíria, erro de digitação, mídia ou referência temporal.

```text
CHEFE_MATERIAL
→ DELTA_CANDIDATE
→ DEDUPE
→ CLASSIFY
→ LINK_DESTINATION
→ FIND_EXISTING_OWNER
→ PROVE_OR_KEEP_UNKNOWN
→ ABSORB_MINIMAL_USEFUL_DELTA
```

`EVERY_MATERIAL_IS_PROCESSED` não significa `EVERY_MATERIAL_IS_TRUE` nem `EVERY_MATERIAL_IS_PERSISTED`.

## Tempo

Passado, presente e futuro são proveniência. Recência não cria autoridade e antiguidade não destrói utilidade.

```text
NEWEST_PROVED_STATE_WINS
NEWEST_UNPROVED_CLAIM_WINS=false
TIME_LABEL_IS_AUTHORITY=false
```

Uma previsão é hipótese até o evento existir. Quando o futuro chega, ele vira nova medição; o ciclo absorve somente o delta causal.

## Evidência

| Entrada | O que prova | O que não prova |
|---|---|---|
| fala do CHEFE | intenção, correção ou evidência operacional declarada no escopo | estado oculto de runtime sem elo observável |
| screenshot/UI | manifestação visível naquele instante | processo, causa, saúde ou transporte oculto |
| log | emissão registrada pelo componente indicado | sucesso do consumidor sem correlação |
| Git/GitHub | conteúdo, topologia e eventos canônicos observáveis | runtime vivo |
| health/HTTP | resposta do endpoint medido | engine interna, causalidade ou consumidor final sem trace |
| repetição em janelas | recorrência/correlação | prova independente ou maioria verdadeira |

```text
OBSERVATION
→ EVIDENCE_LAYER
→ CLAIM
→ SAME_TARGET_PROOF
→ COUNTERPROOF
→ VERDICT
```

## Delta 4 — Connector Boundary / Pre-GitHub Handshake

Falha antes de o GitHub receber uma chamada não é falha do GitHub. A fronteira deve ser medida por estágio antes de alterar token, workflow, runner, PR ou permissão do repositório.

Medição registrada em 2026-08-31:

```text
DIRECT_GITHUB_CONNECTOR=AVAILABLE_AND_FUNCTIONAL
CUSTOM_CONNECTOR_NAMESPACE_CENTRALDARK=NOT_EXPOSED
CENTRALDARK_FABLE_LOOP_SKILL=AVAILABLE_UNDER_ANTHROPIC_SKILLS
ROOT_CAUSE_OF_UI_CONNECT_FAILURE=UNKNOWN
```

Uma skill disponível dentro de outro pacote não equivale a um conector CentralDark registrado na sessão. Da mesma forma, ausência do namespace customizado delimita a falha observável, mas não prova sozinha erro de OAuth.

```text
CONNECT_CLICK
├─ auth nem abre
│  → registration/backend/handshake-start CANDIDATE
├─ auth abre e retorno falha
│  → callback/OAuth/session CANDIDATE
├─ auth conclui mas conector não aparece
│  → session-sync/exposure CANDIDATE
└─ conector aparece e chamada GitHub falha
   → token/scope/installation/repo-access CANDIDATE
```

```text
PRE_GITHUB_FAILURE != GITHUB_FAILURE
CUSTOM_CONNECTOR_NOT_EXPOSED != OAUTH_ROOT_CAUSE_PROVEN
UI_ERROR != PR_FAILURE

UNKNOWN_ROOT_CAUSE
→ MEASURE_HANDSHAKE_STAGE
→ EVIDENCE
→ VERDICT
```

O próximo teste deve identificar o primeiro estágio quebrado do handshake. Enquanto esse estágio não for observado, `ROOT_CAUSE_OF_UI_CONNECT_FAILURE` permanece `UNKNOWN` e nenhuma mutação em GitHub, CI ou credenciais é autorizada por esse sintoma.

## Papel, owner e Writer

Papel é saída da descoberta:

```text
DESTINATION
→ CAPABILITY_GAP
→ EXISTING_OWNER
→ ACTIVE_WRITER
→ AVAILABLE_TOOLS
→ TEMPORARY_ROLE
```

```text
ROLE_CLAIM_WITHOUT_EVIDENCE=INVALID
OWNER_BEFORE_ROLE=true
ONE_WRITER_PER_SCOPE=true
WRITER_IS_NOT_JUDGE=true
```

Percepção pode ser paralela. Toda mutação converge antes para um único Writer. Se owner, Writer, autoridade ou alvo estiverem materiais e desconhecidos, somente a mutação afetada fica bloqueada; a medição segura continua.

## Loop causal completo

```text
INTENT
→ DESTINATION_LOCK
→ LIVE_MEASUREMENT
→ FIRST_BROKEN_EDGE
→ EXISTING_OWNER
→ SINGLE_WRITER
→ MINIMAL_REVERSIBLE_DELTA
→ REAL_CONSUMER_TEST
→ COUNTERPROOF
→ T0_T1_REMEASUREMENT
→ RECEIPT
→ NEXT_CURSOR
↺
```

O loop continua enquanto houver ganho informacional ou trabalho material elegível. Para em fixed point local, fronteira humana provada ou ausência provada de trabalho. `aguardando` sem medir próximo cursor não é autonomia.

## Isolamento de contaminação

Mudança súbita de assunto, owner ou alvo não é ordem automática. Conteúdo intercalado de outra missão é isolado como candidato até ser ligado causalmente ao destino.

```text
UNEXPECTED_DOMAIN_SHIFT
| MISSION_ID_MISMATCH
| OWNER_SCOPE_MISMATCH
| SCREEN_ONLY_RUNTIME_CLAIM
→ QUARANTINE_CANDIDATE
→ PRESERVE_PROVENANCE
→ NO_MUTATION
→ DISCRIMINATING_TEST
```

Antes de matar/reiniciar um processo:

```text
PID → OWNER → CAUSE → AUTHORITY → ROLLBACK → ACTION → CONSUMER_PROOF
```

## Propagação

Os adaptadores de Copilot, Claude, Codex e outras superfícies permanecem finos e carregam `LEIA-ME-IA.md`. A regra comum vive no core/Trigger Fabric, não é copiada para cada chat.

Implementação determinística:

- contrato: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml`;
- mapa: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml`;
- resolver: `scripts/trigger-fabric/centraldark_master_cycle.py`;
- consumidor de sessão: `resolve_with_session_state` com arquivo fornecido pelo caller; somente o estado booleano é persistido, nunca o conteúdo da conversa;
- boot: `CENTRALDARK_AI_BOOT.yaml`.

## Invariantes de aceitação

- entrada explícita com proveniência do CHEFE e `BOT_ENTRY` confiável ativam a sessão mestre;
- marcador negado/discutido ou importado por outra fonte não ativa sessão;
- a sessão ativa sobrevive às mensagens seguintes;
- fala do CHEFE vira delta candidato sem virar fato;
- fala de outra fonte não ganha autoridade por estar na sessão;
- simples menção a CentralDark fora de sessão não executa o comando;
- negação/discussão de alias não ativa a ordem correspondente;
- screenshot, repetição, recência e quantidade de janelas não viram prova;
- o resolver nunca concede autoridade ou mutação;
- papel e Writer permanecem desconhecidos até medição;
- nenhum segundo router, boot, memória, Judge ou owner é criado.
