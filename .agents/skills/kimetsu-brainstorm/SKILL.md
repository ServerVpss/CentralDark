---
name: kimetsu-brainstorm
display_name: "CentralDark - Kimetsu Brainstorm"
legacy_alias: kimetsu-brainstorm
description: "KIMETSU REMIX: classifica intenção, seleciona contextual e deliberadamente 17 respirações históricas e técnicas ToT/CoT/ReAct/GoT/AoT/SoT/PoT/CoT-SC; avalia delegação Hermes, fable-loop e cot-react-loop por rodada com evidência, sem arquitetura paralela. Use quando o CHEFE invocar Kimetsu, REMIX ou brainstorming operacional."
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
---

# 🫁 KIMETSU_BRAINSTORM — Remix Operacional

> **Origin:** KIMETSU_LEGACY_STRICT × brainstorming (superpowers)
> **Perfil:** Strict Legacy / Zero Regressão / Design-First
> **Domínio:** Operação de software, investigação, correção, validação, continuidade, brainstorming

## 0. CONTRATO CENTRAL

Hermes NUNCA deve apenas citar uma Respiração.

Toda técnica exige o ciclo:

VERSO → DECLARAÇÃO → EXECUÇÃO → EVIDÊNCIA → VEREDITO → TRANSIÇÃO

**Regra absoluta:**

TÉCNICA_DECLARADA != TÉCNICA_EXECUTADA

Sem evidência: STATUS=NOT_PROVEN

Nunca: UNKNOWN = PASS

Nunca: ACTION = PROOF

### Acoplamento CentralDark — 17 Respirações operacionais

Em qualquer execução material dentro da CentralDark, esta Remix deve ser carregada **junto** da referência canônica `../centraldark-operational-method/references/regenerative-self-refinement-engine.md`. Não duplicar a taxonomia: esta skill decide intenção, classe, design e transição; a referência de 17 slots fornece a política operacional específica.

Selector compacto dos 17 slots: `1 Concentração Total` (foco/estado), `2 Sol` (meta-orquestração), `3 Lua` (contraprova), `4 Água` (adaptação), `5 Chamas` (execução sustentada), `6 Trovão` (movimento curto comprovado), `7 Vento` (exploração), `8 Pedra` (estabilidade), `9 Flor` (precisão), `10 Inseto` (mudança mínima), `11 Serpente` (rota indireta), `12 Amor` (integração), `13 Som` (sinais/telemetria), `14 Névoa` (ambiguidade), `15 Fera` (detecção de campo), `16 Regeneração Monotônica` (refinar sem perder verde) e `17 Continuar até Fixed Point` (parar apenas em critério objetivo).

**Gatilho obrigatório de execução:** antes de mutar, delegar implementação, corrigir, integrar ou provar, registrar internamente `CLASSIFICAÇÃO + INTENT + BREATH_ID/NAME + condição observada`, sem impor essa declaração ao CHEFE na conversa natural. Depois executar o ciclo `VERSO → DECLARAÇÃO → EXECUÇÃO → EVIDÊNCIA → VEREDITO → TRANSIÇÃO`. Leituras puras podem terminar em Concentração/Lua/Som sem mutação. Uma nova evidência pode mudar a respiração; falhar não autoriza retry cego.

---

## 1. CLASSIFICAÇÃO INICIAL — O QUE É ISTO?

Antes de qualquer respiração, Hermes deve classificar o pedido em **uma** das três categorias:

| Categoria | O que é | Exemplo | Saída esperada |
|-----------|---------|---------|----------------|
| **⚡ SPIKE** | Pergunta de viabilidade, "é possível?", investigação rápida | "Consigo fazer X com essa API?" | Resposta + recomendação. Código = throwaway. |
| **🌀 BOUNDED** | Mudança limitada em código existente: flag nova, endpoint pequeno, fix de um arquivo | "Adiciona paginação nesse endpoint" | Design curto no chat → aprovação → implementação. |
| **🏗️ ARCHITECTURAL** | Novo projeto, novo subsistema, mudança que reestrutura componentes ou interfaces | "Refactora o sistema de auth" | Perguntas → 2-3 abordagens → design escrito → spec → plano. |

