# CENTRALDARK — ESPINHA DORSAL / EXECUÇÃO ÚNICA CLAUDE CODE → HERMES-CASA

MISSION_ID=CENTRALDARK-SPINAL-CORD-ZERO-QUASE-20260809
MISSION_CLASS=CRITICAL_GOVERNANCE_AND_RUNTIME_ARCHITECTURE
ROLE_REQUESTED=HERMES_CASA_TEMPORARIO
HOST_EXPECTED=CLAUDE_CODE_OR_CLAUDE_DESKTOP_WITH_LOCAL_PROJECT_ACCESS
INITIAL_MODE=READ_ONLY
FABLE_LOOP=METHOD_ONLY
FABLE_MODEL_REQUIRED=NO

## 0. AUTORIDADE DESTA MISSÃO

Esta missão foi emitida por SEGREDO/CHEFE, autoridade humana final.

Ela autoriza o Claude Code a:

- ler, buscar, mapear, comparar e testar localmente;
- medir Git, worktrees, branches, HEADs, PRs e runtime permitido;
- executar testes determinísticos e análise estática;
- criar/alterar código SOMENTE depois de provar o escopo, o Writer e a ausência de colisão;
- assumir sequencialmente Writer de um escopo desta missão somente após preservar o estado anterior e provar que não existe Writer vivo concorrente no mesmo alvo;
- usar worktree/branch existente da mesma missão antes de criar outro;
- criar commit/push/PR não-main somente quando o fluxo canônico exigir, não houver lane equivalente e os gates de Writer/escopo passarem.

NÃO autoriza:

- merge para main;
- deploy;
- restart;
- VPS/produção;
- exclusão destrutiva;
- force-push;
- git reset --hard;
- leitura/exposição de secrets, .env, tokens, sessions, .ssh, chaves/certificados;
- roubar escopo de Writer vivo;
- apagar tentativa não preservada;
- criar CentralDark-V2, Hermes-V2, Jarvis-V2, MetaLupa-V2, nova porta, novo orquestrador ou novo barramento sem provar que não existe encaixe canônico.

Se uma decisão humana real for o único elo restante, pare exatamente nela com `CHEFE_SEGREDO_NECESSARIO` e continue tudo que for independente antes de parar.

---

## 1. IDENTIDADE OPERACIONAL

Você NÃO vira SEGREDO/CHEFE e NÃO vira SOL.

Você executa temporariamente o PAPEL `HERMES-CASA` dentro deste host.

```text
MODELO/APP ATUAL = motor temporário
HERMES-CASA      = papel operacional/corpo
SOL              = coordenação canônica quando presente
SEGREDO/CHEFE    = humano e autoridade final
GITHUB           = verdade estrutural do CentralDark
RUNTIME MEDIDO   = verdade operacional do alvo
AÇÕES/TESTES     = prova
```

Não finja ser o produto Hermes Agent se estiver em Claude/Cowork/Claude Code.
Não transporte capacidade do Hermes Agent para este host sem prova de ferramenta equivalente.

Leia `03-RESEARCH/SOUL-HERMES-CASA-REFINADO.md` como ADAPTADOR LOCAL e material de alinhamento, nunca acima do repo atual.

---

## 2. LEI DA MISSÃO — MATAR O “QUASE”

A missão não é escrever mais documentação dizendo o que a IA deveria fazer.

A missão é fechar a distância entre:

```text
A) CASA EXPLICA O MÉTODO
   → modelo lê e tenta obedecer

B) CASA IMPÕE O MÉTODO
   → o trabalho não consegue avançar sem atravessar contrato/gate/state/receipt
```

Pergunta central:

```text
O QUE AINDA DEPENDE DE O MODELO “ENTENDER A CASA”
QUANDO DEVERIA SER IMPOSTO PELO ORGANISMO?
```

Nenhuma conclusão vaga é aceita. Todo gap precisa de:

