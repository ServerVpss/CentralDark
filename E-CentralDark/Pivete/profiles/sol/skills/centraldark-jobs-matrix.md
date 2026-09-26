# 📦 CENTRALDARK JOBS MATRIX — CRISTALIZAÇÃO COMPLETA R1-R6

## 🟢 R1: CADEIA_CASA_HEALTH
[SKILL]: CADEIA_CASA_HEALTH
[TRIG]: #ACORDAR | boot | manual
[IN]: ports 8788, 8099, 9119, 3030 + Tailscale segredo.tail6d7aa4.ts.net
[EXEC]: curl -s -o /dev/null -w "HTTP=%{http_code} time=%{time_total}s" --max-time 5 http://127.0.0.1:<port>/health
[OUT]: 5/5 endpoints HTTP 200 com latência real

## 🟢 R2: GATEWAY_OMNI_ROUTER
[SKILL]: GATEWAY_OMNI_ROUTER
[TRIG]: boot | #ACORDAR
[IN]: omni router 8099 (free tier), SOL gateway 8787
[EXEC]: verify omni 8099 /v1/models + /v1/chat/completions; SOL 8787 health
[OUT]: Omni Router OpenAI compatível ativo + SOL 8787 health 200

## 🟢 R3: SCREENPIPE_MCP_FIX
[SKILL]: SCREENPIPE_MCP_FIX
[TRIG]: boot | screenpipe fail
[IN]: bunx cache corrupt, screenpipe-app.exe 3030
[EXEC]: taskkill /F /IM bun*.exe; verify screenpipe-app.exe health 3030
[OUT]: 3030 healthy + conexões ESTABLISHED

## 🟢 R4: KANBAN_STATUS_BOLINHAS
[SKILL]: KANBAN_STATUS_BOLINHAS
[TRIG]: redesign | #CRISTALIZAR
[IN]: types.ts:195-205 COLUMN_META (tone + codicon)
[EXEC]: edit COLUMN_META tones/codicons; rebuild kanban dashboard
[OUT]: Bolinhas de status por coluna (triage/todo/scheduled/ready/running/blocked/review/done/archived)

## 🟢 R5: FIXED_POINT_CHECKPOINT
[SKILL]: FIXED_POINT_CHECKPOINT
[TRIG]: cada rodada Fable Loop
[IN]: git diff --stat + acertos da sessão
[EXEC]: append CENTRALDARK.md; tag FIXED_POINT_<timestamp>
[OUT]: Checkpoint salvo + fio da missão atualizado

## 🟢 R6: WATCHDOG_CADEIA_FREE
[SKILL]: WATCHDOG_CADEIA_FREE
[TRIG]: every 10m (cron) + */5 * * * * (webui)
[IN]: python scripts/cadeia-free-watchdog.py + webui-watchdog.py
[EXEC]: health 8099/8788/3030; auto-recover omni/webui; log E:\CentralDark\_MAPA_CASA\C_HERMES_LOCAL\*.log
[OUT]: FIXED_POINT_OK | FIXED_POINT_PENDENTE

---

RESUMO: 6 🟢 | 0 🟡 | 0 🔴
TUDO VERDE 🚀🫁⚔️
