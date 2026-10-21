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


## REVISÃO #ACORDAR — contraprova SOURCE 17 versus RUNTIME 13 (20/10/2026)

**Escopo:** revisão do receipt de 20/10 e mapeamento read-only dos owners já existentes, às 14:20 UTC, sem alterações em processos, regras de rede, autenticação, arquivos de produção ou deploy.

**Provas confrontadas:**
- `mcp_status` e `mcp_admin_catalog` ao vivo: dispatcher `mcp_admin_call`, 141 tools internas únicas, 20 `destructiveHint=true`, 13 rotas, fingerprint `80f0a0fab518ab8d15bbf6651b5471813369c53e56902d905883caa97c7405c7`, auditoria de inicialização pronta.
- `apps/modulos/mcp/src/tools/core/mcp-admin.js` da `main`: `AUTHORIZED_ROUTE_CATALOG` declara **17** entradas e fingerprint estático `b526d18f8701a14ec3a2628ae71ee3af04b67e75d538e9c3ae0ca0ca2b7835aa`.
- Quatro entradas **SOURCE_ONLY_UNTIL_RUNTIME_READBACK** ausentes das 13 rotas servidas: `ZENDRIVE_VSCODE_REMOTE_SSH`, `FIGMA_MCP_ACCOUNT`, `FIGMA_CENTRALDARK_FIGJAM`, `RDC_VPS_CENTRALDARK_OS`. A presença no fonte não confirma binding vivo.
- `github/main` e checkout Git da VPS convergiram para `45cd830c18415d0412373dff100869ab2b200272`. **GIT_SYNC_PASS != MCP_PROCESS_CODE_LOADED**; existe árvore de runtime compilado separada documentada; conteúdo efetivamente carregado ainda não foi provado por SHA/readback da árvore executável.
- `deploy_validate_mcp_catalog`: `/health` público declara 153 tools; `mcp_catalog_diff` usa visão de 86, aponta seis itens ausentes da própria expectativa. Não somar 141+153+86 nem inferir ausência de ferramentas do servidor público sem comparar `/tools.json` e os respectivos escopos.
- `admin_pm2_list` falhou diretamente com `spawn pm2 ENOENT`; `deploy_status` exibe `vps_pm2: SyntaxError: Unexpected end of JSON input`. Isso é **falha do diagnóstico PM2**, não prova de que serviços estão offline. Necessário reutilizar dono systemd/runtime existente e validar separadamente.
- `centraldark_operational_snapshot`: MCP PID `834279` em RUNNING; `heartbeat.self=UNKNOWN`; forense `latestReceiptPresent=false` no arquivo forense esperado; não confundir com este receipt GitHub.
- **Auditoria de classificação**: `admin_commit_main` em `apps/modulos/mcp/src/modes/admin/tools/admin-main-writer.js` efetua commit CAS na `main` com proteções locais, porém `annotations.destructiveHint=false`. Não afirmar bypass; exigir revisão da semântica e dos gates admin na frente específica antes de modificar.
- PRs [#1876](https://github.com/ServerVpss/CentralDark/pull/1876), [#1877](https://github.com/ServerVpss/CentralDark/pull/1877) e [#1880](https://github.com/ServerVpss/CentralDark/pull/1880) ainda abertos, não merged. Checks HEAD: #1876 (28 queued/30 skipped/15 cancelled), #1877 (27 queued/15 skipped), #1880 (23 queued/22 skipped/5 cancelled). **SKIPPED/CANCELLED/QUEUED != CI_GREEN**.

**Estado e correção temporal do registro anterior:**
```text
DOCUMENTED_CATALOG_2026_10_06=11 (HISTORICAL)
SOURCE_MAIN_ROUTE_COUNT_CURRENT=17
MCP_RUNTIME_ROUTE_COUNT_CURRENT=13
SOURCE_FP=b526d18f8701a14ec3a2628ae71ee3af04b67e75d538e9c3ae0ca0ca2b7835aa
RUNTIME_FP=80f0a0fab518ab8d15bbf6651b5471813369c53e56902d905883caa97c7405c7
SOURCE_RUNTIME_PARITY=NOT_PROVEN_DRIFT_OBSERVED
GITHUB_MAIN_VPS_GIT_CHECKOUT_SYNC=PASS
MCP_PROCESS_RELOAD_AND_MATCHING_SHA=UNKNOWN
PM2_DIAGNOSTIC=ERROR_PM2_NOT_FOUND
ADMIN_MAIN_WRITE_CLASSIFICATION_REVIEW=PENDING
REVIEW_RECEIPT=PASS_AFTER_GITHUB_READBACK
FULL_MISSION_COMPLETE=false
```

**FIXED_POINT:** revisão e classificação de evidências concluídas **somente no escopo documental**. Nenhum código compilado carregado, merge, deploy, restart, alteração de ACL ou serviço executado.

**NEXT_CURSOR:** `COMPARE_ACTUAL_MCP_RUNTIME_DIST_SHA_AND_17_SOURCE_ROUTES → RECONCILE_SOURCE_DIST_WITHOUT_RESTART_BLIND → PM2_SYSTEMD_OWNER_DIAGNOSIS → REVIEW_ADMIN_MAIN_WRITE_RISK_CLASSIFICATION → PR1876_1877_1880_CI_GATES → VERIFIED_DEPLOY → MCP_ADMIN_CATALOG_READBACK_AND_COUNTERPROOF → FIXED_POINT`.


## DELTA 21/10/2026 — reconciliação por superfície e canário (candidato)

@code_ref: `apps/modulos/mcp/src/tools/core/mcp-diagnostics.js` + `apps/modulos/mcp/src/tools/core/mcp-admin.js`
@last_updated: 2026-10-21T20:00:00Z

INTENT_ID=CENTRALDARK-MCP-VALIDATOR-RUNTIME-CANARY-20261021
OWNER=apps/modulos/mcp/src/tools/core/mcp-diagnostics.js
SOURCE_BASE_SHA=4c86124f01b7626108faf8f94e91a5cb6e9e5e17
ACTIVE_WRITER=fix/mcp-catalog-canary-runtime-scope-20261021
STATUS=SOURCE_CANDIDATE_NOT_DEPLOYED

- Readback na conexão Primary anterior ao delta: dispatcher=141 tools, 13 rotas, fingerprint `80f0a0fab518ab8d15bbf6651b5471813369c53e56902d905883caa97c7405c7`; HTTP público=153; validador legado=86; `ok=false`.
- GitHub `main` no SHA-base já contém **17 entradas** em `AUTHORIZED_ROUTE_CATALOG`, entre elas `ZENDRIVE_VSCODE_REMOTE_SSH`, `FIGMA_MCP_ACCOUNT`, `FIGMA_CENTRALDARK_FIGJAM`, `RDC_VPS_CENTRALDARK_OS`.
- O validador candidato consulta o **mesmo `mcp_admin_catalog` interno** para nomes, fingerprint e rotas, exige as quatro rotas adicionais no canário e diferencia **catálogo do dispatcher** de **publicação HTTP**; quatro diagnósticos expostos passam pela mesma comparação.
- `vps_limpar_pasta_projeto` e `vps_listar_pastas_limpaveis` saem somente da **expectativa obrigatória legada**: continuam reportadas como `legacySafetyReview`. NÃO foram recriadas, habilitadas, nem receberam bypass de autorização.
- Tailscale OAuth broker `bridge.status`: `centraldark-os.online=true`, `segredo.online=true`, RDP 3389 OPEN; SSH Casa CLOSED_OR_FILTERED. Outra API Tailscale respondeu HTTP 401; isso não invalida o bridge.status do broker.
- `centraldark_deploy_root_gate` PASS; `centraldark_deploy_recipe_status` disponível. VPS checkout principal `4b0ce5a7d9` com alterações locais: preservar. Scratch do deploy isolado permanece owner separado.
- **GATE CANÁRIO**: PR/CI no HEAD exato -> resolver diferenças da fonte (não executar `git pull` cego) -> preparar sandbox/backup via owner de deploy -> validar T0/T1 (141/153 contagens por superfície, 17 rotas + 4 adicionais, logs/correlação, health) -> somente então promover o owner MCP isoladamente. O `main-pinned-microdeploy.sh` vigente **rejeita `src/tools/core/mcp-diagnostics.js` e `src/tools/core/mcp-admin.js`**, portanto NÃO utilizar esse fileset sem contrato de promoção específico já autorizado e testado. Nunca forçar o script.
- Confirmar rollback e recibo correlacionado no mesmo SHA antes de declarar FIXED_POINT. RUNTIME_DEPLOY=UNKNOWN; CASA_REVERSE_EXEC=UNKNOWN; CI=UNKNOWN enquanto não verificados.

NEXT_CURSOR=PR_HEAD_CI → CHECK_CANONICAL_MCP_OWNER_DEPLOY_GATE → ISOLATED_CANARY → ROUTE_READBACK_17 → RECEIPT → FIXED_POINT.


### Retificação técnica no mesmo PR (2026-10-21)

- Contraprova: a primeira implementação procurava `mcp_admin_catalog` em `runtimeTools`. O arquivo `mcp-admin.js` exporta o catálogo na coleção `mcpAdminTools`; sem correção ocorreria `MCP_ADMIN_CATALOG_UNAVAILABLE` no runtime. Patch corrigiu a origem e preservou `runtimeToolCount` sem inflar a contagem por tools externas; compara expectativa administrativa contra união de nomes.
- `routeParity` exige cardinalidade de **17** e não apenas consistência interna com a própria lista.
- `publicRestrictedByPolicy` classifica tools destrutivas ausentes do catálogo público sem reexposição; apenas ausências não justificadas entram no gate `publicMissingSafe`.
- `admin_pm2_list` via dispatcher retornou `spawn pm2 ENOENT`; `deploy_status` ainda retorna `vps_pm2: SyntaxError: Unexpected end of JSON input`. Provável executável PM2 não resolvido no ambiente do MCP, mas processo/ExecStart ainda não aferido. Nenhuma afirmação de PM2 off.
- Remote Desktop Commander `list_devices` reportou SEGREDO e CENTRALDARK-OS offline pelo fornecedor, apesar de `tailscale_bridge_status` reportar os hosts online. São camadas distintas; ponte Tailscale PASS não prova Desktop Commander online.
- CI do PR #1896 no HEAD `6303444f4a512188d812d110e22a8b90526104bc` ainda PENDING antes da retificação. Nenhum deploy sem teste no novo HEAD.

NEXT_CURSOR=NEW_SHA_CI → PROCESS_9100_SOURCE_IDENTITY → CANARY_SAFE_DEPLOY_GATE → T1_ROUTES_17 → RECEIPT.


### PM2 — causa-raiz diferenciada, correção na branch canário (2026-10-21T20:15:38.720Z)

@code_ref: `apps/modulos/mcp/src/tools/deploy/deploy.js`

- A chamada `admin_pm2_list` retornou `spawn pm2 ENOENT`; o `deploy_status` anterior usava shell pipe sem `pipefail` e `JSON.parse(res.stdout.trim())`, produzindo `Unexpected end of JSON input` quando PM2/Python não retornavam JSON.
- Patch usa `command -v pm2`, `set -o pipefail`, `res.exitCode` e códigos distinguíveis `PM2_NOT_IN_RUNTIME_PATH`, `PM2_PROBE_FAILED_EXIT_*`, `PM2_PROBE_EMPTY_OUTPUT`, `PM2_SUMMARY_JSON_INVALID`, `PM2_SUMMARY_NOT_ARRAY`.
- Projeto JSON sanitizado continua sem expor env/token de PM2. Diagnóstico aprimorado **não instala PM2**, não reinicia serviço e não declara os processos parados. A configuração do PATH da unidade/processo ainda precisa de T1.
- TEST_STATUS=AWAIT_SAME_SHA_CI; RUNTIME_STATUS=UNCHANGED.