**Regra de ouro:** Quando em dúvida entre dois caminhos, assumir o mais pesado.

**HARD-GATE:** Nenhum work de implementação (código, scaffold, dependência nova) pode executar antes de aprovação na categoria correspondente. Spike permite investigação; bounded requer yes no design chat; architectural requer spec escrita e aprovada.

---

## 2. DESCOBRIR INTENÇÃO REAL — 🫁 CONCENTRAÇÃO TOTAL

> 🫁 "Antes do movimento, estabilize o núcleo; durante o movimento, preserve consciência do estado."

### Execução obrigatória (brainstorm layer)

Antes de classificar, entender:

1. **Quem é o público/alvo?** (quem vai usar, quem vai manter)
2. **Qual o problema real?** (não a solução proposta — o problema)
3. **Qual sucesso?** (o que significa "ta pronto"?)
4. **Quais constraints?** (tempo, recursos, compatibilidade, risco)

### Formato de registro interno (não é modelo obrigatório de resposta ao CHEFE)

INTENT=
PROBLEM=
SUCCESS_CRITERIA=
CONSTRAINTS=
ASKED_QUSTIONS=

### Regra

Se a intenção for desconhecida ou ambígua, **uma pergunta focada** sobre purpose/uso antes de propor features.

Pergunta ≠ pedir autorização. Intent descoberto ≠ intenção aprovada para implementação.

---

## 3. ENCADEAMENTO — RESPIRAÇÃO SELEciona BASEADO NO ESTADO

```
┌────────────────────────────────────────────┐
│ 🫁 CONCENTRAÇÃO TOTAL                      │
│  - Recuperar intenção                      │
│  - Medir estado atual                      │
│  - Separar KNOWN / UNKNOWN / ASSUMED       │
│  - Classificar: SPIKE / BOUNDED / ARCH     │
└────────────────────┬───────────────────────┘
                     │
        ┌───────────┴───────────┐
        │                       │
   INCERTO/AMBÍGUO         CLARO/PROVADO
        ↓                       ↓
   🌊 ÁGUA              ┌──────┴──────┐
   (explorar ambiguidade)│             │
        │               CURTO E CLARO  LONGO E MAPEADO
        │               ↓              ↓
        │          ⚡ TROVÃO      🔥 CHAMAS
        │          (executar)     (sustentar)
        │                             │
        └──────────────┬──────────────┘
                       ↓
              CAUSA LOCALIZADA?
                 │         │
                SIM       NÃO
                 ↓         ↓
             🦋 INSETO   🐗 FERA
             (cirúrgico) (explorar)
```

**Selector automático:**

```
IF estado_nao_medido OR intencao_nao_clara:
    🫁 CONCENTRAÇÃO TOTAL

ELIF categoria == SPIKE:
    ⚡ TROVÃO  (seviável rápido) OU 🌊 ÁGUA (se viável incerta)

ELIF categoria == BOUNDED:
    🕸️ BRAINSTORM DESIGN → 🦋 INSETO (implementação)

ELIF categoria == ARCHITECTURAL:
    🕸️ BRAINSTORM DESIGN → 🔥 CHAMAS (execução sustentada)

ELIF bloqueio OR ambiguidade:
    🌊 ÁGUA

ELIF causa_desconhecida:
    🐗 FERA

ELIF causa_exata_identificada:
    🦋 INSETO

ELIF caminho_claro AND acao_curta:
    ⚡ TROVÃO

ELIF caminho_claro AND execucao_multietapa:
    🔥 CHAMAS
```

---

## 4. 🕸️ BRAINSTORM — DESENHO ANTES DE CODAR

> 🌊 "Não confronte resistência sem necessidade; encontre o caminho que continua fluindo."

### Quando usar

- BOUNDED: antes de qualquer implementação, apresentar design curto no chat
- ARCHITECTURAL: antes de qualquer spec, explorar 2-3 abordagens

### Processo obrigatório (bounded)

1. **Explorar contexto** — ler arquivos, docs, commits recentes
2. **Perguntas focadas** — uma por mensagem, só as que importam
3. **Proposta de design** — abordagem, arquivos tocados, teste, no máximo alguns parágrafos
4. **Esperar aprovação** — STOP. Não implementar até yes explícito.
5. **Implementar** — TDD se aplica

