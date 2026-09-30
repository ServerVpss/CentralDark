# MICRO-DEPLOY — Figma/FigJam → HUB/MCP — 2026-09-25

BASE_MAIN=a2f67a42181a8b2889432cc5cf3f9364b53ea962
BRANCH=micro/figma-hub-connector-20260925
OWNER_HUB=apps/modulos/oauth-broker
OWNER_MCP=apps/modulos/mcp/src/tools/integrations.js
OWNER_HUD=apps/modulos/Bolt/source/app/components/centraldark/centraldark-hub-inventory.ts

## Intenção

Conectar Figma/FigJam à CentralDark pelo HUB/MCP existente, sem segundo MCP, segundo HUB ou uso indevido do Omni Router.

## Micro-deploys

1. HUB provider `figma` com `auth_type=api_key`, segredo somente no cofre.
2. Probe de credencial via `GET https://api.figma.com/v1/me`.
3. MCP read-only:
   - `figma_status`
   - `figma_ler_arquivo`
   - `figma_ler_node`
4. HUD/inventory projeta Figma como SOURCE_PROVED, runtime fail-closed.

## Leis

```text
CONNECTOR = HUB/MCP ADAPTER
OMNI_ROUTER != CONNECTOR_OWNER
SOURCE_PROVED != RUNTIME_PASS
TOOL_LISTED != TOOL_ACTIVE
SECRET_IN_GIT = FORBIDDEN
UNKNOWN != PASS
SECOND_MCP = FORBIDDEN
SECOND_HUB = FORBIDDEN
SECOND_ROUTER = FORBIDDEN
```

## Target vivo conhecido

```text
fileKey=eE4FS10ymxxlXDJAgWavCh
nodeId=0:1
kind=FigJam board
```

O board foi lido pelo conector Figma disponível na sessão externa. Isso prova acesso do conector da sessão, não prova ainda a credencial da VPS.

## Runtime gate

```text
/figma/status 200 + status=AVAILABLE
AND figma_ler_node(target, 0:1) retorna node real
=> FIGMA_HUB_RUNTIME=PASS

credencial ausente/erro
=> FIGMA_HUB_RUNTIME=UNKNOWN|BLOCKED
```

## NEXT_CURSOR

test exact HEAD -> build/dist -> PR -> same-head CI -> merge -> seed provider on VPS -> /figma/status -> board node 0:1 -> receipt.
