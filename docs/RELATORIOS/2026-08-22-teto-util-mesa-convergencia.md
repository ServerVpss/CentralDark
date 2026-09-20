# Teto útil — Mesa de Convergência / organograma cognitivo

> Status: AUDITORIA / PROVENIÊNCIA / NÃO É SEGUNDA FONTE DE VERDADE
> Data: 2026-08-22
> Autoridade da intenção: SEGREDO/CHEFE
> Writer desta rodada: SOL
> Branch: `feat/teto-util-convergencia-organograma-20260822`

## 1. Intenção recuperada

Generalizar o bloco cognitivo inteiro até o **teto útil**, usando organograma para tornar estrutura e fluxo visíveis, absorvendo todos os candidatos já encontrados sem transformar histórico, reputação, analogia ou consenso em prova.

```text
PASSADO_NAO_GOVERNA_PRESENTE=true
PASSADO_PODE_ALIMENTAR_FUTURO=true
MENOS_E_MAIS=true
REALITY=JUDGE
```

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

## 2. Achado gerador — o esqueleto já existia

O owner `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` já define `ONE_CORE_MANY_ARMS`, percepção paralela, dedupe, teste discriminante e Writer único.

O código `apps/modulos/HERMES-CORE/core/perception-orchestra.mjs` já materializa quatro ataques read-only:

```text
A_LOGIC
B_IMPLEMENTATION
C_REGRESSION_FALSE_GREEN
D_SIMPLIFICATION
```

Criar seis agentes permanentes adicionais seria duplicação. A generalização correta é representar seis **lentes funcionais** e cobri-las pelos quatro braços já existentes.

## 3. Mesa de Convergência — seis lentes funcionais

```text
AUTOMATION_FACTORY
STRUCTURAL_SKEPTIC
HUMAN_AGENT_COORDINATION
OBSERVABILITY_PROOF
SYNTHESIS_RECONCILIATION
IDENTITY_TRUST
```

Cobertura:

```text
AUTOMATION_FACTORY         → B_IMPLEMENTATION + D_SIMPLIFICATION
STRUCTURAL_SKEPTIC         → A_LOGIC + C_REGRESSION_FALSE_GREEN
HUMAN_AGENT_COORDINATION   → B_IMPLEMENTATION
OBSERVABILITY_PROOF        → C_REGRESSION_FALSE_GREEN
SYNTHESIS_RECONCILIATION   → A_LOGIC + D_SIMPLIFICATION
IDENTITY_TRUST             → A_LOGIC + C_REGRESSION_FALSE_GREEN
```

Resultado:

```text
6 LENTES
→ 4 ATAQUES EXISTENTES
→ ZERO WRITER EXTRA
→ ZERO AUTORIDADE EXTRA
→ ZERO VOTACAO COMO VERDADE
→ ZERO CHAMADA EXTRA OBRIGATORIA PELO ORGANOGRAMA
```

## 4. Organograma — separar autoridade de percepção

```text
PLANO_DE_AUTORIDADE:
SEGREDO/CHEFE
→ SOL
→ PIVETE/HERMES + 1 WRITER POR ESCOPO
→ TESTE/RECEIPT
→ ESTADO REAL

PLANO_DE_PERCEPCAO:
FONTES / HISTORICO / PESSOAS / PROJETOS
→ SOURCE_PROFILE
→ LENTES FUNCIONAIS
→ 4 ATAQUES EXISTENTES
→ DEDUPE + CONTRAPROVA
→ SOL
```

```text
PERCEPCAO != AUTORIDADE
ESPECIALIDADE != AUTORIDADE
FONTE != AUTORIDADE
MODELO != AUTORIDADE
CONCORDANCIA != PROVA
```

A visão Mermaid correspondente vive em `docs/BRAIN/03-DOCUMENTACAO/DIAGRAMAS-CENTRALDARK.md` e continua `DERIVED_VIEW`, nunca segunda verdade.

## 5. Perfis de fonte do bloco fornecido pelo SEGREDO/CHEFE

Os nomes abaixo foram recebidos no material humano desta rodada. A CentralDark **não verificou nesta rodada** que os rótulos descrevem de forma completa ou atual o comportamento real dessas pessoas. Portanto entram somente como proposta de `USER_SUPPLIED_SOURCE_PROFILE`.