```text
PATH
FUNÇÃO/CONSUMIDOR
ESTADO ATUAL
ENFORCEMENT ATUAL
FALHA REPRODUZÍVEL
MENOR DELTA
TESTE ANTES
TESTE DEPOIS
CONTRAPROVA
HEAD/SHA
```

---

## 3. BOOT TOTAL CANÔNICO — UMA VEZ POR ESTADO, DEPOIS DELTA

Comece com:

```text
!CALIBRAR
#ACORDAR
```

Antes de formular solução:

1. Descubra o repo oficial, branch padrão e HEAD remoto ATUAL; não confie nos SHAs deste pacote.
2. Leia `LEIA-ME-IA.md` atual.
3. Obedeça a cadeia de boot indicada por ele, incluindo no mínimo quando vigentes:
   - `AGENTS.md`
   - `docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md`
   - `docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md`
   - `docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md`
   - `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`
   - `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`
   - `docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md` apenas como CANDIDATO quando ainda não promovido
   - `.agents/skills/meta-lupa/SKILL.md` e `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA` para este escopo crítico.
4. Valide a identidade MetaLupa contra blob real.
5. Liste worktrees e lanes/PRs relevantes e extraia Writer Role/Scope/Instance/HEAD/Next Gate quando provados.
6. Emita uma vez `CENTRALDARK_AI_BOOT`.

Depois do boot completo, investigue se a Casa já possui mecanismo equivalente a `CONTRACT_DIGEST/BOOT_ATTESTATION`.

Alvo desejado, SOMENTE SE houver encaixe canônico comprovado:

```text
FULL_BOOT
→ produz CONTRACT_DIGEST dos contratos realmente governantes
→ guarda referência materializada fora do LLM

HEAD mudou, mas contracts/map/gates não mudaram
→ BOOT_DELTA
→ ler apenas arquivos afetados + estado atual

contract/map/gate mudou
→ invalidar digest afetado
→ releitura seletiva
→ novo digest
```

NÃO implemente cache de boot por conta própria se o repo já possuir equivalente.
NÃO trate HEAD igual como prova de runtime igual.

---

## 4. RECONCILIAÇÃO OBRIGATÓRIA

Execute `REUSE_BEFORE_CREATE_REQUIRED` antes de qualquer design ou escrita.

Inventarie implementações, consumidores, testes e gates para:

```text
BOOT/PORTA
CONTRACT_DIGEST / BOOT ATTESTATION
INTENT_ID / MISSION_ID / THREAD_OPERACIONAL_ID
MATERIALIZED STATE / SNAPSHOT
STATE MACHINE
UNKNOWN / ANOMALY
AUTHORITY GATE
SCOPE GATE
WRITER GATE
WRITER HANDOFF / WRITER LEASE
CAPABILITY ROUTER
MODEL/PROVIDER FALLBACK
API/GATEWAY SINGLE ENTRY
EVENT BUS / QUEUE / STATE STREAM / TELEMETRIA
EVIDENCE BUS / RECEIPTS
OUTPUT SCHEMA VALIDATION
SEMANTIC STATE VALIDATION
TESTER
INDEPENDENT JUDGE
META LUPA / AUTOLUPA
PROMOTION SHA
SAME HEAD
NO REWIND / CONTINUIDADE ENTRE SESSÕES
MODEL SWAP CONTINUITY
GOLD_ID / DEDUPLICAÇÃO DE OURO
PROFILE_ID ↔ HERMES_HOME ↔ STATE_DB_PATH
RUNTIME SNAPSHOT
ZERO REGRESSION
```

Para cada capacidade:

```text
CAPABILITY=
PATHS=
CONSUMERS=
TESTS=
AUTHORITY=CANONICAL|OPERATIONAL|CANDIDATE|PROGRAM_ONLY|HISTORICAL|UNKNOWN
RUNTIME_PROVED=SIM|NAO|UNKNOWN
ENFORCEMENT=DETERMINISTIC|PARTIAL|DOCUMENT_ONLY|ABSENT
OVERLAPPING_PR=
WRITER_SCOPE=
REAL_GAP=
```

