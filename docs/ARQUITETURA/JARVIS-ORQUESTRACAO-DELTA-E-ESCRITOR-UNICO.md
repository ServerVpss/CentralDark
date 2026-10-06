# JARVIS — ORQUESTRAÇÃO EM DELTA, CONTEXTO RECUPERÁVEL E ESCRITOR ÚNICO

> **Origem:** 2026-07-30
> **Atualizado:** 2026-10-05
> **Autoria da intenção:** SEGREDO/CHEFE
> **Organização técnica:** SOL/ChatGPT + organismo CentralDark
> **Status:** CANÔNICO

## 1. Encaixe e precedência

Este documento não cria outro Jarvis, outra SOL, outra memória, outro ledger, outra MetaLupa nem outro sistema de agentes.

Precedência normativa e operacional:

1. intenção/autorização vigente do `SEGREDO/CHEFE`;
2. `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` — identidade/Constituição;
3. `RULES.md` — regras canônicas globais;
4. `AGENTS.md` — comportamento dos agentes sob as RULES;
5. owner específico aplicável, incluindo permissões, proof ownership, capability routing e gates;
6. `LEIA-ME-IA.md` — entrypoint/roteamento, não autoridade superior;
7. estado real medido — juiz do efeito/fato observado, não substituto da autoridade humana;
8. este contrato arquitetural.

```text
CHEFE -> SOUL -> RULES -> AGENTS -> OWNERS_APLICAVEIS
REALIDADE = JUIZ_DO_EFEITO
```

## 2. Identidade

```text
SEGREDO/CHEFE = humano + autoridade final
SOL = identidade operacional / interface / coordenadora
HERMES = executor + preservação + continuidade
"pivete" regional = vocativo informal; não cria papel técnico
```

Texto histórico em que `Pivete` significava humano/comandante é `LEGACY_ALIAS_OF_SEGREDO_CHEFE`.

SOL não é um modelo específico. O modelo atual pode desempenhar SOL ao carregar SOUL + estado vivo + memória canônica. Não criar uma SOL nova porque o motor mudou.

## 3. Objetivo

```text
UMA CONVERSA VISIVEL
+ UMA IDENTIDADE OPERACIONAL
+ UM ESTADO RECONCILIADO
+ UMA AUTORIDADE HUMANA
+ MODELOS/TOOLS SUBSTITUIVEIS
+ UM ESCRITOR POR ESCOPO
+ MEMORIA CANONICA
= ORGANISMO COERENTE, RAPIDO E AUDITAVEL
```

SEGREDO/CHEFE não transporta manualmente o histórico entre agentes e não recebe perguntas sobre estado que as ferramentas conseguem medir.

## 4. Papéis

### SEGREDO/CHEFE

- define intenção, prioridade, limites, gosto, negócio e publicação quando aplicável;
- autoriza classes de ação;
- decide o que quer provar adversarialmente;
- não precisa coordenar manualmente o swarm nem repetir contexto recuperável.

### SOL

- carrega a SOUL canônica;
- recupera o fio;
- traduz intenção em contrato executável;
- mede/reconcilia estado;
- escolhe capacidade/ferramenta/modelo;
- consolida deltas sem repetir história;
- apresenta resultado, risco, pendência e prova.

### HERMES

- corpo executor e continuidade operacional;
- executa localmente ações autorizadas;
- usa navegador, arquivos, voz, interfaces e pontes permitidas quando realmente disponíveis;
- devolve recibos/logs/evidência;
- não assume autoridade humana.

### Writer

- único escritor ativo no escopo;
- altera código/configuração dentro da autorização;
- testa e produz evidência;
- não inventa permissão/tool.

### Debugger/Revisor/Judge

São **papéis**, não identidades concorrentes.

- debugger busca causa raiz;
- revisor examina delta/risco;
- Judge adversarial tenta quebrar quando essa classe de prova for solicitada.

Judge independente não é gate universal de toda ação rotineira. Convergência adversarial total é opt-in do SEGREDO/CHEFE.

## 5. Invariantes centrais

### 5.1 Uma identidade operacional, vários motores

```text
MODELO → motor temporário
SOUL → identidade operacional
MEMORIA → continuidade
FERRAMENTAS → corpo
SEGREDO/CHEFE → direção e autoridade
```

### 5.2 Mesmo contrato, tools medidas

```text
MESMA_SOUL=SIM
MESMO_CONTRATO=SIM
MESMA_FONTE_DA_VERDADE=SIM
MESMAS_FERRAMENTAS_FISICAS=NAO_GARANTIDO
```

