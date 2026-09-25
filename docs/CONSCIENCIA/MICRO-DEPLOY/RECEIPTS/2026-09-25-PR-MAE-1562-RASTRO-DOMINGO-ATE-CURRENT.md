# PR-MÃE #1562 — Rastro consolidado de domingo até CURRENT

Data: 2026-09-25
PR_MOTHER=#1562
ROLE=RENDEZVOUS_LEDGER_NOT_WRITER
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
DOCUMENTED_IS_NOT_EXECUTED=true
MERGED_IS_NOT_DEPLOYED=true

## Intenção do CHEFE

Consolidar no rendezvous #1562 o rastro útil acumulado desde domingo até a sessão CURRENT, sem apagar histórico, sem converter hipótese em fato e sem criar arquitetura paralela. Este receipt registra achados, correções de diagnóstico, provas aprovadas, micro-deploys e pendências ainda abertas.

## Linha do tempo / rastro útil

### CASA / Windows SEGREDO

Evidência histórica desta janela provou parcialmente o runtime local da Casa:
- OAuth/MCP perfil Segredo: refresh PASS, auth PASS, 112 tools.
- OAuth/MCP segundo perfil: refresh PASS, auth PASS, 112 tools.
- Screenpipe: PID 42088; API 3030 observada.
- Bridge: PID 38404.
- Tray: TRAY_SAME_PROCESS=true.
- Single instance: SINGLE_INSTANCE=true.
- RDC é sensor independente; RDC offline não invalida automaticamente os seis eixos acima.

Regra cristalizada:
CASA_LOCAL_CORE_PROVADO != RDC_SENSOR_PROVADO.

### MCP / catálogo

Foi observado 112 tools nas superfícies OAuth/bridge e, em medição histórica da mesma janela, 116 tools no dispatcher runtime. Isso não foi tratado como contradição automática: superfícies diferentes podem expor catálogos diferentes.

Na remedição CURRENT de 2026-09-25:
- MCP :9100 /health = HTTP 200.
- service=mcp-centraldark.
- version=0.4.0.
- toolCount=125.
- /health/deep = HTTP 200, healthy, score=100, criticalFailures=[].
- /heartbeat permaneceu stale.

Conclusão: HEALTH_DEEP_PASS não promove HEARTBEAT_PASS.

### Git / main / VPS

O histórico mostrou múltiplos avanços da main enquanto a VPS permanecia atrás e dirty. O princípio preservado foi:
NO_BLIND_PULL_OVER_DIRTY_RUNTIME=true.

Na reancoragem CURRENT:
- remoto/main medido em 2e7366819373bc24b0a292a5fad61e55b64deee4 em uma rodada;
- VPS /root/CentralDark medida em 7f432be35aaff9ecc50f31a4d50512e645b629f7, branch main, behind 3, dirty;
- em rodada posterior do Live Execution Fabric a árvore continuou dirty e o próprio status registrou head/runtime local e lista de deltas.

Conclusão: SOURCE_CURRENT != RUNTIME_CURRENT até reconciliação explícita.

### PR-mãe e funil

O #1562 permanece ledger/rendezvous:
PR_MOTHER_MERGE_FORBIDDEN=true
PR_MOTHER_ROLE=RENDEZVOUS_LEDGER_NOT_WRITER
CHILD_PR_ONLY_PROMOTION_VEHICLE=true

O histórico desta janela registrou #1662 como veículo filho em momentos específicos. Commit comprovado:
dd202fed8125afe377abaae98a9961b6ae36c502
arquivo=scripts/set-bot-profile.sh
mensagem=feat(bot): fachada CentralDark via Bot API direta (MPRVA)

Esse commit não tocou .github/workflows e preservou owner existente/cofre canônico.

### Hermes / MCP / Bridge

Reancoragem CURRENT corrigiu diagnóstico antigo.

