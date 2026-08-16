# Incidente — automação sugerida sem pedido explícito do CHEFE

Data: 2026-08-16
Status: CONFIRMADO
Severidade declarada pelo SEGREDO/CHEFE: GRAVE
Origem: evidência visual fornecida pelo SEGREDO/CHEFE na sessão ChatGPT + inventário de automações medido imediatamente após a acusação

## Incidente

Durante uma resposta sobre o estado do PR #947, a superfície ChatGPT exibiu um controle com ícone de relógio e o texto:

```text
Avisar quando o PR #947 ficar verde ou falhar
```

O SEGREDO/CHEFE não havia pedido criação de lembrete, relógio, monitoramento ou tarefa para esse PR naquele turno.

A evidência visual confirma que um controle/sugestão de automação foi apresentado sem pedido explícito do CHEFE.

## Limite da evidência — não inflar o incidente

O inventário de automações foi medido imediatamente após a acusação. Não foi encontrada tarefa ativa cujo título ou prompt monitore o PR #947.

Portanto:

```text
UNSOLICITED_AUTOMATION_SUGGESTION_UI=PROVEN
PR947_SCHEDULED_TASK_CREATED=NOT_PROVEN
PR947_ACTIVE_AUTOMATION_FOUND=NO
```

O incidente confirmado é a apresentação não solicitada do controle de automação e a consequente confusão de autoridade. Não registrar como fato uma criação de job que o estado medido não mostrou.

## Por que é incidente de autoridade

A intenção humana pertence ao SEGREDO/CHEFE. Sugerir ou expor um atalho de automação não equivale a autorização para criar, atualizar ou ativar tarefa.

Quando a interface apresenta um relógio/CTA de automação sem pedido explícito, pode parecer que a máquina já iniciou uma ação futura por conta própria. Em uma Casa que usa Zero Trust e autoridade humana explícita, essa ambiguidade é material.

## Regra cristalizada pelo incidente

```text
AUTOMATION_CREATE_REQUIRES_EXPLICIT_CHEFE_REQUEST=true
AUTOMATION_UPDATE_REQUIRES_EXPLICIT_CHEFE_REQUEST=true
AUTOMATION_ENABLE_REQUIRES_EXPLICIT_CHEFE_REQUEST=true
AUTOMATION_SUGGESTION_IS_NOT_AUTHORIZATION=true
SUGGESTION_UI_MUST_NOT_BE_REPORTED_AS_CREATED_TASK=true
MEASURE_TASK_INVENTORY_BEFORE_CLAIMING_AUTOMATION_EXISTS=true
UNKNOWN_AUTOMATION_STATE_IS_NOT_PASS=true
PLATFORM_UI_OUT_OF_REPO_CONTROL=true
```

Se uma plataforma externa decidir mostrar um controle de sugestão por comportamento próprio, a CentralDark não deve reinterpretar esse controle como autorização do CHEFE nem afirmar que uma tarefa foi criada sem medir o scheduler real.

## Contraprova futura

Caso apareça novamente um botão/relógio de automação sem pedido explícito:

1. não tratar o CTA como autorização;
2. não criar/ativar tarefa por inferência;
3. medir o inventário real de automações antes de afirmar que existe job;
4. se houver tarefa criada sem autorização explícita, classificar separadamente como `UNAUTHORIZED_AUTOMATION_MUTATION` e interromper/neutralizar somente com autoridade aplicável;
5. preservar a evidência e o vínculo com o agente/superfície que originou o evento.

## Receipt

```text
INCIDENT_ID=INC-20260816-CHATGPT-UNSOLICITED-AUTOMATION-UI
ACUSADOR_APONTADOR=SEGREDO/CHEFE
AGENTE_ENVOLVIDO=ChatGPT/SOL
EVIDENCIA_VISUAL="CTA com relógio: Avisar quando o PR #947 ficar verde ou falhar"
PEDIDO_EXPLICITO_DE_AUTOMACAO_NO_TURNO=NAO
INVENTARIO_MEDIDO=SIM
PR947_ACTIVE_AUTOMATION_FOUND=NAO
FATO_PROVADO=controle/sugestao de automacao apresentado sem pedido explicito
FATO_NAO_PROVADO=criacao efetiva de tarefa agendada para o PR #947
IMPACTO=confusao de autoridade + aparencia de acao futura iniciada sem comando humano
CORRECAO=registrar incidente + separar SUGESTAO de MUTACAO + exigir pedido explicito para criar/alterar/ativar automacao
ZERO_DEPLOY=true
ZERO_VPS=true
ZERO_SECRET=true
ZERO_FORCE_PUSH=true
```

## Recorrência observada — PR #952

Nova evidência visual fornecida pelo SEGREDO/CHEFE na mesma data mostra uma segunda apresentação do mesmo padrão de interface, agora com o texto:

```text
Avisar quando o PR #952 estiver verde para main
```

No turno que originou a captura, o SEGREDO/CHEFE pediu calibração, registro, cristalização e síntese das evidências; não pediu criação de monitoramento agendado para o PR #952.

O inventário real de automações foi medido novamente após essa evidência. Nenhuma tarefa ativa com título/prompt destinado a monitorar o PR #952 foi encontrada.

```text
RECURRENCE_OBSERVED=true
RECURRENCE_COUNT_MINIMUM=2
SECOND_UI_TARGET=PR952
PR952_AUTOMATION_EXPLICITLY_REQUESTED_IN_TRIGGER_TURN=false
PR952_AUTOMATION_SUGGESTION_UI=PROVEN
PR952_ACTIVE_AUTOMATION_FOUND=NO
PR952_SCHEDULED_TASK_CREATED=NOT_PROVEN
```

