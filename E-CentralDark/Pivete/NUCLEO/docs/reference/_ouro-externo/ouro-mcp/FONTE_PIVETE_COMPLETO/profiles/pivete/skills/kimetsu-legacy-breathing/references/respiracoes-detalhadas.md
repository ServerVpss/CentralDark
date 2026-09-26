# Respirações Detalhadas — Kimetsu Legacy

Cada Respiração possui: Verso, Use quando, Executar, Essência, Não fazer (quando aplicável), Prova de uso.

---

## 0. CONCENTRAÇÃO TOTAL — Kernel Observador

**Verso:** `Nenhuma técnica permanece precisa quando o estado deixa de ser observado.`

**Papel:** Kernel operacional — permanece ativo durante todas as Respirações.

**Antes de agir:**
```text
READ_INTENT()
MEASURE_STATE()
IDENTIFY_TARGET()
IDENTIFY_WRITER()
IDENTIFY_CONSTRAINTS()
SEPARATE_KNOWN_UNKNOWN()
```

**Depois de agir:**
```text
MEASURE_AGAIN()
COMPARE_BEFORE_AFTER()
CLASSIFY_RESULT()
SELECT_NEXT_BREATH()
```

**Invariantes:**
```
UNKNOWN != PASS
ACTION != PROOF
HISTORY != CURRENT_STATE
ASSUMPTION != FACT
```

---

## 1. SOL — Meta-Orquestrador

**Verso:** `Veja o sistema inteiro antes de escolher qual força deve governar o próximo movimento.`

**Função:** Observa, classifica, roteia, executa especialista, coleta evidência, reavalia.

**Executar:**
```
OBSERVE
CLASSIFY
ROUTE
EXECUTE SPECIALIST
COLLECT EVIDENCE
REASSESS
```

**Perguntas obrigatórias:**
- Qual é a intenção?
- Onde estamos?
- Qual é a ferida?
- Que tipo de problema é este?
- Qual Respiração possui maior ajuste?
- Qual o blast radius?

**Prova:** `STATE_CLASSIFIED= | BREATH_SELECTED= | SELECTION_REASON=`

---

## 2. ÁGUA — Adaptação

**Verso:** `Quando a realidade mudar de forma, adapte o caminho sem quebrar aquilo que ainda funciona.`

**Use quando:** bloqueio, condição mudou, rota original falhou, comportamento funcional a preservar.

**Executar:**
```
DETECT_RESISTANCE
PRESERVE_WORKING_PARTS
FIND_ALTERNATE_PATH
MINIMAL_ADAPTATION
RETEST
```

**Essência:** Flexibilidade.

**Não fazer:** Reescrever o sistema inteiro apenas porque uma rota falhou.

**Prova:** `BLOCK= | PRESERVED= | ADAPTATION= | RESULT=`

---

## 3. CHAMAS — Persistência Orientada por Evidência

**Verso:** `Quando a direção estiver comprovada, sustente a execução até que o objetivo feche.`

**Use quando:** caminho compreendido, exige várias etapas.

**Executar:**
```
EXECUTE
TEST
CORRECT_DELTA
TEST
REMEASURE
CONTINUE
```

**Essência:** Persistência orientada por evidência.

**Não fazer:**
- Confundir teimosia com persistência
- Sustentar execução sem evidência de progresso
- Pular validação entre etapas
- Ignorar sinal de regressão
- Persistir em hipótese já refutada

**Prova:** `DIREÇÃO_COMPROVADA= | ETAPA= | EVIDÊNCIA= | CORREÇÃO_DELTA= | RESULTADO= | PRÓXIMA_ETAPA=`

---

## 4. TROVÃO — Velocidade Decisiva / Impacto Cirúrgico

**Verso:** `Quando a janela de oportunidade é estreita, golpeie com precisão máxima e valide instantaneamente.`

**Use quando:** janela curta, ação única irreversível, romper bloqueio conhecido, velocidade > iteração.

**Executar:**
```
IDENTIFY_TARGET
MEASURE_WINDOW
STRIKE_PRECISE
VALIDATE_INSTANT
TRANSITION
```

**Essência:** Latência mínima.

**Não fazer:**
- Confundir pressa com precisão
- Golpear sem medir a janela
- Ação irreversível sem contraprova pronta
- Usar Trovão para problemas que pedem Água ou Chamas

**Regra:** `FAST_WITHOUT_CERTAINTY = RECKLESS`

**Prova:** `TARGET= | WINDOW_MS= | STRIKE= | VALIDATION= | RESULT=`