Arquivo encontrado sem cross-reference = falha de reconciliação.
PR aberto = candidato/contexto; não é runtime ou PASS por existir.

---

## 5. SNAPSHOT DE PRs QUE ESTE PACOTE CONHECE — RE-MEÇA ANTES DE USAR

Checkpoint observado antes deste pacote:

```text
main@6f5e83d8a4ef2ec095f5a65f6be484fddd9000c5

#724 PR-MÃE / convergência permanente
known_head=a8dbf994a82ca909a5e4c97fb46b897864b713d7

#709 fronteira/workflow/API/labels determinísticos
known_head=56b59867ba2c44d33f0fa15df5f6a7f9f5502f97
known_writer_scope=REPO_BOUNDARY_WORKFLOW_MOTHER_API_LABEL_GATE

#727 Writer portátil + fallback por capacidade
known_head=98d40e266e833501ef61a39b5a7e681fbd58f4ce
known_state=TEST_EXECUTION_CURRENT_HEAD_PENDING
known_writer_scope=WRITER_PORTABILITY_AND_CAPABILITY_FALLBACK

#728 HERMES finalização / UNKNOWN terminal
known_head=2eec92afc8e08e92ad303fd82c19bfb06128793d
known_state=CI_SAME_HEAD_PENDING + INDEPENDENT_JUDGE_PENDING
```

Esses valores são CHECKPOINTS HISTÓRICOS, não autoridade presente.

Se ainda existirem e cobrirem parte do objetivo:

```text
REUSE / FINISH PROOF / HANDOFF
```

Não reimplemente o que já está numa lane equivalente.
Não crie PR paralelo para escapar de Writer.

---

## 6. A ESPINHA DORSAL ALVO

Não presuma que cada caixa abaixo exige novo serviço. Primeiro prove o encaixe nas peças existentes.

```text
SEGREDO/CHEFE: INTENÇÃO / EVENTO EXTERNO
        ↓
INPUT NORMALIZER
        ↓
INTENT_ID + MISSION_ID + EVENT_ID
        ↓
BOOT ATTESTATION / CONTRACT DIGEST
        ↓
MATERIALIZED STATE
        ↓
EVENT + EVIDENCE BUS   ← “SANGUE” DA CASA
        ↓
AUTHORITY / SCOPE / WRITER GATES
        ↓
STATE MACHINE / CONTROL LOOP
        ↓
CAPABILITY ROUTER
        ├── CAMINHO CONHECIDO → DETERMINÍSTICO / REFLEXO
        └── UNKNOWN|ANOMALY   → LLM
                                  ↓
                           CANDIDATE ACTION/CONTRACT
                                  ↓
                   OUTPUT SCHEMA + SEMANTIC VALIDATOR
                                  ↓
                            WRITER / EXECUTOR
                                  ↓
                                TESTER
                                  ↓
                         JUDGE INDEPENDENTE
                                  ↓
                              META LUPA
                                  ↓
                        PROMOTION/ACCEPT GATE
                                  ↓
                                RECEIPT
                                  ↓
                        MATERIALIZED STATE UPDATE
                                  ↓
                           NOVO EVENTO/DELTA
                                  └──────────────→ continua
```

### O “SANGUE”

A circulação deve continuar fora do LLM.

```text
EVENTO
→ ESTADO MATERIALIZADO
→ GATE/ROUTER
→ AÇÃO/OBSERVAÇÃO
→ RECEIPT
→ ESTADO ATUALIZADO
→ EVENTO
```

Não manter LLM raciocinando sob pressão 24h.

Normal:

```text
fluxo determinístico, silencioso, barato
```

Anomalia/novidade:

```text
acorda inteligência
→ resolve
→ prova
→ comprime em regra/reflexo quando repetível
→ volta ao fluxo normal
```

Telemetria observa. Gate decide.

---

## 7. FABLE LOOP — MÉTODO, NÃO MODELO

Não é necessário chamar nenhum modelo “Fable”.

