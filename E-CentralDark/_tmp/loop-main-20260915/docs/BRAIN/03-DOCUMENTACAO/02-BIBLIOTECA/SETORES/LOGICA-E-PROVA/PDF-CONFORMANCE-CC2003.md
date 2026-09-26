---
title: "Conformidade PDF — Horn Gate × Lógica Computacional 23"
status: "TEST_DENOMINATOR_DEFINED"
source_id: "cc2003-logica-computacional-23-nelma-moreira"
source_sha256: "b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1"
engine: "apps/modulos/HERMES-CORE/core/horn-proof-gate.mjs"
---

# 🧮 Conformidade Horn Gate × PDF

Escopo matemático fechado: **4 comportamentos do subconjunto proposicional finito de Horn usado pela CentralDark**.

## Denominador

```text
H1 = cláusula negativa forçada produz contradição
H2 = regra positiva propaga consequência forçada
H3 = não marcado permanece UNKNOWN, não FALSE
H4 = algoritmo termina quando nenhuma marca nova aparece (fixed point)

D = {H1,H2,H3,H4}
|D| = 4
```

## Caso do próprio PDF

O exemplo `p ∧ ¬q ∧ (q ∨ ¬p)` é interpretado no gate como:

```text
FATO: p
REGRA: p → q
OBJETIVO NEGATIVO: q → F

T0 = {p}
T1 = {p,q}
T2 = CONTRADIÇÃO
```

Resultado esperado: **insatisfazível** no conjunto de regras desse exemplo.

## Caso positivo de propagação

```text
FATO: p
p → q
q → r

T0 = {p}
T1 = {p,q}
T2 = {p,q,r}
T3 = T2  ← FIXED POINT
```

`r=PROVEN`.

Para um átomo `s` que não é fato nem consequência:

```text
s=UNKNOWN
s!=FALSE_PROVEN
```

## Cálculo

O teste executável `horn-proof-gate.test.mjs` mede:

```text
H1 PASS
H2 PASS
H3 PASS
H4 PASS

NUMERADOR = 4
DENOMINADOR = 4
COBERTURA_CONFORMIDADE = 4/4 = 1 = 100%
```

Este 100% é **somente sobre o denominador H1..H4**. Não significa implementação de toda Lógica de Primeira Ordem, toda resolução, toda semântica de Herbrand ou correção universal da CentralDark.

```text
PDF_SUBSET_CONFORMANCE=100%
UNIVERSAL_LOGIC_COVERAGE=UNPROVEN
SYSTEM_CORRECTNESS_100=false
```

## Relação com o motor

```text
PDF
→ HORN_PROOF_GATE
→ LIBRARY_ENTRY_ACCEPTED
→ COGNITIVE_COUNCIL
→ HORN_WRITER_GATE
→ WRITER_READY somente se premissas forem derivadas
```

Assim o PDF não fica como decoração de biblioteca: o comportamento testado participa do gate que decide passagem de conhecimento e prontidão cognitiva para mutação.
