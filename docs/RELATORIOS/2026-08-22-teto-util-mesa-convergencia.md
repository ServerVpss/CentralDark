# Teto útil — Mesa de Convergência / organograma cognitivo

> Status: AUDITORIA / PROVENIÊNCIA / NÃO É SEGUNDA FONTE DE VERDADE
> Data: 2026-08-22
> Autoridade da intenção: SEGREDO/CHEFE
> Writer desta rodada: SOL
> Branch: `feat/teto-util-convergencia-organograma-20260822`

## 1. Intenção recuperada

A intenção recebida nesta rodada foi generalizar o bloco inteiro até o **teto útil**, usando organograma como representação visual da estrutura, absorvendo todos os candidatos já encontrados e preservando a lei:

```text
PASSADO_NAO_GOVERNA_PRESENTE=true
PASSADO_PODE_ALIMENTAR_FUTURO=true
```

O objetivo não é aumentar quantidade de agentes, personagens ou iterações. É maximizar cobertura material até que não exista informação nova nem lacuna material aberta.

```text
TETO_UTIL
= MAX(COBERTURA_MATERIAL + GANHO_VERIFICAVEL + REUSO)
  SOB:
  UMA_AUTORIDADE_HUMANA
  UMA_SOL
  UM_WRITER_POR_ESCOPO
  ZERO_VOTACAO_COMO_VERDADE
  ZERO_PERSONA_CLONE
  ZERO_NOVO_SISTEMA_SE_O_ATUAL_COBRE
```

## 2. Achado principal — a Casa já possuía o esqueleto

O owner existente `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` já define `ONE_CORE_MANY_ARMS`, percepção paralela, dedupe, teste discriminante e Writer único.

O código existente `apps/modulos/HERMES-CORE/core/perception-orchestra.mjs` já materializa quatro ataques read-only:

```text
A_LOGIC
B_IMPLEMENTATION
C_REGRESSION_FALSE_GREEN
D_SIMPLIFICATION
```

Portanto criar seis novos agentes permanentes seria duplicação. A costura adotada generaliza **lentes funcionais** sobre esses quatro ataques.

## 3. Mesa de Convergência — seis lentes funcionais

```text
AUTOMATION_FACTORY
STRUCTURAL_SKEPTIC
HUMAN_AGENT_COORDINATION
OBSERVABILITY_PROOF
SYNTHESIS_RECONCILIATION
IDENTITY_TRUST
```

Cobertura comprimida:

```text
AUTOMATION_FACTORY         → B_IMPLEMENTATION + D_SIMPLIFICATION
STRUCTURAL_SKEPTIC         → A_LOGIC + C_REGRESSION_FALSE_GREEN
HUMAN_AGENT_COORDINATION   → B_IMPLEMENTATION
OBSERVABILITY_PROOF        → C_REGRESSION_FALSE_GREEN
SYNTHESIS_RECONCILIATION   → A_LOGIC + D_SIMPLIFICATION
IDENTITY_TRUST             → A_LOGIC + C_REGRESSION_FALSE_GREEN
```

Resultado estrutural:

```text
6 LENTES
→ 4 ATAQUES EXISTENTES
→ ZERO WRITER EXTRA
→ ZERO AUTORIDADE EXTRA
→ ZERO CHAMADA EXTRA OBRIGATORIA
```

## 4. Perfis de fonte do bloco fornecido pelo SEGREDO/CHEFE

Os nomes abaixo vieram do texto colado pelo SEGREDO/CHEFE nesta rodada. A CentralDark **não verificou nesta rodada** que esses rótulos descrevem de forma completa ou atual o comportamento real dessas pessoas. Portanto entram como `USER_SUPPLIED_SOURCE_PROFILE`, não como fato biográfico, persona ou autoridade.

| Fonte sugerida pelo material humano | Lente sugerida | Estado |
|---|---|---|
| Geoff Huntley | `AUTOMATION_FACTORY` | USER_SUPPLIED / CURRENT_BEHAVIOR_UNVERIFIED |
| Ian Livingstone | `STRUCTURAL_SKEPTIC` | USER_SUPPLIED / CURRENT_BEHAVIOR_UNVERIFIED |
| Dex Horthy | `HUMAN_AGENT_COORDINATION` | USER_SUPPLIED / CURRENT_BEHAVIOR_UNVERIFIED |
| Greg Pstrucha | `OBSERVABILITY_PROOF` | USER_SUPPLIED / CURRENT_BEHAVIOR_UNVERIFIED |
| Allie Howe | `SYNTHESIS_RECONCILIATION` | USER_SUPPLIED / CURRENT_BEHAVIOR_UNVERIFIED |
| Dick Hardt | `IDENTITY_TRUST` | USER_SUPPLIED / CURRENT_BEHAVIOR_UNVERIFIED |

Contrato absorvido:

