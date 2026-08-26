# Continuidade causal + Navigation Tracking — referência destilada

Status: `REFERENCE_PATTERN`
Owner: `session-intelligence-harvester`
Consumers: `SOL` + `PIVETE/HERMES` por meio da mesma skill
Authority: `SEGREDO/CHEFE`

```text
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
HISTORICAL != CURRENT
PATTERN != PROOF
TRACKING_SIGNAL != MALICIOUS_VERDICT
DESTRUCTIVE_MITIGATION_REQUIRES_APPLICABLE_AUTHORITY=true
```

## 1. Padrão temporal — passado alimenta, mas não governa o presente

Um receipt, HTML, painel, screenshot, log ou checkpoint prova no máximo o estado observado naquele instante.

```text
LAST_PROVEN_AT=<timestamp observado>
CURRENT_STATE=UNKNOWN_UNTIL_REMEASURED
```

Ao retomar:

```text
#ACORDAR
→ carregar receipt/checkpoint
→ medir estado vivo no mesmo alvo
→ comparar T0 → T1
→ classificar SURVIVED|CHANGED|FAILED|UNKNOWN
→ somente então atualizar CURRENT_STATE
```

Regras:

```text
OLD_GREEN != CURRENT_GREEN
PERSISTED_RECEIPT != LIVE_RUNTIME
DOCUMENTED != EXECUTED
SAME_VISUAL_SURFACE != SAME_BACKEND
SAME_PERSONA_APPEARANCE != SAME_PROCESS
```

Um painel derivado deve mostrar a idade da evidência. Quando o health-check ainda não ocorreu, usar `UNKNOWN`, não reutilizar o último PASS como se fosse atual.

## 2. Ciclo de janela exploratória

Janela, aba, agente ou ferramenta aberta para descobrir caminho é superfície temporária, não novo órgão permanente.

```text
EXPLORAR
→ EXTRAIR DELTA
→ CONTRAPROVAR
→ CRISTALIZAR NO OWNER CANONICO
→ FECHAR SUPERFICIE EXPLORATORIA
→ RETORNAR AO FLUXO PRINCIPAL
```

```text
EXPLORATION_SURFACE != CANONICAL_OWNER
WINDOW_COUNT != CAPABILITY_COUNT
CLOSE_WINDOW != DELETE_EVIDENCE
```

## 3. Navigation tracking — não julgar por um parâmetro isolado

A referência PrivacyCG distingue decoração de link de rastreamento de navegação. Um parâmetro extra pode ser identificador de usuário, afiliado, item, callback, retorno de login ou ação necessária. Portanto:

```text
URL_HAS_PARAMETER != TRACKING_PROVEN
HIGH_ENTROPY_PARAMETER != SAFE_TO_STRIP
LINK_DECORATION != NAVIGATION_TRACKING
PARAMETER_PRESENT != MALICIOUS
```

Classificar pelo efeito e pelo contexto causal, não pela aparência do URL.

Perguntas discriminantes:

1. O valor muda o recurso/ação que o usuário realmente pediu?
2. O valor permite correlacionar a mesma pessoa entre sites?
3. Houve redirecionamento automático sem ativação do usuário?
4. O intermediário leu/escreveu estado próprio, cookie, cache ou storage?
5. O identificador reapareceu no destino ou foi usado para unir identidades?
6. A navegação faz parte de login, callback, unsubscribe, afiliado ou outra função legítima?

## 4. Reconstruir a navegação estendida como cadeia causal

Para investigar bounce tracking, não analisar só a página final. Construir um registro por navegação estendida:

```text
initial_host
final_host
bounce_set[]
user_activation_set[]
storage_access_set[]
redirect_chain[]
started_at
last_event_at
```

Fluxo conceitual:

```text
ORIGEM
→ REDIRECT/HOP 1
→ REDIRECT/HOP 2
→ DESTINO
```

Cada hop recebe eventos observados: `SERVER_REDIRECT`, `CLIENT_REDIRECT`, `USER_ACTIVATION`, `COOKIE_WRITE`, `STORAGE_ACCESS`, `SERVICE_WORKER_ACTIVATION`, `DOCUMENT_LOAD`.

```text
SINGLE_HOP != EXTENDED_NAVIGATION
CORRELATION_REQUIRES_CHAIN_CONTEXT=true
```

## 5. Ativação humana muda a interpretação

Interação real do usuário é um sinal material. Um host com ativação do usuário não deve ser tratado igual a um intermediário automático sem interação.

```text
USER_ACTIVATION_PRESENT → EXEMPT_OR_RECLASSIFY_CANDIDATE
NO_USER_ACTIVATION + AUTOMATED_REDIRECT + STATE_ACCESS → STRONGER_TRACKING_CANDIDATE
```

Ainda assim:

```text
SIGNAL_COMBINATION != UNIVERSAL_PROOF
```

O alvo, navegador, fluxo e política aplicável precisam ser observados.

## 6. Mitigação temporal e side-channel

A proposta PrivacyCG usa períodos definidos pela implementação para grace period, vida útil da ativação, timer global e detecção de redirect do cliente. Os números de exemplo da fonte são referências, não thresholds da CentralDark.

```text
SOURCE_NUMERIC_GUIDELINE != HOUSE_THRESHOLD
TIMER_VALUE_REQUIRES_LOCAL_POLICY_OR_TARGET_RUNTIME=true
```

O princípio reutilizável é:

```text
SUSPECT_EVENT
→ WAIT/GRACE WHEN APPLICABLE
→ CHECK USER ACTIVATION
→ CHECK ACTIVE USE
→ REVALIDATE
→ MITIGATE ONLY WHEN POLICY ALLOWS
```

Atraso/fuzz no momento da limpeza pode reduzir vazamento temporal sobre quando houve interação ou remoção de estado.

## 7. Limpeza é ação destrutiva

A referência discute limpeza de cookies, storage e cache para hosts classificados pelo navegador. Para a CentralDark:

```text
DETECT != DELETE
CLASSIFY != CLEAR_STORAGE
EXTERNAL_SPEC != LOCAL_AUTHORIZATION
```

Nunca transformar aprendizado da especificação em limpeza automática de dados do navegador, perfil, cookies, cache ou storage sem intenção e autorização aplicáveis ao alvo exato.

Antes de qualquer ação destrutiva:

```text
TARGET
+ POLICY
+ USER_ACTIVATION_CONTEXT
+ ACTIVE_USE_GUARD
+ ROLLBACK/RECOVERY_WHEN_APPLICABLE
+ AUTHORIZATION
→ ACTION
```

## 8. Risco adversarial da própria mitigação

Uma mitigação também pode criar sinal observável: um site pode inferir que houve interação quando percebe que certo estado sobreviveu ou foi removido. Logo:

```text
DEFENSE_CAN_CREATE_SIDE_CHANNEL=true
MITIGATION_NEEDS_COUNTERPROOF=true
```

Também existe risco de induzir o usuário a visitar endpoints de redirect para provocar limpeza indevida. Portanto sinais de interesse/ativação do usuário precisam ser tratados como proteção, não ruído.

## 9. Estado da fonte externa

A especificação `Navigation Tracking Mitigations` compartilhada pelo CHEFE é trabalho em progresso do PrivacyCG; a própria fonte declara que não é padrão W3C final e que a seção de mitigação ainda está em desenvolvimento.

```text
SOURCE_STATE=WORK_IN_PROGRESS
SOURCE_CONSENSUS=NOT_PROVEN
IMPORT_PATTERN_ONLY=true
IMPORT_POLICY_AUTOMATICALLY=false
```

## 10. Cristal operacional para SOL + HERMES

Quando aparecer URL decorada, cadeia de redirects, cookie/storage entre sites, screenshot de DevTools, histórico de navegador ou relato de rastreamento:

```text
CAPTURAR
→ NORMALIZAR EVENTOS
→ RECONSTRUIR CADEIA TEMPORAL
→ SEPARAR USER_ACTION DE AUTOMATION
→ SEPARAR FUNCAO LEGITIMA DE IDENTIFICADOR CROSS-SITE
→ CLASSIFICAR FACT|INFERENCE|HYPOTHESIS|UNKNOWN
→ PROCURAR CONTRAEXEMPLO
→ PROPOR MENOR MITIGACAO REVERSIVEL
→ PRESERVAR EVIDENCIA
```

Saída mínima:

```text
TARGET=
INITIAL_HOST=
FINAL_HOST=
REDIRECT_CHAIN=
USER_ACTIVATION=
STATE_ACCESS=
LINK_DECORATION=
TRACKING_CLASS=FACT|INFERENCE|HYPOTHESIS|UNKNOWN
EVIDENCE_REF=
COUNTEREXAMPLE=
MITIGATION_CLASS=NONE|BROWSER_POLICY|URL_SANITIZATION_CANDIDATE|STORAGE_ACTION_REQUIRES_AUTHORIZATION
CURRENT_STATE=
LAST_PROVEN_AT=
```

## Proveniência

- PrivacyCG, `Navigation Tracking Mitigations`, relatório preliminar de 25/03/2025, fornecido pelo SEGREDO/CHEFE em 23/08/2026.
- Receipt/painel local compartilhado pelo SEGREDO/CHEFE em 23/08/2026, usado apenas para generalizar o padrão `LAST_PROVEN_AT → #ACORDAR → CURRENT_STATE`.

A referência externa ensina causalidade, temporização e falsos positivos. A realidade local continua sendo o Judge.