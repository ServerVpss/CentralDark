# CENTRALDARK HUB CREDENTIAL CONTROL PLANE

status: CANONICAL_HUB_KNOWLEDGE_CRYSTAL  
authority: SEGREDO/CHEFE  
owner: MODULES/HUB/  
runtime_owner: apps/modulos/hub  
crystallized_at: 2026-09-25T22:18:00Z

## Intencao

O HUB e a porta humana unica da CentralDark para conectar plataformas, providers, OAuth, API keys, rotas publicas, tunel Casa/VPS e paineis de auditoria sem espalhar login em cada site externo.

O CHEFE entra no HUB, escolhe rota, conecta credencial temporaria ou OAuth, testa o provedor, ve o efeito vivo e troca/descarta quando quiser. O sistema nao deve exigir que o CHEFE entre manualmente em GitHub, Google Drive, Gmail, Supabase, Tailscale, Abacus ou outros provedores quando o painel ja puder intermediar.

```text
CHEFE -> HUB_LOGIN -> ROUTE_SCOPE(publico|casa|ambos)
→ CONNECTOR_CARD
→ OAUTH_OR_API_KEY_TRANSIT
→ HUB_SECURE_STORE_OR_OWNER_SECRET
→ HEALTH/STATUS/TOOLS/MODELS
→ RUNTIME_EFFECT
→ RECEIPT_SEM_VALOR_SECRETO
```

## O que foi observado nas telas do CHEFE

```text
HUB_HEALTH=healthy
MCP_VERSION=0.4.0
MCP_TOOLS=126
MCP_GATEWAY=CONNECTED
SUPABASE_HUB=CONNECTED
TAILSCALE=OAUTH_ACTIVE
ABACUS_API_KEY=ACTIVE_MASKED
ABACUS_MODELS=180
ABACUS_ROUTE_STATUS=HTTP_200
POLICIES=read tier1, write approval tier2, delete blocked tier4
LOGIN_SCOPE=publico|casa|ambos
BOOT_STUDIO=local presentation only, not governance
AUTONOMIA=runtime-aware with some yellow blockers
```

Esses pontos sao conhecimento operacional observado pela interface. Eles nao viram PASS global sozinhos. Cada rota continua precisando de health/chamada real/receipt quando for usada.

## Potencial real

```text
HUB_AS_CREDENTIAL_GATEWAY=true
ONE_HUMAN_ENTRY=true
PROVIDERS_CONNECTED_BY_HUB=true
DIRECT_PLATFORM_LOGIN_NOT_DEFAULT=true
SECRET_VALUE_IS_TRANSIT=true
SECRET_VALUE_NOT_MEMORY=true
SECRET_VALUE_NOT_RECEIPT=true
SECRET_VALUE_NOT_GIT=true
CONNECTOR_STATUS_VISIBLE=true
ROUTE_SCOPE_VISIBLE=true
```

Isso transforma o HUB em cockpit operacional: o CHEFE trabalha por uma sessao humana, conecta capacidades, troca credenciais quando quiser e deixa a CentralDark consumir somente o owner/rota/provedor aprovados.

## Secret transit

Segredo temporario fornecido pelo CHEFE e valor de passagem. O executor pode usar para aplicar no owner pedido, mas nao ecoa, nao registra valor e nao transforma em memoria.

```text
USE_SECRET_ONLY_FOR_REQUESTED_OWNER=true
NO_SECRET_ECHO=true
NO_SECRET_COMMIT=true
NO_SECRET_RECEIPT_VALUE=true
NO_SECRET_MEMORY=true
NO_SECRET_LOG_VALUE=true
MASK_SUFFIX_ONLY_WHEN_NEEDED=true
SCRUB_CONTROLLED_LOGS_AFTER_USE=true
ROTATE_OR_DISCARD_AFTER_USE=true
```

Receipt pode registrar: provedor, owner, destino, cid, status, masked_suffix se a UI ja exibiu mascara, resultado e next_cursor. Nunca o valor inteiro.

## Cadeados

```text
HUB_CONNECTED != PROVIDER_RUNTIME_PASS
OAUTH_ACTIVE != TOOL_CALL_PASS
MODEL_COUNT != MODEL_ROUTE_PASS
HTTP_200 != FEATURE_READY
SESSION_EXPIRED = LOGIN_REQUIRED_NOT_FAILURE
TOOL_LISTED != TOOL_ACTIVE
UNKNOWN != PASS
```

## Owners

- mapa/control plane: `MODULES/HUB/`
- runtime visual: `apps/modulos/hub`
- conectores UI: `apps/modulos/hub/src/components/connectors/`
- servicos API: `apps/modulos/hub/src/services/`
- MCP publico/admin: `apps/modulos/mcp`
- receipts: `MODULES/HUB/receipts/`

## Loop padrao

```text
OPEN_HUB
→ LOGIN_HUMANO
→ SELECT_SCOPE(publico|casa|ambos)
→ CONNECT_PROVIDER
→ TEST_STATUS
→ TEST_TOOL_OR_MODEL
→ SAVE_OWNER_BINDING
→ MICRODEPLOY_IF_CODE_CHANGED
→ RECEIPT_WITHOUT_SECRET_VALUE
→ ROTATE_OR_DISCARD_WHEN_DONE
```
