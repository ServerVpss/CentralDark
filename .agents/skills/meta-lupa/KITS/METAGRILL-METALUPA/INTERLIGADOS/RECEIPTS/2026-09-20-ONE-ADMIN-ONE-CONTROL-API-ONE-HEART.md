# 🧬 CRISTAL DE DIREÇÃO — ONE ADMIN · ONE CONTROL API · ONE HEART

```text
PR_MOTHER=#1562
ROLE=RENDEZVOUS_RECEIPT_ONLY
OBSERVED_AT=2026-09-20T00:41:25-03:00
GITHUB_MAIN=cead445aa2a9386352d701070a56dfe5c8e066b4
VPS_CANONICAL_MAIN=cead445aa2a9386352d701070a56dfe5c8e066b4
VPS_ROOT_HEAD=f3c00f9c73c6691ef044bb237623e88ce57aaf38
VPS_ROOT_DIRTY=true
INTENT_AUTHORITY=SEGREDO/CHEFE
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
```

## Intenção autorizada

Reduzir complexidade administrativa da CentralDark para **uma direção só**, reutilizando os owners já existentes e sem criar segundo painel, segunda API, segundo coração ou arquitetura V2/V3/V4 para a mesma capability.

```text
ONE_HUMAN_ADMIN=true
ONE_CONTROL_API=true
ONE_HEARTBEAT=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
```

## Arquitetura-alvo cristalizada

```text
👑 CHEFE
   ↓
https://admin.centralldark.com
   ↓
ADMIN HUMANO ÚNICO DA CENTRALDARK
   ↓
https://api.centralldark.com
   ↓
CONTROL API ÚNICA
   ↓
owners/adapters existentes
   ├─ MCP Admin
   ├─ Contas / OAuth
   ├─ Cloudflare
   ├─ Contabo
   ├─ Tailscale
   ├─ Buildkite
   ├─ GitHub
   ├─ Casa / VPS
   └─ demais capabilities provadas
   ↓
receipt / audit / logs
   ↓
https://api.centralldark.com/heartbeat
   ↓
ONE HEART / observabilidade consolidada
```

## Separação obrigatória de papéis

```text
ADMIN_UI != CONTROL_API
CONTROL_API != HEARTBEAT
HEARTBEAT != COMMAND_BUS
MCP_ADMIN != HUMAN_ADMIN_UI
PROVIDER_PANEL != PROVIDER_PUBLIC_API
```

O heartbeat observa e agrega saúde/estado. Ele **não** vira barramento de comandos.

O Admin humano não deve carregar credenciais privilegiadas do MCP no browser quando uma chamada server-to-server pela Control API puder preservar melhor autoridade e segredo.

## Superfícies canônicas

```text
https://admin.centralldark.com
→ única UI humana da Casa

https://api.centralldark.com
→ única API de controle/orquestração da Casa

https://mcp.centralldark.com/mcp
→ MCP normal para agentes/clientes

https://mcp.centralldark.com/admin/mcp
→ MCP privilegiado para agentes autorizados

https://api.centralldark.com/heartbeat
→ coração único de observabilidade
```

O botão/área **MCP Admin** deve existir dentro do Admin humano como uma capability consumida pelo próprio Admin. Isso **não** cria um segundo painel.

## Owners e capabilities já provados no repositório

O backend MCP já contém:

```text
/admin/mcp
/admin/provider
/admin/api/tools
/admin/api/logs
/admin/api/metricas
/admin/api/e2e
/admin/api/issue-key
/health
/health/deep
/heartbeat
```

Existe ainda o bridge:

```text
apps/modulos/mcp/src/provider-admin-bridge.js
```

que autentica Admin, restringe a allowlist e despacha para:

```text
provider_capabilities
provider_credentials_status
provider_read
provider_mutate
```

### Cloudflare

Capabilities já catalogadas incluem, entre outras:

```text
accounts
zones
DNS list/create/update/delete
rulesets
Origin CA
billing/usage onde a API pública permite
```

### Contabo

Capabilities já catalogadas incluem, entre outras:

```text
instances list/get
start/stop/restart
audits
snapshots list/get/create/update/delete/rollback
tags
roles / api permissions
```