### Processo obrigatório (architectural)

1. **Explorar contexto** — ler arquivos, docs, commits recentes
2. **Perguntas focadas** — purpose, constraints, success criteria, one at a time
3. **2-3 abordagens** — com trade-offs e recomendação
4. **Design em seções** — escala a complexidade, perguntar após cada seção
5. **Escrever spec** — `docs/CENTRALDARK/specs/YYYY-MM-DD-<topico>-design.md`
6. **Spec self-review** — placeholder scan, consistência, scope, ambiguidade
7. **Usuario revisa spec** — aguardar resposta antes de qualquer planejamento de implementação
8. **Invocar planning skill** — somente após aprovação do spec

### Formato 2-3 Abordagens

APROXIMAÇÃO_A=
  PROS=
  CONS=
  RECOMMENDED=false

APROXIMAÇÃO_B=
  PROS=
  CONS=
  RECOMMENDED=true  (se for a recomendada)

APROXIMAÇÃO_C= (opcional)
  PROS=
  CONS=
  RECOMMENDED=false

RECOMMENDATION=
  MOTIVO=

---

## 5. FORMA — 🌊 Fluxo Contínuo

> 🌊 "Não confronte resistência sem necessidade; encontre o caminho que continua fluindo."

Usar quando existe caminho alternativo seguro ou quando a força bruta vai quebrar algo.

```
BLOCK/BLOQUEIO/AMBIGUIDADE →
  MAPEAR CONTORNO →
  REUTILIZAR CAMINHO EXISTENTE →
  EXECUTAR MÍNIMO →
  TESTAR →
  (se funcionou → ⚡ ou 🔥; se falhou → 🦋 ou 🐗)
```

### Forma — 🌊 Calmaria

Usar quando agir criaria mais dano que benefício.

```
RUÍDO/INSEGURO →
  NÃO MUTAR →
  OBSERVAR →
  VALIDAR →
  AGUARDAR NOVA EVIDÊNCIA
```

---

## 6. FORMA — ⚡ Movimento Único

> ⚡ "Quando o caminho estiver provado, concentre tudo em um único movimento conclusivo."

Usar somente quando:

- objetivo claramente definido
- dependências verificadas
- não existe bifurcação desconhecida
- blast radius compreendido
- **e categoria == SPIKE ou BOUNDED com design aprovado**

```
TARGET LOCK →
  EXECUTE →
  TEST →
  VERDICT
```

**Regra:** VELOCIDADE SEM CERTEZA = ERRO

Trovão não serve para adivinhar. Serve para executar rapidamente o que já foi suficientemente provado.

---

## 7. FORMA — 🐗 Fera

> 🐗 "Quando o caminho linear falhar, perceba o terreno inteiro e procure o sinal escondido."

### Quando usar

- Causa desconhecida
- Múltiplas camadas
- Sinais desconectados
- Análise linear não explica

### Radar 🐗

```
SIGNALS=
ANOMALIES=
DEPENDENCIES=
PROPAGATION=
CANDIDATE_CAUSES=
DISPROVED_CAUSES=
```

### Regra

A Fera procura. Não muta aleatoriamente.

```
PARALELIZE_PERCEPCAO
SERIALIZE_MUTACAO
```

---

## 8. FORMA — 🦋 Inseto

> 🦋 "Onde força seria desperdício, precisão resolve o ponto exato."

### Quando usar

- Causa material isolada
- Após diagnóstico 🐗 ou descoberta 🌊
- Após design bounded/architectural aprovado

### Execução obrigatória

```
ROOT_CAUSE=
EXACT_CHANGE=
FILES_TOUCHED=
TEST_BEFORE=
TEST_AFTER=
REGRESSION_CHECK=
```

**Proibido:** transformar bug pequeno em refatoração completa, arquitetura nova, módulo duplicado, V2/V3 desnecessária.

```
REUSE_BEFORE_CREATE
NO_V1_V2_V3_SEM_GAP_PROVADO
```

---

## 9. FORMA — 🔥 Chamas

> 🔥 "Com o terreno conhecido, sustente a execução até que o objetivo esteja realmente fechado."

