# 🧬 CRISTAL DE DESCOBERTA — Admin oficial CentralDark vs painel técnico MCP

```text
PR_MOTHER=#1562
ROLE=RENDEZVOUS_RECEIPT_ONLY
OBSERVED_AT=2026-09-20T00:28:37-03:00
GITHUB_MAIN=cead445aa2a9386352d701070a56dfe5c8e066b4
VPS_CANONICAL_MAIN=cead445aa2a9386352d701070a56dfe5c8e066b4
VPS_ROOT_HEAD=f3c00f9c73c6691ef044bb237623e88ce57aaf38
VPS_ROOT_DIRTY=true
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
```

## Descoberta comprovada

A superfície pública `https://admin.centralldark.com/admin` está atualmente apontando para o mesmo backend MCP que serve `https://mcp.centralldark.com/admin`.

Medição atual:

```text
https://admin.centralldark.com/admin     = HTTP 200
https://mcp.centralldark.com/admin       = HTTP 200
https://mcp.centralldark.com/admin/mcp   = HTTP 401 sem credencial admin

127.0.0.1:9100/admin      = painel humano/técnico embutido no MCP
127.0.0.1:9100/admin/mcp  = endpoint MCP administrativo
```

O vhost ativo confirma a causa:

```caddy
admin.centralldark.com {
    @root path /
    redir @root /admin 302

    @contasRoot path /contas /contas/
    redir @contasRoot /contas/ai-review.html 302

    handle_path /contas* {
        reverse_proxy 127.0.0.1:9400
    }

    reverse_proxy 127.0.0.1:9100
}
```

Portanto, fora de `/contas*`, o domínio administrativo humano cai no MCP `:9100`.

## Origem histórica da divergência

O commit:

```text
f3c00f9c73c6691ef044bb237623e88ce57aaf38
fix(caddy): admin.centralldark.com liga no MCP (#1595)
```

introduziu a ligação direta da casca `admin.centralldark.com` ao MCP.

Isso explica por que o domínio humano e o painel técnico MCP hoje exibem a mesma superfície.

## Intenção canônica já documentada no próprio repositório

A Casa já registrou que:

```text
admin.centralldark.com
ou localhost:8787
= casca única administrativa da CentralDark
```

E a VPS mantém atualmente:

```text
0.0.0.0:8787
PID=1379784
CMD=/usr/local/lib/hermes-agent/venv/bin/python /tmp/hermes-webui/server.py
```

Probes locais:

```text
http://127.0.0.1:8787/      → 302 login?next=/
http://127.0.0.1:8787/admin → 302 login?next=/admin
```

Também existe no repositório a UI administrativa dedicada:

```text
apps/modulos/mcp-admin-ui/
├── LoginPage
├── AdminPage
├── OverviewTab
├── ToolsTab
├── KeysTab
├── OAuthClientsTab
├── AuditTab
└── ConnectorTab
```

Esse artefato existe, mas a medição desta descoberta **não prova que ele esteja servido pelo domínio `admin.centralldark.com`**.

## Separação funcional cristalizada

```text
HUMANO / CHEFE
https://admin.centralldark.com
→ casca administrativa oficial da CentralDark inteira

MCP NORMAL
https://mcp.centralldark.com/mcp
→ endpoint MCP para clientes/agentes

MCP ADMIN
https://mcp.centralldark.com/admin/mcp
→ endpoint MCP administrativo para agentes autorizados

PAINEL TÉCNICO MCP
https://mcp.centralldark.com/admin
→ painel técnico do próprio MCP
```

`/admin/mcp` é endpoint de máquina/JSON-RPC com escopo administrativo. Ele **não deve ser confundido com a casca humana global da CentralDark**.

## Divergência atual

```text
INTENÇÃO_CANÔNICA:
admin.centralldark.com → Admin Central da Casa

REALIDADE_ATUAL:
admin.centralldark.com/admin → MCP :9100

CLASSIFICAÇÃO:
ROUTE_OWNERSHIP_DRIFT = PROVEN
FIX_REQUIRED = YES
FIX_EXECUTED_IN_THIS_RECEIPT = NO
```

## Cadeados

```text
ADMIN_HUMANO != MCP_ADMIN_ENDPOINT
PAINEL_MCP != CASCA_GLOBAL_DA_CASA
ROTA_EXISTE != OWNER_CORRETO
HTTP_200 != ARQUITETURA_CORRETA
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
UNKNOWN != PASS
```

## Próximo cursor

```text
FIND_CANONICAL_ADMIN_OWNER
→ reconcile :8787 vs apps/modulos/mcp-admin-ui
→ choose existing owner, no parallel admin
→ patch admin.centralldark.com only
→ preserve /contas → 9400
→ preserve mcp.centralldark.com/mcp
→ preserve mcp.centralldark.com/admin/mcp
→ Caddy validate
→ micro-reload
→ T1 GitHub || VPS
→ prove human admin shell != MCP technical panel
→ receipt
```

Este receipt **registra a descoberta**. Ele não declara a correção como executada.
