---
name: kimetsu-brainstorm
description: "REMIX: KIMETSU_LEGACY + brainstorming. Classifica complexidade, descobre intenção real, propõe abordagens com trade-offs, gateia aprovação humana antes de implementar. Use antes de qualquer trabalho criativo ou de implementação."
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

### Formato de output

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