Provado por sonda:
- vmi3256920 respondeu via Remote Desktop Commander em medições da sessão.
- Hermes Core :8899 = HTTP 200, service hermes-core v5.0, watchdog saudável.
- Hermes gateway ativo.
- hermes serve --isolated ativo.
- docker mcp gateway run observado subordinado a processos Hermes.
- tunnel-client run --profile centraldark-mcp observado vivo.
- Desktop Commander conta1: um processo principal.
- Desktop Commander conta2: um processo principal.
- Hermes global/root possui provider configurado: NVIDIA NIM e modelo nvidia/nemotron-3.5-lightning-30b-a3b.
- perfil isolado conta2 sem provider próprio não equivale a Hermes global sem provider.
- inferência real do modelo não foi promovida a PASS sem chamada específica.

Achado de drift:
- dois hermes acp foram observados simultaneamente em uma rodada;
- um tinha relação com PM2;
- cardinalidade/owner exigem reconciliação antes de qualquer kill/restart.

### Operational telemetry

Owner existente:
apps/modulos/mcp/src/operational-telemetry.js

Regras comprovadas no código:
unknownIsNotPass
processAliveIsNotFixedPoint
sourceIsNotRuntime
oneWriterPerScope
reuseBeforeCreate
secretsContentExposed=false

Snapshot executado:
- schema=centraldark.operational.snapshot.v1
- verdict=UNKNOWN_NOT_PASS
- heartbeat.self=stale
- forensic.status=STALE
- latestReceiptPresent=true
- patternAlignment.marker=GREEN
- alignmentPct=86
- passCount=6
- failCount=1

Conclusão: GREEN 86% != FIXED_POINT e UNKNOWN_NOT_PASS permaneceu o veredito global.

### Matriz de agentes cristalizada

SOL=COORDINATION_ROLE
GEOFF=AUTOMATION_FACTORY
IAN=STRUCTURAL_SKEPTIC
GREG=OBSERVABILITY_PROOF
DEX=HUMAN_AGENT_COORDINATION
HERMES=EXECUTION_ROLE
REALIDADE=REALITY_JUDGE

Fluxo:
CHEFE_INTENÇÃO
→ SOL_RECONCILIA
→ GEOFF_DEFINE_LOOP_MINIMO
→ IAN_QUEBRA_PRESSUPOSTOS
→ GREG_MEDE_E_VERIFICA
→ DEX_CONTROLA_DELTA_CRITICO
→ HERMES_EXECUTA_SE_AUTORIZADO
→ REALIDADE_JULGA
→ RECEIPT
→ NEXT_CURSOR

### Live Execution Fabric — micro-deploy da sessão CURRENT

Direção:
ADMIN/HERMES → API/OMNI → MCP/adapters → alvo real → receipt → grafo vivo → HUD → NEXT_TIK_TAK.

Arquivos canônicos criados na main durante a sessão:
- docs/ARQUITETURA/CENTRALDARK-LIVE-EXECUTION-FABRIC.md
  commit 006bdc2983758c07411c22068e1b5d998d31546a
- docs/CONSCIENCIA/MICRO-DEPLOY/ROTA-VIVA-API-MCP-GRAFO.yml
  commit b5f29fdaf80d3cf543fde64926a5faddc5b60a32
- docs/CONSCIENCIA/MICRO-DEPLOY/RECEIPTS/live-execution-fabric-admin-hybrid-20260925T0643Z.md
  commit 42b308f2a544f9a01bea1ae082817180a67d9f4d
- docs/CONSCIENCIA/MICRO-DEPLOY/RECEIPTS/live-execution-fabric-runtime-20260925T0347Z.md
  commit 69d83b2c331ca65664016f636629f95e4d409443

Runtime:
- Omni Router recebeu /fabric/live/status, /fabric/live/graph e /fabric/live/start.
- Caddy recebeu /api/live-fabric/status, /api/live-fabric/graph e /api/live-fabric/start.
- painel /omni recebeu a superfície Live Execution Fabric.
- python3 -m py_compile passou.
- caddy validate passou.
- Caddy reload passou.
- centraldark-omni-router voltou online após reload.
- GET http://127.0.0.1:8099/fabric/live/status = HTTP 200.
- POST http://127.0.0.1:8099/fabric/live/start = HTTP 200.
- job real criado: live-fabric-20260925T034705Z-07a7d8d4.
- receipt runtime e JSON runtime foram materializados.

