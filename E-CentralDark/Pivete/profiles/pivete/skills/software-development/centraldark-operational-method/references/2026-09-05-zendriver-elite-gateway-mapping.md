# Zendriver / Elite-Gateway Tool Discovery & Status Mapping (2026-09-05 session)

## Trigger
User asks to "procure pela ferramenta X", "verifica se esta no ar ou na VPS", "o que falta para botar no ar", "crie agente especializado", "mapeamento e leitura", "traga o HUD atualizado". Class: hybrid local (Windows) + VPS (Linux /root) tool/integration reconnaissance in CentralDark.

## Core Pattern (REUSE_BEFORE_CREATE + LOCAL_REALITY=JUDGE)
1. **Code search first (parallel)**: `search_files` for exact name variants (zendriver|ZenDrive|elite-gateway|zendriver_chatgpt). Then targeted `terminal` finds on /c/Users and repo.
2. **Filesystem + install check**: `find`, `ls`, `python -c "import X; print(__version__)"`, `pip list | grep`, `tasklist | findstr`.
3. **Historical runtime snapshot**: Read `RELATORIO-ECOSSISTEMA.txt` (VPS paths, PM2 names like CentralDark-EliteHTTP/EliteWS/Zentinel, version 2.7) and `painel-data.json` (gateways.eliteHttpGateway.status="online", url, mcpTools).
4. **Live runtime probes (local first)**: `netstat -ano`, `tasklist`, `curl -I --max-time 5 http://127.0.0.1:PORT/`, `curl /health /v1/models`. Note server (uvicorn) and errors (404/Internal).
5. **Safe remote (VPS)**: `timeout N ssh -o BatchMode=yes -o ConnectTimeout=5 ... "echo OK; hostname; pm2 list | grep ...; curl local health"`. Expect permission denied without key; never expose creds.
6. **Visual HUD cross-check**: Parse provided image/sidebar text + runtime (e.g. 8099 python PID). Combine with code (frozen legacy in omni-router.md).
7. **Gaps & reuse**: Identify Linux-hardcoded paths (/root/.config/zendriver_..., /usr/bin/google-chrome), frozen components, missing deps locally. For agent: reuse existing `send_and_dump*.py` (capture to JSON), `elite_*_gateway.py` (FastAPI/WS proxy), integrate to omni/centraldark-gateway without new system.
8. **Synthesize & report**: Status (Local: OFF / not installed; VPS: historical online, live unverified). What missing (SSH, PM2 start, valid profile, deps, health test). HUD description. Execute probes first, concise PT-BR report.

## Reproduction Recipe (Zendriver example)
- Search: `search_files pattern="zendriver|elite-gateway" target=content`
- Local status: `python -c "import zendriver..."` → ModuleNotFound; `tasklist | findstr zen`
- Ports: 8099 uvicorn/python (PID 29272) but 404/Internal on /health /v1/models; 3030 partial.
- Historical: elite "online" in painel, PM2 names, /root/CentralDark/apps/modulos/elite-gateway/scripts/
- Script inspection: head/grep elite_http_gateway.py (FastAPI + import zendriver as uc, accounts.json, ephemeral profiles, health).
- Agent reuse: send_and_dump for "minha contra GPT" capture → transform to proxy format → feed omni-router / MCP / CentralDark behind scenes.
- HUD: sidebar (CENTRAL DARK GATEWAY, Arsenal Router Med, CENTRAL DARK-ROUTER, GOOGLE AI STUDIO) + measured state.

## Pitfalls
- Terminal timeouts: use `head -N`, `grep`, `| cat`, short commands, `timeout N`.
- Paths: always Linux in scripts (/root/...); adapt only for local dev.
- Legacy: "FROZEN_NOT_DELETED" in omni-router — do not route through without explicit.
- Computer_use: may require elevation (`hermes computer-use install`); fallback to image text + queries.
- SSH: safe wrapper only; no secrets; report "unverifiable live" if blocked.
- UNKNOWN != PASS: no process/deps = OFF, even if code present. Historical "online" != current.
- No V2: extend elite-gateway or omni for agent; ONE_SYSTEM_ONLY.
- Concise: execute all probes in parallel batches; report structured (Status / Missing / Plan / HUD) without preamble.

## Proven Delta for Agent Creation
- Existing owner: elite-gateway (scripts + zendriver lib).
- Capture: send_and_dump.py → last_messages.json.
- Proxy: elite_http_gateway.py (FastAPI uvicorn) or WS.
- Integration: add "zendrive" / "gpt-web" via in cadeia/decisor or new skill under centraldark-gateway.
- "Minha contra GPT": run custom prompt/setup inside driver, full convo capture, proxy to existing API.
- Behind scenes: trigger on authorized query → web motor converses → capture → inject to CD (knowledge, responses).

## References in Session
- apps/modulos/elite-gateway/{scripts/elite_http_gateway.py, requirements.txt, RELATORIO-ECOSSISTEMA.txt}
- apps/modulos/status/painel-data.json (gateways section)
- docs/ARQUITETURA/CENTRALDARK-OMNI-ROUTER.md (frozen)
- Local runtime: 8099 (uvicorn), no zendriver import/process.
- Image: sidebar router selection.

Update this reference on future similar discoveries (any "Zen Drive" style tool). Always start with search + historical report + live probes.