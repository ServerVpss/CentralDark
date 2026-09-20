# MICRO-HANDOFF — runtime VPS remedido após reconexão

Data: 2026-09-20

```text
VPS_HEAD=137ce29b6436680b90ceb309731701bedfe118ea
WORKTREE_TRACKED_DIRTY=0
WORKTREE_ALL_STATUS=0
TLC23_SELF_TEST=PASS 9/9
GLOBAL_CONTRACT_VALIDATOR=PASS
NODE=v22.23.2
NPM=10.9.8
PYTHON=3.10.12

CentralDark-Hermes=online
CentralDark-HermesVerificador=online
CentralDark-WebhookDeploy=online
CentralDark-MCP=online

MCP /health=200 ok=true toolCount=116
MCP /health/deep=200 status=degraded score=89 criticalFailures=[]
Webhook /health=200 ACTIVE
OmniRouter :8099/health=NO_RESPONSE

centralldark.com=200
admin.centralldark.com=200
admin.centralldark.com/contas=200
mcp.centralldark.com/health=200
portal.centralldark.com=200
telepainel.centralldark.com=200

self-hosted Runner.Listener=present
Runner.Worker=present
```

Interpretação fail-closed:

- runtime base está vivo;
- deep health não está verde total: `DEGRADED=89`;
- OmniRouter runtime não está vivo na porta 8099;
- VPS HEAD ainda não é provada como HEAD atual da main;
- fixed point global ainda NÃO fechou.

Próximo cursor: abrir o /health/deep completo para achar exatamente os 11 pontos faltantes e comparar VPS_HEAD contra main viva.
