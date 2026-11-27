# ⭕ !AURÉOLA CANÔNICA — #ACORDAR — Cristal Desktop + Screenpipe 403

Data: 2026-09-12  
Autoridade de intenção: SEGREDO/CHEFE  
Regra: `UNKNOWN != PASS` · `AÇÃO != PROVA` · `MERGED != DEPLOYED`

## Intenção

Cristalizar na `main` somente o que foi provado nesta rodada e registrar como `UNKNOWN` tudo o que ainda não possui prova discriminante, sem criar V2/V3, skill paralela, runtime paralelo ou falso-verde.

## START_HEAD medido

```text
START_HEAD=c7dabbd4a4acccf4ec0ea10f517e7e2e95ff9545
BRANCH=main
```

## 🟢 PROVADO — Desktop / pacote único

A casca Desktop canônica permanece em:

```text
apps/modulos/Bolt/source
```

A evolução já presente na `main` entre `5f4038d2448c65a9d6429723fdd2f8b615fd5ca7` e `c7dabbd4a4acccf4ec0ea10f517e7e2e95ff9545` é composta por 3 commits e 3 arquivos materiais:

```text
apps/modulos/Bolt/source/electron-builder.yml
apps/modulos/Bolt/source/resources/runtime/manifest.json
apps/modulos/Bolt/source/scripts/centraldark-desktop-contract.test.mjs
```

O contrato da cápsula runtime já declara:

```text
ONE_SYSTEM_ONLY=true
USER_MACHINE_PACKAGE_INSTALL=false
EXTERNAL_GLOBAL_RUNTIME_FALLBACK=false
EXTERNAL_APPDATA_HERMES_VENV_ALLOWED=false
RELEASE_MUST_FAIL_CLOSED_IF_REQUIRED_SIDECAR_MISSING=true
```

O próprio manifesto mantém corretamente:

```text
HERMES_BUNDLE_STATUS=UNKNOWN
HERMES_REQUIRED_FOR_FIXED_POINT=true
HERMES_RESOLUTION_ROOT=resources/runtime/hermes
```

Logo:

```text
RUNTIME_CAPSULE_CONTRACT=PROVED_BY_MAIN
HERMES_BUNDLED=UNKNOWN
PACKAGED != EXECUTED
```

## 🟡 ESTADO DA ESTEIRA DO INSTALADOR

Run observado para o mesmo SHA `c7dabbd4a4acccf4ec0ea10f517e7e2e95ff9545`:

```text
WORKFLOW=CentralDark Desktop — Windows Installer
RUN_ID=34714797817
RUN_NUMBER=7
HEAD_SHA=c7dabbd4a4acccf4ec0ea10f517e7e2e95ff9545
STATUS=queued
CONCLUSION=null
```

Portanto:

```text
INSTALLER_TRIGGER=PROVED
SETUP_EXE_BUILT=UNKNOWN
INSTALLER_SHA256=UNKNOWN
FRESH_WINDOWS_EXECUTION=UNKNOWN
SINGLE_EXE_FIXED_POINT=FALSE
```

## 🟢 PROVADO — contrato Screenpipe já conhecido no repositório

A reconciliação canônica existente já registra para a extensão/browser bridge:

```text
DEFAULT_BASE_URL=http://127.0.0.1:3030
TOKEN_STORAGE_KEY=screenpipe_token
BASE_URL_STORAGE_KEY=screenpipe_base_url
WS_PATH=/connections/browser/ws
HEALTH_PATH=/health
BROWSER_STATUS_PATH=/connections/browser/status
```

Também já registra reconnect/backoff e política de não persistir token/cookies crus.

## 🔴 FERIDA OBSERVADA — WebSocket 403

Frame fornecido pelo CHEFE nesta rodada mostrou repetidamente no console da extensão/browser:

```text
WebSocket connection to 'ws://127.0.0.1:3030/connections/browser/ws?token=[REDACTED]' failed:
Error during WebSocket handshake: Unexpected response code: 403
worker.js:82
```

Nenhum token bruto foi copiado para este receipt.

Classificação correta:

```text
WS_ENDPOINT_RETURNED_HTTP_403=PROVED_IN_SCOPE_BY_USER_FRAME
SERVER_OR_POLICY_REJECTED_WEBSOCKET_UPGRADE=PROVED_IN_SCOPE
WS_403 != CONNECTION_REFUSED
DAEMON_COMPLETELY_DOWN=NOT_PROVEN
```

## 🟡 CAUSA RAIZ AINDA NÃO PROVADA

As hipóteses abaixo permanecem somente hipóteses até evidência discriminante do backend/configuração:

```text
TOKEN_INVALID_OR_EXPIRED=UNKNOWN
ORIGIN_NOT_ALLOWED=UNKNOWN
SESSION_LIMIT_OR_STALE_SESSION=UNKNOWN
SERVER_AUTH_POLICY_REJECTION=UNKNOWN
EXTENSION_CONFIG_STALE=UNKNOWN
```