| Fonte sugerida pelo material humano | Lente sugerida | Estado |
|---|---|---|
| Geoff Huntley | `AUTOMATION_FACTORY` | USER_SUPPLIED / CURRENT_BEHAVIOR_UNVERIFIED |
| Ian Livingstone | `STRUCTURAL_SKEPTIC` | USER_SUPPLIED / CURRENT_BEHAVIOR_UNVERIFIED |
| Dex Horthy | `HUMAN_AGENT_COORDINATION` | USER_SUPPLIED / CURRENT_BEHAVIOR_UNVERIFIED |
| Greg Pstrucha | `OBSERVABILITY_PROOF` | USER_SUPPLIED / CURRENT_BEHAVIOR_UNVERIFIED |
| Allie Howe | `SYNTHESIS_RECONCILIATION` | USER_SUPPLIED / CURRENT_BEHAVIOR_UNVERIFIED |
| Dick Hardt | `IDENTITY_TRUST` | USER_SUPPLIED / CURRENT_BEHAVIOR_UNVERIFIED |

Contrato executável em `cognitive-council.mjs`:

```text
SOURCE_PROFILE.authority=false
SOURCE_PROFILE.writer=false
SOURCE_PROFILE.persona_clone=false
SOURCE_PROFILE.vote_weight=0
```

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

O link compartilhado do Miro foi usado somente como referência humana para a ideia de organograma. O URL/token completo não foi persistido no repositório.

## 6. Pool completo dos 30 candidatos recuperados do PR #1104

Todos permanecem `HISTORICAL_CANDIDATE`. A associação com lentes abaixo é `INFERENCE_MAPPING_2026_08_22`, isto é: generalização desta rodada, não promoção automática.

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

O código carrega exatamente esses 30 registros como candidatos históricos; nenhum recebe `PASS` só por estar no pool.

## 7. Candidatos técnicos previamente encontrados

Função atual suficiente para roteamento, nome técnico preservado:

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

Nomes ainda sem equivalência humana 1:1 comprovada:

```text
SOURCE_DELTA
Operational Score / Partitura Operacional
Evidence Envelope
Workbench
Preview.tsx
DiffView.tsx
DeployButton.tsx
```

```text
PARECE_PARECIDO != EQUIVALENCIA_100_PCT
SEM_EQUIVALENCIA_100_PCT → NAO_RENOMEAR
```

## 8. Vocabulário original — estado vivo reconciliado

O PR #1112 foi re-medido durante esta própria rodada e **já estava fechado sem merge**. O delta comprovado de `PUBLICAR` e `CORRIGIR` foi portado diretamente para `main` no commit `8a99fc71a1def5ee3ab3436be19a6394f2d954bc`.

```text
PR_1112=CLOSED_NOT_MERGED
PUBLICAR_CORRIGIR_PORTED_DIRECTLY_TO_MAIN=true

CRIAR            = MATCH_ATUAL_AINDA_NAO_RESOLVIDO
MELHORAR         = MATCH_ATUAL_AINDA_NAO_RESOLVIDO
VER AO VIVO      = EQUIVALENCIA_SEMANTICA_100_PCT / COSTURA_SEGURA_PENDENTE
CORRIGIR         = APPLIED_IN_MAIN
COMPARAR         = EQUIVALENCIA_SEMANTICA_100_PCT / COSTURA_SEGURA_PENDENTE
PUBLICAR         = APPLIED_IN_MAIN
VOLTAR           = MATCH_ATUAL_AINDA_NAO_RESOLVIDO
MOSTRAR PROVA    = MATCH_ATUAL_AINDA_NAO_RESOLVIDO
```

Esta branch não reabre #1112 nem duplica `main`. O resíduo visual `COMPARAR|VER_AO_VIVO` permanece uma lacuna de superfície separada; `CRIAR|MELHORAR|VOLTAR|MOSTRAR_PROVA` continuam sem match 100% e portanto intactos.

## 9. Teto útil — contrato de fechamento real

Estados aceitos:

```text
OPEN
UNKNOWN
RESOLVED
BLOCKED
NOT_APPLICABLE
```

Regras executáveis:

```text
RESOLVED
→ exige evidence_refs

BLOCKED
→ exige cause + owner + next_condition

OPEN|UNKNOWN
→ impede fixed point

BLOCKED_EXATO
→ fecha a tentativa na fronteira declarada
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

Isto impede transformar cansaço, quantidade de rodadas ou consenso narrativo em fechamento.

## 10. Garantia dura: regra + consumidor + testes + gate

```text
REGRA EXECUTAVEL
→ apps/modulos/HERMES-CORE/core/cognitive-council.mjs

