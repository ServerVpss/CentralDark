# 🧿 CI_AGENT_CHATGPT_LABEL_DELTA_RECEIPT

status: `DELTA_UTIL_REGISTERED`
owner: `.agents/skills/centraldark-operational-method/SKILL.md`
pr: `#1463`
refs: `#1444`, `#1454`, `#1463`
writer: `SOL`
mode: `DELTA_UTIL_ONLY`

## INTENÇÃO

Registrar a falha real reportada no CI e impedir que a dor volte como texto solto de chat.

```text
AGENTE-* = PROVENIÊNCIA
AGENTE-* != AUTORIDADE
AGENTE-* != GATE_DE_PROMOÇÃO
STATUS_LABEL != PROVA
RESULT_LABEL != INPUT_DE_PROMOÇÃO
UNKNOWN_LABEL_CONSUMER != PASS
```

## DELTA_RECEBIDO

```text
failing test:
scripts/github-autonomia-varredura.test.mjs:59:1

falha:
assert.ok(pending.missingLabels.includes("🧠 AGENTE-CHATGPT"))

veredito:
teste antigo exigia AGENTE-CHATGPT como requisito operacional.
```

## RAIZ

```text
MOTOR_ATUAL:
  scripts/github-autonomia-varredura.mjs
  trata WRITER_AGENT_LABELS como compatibilidade/proveniência.

TESTE_VELHO:
  scripts/github-autonomia-varredura.test.mjs
  ainda esperava 🧠 AGENTE-CHATGPT em missingLabels.

CONFLITO:
  PROVENIENCE_AS_PROMOTION_REQUIREMENT
```

## CORREÇÃO_CANDIDATA_NO_PR

```text
scripts/github-autonomia-varredura.test.mjs
  ↓
assert.equal(pending.missingLabels.includes("🧠 AGENTE-CHATGPT"), false)
assert.equal(requiredOperationalLabels(pr()).includes("🧠 AGENTE-CHATGPT"), false)
```

## LABEL_GATE_BRUTO

```text
scripts/lupa/label-gate.mjs
scripts/lupa/label-gate.test.mjs
.github/workflows/centraldark-label-gate.yml
```

Classes separadas:

```text
PROMOTION
PROVENANCE
CAPABILITY
CATEGORY
STATUS
RESULT
PACKAGE_OR_SPECIAL
GENERIC_METADATA
UNKNOWN_CONSUMER
```

## CONTRAPROVA_ESPERADA

```text
PR com promoção completa sem 🧠 AGENTE-CHATGPT -> PASS
PR com 🧠 AGENTE-HERMES e selo completo -> PASS/UNKNOWN apenas por warning, não por gate
PR sem 👑 PERMITO-SEGREDO -> FAIL
STATUS verde sem execução -> WARNING, não PROOF
RESULT pós-merge não vira input de promoção
UNKNOWN_LABEL_CONSUMER -> UNKNOWN, não PASS
```

## SAME_HEAD_RULE

```text
RUN_COM_ASSERT_ANTIGO != JUDGE_DO_HEAD_NOVO
HISTORICAL_FAIL + NEW_HEAD -> REMEASURE
```

## CURRENT_KNOWN

```text
PR_1463=open
MERGED=false
HEAD_MEASURED=9ae619625c03a0e61ec21e980221c68811a06be7
MAIN_TOUCH=false
FIXED_POINT=false
```

## NEXT_CURSOR

```text
medir workflow runs do HEAD 9ae619625c03a0e61ec21e980221c68811a06be7
se falhar com assert antigo novamente:
  investigar checkout/base/cache/workflow que rodou arquivo velho
se falhar com erro novo:
  corrigir causa raiz mínima no mesmo owner
```

UNKNOWN != PASS
DOCUMENTED != EXECUTED
ACTION != PROOF
MERGED != DEPLOYED
