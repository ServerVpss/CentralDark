# 👑🪬 RECEIPT · BRIDGE DA CASA → MCP CENTRALDARK DIRETO · 2026-09-18

```text
ID=CENTRALDARK-DIRECT-MCP-BRIDGE-20260918
AUTHORITY=SEGREDO/CHEFE
PR_MOTHER=#1562
BASE_MAIN=65ff45dbab3c1b24b01b08cb56b5e96f4698616a
OWNER_MCP=apps/modulos/mcp
OWNER_OAUTH=apps/modulos/mcp/src/oauth.js
OWNER_SESSION=apps/modulos/mcp/src/sessions.js
CASA_PRODUCT=E:\CentralDark\CentralDark-Unified-OneShot
CASA_RUNTIME=%LOCALAPPDATA%\CentralDark\UnifiedRuntime
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
PDF_GATE_BEFORE_MUTATION=PASS
```

## Intenção

Fazer o Bridge/SOL da Casa usar o **MCP CentralDark oficial como rota primária**, sem depender
do Remote Desktop Commander para autenticar ou operar o MCP. O Desktop Commander permanece
capability/fallback opcional; não é removido nem promovido a control plane.

## Estado medido antes da mudança

```text
PUBLIC_MCP=https://mcp.centralldark.com/mcp
PUBLIC_HEALTH=HTTP_200
MCP_VERSION=0.4.0
TOOL_COUNT=115
OAUTH_DISCOVERY=HTTP_200
OAUTH_PKCE_S256=ADVERTISED
OAUTH_GRANTS=authorization_code,refresh_token
ADMIN_PROTECTED_RESOURCE_METADATA=HTTP_200
```

O runtime VPS observado em `/root/CentralDark` tinha o source MCP de
`oauth.js`, `index.js` e `sessions.js` sem diff contra `origin/main`.
A porta interna `127.0.0.1:9100` estava em LISTEN.

## OAuth canônico reutilizado

O fluxo existente no MCP CentralDark permanece:

```text
Bridge/Casa
→ /register
→ /authorize
→ senha admin no servidor CentralDark
→ authorization code
→ PKCE S256
→ /token
→ access + refresh
→ cache protegido por DPAPI por perfil
→ /admin/mcp
→ initialize
→ tools/list
→ tool call
```

Não foi criado device-code grant no MCP CentralDark. A expressão “senha ou código” é
representada pelo fluxo real: senha humana autoriza a emissão do authorization code; depois
o cliente opera com access/refresh persistidos. Device code continua pertencendo ao corredor
Remote Desktop Commander enquanto não existir grant equivalente no MCP CentralDark.

## Contraprova pública sem segredo

Probe executado da Casa sem Desktop Commander:

```text
/register=201
/authorize=200
PASSWORD_FIELD=true
CENTRALDARK_PAGE=true
DESKTOP_COMMANDER_USED=false
```

Nenhuma senha/token foi lida, gravada no repo ou registrada neste receipt.

## Patch da Casa

Produto existente alterado **in place**:

```text
E:\CentralDark\CentralDark-Unified-OneShot\integration\RUN-ALL.ps1
E:\CentralDark\CentralDark-Unified-OneShot\src\CentralDarkBridge.cs
E:\CentralDark\CentralDark-Unified-OneShot\AUTH-MCP.cmd
E:\CentralDark\CentralDark-Unified-OneShot\README.txt
```

Comportamento:

```text
DIRECT_CENTRALDARK_MCP_PRIMARY=true
REMOTE_TRAY_REQUIRED=false
REMOTE_TRAY_LEGACY_ENABLED_BY_DEFAULT=false
AUTH_PRIMARY=CENTRALDARK_MCP_OAUTH
AUTH_FLOW=ADMIN_PASSWORD -> AUTHORIZATION_CODE/PKCE -> DPAPI
DESKTOP_COMMANDER_REMOTE=LEGACY_FALLBACK
```

O legacy Remote Tray só deve iniciar quando `RUN-ALL.ps1 -EnableLegacyRemoteTray` for
explicitamente solicitado. Um processo legado já vivo é preservado; o patch não o mata.

## Build / prova local

O primeiro build encontrou o EXE em uso e falhou fechado. O processo antigo foi parado,
o mesmo produto foi recompilado e reaberto.

```text
UNIFIED_BUILD_EXIT=0
UNIFIED_BUILD_RESULT=PROBE_PASS
BRIDGE_PROCESS_RESTARTED=true
RUN_ALL_PARSE_ERRORS=0
```

Hashes atuais da Casa:

```text
CentralDarkBridge.exe
SHA256=451259B7AB2E2B3D028E2D59D6F99F95FA20866404B39214469F8EDEDA9BB193

CentralDarkBridge.cs
SHA256=74260F8D645E4219A9F50735CD69C2A2DDA5E551C3265ED8CA42C8DB1DC10B96

RUN-ALL.ps1
SHA256=FA9571533CDB32925529F2607DCDEDE6E8BAAE8DF663C33C449D032525EFA32B

OAUTH-CONNECT.ps1
SHA256=0035B4FDC293EAB64C78C8C1BEA5CA29DA67DD374C07B53228E062F7AF5E20BC

AUTH-MCP.cmd
SHA256=A6D32A16982D3634845E512CFC622EAA0F4D60B2AEC73BCCEA9A60FB828B435E
```

## PDF gate

Antes da mutação lógica, o gate foi reexecutado:

```text
SECTOR=PDF_GATE
RESULT=PROBE_PASS
TLC23_SHA256=b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1
```

## Delta versionado neste SUB-PR

- `scripts/remote-bridge/CENTRALDARK-REMOTE-BRIDGE.config.json`: CentralDark MCP primário;
  Remote Desktop Commander legado desabilitado por padrão.
- `docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md`: fluxo direto e fronteira de auth.
- `apps/modulos/hub/src/components/connectors/HybridMcpAdminCard.tsx`: default passa a
  `public-admin`; RDC continua selecionável como fallback.

## Fronteira ainda não verde

```text
CURRENT_PROFILE_AUTH_E2E_AFTER_PATCH=UNKNOWN_UNTIL_HUMAN_COMPLETES_AUTHORIZE
POST_AUTH_INITIALIZE=UNKNOWN
POST_AUTH_TOOLS_LIST=UNKNOWN
POST_AUTH_REAL_TOOL_CALL=UNKNOWN
VPS_REBOOT_SURVIVAL=UNKNOWN
```

O Bridge está buildado e a rota OAuth direta foi provada até a tela de consentimento. A etapa
que exige senha humana não é simulada nem automatizada.

## Veredito

```text
DIRECT_MCP_ARCHITECTURE=PROVED
DIRECT_MCP_PUBLIC_ROUTE=PASS
DIRECT_OAUTH_START=PASS
LEGACY_REMOTE_DEFAULT_DISABLED=SOURCE_PASS
LOCAL_BRIDGE_BUILD=PASS
PARALLEL_ARCHITECTURE_CREATED=NO
SECRETS_EXPOSED=NO
FULL_POST_LOGIN_E2E=UNKNOWN
```

## NEXT_CURSOR

```text
CHEFE clica AUTH CENTRALDARK
→ escolhe perfil
→ conclui senha no /authorize
→ Bridge recebe code/PKCE e salva DPAPI
→ remedir initialize
→ tools/list
→ tool call real
→ receipt final
```
