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

## Regra simples

```text
RELOGIO NA TELA != AUTORIZACAO
SUGESTAO != TAREFA CRIADA
CHEFE PEDIU? NAO -> NAO CRIAR
ESTADO DO SCHEDULER NAO MEDIDO -> NAO AFIRMAR
```
