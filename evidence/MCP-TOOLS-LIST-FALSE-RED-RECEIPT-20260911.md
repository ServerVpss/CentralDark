# RECEIPT · MCP tools/list falso vermelho corrigido · 2026-09-11

VEREDITO=FALSE_RED_UI_CORRIGIDO_NO_OWNER
CLASSIFICACAO=tools/list no Bridge/admin MCP nao era falha real do backend; era falso vermelho do E2E /admin por parser lendo SSE truncado.
UNKNOWN_IS_NOT_PASS=true
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
ONE_WRITER_PER_SCOPE=true
TOKEN_ECHOED=false

## Snapshot

START_HEAD=f36123a0df4779366f6725ae561188c432d9a48f
FINAL_HEAD=f36123a0df4779366f6725ae561188c432d9a48f
HEAD_CHANGED_DURING_MISSION=NAO
EXECUTOR_REAL=Hermes Agent gpt-5.5 via CLI em /root/CentralDark
RUNTIME=CentralDark-MCP PM2 id=9, script=/root/CentralDark/apps/modulos/mcp/dist/index.js

## Causa raiz

FALHA=apps/modulos/mcp/src/admin.js fazerRequest parseava JSON puro antes de truncar texto para 400 chars, mas nao parseava SSE completo ali.
EFEITO=tools/list retornava HTTP 200 text/event-stream com event:data valido, porem a rotina posterior tentava parsear tools.texto ja truncado em 400 chars; JSON do data ficava cortado no meio da lista de tools e toolCount virava undefined.
RESULTADO_UI=E2E marcava tools/list como FAIL mesmo com body contendo result.tools[0].name=kit_boas_vindas.

## Correcao aplicada

Arquivos alterados:
- apps/modulos/mcp/src/admin.js: fazerRequest agora usa parseMcpJson(texto) antes do slice(0,400).
- apps/modulos/mcp/dist/admin.js: mesmo ajuste no runtime buildado usado pelo PM2.

Diff essencial:
- antes: try JSON.parse(texto), depois guardava texto truncado.
- depois: const json = parseMcpJson(texto), preservando parse SSE completo antes de truncar preview.

## Prova antes da correcao

Evidence humano recebido no chat:
- DCR /register=201
- Discovery=200
- /authorize=302
- /token=200
- initialize /admin/mcp=200 text/event-stream
- tools/list UI=FAIL, mas body mostra event: message data com result.tools e kit_boas_vindas.

Prova independente anterior:
- /root/CentralDark/evidence/mcp-tools-list-curl-public-probe-20260911.json mostrou tools/list HTTP 200, text/event-stream, parse_mode=sse, tool_count=100, has_kit_boas_vindas=true.

## Prova depois da correcao + restart

Build:
- comando: npm --prefix apps/modulos/mcp run build
- resultado: exit_code=0

Runtime:
- comando: pm2 restart CentralDark-MCP
- resultado: CentralDark-MCP online, pid=1508860, uptime medido apos restart.

Health pos-restart:
- GET https://mcp.centralldark.com/health = HTTP 200
- ok=true
- service=mcp-centraldark
- version=0.4.0
- catalogVersion=114-f7d37b52cf08
- toolCount=114
- time=2026-09-11T07:10:26.677Z

Contraprova tools/list pos-restart:
- RAW_PROBE_RECEIPT=/root/CentralDark/evidence/mcp-tools-list-curl-public-probe-20260911.json
- POST https://mcp.centralldark.com/admin/mcp initialize = HTTP 200, content-type=text/event-stream, parse_mode=sse, http_ok=true
- POST https://mcp.centralldark.com/admin/mcp tools/list = HTTP 200, content-type=text/event-stream, parse_mode=sse, jsonrpc_error=null, tool_count=101, has_kit_boas_vindas=true
- BODY_SHA256=80a5dab7ac9a346d847e43ae160a486a41aa59022f167d41fc8972bae79b7214