CONSUMIDOR REAL
→ apps/modulos/HERMES-CORE/core/perception-orchestra.mjs

TESTES POSITIVOS/NEGATIVOS
→ apps/modulos/HERMES-CORE/core/cognitive-council.test.mjs

GATE BLOQUEANTE EXISTENTE
→ apps/modulos/HERMES-CORE/core/continuity-guard.test.mjs
→ importa cognitive-council.test.mjs
→ .github/workflows/porta-de-entrada.yml já executa continuity-guard.test.mjs
```

Não foi criado workflow paralelo.

`DOCUMENTED != EXECUTED`, portanto promoção continua condicionada ao CI no mesmo HEAD.

## 11. SOURCE_DELTA — cano vivo já existe, mas não cobre toda a visão ainda

A medição do owner `scripts/memory-linker/SOURCE-DELTA.md` e do consumidor físico `supabase/functions/catalog-sync/index.ts` provou:

```text
ONE_SOURCE_DELTA_ENGINE=true
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
```

Adapters físicos atuais comprovados:

```text
mcp-tools:centraldark
github-release:<owner/repo>
```

O fluxo já preserva checkpoint, ETag/Last-Modified, content/capability fingerprint, `NO_CHANGE` e `PENDING_REFINERY`.

Porém o bloco humano pediu também posts, podcasts, artigos, talks e outras fontes públicas vivas. Nesta rodada **não foi encontrado adapter genérico atual comprovado para RSS/Atom/web/social** no owner físico.

Portanto:

```text
LIVE_PUBLIC_SOURCE_GENERIC_ADAPTER=GAP_REAL
GITHUB_RELEASE_SOURCE=PROVEN_EXISTING
MCP_TOOLS_SOURCE=PROVEN_EXISTING
RSS_ATOM_WEB_SOCIAL_GENERIC_SOURCE=NOT_IMPLEMENTED_IN_THIS_BRANCH
```

Não fabricar fonte, endpoint ou identidade. Antes de cadastrar uma pessoa como fonte viva é necessário provar o endpoint público correto e a licença/segurança aplicável. A arquitetura já sabe receber `Source Profile`; a coleta genérica ainda é resíduo material separado do conselho cognitivo.

## 12. Google Drive — passado como minério, não governo

A busca desta rodada encontrou material histórico no Drive que reforça regras já canônicas: não fabricar teatro técnico, não transformar inferência em fato e não atribuir ao mecanismo capacidades que ele não possui.

O material foi tratado como proveniência histórica de reforço, não como nova autoridade e não criou contrato paralelo.

## 13. Lacunas reais após a generalização

```text
COGNITIVE_COUNCIL_CODE
= IMPLEMENTED_IN_BRANCH
= CI_EXECUTION_PENDING

30_CANDIDATES_PR_1104
= ALL_REGISTERED_AS_HISTORICAL_CANDIDATE
= NO_AUTOMATIC_PROMOTION

PUBLIC_SOURCE_PROFILES
= USER_SUPPLIED_MAPPING_EXISTS
= CURRENT_BEHAVIOR_UNVERIFIED
= SOURCE_ENDPOINTS_UNVERIFIED

SOURCE_DELTA_GENERIC_PUBLIC_FEED
= REAL_GAP
= EXISTING_OWNER_IDENTIFIED
= NOT_IMPLEMENTED_YET

PR_1112
= CLOSED_NOT_MERGED

PUBLICAR|CORRIGIR
= IN_MAIN

COMPARAR|VER_AO_VIVO
= 100_PCT_EQUIVALENCE
= SAFE_STITCH_PENDING

CRIAR|MELHORAR|VOLTAR|MOSTRAR_PROVA
= UNRESOLVED

RUNTIME
= NOT_MEASURED_BY_THIS_BRANCH

CI
= REQUIRED_BEFORE_PROMOTION
```

## 14. Fixed point arquitetural pretendido

```text
MATERIA EXTERNA/HISTORICA
→ SOURCE_PROFILE
→ SOURCE_DELTA QUANDO ADAPTER EXISTE
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

> **fonte vira proveniência; capacidade vira lente; concordância vira hipótese; prova decide.**

E a régua do teto útil:

> **diversidade controlada aumenta a chance de enxergar; só a prova transforma convergência em conhecimento.**
