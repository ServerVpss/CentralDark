---
name: kimetsu-legacy-operational-method
description: Execute Kimetsu Legacy 17 Respirações with Fixed Point.
---

# Kimetsu Legacy Operational Method — Motor Operacional CentralDark

Esta skill documenta o **Motor Operacional Kimetsu Legacy** adotado como método oficial da CentralDark. Substitui e expande o método anterior (`centraldark-operational-method`).

---

## Visão Geral

O método Kimetsu Legacy modela a operação como uma **árvore de 17 Respirações** (políticas operacionais), orquestradas por um **Motor de Seleção** e fechadas por **Fixed Point** com 5 condições.

> **Concentração Total** = Kernel observador (sempre ativo)
> **Sol** = Meta-orquestrador (raiz da árvore)
> **Lua** = Espelho adversarial (contraprova obrigatória no fechamento)

---

## 1. Arquitetura das 14 Matrizes de Respiração (Cristalizadas 2026-08-23)

| # | Matriz | Essência | Derivação | Tipo |
|---|--------|----------|-----------|------|
| 0 | **CONCENTRAÇÃO TOTAL** | Kernel observador contínuo | — | Núcleo Global |
| 1 | **SOL** | Meta-orquestrador / Raiz | — | Raiz |
| 2 | **ÁGUA** | Flexibilidade / Adaptação / Contorno | — | Fundamento |
| 3 | **CHAMAS** | Persistência orientada por evidência / Sustentação | — | Fundamento |
| 4 | **TROVÃO** | Velocidade decisiva / Impacto cirúrgico | — | Fundamento |
| 5 | **VENTO** | Propagação / Blast radius / Propagação | — | Fundamento |
| 6 | **PEDRA** | Invariantes / Safety rails | — | Fundamento |
| 7 | **LUA** | Espelho adversarial / Contraprova obrigatória | Derivação paralela do Sol | Meta |
| 8 | **FLOR** | Precisão estética / Interceptação de fluxos secundários | (Água) | Especialização |
| 9 | **SERPENTE** | Rota não-linear / Dependency tracing | (Água) | Especialização |
| 10 | **INSETO** | Correção cirúrgica de baixo impacto | (Água → Flor) | Especialização |
| 11 | **AMOR** | Coesão de interfaces / Ajuste ao operador | (Chamas) | Especialização |
| 12 | **SOM** | Ritmo e sequenciamento / Timing / Telemetria | (Trovão) | Especialização |
| 13 | **NÉVOA** | Redução de entropia cognitiva / Clareza | (Vento) | Especialização |
| 14 | **FERA** | Descoberta exploratória / Mapeamento anomalias | (Vento) | Especialização |

### Árvore Completa (14 Matrizes)

```
CONCENTRAÇÃO TOTAL (Núcleo Global / Kernel Contínuo)
│
├─ SOL (Meta-Orquestrador / Raiz)
│  ├─ ÁGUA (Flexibilidade / Adaptação)
│  │  ├─ FLOR (Alta Resolução / Validação de Borda)
│  │  │  └─ INSETO (Correção Cirúrgica)
│  │  └─ SERPENTE (Rota Não-Linear / Dependency Tracing)
│  ├─ CHAMAS (Persistência Orientada por Evidência)
│  │  └─ AMOR (Coesão / Ajuste ao Operador)
│  ├─ TROVÃO (Velocidade Decisiva / Impacto Cirúrgico)
│  │  └─ SOM (Ritmo / Sequenciamento / Telemetria)
│  ├─ VENTO (Propagação / Blast Radius)
│  │  ├─ NÉVOA (Redução de Ruído / Entropia Cognitiva)
│  │  └─ FERA (Descoberta Exploratória / Mapeamento Anomalias)
│  └─ PEDRA (Invariantes / Safety Rails)
│
└─ LUA (Espelho Adversarial / Contraprova Obrigatória) — Derivação Paralela do Sol
```

**Total: 14 Matrizes (1 Núcleo + 1 Raiz + 5 Fundamentos + 1 Meta + 6 Especializações)**

### Árvore Completa

```
CONCENTRAÇÃO TOTAL (Runtime Global / Kernel)
│
├─ SOL (Meta-Orquestrador / Raiz)
│  ├─ ÁGUA (Flexibilidade)
│  │  ├─ FLOR (Alta Resolução)
│  │  │  └─ INSETO (Correção Cirúrgica)
│  │  └─ SERPENTE (Rota Não-Linear)
│  ├─ CHAMAS (Persistência Evidência)
│  │  └─ AMOR (Ajuste ao Operador)
│  ├─ TROVÃO (Velocidade Decisiva)
│  │  └─ SOM (Ritmo/Sequenciamento)
│  ├─ VENTO (Propagação/Blast Radius)
│  │  ├─ NÉVOA (Redução de Ruído / Entropia Cognitiva)
│  │  └─ FERA (Descoberta Exploratória)
│  └─ PEDRA (Invariantes/Safety Rails)
│
└─ LUA (Espelho Adversarial / Contraprova) — Derivação Paralela do Sol
```

---

## 2. Runtime Global — Concentração Total

**Sempre ativo.** Kernel observador que precede e sucede toda Respiração.

### Executar (Pré-Ação)
```text
READ_INTENT()
MEASURE_STATE()
IDENTIFY_TARGET()
IDENTIFY_WRITER()
IDENTIFY_CONSTRAINTS()
SEPARATE_KNOWN_UNKNOWN()
```

### Executar (Pós-Ação)
```text
MEASURE_AGAIN()
COMPARE_BEFORE_AFTER()
CLASSIFY_RESULT()
SELECT_NEXT_BREATH()
```

### Invariantes do Kernel
```text
UNKNOWN != PASS
ACTION != PROOF
HISTORY != CURRENT_STATE
ASSUMPTION != FACT
```