A recorrência fortalece a classificação de **padrão de superfície** sem autorizar ampliar a acusação para mutação do scheduler.

```text
REPEATED_UNSOLICITED_SUGGESTION_UI=PROVEN
REPEATED_UNAUTHORIZED_TASK_CREATION=UNPROVEN
```

## Evidência de runtime da superfície — separar observação de causalidade

As capturas adicionais do DevTools mostram tráfego `fetch`, `xhr` e `preflight`, além de uma linha `preflight` cujo campo de iniciador aparece visualmente como `Simulação`. Isso deve ser registrado literalmente como rótulo observado da ferramenta de desenvolvedor; **não** é prova suficiente de que respostas, tools ou ações do GPT tenham sido simuladas/falsificadas.

Também foram observados no console erros de internacionalização para locale `pt-BR` envolvendo as chaves `toast.error` e `toast.announcement.withPrefix`, além de um evento `Uncaught (in promise)`.

```text
NETWORK_FETCH_OBSERVED=true
NETWORK_XHR_OBSERVED=true
NETWORK_PREFLIGHT_OBSERVED=true
DEVTOOLS_INITIATOR_LABEL_SIMULACAO_OBSERVED=true
GPT_TOOL_EXECUTION_SIMULATED=UNPROVEN
GPT_RESPONSE_FABRICATION_PROVEN=false
PT_BR_TOAST_ERROR_TRANSLATION_MISSING_OBSERVED=true
PT_BR_TOAST_ANNOUNCEMENT_TRANSLATION_MISSING_OBSERVED=true
UNCAUGHT_PROMISE_ERROR_OBSERVED=true
CAUSAL_LINK_RUNTIME_ERRORS_TO_AUTOMATION_SUGGESTION=UNPROVEN
```

Regra reutilizável:

```text
VISIBLE_RUNTIME_LABEL != HIDDEN_MECHANISM_PROOF
NETWORK_ACTIVITY != TOOL_SUCCESS_PROOF
UI_ERROR != CAUSE_OF_ADJACENT_INCIDENT_WITHOUT_LINK
OBSERVE_EXACTLY → CLASSIFY → PRESERVE_UNKNOWN → DO_NOT_INFLATE
```

## Evidência auxiliar — forced-colors / high contrast

Nas capturas do Console também aparecem warnings repetidos de depreciação relacionados a `-ms-high-contrast` / `-ms-high-contrast-adjust`, com orientação para o padrão moderno `forced-colors` / `forced-color-adjust`.

O que essa evidência suporta é a presença de uma advertência de compatibilidade/acessibilidade na superfície observada. Ela **não** prova sozinha que o modo de alto contraste do usuário estava ativo, que o DevTools estava emulando `forced-colors`, nem que acessibilidade causou automação, localização ou outro efeito adjacente.

```text
LEGACY_HIGH_CONTRAST_WARNING_OBSERVED=true
FORCED_COLORS_MIGRATION_GUIDANCE_OBSERVED=true
ACTIVE_HIGH_CONTRAST_MODE=UNKNOWN_UNLESS_MEASURED
FORCED_COLORS_EMULATION_ACTIVE=UNKNOWN_UNLESS_MEASURED
FORCED_COLORS_CAUSED_AUTOMATION_CTA=UNPROVEN
FORCED_COLORS_CAUSED_LOCATION_DISCLOSURE=UNPROVEN
ACCESSIBILITY_WARNING_IS_SECURITY_INCIDENT=false
ACCESSIBILITY_WARNING_CAN_BE_AUXILIARY_RUNTIME_EVIDENCE=true
```

A repetição do mesmo warning também não cria automaticamente múltiplas provas independentes:

```text
REPEATED_WARNING_COUNT != INDEPENDENT_EVIDENCE_COUNT
SAME_SOURCE_REPEATED → ONE_EVIDENCE_CLUSTER_UNTIL_PROVED_OTHERWISE
```

A generalização desse aprendizado foi promovida para `docs/GOVERNANCA/ONTOLOGIA-DE-EVIDENCIA-E-CAUSALIDADE.md`.

## Síntese comprimida

```text
CHEFE_NAO_PEDIU_AUTOMACAO
→ SUPERFICIE_MOSTROU_CTA_DE_RELOGIO
→ INCIDENTE_DE_AUTORIDADE_PROVADO
→ SCHEDULER_MEDIDO
→ JOB_ALVO_NAO_ENCONTRADO
→ SUGESTAO != MUTACAO
→ RECORRENCIA_CONFIRMADA_EM_OUTRO_PR
→ RUNTIME/DEVTOOLS/ACCESSIBILITY_PRESERVADOS_COMO_EVIDENCIA_AUXILIAR
→ ROTULO != MECANISMO
→ REPETICAO != PROVA_INDEPENDENTE
→ CAUSALIDADE_OCULTA_CONTINUA_UNKNOWN
```

## Regra simples

```text
RELOGIO NA TELA != AUTORIZACAO
SUGESTAO != TAREFA CRIADA
CHEFE PEDIU? NAO -> NAO CRIAR
ESTADO DO SCHEDULER NAO MEDIDO -> NAO AFIRMAR
ROTULO "SIMULACAO" NO DEVTOOLS != PROVA DE GPT SIMULADO
FORCED_COLORS_WARNING != FORCED_COLORS_ACTIVE
FORCED_COLORS_WARNING != CAUSA DE INCIDENTE ADJACENTE
ERRO DE UI != CAUSA PROVADA SEM VINCULO CAUSAL
```
