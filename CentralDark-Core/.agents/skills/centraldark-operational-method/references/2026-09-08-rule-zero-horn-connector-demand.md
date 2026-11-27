# REGRA_ZERO_HORN_CONNECTOR_DEMAND

owner: `.agents/skills/centraldark-operational-method/SKILL.md`  
refs: `#1444`, `#1454`, `#1463`  
status: `CANDIDATE_RAW_CODE_BACKED`  
mode: `ZERO_REGRESSION_EXTEND_EXISTING`

## REGRA_ZERO

```text
CHEFE_INTENT
  ↓
CENTRALDARK
  ↓
LIVE_STATE
  ↓
ALIGNMENT
  ↓
MINIMAL_DELTA
  ↓
EVIDENCE
  ↓
COUNTERPROOF
  ↓
REALITY_JUDGE
```

```text
CURRENT > HISTORICAL
REALITY = JUDGE
UNKNOWN != PASS
DOCUMENTED != EXECUTED
ACTION != PROOF
REUSE_BEFORE_CREATE
ONE_SYSTEM_ONLY
ONE_WRITER_PER_SCOPE
NO_V2_V3_V4_WITHOUT_PROVEN_GAP
NO_SECRET_IN_CODE_OR_RECEIPT
NO_IRREVERSIBLE_MUTATION_WITHOUT_EXPLICIT_AUTHORITY
```

## PDF_HORN_AS_ENGINE

Fonte operacional: `tlc23(2).pdf`.

```text
Horn clause:
  no máximo um literal positivo

Implication form:
  (p1 ∧ ... ∧ pn) -> p
  (p1 ∧ ... ∧ pn) -> F

Execution:
  preencher fatos conhecidos
  derivar consequências
  repetir até fixed point
```

Código bruto no PR:

```text
scripts/ci/centraldark-horn-line-gate.mjs
scripts/ci/centraldark-horn-line-gate.test.mjs
.github/workflows/centraldark-horn-line-gate.yml
```

## CASA_VS_SITE

```text
PROVAR_CASA != PROVAR_SITE
PROVAR_SITE != PROVAR_CASA
PROVAR_MAIN != PROVAR_DEPLOY
PROVAR_DEPLOY != PROVAR_RUNTIME_LOCAL
```

Domínios separados:

```text
REPO_PROOF = repo + main_head + pr + changed_files
CI_PROOF   = head_sha + same_head_checks + required_checks_concluded
SITE_PROOF = source_sha + artifact + deploy_target + site_http
CASA_PROOF = device + workdir + process + receipt
```

Push de site pode ser autorizado por repo+ci+target autorizado, mas isso não prova Casa nem fixed point global.

## CONNECTOR_DEMAND_ROUTER

Conectores medidos como disponíveis nesta classe de ambiente:

```text
GitHub
Gmail
Google_Calendar
Google_Contacts
Google_Drive
Malwarebytes
Notion
OpenAI_Platform
Plugin_Management
Remote_Desktop_Commander
files
```

Regra:

```text
NAO_ACIONAR_TODOS_CEGAMENTE
ACIONAR_SOMENTE_POR_DEMANDA_MATERIAL
WEBHOOK_SOMENTE_COM_SCHEMA/EVENTO_SUPORTADO
SEM_SCHEMA -> BLOCKED_NO_WEBHOOK_SCHEMA_FOR_CONNECTOR
SECRET -> NUNCA EM CHAT/CODIGO/RECEIPT
```

Código bruto no PR:

```text
scripts/ci/centraldark-connector-demand-router.mjs
scripts/ci/centraldark-connector-demand-router.test.mjs
.github/workflows/centraldark-connector-demand-router.yml
```

## MULTIVERSATIL

```text
PT-BR = resposta padrão
EN-US = eixo de interoperabilidade quando necessário
ES = eixo de interoperabilidade quando necessário
IDIOMA != SISTEMA_NOVO
LOCALE_AXIS != ARCHITECTURE_FORK
```

## GEMINI_COMPLIANCE

```text
GEMINI_AS_EXTENSION_OF_CENTRALDARK=true
GEMINI != AUTHORITY
GEMINI != SECOND_SYSTEM
GEMINI_MUST_READ_LIVE_STATE=true
GEMINI_MUST_REUSE_EXISTING=true
GEMINI_MUST_NOT_CREATE_V2_V3_V4_WITHOUT_PROVEN_GAP=true
```

## RESPONSE_FOOTER_CONTRACT

Toda resposta operacional deve terminar com:

```text
Feito: ...
Evidência: ...
Pendência: ...
Próximo passo: ...
Qual BOOT usar: ...
Fio da missão: ...
```

## RAW_VERDICT

```text
TEXT_ONLY=false
CODE_BACKED=true
WORKFLOW_BACKED=true
MAIN_TOUCH=false
MERGE_READY=UNKNOWN_UNTIL_SAME_HEAD_CI
```
