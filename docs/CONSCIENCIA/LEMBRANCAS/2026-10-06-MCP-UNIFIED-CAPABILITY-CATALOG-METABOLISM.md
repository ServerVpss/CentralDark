# Lembrança — Metabolismo do catálogo unificado MCP

Status: SESSION_CRYSTAL
Authority: SEGREDO/CHEFE
Learning: #168
Owner executável: `apps/modulos/mcp/src/tools/core/mcp-admin.js`
Receita: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-CLAIMS.lock.json#HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH`

## O que ficou aprendido

A CentralDark não precisa de um MCP para tools, outro para Desktop Commander e outro para Screenpipe. O mesmo catálogo pode descrever capacidades internas e rotas externas sem confundir catálogo com execução.

```text
CENTRALDARK MCP
├─ tools internas
├─ rotas autorizadas
│  ├─ MCP nativo VPS
│  ├─ MCP remoto OAuth
│  ├─ Remote Desktop Commander
│  ├─ Screenpipe
│  ├─ SSH
│  ├─ Tailscale
│  ├─ MCP Casa→VPS
│  ├─ Hermes↔Shell
│  ├─ GitHub↔Runtime
│  ├─ AionUi↔MCP
│  └─ CAS Cloud relay
└─ Reality Judge
```

## Relação Screenpipe × Desktop Commander

Remote Desktop Commander é ponte/capability de execução autorizada. Screenpipe é sensor visual/áudio/desktop. Eles ficam no mesmo catálogo, mas o estado de um não prova o estado do outro.

```text
SCREENPIPE_AND_RDC_SHARE_ONE_MCP_CATALOG=true
RDC_STATE != SCREENPIPE_STATE
CATALOG_ENTRY != RUNTIME_HEALTH
DOCUMENTED_ROUTE_IS_NOT_RUNTIME_PROOF=true
```

## Receita de replay

1. Consultar `mcp_admin_catalog` com filtro pertinente.
2. Resolver tool/route/capability sem criar owner paralelo.
3. Medir a rota no binding atual.
4. Se falhar, classificar a rota exata.
5. Consultar as alternativas autorizadas do mesmo catálogo.
6. Continuar pela primeira capability viva aplicável.
7. Fazer readback do efeito.
8. Só então PASS/UNKNOWN/BLOCKED.
9. Registrar receipt e preservar NEXT_CURSOR.

## Hook e guardrails

Reutilizados:
- `CAPABILITY_GAP` e `TERRITORY_ROUTE_CHANGE` em `TRIGGERS.yml`;
- `ROUTE_FAILURE` em `system_sentinel.py`;
- `HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH` no registry;
- `PROVEN-DETERMINISTIC-LOCK.yml`;
- `verify_repo_contract.py`;
- `CENTRALDARK_AI_BOOT.yaml`;
- PR-mãe #1757 como rendezvous, #1562 como legado.

Nenhum segundo dispatcher, MCP, router, hook ou cérebro foi criado.

## Fingerprint atual

`42c132bf864a3a82b16495bc6109a2d09c90e7c0806988fb389103e021011bd5`

## Fronteira de realidade

A main prova a materialização do catálogo e do metabolismo. A VPS só vira PASS para o catálogo novo quando o runtime vivo devolver esse fingerprint/rotas em `mcp_admin_catalog`.
