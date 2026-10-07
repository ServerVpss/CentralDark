# Receipt — MCP vivo: capability preservada, superfície visual a convergir

Date: 2026-10-07
Status: RUNTIME_MAP_PROVEN_VISUAL_CONVERGENCE_PENDING
Authority: SEGREDO/CHEFE
Scope: CentralDark MCP runtime and administrative surface

## Decisão cristalizada

```text
MCP_RUNTIME=CANONICAL_TECHNICAL_OWNER
MCP_ADMIN_UI=LEGACY_VISUAL_SURFACE
INSTINTO_SUPERIOR=FUTURE_SINGLE_VISUAL_OWNER
ROTA_LEGADA!=OWNER_VISUAL
CAPABILITY_SURVIVES_WHILE_SURFACE_CONVERGES=true
ONE_ADMIN_MANY_ENDPOINTS=true
```

A convergência visual não autoriza apagar runtime, API, catálogo, logs, auditoria, OAuth ou rotas de máquina. O MCP continuará como owner técnico; a tela administrativa separada será absorvida gradualmente pelo Instinto Superior, preservando compatibilidade no endereço legado.

## Runtime medido

```text
UNIT=centraldark-native-mcp-http.service
ACTIVE=active
PID=2239433
EXEC=/usr/local/bin/node /root/CentralDark_MCP_RUNTIME/apps/modulos/mcp/dist/index.js
WORKING_DIRECTORY=/root/CentralDark_MCP_RUNTIME/apps/modulos/mcp
LISTENER=127.0.0.1:9100
HEALTH=/health 200
CATALOG_VERSION=153-54e72b14201d
TOOL_COUNT=153
```

O runtime checkout medido está em `88cf62163775ec7c4bdbaba1265feefdc027733c`, branch `codex/aionui-native-20261004`, com estado local sujo e arquivos de prova não rastreados. Portanto ele é evidência de runtime, **não writer autorizado** nesta convergência.

## Roteamento vivo medido

```text
mcp.centralldark.com
→ 127.0.0.1:9100

admin.centralldark.com
→ /health /mcp /tools.json /admin/mcp /admin/mcp/* → 127.0.0.1:9100
→ demais caminhos → 127.0.0.1:25810 (Rakazo)

centralldark.com / app.centralldark.com / ui.centralldark.com
→ 127.0.0.1:25808 (AionUi)
```

O roteamento já prova o princípio de uma superfície administrativa com capabilities atrás. A convergência deve preservar esta separação de rotas sem criar host, MCP, API ou hub paralelo.

## Capacidades observadas na superfície MCP existente

`apps/modulos/mcp/src/admin.js` contém, entre outras, superfícies de Grafo Celestial, Auditoria, Buildkite, Conector, Diagnóstico, Tailscale, catálogo de ferramentas, logs/stream, snapshot operacional e fluxo `heartbeat · logs · MCP · forensic`.

Há duplicação visual observada nas tabs `Auditoria`, `Conector` e `Diagnóstico`; isto é `VISUAL_FRICTION`, não capability nova.

Taxonomia candidata para o Instinto Superior:

```text
ONE_HEART / VISÃO_GERAL ← health, deep health, SSE, erros, warns, requests, processo
FERRAMENTAS / MCP ← catálogo, clients, policy e administração MCP
CONHECIMENTO ← Grafo Celestial, memória, consciência e padrões
OBSERVABILIDADE ← logs, SSE, auditoria, forensic e padrões de agentes
RUNTIME / FABRIC ← Omni, Hermes, workers, receipts e NEXT_CURSOR
CI / EXECUÇÃO ← Buildkite e GitHub Actions
REMOTO / REDE ← Tailscale, Desktop e Screenpipe
SISTEMA / DIAGNÓSTICO ← deep health, processos e policy
```

Isto é mapa de absorção visual; não é ainda implementação ou mudança de owner.

## Feridas runtime medidas

```text
/health/deep=503
SCORE=67
CRITICAL_FAILURE=hub_mission_consumer
LOADAVG≈23.26,19.53,17.70
SSE_ACTIVE=0
/heartbeat=500
```

Causa concreta de `/heartbeat=500`:

```text
src/index.js e dist/index.js
→ body inclui operational
→ operational não está definido naquele escopo
→ ReferenceError: operational is not defined
```

Esta falha é independente da futura absorção visual. Não é aceitável esconder o vermelho ao mover o painel: o One Heart deve projetar o estado real até que o owner do runtime corrija a ferida.

## Limites e segurança

```text
MCP_SERVICE_HEALTHY!=DEEP_HEALTHY
CATALOG_LISTED!=CAPABILITY_EFFECT_PROVEN
RUNTIME_DIRTY!=WRITER_AUTHORIZED
ORACLE_OR_USER_DISCOVERY=CANDIDATE_UNTIL_CURRENT_OWNER_READBACK
```

Nenhum segredo foi lido ou registrado.

## Rollback

Nenhuma mutação foi aplicada no MCP runtime, Caddy ou UI nesta rodada. O rollback desta cristalização é somente reverter este receipt.

## Next cursor

`RECONCILE_CANONICAL_MCP_SOURCE_WITH_LIVE_RUNTIME_DIRTY_FINGERPRINT_THEN_FIX_HEARTBEAT_OPERATIONAL_REFERENCE_BEFORE_VISUAL_ABSORPTION`