---

## 5. VENTO — Propagação / Blast Radius

**Verso:** `Uma mudança raramente termina onde nasceu; siga a corrente até onde seus efeitos alcançam.`

**Função:** Analisar blast radius e propagação.

**Executar:**
```
CHANGE
DIRECT_CONSUMERS
INDIRECT_CONSUMERS
SIDE_EFFECTS
EXTERNAL_BOUNDARIES
```

**Perguntas:**
- Quem depende disso?
- Quem chama isso?
- Quem recebe a saída?
- Onde o erro pode reaparecer?

**Essência:** Forward analysis.

---

## 6. PEDRA — Invariantes / Safety Rails

**Verso:** `Antes da velocidade vem a fundação que não pode se mover.`

**Função:** Estabilidade, contratos e limites.

**Use quando:** risco elevado, infraestrutura, estado compartilhado, fronteira de segurança, mutação potencialmente ampla.

**Executar:**
```
IDENTIFY_INVARIANTS
DEFINE_GUARDRAILS
VERIFY_PRECONDITIONS
EXECUTE_INSIDE_BOUNDARY
VERIFY_INVARIANTS_AGAIN
```

**Essência:** Safety rails.

**Prova:** `INVARIANTS_BEFORE= | INVARIANTS_AFTER= | VIOLATIONS=0`

---

## 7. FLOR — Observação de Alta Resolução

**Verso:** `Quando o detalhe decide o resultado, aumente a resolução antes de tocar no sistema.`

**Derivação:** ÁGUA → FLOR

**Use quando:** falha sutil/intermitente, diferença imperceptível, ruído mascara sinal, isolar variável única.

**Executar:**
```
INCREASE_RESOLUTION
ISOLATE_VARIABLE
OBSERVE_PATTERN
IDENTIFY_ROOT_CAUSE
VALIDATE_MINIMAL_FIX
```

**Ferramentas:** logs estruturados, diff semântico, replay determinístico, instrumentação ponto-a-ponto, bisect automatizado.

**Essência:** Zoom cirúrgico. Não adivinhe — amplie até ver.

**Prova:** `SINAL_OBSERVADO= | RESOLUÇÃO_APLICADA= | CAUSA_RAIZ= | FIX_MINIMO= | RESULTADO=`

---

## 8. INSETO — Inspeção Minuciosa / Correção Cirúrgica

**Verso:** `Quando a causa reside no detalhe que nenhum outro nível de resolução alcança, inspecione cada átomo do sistema.`

**Derivação:** ÁGUA → FLOR → INSETO

**Use quando:** falha não reproduzível em macro, corrupção em campo único, race condition nanossegundo, diferença de 1 bit/byte/caractere, comportamento divergente entre ambientes "idênticos".

**Executar:**
```
ENUMERATE_ATOMS
COMPARE_BYTE_A_BYTE
TRACE_SINGLE_PATH
ISOLATE_SINGLE_INSTRUCTION
VERIFY_ATOMIC_FIX
```

**Ferramentas:** hex dump, memory inspector, instruction-level trace (rr, gdb, WinDbg), deterministic replay, property-based testing, formal verification.

**Essência:** Lupa no átomo. O erro está no detalhe que todos ignoram.

**Prova:** `ÁTOMO_INSPECIONADO= | DIFERENÇA_ENCONTRADA= | FIX_ATÔMICO= | RESULTADO=`

### Correção Cirúrgica (INSETO)

**Verso:** `Quando a causa cabe num ponto, não transforme o ponto num continente.`

**Executar:**
```
ROOT_CAUSE
MINIMUM_PATCH
TARGETED_TEST
COUNTERTEST
REGRESSION_CHECK
```

**Contratos:**
```
REUSE_BEFORE_CREATE
MINIMUM_MUTATION
NO_V2_WITHOUT_GAP
```

**Prova:** `ROOT_CAUSE= | PATCH= | BEFORE= | AFTER= | REGRESSION=`

---

## 9. SERPENTE — Rota Não-Linear / Dependency Tracing

**Verso:** `Quando o caminho reto estiver bloqueado, siga as dependências sem perder o alvo.`

**Derivação:** ÁGUA → SERPENTE

**Use quando:** relação causal não direta (A → middleware → cache → wrapper → adapter → B).

**Executar:**
```
TRACE_PATH
FOLLOW_INDIRECTION
VERIFY_EACH_HOP
FIND_BREAK
```

**Essência:** Dependency tracing.

---

## 9. AMOR — Ajuste ao Operador / Human-System Fit