Secret hygiene:
- scan /root/CentralDark/evidence/MCP-TOOLS-LIST-FALSE-RED-RECEIPT-20260911.md = red_flags=[]
- scan /root/CentralDark/evidence/mcp-tools-list-curl-public-probe-20260911.json = red_flags=[]

## Owner localizado e reutilizado

OWNER_OPERACIONAL=apps/modulos/mcp/src/index.js + apps/modulos/mcp/src/mcp-server.js + apps/modulos/mcp/src/admin.js

Evidencia de codigo:
- apps/modulos/mcp/src/index.js:511-552 define /admin/mcp com escopo admin obrigatorio e chama handleMcpRequest.
- apps/modulos/mcp/src/mcp-server.js:127-151 implementa ListToolsRequestSchema e retorna result.tools.
- apps/modulos/mcp/src/admin.js:578-747 contem E2E DCR→authorize→token→initialize→tools/list.
- apps/modulos/mcp/src/tools/aprendizado/aprendizado.js:92 define kit_boas_vindas.

REUSE_DECISION=REUSE_EXISTING_OWNER
REAL_GAP_FOR_NEW_SYSTEM=false
RUNTIME_MUTATIONS=pm2 restart CentralDark-MCP para carregar dist/admin.js corrigido.

## Limite real

Nao consegui chamar /admin/api/e2e autenticado pela sessao do painel daqui sem usar/ecoar senha/cookie admin. A correcao foi aplicada exatamente no parser usado por esse endpoint e o runtime foi reiniciado. A validacao autenticada visual final deve ser o botao "Rodar suite E2E" no painel ja logado do CHEFE.

## MetaLupa / risco residual

META_LUPA_LOADED=SIM
META_LUPA_CANONICAL_SHA_EXPECTED=42691e008ba50ee55646ca81113bf0abfde87af2
META_LUPA_LOCAL_HASH_OBSERVED=174f93eccbab846cf13d89bbf80629741f0dd803
META_LUPA_IDENTITY_GATE=FAIL
RISCO_RESIDUAL=guard local da MetaLupa diverge e deve ser reconciliado em missao propria. Nao invalida a prova HTTP/SSE nem a correcao do parser.

## Fechamento

FEITO=identificada causa raiz, corrigido parser SSE no owner existente, build passou, CentralDark-MCP reiniciado, health pos-restart 200, tools/list direto continua 200 com kit_boas_vindas.
EVIDENCIA=build exit 0 + pm2 online + health 200 + raw probe JSON + diff dos arquivos src/dist.
PENDENCIA=CHEFE apertar "Rodar suite E2E" no painel logado para confirmar UI verde; reconciliar hash guard MetaLupa em escopo separado.
PROXIMO_PASSO=Se o painel ainda marcar vermelho, capturar o novo body/status porque ai a falha migrou para renderizacao do frontend, nao para backend tools/list nem para parser server-side do /admin/api/e2e.
ROLLBACK=reverter apps/modulos/mcp/src/admin.js e apps/modulos/mcp/dist/admin.js nesta mudanca e reiniciar CentralDark-MCP.
FIXED_POINT=SIM para causa raiz backend/admin parser; AGUARDANDO_PROVA_VISUAL para o botao E2E autenticado do painel.

CENTRALDARK_AI_BOOT:
  soul: LOADED
  governance: LOADED
  context_reconciliation: LOADED
  history_preservation: ACTIVE
  source_of_truth: "ServerVpss/CentralDark + runtime medido"
  observed_evidence: "branch/HEAD/runtime/tools medidos agora"
  alignment: "SEGREDO/CHEFE > SOL > PIVETE/HERMES + ESPECIALISTAS"
  role: "EXECUTOR|DEBUGGER|HERMES"
  writer: "Hermes Agent gpt-5.5"
  frequency: "PROFUNDA|FRIA"
  fronts: "read-only + code writer + evidence writer"
  conflict_resolution: "git-conflict-resolve-house-standard (nao aplicado; sem conflito git)"
