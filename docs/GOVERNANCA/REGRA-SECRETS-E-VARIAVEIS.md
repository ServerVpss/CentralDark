# REGRA DE SECRETS E VARIAVEIS

Este documento fixa a regra segura para qualquer IA, agente, conector ou automacao que participe do CentralDark.

## Regra principal

A presença de credencial em chat, print, terminal, arquivo local ou runtime autorizado **não é bloqueio automático da missão**.

O risco material é persistir/publicar o valor em superfície errada, não simplesmente observá-lo.

```text
SECRET_SEEN != BLOCKER
ASK_SANITIZED_COPY_BEFORE_WORK=false
DO_NOT_ECHO_SECRET_VALUE=true
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
3. não repetir o valor na resposta;
4. usar somente em runtime/cofre autorizado quando necessário;
5. no GitHub registrar estrutura, owner, nome da variável, estado e validação — nunca o valor;
6. se apareceu em chat/print/terminal, seguir o MVP e rotacionar depois quando aplicável.

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
Não ecoar.
Não levar valor para GitHub/log persistente.
Runtime/cofre autorizado pode usar/preservar quando a missão exigir.
Rotacionar depois quando aplicável.