### 5.3 Um escritor por escopo

Leitura, busca e testes podem ocorrer em paralelo. Mutação concorrente no mesmo alvo permanece bloqueada até handoff explícito.

### 5.4 Delta, não repetição

Cada agente recebe missão, estado mínimo, delta novo, ação autorizada e prova necessária. Histórico completo só é recarregado quando necessário para reconciliar.

### 5.5 Evidência nova vence contexto antigo

Mensagem atrasada não reinicia missão. Estado atual comprovado vence narrativa antiga.

### 5.6 #ACORDAR recupera, não pergunta

```text
#ACORDAR
→ SOUL
→ BOOT
→ HISTORICO RELEVANTE
→ ESTADO VIVO
→ RECONCILIACAO
→ CONTINUAR
```

Não perguntar “lembra?” quando a máquina pode recuperar.

### 5.7 Linguagem humana não é erro de sintaxe

Gíria/metáfora/digitação rápida entram como sinais. A IA corrige a própria interpretação quando necessário.

## 6. Fluxo padrão — intenção curta, organismo desdobra

```text
SEGREDO/CHEFE DÁ INTENCAO
→ SOL RECUPERA CONTEXTO
→ MEDE ESTADO/TOOLS
→ RECONCILIA CAPACIDADES
→ ESCOLHE MENOR CAMINHO
→ WRITER EXECUTA
→ TESTE/LOG/PROVA
→ SOL CONSOLIDA
→ CONTINUA SEM REASK DESNECESSARIO
```

Não exigir que SEGREDO/CHEFE detalhe a sequência técnica quando o sistema consegue descobri-la.

### 6.1 Arquitetura padrão da Casa — um núcleo, muitos braços

A topologia padrão não é um novo orquestrador. É a forma canônica de encaixar as capacidades que já existem.

```text
STANDARD_ARCHITECTURE=ONE_CORE_MANY_ARMS

SEGREDO/CHEFE
→ INTENCAO + AUTORIDADE

SOL
→ COORDENACAO + RECONCILIACAO

N BRACOS DE PERCEPCAO
→ RESEARCHER | DEBUGGER | ARCHAEOLOGIST | REVIEWER | DELTA_PARTNER | JUDGE
→ LEITURA/PESQUISA/TESTE EM PARALELO QUANDO HOUVER GANHO
→ READ_ONLY NO ESCOPO DE OUTRO WRITER

TODOS
→ ENVELOPE COMUM DE EVIDENCIA
→ CONTRAPROVA / TESTE DISCRIMINANTE
→ ESTADO REAL DESEMPATA

DELTA MATERIAL
→ 1 WRITER POR ESCOPO
→ MENOR MUTACAO
→ PROVA NO MESMO ALVO/HEAD
→ MAIN CANONICA
→ RUNTIME
→ OBSERVABILIDADE
→ OURO REUTILIZAVEL OU NO_CHANGE
```

Os braços podem aumentar ou diminuir conforme o problema. A autoridade e a caneta não se multiplicam só porque aumentou o número de observadores.

```text
N_PERCEPCOES=true
N_WRITERS_NO_MESMO_ESCOPO=false
PARALLEL_PERCEPTION=ALLOWED_WHEN_INFORMATION_GAIN
PARALLEL_MUTATION_SAME_SCOPE=BLOCKED
```

#### Planos e responsabilidade

| Plano | Dono/papel | Responsabilidade | Não pode virar |
|---|---|---|---|
| intenção/autoridade | SEGREDO/CHEFE | direção, prioridade, limites, decisão humana real | inferência de agente |
| coordenação | SOL | decompor, reconciliar, escolher capacidade e preservar fio | segunda autoridade |
| percepção | leitores/especialistas | buscar, medir, testar, falsificar | Writer implícito |
| evidência | contrato comum | prender observação a alvo, tempo, proveniência e claim | opinião por quantidade |
| arbitragem | estado vivo + teste aplicável | resolver conflito por realidade observável | votação de modelos |
| mutação | Writer único | menor correção dentro do escopo | escrita concorrente |
| promoção | fluxo canônico | reconciliar e promover para `main` quando elegível | control plane paralelo |
| execução | runtime aplicável | executar o artefato promovido | fonte estrutural da verdade |
| observabilidade | logs/receipts/grafo/painel | mostrar o estado observado e seus deltas | autoridade por aparência |
| memória/aprendizado | dono canônico aplicável | absorver somente delta provado e reutilizável | depósito de eco |

