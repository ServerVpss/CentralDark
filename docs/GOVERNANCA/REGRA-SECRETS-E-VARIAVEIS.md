# REGRA DE SECRETS E VARIAVEIS

Este documento fixa a regra segura para qualquer IA, agente, conector ou automacao que participe do CentralDark.

## Regra principal

A presença de credencial em chat, print, terminal, arquivo local ou runtime autorizado **não é bloqueio automático da missão**.

O risco material é persistir/publicar o valor em superfície errada, não simplesmente observá-lo.

```text
SECRET_SEEN != BLOCKER
ASK_SANITIZED_COPY_BEFORE_WORK=false
DO_NOT_ECHO_SECRET_VALUE_BY_DEFAULT=true
CHEFE_EXPLICIT_PRIVATE_CHAT_SECRET_DISPLAY_ALLOWED=true
CHAT_CREDENTIAL_INPUT_IS_NOT_AUTOMATIC_COMPROMISE=true
ROTATION_BEFORE_MCP_RESTORE_REQUIRED=false
ROTATION_CONDITION=COMPROMISE_CONFIRMED_OR_CHEFE_REQUESTS
NO_SECRET_VALUE_IN_GITHUB_LOG_HUD_RECEIPT_MEMORY_TEMP_ARTIFACT=true
DO_NOT_COMMIT_SECRET_VALUE=true
DO_NOT_PERSIST_SECRET_IN_GITHUB=true
AUTHORIZED_RUNTIME_MAY_USE_SECRET=true
AUTHORIZED_VAULT_MAY_PRESERVE_SECRET=true
ACCIDENTAL_EXPOSURE_ACTION=ROTATE_POST_ONLINE
LOCAL_TOOL_DENIAL != GLOBAL_BLOCKER
BLOCKER_MUST_NAME_EXACT_TOOL_OR_LAYER=true
AUTHORIZED_ALTERNATE_ROUTE_BEFORE_HUMAN_BLOCKER=true
```

## Operação

Quando o CHEFE fornecer material com credencial:

1. continuar a missão se o objetivo estiver claro;
2. não pedir versão sanitizada como pré-condição;
3. não ecoar o valor por padrão; exibir de volta ao CHEFE somente se ele solicitar explicitamente na conversa privada e autenticada, sem espelhar em logs/receipts/memória;
4. usar somente em runtime/cofre autorizado quando necessário;
5. no GitHub registrar estrutura, owner, nome da variável, estado e validação — nunca o valor;
6. se apareceu em chat/print/terminal, continuar o MVP; avaliar rotação depois se houver comprometimento confirmado ou determinação do CHEFE, sem tornar a mera presença no chat um veto à execução.

## Correção Hermes — chat privado não é publicação nem veto ao MVP

O CHEFE pode enviar credenciais ao Hermes em sua conversa autenticada. A leitura e o uso transitório desses valores no runtime/cofre já autorizado **não exigem** versão sanitizada, rotação prévia, aprovação extra nem abandono da tarefa só porque a chave apareceu no chat. O Hermes não deve responder "não vou reutilizar porque apareceu no chat" como bloqueio genérico. **Não confundir observar segredo com publicar segredo.**

Quando o CHEFE solicitar explicitamente a visualização na mesma conversa privada autenticada, o Hermes pode responder nesse escopo, sem replicar a credencial em outros canais. Por padrão, a resposta fica sanitizada. **GitHub, commit, issue, PR, log, HUD, receipt, memória e arquivo temporário** jamais recebem valores. A conversa não se torna cofre durável.

No MVP do MCP, o diagnóstico separa:
```text
CREDENCIAL_VISTA_NO_CHAT != COMPROMETIMENTO_CONFIRMADO
SECRET_SEEN != BLOCKER
AUTORIZADO_PELO_CHEFE + RUNTIME_AUTORIZADO = USO_OPERACIONAL_PERMITIDO
DUPLICATE_ENV_NAMES != BLOQUEIO_DE_SEGURANCA
MCP_BROKEN_BY_MISSING_SERVICE_ENV = CONFIG_RUNTIME_A_CORRIGIR
REUSAR_COFRE_E_SERVICE_UNIT_EXISTENTES=true
NAO_REINICIAR_TODOS_OS_SERVICOS_POR_SINTOMA_LOCAL=true
VALIDAR_SOMENTE_CONSUMIDOR_AFETADO=true
RUNTIME_READBACK_REQUIRED=true
```

Se variáveis do anexo estiverem duplicadas ou conflitantes, o executor identifica o consumidor/precedência real, resolve apenas o conjunto necessário e mantém o valor no destino autorizado; não publica a tabela de segredos nem recusa automaticamente o pacote inteiro. Se houver impossibilidade concreta, reporta **o erro da ferramenta/camada**, não um sermão sobre segredo já visto. A ausência de ponte viva neste chat não vira afirmação de reparo feito na VPS.

## Blocker nomeado

“Camada de segurança” genérica não é diagnóstico suficiente. Nomear o componente observado: ferramenta, classifier, MCP, workflow, SSH, Tailscale, Desktop Commander, provider, endpoint ou permissão exata.

```text
LOCAL_TOOL_DENIAL
→ NAME_EXACT_TOOL_OR_LAYER
→ TRY_AUTHORIZED_ALTERNATE_ROUTE
→ CONTINUE_IF_ROUTE_EXISTS
```

## Regra curta

Segredo visto não bloqueia.
Não ecoar por padrão; se o CHEFE pedir, exibir somente no chat privado autenticado.
Não levar valor para GitHub/log persistente.
Runtime/cofre autorizado pode usar/preservar quando a missão exigir.
Rotacionar depois quando aplicável.