```text
PESSOA|PROJETO|PAPER|PODCAST|REPO
→ SOURCE_PROFILE
→ CLAIMS OBSERVADOS + PROVENIENCIA
→ CAPACIDADE/LENTE
→ CONTRAPROVA
→ DELTA

SOURCE_PROFILE != PERSONA
SOURCE_PROFILE != AUTORIDADE
SOURCE_PROFILE != WRITER
SOURCE_PROFILE != VOTO
```

O link compartilhado do Miro foi tratado como referência humana para a ideia de organograma. O token/link completo **não foi persistido no repositório**.

## 5. Pool completo dos 30 candidatos recuperados do PR #1104

Todos permanecem `HISTORICAL_CANDIDATE`; a associação com lentes abaixo é uma **generalização/inferência desta rodada**, não promoção automática de capacidade.

### A — Cognição + aprendizado

| ID | Candidato | Lentes |
|---|---|---|
| A01 | Transferência por Estrutura | SYNTHESIS_RECONCILIATION + HUMAN_AGENT_COORDINATION |
| A02 | Dedução/Indução/Abdução | STRUCTURAL_SKEPTIC + SYNTHESIS_RECONCILIATION |
| A03 | Profundidade Adaptativa | STRUCTURAL_SKEPTIC + SYNTHESIS_RECONCILIATION |
| A04 | Backtracking/Reavaliação | STRUCTURAL_SKEPTIC |
| A05 | Generalização/Holdout | STRUCTURAL_SKEPTIC + OBSERVABILITY_PROOF |
| A06 | Recibo Estruturado de Aprendizado | OBSERVABILITY_PROOF |
| A07 | Promoção de Experiência Provada | OBSERVABILITY_PROOF + SYNTHESIS_RECONCILIATION |
| A08 | Quality Gate de Conhecimento | OBSERVABILITY_PROOF + STRUCTURAL_SKEPTIC |
| A09 | Versionamento Temporal | OBSERVABILITY_PROOF |
| A10 | Ponte Pedagógica com Invariância | SYNTHESIS_RECONCILIATION + HUMAN_AGENT_COORDINATION |

### B — Orquestração + eficiência

| ID | Candidato | Lentes |
|---|---|---|
| B01 | Determinístico antes do LLM | STRUCTURAL_SKEPTIC + OBSERVABILITY_PROOF + AUTOMATION_FACTORY |
| B02 | Vizinhança de Grafo | SYNTHESIS_RECONCILIATION |
| B03 | Arquiteto–Executor | HUMAN_AGENT_COORDINATION |
| B04 | Menor Motor Suficiente | SYNTHESIS_RECONCILIATION + STRUCTURAL_SKEPTIC + AUTOMATION_FACTORY |
| B05 | Orçamento de Contexto | SYNTHESIS_RECONCILIATION |
| B06 | Fronteira LLM↔Ferramenta | HUMAN_AGENT_COORDINATION + OBSERVABILITY_PROOF + IDENTITY_TRUST |
| B07 | Microtarefas com Continuidade | HUMAN_AGENT_COORDINATION + AUTOMATION_FACTORY |
| B08 | Isolamento de Dependências | STRUCTURAL_SKEPTIC + IDENTITY_TRUST |
| B09 | Transporte Fora de Banda | HUMAN_AGENT_COORDINATION + IDENTITY_TRUST |
| B10 | Isolamento de Middlebox por Protocolo | IDENTITY_TRUST + STRUCTURAL_SKEPTIC |

### C — Segurança + prova + resiliência

| ID | Candidato | Lentes |
|---|---|---|
| C01 | Dado ≠ Instrução | IDENTITY_TRUST + STRUCTURAL_SKEPTIC |
| C02 | Recibo Pré-Ingestão | OBSERVABILITY_PROOF + IDENTITY_TRUST |
| C03 | Quarentena Sensível | IDENTITY_TRUST |
| C04 | Proveniência Forense | OBSERVABILITY_PROOF + IDENTITY_TRUST |
| C05 | Gate de Falso Verde | OBSERVABILITY_PROOF + STRUCTURAL_SKEPTIC |
| C06 | Rollback Verificável | OBSERVABILITY_PROOF + STRUCTURAL_SKEPTIC |
| C07 | Quarentena Temporal | IDENTITY_TRUST + OBSERVABILITY_PROOF |
| C08 | Dedupe de Espelho | SYNTHESIS_RECONCILIATION + OBSERVABILITY_PROOF |
| C09 | Validação Determinística de Saída | OBSERVABILITY_PROOF + STRUCTURAL_SKEPTIC |
| C10 | Red Teaming com Fronteira Defensiva | STRUCTURAL_SKEPTIC + IDENTITY_TRUST |

Código correspondente: `apps/modulos/HERMES-CORE/core/cognitive-council.mjs`.

## 6. Candidatos técnicos anteriormente encontrados

### Função atual suficientemente provada para roteamento, nome técnico preservado

```text
Memory Linker
→ síntese/dedupe + prova/receipts
→ NÃO renomeado

Dream Review
→ consolidação isolada de candidatos + contraprova antes de promoção
→ NÃO renomeado

Pattern Discovery
→ sensor determinístico de recorrência; padrão não é prova
→ NÃO renomeado

Continuity Guard
→ continuidade fail-closed, autoridade/HEAD/controls
→ NÃO renomeado
```