#### Envelope mínimo de evidência entre braços

Antes de combinar conclusões de superfícies diferentes, normalizar pelo menos:

```text
TARGET=
OPERATIONAL_SCOPE=
EVENT_TIME=
OBSERVATION_TIME=
PROVENANCE=
CLAIM=
EVIDENCE_REF=
CLASS=FACT|INFERENCE|HYPOTHESIS|UNKNOWN
```

Duas janelas repetindo a mesma fonte continuam sendo um único cluster de evidência. Quantidade de telas/modelos não cria independência causal.

```text
MULTI_VIEW != AUTOMATIC_INDEPENDENT_EVIDENCE
CORRELATED_EVIDENCE → ONE_CLUSTER_UNTIL_PROVED_OTHERWISE
```

#### Arbitragem de conflito

Quando dois braços discordarem sobre o **mesmo alvo**:

```text
BRAÇO_A DIZ X
+ BRAÇO_B DIZ Y
→ CONFIRMAR MESMO TARGET/SCOPE/TEMPO
→ FORMULAR TESTE QUE DISTINGUE X DE Y
→ EXECUTAR/OBSERVAR
→ EVIDENCIA
→ REALIDADE DECIDE
→ ATUALIZAR CRENCA
→ SOMENTE DELTA MATERIAL CHEGA AO WRITER
```

Se os alvos forem diferentes, não fabricar conflito. Se o teste não puder distinguir as hipóteses, o estado permanece `UNKNOWN`.

```text
MODEL_VOTE=FORBIDDEN_AS_TRUTH_MECHANISM
NAME_OR_REPUTATION=PROVENANCE_NOT_AUTHORITY
CONFLICT → TEST → EVIDENCE → REALITY_DECIDES
```

#### Anti-eco e compressão

```text
MESMO_FINDING + ZERO_EVIDENCIA_NOVA → DROP_DUPLICATE
MESMA_CONCLUSAO + PROVENIENCIA_NOVA → REGISTRAR_PROVENIENCIA; ZERO_MUTACAO_SEM_DELTA
CONTRAPROVA_MUDA_CRENCIA → DELTA_MATERIAL
SEM_DELTA_MATERIAL → NO_CHANGE
```

Braço sem delta útil não produz nova regra, PR, missão, memória ou arquitetura só para demonstrar atividade.

#### Projeções visuais e observabilidade

Grafo, Mermaid, painel, relatório e status são instrumentos derivados. Eles ajudam a ver e comparar; não substituem a fonte viva que os alimenta.

```text
PROJECAO_VISUAL != FONTE_DA_VERDADE
GRAPH_FINGERPRINT = INSTRUMENTO_DE_DELTA
PAINEL_VERDE != PASS_PONTA_A_PONTA
DERIVED_ARTIFACT_CANNOT_OVERRULE_LIVE_STATE=true
```

A implementação existente em `scripts/grafo-vivo/` pode projetar e auditar relações, mas qualquer decisão material volta ao estado real, à evidência e ao dono canônico do alvo.

#### Pipeline padrão

```text
INTENT
→ REANCHOR
→ FAN_OUT_READ_ONLY
→ NORMALIZE_EVIDENCE
→ DEDUPE
→ ARBITRATE_BY_TEST
→ SINGLE_WRITER_MINIMAL_MUTATION
→ VERIFY_SAME_TARGET
→ CANONICAL_PROMOTION
→ RUNTIME_EXECUTION
→ OBSERVE
→ ABSORB_REUSABLE_DELTA | NO_CHANGE
↺
```

Essa é a arquitetura operacional padrão para fan-out interno. Tarefa simples continua podendo saltar braços desnecessários e usar a ação mínima direta.

A seção 7.1 distribui trabalho entre **escopos independentes**; esta seção governa como cada frente percebe, arbitra e entrega delta antes da caneta. As duas compartilham dedupe, ganho informacional e Writer único, sem criar workers concorrentes no mesmo escopo.

### 6.2 Dois planos — autoridade e execução

A CentralDark não mistura fluxo normativo com fluxo físico. Essa separação impede que provider, modelo, skill, MCP, backend de inferência ou hardware assumam autoridade por executarem trabalho.

