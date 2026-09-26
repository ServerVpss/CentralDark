# LABEL_GATE_DELTA_UTIL_AUDIT

owner: `.agents/skills/centraldark-operational-method/SKILL.md`  
refs: `#1444`, `#1463`  
status: `CANDIDATE_CODE_BACKED`  
mode: `DELTA_UTIL_ONLY`

## INPUT_ABSORBED

Fonte: auditoria do CHEFE sobre labels/gates em `ServerVpss/CentralDark`.

Delta útil preservado:

```text
MOTOR_ATUAL: agente = proveniência opcional
TESTE_ANTIGO: AGENTE-CHATGPT ainda era requisito
SKILL_LOCAL_CITADA: centraldark-pr-label ainda pode recriar requisito de agente
CATALOGO_LABELS: mistura promoção/proveniência/capacidade/categoria/status/histórico
PR_1463_PATTERN: regra bruta reutilizável -> teste -> workflow -> erro nomeado
```

Delta descartado deste corte:

```text
ONE_HOUSE_E_CENTRALDARK = missão separada
DOWNLOAD_HISTORY = não material para label gate
PERMITO_PIVETE_IMMEDIATE_EXECUTOR = não aplicado como auto-merge/destrutivo neste PR
```

## CAUSA

```text
CONTRACTS_CONFLICTING=true
```

O conflito não é `GPT_IS_JUDGE`.

```text
GPT_IS_REQUIRED_AS_JUDGE=false
AGENTE_CHATGPT_AS_OLD_TEST_REQUIREMENT=true
AGENT_LABEL_AS_PROVENANCE=true
LABEL_CATALOG_DRIFT=USER_PROVIDED_AUDIT_PENDING_FULL_API_SCAN
```

## CODE_DELTA

```text
scripts/github-autonomia-varredura.test.mjs
  remove exigência de 🧠 AGENTE-CHATGPT como missingLabel obrigatório

scripts/lupa/label-gate.mjs
  adiciona classes operacionais:
    PROMOTION
    RESULT
    PROVENANCE
    CAPABILITY
    CATEGORY
    STATUS
    PACKAGE_OR_SPECIAL
    GENERIC_METADATA
    AUTHORITY_ALIAS
    UNKNOWN_CONSUMER

scripts/lupa/label-gate.test.mjs
  prova:
    AGENTE-CHATGPT != PROMOTION
    PROVENANCE_LABEL_OPTIONAL
    STATUS_LABEL_NOT_PROOF
    RESULT_LABEL_NOT_PROMOTION_INPUT
    UNKNOWN_LABEL_CONSUMER != PASS
    alias de autoridade não cria carta branca

.github/workflows/centraldark-label-gate.yml
  roda node scripts/lupa/label-gate.test.mjs
```

## RULES

```text
PROMOTION = 👑 PERMITO-SEGREDO + 🔄 GIT + 🤖 AUTO + 🟡 IA-PRECISA-REVISAR
PROVENANCE = 🧠 AGENTE-*
CAPABILITY = 🤖 IA-* / AGENTIC-DEVOPS
CATEGORY = assunto do PR
STATUS = telemetria/triagem
RESULT = pós-prova/pós-merge
HISTORICAL = legado/proveniência antiga

PROVENANCE != AUTHORITY
STATUS != PROOF
RESULT != PROMOTION_INPUT
ALIAS != CANONICAL_WITHOUT_NORMALIZATION
UNKNOWN_LABEL != PASS
```

## PENDING

```text
CI_SAME_HEAD_REQUIRED=true
LOCAL_SKILL_E:\CentralDark\Pivete\skills\software-development\centraldark-pr-label\SKILL.md=USER_PROVIDED_NOT_REMOTE_PROVED
REMOTE_LABEL_CATALOG_SCAN=BLOCKED_BY_CONNECTOR_ENDPOINT_LIMITATION
MAIN_TOUCH=false
```

## NEXT_CURSOR

```text
SAME_HEAD_CI
  -> centraldark-label-gate
  -> github-autonomia-varredura.test
  -> PR #1463 review
  -> only then consider main promotion
```
