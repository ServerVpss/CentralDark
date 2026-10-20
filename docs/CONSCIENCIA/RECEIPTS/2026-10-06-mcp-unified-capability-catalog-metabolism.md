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


## #ACORDAR — readback vivo do MCP CentralDark em 20/10/2026

**INTENÇÃO:** herdar a medição do catálogo MCP anterior e registrar estado atual sem substituir nem corrigir retroativamente o receipt histórico de 06/10. Consulta **read-only** feita em 20/10/2026, 12:36–12:37 UTC (09:36–09:37 BRT), pelo conector CentralDark autenticado.

**OWNER REUTILIZADO:** catálogo executável `apps/modulos/mcp/src/tools/core/mcp-admin.js`; dispatcher `mcp_admin_call`. Este registro continua no **receipt canônico existente**. Nenhum segundo MCP, cérebro, HUD, scheduler ou protocolo criado.

```text
MCP_RUNTIME_STATUS=PASS
DISPATCHER=mcp_admin_call
CATALOG_SCOPE=centraldark_unified_capability_catalog
CATALOG_VERSION=v1-f8ff6720fec3
CATALOG_FINGERPRINT=80f0a0fab518ab8d15bbf6651b5471813369c53e56902d905883caa97c7405c7
RUNTIME_CATALOG_TOOLS=141
RUNTIME_DISPATCHABLE_TOOLS=141
DESTRUCTIVE_CLASSIFIED_TOOLS=20
NON_DESTRUCTIVE_CLASSIFIED_TOOLS=121
ROUTES_DOCUMENTED_IN_LIVE_CATALOG=13
AUDIT_STARTUP_READY=true
MCP_PROCESS_PID_OBSERVED=834279
MCP_PROCESS_STATE=RUNNING
MCP_SELF_HEARTBEAT=UNKNOWN
FORENSIC_LATEST_RECEIPT=UNKNOWN
GITHUB_MAIN_SHA=4afb15b5bda9ed6bd852ecb36d53da67fb486310
VPS_CHECKOUT_SHA=4afb15b5bda9ed6bd852ecb36d53da67fb486310
VPS_CHECKOUT_UNTRACKED_CONTENT=EXISTS_PRESERVE
PUBLIC_MCP_HEALTH=PASS
PUBLIC_MCP_VERSION=0.4.0
PUBLIC_MCP_TOOLCOUNT=153
LEGACY_DIFF_SCOPE_TOOLCOUNT=86
LEGACY_DIFF_STATUS=FALTANDO_TOOLS
DEPLOY_STATUS=ERRO_PM2_JSON_PARSE
```

**As 13 rotas do catálogo** (a presença no catálogo **não** é runtime proof individual): `AIONUI_MCP_STDIO`, `CAS_CLOUD_RELAY`, `GITHUB_RUNTIME`, `HERMES_DELEGATED_COMMIT_PATH` (prova histórica PR #1748; replay obrigatório), `HERMES_SHELL`, `MCP_CASA_TO_VPS`, `MCP_REMOTE_OAUTH`, `MCP_VPS_NATIVE_HTTP`, `RDC_DESKTOP_COMMANDER`, `SCREENPIPE_CLI_RECORDER`, `SCREENPIPE_LOCAL_SENSOR`, `SSH_VPS_DIRECT`, `TAILSCALE_PRIVATE_ROUTE`.

**Contraprovas de contagem e alcance:**
- `141` é escopo do **dispatcher interno**; `153` é o `toolCount` reportado no /health **público**; `86` é o escopo **legado** usado pelos validadores `mcp_catalog_diff` e `deploy_validate_mcp_catalog`. Não somar nem considerar diretamente divergência equivalente a 12 tools duplicadas. Os validadores retornam `ok=false` por contratos de ferramentas faltantes; revisar owner e expectativa sem reduzir o catálogo.
- `mcp_catalog_diff` apontou `deploy_validate_mcp_catalog`, `mcp_audit_recent_logs`, `mcp_catalog_diff`, `mcp_policy_summary`, `vps_limpar_pasta_projeto`, `vps_listar_pastas_limpaveis` como ausentes do seu escopo legado. Os quatro primeiros existem como chamadas externas mas não como itens do catálogo de 86; os dois últimos exigem avaliação de descontinuação/segurança, não bypass.
- `deploy_status` marcou erro de parsing PM2 (`SyntaxError: Unexpected end of JSON input`): isso **não** demonstra ausência de processos, nem falha global MCP.
- `centraldark_operational_snapshot` observou MCP PID `834279`, Desktop Commander Remote VPS com 8 processos (não prova execução na Casa), mas classificou Telegram, Hermes, runner e Guardião como `NOT_OBSERVED` nessa amostra. `SELECTED` de modelo llama.cpp não implica inferência funcionando.
- Tailscale VPS↔Casa e Screenpipe `SEGREDO:3030/health` tiveram provas reais **nesta sessão anterior**, mas o conteúdo de tela é protegido por HTTP 403 e o áudio apresentou `degraded`. Readback com `screenpipe_status` aceitando Casa está no PR [#1877](https://github.com/ServerVpss/CentralDark/pull/1877), **não em main**.
- A rota `vscode_remote_*` proposta no PR [#1880](https://github.com/ServerVpss/CentralDark/pull/1880) permanece **não integrada e sem instalação/pareamento na Casa comprovados**.
- `vps_git_status` encontrou arquivos não rastreados na VPS: preservar; nunca `git reset --hard` ou `clean` durante reconciliação cega.

**FIXED_POINT / escopo fechado:** `LIVE_MCP_ADMIN_CATALOG_READBACK=PASS`, `ROUTE_COUNT_13=PASS`, `RECEIPT_REGISTRATION=PASS_AFTER_GITHUB_READBACK`; `FULL_RUNTIME_E2E=UNKNOWN`, `CATALOG_VALIDATOR_PARITY=BLOCKED_BY_OLD_SCOPE`, `PM2_PROBE=ERROR`, `MISSION_COMPLETE=false`.

**NEXT_CURSOR herdável:** `#ACORDAR → REUSE_EXISTING_OWNER → CATALOG_141_VS_PUBLIC_153_VS_LEGACY_86 → RECONCILE_EXPECTATIONS_WITHOUT_DELETING_TOOLS → PM2_READBACK_SEPARATE → PR1877/PR1880_CI_AND_DEPLOY_GATES → REAL_DEVICE_READBACK → !CONTRAPROVA → !FIXED_POINT`.

**Regra temporal:** os valores de `CATALOG_EXPECTED_ROUTES=11` e o fingerprint antigo acima no receipt são históricos de 06/10 e permanecem preservados; **CURRENT em 20/10 tem 13 rotas e fingerprint `80f0...`**.