**Verso:** `O sistema mais forte é aquele que se ajusta à realidade de quem precisa operá-lo.`

**Derivação:** CHAMAS → AMOR

**Use para:** UX, ergonomia, interface, linguagem, fluxo humano, simplificação operacional.

**Executar:**
```
IDENTIFY_OPERATOR_NEED
REMOVE_FRICTION
PRESERVE_FUNCTION
VALIDATE_USABILITY
```

**Essência:** Human-system fit.

---

## 10. SOM — Ritmo e Sequenciamento / Timing

**Verso:** `Quando ações dependem umas das outras, escute a ordem antes de acelerar.`

**Derivação:** TROVÃO → SOM

**Use quando:** jobs, pipelines, filas, eventos, concorrência, ordem de execução, dependências temporais.

**Executar:**
```
MAP_SEQUENCE
IDENTIFY_TIMING
IDENTIFY_COLLISIONS
SERIALIZE_MUTATION
VERIFY_ORDER
```

**Essência:** Timing.

---

## 11. NÉVOA — Redução de Ruído / Filtragem

**Verso:** `Quando há informação demais para enxergar a causa, retire o que não altera a decisão.`

**Derivação:** VENTO → NÉVOA

**Executar:**
```
COLLECT_SIGNALS
REMOVE_IRRELEVANT
CLUSTER_RELEVANT
ISOLATE_DECISION_VARIABLES
VALIDATE_DECISION_INVARIANCE
```

**Regra:** Se remoção do sinal NÃO muda a decisão → ruído.

**Princípio:** Névoa NÃO esconde informação. Névoa REVELA ao remover o que não decide = **Reduzir entropia cognitiva**.

**Prova:** `SINAIS_COLETADOS= | IRRELEVANTES_REMOVIDOS= | CLUSTERS_RELEVANTES= | VARIÁVEIS_DECISÃO= | RESULTADO=`

---

## 12. FERA — Descoberta Exploratória

**Verso:** `Quando o mapa não existe, a melhor estratégia é explorar com força controlada e aprender o território.`

**Derivação:** VENTO → FERA

**Use quando:** sistema desconhecido/sem documentação, comportamento emergente não mapeado, descobrir fronteiras/limites, fuzzing, chaos engineering, red teaming.

**Executar:**
```
PROBE_BOUNDARIES
MAP_UNCHARTED
IDENTIFY_EDGE_CASES
DISCOVER_FAILURE_MODES
DOCUMENT_TERRITORY
```

**Ferramentas:** fuzzing (AFL, libFuzzer, honggfuzz), chaos engineering (Litmus, Chaos Mesh), property-based testing, model checking, red teaming/pentesting autorizado, canary deployments.

**Essência:** Força bruta com propósito: explorar para mapear. Não destruir — descobrir.

**Prova:** `TERRITÓRIO_EXPLORADO= | FRONTEIRAS_MAPEADAS= | FALHAS_DESCOBERTA= | MAPA_ATUALIZADO= | RESULTADO=`

### Multidirecional
```
TOP-DOWN
BOTTOM-UP
FORWARD
REVERSE
ROUND-TRIP
RENDEZVOUS
```

**Regra:** `PARALLELIZE_PERCEPTION | SERIALIZE_MUTATION`

---

## 14. LUA — Espelho Adversarial / Contraprova

**Verso:** `Tudo que parece correto deve sobreviver à tentativa deliberada de provar que está errado.`

**Derivação:** Derivação paralela do SOL.

**Função:** Tentar quebrar a conclusão antes do fechamento.

**Executar:**
```
TAKE_CURRENT_CONCLUSION
INVERT_ASSUMPTIONS
SEARCH_COUNTEREXAMPLE
TEST_FAILURE_PATH
TEST_BOUNDARIES
ATTEMPT_FALSIFICATION
```

**Perguntas:**
- E se a hipótese estiver errada?
- Que evidência a derrubaria?
- Existe explicação alternativa?
- O teste consegue produzir falso positivo?

**Essência:** Contraprova.

**Regra:** Writer não julga sozinho a própria vitória.

---

## Regras Fundamentais (Kernel)

```
UNKNOWN != PASS
ACTION != PROOF
HISTORY != CURRENT_STATE
ASSUMPTION != FACT
PARALLELIZE_PERCEPTION
SERIALIZE_MUTATION
```

## Fixed Point

`Fixed Point = SUCESSO COM EVIDÊNCIA OU BLOQUEIO_COMPROVADO`

---

## BOOT
`KIMETSU_LEGACY_FIXED_POINT`