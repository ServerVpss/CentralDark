---
name: kimetsu-legacy-breathing
description: Apply Kimetsu Legacy Respirações as operational policies.
---

# Kimetsu Legacy Breathing Engine

Sistema operacional adaptativo baseado na arquitetura de Respirações de *Demon Slayer: Kimetsu no Yaiba*. Cada Respiração = política operacional executável.

## Arquitetura

```
CONCENTRAÇÃO TOTAL (Runtime Global / Kernel)
│
├─ SOL (Meta-Orquestrador / Raiz)
│  ├─ ÁGUA (Flexibilidade / Adaptação)
│  │  ├─ FLOR (Alta Resolução / Observação)
│  │  │  └─ INSETO (Inspeção Minuciosa / Correção Cirúrgica)
│  │  └─ SERPENTE (Rota Não-Linear / Dependency Tracing)
│  ├─ CHAMAS (Persistência Orientada por Evidência)
│  │  └─ AMOR (Ajuste ao Operador / Human-System Fit)
│  ├─ TROVÃO (Velocidade Decisiva / Impacto Cirúrgico)
│  │  └─ SOM (Ritmo / Sequenciamento / Timing)
│  ├─ VENTO (Propagação / Blast Radius)
│  │  ├─ NÉVOA (Redução de Ruído / Filtragem)
│  │  └─ FERA (Força Bruta Controlada / Descoberta Exploratória)
│  └─ PEDRA (Invariantes / Safety Rails)
│
└─ LUA (Espelho Adversarial / Contraprova) — Derivação Paralela do Sol
```

## Resumo das 14 Respirações

| # | Respiração | Essência | Derivação |
|---|------------|----------|-----------|
| 0 | CONCENTRAÇÃO TOTAL | Kernel observador | — |
| 1 | SOL | Meta-orquestrador | Raiz |
| 2 | ÁGUA | Flexibilidade / Adaptação | — |
| 3 | CHAMAS | Persistência orientada por evidência | — |
| 4 | TROVÃO | Velocidade decisiva / Impacto cirúrgico | — |
| 5 | VENTO | Propagação / Blast radius | — |
| 6 | PEDRA | Invariantes / Safety rails | — |
| 7 | FLOR | Observação alta resolução | (Água) |
| 8 | INSETO | Inspeção minuciosa / Correção cirúrgica | (Água → Flor) |
| 9 | SERPENTE | Rota não-linear / Dependency tracing | (Água) |
| 10 | AMOR | Ajuste ao operador / Human-system fit | (Chamas) |
| 11 | SOM | Ritmo e sequenciamento / Timing | (Trovão) |
| 12 | NÉVOA | Redução de ruído / Filtragem | (Vento) |
| 13 | FERA | Força bruta controlada / Descoberta | (Vento) |
| 14 | LUA | Espelho adversarial / Contraprova | Derivação paralela do Sol |

## Motor de Seleção

```text
FUNCTION SELECT_BREATH(state):
ALWAYS:
  CONCENTRAÇÃO TOTAL

IF visão_global_necessária:
  RETURN SOL

IF invariantes_ou_risco:
  RETURN PEDRA

IF causa_desconhecida:
  RETURN FERA

IF informação_demais:
  RETURN NÉVOA

IF dependência_indireta:
  RETURN SERPENTE

IF propagação_importa:
  RETURN VENTO

IF detalhe_fino_importa:
  RETURN FLOR

IF causa_exata:
  RETURN INSETO

IF caminho_bloqueado:
  RETURN ÁGUA

IF sequência_temporal:
  RETURN SOM

IF persistência_evidência:
  RETURN CHAMAS

IF ajuste_operador OR ajuste_humano:
  RETURN AMOR

IF ação_curta_e_provada OR velocidade_decisiva:
  RETURN TROVÃO

IF contraprova_necessária:
  RETURN LUA
```

## Técnicas de Inspeção (Respiração INSETO/FLOR/NÉVOA)

### ZOOM_IN
Ativa resolução máxima para inspeção atômica de alvo único.

### COMPARE_EXPECTED_ACTUAL
Diff byte-a-byte/campo-a-campo entre estado esperado e atual.

### IDENTIFY_SMALL_ANOMALIES
Varredura exaustiva de subespaço → baseline → diff → filtro ruído → classificação → ranqueamento.

### ORDER_BY_RELEVANCE
Ranqueamento por: `RELEVÂNCIA = (IMPACTO×0.5) + (PROB_CAUSA_RAIZ×0.3) + (RASTREABILIDADE×0.2)`

**Cortes:**
- ≥ 0.70 → ZOOM_IN imediato
- 0.40-0.69 → MONITOR ativo
- < 0.40 → LOG_ONLY

### Signal Extraction (Respiração NÉVOA)
```
COLLECT_SIGNALS → REMOVE_IRRELEVANT → CLUSTER_RELEVANT → ISOLATE_DECISION_VARIABLES → VALIDATE_DECISION_INVARIANCE
```
**Regra:** Se remoção do sinal NÃO muda a decisão → ruído.

**Princípio:** Névoa NÃO esconde informação. Névoa REVELA ao remover o que não decide = **Reduzir entropia cognitiva**.

## Referências
- `references/kimetsu-legacy-architecture.md` — Arquitetura completa
- `references/motor-selecao.md` — Motor de seleção completo
- `references/inspecao-tecnicas.md` — Técnicas de inspeção detalhadas
- `references/respiracoes-detalhadas.md` — Cada Respiração com verso, uso, execução, essência, prova

## BOOT
`KIMETSU_LEGACY_FIXED_POINT`

## Fixed Points
- `FIXED_POINT_DA_ARQUITETURA = TRUE`
- `FIXED_POINT_DA_INTEGRAÇÃO = FALSE` (pendente runtime Hermes)

## Regras Fundamentais
- `UNKNOWN != PASS`
- `ACTION != PROOF`
- `HISTORY != CURRENT_STATE`
- `ASSUMPTION != FACT`
- `PARALLELIZE_PERCEPTION`
- `SERIALIZE_MUTATION`
- Writer não julga sozinho a própria vitória (LUA)