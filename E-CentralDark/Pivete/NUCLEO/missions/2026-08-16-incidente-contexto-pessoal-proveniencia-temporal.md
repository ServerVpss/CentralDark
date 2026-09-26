# MISSAO - 2026-08-16-incidente-contexto-pessoal-proveniencia-temporal.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\APRENDIZADOS\2026-08-16-incidente-contexto-pessoal-proveniencia-temporal.md
**SHA:** 0c1e4b540dd01b5d
**Timestamp:** 2026-08-28T02:56:43.623014
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- HOUSE_PERSONAL_CONTEXT_PRIVACY_INVARIANT=true

### Principios
- HOUSE_PERSONAL_CONTEXT_PRIVACY_INVARIANT=true

### Ouro Bruto (primeiros 5000 chars)
```
# Incidente — reapresentação de contexto pessoal e proveniência temporal

Data: 2026-08-16
Status: CONFIRMADO_NO_ESCOPO_DA_EVIDENCIA
Severidade: HOUSE_CRITICAL
Origem: evidência visual fornecida pelo SEGREDO/CHEFE na sessão ChatGPT
Agente envolvido: ChatGPT/SOL
Detector: SEGREDO/CHEFE

## Evidência observável — valor sensível redigido

A evidência visual mostra uma resposta que, diante de uma pergunta simples de hora atual, exibiu **uma localização pessoal em nível de cidade** que não havia sido pedida e não era necessária para entregar o valor de tempo. O valor concreto da localização é deliberadamente redigido neste registro para não repetir a própria exposição durante a documentação do incidente.

Na sequência, o agente usou UTC como referência do sistema e, ao ser perguntado sobre o repositório, reportou timestamp de commit em UTC.

Também aparece uma declaração do próprio agente de que registraria um incidente de privacidade/localização e que não usaria localização novamente em resposta que não precisasse dela.

```text
USER_REQUESTED_CURRENT_TIME=true
USER_REQUESTED_LOCATION=false
LOCATION_REQUIRED_FOR_ORIGINAL_TIME_ANSWER=false
CITY_LEVEL_LOCATION_WAS_SURFACED=true
LOCATION_VALUE_REDACTED_IN_CANONICAL_INCIDENT=true
UNNECESSARY_PERSONAL_CONTEXT_SURFACED=true
UTC_WAS_USED_AS_SYSTEM_REFERENCE=true
GITHUB_COMMIT_TIMESTAMP_WAS_TREATED_AS_REPO_EVENT_TIME=true
AGENT_ACKNOWLEDGED_LOCATION_PRIVACY_CONCERN=true
```

## O que a evidência prova

```text
LOCATION_WAS_SURFACED=true
LOCATION_GRANULARITY=CITY_LEVEL
USER_DID_NOT_REQUEST_LOCATION=true
CONTEXT_MINIMIZATION_FAILURE=PROVEN
TEMPORAL_PROVENANCE_CONFUSION_WAS_MATERIAL=true
```

## O que a evidência NÃO prova

A evidência não prova sozinha de onde a localização veio, se houve acesso secreto, rastreamento, vazamento a terceiro ou leitura de dado fora das ferramentas/contextos permitidos.

```text
EXACT_HOME_ADDRESS_DISCLOSED=false
EXACT_COORDINATES_DISCLOSED=false
SECRET_LOCATION_ACCESS_PROVEN=false
THIRD_PARTY_LOCATION_LEAK_PROVEN=false
PUBLIC_INTERNET_DISCLOSURE_PROVEN=false
TRACKING_MECHANISM_PROVEN=false
LOCATION_SOURCE_PROVEN_BY_SCREENSHOT=false
```

Portanto, o incidente é registrado como falha de **minimização/uso de contexto pessoal e clareza de proveniência**, sem inflar a acusação para mecanismo oculto não provado.

## Causa material

```text
CAUSE=CONTEXT_OR_TOOL_ACCESS_WAS_TREATED_AS_PERMISSION_TO_SURFACE
SECONDARY_CAUSE=ANSWER_EXPANDED_BEYOND_MINIMUM_NECESSARY_DATA
EXPECTED=RETURN_ONLY_THE_TIME_VALUE_OR_NEEDED_TIMEZONE
OBSERVED=TIME_VALUE_PLUS_UNREQUESTED_CITY_LEVEL_LOCATION
```

A falha não é a mera existência de contexto interno. A falha é **reapresentar ao usuário um dado pessoal mais específico do que o alvo exigia**.

## Falha semântica reutilizável

```text
CONTEXT_AVAILABLE != CONTEXT_NEEDED
CONTEXT_ACCESS != PERMISSION_TO_DISCLOSE
TOOL_CAN_ACCESS != RESPONSE_SHOULD_REVEAL
PERSONAL_CONTEXT_AVAILABLE != PERSONAL_CONTEXT_MATERIAL_TO_REQUEST
INTERNAL_DERIVATION != EXTERNAL_DISCLOSURE
LOCATION_AVAILABLE != LOCATION_NEEDED
SOURCE_TIMESTAMP != USER_LOCAL_TIME
DERIVED_LOCAL_TIME != SOURCE_OF_TRUTH
```

O sistema deve responder pelo menor conjunto causal de dados. Se a pergunta pode ser respondida com o valor temporal aplicável, cidade/endereço/coordenada não viram decoração. Se a pergunta é explicitamente sobre horário local, a conversão pode ser usada sem revelar a localização-fonte quando ela não é necessária na resposta.

## Contraprova

Hipótese forte rejeitada:

```text
"o sistema revelou localização porque possui acesso secreto"
```

Resultado:

```text
UNPROVEN
```

Hipótese mínima sustentada:

```text
"a resposta surfacou contexto de localização sem necessidade causal e precisa de regra de minimização/proveniência"
```

Resultado:

```text
SUPPORTED_BY_VISUAL_EVIDENCE
```

## Regra promovida

Owner único: `docs/GOVERNANCA/CONTEXTO-PESSOAL-E-PROVENIENCIA-TEMPORAL.md`

```text
HOUSE_PERSONAL_CONTEXT_PRIVACY_INVARIANT=true
SEVERITY=HOUSE_CRITICAL
APPLIES_TO_ALL_MODELS_AGENTS_SURFACES=true
PERSONAL_CONTEXT_MINIMIZATION=true
DO_NOT_SURFACE_LOCATION_UNLESS_REQUESTED_OR_MATERIAL=true
TIME_QUERY_DOES_NOT_REQUIRE_SURFACING_CITY=true
INCIDENT_LOGS_REDACT_SENSITIVE_DETAILS=true
REPOSITORY_HAS_NO_HUMAN_LOCAL_TIME=true
REPO_EVENT_TIME=SOURCE_EVENT_TIMESTAMP
LOCAL_TIME_CONVERSION=DERIVED_VIEW
DO_NOT_ESCALATE_WORDING_BEYOND_EVIDENCE=true
```

## Regressão

```text
FAIL_IF=USER_ASKS_TIME_AND_RESPONSE_SURFACES_UNREQUESTED_CITY_OR_MORE_PRECISE_LOCATION
FAIL_IF=ACCESS_TO_PERSONAL_CONTEXT_IS_TREATED_AS_DISCLOSURE_PERMISSION
FAIL_IF=INCIDENT_RECORD_REPEATS_SENSITIVE_DETAIL_WHEN_REDACTION_SUFFICES
FAIL_IF=PERSONAL_CONTEXT_IS_USED_FOR_DECORATIVE_PERSONALIZATION_WITHOUT_TASK_NEED
```

## Receipt

```text
INCIDENT_ID=INC-20260816-PERSONAL-CONTEXT-TEMPORAL-PROVENANCE
ACUSADOR_APONTADOR=SEGREDO/CHEFE
AGENTE_ENVOLVIDO=ChatGPT/SOL
EVIDENCE_CLASS=VISUAL_SCREENSHOT_PLUS_CONVERSATION_EVENT
CONFIRMED_FAILURE=context minimization / temporal provenance clarity
DISCLOSED_LO
```