### Quando usar

- Trabalho multietapa compreensível
- Após design architectural aprovado
- Após spike confirmado como viável e recomendado

### Ciclo de fechamento

```
RECUPERAR →
  CORRIGIR →
  TESTAR →
  CONTRAPROVAR →
  REMEDIR →
  CORRIGIR DELTA →
  TESTAR NOVAMENTE →
  FIXED POINT
```

### Perímetro de Chamas 🔥

Antes de cada mutação:

```
CHECK_INTENT
CHECK_STATE
CHECK_WRITER
CHECK_BLAST_RADIUS
```

### Nona Forma — 🔥 FECHAMENTO

Não significa ação destrutiva. É o estágio final de fechamento operacional:

```
TESTS=PASS
CONTRAPROOF=PASS
REGRESSION=PASS
STATE_REMEASURED=PASS
FIXED_POINT=TRUE
```

---

## 10. FORMATOS DE OUTPUT

### Output mínimo de brainstorming

🫁 CONCENTRAÇÃO TOTAL
"Antes do movimento, estabilize o núcleo; durante o movimento, preserve consciência do estado."

CLASSIFICAÇÃO=SPIKE|BOUNDED|ARCHITECTURAL
MOTIVO_DA_CLASSIFICAÇÃO=

INTENT=
PROBLEM=
SUCCESS_CRITERIA=
CONSTRAINTS=

🕸️ BRAINSTORM [se applicável]
APROXIMAÇÕES=
  A: <approach> — PROS: ... CONS: ... RECOMMENDED: true/false
  B: <approach> — PROS: ... CONS: ... RECOMMENDED: true/false

RECOMMENDATION=<abordagem recomendada>
MOTIVO=<por que>

PENDING_APPROVAL=true|false
NEXT_STEP=<o que precisa de aprovação>


### Output de execução (após aprovação)

⚡ TROVÃO | 🔥 CHAMAS | 🦋 INSETO | 🌊 ÁGUA | 🐗 FERA

EXECUÇÃO=
  <ação realmente executada>

EVIDÊNCIA=
  <teste/log/diff/resultado>

VERDICT=PASS|FAIL|UNKNOWN|BLOCKED

🔄 TRANSIÇÃO=
  <próxima técnica> → <motivo da transição>

---

## 11. HARD-GATE — APROVAÇÃO ANTES DE IMPLEMENTAR

### Spike

```
[ ] Pergunta claramente formulada
[ ] Plano de investigação apresentado (2-3 frases)
[ ] Human approva (nodo é suficiente)
[ ] Investigar
[ ] Reportar achados
```

Código construído no spike **permanece labeled throwaway**. Se o código for para manter, é uma nova tarefa — reclassificar.

### Bounded

```
[ ] Contexto explorado
[ ] Perguntas respondidas
[ ] Design curto apresentado no chat
[ ] Human approva (YES explícito)
[ ] Implementar
```

### Architectural

```
[ ] Contexto explorado
[ ] Perguntas respondidas
[ ] 2-3 abordagens propostas
[ ] Design apresentado em seções
[ ] Cada seção approvada
[ ] Spec escrita
[ ] Spec self-review feito
[ ] Usuario revisa e approva spec
[ ] Invocar planning skill
```

**NUNCA** invocar skill de implementação (frontend-design, mcp-builder, etc) antes de aprovação do spec. Apenas planning skill é permitido após spec.

---

## 12. TESTE DE HOMOLOGAÇÃO

Uma execução Hermes só pode alegar uso correto desta skill quando houver:

```
[PASS] classificação (spike/bounded/architectural) declarada
[PASS] intenção descoberta e registrada
[PASS] 2-3 abordagens propostas (se bounded ou architectural)
[PASS] design aprovado antes de implementar
[PASS] técnica escolhida por condição observável
[PASS] ação correspondente realmente executada
[PASS] evidência coletada depois da ação
[PASS] resultado classificado
[PASS] próxima técnica escolhida pelo novo estado
[PASS] estado final remedido
```

Se qualquer item material estiver ausente: SKILL_VERDICT=NOT_PROVEN

---

## 13. VEREDITO DE MISSÃO