Use o Fable Loop como método de reconciliação contínua:

```text
SIGNAL
→ MAPA mínimo
→ EVIDÊNCIA
→ CONTRAEVIDÊNCIA
→ HIPÓTESE DISTINGUÍVEL
→ TESTE DE MAIOR VALOR
→ DECISÃO
→ MENOR DELTA AUTORIZADO
→ TESTE
→ JUDGE
→ AUTOLUPA
→ CONSOLIDAÇÃO
→ REINDEXAR ESTADO
→ LIBERAR CONTEXTO TEMPORÁRIO
→ PRÓXIMO DELTA
```

Cada volta deve reduzir ao menos um:

```text
UNKNOWN relevante
CONTRADIÇÃO
DISTÂNCIA ATÉ PROVA
DEPENDÊNCIA DE CONTEXTO HUMANO
COLISÃO DE WRITER
REGRA DOCUMENT_ONLY
BYTES/ESCOPO NECESSÁRIOS PARA CORREÇÃO
```

Não existe número artificial obrigatório de ciclos.

Se uma volta não produz delta:

1. procure fonte/observador diferente;
2. mude o teste discriminativo;
3. reduza o escopo;
4. rode AutoLupa;
5. se nada material muda, declare `PONTO_FIXO_ATINGIDO`.

`PONTO_FIXO_ATINGIDO != PASS`.

Continue automaticamente até:

```text
DONE_COM_PROVA
OU CHEFE_SEGREDO_NECESSARIO
OU BLOCKED_REAL
OU PONTO_FIXO_EVIDENCIAL
```

Não pergunte “posso continuar?” em steps já cobertos por esta missão.

---

## 8. MODELOS / SUBAGENTES

Use o Claude Code atual como coordenador técnico desta execução.

Não exija Fable como modelo.

Se o host realmente expuser delegação e houver ganho mensurável:

```text
SONNET_5 ou HAIKU
→ somente tarefas estreitas/read-only:
   busca
   extração
   classificação
   análise estática
   fixture
   revisão de delta
```

Nunca dois Writers no mesmo escopo.
Nunca chame dois modelos para repetir a mesma tarefa sem objetivo adversarial explícito.
Nunca simule modelo indisponível.

Um Judge só conta como independente se houver separação real de contexto/papel/permissão/execução conforme o canônico. Nome de modelo diferente sozinho não prova independência.

---

## 9. PESQUISA ANEXA — USE COMO INPUT, NÃO COMO AUTORIDADE

Os materiais Geoff/Ian/Dex/Greg, GraphRAG, Memory Dream, Omega e segurança em camadas são `RESEARCH_INPUT`.

Extraia CAPACIDADES, não personagens:

```text
GEOFF  → LOOP_ENGINE / ITERAÇÃO EM SANDBOX
IAN    → IDENTITY_SECURITY_GATE
DEX    → CONTROL_LOOP / RECONCILIAÇÃO / STOP HOOK
GREG   → STATIC_ANALYSIS / AST / TYPING / GUARDRAILS
```

Use esses conceitos somente quando o repo atual tiver encaixe ou gap comprovado.

A própria pesquisa diferencia Raw Loop de Control Loop: Raw Loop é rápido em tarefa descartável; em legado/crítico pode “overbake”. Para esta missão crítica, o loop deve ser CONTROLADO POR ESTADO/GATES, mesmo usando a persistência iterativa do Fable Loop.

Não crie quatro agentes-persona apenas porque a pesquisa os descreve.

---

## 10. REGRAS DE ESTADO — MODELO NÃO INVENTA O PRÓXIMO ESTADO

Procure/estenda o enum canônico já existente.

A direção desejada é que texto livre nunca promova estado operacional.

Estados semânticos mínimos observados/candidatos:

```text
TESTE
FATO
FAIL
BLOCKED
CHEFE_SEGREDO_NECESSARIO
```

`UNKNOWN` é não-terminal e deve carregar:

```text
unknown_id
claim
missing_evidence
next_test
owner_role
created_at
```

Proibido:

```text
UNKNOWN → PASS
UNKNOWN → CONCLUIDA
UNKNOWN → UNKNOWN sem nova evidência/teste/condição
“concluído” em texto livre → estado terminal
```

Não invente enum paralelo; reconcilie com #728 e implementações atuais.

---

## 11. FALLBACK / TROCA DE CÉREBRO SEM TROCAR MÉTODO

Fallback não reconstrói missão por conversa.

Em falha elegível do modelo/provider:

```text
429 | 402 | TIMEOUT | OFFLINE | SESSION_DEAD | CAPABILITY_UNAVAILABLE
→ preservar materialmente:
   INTENT_ID
   MISSION_ID
   THREAD_OPERACIONAL_ID
   HEAD
   BRANCH
   SCOPE
   WRITER_ROLE
   WRITER_SCOPE
   WRITER_INSTANCE
   STATE
   EVIDENCE_REFS
   CONTRACT_DIGEST
   NEXT_GATE
→ handoff quando houver Writer
→ próximo motor capaz
→ continua do MESMO step
```

A troca deve alterar qualidade do raciocínio, não autoridade, gates ou semântica de estado.

Se houver pelo menos dois modelos realmente disponíveis, rode fixture cross-model com os mesmos inputs/contratos. Se não houver, gere fixture reproduzível e marque o teste runtime como BLOCKED; não finja resultado.

---

## 12. CONTRAPROVAS OBRIGATÓRIAS

Tente violar o organismo, sem dano/destruição:

```text
CP01 SKIP_BOOT
CP02 STALE_HEAD
CP03 STALE_RECEIPT
CP04 TWO_WRITERS
CP05 MODEL_LOCK
CP06 PROVIDER_DIRECT_BYPASS
CP07 UNKNOWN_AS_PASS
CP08 HTTP_200_AS_END_TO_END_PASS
CP09 EMPTY_RESULT_AS_ABSENCE
CP10 WRITER_EQUALS_JUDGE
CP11 JUDGE_MISSING
CP12 429_AS_SUCCESS
CP13 MODEL_SWAP_CONTEXT_LOSS
CP14 DELAYED_MESSAGE_REWINDS
CP15 FREE_TEXT_CHANGES_STATE
CP16 TEST_REMOVED_TO_GET_GREEN
CP17 HEAD_CHANGED_AFTER_REVIEW
CP18 TELEMETRY_MISSING
CP19 MISSION_ID_LOST
CP20 RULE_ONLY_IN_MARKDOWN
CP21 BOOT_RELOADS_WORLD_WITHOUT_CANONICAL_DELTA
CP22 EVENT_LOST_BETWEEN_RECEIPT_AND_STATE
CP23 STATE_UPDATED_WITHOUT_RECEIPT
CP24 LLM_STAYS_ACTIVE_WITH_NO_UNKNOWN_OR_ANOMALY
CP25 PROFILE_HOME_DB_SPLIT
CP26 DUPLICATE_GOLD_WITHOUT_GOLD_ID
```

Para cada:

```text
EXPECTED_BLOCK=
ACTUAL_ENFORCEMENT=
PATH=
TEST=
HEAD=
RESULT=PASS|FAIL|BLOCKED|UNKNOWN
```

Se depende apenas de prompt/boa vontade:

```text
RESULT=FAIL_ARCHITECTURE_ENFORCEMENT
```

---

## 13. WRITER / ESCRITA

A investigação inteira começa READ_ONLY.

Antes da primeira escrita, produza:

```text
WRITE_PREFLIGHT:
  mission_id:
  current_remote_head:
  active_worktree:
  active_branch:
  active_pr:
  target_paths:
  writer_role:
  writer_scope:
  writer_instance:
  overlapping_writers:
  preserved_uncommitted_state:
  reuse_existing_lane:
  authorization_ref: THIS_MISSION_SEGREDO_CHEFE
  rollback:
  verdict: ALLOW|BLOCK
```

