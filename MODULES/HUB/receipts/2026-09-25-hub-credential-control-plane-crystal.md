# Receipt — HUB Credential Control Plane

Data: 2026-09-25  
Owner: `MODULES/HUB/`  
Runtime owner: `apps/modulos/hub`  
Estado: CRYSTAL_RECORDED

## Observado pelo CHEFE

```text
HUB_HEALTH=healthy
MCP_VERSION=0.4.0
MCP_TOOLS=126
MCP_GATEWAY=CONNECTED
SUPABASE_HUB=CONNECTED
TAILSCALE=OAUTH_ACTIVE
ABACUS_API_KEY=ACTIVE_MASKED
ABACUS_MODELS=180
ABACUS_ROUTES_HTTP_200=true
POLICIES=read/write/delete tiers visiveis
LOGIN_SCOPE=publico|casa|ambos
```

## Cristal

```text
HUB_AS_CREDENTIAL_CONTROL_PLANE=true
ONE_HUMAN_ENTRY=true
PROVIDERS_CONNECTED_BY_HUB=true
DIRECT_PLATFORM_LOGIN_NOT_DEFAULT=true
SECRET_VALUE_IS_TRANSIT=true
SECRET_VALUE_NOT_GIT=true
SECRET_VALUE_NOT_RECEIPT=true
SECRET_VALUE_NOT_MEMORY=true
```

## Arquivos criados

```text
MODULES/HUB/CENTRALDARK-HUB-CREDENTIAL-CONTROL-PLANE.md
MODULES/HUB/CENTRALDARK-HUB-CREDENTIAL-CONTROL-PLANE.json
MODULES/HUB/CENTRALDARK-HUB-CREDENTIAL-CONTROL-PLANE.yml
.agents/skills/centraldark-hub-credential-control-plane/SKILL.md
MODULES/HUB/receipts/2026-09-25-hub-credential-control-plane-crystal.md
```

## Limite

A tela prova superficie e potencial. Cada provider/rota ainda precisa de chamada real para virar PASS de runtime.

## NEXT_CURSOR

Ligar essa skill ao proximo ciclo de conectores do Hub e, quando um provider for usado, registrar receipt sem valor secreto.