## Limites honestos de provider

Nem tudo que existe em painel comercial existe na API pública.

Exemplos já classificados pelo owner existente:

```text
Contabo billing.invoice  = UNSUPPORTED_BY_PUBLIC_API
Contabo billing.payment  = UNSUPPORTED_BY_PUBLIC_API
Cloudflare billing.pay_invoice = UNSUPPORTED_BY_PUBLIC_API
```

Nesses casos:

```text
CAPABILITY_NOT_AVAILABLE_VIA_API
→ preservar UNKNOWN/UNSUPPORTED
→ abrir painel externo apenas quando realmente necessário
```

Não inventar capability.

## Estado vivo medido

```text
https://api.centralldark.com/heartbeat      = HTTP 200
https://api.centralldark.com/health         = HTTP 200

https://api.centralldark.com/admin/mcp      = HTTP 502
https://api.centralldark.com/admin/provider = HTTP 502

https://mcp.centralldark.com/admin/mcp      = HTTP 401 sem credencial admin
https://admin.centralldark.com/admin        = HTTP 200
https://mcp.centralldark.com/admin          = HTTP 200
```

O coração respondeu, porém o payload atual marcou:

```text
heart=one
route=api.centralldark.com/heartbeat
service=mcp-centraldark
self=stale
```

Portanto:

```text
HEARTBEAT_ROUTE_EXISTS=true
HEARTBEAT_HTTP=200
HEARTBEAT_SELF_CURRENT=stale
HEARTBEAT_FULL_HEALTH_PASS=false
```

Nenhum falso-verde.

## Causa atual da Control API incompleta

O Caddy atual de `api.centralldark.com` encaminha:

```text
/health       → :9100
/health/deep  → :9100
/heartbeat    → :9100
outros paths  → :8090 ArsenalAdapter
```

Logo `/admin/mcp` e `/admin/provider` ainda não entram no owner administrativo e retornam 502 pela rota atual.

Classificação:

```text
CONTROL_API_ADMIN_ROUTES_NOT_CONVERGED=true
FIX_REQUIRED=true
FIX_EXECUTED_IN_THIS_RECEIPT=false
```

## Admin humano único

Peças administrativas já existentes:

```text
:8787 Hermes WebUI / casca administrativa observada
apps/modulos/mcp-admin-ui
CentralDarkCockpitShell
MCP admin backend
provider-control
oauth-broker
ContasAdmin
```

A direção é **absorver capacidades na mesma casca/owner**, não empilhar painéis independentes.

```text
MCP_ADMIN = capability do Admin
CONTABO = capability do Admin
CLOUDFLARE = capability do Admin
BUILDkite = capability do Admin
GITHUB = capability do Admin

NENHUM_DELES = NOVO_ADMIN_PARALELO
```

## Cadeados

```text
ONE_HUMAN_ADMIN
ONE_CONTROL_API
ONE_HEART
REUSE_BEFORE_CREATE
OWNER_BEFORE_NEW_SURFACE
SERVER_TO_SERVER_FOR_PRIVILEGED_CALLS
HEARTBEAT_IS_OBSERVER_NOT_COMMAND_BUS
UNSUPPORTED_API != FAKE_CAPABILITY
HTTP_200 != HEALTHY_IF_PAYLOAD_SAYS_STALE
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
UNKNOWN != PASS
```

## NEXT_CURSOR

```text
FIND_CANONICAL_HUMAN_ADMIN_OWNER
→ reconcile :8787 vs mcp-admin-ui vs CentralDarkCockpitShell
→ choose one existing shell, no parallel admin
→ expose existing capabilities inside that shell
→ route api.centralldark.com control-plane paths to existing owners
→ preserve mcp.centralldark.com/mcp
→ preserve mcp.centralldark.com/admin/mcp
→ preserve /contas owner
→ repair/remeasure heartbeat self=stale
→ Caddy validate
→ micro-reload
→ T1 GitHub || VPS
→ receipt
→ FIXED_POINT
```

Este receipt cristaliza **intenção + evidência medida + limites**. Não declara a convergência como já executada.
