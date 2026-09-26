---
name: centraldark-screenpipe-e2e-forensics
description: Read-only proof Hermes consumes Screenpipe via causal chain.
version: 1.0.0
author: HERMES-CASA
---

# Screenpipe ↔ Hermes E2E Forensics (CentralDark)

## When to use
User demands proof (not config) that Hermes consumes Screenpipe, or wants the causal
chain `Browser → Screenpipe → Omni Router → Hermes Engine → Response` verified.
Central command seen in session: `#ACORDAR !CALIBRAR !CENTRALDARK` + forensic READ_ONLY brief.

## Golden laws (from the Casa)
```
CONFIGURED != ACTIVE
ACTIVE != INVOCATION_PROVEN
HEALTH != PROVIDER_INVOCATION_PROOF
CORRELATION != CAUSE
UNKNOWN != PASS
ACTION != PROOF
```

## Hard prohibitions (the brief is FORENSE / ZERO_MUTATION)
- Do NOT kill processes, restart, alter env, edit config, install, reveal token/API key/cookie.
- Do NOT treat conversation history as current proof.

## Measurement sequence (deterministic, low-blast)
1. **Ports alive** — write a `.ps1` file and call `powershell -NoProfile -ExecutionPolicy Bypass -File`, do NOT inline `$vars` in bash (bash eats `$`). Proven pattern:
   ```powershell
   $ports=@(3030,8099,8645,3100,8787)
   foreach($p in $ports){
     $c=Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue
     if($c){$pr=Get-CimInstance Win32_Process -Filter "ProcessId=$($c[0].OwningProcess)"; "$p -> $($pr.Name) PID=$($c[0].OwningProcess)"}
     else {"$p -> fechada"}
   }
   ```
2. **Screenpipe API** — `curl -m5 -o /dev/null -w "%{http_code}" http://127.0.0.1:3030/health` (200=ok, 403 root=auth ok, NOT a failure).
3. **Omni Router** — `GET /health` and `/v1/models` (200 = runtime alive). Then POST `/v1/chat/completions` with a `request_id` like `CD_E2E_<ts>`; if response is `{"detail":"Error: hermes_stdio_turn_failed"}`, Omni→Hermes INVOCATION = FAIL (engine not reachable), not UNKNOWN.
4. **Hermes session tool check** — list THIS session's loaded tools from system prompt. If `screenpipe`/MCP not present, `HERMES_SCREENPIPE_TOOL_LOADED = UNKNOWN` and `INVOCATION = UNKNOWN` — you CANNOT prove consumption because the tool isn't registered in-session. State that honestly; do not claim pass.
5. **Causal test (step 6 of the brief)** — query Screenpipe directly (fingerprint A), then via Hermes tool (fingerprint B), compare. Only PASS if Hermes called Screenpipe AND result matches. If the tool isn't loaded, mark UNKNOWN and hand the `next_test` to the user (load the MCP/tool first).

## Output contract
Write `MAPA-E2E.md` + `receipt.json` to `E:/CentralDark/Pivete/logs/e2e-screenpipe-hermes/`.
Status vocabulary ONLY: `PASS | FAIL | UNKNOWN | CONFIGURED_NOT_PROVEN`.
End with: `PROVADO=` `NÃO_PROVADO=` `UNKNOWN=` `FIO_CAUSAL=` `PRÓXIMO_TESTE_DISCRIMINANTE=`.
Never correct anything. Never restart. First deliver only REALITY.

## Known Casa facts (measured 2026-08-30)
- Ports: 3030=screenpipe-app.exe, 8099=node (Omni Router), 8787=node sol-gateway-local.mjs (PID 9712). 8645/3100 were CLOSED that session.
- `SCREENPIPE-BINDING.yml` (docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/) is CANONICAL_CANDIDATE: any authorized actor MAY consume; requires tool registered in session + RECENT_DATA_PRESENT + target query returns usable evidence. MCP default `http://localhost:3031/mcp`.
- Skill `screenpipe-hermes-integration` lives at `E:/CentralDark/Pivete/skills/` (NOT `.agents/skills/` of the repo). `screenpipe-live-observer` was NOT loaded in that session (use the integration one).

## Pitfalls
- **Bash-inlined PowerShell with `$` breaks** — always use a `.ps1` file. (Cost: 3 terminal timeouts in one session.)
- **Wide grep over E:/CentralDark/Pivete times out / dumps 260k chars** — use `search_files` with tight `file_glob` + `pattern`, or `git ls-tree`/`git grep` for repo content. Never `grep -r` the whole tree in bash.
- **web_extract on GitHub may fail** ("Web tools are not configured / no credits") — fall back to `curl -sL https://raw.githubusercontent.com/...` or say so; do not invent repo content.
- **Omni 200/health does NOT prove Hermes engine works** — only a successful chat completion with `request_id` echoed proves it.