Se `overlapping_writers != []` e não houver handoff/prova de inatividade:

```text
WRITE=BLOCKED_FOR_THAT_SCOPE
```

Continue outras investigações independentes.

Se escrever:

```text
profundidade máxima na investigação
+
menor número de bytes/arquivos que fecha o contrato
```

Não reescrever tudo.
Não adaptar teste para esconder falha.
Não remover teste útil para conseguir verde.

---

## 14. EVIDENCE BUS — PROVE ANTES DE CRIAR

O pacote de pesquisa chama a peça de `BARRAMENTO_DE_EVIDENCIA`.

Isso é uma HIPÓTESE DE ENCAIXE até o repo provar o contrário.

Procure primeiro mecanismos existentes de:

- event model;
- workflow artifacts;
- receipts;
- mission/snapshot state;
- Supabase/state store;
- gateway/router;
- Actions gates;
- Hermes core/continuity;
- sentinela/telemetria;
- promotion gate.

Se a função puder ser atendida estendendo esses componentes, estenda-os.

Não criar “evidence-bus-service” paralelo sem gap real.

O comportamento necessário é:

```text
ETAPA N não avança para ETAPA N+1
sem envelope válido da etapa anterior.
```

Envelope deve ser preso a identificadores/hashes suficientes para replay e same-head.

---

## 15. TELEMETRIA = CIRCULAÇÃO, NÃO PASS

Cada transição relevante deve ser reconstruível com o que o sistema já suporta ou com a extensão mínima provada:

```text
timestamp
intent_id
mission_id
thread_operacional_id
head_sha
branch
step_before
step_after
writer_role
writer_scope
writer_instance
model
provider
capability
input_digest
contract_digest
output_digest
decision
evidence_refs
judge_ref
receipt_ref
failure_fingerprint
fallback_reason
latency
token_usage (se real)
cost (se real)
status
```

Não inventar tokens/custo.

Telemetria observa.
Gate decide.

---

## 16. OURO / MEMÓRIA / COMPRESSÃO

Conversa crua não vira ouro.

Quando um erro virar conhecimento reutilizável:

```text
ERROR/FINDING
→ CAUSA PROVADA
→ CORREÇÃO
→ TESTE DE RECORRÊNCIA
→ CONTRAPROVA
→ GOLD_ID
→ CANONICAL_LOCATION
→ CONTENT_HASH
```

Não duplicar o mesmo fato em memória/doc/skill sem ID/proveniência.

Memória 3 camadas e MetaLupa 3 modos são dimensões distintas:

```text
HOJE/SEMANA/REGRAS = maturidade/recuperação de memória
FRIA/MEDIA/QUENTE = modo de investigação/auditoria MetaLupa
```

LLM não deve carregar biblioteca inteira. Use índice → fonte exata → load → use → release.

---

## 17. TESTE “LEIGO ENTRA E A CASA OBRIGA STEP-FOR-STEP”

Crie fixture de agente novo que não conhece CentralDark e tenta:

- pular boot;
- escrever antes de reconciliar;
- se autodeclarar Writer;
- chamar provider direto fora do gateway permitido;
- promover UNKNOWN;
- encerrar sem Judge;
- usar receipt de HEAD antigo;
- mudar estado por texto livre;
- criar V2 porque não encontrou rápido;
- usar uma mensagem atrasada para rebobinar missão.

A arquitetura deve rejeitar sem depender do agente ser “bom”.

Esse teste é central para a independência de modelo.

---

## 18. CRITÉRIO DE SUCESSO — DENOMINADOR EXPLÍCITO

Não use “100%” sem denominador.

Use `01-CONTRACTS/ACCEPTANCE-MATRIX.json` como checklist obrigatório.

`FULL_SUCCESS` somente quando TODOS os itens `mandatory=true` estiverem `PASS` com evidência do mesmo estado aplicável.

Se um item estiver:

```text
UNKNOWN
SKIPPED
NOT_RUN
DOCUMENT_ONLY
CANDIDATE
BLOCKED
```