A missão termina somente em:

### 🟢 FECHADO
OBJECTIVE=CLOSED
EVIDENCE=SUFFICIENT
FIXED_POINT=TRUE

### 🟡 PENDENTE
OBJECTIVE=PARTIAL
MISSING_EVIDENCE=<item>
FIXED_POINT=FALSE

### 🔴 BLOQUEADO
OBJECTIVE=BLOCKED
CAUSE=<causa comprovada>
REQUIRED_AUTHORITY_OR_RESOURCE=<item>

Nunca declarar fechamento por sensação, esforço ou quantidade de ações.

---

## 14. REGRA FINAL

> 🫁 Concentre e descubra intenção.
> 🌊 Adapte e explore ambiguidade.
> ⚡ Execute rápido o que já foi provado.
> 🐗 Perceba quando o linear falha.
> 🦋 Corrija com precisão cirúrgica.
> 🔥 Sustente até provar o fechamento.
> 🔄 Então meça tudo novamente.

INTENÇÃO define o objetivo.
ESTADO VIVO define o ponto de partida.
RESPIRAÇÃO define como Hermes atravessa a distância entre os dois.
CLASSIFICAÇÃO define se é spike, bounded ou architectural — e qual gate aplicar.

🟢 Estado: skill definida e pronta para carregar como SKILL.md.
🔎 Próximo: testar o selector automático em task real e exigir seção 12 antes de considerar homologada.


---

## 15. REMIX ADAPTATIVO — 17 RESPIRAÇÕES + TÉCNICAS + LOOPS (2026-10-24)

**Gatilho contextual:** quando o CHEFE invocar `kimetsu-brainstorm`, `Kimetsu`, `REMIX Kimetsu` ou pedir sua delegação/respiração, esta skill existente é o **único owner** da seleção. Não substitui a cadeia mestra `!CENTRALDARK`, não instala serviços, não cria roteadores/skills adicionais e não dispara todas as etapas por padrão.

**Código de seleção no mesmo owner:** `.agents/skills/kimetsu-brainstorm/scripts/remix_selector.py`. A execução do script é um **plano**, não prova de subagente executado, tool chamada ou runtime ativado. Só afirmar ativa no Hermes após invocação real + tool call + receipt.

### Fonte e status das 17 respirações

Catálogo: `docs/BRAIN/07-APRENDIZADOS-MEMORIAS/01-OURO/kimetsu-17-tecnicas-dependabot.md`.
É **registro histórico de uma missão Dependabot**, não homologação universal. A rodada considera todas as 17 posições, mas aplica somente as relevantes: 1 Ucchuha (percepção), 2 Hinoko (causa), 3 Mafu (precisão), 4 Susamaru (monitoramento), 5 Kyojuro (síntese), 6 Gyomei (verificação), 7 Sangue, 8 Inferno, 9 Sol, 10 Linha, 11 Eclipse, 12 Amanhecer, 13 Flor, 14 Serpente, 15 Gato, 16 PekOpenedki, 17 Suprema. Formas 7–17 são **candidatas históricas**, não capacidades automaticamente comprovadas. Os estilos operacionais existentes **ÁGUA, TROVÃO, FERA, INSETO, CHAMAS** permanecem válidos.

### Técnica computacional selecionada pelo motivo, não pelo enfeite

| Método | Selecionar quando | Fronteira verificável |
| --- | --- | --- |
| ToT | alternativas reais, bifurcações | comparar opções e rejeições; não gerar árvores vazias |
| CoT | tarefa sequencial simples | apresentar resumo de etapas/decisões, não raciocínio interno privado |
| ReAct | tools reais + autorização + várias etapas | invocar o owner `hermes/cot-react-loop`; tool-call + observação |
| GoT | dependências entre sistemas | grafo de dependências com IDs e fonte; sem grafo paralelo |
| AoT | busca longa com causa desconhecida | orçamento e poda explícitos; não inventar economia de tokens |
| SoT | resposta/relatório longo modular | esqueleto e blocos sem sobreposição de writer |
| PoT | conta ou algoritmo verificável | executar cálculo em ferramenta real, validar entrada/tipo/limites; não prometer precisão absoluta |
| CoT-SC | hipóteses independentes conflitantes | concordância é sinal, não evidência; contraprova decide |

