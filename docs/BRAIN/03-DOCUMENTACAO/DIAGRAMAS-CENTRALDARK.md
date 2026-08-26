---
title: "Diagramas do Sistema CentralDark"
date: 2026-06-29
updated: 2026-08-22
status: "DERIVED_VIEW"
tags: ["diagrama", "arquitetura", "fluxo", "mermaid", "sistema"]
source_rule: "CANONICO -> ARTEFATO; artefato nao inventa canonico"
---

# Diagramas CentralDark — visão derivada do canônico

> Estes diagramas são uma **visualização derivada**, não fonte da verdade.
> Estado físico/runtime que não foi medido nesta rodada permanece `UNKNOWN|UNPROVEN`.
> Histórico anterior continua preservado no Git.

```text
MERMAID != VERDADE
CANONICO -> MERMAID
MERMAID -> INVENTAR_CANONICO = FORBIDDEN
```

Fontes canônicas desta visão:

- `LEIA-ME-IA.md` — boot, autoridade e precedência;
- `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` — coordenação e Writer único;
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md` — método cognitivo/mineração;
- `scripts/memory-linker/README.md` — pipeline de memória;
- `apps/modulos/HERMES-CORE/core/perception-orchestra.mjs` — fan-out de percepção e convergência;
- `apps/modulos/HERMES-CORE/core/cognitive-council.mjs` — lentes funcionais, pool de candidatos e teto útil;
- `apps/modulos/artifacts-builder/CONTRATO-ARTEFATO-UNIVERSAL.md` — artefato derivado.

## 1. Autoridade, identidade e execução

```mermaid
flowchart TD
    CHEFE["SEGREDO/CHEFE<br/>intencao + limites + autoridade humana"]
    SOL["SOL<br/>coordena + reconcilia + protege o fio"]
    MOTORS["Modelos / ferramentas<br/>motores substituiveis"]
    HERMES["PIVETE/HERMES<br/>executor + continuidade"]
    WRITER["Writer unico por escopo<br/>muta somente o alvo autorizado"]
    VERIFY["Teste + MetaLupa + receipts<br/>prova aplicavel"]
    GIT["GitHub / canonico<br/>historia + prova"]
    REAL["Estado real medido<br/>desempata"]

    CHEFE --> SOL
    MOTORS --> SOL
    SOL --> HERMES
    SOL --> WRITER
    HERMES --> WRITER
    WRITER --> VERIFY
    VERIFY --> GIT
    GIT --> REAL
    REAL --> SOL
```

Regras representadas:

```text
MODELO != PAPEL
PAPEL != AUTORIDADE
PARALELIZE_PERCEPCAO
SERIALIZE_MUTACAO
ONE_WRITER_PER_SCOPE=true
```

## 2. Refinaria cognitiva causal

```mermaid
flowchart TD
    MAT["Materia-prima"]
    EXTRACT["Extrair capacidade"]
    COMPARE["Comparar com canonico"]
    SAME{"Ja existe?"}
    DROP["DROP_DUPLICATION"]
    DELTA["Extrair delta / provar gap"]
    ANGLES["Triangular angulos uteis"]
    INFO{"Information gain?"}
    STOP["STOP / NO_CHANGE"]
    CAUSE["Causa geradora"]
    COUNTER["Contraprova"]
    OWNER["Dono + consumidor evidenciados"]
    GOLD["Absorver ouro"]
    PROV["Preservar proveniencia<br/>remover dependencia da fonte"]

    MAT --> EXTRACT --> COMPARE --> SAME
    SAME -->|igual| DROP
    SAME -->|parcial ou novo| DELTA
    DELTA --> ANGLES --> INFO
    INFO -->|nao| STOP
    INFO -->|sim| CAUSE --> COUNTER --> OWNER --> GOLD --> PROV
