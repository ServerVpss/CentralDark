# 👑🪬 READ/CLASSIFY — PDF/Horn + Boot + Council + Telegram

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Boot/Horn

CENTRALDARK_AI_BOOT.yaml no branch do contrato global já contém:
- TLC23/Horn oficial;
- fatos = evidência medida;
- regras = premissas explícitas → conclusão;
- closure até nenhum fato material novo;
- HUD_FIRST/HUD_UPDATE;
- one-writer per mutable scope;
- readers podem paralelizar percepção;
- teste/contraprova/remeasure;
- receipt + next cursor;
- continue até fixed point ou fronteira humana.

CLASS=DOCUMENTED_CONTRACT.

## Full trigger boot

scripts/trigger-fabric/centraldark_full_trigger_boot.py:
- executável;
- carrega owners canônicos;
- emite JSON/HUD;
- protege claims;
- não executa mutação de negócio, merge, deploy ou runtime.

CLASS=EXECUTABLE_ROUTER_BOOT.
NOT_FULL_OPERATIONAL_EXECUTOR=true.

## PDF Gate

Owner CURRENT documentado:
- scripts/lupa/pdf-conformance-cc2003.mjs
- scripts/lupa/pdf-conformance-cc2003.test.mjs
- scheduled runner PDF_GATE

Receipt canônico relata em 2026-09-18:
identity=PASS
policy=PASS
self-test=PASS
node:test=5/5 PASS
tamper counterproof=PASS
PDF_GATE_PROMOTED=true
exit_code=0

Esta prova é histórica para 2026-09-20 até reexecutar.

CLASS=EXECUTABLE_AND_PREVIOUSLY_PROVEN.
CURRENT_TODAY=UNKNOWN_UNTIL_REMEASURE.

## Council

AULA-001 documenta ArsenalProxy/ArsenalAdapter e modos parallel/debate/router/hermes.

CLASS=DOCUMENTED_RUNTIME_DESIGN.
CURRENT_VPS_STATUS=UNKNOWN_UNTIL_LIVE_PROBE.

## Telegram multi-IA

AULA-013 documenta Grupo Evolução multi-IA, porém chat_id está marcado AGUARDANDO ADMIN INFORMAR no documento.

CLASS=PARTIAL_DOCUMENTED_INTEGRATION.
FULL_INTEGRATION_PROVED=false.

## NEXT_CURSOR

Parallel live probe:
CASA: PDF_GATE + repo/bridge ownership.
VPS: Hermes/MCP/Arsenal/Telegram/runtime health.
Depois cristalizar e aplicar apenas deltas provados.