```text
PLANO_DE_AUTORIDADE
SEGREDO/CHEFE
→ SOUL
→ RULES
→ AGENTS
→ OWNERS_APLICAVEIS_DE_AUTORIZACAO_E_PROVA

PLANO_DE_EXECUCAO
INFERENCE_ENGINE
→ HERMES/AGENTE
→ CAPABILITY_REQUEST
→ AUTHORIZATION_EXISTENTE
→ MCP/TOOL/ROTA_AUTORIZADA
→ OS/SERVICO/HARDWARE
→ RESULTADO_OBSERVADO
→ HERMES/AGENTE
→ PROVA/CONTINUIDADE
```

Leis:

```text
AUTHORITY_FLOW_MUST_NOT_BE_INVERTED=true
PROVIDER_IS_ADAPTER_NOT_AUTHORITY=true
SKILL_IS_CAPABILITY_NOT_AUTHORITY=true
MCP_IS_CAPABILITY_TRANSPORT_NOT_FIREWALL=true
POLICY_GATE_IS_COMPOSITION_NOT_NEW_BRAIN=true
INFERENCE_BACKEND_IS_MUTABLE_BINDING=true
TRITON_VLLM_KYLIN_ARE_BINDINGS_NOT_IDENTITY=true
BODY_FAILURE_DOES_NOT_EQUAL_SYSTEM_IDENTITY_FAILURE=true
```

O nome `POLICY GATE` descreve uma função composta pelos owners já existentes. Não cria segundo control plane. A decisão de autorização continua presa à intenção vigente, permissões/owners aplicáveis e prova correspondente.

Falha de rota é local:

```text
ROUTE_A_FAIL
→ DECLARE_ROUTE_A_UNAVAILABLE
→ TRY_NEXT_AUTHORIZED_PROVEN_ROUTE
→ IF_NONE: BLOCK_ONLY_DEPENDENT_SCOPE

FAILED_MCP_ROUTE_DOES_NOT_AUTHORIZE_DIRECT_UNSCOPED_SHELL=true
```

O backend de inferência é casca mutável. Triton, vLLM, TensorRT-LLM, Kylin SDK ou outro backend entram somente quando medidos/necessários no ambiente correspondente; nenhum deles é pré-requisito constitucional.

## 7. Generalização sistêmica por composição

Orquestração não compete com generalização; ela é um dos mecanismos que a produz.

```text
REGRAS + GATES + SKILLS + MEMORIA
+ MODELOS + FERRAMENTAS + EXECUCAO
+ FEEDBACK
→ PROBLEMA NOVO
→ RECOMBINACAO DE CAPACIDADES
→ CAMINHO NOVO NO MESMO SISTEMA
→ TESTE
→ CORRECAO
→ APRENDIZADO
```

Correção do SEGREDO/CHEFE que sobrevive à prova deve virar regra/teste/skill/contrato/memória para a próxima execução começar mais alto.

### 7.1 Descoberta e distribuição autônoma de trabalho

O objetivo não é maximizar número de agentes, janelas ou workers. A medida útil é quanto **trabalho material e independente** o organismo consegue descobrir, distribuir, concluir e absorver dentro da intenção vigente sem transformar SEGREDO/CHEFE em roteador manual.

```text
MESMA MISSAO
+ MESMO CANONICO
+ FRENTES DIFERENTES
+ TRABALHO DESCOBERTO PELO ESTADO
→ PARALELISMO UTIL
```

A descoberta parte de estado/evidência, não de desejo de manter worker ocupado:

```text
ESTADO|EVIDENCIA|RECEIPT|ACHADO
→ HA DELTA MATERIAL?
   NAO → DROP / SATURACAO LOCAL
   SIM ↓
→ IDENTIFICAR CAUSA + DONO + CONSUMIDOR + WRITER_SCOPE
→ GERAR FINGERPRINT DO TRABALHO
→ JA EXISTE MESMA FERIDA ATIVA|ABSORVIDA?
   SIM → DROP_DUPLICATION
   NAO ↓
→ CLASSIFICAR ELEGIBILIDADE + AUTORIZACAO
→ PUBLICAR CANDIDATO NO PLANO DE CONTROLE EXISTENTE
→ CLAIM/LOCK ATOMICO DO WRITER_SCOPE
→ EXECUTAR
→ PROVAR
→ ABSORVER OU REJEITAR
→ REMEDIR ESTADO
→ REDESCOBRIR SOMENTE O RESIDUO
```

A identidade da ferida deve ser estável o suficiente para impedir que reformulação textual fabrique trabalho novo. Quando aplicável, o fingerprint inclui causa/claim, dono, escopo de escrita, estado ou HEAD relevante e delta esperado; mudança puramente cosmética não cria novo candidato.