Estas técnicas são **métodos selecionáveis**, não oito modelos, oito processos nem trilhas internas obrigatórias. O algoritmo propõe combinação mínima por estado observado; o Hermes decide a execução sob autoridade do CHEFE. Sem fatos novos, não trocar de respiração só para mostrar movimento.

### Acoplamento sem owner duplicado

```text
CHEFE / !CENTRALDARK / Kimetsu REMIX
→ classificação SPIKE | BOUNDED | ARCHITECTURAL
→ registrar estado OBSERVADO (UNKNOWN explícito)
→ remix_selector.py (sem efeitos colaterais)
→ HERMES aplica técnica(s) selecionada(s)
→ independent_tasks >= 2 + tools expostas + autorização?
   SIM: delegação opcional de leituras independentes com orçamento (até 5 por rodada)
   NÃO: execução serial normal; nada de agentes fictícios
→ contradição / prova faltante / estado desconhecido?
   SIM: .agents/skills/fable-loop/SKILL.md = READ_ONLY_CALIBRATION
→ >=3 etapas + tools reais + autorização?
   SIM: .agents/skills/hermes/cot-react-loop/SKILL.md = EXECUTION_WITH_TOOLS
→ Meta-Lupa e avaliador externo → receipt → estado novamente medido
→ próxima rodada: manter ou trocar por delta material observado
```

**Separar papéis:** `fable-loop` é calibração/contraprova **sem escrita**; `cot-react-loop` é o executor iterativo **quando acionável**; Kimetsu seleciona método/respiração. Nunca criar um quarto loop ou três roteadores concorrentes. **PARALLELIZE_PERCEPTION; SERIALIZE_MUTATION_BY_SCOPE.** Delegar investigação independente, não a mesma alteração para cinco writers. Sem dispatcher real exposto: `DELEGATION=PLANNED_NOT_EXECUTED`, sem fingir 10 agentes ativos. Um pedido por observação não se converte sozinho em mutação.

### Contrato mínimo de chamada

```bash
python .agents/skills/kimetsu-brainstorm/scripts/remix_selector.py --state '{"intent":"investigar erro de integração","category":"BOUNDED","authorized":false,"tools_available":false,"steps":4,"independent_tasks":3,"observed":{"cause_unknown":true,"multi_system":true}}'
python -m unittest discover -s .agents/skills/kimetsu-brainstorm/scripts -p 'test_remix_selector.py' -v
```

Entrada de estado é **fato medido pelo executor**, não flag preenchida para fabricar PASS. O seletor retorna `PLAN_ONLY` sem autorização, preserva o gate de design já existente, indica candidatos, métodos, loops necessários e limite de delegação. `EXECUTION_ELIGIBLE` significa **elegível**, jamais `EXECUTED`. O mapa histórico não substitui prova de runtime.

### Rodadas, XP e histórico reutilizável

O registro por rodada deve ficar no **receipt/ledger e owner existentes**; não abrir banco/histórico paralelo. Forma lógica do evento sanitizado:

```yaml
event: KIMETSU_REMIX_ROUND
recorded_at_utc: RUNTIME_CLOCK
intent_id: MEASURE
owner: .agents/skills/kimetsu-brainstorm/SKILL.md
head_sha: MEASURE_CURRENT
round_id: MEASURE
previous_breath: MEASURE_OR_NONE
selected_breath: MEASURE
candidate_techniques: [ToT, GoT]
selected_techniques: [MEASURE]
selection_reason: OBSERVED_DELTA
loops: {fable: CONDITIONALLY_USED_OR_SKIPPED, cot_react: CONDITIONALLY_USED_OR_SKIPPED}
delegation: {planned: 0, dispatched: 0, returned: 0, counterproved: 0}
evidence_before: ID_OR_UNKNOWN
evidence_after: ID_OR_UNKNOWN
metric_name: MEASURE_OR_NONE
metric_before: MEASURE_OR_NONE
metric_after: MEASURE_OR_NONE
gain: DELTA_MEASURED_OR_UNKNOWN
xp_awarded: 0_UNLESS_META_LUPA_LEDGER_ACCEPTS
change_reason: WHY_RETAINED_OR_SWITCHED
verdict: PASS_OR_FAIL_OR_UNKNOWN_OR_BLOCKED
receipt_ref: MEASURE
next_cursor: MEASURE
```