```

```text
FONTE = PROVENIENCIA
CAPACIDADE = VALOR
PROVA = FILTRO
OURO = ABSORCAO
```

## 3. Memory Linker — pipeline canônico atual

```mermaid
flowchart TD
    SCOUT["Scout<br/>mede gaps"]
    FP["delta-core<br/>normaliza + fingerprint"]
    GAIN{"Fingerprint mudou?"}
    MSTOP["NO_NEW_INFORMATION<br/>nao regrava / nao acorda proxima etapa"]
    REPORT["last-report.json"]
    ANALYST["Analyst<br/>classifica delta"]
    DECISION["analyst-decision.json"]
    EXEC["Executor<br/>auto-fix documental seguro"]
    SAFE["fs-safe<br/>raiz fisica + symlink guard + escrita atomica"]
    RECEIPT["Receipt factual<br/>arquivo / commit / push separados"]
    DREAM["Dream Review<br/>candidate ou quarantine"]
    ML["MetaLupa + dono + consumidor + TOOL_MEASURED"]
    AW["Writer autorizado"]

    SCOUT --> FP --> GAIN
    GAIN -->|nao| MSTOP
    GAIN -->|sim| REPORT --> ANALYST --> DECISION --> EXEC --> SAFE --> RECEIPT
    DREAM --> ML --> AW
```

Não há claim aqui sobre scheduler, PM2, Telegram ou VPS corrente. Sem medição física recente:

```text
SCHEDULE=UNPROVEN
RUNTIME_TOPOLOGY=UNPROVEN
```

## 4. Evolução verificável e autoaplicação

```mermaid
flowchart LR
    PERCEIVE["Perceber melhor"]
    COMPRESS["Carregar menos"]
    PROVE["Provar melhor"]
    ACT["Agir melhor"]
    LEARN["Aprender melhor"]
    BEFORE["BEFORE"]
    CHANGE["DELTA"]
    AFTER["AFTER"]
    TEST["TEST + COUNTERPROOF + EVIDENCE"]
    RESULT{"Fitness delta real?"}
    EVOLVE["EVOLUTION_PROVEN"]
    NOCHANGE["NO_CHANGE / NO_EVOLUTION"]

    PERCEIVE --> COMPRESS --> PROVE --> ACT --> LEARN --> PERCEIVE
    BEFORE --> CHANGE --> AFTER --> TEST --> RESULT
    RESULT -->|sim| EVOLVE
    RESULT -->|nao| NOCHANGE
```

```text
META(X) = X APLICA A PROPRIA LEI SOBRE X
EVOLUTION = MEASURABLE_FITNESS_DELTA
EVOLUTION_REQUIRED != CHANGE_REQUIRED
```

## 5. Proveniência temporal — nome não atravessa o tempo sozinho

```mermaid
flowchart TD
    LABEL["Nome / rotulo"]
    TIME["Periodo / event time"]
    CONTEXT["Contexto social ou tecnico"]
    USE["Uso contemporaneo"]
    RECEPTION["Recepcao / interpretacao"]
    EVIDENCE["Evidencia"]
    CONTINUITY{"Continuidade provada?"}
    SAMECAP["Comparacao de capacidade/linhagem permitida"]
    UNPROVEN["UNPROVEN<br/>nao retroprojetar categoria"]

    LABEL --> TIME --> CONTEXT --> USE --> RECEPTION --> EVIDENCE --> CONTINUITY
    CONTINUITY -->|sim| SAMECAP
    CONTINUITY -->|nao| UNPROVEN