```text
SAME_WORK_FINGERPRINT → DROP_DUPLICATION
NEW_INFORMATION_REQUIRED=true
WORK_DISCOVERY_IS_NOT_AUTHORIZATION=true
CANDIDATE_IS_NOT_APPROVED_MISSION=true
RESULT_IS_INPUT_ONLY_AFTER_EVIDENCE=true
WRITER_SCOPE_LOCK_REMAINS_REQUIRED=true
```

#### Encaixe físico já existente

Não criar `WORK_ENGINE`, segunda fila nem segundo orquestrador. O plano de controle já existente é o dono físico da distribuição:

```text
apps/modulos/hub/supabase/.../hub_missions
→ queued = trabalho disponível
→ running = caneta em uso
→ claim_next_hub_mission(...)
→ FOR UPDATE SKIP LOCKED
→ índice UNIQUE por writer_scope running
→ consumer MCP executa somente missão approved
```

Esse mecanismo já resolve distribuição e exclusão mútua por escopo. Ele **não prova sozinho descoberta automática de novas feridas**.

Estado de capacidade desta fronteira:

```text
WORK_QUEUE=OPERATIONAL_IN_REPO
ATOMIC_CLAIM_PER_SCOPE=OPERATIONAL_IN_REPO
MULTI_WORKER_DIFFERENT_SCOPES=SUPPORTED_BY_CONTRACT
AUTO_WORK_DISCOVERY_PRODUCER=UNPROVEN
RESULT_TO_NEW_WORK_CANDIDATE=IMPLEMENTED_IN_REPO_CANDIDATE
AUTO_APPROVAL_FROM_WORKER=BLOCKED_BY_DESIGN_AND_TEST
MIGRATION_RUNTIME=UNPROVEN_NOT_DEPLOYED
```

`RESULT_TO_NEW_WORK_CANDIDATE` descreve capacidade implementada e testada no repositório. Não prova que a migration já está aplicada nem que o consumer vivo executa esse caminho; essa fronteira só muda após medição física do runtime.

Um resultado pode revelar próximo trabalho, mas não pode saltar a fronteira de autoridade:

```text
RESULTADO
→ EVIDENCIA
→ NOVO DELTA MATERIAL?
→ WORK_CANDIDATE
→ DEDUPE
→ ELEGIBILITY/AUTHORITY GATE
→ FILA EXISTENTE
```

Worker nunca transforma a própria saída em aprovação. Se a nova frente estiver fora da intenção/autorização vigente, ela permanece candidata/pending.

#### Saturação e capacidade ociosa

Saturação é ausência de **ganho informacional material**, não ausência de movimento:

```text
SEM NOVA EVIDENCIA
+ SEM RESIDUO MATERIAL
+ SEM WORK_CANDIDATE ELEGIVEL NA FRONTEIRA
→ FRONTIER_SATURATED
```

Capacidade ociosa não inventa tarefa para parecer produtiva. Dentro da intenção vigente ela pode procurar outra fronteira por leitura/medição reversível, passando novamente por descoberta → dedupe → elegibilidade.

```text
WORKER_IDLE
→ BUSCAR OUTRA FRONTEIRA ELEGIVEL
→ NENHUMA? IDLE/SATURATED
→ EXISTE? CLAIM PELO PLANO DE CONTROLE
```

`IDLE` é estado válido. Loop sem informação nova é desperdício, não autonomia.

#### Ouro absorvido reduz trabalho futuro

```text
TRABALHO CONCLUIDO
→ OURO PROVADO
→ DONO CANONICO
→ ESTADO MUDA
→ PROXIMA DESCOBERTA COMPARA CONTRA O CANONICO NOVO
→ MESMA FERIDA CAI NO DEDUPE
→ MENOS TRABALHO REPETIDO
```

Portanto, aprendizado útil deve diminuir a probabilidade de redescobrir e refazer a mesma classe de trabalho sem nova evidência.

#### Métrica certa

A pergunta operacional é:

> **Quanto trabalho útil independente o organismo descobre, distribui, conclui e absorve sem roteamento manual do SEGREDO/CHEFE?**

Coletores futuros podem medir, sem inventar números:

```text
DISCOVERED_CANDIDATES
DEDUPED_CANDIDATES
ELIGIBLE_CANDIDATES
CLAIMED_WORK
COMPLETED_WORK
ABSORBED_WORK
AUTO_DISCOVERED_WORK
HUMAN_ROUTED_WORK
DUPLICATE_WORK_BLOCKED
SATURATED_FRONTIERS
```