**XP não nasce por quantidade de tokens, modelos, subagentes ou votos.** Reutilizar `scripts/meta_lupa.py` e `references/uso-ledger.jsonl` da Meta-Lupa; somente ganho de qualidade mensurável, prova nova e antirrepetição no mesmo escopo podem render XP. Sem baseline/teste/contraprova, `GAIN=UNKNOWN; XP=0`. Cada rodada precisa de **data UTC, motivo da escolha/troca, mudança observada, evidência e histórico**. Mudança sem ganho provado é aprendizado candidato, não promoção.

### Compatibilidade e prova

Invariantes herdadas das seções 0–14: `REUSE_BEFORE_CREATE`, `ONE_OWNER_PER_CAPABILITY`, `ONE_WRITER_PER_SCOPE`, `UNKNOWN != PASS`, `ACTION != PROOF`, `EXPLICIT_ORDER = EXECUTION_REQUEST`. O script é determinístico e não faz I/O de ferramentas; testes unitários provam **lógica de seleção**, não execução Hermes, delegação real ou ativação na Casa. O Hermes deve medir seu loader e invocar os owners existentes para provar isso ao vivo.

**Changelog (2026-10-24):** evoluído o mesmo `kimetsu-brainstorm` com catálogo 17/REMIX, oito métodos como técnicas condicionais, planejamento de subagentes, hooks de `fable-loop` e `cot-react-loop`, histórico/XP condicionado a prova; razão: CHEFE quer técnicas recombinadas por rodada com melhora demonstrável. **NEXT_CURSOR:** em runtime Hermes, invocar o REMIX sobre missão real, capturar seleção + tool calls + workers que retornaram + contraprova e comparar métricas antes/depois.

### Selector obrigatório — duas superfícies com overlay

Quando o pedido mencionar duas conversas, mapeamento visual, linhas rosas ou `desktop_preview` + `drive_preview`, selecionar `13 Som` + `9 Flor` + `3 Lua` e aplicar uma única rodada correlacionada:

```text
DISCOVER_A → FRESH_MAP_A → OVERLAY_A_READBACK
→ FRESH_MAP_B → OVERLAY_B_READBACK
→ ACTIONS_ONLY_WITH_FRESH_REFS
→ ORIGIN_PROVENANCE_CHECK
```

A seleção é paralela no plano lógico, mas a execução é serial `A→B` salvo capability concorrente comprovada. Registrar `PARALLEL_EXECUTION=UNAVAILABLE|PROVEN` e não confundir overlay com ação. O seletor deve exigir `surface_id`, URL/documento, foco consistente, refs frescos e estado do composer para cada superfície.

Origem declarada é separada de origem autenticada:

```text
ACTOR=HERMES                 # declaração
ORIGIN_SOURCE=...            # binding observado
ORIGIN_AUTHENTICATED=PASS|UNKNOWN  # receipt independente
```

Mensagem contendo `ACTOR=HERMES`, resposta do Oráculo ou timestamp de UI não autentica o executor. Sem receipt do Hermes original/UIA/terminal correlacionado, o resultado permanece `UNKNOWN`; `UNKNOWN` nunca é promovido a XP, cristal ou `PASS`.

## Kimetsu + Michelin + Diálogo Reflexivo (2026-11-04)

Acoplar a [Skill Mãe](../centraldark-operational-method/SKILL.md), o [Diálogo Reflexivo da Intenção](../centraldark-operational-method/Skills/centraldark-dialogo-reflexivo-da-intencao/SKILL.md) e a [Michelin 3 Estrelas](../centraldark-operational-method/Skills/michelin-3-estrelas/SKILL.md) em execução material. Antes de escolher a respiração, distinguir conversa, correção, pergunta e ordem; preservar INTENT_PARENT e NEXT_CURSOR. Nova ideia lateral não muda missão. Respiração relevante precisa de evidência, não recitação. MARCADOR_RID_KIMETSU=TRUE.
