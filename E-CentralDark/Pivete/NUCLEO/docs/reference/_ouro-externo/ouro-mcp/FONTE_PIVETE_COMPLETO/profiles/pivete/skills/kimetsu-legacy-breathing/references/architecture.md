# Kimetsu Legacy Breathing — Arquitetura Detalhada

## Visão Geral

Este documento detalha a arquitetura completa do motor operacional Kimetsu Legacy, mapeando as 14 Respirações canônicas de *Demon Slayer: Kimetsu no Yaiba* para políticas operacionais executáveis.

---

## 1. CONCENTRAÇÃO TOTAL — Runtime Global (Kernel)

### Verso
> Nenhuma técnica permanece precisa quando o estado deixa de ser observado.

### Papel
Concentração Total é o **kernel operacional**. Ela permanece ativa durante TODAS as Respirações. Não compete com elas — as mantém funcionando.

### Executar — Antes de Agir
```text
READ_INTENT()           # Capturar intenção declarada
MEASURE_STATE()         # Medir estado atual do sistema
IDENTIFY_TARGET()       # Identificar alvo material da ação
IDENTIFY_WRITER()       # Identificar writer único do escopo
IDENTIFY_CONSTRAINTS()  # Mapear restrições (autorização, risco, tempo)
SEPARATE_KNOWN_UNKNOWN() # Separar fatos de hipóteses
```

### Executar — Depois de Agir
```text
MEASURE_AGAIN()              # Medir estado pós-ação
COMPARE_BEFORE_AFTER()       # Diff material entre estados
CLASSIFY_RESULT()            # PASS | FAIL | BLOQUEIO_COMPROVADO
SELECT_NEXT_BREATH()         # Sol decide próxima Respiração
```

### Invariantes (NUNCA VIOLAR)
```text
UNKNOWN != PASS
ACTION != PROOF
HISTORY != CURRENT_STATE
ASSUMPTION != FACT
```

---

## 2. RESPIRAÇÃO DO SOL — Meta-Orquestrador

### Verso
> Veja o sistema inteiro antes de escolher qual força deve governar o próximo movimento.

### Função
Sol NÃO executa. Sol OBSERVA, CLASSIFICA, ROTEIA, COLETA EVIDÊNCIA, REAVALIA.
Sol decide qual Respiração especializada deve assumir o próximo passo.

### Executar
```
OBSERVE → CLASSIFY → ROUTE → EXECUTE SPECIALIST → COLLECT EVIDENCE → REASSESS
```

### Perguntas Obrigatórias do Sol
```
Qual é a intenção?
Onde estamos?
Qual é a ferida?
Que tipo de problema é este?
Qual Respiração possui maior ajuste?
Qual o blast radius?
```

### Prova do Sol
```
STATE_CLASSIFIED=
BREATH_SELECTED=
SELECTION_REASON=
```

---

## 3. LUA — Espelho Adversarial (Derivação Paralela do Sol)

### Verso
> O que parece verdadeiro sob uma luz, revela-se falho sob outra.

### Natureza
A Lua NÃO é uma Respiração de execução. É um **espelho adversarial**.
Opera **APÓS** a execução de qualquer Respiração, ANTES do veredito final.

### Função
Autocrítica rigorosa. Refutação da própria linha de raciocínio antes do fechamento.
Contraprova obrigatória.

### Executar
```
ASSUME_SUCCESS → INVERT_ASSUMPTION → FIND_COUNTER_EVIDENCE → ATTEMPT_REFUTATION
IF_REFUTED: RETURN_TO_SOL
IF_HOLDS: VERDICT_PASS
```

### Perguntas da Lua
```
E se a premissa for falsa?
E se o efeito for coincidência?
E se houver causa oculta?
E se o teste for insuficiente?
E se houver regressão silenciosa?
```

### Prova da Lua
```
ASSUMPTION_TESTED=
COUNTER_EVIDENCE=
REFUTED=TRUE|FALSE
VERDICT=
```

---

## 4. FIXED POINT

```
Fixed Point = SUCESSO COM EVIDÊNCIA  OU  BLOQUEIO_COMPROVADO
```

Nada de "travado por dúvida". Só para quando:
- ✅ Objetivo fechado com evidência
- 🔴 Bloqueio real, material, documentado
  (autorização, segredo, risco destrutivo, Writer conflitante, estado UNKNOWN irreconciliável)
```

---

## 4. FLUXO OPERACIONAL COMPLETO

```
CONCENTRAÇÃO TOTAL (sempre ativa)
    ↓
SOL (observa → classifica → roteia)
    ↓
RESPIRAÇÃO ESPECIALIZADA (executa)
    ↓
CONCENTRAÇÃO TOTAL (mede → compara → classifica)
    ↓
LUA (espelho adversarial → contraprova)
    ↓
VEREDICTO: PASS | FAIL | BLOQUEIO_COMPROVADO
    ↓
TRANSIÇÃO → PRÓXIMA RESPIRAÇÃO OU ENCERRAMENTO
```

---

## 5. ESTADO DA ARQUITETURA

| Item | Status |
|------|--------|
| `FIXED_POINT_DA_ARQUITETURA` | `TRUE` |
| `FIXED_POINT_DA_INTEGRAÇÃO` | `FALSE` (pendente runtime Hermes) |
| Respirações modeladas | 14/14 + Kernel + Lua |
| Kernel | Concentração Total |
| Orquestrador | Sol |
| Espelho Adversarial | Lua |

---

## 6. REFERÊNCIAS

- [Kimetsu no Yaiba Wiki - Breathing Style](https://kimetsu-no-yaiba.fandom.com/wiki/Breathing_Style)
- [Kimetsu no Yaiba Wiki - Category:Abilities](https://kimetsu-no-yaiba.fandom.com/wiki/Category%3AAbilities)
- Demon Slayer: Kimetsu no Yaiba — Crunchyroll, IGN, Kimetsu no Yaiba Wiki
- Referências conceituais extraídas de sessão operacional com CHEFE/SEGREDO