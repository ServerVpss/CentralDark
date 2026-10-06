# Receipt — MCP Unified Capability Catalog Metabolism

Data: 2026-10-06
Learning: #168
Claim: HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH
PR_MOTHER_CURRENT=#1757
PR_MOTHER_LEGACY=#1562

```text
CATALOG_OWNER=apps/modulos/mcp/src/tools/core/mcp-admin.js
CATALOG_CONSUMER=mcp_admin_catalog
CATALOG_SCOPE=centraldark_unified_capability_catalog
CATALOG_EXPECTED_ROUTES=11
CATALOG_FINGERPRINT=42c132bf864a3a82b16495bc6109a2d09c90e7c0806988fb389103e021011bd5
SCREENPIPE_AND_RDC_SHARE_ONE_MCP_CATALOG=true
ONE_ROUTE_FAILED_IS_NOT_SYSTEM_FAILED=true
NEXT_AUTHORIZED_ROUTE_AUTO_CONTINUE=true
DOCUMENTED_ROUTE_IS_NOT_RUNTIME_PROOF=true
NO_PARALLEL_OWNER_CREATED=true
CATALOG_SOURCE_READBACK=PASS
LIVE_MCP_CATALOG_RELOAD=UNKNOWN_UNTIL_READBACK
```

## Source proof

- `mcp_admin_catalog` retorna tools + routes no mesmo payload.
- `RDC_DESKTOP_COMMANDER` está no catálogo unificado.
- `SCREENPIPE_LOCAL_SENSOR` está no catálogo unificado.
- filtros do catálogo são aplicados também às rotas;
- o payload possui `catalogFingerprint`, `routeCount` e `routeReturned`;
- recipe/fingerprint do multirota foi evoluído no owner existente;
- verifier ganhou asserts específicos;
- hook/trigger existentes foram reutilizados.

## Complete sieve

```text
APRENDIZADO=PASS
LEMBRANCA=PASS
RECEITA_EXECUTAVEL=PASS_SOURCE
HOOK_REAL_WHEN_APPLICABLE=REUSED_EXISTING
TRIGGER=REUSED_EXISTING
BOOT=BOUND
VERIFIER=BOUND
CONSUMER_REAL=MCP_ADMIN_CATALOG_SOURCE
CHECKLIST_DIARIO=BOUND
RECEIPT=THIS_FILE
PR_MOTHER_1757=RENDEZVOUS
LEGACY_PR_MOTHER_1562=PRESERVED
RUNTIME_READBACK=UNKNOWN_UNTIL_LIVE_RELOAD
```

## Counterproof

Não promover catálogo documentado/materializado para runtime vivo sem readback do processo MCP. A existência de Remote Desktop Commander ou Screenpipe no catálogo não implica que seus bindings estejam online neste instante.

## NEXT_CURSOR

`LIVE_MCP_CATALOG_READBACK → VERIFY_FINGERPRINT_AND_11_ROUTES → FILTER_SCREENPIPE → FILTER_DESKTOP → ROUTE_FAILOVER_REPLAY → FIXED_POINT`


## Contraprova executada no CURRENT

```text
SOURCE_MAIN=93cc39bbf578668143b8f8b596320d07a7d6b754
NODE_CHECK=PASS
MCP_UNIFIED_CAPABILITY_CATALOG_CHECKS=PASS
INTRODUCED_SCOPE_FAILURES=0
GLOBAL_UNRELATED_FAILURES=2
GLOBAL_UNRELATED_1=GLOBAL_LEARNING_LINEAGE_EXECUTABLE_GATE:LINEAGE_MANIFEST_DRIFT
GLOBAL_UNRELATED_2=SOUL_SYNC_CURRENT_FOR_FIXED_POINT:STALE_ANCHORS
RUNTIME_HTTP_9100=PASS_EXISTING_PROCESS
LIVE_MCP_CATALOG_NEW_PAYLOAD=UNKNOWN_UNTIL_PROCESS_RELOAD_AND_TOOL_READBACK
```

Os dois vermelhos globais já existiam fora deste cone; não foram mascarados nem reclassificados como PASS.


## Promoção física para o runtime VPS

```text
VPS_RUNTIME_TREE=/root/CentralDark_MCP_RUNTIME
VPS_RUNTIME_UNIT=centraldark-native-mcp-http.service
RUNTIME_PROCESS_PID_BEFORE_RELOAD=2446659
RUNTIME_PORT=9100
RUNTIME_FILES_PROMOTED=PASS
RUNTIME_BACKUP=/root/CentralDark-Recovery/mcp-catalog-20261006
RUNTIME_SRC_SHA256=3f3d059ae00469728d535ae34121322d335e9365555494bd89a9132d1ae64ca4
RUNTIME_DIST_SHA256=d63020ec58b940d636b57a091608faf63b62c607a489fada64c2bd9339e0c1b0
RUNTIME_NODE_CHECK=PASS
SERVICE_RESTART=BLOCKED_BY_EXECUTION_TOOL_SECURITY
LIVE_MCP_CATALOG_NEW_PAYLOAD=UNKNOWN_UNTIL_SERVICE_RELOAD_AND_TOOL_READBACK
```

Os arquivos novos foram promovidos cirurgicamente na árvore que o processo realmente executa, preservando os deltas locais já existentes em `mcp-server.js` e `operational-telemetry.js`. O serviço não foi declarado atualizado porque a tentativa de restart foi bloqueada pela camada de execução antes da ação.
