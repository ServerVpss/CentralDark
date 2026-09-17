# CENTRALDARK — GUARDRAILS DO PERFIL DE MISSÃO PR #1558

**Escopo:** `PR #1558`  
**Classe:** constraint do perfil de missão; **não** é novo cérebro, owner, engine, skill raiz ou autoridade paralela.

## 1. Limite de autoridade

```text
AUTHORITY_CLASS=MISSION_PROFILE_CONSTRAINT
SCOPE=PR#1558
INHERITS_CANONICAL_HERMES=true
INHERITS_TLC23=true
MAY_OVERRIDE_CANONICAL=false
MAY_CREATE_PARALLEL_OWNER=false
ONE_SYSTEM_ONLY=true
ONE_CORE_ONLY=true
REUSE_BEFORE_CREATE=true
```

`AGENTE-PREMIUM-TLC23.md` deve ser interpretado como **perfil operacional especializado da missão do PR #1558**.

Em qualquer conflito semântico ou operacional:

```text
CONTRATO_CANONICO_CENTRALDARK
> HERMES_CORE_CANONICO
> TLC23_CANONICO
> PERFIL_DA_MISSAO_PR1558
```

O perfil da missão pode **especializar contexto, ordem de trabalho e critérios do PR**, mas não pode substituir owner, autoridade, writer, judge, promotor, runtime ou gate canônico já existente.

## 2. Anti-cerimônia / anti-loop

O `TLC23_CHECK` permanece obrigatório antes de ação, claim ou resposta externalizada que tenha efeito material.

Isso **não** significa executar toda a cadeia TLC23 em toda leitura, tool call ou passo sem delta.

```text
TLC23_CHECK=ALWAYS
FULL_TLC23_CHAIN=MATERIAL_APPLICABILITY_ONLY

NO_NEW_INFORMATION
→ NO_CHANGE
→ NO_RENARRATION
→ REUSE_LAST_VALID_GATE
→ KEEP_GOAL
→ KEEP_NEXT_CURSOR
→ NEXT

SAME_STATE_HASH
→ DO_NOT_REPEAT_CHECKLIST_TEXT
→ DO_NOT_REPEAT_TOOL_WITHOUT_DELTA
→ KEEP_GOAL
→ KEEP_NEXT_CURSOR

NEW_MATERIAL_DELTA
→ REENTER_ONLY_APPLICABLE_GATES
→ MEASURE
→ ACT_OR_BLOCK
→ RECEIPT
→ NEXT_CURSOR
```

Lei de compatibilidade com o Hermes canônico:

```text
ALL_TRIGGERS_REGISTERED=true
ALL_TRIGGERS_EXECUTED_EVERY_STEP=false
ONLY_MATERIALLY_APPLICABLE_TRIGGERS_EXECUTE=true
```

## 3. Narração operacional

A narração continua sendo trilho de estado, não deve ser removida.

```text
NARRATION_IS_OPERATIONAL_RAIL=true
NARRATION_IS_NOT_PROGRESS_BY_ITSELF=true
NARRATION_REQUIRES_STATE_OR_ACTION_DELTA=true
SAME_NARRATION_FINGERPRINT_WITHOUT_DELTA=DROP_DUPLICATE
```

Narrar quando mudar materialmente:

- GOAL;
- POSITION;
- hipótese;
- evidência;
- ação material começa/termina;
- blocker;
- owner;
- writer scope;
- estado;
- `NEXT_CURSOR`.

Sem mudança material, preservar handoff e continuar sem repetir prosa equivalente.

## 4. Fixed point desta correção

Esta correção fecha apenas a ambiguidade de autoridade e o risco de cerimônia/loop do perfil.

Não prova:

```text
RUNTIME=UNKNOWN
BOOT=UNKNOWN
INSTALLER=UNKNOWN
KERNEL_PROPRIO=UNKNOWN
CI_SAME_HEAD=UNKNOWN_UNTIL_MEASURED
```

`UNKNOWN != PASS` · `DOCUMENTED != EXECUTED` · `REALIDADE = JUIZ`.
