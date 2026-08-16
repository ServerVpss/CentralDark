# 🛡️ Regra global — contexto pessoal e proveniência temporal

Status: CANÔNICO
Escopo: toda a CentralDark — modelos, agentes, workers, plugins, WebUI, CLI, CI, CD, Telegram e superfícies futuras.
Origem: incidente observado em 2026-08-16 envolvendo reapresentação de localização e mistura de relógio humano com timestamp do GitHub.

## Princípio

Dados pessoais/contextuais disponíveis ao sistema não viram decoração nem preenchimento automático de resposta. Só entram quando são materialmente necessários ao alvo atual ou quando o SEGREDO/CHEFE pede explicitamente.

```text
PERSONAL_CONTEXT_MINIMIZATION=true
PERSONAL_CONTEXT_IS_NOT_DEFAULT_OUTPUT=true
USE_PERSONAL_CONTEXT_ONLY_IF_TARGET_REQUIRES_IT=true
DO_NOT_SURFACE_LOCATION_UNLESS_REQUESTED_OR_MATERIAL=true
DO_NOT_REPEAT_PERSONAL_LOCATION_WITHOUT_CAUSAL_NEED=true
PERSONAL_CONTEXT_SOURCE_MUST_NOT_BE_INVENTED=true
HIDDEN_ACCESS_CLAIM_WITHOUT_EVIDENCE=FORBIDDEN
```

## Localização

```text
LOCATION_AVAILABLE != LOCATION_NEEDED
LOCATION_NEEDED=false → DO_NOT_USE_OR_SURFACE_LOCATION
LOCATION_USED → NAME_WHY_IT_IS_NECESSARY_WHEN_NOT_OBVIOUS
LOCATION_SOURCE_UNKNOWN → SOURCE=UNKNOWN
```

A regra não declara que localização nunca pode ser usada. Tempo local, clima, rota, comércio próximo e tarefas equivalentes podem exigir localização. A exigência é causalidade e minimização.

## Tempo e GitHub

Repositório não possui “hora local” humana. Eventos têm timestamps emitidos pela fonte.

```text
REPOSITORY_HAS_NO_HUMAN_LOCAL_TIME=true
REPO_EVENT_TIME = SOURCE_EVENT_TIMESTAMP
GITHUB_EVENT_TIMESTAMP_SOURCE = GITHUB
SOURCE_TIMESTAMP_MUST_PRESERVE_TIMEZONE_OR_OFFSET=true
UTC_TIMESTAMP != USER_LOCAL_TIME
LOCAL_TIME_CONVERSION = DERIVED_VIEW
DERIVED_TIME_MUST_NAME_TARGET_TIMEZONE_OR_OFFSET=true
NO_LOCATION_REQUIRED_TO_REPORT_RAW_UTC_TIMESTAMP=true
NO_PERSONAL_LOCATION_INFERENCE_FROM_REPO_TIMESTAMP=true
```

Exemplo:

```text
GitHub commit: 2026-08-16T10:49:23Z
→ fato fonte: 10:49:23 UTC
→ conversão local: somente se pedida/necessária
→ a conversão não altera o timestamp fonte
```

## Fechamento de privacidade

```text
PERSONAL_DATA
→ TARGET_NEEDS_IT?
   NÃO → NÃO USAR / NÃO EXIBIR
   SIM → USAR MÍNIMO SUFICIENTE
→ NÃO INVENTAR ORIGEM
→ NÃO REUTILIZAR EM PERGUNTA VIZINHA SEM NECESSIDADE
→ NÃO CONFUNDIR CONTEXTO DISPONÍVEL COM AUTORIZAÇÃO PARA EXPOR
```

## Contraprova obrigatória

Antes de chamar um episódio de “vazamento”, “acesso secreto”, “rastreamento” ou equivalente:

```text
CLAIM
→ QUAL CANAL?
→ QUAL DADO?
→ QUAL ORIGEM PROVADA?
→ QUAL DESTINO?
→ HOUVE EXPOSIÇÃO A TERCEIRO?
→ HÁ EVIDÊNCIA CAUSAL?
```

Sem isso:

```text
UNPROVEN_PRIVACY_MECHANISM=UNKNOWN
DO_NOT_ESCALATE_WORDING_BEYOND_EVIDENCE=true
```

## Regra curta

```text
DADO PESSOAL NÃO É ENFEITE.
TEMPO DA FONTE NÃO É HORA DA PESSOA.
CONTEXTO DISPONÍVEL NÃO É LICENÇA PARA EXIBIR.
PROVA PRIMEIRO; ACUSAÇÃO DEPOIS.
```