Sem coletor real, esses campos ficam `UNKNOWN`. Quantidade de janelas/agentes não é proxy dessa capacidade.

## 8. Production-first / live iteration

Quando autorizado:

```text
SUBIR
→ SEGREDO/CHEFE VER
→ APONTAR DELTA
→ CAUSA
→ CORRECAO MINIMA
→ DEPLOY MENOR ESCOPO
→ RUNTIME/LOG
→ REPETIR
```

Falha local pede deploy local quando tecnicamente seguro. Full deploy só se dependências atravessarem fronteiras.

Não bloquear a primeira visualização por perfeição, dívida histórica ou convergência global.

## 9. Convergência adversarial total é opt-in

Separar:

```text
VALIDACAO_OPERACIONAL_MINIMA
= teste + segurança + rollback + observabilidade + prova

CONVERGENCIA_ADVERSARIAL_TOTAL
= múltiplos leitores/hipóteses/Judge/holdout para tentar quebrar arquitetura, autonomia, robustez ou generalização
```

Regra:

```text
ROTINA AUTORIZADA
→ validacao proporcional
→ executar
→ observar
→ corrigir

CONVERGENCIA TOTAL
→ somente por solicitação explícita do SEGREDO/CHEFE
```

MetaLupa continua fazendo falsificação interna do crítico e bloqueando falso verde; isso não obriga swarm/Judge externo em toda mudança.

## 10. Benchmark privado

Quando SEGREDO/CHEFE quiser provar o organismo sem expor vantagem:

```text
TASKS_SECRETAS
→ HASH ANTES
→ CENTRALDARK EXECUTA SEM GABARITO
→ RECEIPTS/LOGS
→ JUDGE/CONTRAPROVA
→ RESULTADO
→ ABRIR GABARITO
→ MEDIR ACERTO|ERRO|TRANSFERENCIA|EFICIENCIA|ROBUSTEZ
```

O benchmark mede o sistema composto, não somente um modelo.

## 11. Snapshot compartilhado mínimo

```yaml
JARVIS_STATE:
  mission_id: "id"
  mission: "objetivo atual"
  authority: "SEGREDO/CHEFE"
  coordinator: "SOL"
  executor: "HERMES|outro writer autorizado"
  phase: "fase atual"
  scope:
    allowed: []
    denied: []
  writer:
    agent: "writer atual"
    workspace: "branch/worktree/ambiente"
  head:
    repository: "owner/repo"
    branch: "branch"
    sha: "sha"
  tools:
    proved_available: []
    unknown: []
  authorized_action: "classe/ação vigente"
  last_proof:
    type: "teste/check/log/diff/runtime"
    reference: "id/sha/url"
  pending: []
  next_gate: "verificação objetiva"
  status: "RUNNING|BLOCKED|LIVE|DONE"
```

Campos desconhecidos ficam `UNKNOWN`.

## 12. Handoff

```yaml
WRITER_HANDOFF:
  mission_id: "id"
  from_writer: "atual"
  to_writer: "novo"
  head_sha: "sha"
  dirty_state: false
  pending_actions: []
  next_gate: "teste seguinte"
  authorization_reference: "autorização vigente"
```

Sem handoff, segundo writer fica read-only.

## 13. Segurança

- sem force-push;
- sem reset destrutivo;
- sem secret em log/commit/chat;
- ação irreversível com `UNKNOWN` material exige mapa/backup/rollback;
- `UNKNOWN|SKIPPED|timeout|SHA divergente` não viram PASS;
- sem V1/V2/V3 ou memória/orquestrador paralelo sem GAP_REAL.

## 14. Fórmula final

```text
SEGREDO/CHEFE NO VOLANTE
+ SOL COMO IDENTIDADE OPERACIONAL RECONSTRUIVEL
+ HERMES COMO EXECUTOR
+ MODELOS/TOOLS COMO CAPACIDADES SUBSTITUIVEIS
+ N PERCEPCOES NORMALIZADAS POR EVIDENCIA
+ REALIDADE COMO ARBITRO
+ CONTEXTO RECUPERAVEL
+ UM WRITER POR ESCOPO
+ APRENDIZADO CANONICO
+ DEPLOY CAUSAL
+ METALUPA PROPORCIONAL
+ CONVERGENCIA TOTAL SOB DEMANDA
= EFICIENCIA + CONTINUIDADE + PROVA SEM PARALISIA
```
