# Incidente — reapresentação de contexto pessoal e proveniência temporal

Data: 2026-08-16
Status: CONFIRMADO_NO_ESCOPO_DA_EVIDENCIA
Severidade: GOVERNANCA_PRIVACIDADE_E_PROVENIENCIA
Origem: evidência visual fornecida pelo SEGREDO/CHEFE na sessão ChatGPT

## Evidência observável

A evidência visual mostra uma resposta exibindo `Vitória da Conquista, Bahia, Brasil (BRT)` em contexto de relógio e, na sequência, uma resposta que usa UTC como referência do sistema. Depois, ao ser perguntado sobre o repositório, o agente reporta timestamp de commit em UTC.

Também aparece uma declaração do próprio agente de que registraria um “incidente de privacidade/localização” e que não usaria localização novamente em resposta que não precisasse dela.

## O que a evidência prova

```text
LOCATION_WAS_SURFACED=true
UTC_WAS_USED_AS_SYSTEM_REFERENCE=true
GITHUB_COMMIT_TIMESTAMP_WAS_TREATED_AS_REPO_EVENT_TIME=true
AGENT_ACKNOWLEDGED_LOCATION_PRIVACY_CONCERN=true
```

## O que a evidência NÃO prova

O print não prova sozinho de onde a localização veio, se houve acesso secreto, rastreamento, vazamento a terceiro ou leitura de dado fora das ferramentas/contextos permitidos.

```text
SECRET_LOCATION_ACCESS_PROVEN=false
THIRD_PARTY_LOCATION_LEAK_PROVEN=false
TRACKING_MECHANISM_PROVEN=false
LOCATION_SOURCE_PROVEN_BY_SCREENSHOT=false
```

Portanto, o incidente é registrado como falha de **minimização/uso de contexto pessoal e clareza de proveniência**, não como alegação de mecanismo oculto.

## Falha semântica reutilizável

```text
CONTEXT_AVAILABLE != CONTEXT_NEEDED
LOCATION_AVAILABLE != LOCATION_NEEDED
SOURCE_TIMESTAMP != USER_LOCAL_TIME
DERIVED_LOCAL_TIME != SOURCE_OF_TRUTH
```

O sistema deve responder pelo menor conjunto causal de dados. Se a pergunta pode ser respondida com timestamp UTC do GitHub, repetir a cidade do usuário não é necessário. Se a pergunta é explicitamente sobre horário local, a conversão pode ser usada, mas deve ficar rotulada como derivação.

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
"a resposta surfacou contexto de localização e precisa de regra de minimização/proveniência para não reutilizar dado pessoal sem necessidade causal"
```

Resultado:

```text
SUPPORTED_BY_VISUAL_EVIDENCE
```

## Regra promovida

Owner: `docs/GOVERNANCA/CONTEXTO-PESSOAL-E-PROVENIENCIA-TEMPORAL.md`

```text
PERSONAL_CONTEXT_MINIMIZATION=true
DO_NOT_SURFACE_LOCATION_UNLESS_REQUESTED_OR_MATERIAL=true
REPOSITORY_HAS_NO_HUMAN_LOCAL_TIME=true
REPO_EVENT_TIME=SOURCE_EVENT_TIMESTAMP
LOCAL_TIME_CONVERSION=DERIVED_VIEW
DO_NOT_ESCALATE_WORDING_BEYOND_EVIDENCE=true
```

## Receipt

```text
INCIDENT_ID=INC-20260816-PERSONAL-CONTEXT-TEMPORAL-PROVENANCE
ACUSADOR_APONTADOR=SEGREDO/CHEFE
EVIDENCE_CLASS=VISUAL_SCREENSHOT
CONFIRMED_FAILURE=context minimization / temporal provenance clarity
UNPROVEN_CLAIMS=secret access | third-party leak | hidden tracking
GLOBAL_OWNER=docs/GOVERNANCA/CONTEXTO-PESSOAL-E-PROVENIENCIA-TEMPORAL.md
ZERO_DEPLOY=true
ZERO_VPS=true
ZERO_SECRET=true
ZERO_FORCE_PUSH=true
```