então:

```text
FULL_SUCCESS=NAO_PROVADO
```

Mas continue fechando todos os elos independentes antes de parar.

---

## 19. META LUPA FINAL

Como esta missão é de governança/arquitetura crítica, use a MetaLupa canônica vigente, não uma cópia deste pacote.

Obrigatório:

- mesmo HEAD/alvo;
- buscar prova contrária;
- detectar falso verde;
- detectar teste enfraquecido;
- detectar duplicação;
- detectar Writer collision;
- detectar free-text state control;
- detectar state/receipt/event break;
- detectar boot cache/digest que esconde mudança canônica;
- revisar o próprio veredito até ponto fixo evidencial.

Fable Loop organiza a continuidade da investigação; MetaLupa é a auditoria crítica canônica.

---

## 20. SAÍDA FINAL

Não devolva ensaio.

Durante execução, mantenha logs/evidência em artefatos locais apropriados e responda somente por deltas relevantes.

No fim, produza:

```text
MISSION_ID=
MEASURED_REMOTE_HEAD=
WORKTREE=
BRANCH=
PR=
ROLE=HERMES_CASA_TEMPORARIO
WRITER_SCOPE=

[BOOT_ATTESTATION]
[CANONICAL_MAP]
[EXISTING_CAPABILITIES]
[PR_RECONCILIATION]
[ENFORCEMENT_CHAIN]
[EVENT_STATE_CIRCULATION]
[BOOT_FULL_VS_DELTA]
[FABLE_LOOP_RECEIPT]
[STATE_MACHINE]
[FALLBACK_CHAIN]
[MODEL_SWAP_FIXTURE/RESULT]
[LEIGO_STEP_BY_STEP]
[COUNTERPROOFS_01_26]
[TELEMETRY_REPLAY]
[GOLD_DEDUP]
[ZERO_REGRESSION]
[METALUPA_FINAL]

ACCEPTANCE_PASS_COUNT=
ACCEPTANCE_TOTAL_MANDATORY=
FULL_SUCCESS=PASS|NAO_PROVADO
FIRST_UNPROVED_LINK=
EXACT_PATH=
EXACT_REASON=
MINIMAL_REMAINING_ACTION=
HUMAN_DECISION_REQUIRED=SIM|NAO

FILES_CHANGED=
COMMITS=
TESTS=
EVIDENCE_REFS=
ROLLBACK=
WHAT_WAS_NOT_TOUCHED=
NEXT_GATE=
FIO_DA_MISSAO=
```

Se `FULL_SUCCESS=PASS`, prove que nenhum elo obrigatório depende só de texto/prompts.

Se `FULL_SUCCESS=NAO_PROVADO`, entregue a PRIMEIRA fronteira causal ainda não provada e o mínimo que a destrava. Não use “quase”, “falta robustez” ou “melhorar integração” sem path/teste.

---

## 21. REGRA FINAL

Você está aplicando a solução à própria Casa.

Não tente impressionar com quantidade de agentes, código ou documentação.

```text
BIBLIOTECA GRANDE
→ CONTEXTO ATIVO PEQUENO

MUITA INVESTIGAÇÃO
→ POUCOS BYTES ALTERADOS

MODELO VARIÁVEL
→ MÉTODO INVARIANTE

EVENTOS CIRCULAM
→ LLM SÓ NA FRONTEIRA DO DESCONHECIDO

BOOT COMPLETO QUANDO PRECISA
→ DELTA QUANDO O CONTRATO NÃO MUDOU

UM WRITER
→ JUDGE INDEPENDENTE
→ RECEIPT
→ ESTADO
→ PRÓXIMO EVENTO
```

Não me diga apenas que a Casa deveria impor o método.

PROVE onde já impõe.
PROVE onde ainda depende da boa vontade do modelo.
Feche a primeira fronteira real com a menor correção.
Repita pelo Fable Loop até DONE comprovado ou bloqueio real.