---

## 3. Motor de Seleção

```text
FUNCTION SELECT_BREATH(state):
ALWAYS:
  CONCENTRATION_TOTAL

IF visão_global_necessária:           RETURN SOL
IF invariantes_ou_risco:              RETURN PEDRA
IF causa_desconhecida:                RETURN FERA
IF informação_demais:                 RETURN NÉVOA
IF dependência_indireta:              RETURN SERPENTE
IF propagação_importa:                RETURN VENTO
IF detalhe_fino_importa:              RETURN FLOR
IF causa_exata:                       RETURN INSETO
IF caminho_bloqueado:                 RETURN ÁGUA
IF sequência_temporal:                RETURN SOM
IF persistência_evidência:            RETURN CHAMAS
IF execução_multietapa_provada:       RETURN CHAMAS
IF ajuste_operador:                   RETURN AMOR
IF ajuste_humano:                     RETURN AMOR
IF ação_curta_e_provada:              RETURN TROVÃO
IF velocidade_decisiva:               RETURN TROVÃO
IF contraprova_necessária:            RETURN LUA

BEFORE_CLOSE:
  VERIFY_DECISION_INVARIANCE
  VERIFY_WRITER_SCOPE
  VERIFY_NO_SECRET_LEAKAGE
  VERIFY_ROLLBACK_READY
  VERIFY_EVIDENCE_COLLECTED
  VERIFY_LUA_CONTRAPROVA_PASSED
```

---

## 4. Fixed Point (Fechamento Obrigatório)

### Condições de Fechamento (TODAS obrigatórias)

```text
IF objective_closed
   AND counterproof_survived
   AND applicable_invariants_hold
   AND no_material_unknown:
    FIXED_POINT=TRUE
ELSE:
    FIXED_POINT=FALSE
```

### Sequência de Fechamento (Fixed Point Sequence)

| Etapa | Respiração | Verificação |
|-------|------------|-------------|
| 1 | **SOL** | Objetivo original atingido? |
| 2 | **LUA** | Contraprova sobreviveu? |
| 3 | **VENTO** | Efeitos propagados verificados? |
| 4 | **PEDRA** | Invariantes preservadas? |

**Todas as 5 condições devem ser TRUE para `FIXED_POINT=TRUE`.**

---

## 5. Contrato de Prova

### Registro Obrigatório por Respiração Executada

```text
BREATH=
VERSE=
TRIGGER=
ACTION=
OBSERVATION=
EVIDENCE=
VERDICT=
NEXT_BREATH=
```

### Vereditos Permitidos

```text
PASS
FAIL
UNKNOWN
BLOCKED
SKIP_JUSTIFICADO
```

> **Nunca** usar `PASS` para técnica não executada. Use `SKIP_JUSTIFICADO` com razão explícita.

---

## 6. Skip Justificado

```text
BREATH=FLOR
STATUS=SKIP_JUSTIFICADO
REASON="Nenhuma análise de detalhe altera a decisão atual."
```

---

## 7. Formato de Fala do Hermes

### Antes da Execução
```text
RESPIRAÇÃO DA <NOME>
VERSO:
<verso da respiração — marcador de mudança real de política>
TRIGGER:
<condição que disparou>
EXECUÇÃO:
<ação concreta que Hermes realmente fará>
```

### Após a Execução
```text
EVIDÊNCIA:
<resultado observável>
VEREDITO:
PASS | FAIL | UNKNOWN | BLOCKED | SKIP_JUSTIFICADO
TRANSIÇÃO:
<RESPIRAÇÃO_ATUAL> → <PRÓXIMA_RESPIRAÇÃO>
```

### Regra do Verso
> **Verso = Marcador de mudança real de política operacional.**
> `Verso ≠ poesia`. Verso = "A política operacional AGORA mudou para: <Respiração>"

---

## 8. Proibições

- Não despejar nomes de técnicas sem necessidade
- Não usar `PASS` para técnica não executada
- Não fechar sem `BEFORE_CLOSE` completo
- Não declarar `FIXED_POINT=TRUE` sem 5 condições satisfeitas
- Não executar `LUA` contraprova como opcional — obrigatória no fechamento
- Não mascarar `UNKNOWN` como `PASS`
- Não executar mutação sem `WRITER_SCOPE` confirmado
- Não vazar segredos em evidência/logs/output

---

## 9. Referências

- `references/fixed-point.md` — Lógica completa do Fixed Point
- `references/motor-selecao.md` — Motor de Seleção completo
- `references/respiracoes.md` — 17 Respirações detalhadas
- `references/contrato-prova.md` — Contrato de Prova e Formato de Fala
- `references/fixed-point-sequence.md` — Sequência de fechamento
- `references/skip-justificado.md` — Skip Justificado
- `references/proibicoes.md` — Lista de proibições

---

## 10. Integração com CentralDark

### BOOT
```text
KIMETSU_LEGACY_FIXED_POINT
```

### Missão Tipo
```text
#ACORDAR
!CALIBRAR
```

### Integração Hermes
```text
hermes --profile pivete skills load kimetsu-legacy-operational-method
```

---

## 11. Histórico de Evolução

| Data | Versão | Mudança |
|------|--------|---------|
| 2026-08-22 | 1.0 | Criação inicial — arquitetura Kimetsu Legacy completa (17 Respirações, Motor de Seleção, Fixed Point, Contrato de Prova, Skip Justificado, Formato de Fala, Proibições) |

---

**BOOT:** `KIMETSU_LEGACY_FIXED_POINT`

**Status:** `FIXED_POINT_DA_ARQUITETURA=TRUE` | `FIXED_POINT_DA_INTEGRAÇÃO=FALSE` (pendente carregar no runtime Hermes)