```

```text
SAME_NAME_ACROSS_TIME != SAME_MEANING
SAME_LABEL != SAME_LINEAGE
```

## 6. Organograma cognitivo — autoridade e percepção são planos diferentes

O organograma não transforma especialidade em autoridade. A linha vertical mostra **quem decide/coordena/executa**; as linhas laterais mostram **quem percebe e contraprovê**.

```mermaid
flowchart TD
    CHEFE2["SEGREDO/CHEFE<br/>AUTORIDADE FINAL"] --> SOL2["SOL<br/>coordenação + reconciliação"]
    SOL2 --> HERMES2["PIVETE/HERMES<br/>execução + continuidade"]
    SOL2 --> WRITER2["1 Writer por escopo"]
    WRITER2 --> PROVA2["teste + receipt + estado real"]
    PROVA2 --> SOL2

    SOURCE["Fontes / histórico / pessoas / projetos<br/>PROVENIÊNCIA, não autoridade"] --> PROFILE["Source Profile<br/>claims observados + origem"]
    PROFILE --> AUTO["AUTOMATION_FACTORY"]
    PROFILE --> SKEPTIC["STRUCTURAL_SKEPTIC"]
    PROFILE --> COORD["HUMAN_AGENT_COORDINATION"]
    PROFILE --> OBS["OBSERVABILITY_PROOF"]
    PROFILE --> SYN["SYNTHESIS_RECONCILIATION"]
    PROFILE --> TRUST["IDENTITY_TRUST"]

    AUTO --> B["B_IMPLEMENTATION"]
    AUTO --> D["D_SIMPLIFICATION"]
    SKEPTIC --> A["A_LOGIC"]
    SKEPTIC --> C["C_REGRESSION_FALSE_GREEN"]
    COORD --> B
    OBS --> C
    SYN --> A
    SYN --> D
    TRUST --> A
    TRUST --> C

    A --> SOL2
    B --> SOL2
    C --> SOL2
    D --> SOL2
```

A compressão é intencional:

```text
6 LENTES FUNCIONAIS
→ COBERTURA PELOS 4 ATAQUES JA EXISTENTES
→ ZERO NOVA AUTORIDADE
→ ZERO NOVO WRITER
→ ZERO VOTACAO COMO VERDADE
→ ZERO CHAMADA EXTRA EXIGIDA PELO ORGANOGRAMA
```

Uma pessoa, empresa, paper, podcast ou projeto pode alimentar um `Source Profile` somente por matéria recuperável. O perfil **não é clone da pessoa**, não recebe personalidade, voto, caneta ou autoridade. Depois da validação, a capacidade útil pode ser absorvida e a proveniência permanece registrada.

```text
SOURCE_PROFILE != PERSONA
SOURCE_PROFILE != AGENT_AUTHORITY
NAME_OR_REPUTATION != PROOF
AGREEMENT != PROOF
DIVERSIDADE_CONTROLADA + TESTE_DISCRIMINANTE + EVIDENCIA
→ CONVERGENCIA MATERIAL
```

### 6.1 Teto útil e fechamento real

O teto não é quantidade de rodadas. É o primeiro ponto em que não existe informação nova nem lacuna material aberta.

```mermaid
flowchart TD
    GAP["lacunas materiais"] --> CLASS["OPEN | UNKNOWN | RESOLVED | BLOCKED | NOT_APPLICABLE"]
    CLASS --> CHECK{"ha OPEN/UNKNOWN?"}
    CHECK -->|sim| CONT["continuar somente no residuo"]
    CHECK -->|nao| PENDING{"delta material pendente?"}
    PENDING -->|sim| CONT
    PENDING -->|nao| BLOCK{"ha BLOCKED?"}
    BLOCK -->|sim| BOUND["BLOCKED_AT_EXACT_BOUNDARY<br/>causa + owner + proxima condicao"]
    BLOCK -->|nao| INFO{"nova informacao?"}
    INFO -->|sim| CONT
    INFO -->|nao| FIXED["FIXED_POINT<br/>STOP"]
```

Regras:

```text
RESOLVED_SEM_EVIDENCIA = INVALID_RECEIPT
BLOCKED_SEM_CAUSA_OWNER_PROXIMA_CONDICAO = INVALID_RECEIPT
UNKNOWN != CLOSED
BLOCKED_BOUNDARY != FIXED_POINT
NO_NEW_INFORMATION + ZERO_MATERIAL_RESIDUAL = USEFUL_CEILING
```

O código executável correspondente vive em `apps/modulos/HERMES-CORE/core/cognitive-council.mjs` e é consumido pela `perception-orchestra.mjs`.

## Regra de manutenção deste artefato

```text
CANONICO_MUDOU_ESTRUTURALMENTE
→ atualizar este arquivo existente
→ conferir contra os donos canônicos
→ validar Mermaid quando houver parser/renderer aplicável
→ discrepância vira matéria-prima

SEM_DELTA_ESTRUTURAL
→ NO_ARTIFACT_CHANGE
```
