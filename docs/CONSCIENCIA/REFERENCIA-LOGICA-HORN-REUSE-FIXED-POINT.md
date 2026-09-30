# REFERÊNCIA DERIVADA — Lógica de Horn → REUSE BEFORE CREATE → Fixed Point

status: REFERENCIA_DERIVADA
owner_autoritativo: docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json
source_local_name: tlc23(2).pdf
source_title: Lógica Computacional 23 — Introdução à Programação em Lógica
source_sha256: b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1
binary_embedded_in_repo: false

> Esta referência NÃO cria uma segunda autoridade. Ela formaliza, com base no material estudado, a matemática usada pelo contrato canônico `REUSE_BEFORE_CREATE_REQUIRED`.

## 1. Base lógica usada

O material apresenta cláusulas de Horn como regras com corpo e cabeça, equivalentes à forma operacional:

```text
(p1 ∧ p2 ∧ ... ∧ pn) -> p
```

Também apresenta a execução por propagação de consequências até não existir mais informação nova a acrescentar. Um programa definido é um conjunto finito de cláusulas de Horn positivas. Para conjuntos satisfazíveis de Horn, o modelo mínimo de Herbrand é o menor modelo que contém exatamente as consequências justificadas.

Na CentralDark, essa estrutura é usada como algoritmo de decisão, não como metáfora:

```text
FATOS MEDIDOS
  +
REGRAS DETERMINÍSTICAS
  ↓
ENCadeamento para frente
  ↓
REPETE ATÉ NÃO SURGIR FATO NOVO
  ↓
FIXED_POINT MÍNIMO
  ↓
AÇÃO MÍNIMA JUSTIFICADA
```

## 2. Correspondência CentralDark

| Lógica | CentralDark |
|---|---|
| fato atômico | evidência medida / owner conhecido / estado provado |
| corpo da cláusula | pré-condições obrigatórias |
| cabeça da cláusula | decisão derivada |
| programa de Horn | conjunto finito de regras operacionais |
| objetivo | intenção atual do CHEFE |
| modelo mínimo | menor conjunto de decisões justificadas |
| contradição | fail-closed / `UNKNOWN != PASS` |
| resolução / resposta | ação concreta + receipt |

## 3. Regras obrigatórias de criação e reuso

Estas regras são derivadas da política canônica e devem permanecer monotônicas e determinísticas:

```text
EXISTING_OWNER ∧ SAME_INTENT ∧ FULL_FIT
  -> REUSE

EXISTING_OWNER ∧ SAME_INTENT ∧ PARTIAL_FIT
  -> EXTEND_MINIMALLY

ERROR_OBSERVED ∧ ERROR_SIGNATURE_KNOWN ∧ KNOWN_REMEDY
  -> REUSE_REMEDIATION

ERROR_OBSERVED ∧ NEW_REMEDY_PROVED
  -> PROMOTE_LEARNING

PROMOTE_LEARNING ∧ SAME_ERROR_SIGNATURE
  -> REUSE_REMEDIATION

NO_EXISTING_OWNER_PROVED ∧ MATERIAL_GAP_PROVEN ∧ EXTEND_INSUFFICIENT
  -> CREATE_MINIMAL
```

### Cláusulas de bloqueio

```text
EXISTING_OWNER ∧ NO_EXISTING_OWNER_PROVED -> F

CREATE_MINIMAL ∧ REUSE -> F

CREATE_MINIMAL ∧ EXTEND_MINIMALLY -> F

CREATE_MINIMAL ∧ EXISTING_OWNER ∧ SAME_INTENT -> F
```

Se uma cláusula de bloqueio for alcançada, a decisão é inválida e o gate falha fechado.

## 4. Aprender após erro sem criar outro sistema

A aprendizagem não cria um segundo cérebro, segundo banco, segundo workflow ou segunda governança.

```text
ERRO NOVO
-> medir assinatura
-> remediar no owner existente
-> provar a correção
-> PROMOTE_LEARNING
-> persistir no owner canônico já existente
-> no próximo erro equivalente, REUSE_REMEDIATION
```

Logo:

```text
SAME_ERROR + PROVED_REMEDY
!= REDESCOBRIR_DO_ZERO

SAME_ERROR + PROVED_REMEDY
= REUSE_WITH_PROVENANCE
```

A persistência continua sendo responsabilidade dos owners canônicos existentes, como contrato global, memory-linker, receipts e mecanismos de erro/reincidência já existentes. Esta referência não cria armazenamento paralelo.

## 5. Regra do fixed point

Toda decisão deve rodar até estabilizar:

```text
F0 = fatos medidos atuais
F1 = F0 + consequências das regras satisfeitas
F2 = F1 + novas consequências
...
Fk = F(k+1)
```

Quando `Fk = F(k+1)`, alcançou-se o fixed point local.

A ação escolhida é a menor ação sustentada pelo fixed point:

```text
REUSE > EXTEND_MINIMALLY > CREATE_MINIMAL
```

`CREATE_MINIMAL` só é permitido quando a inexistência de owner/capability compatível foi provada e extensão foi provada insuficiente.

## 6. Como o PDF fica ligado a TODO código sem poluir TODO arquivo

Não copiar o PDF para cada arquivo e não repetir texto acadêmico em cada módulo.

O vínculo obrigatório é arquitetural:

```text
QUALQUER DELTA DE CÓDIGO
-> porta-de-entrada canônica
-> contrato REUSE_BEFORE_CREATE_REQUIRED
-> horn-reuse-fixed-point.test.mjs
-> fixed point mínimo
-> só então mudança aceita
```

Assim, todo código passa pela mesma matemática sem espalhar cópias, versões ou contratos paralelos.

## 7. Invariantes

```text
REUSE_BEFORE_CREATE=true
EXTEND_BEFORE_CREATE=true
LEARN_AFTER_PROVED_ERROR=true
REUSE_PROVED_REMEDIATION=true
FORWARD_CHAIN_UNTIL_FIXED_POINT=true
MINIMAL_JUSTIFIED_ACTION=true
CONTRADICTION_FAILS_CLOSED=true
UNKNOWN_IS_NOT_PASS=true
ONE_SYSTEM_ONLY=true
NO_PARALLEL_POLICY=true
```

## 8. Implementação executável

- `scripts/lupa/horn-reuse-fixed-point.mjs`
- `scripts/lupa/horn-reuse-fixed-point.test.mjs`
- `.github/workflows/porta-de-entrada.yml` chama `scripts/lupa/validar-continuidade-global.mjs`; esse guardrail executa o Horn Gate no mesmo fluxo canônico, incluindo self-test, `UNKNOWN` fail-closed e contradição fail-closed.
- `scripts/lupa/writer-safe-push-main.sh` chama o mesmo guardrail antes de publicar `main`; PR e writer automático convergem no mesmo Horn Gate.

O owner de autoridade continua sendo:

`docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`