Contraprova importante:
imediatamente após reload houve connection refused transitório em :8099. A sessão não o mascarou; logs posteriores provaram startup completo do Uvicorn e a sonda seguinte retornou HTTP 200.

Validação pública externa permaneceu UNKNOWN por falha DNS/TLS no caminho de teste usado; não foi promovida a FAIL do runtime nem a PASS da borda.

## Micro-deploys / provas aprovadas

PASS comprovado:
1. CASA local core — seis eixos históricos explicitamente medidos; RDC separado.
2. MCP :9100 health.
3. MCP :9100 health/deep local.
4. Hermes Core :8899.
5. Hermes gateway/processos observados.
6. tunnel-client centraldark-mcp observado.
7. Desktop Commander conta1 cardinalidade principal=1.
8. Desktop Commander conta2 cardinalidade principal=1.
9. Hermes provider global configurado.
10. Live Execution Fabric — py_compile.
11. Live Execution Fabric — Caddy validate.
12. Live Execution Fabric — Caddy reload.
13. Live Execution Fabric — Omni Router online após reload.
14. Live Execution Fabric — /fabric/live/status HTTP 200.
15. Live Execution Fabric — /fabric/live/start HTTP 200.
16. Live Execution Fabric — job e receipt reais escritos.
17. Contrato, binding e receipts canônicos versionados.
18. operational telemetry executada sem converter GREEN parcial em fixed point.

## UNKNOWN / bloqueios reais preservados

- borda pública Live Execution Fabric E2E: UNKNOWN.
- heartbeat MCP: STALE na medição.
- forensic CURRENT: STALE na medição.
- inferência real Hermes/provider: UNKNOWN sem chamada discriminante.
- ACP owner/cardinalidade: drift observado; reconciliação pendente.
- VPS Git/runtime: dirty e em momentos atrás da main; não fazer pull/reset cego.
- Windows SEGREDO via RDC: sensor independente e sujeito a TIK-TAK; histórico local não substitui sonda CURRENT.
- PM2/processo vivo não equivale a fixed point.

## Correções de diagnóstico desta janela

- CASA inteira UNKNOWN → corrigido: core local parcialmente provado; RDC independente.
- 112 vs 116 tools → corrigido: superfícies diferentes, não contradição automática.
- Hermes sem provider → corrigido: perfil conta2 isolado sem provider; Hermes global/root configurado.
- tunnel centraldark-mcp ausente → falso negativo corrigido pelo padrão real "tunnel-client run --profile centraldark-mcp".
- health/deep=100 → não mascara heartbeat stale.
- pattern GREEN 86% → não mascara verdict UNKNOWN_NOT_PASS.
- UI/processo/receipt histórico → nunca substitui CURRENT vivo.

## Invariantes que sobreviveram ao funil

REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
REALITY_IS_JUDGE=true
CURRENT_GT_HISTORY=true
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
DOCUMENTED_IS_NOT_EXECUTED=true
MERGED_IS_NOT_DEPLOYED=true
EXISTS_IS_NOT_RUNNING=true
TOOL_LISTED_IS_NOT_TOOL_ACTIVE=true
TESTED_IS_NOT_PROVEN_COMPLETE=true
PATCHED_IS_NOT_ROOT_CAUSE_FIXED=true
UI_TRUNCATED_IS_NOT_CONFIG_INVALID=true
TIK_TAK_REMEASURES_AFTER_STATE_CHANGE=true
TIK_TAK_IS_NOT_SWARM=true

## NEXT_CURSOR

PUBLIC_EDGE_REMEASURE
→ HEARTBEAT_CURRENT
→ FORENSIC_CURRENT
→ ACP_OWNER_CARDINALITY
→ VPS_DIRTY_DELTA_RECONCILE
→ SOURCE_RUNTIME_ALIGNMENT
→ SAME_HEAD_PROOF
→ RECEIPT
→ #1562

FIXED_POINT_GLOBAL=false