É proibido promover qualquer uma delas para causa raiz apenas pelo `403`.

## 🟡 FERIDA DE LOOP

O frame mostra múltiplas tentativas consecutivas do mesmo WebSocket com `403`.

Isso prova repetição do sintoma naquele intervalo, mas não prova ainda o algoritmo exato responsável pela cadência atual nem autoriza editar uma cópia de `worker.js` fora de owner conhecido.

```text
REPEATED_403_RECONNECTS=OBSERVED
PATCH_OWNER_FOR_EXTENSION_SOURCE=UNKNOWN
BLIND_PATCH_OF_BROWSER_EXTENSION=FORBIDDEN
```

A correção futura, quando o owner de código for provado, deve distinguir:

```text
NETWORK_UNREACHABLE
!=
HTTP_403_HANDSHAKE_REJECTED
!=
AUTH_OR_POLICY_BLOCKED
```

E deve evitar tempestade de reconexão sem nova informação, usando backoff/estado já compatível com o owner real.

## Próximas provas discriminantes seguras

Sem imprimir token/cookie/secret:

```text
1. medir http://127.0.0.1:3030/health
2. medir http://127.0.0.1:3030/connections/browser/status
3. identificar processo/owner real da porta 3030 na Casa
4. ler razão de rejeição no log do backend, com secrets redigidos
5. medir metadata de base URL/origin/config da extensão sem revelar token
6. localizar owner/fonte versionada do worker antes de qualquer patch
```

Resultado desejado:

```text
403
→ EVIDÊNCIA DO BACKEND
→ CAUSA DISCRIMINADA
→ OWNER EXISTENTE
→ PATCH MÍNIMO
→ TESTE
→ CONTRAPROVA
→ COMMIT
→ MAIN
→ MICRO-DEPLOY APLICÁVEL
→ REMEDIÇÃO
```

## Desktop Commander / Casa

Frame anterior fornecido pelo CHEFE mostrou autorização local concluída e um device marcado como online/ready no aplicativo. Isso é evidência visual da superfície naquele momento, mas não substitui remedição pelo canal executor desta sessão.

```text
USER_FRAME_DEVICE_READY=OBSERVED
CURRENT_REMOTE_EXECUTION_FROM_THIS_SESSION=UNKNOWN_UNTIL_REMEASURED
SCREENSHOT != LIVE_STATE
```

## VPS

Esta rodada altera e mede principalmente o Desktop/Windows e o contrato Screenpipe local. Não declarar deploy VPS como consequência automática.

```text
DESKTOP_PACKAGE_TO_VPS_DEPLOY=NOT_APPLICABLE_BY_SCOPE
VPS_RUNTIME_SHA_FOR_THIS_ROUND=UNKNOWN
MAIN != VPS_RUNTIME
```

## Lei aplicada

A lei já cristalizada em `.agents/skills/centraldark-esteira-motor/SKILL.md` continua sendo o owner do fechamento:

```text
FERIDA_PROVADA
→ CAUSA_RAIZ
→ SOLUÇÃO_NO_OWNER_EXISTENTE
→ TESTE
→ CONTRAPROVA
→ COMMIT
→ PUSH
→ MAIN
→ MICRO_DEPLOY_DO_ESCOPO_AFETADO
→ REMEDIÇÃO_RUNTIME
→ RECEIPT
→ FIXED_POINT
```

Para evidência ainda incompleta, o comportamento obrigatório é:

```text
FATO_PROVADO → CRISTALIZAR COMO FATO
FATO_NÃO_PROVADO → CRISTALIZAR COMO UNKNOWN
HIPÓTESE != CAUSA_RAIZ
UNKNOWN != PASS
```

## ⚖️ REALITY JUDGE

```text
DESKTOP_RUNTIME_CAPSULE_CONTRACT=PROVED
INSTALLER_TRIGGER_SAME_HEAD=PROVED
INSTALLER_BUILD_RESULT=UNKNOWN
HERMES_BUNDLED=UNKNOWN
SCREENPIPE_WS_403=PROVED_IN_SCOPE
SCREENPIPE_403_ROOT_CAUSE=UNKNOWN
SCREENPIPE_EXTENSION_PATCH_OWNER=UNKNOWN
CURRENT_REMOTE_EXECUTION=UNKNOWN
VPS_RUNTIME_FOR_THIS_SCOPE=UNKNOWN
FIXED_POINT=FALSE
```

## NEXT_CURSOR

```text
SCREENPIPE_403_DISCRIMINATION
+
WINDOWS_INSTALLER_RUN_34714797817
+
HERMES_SIDECAR_BUNDLE_PROOF
```