### Nomes que continuam sem equivalência humana 1:1 comprovada

```text
SOURCE_DELTA
Operational Score / Partitura Operacional
Evidence Envelope
Workbench
Preview.tsx
DiffView.tsx
DeployButton.tsx
```

A regra permanece:

```text
PARECE_PARECIDO != EQUIVALENCIA_100_PCT
SEM_EQUIVALENCIA_100_PCT → NAO_RENOMEAR
```

## 7. Botões/modelos mentais originais recuperados no PR #1112

```text
CRIAR            = MATCH_ATUAL_AINDA_NAO_RESOLVIDO
MELHORAR         = MATCH_ATUAL_AINDA_NAO_RESOLVIDO
VER AO VIVO      = MATCH_SEMANTICO_100_PCT / COSTURA PENDENTE NO PR #1112
CORRIGIR         = COSTURADO NO PR #1112
COMPARAR         = MATCH_SEMANTICO_100_PCT / COSTURA PENDENTE NO PR #1112
PUBLICAR         = COSTURADO NO PR #1112
VOLTAR           = MATCH_ATUAL_AINDA_NAO_RESOLVIDO
MOSTRAR PROVA    = MATCH_ATUAL_AINDA_NAO_RESOLVIDO
```

Esta branch **não invade o Writer/scope do PR #1112**. Ela generaliza a arquitetura cognitiva e deixa a costura visual naquele escopo.

## 8. Teto útil — contrato de fechamento real

Estados aceitos de lacuna:

```text
OPEN
UNKNOWN
RESOLVED
BLOCKED
NOT_APPLICABLE
```

Regras executáveis adicionadas:

```text
RESOLVED
→ exige evidence_refs

BLOCKED
→ exige causa exata + owner + next_condition

OPEN|UNKNOWN
→ impede fixed point

BLOCKED_EXATO
→ pode encerrar a tentativa na fronteira declarada
→ NÃO vira fixed point

NEW_INFORMATION=true
→ continuar

MATERIAL_DELTA_PENDING=true
→ continuar

ZERO_OPEN
+ ZERO_UNKNOWN
+ ZERO_BLOCKED
+ ZERO_NEW_INFORMATION
+ ZERO_MATERIAL_DELTA_PENDING
+ TODOS_RESOLVED_COM_PROVA_OU_NOT_APPLICABLE
→ FIXED_POINT
→ STOP
```

Isto impede transformar cansaço, número de rodadas ou consenso narrativo em fechamento.

## 9. Prova e consumidor

A nova regra não ficou só em Markdown:

```text
REGRA EXECUTAVEL
→ apps/modulos/HERMES-CORE/core/cognitive-council.mjs

CONSUMIDOR REAL
→ apps/modulos/HERMES-CORE/core/perception-orchestra.mjs

TESTES POSITIVOS/NEGATIVOS
→ apps/modulos/HERMES-CORE/core/cognitive-council.test.mjs

GATE EXISTENTE RELACIONADO
→ porta-de-entrada executa a suíte HERMES de continuidade/percepção
```

A promoção continua condicionada ao CI do PR. `DOCUMENTED != EXECUTED` e `BRANCH_CODE != MAIN`.

## 10. Google Drive — achado histórico útil

A busca nesta rodada encontrou no Drive um material histórico (`TXT.txt`) que reforça uma regra já presente no canônico: não fabricar “teatro” técnico, não transformar inferência em fato e não atribuir à IA capacidades que o mecanismo não possui.

O achado foi usado como **proveniência de reforço**, não como nova autoridade e não criou segundo contrato.

## 11. Lacunas reais após a generalização

```text
SOURCE_PROFILES_PUBLICOS
= material fornecido pelo CHEFE existe
= claims atuais das pessoas NÃO foram verificados nesta rodada
= não impede o mecanismo; impede apenas afirmar biografia/capacidade atual como FACT

PR_1104_CANDIDATES
= recuperados como candidatos históricos
= não promovidos por esta branch

PR_1112_VOCABULARIO
= Writer/scope separado preservado
= quatro rótulos ainda sem match 100%

RUNTIME
= não medido por esta branch
= nenhum claim de deploy/serviço ligado foi feito

CI
= precisa executar no HEAD desta branch antes de qualquer promoção
```

## 12. Fixed point arquitetural pretendido

```text
MATERIA EXTERNA/HISTORICA
→ SOURCE_PROFILE
→ 6 LENTES FUNCIONAIS
→ 4 ATAQUES EXISTENTES
→ DEDUPE
→ CONTRAPROVA
→ REALIDADE DESEMPATA
→ 1 WRITER
→ PROVA
→ LACUNAS
→ CAÇAR SOMENTE RESIDUO MATERIAL
→ FIXED_POINT SOMENTE COM FECHAMENTO PROVADO
```

Princípio condensado:

> **diversidade controlada aumenta a chance de enxergar; só a prova transforma convergência em conhecimento.**
