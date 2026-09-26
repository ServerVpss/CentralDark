# CentralDark Omni Router — Startup and Lifecycle

## Overview

The Hermes CLI config (`config.yaml`) can point to `centraldark-router` as the provider,
with `base_url: http://127.0.0.1:8099/v1`. For this to work, the router process must be
running and listening on port 8099.

The router is a FastAPI/uvicorn application. It is NOT started automatically by Hermes.
It must be started separately before `hermes fallback list`, `hermes chat`, or any
`/hermes` invocation will work through the router.

## Router Script Location

The canonical router script is at:

```
E:\CentralDark\copilot-worktrees\CentralDark\feat-semantic-triggers-graphrag-fixedpoint-main90c4\apps\modulos\elite-gateway\scripts\centraldark_omni_router.py
```

This is a separate checkout from the `E:\CentralDark\Pivete` workspace. The script may
also exist in other locations; verify before relying on a specific path.

## Dependencies

The router requires these Python packages (available in Hermes venv):

- `fastapi`
- `uvicorn`
- `pydantic`
- `requests`

Use the Hermes venv Python to run the router:

```
C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe \
  E:\CentralDark\copilot-worktrees\...\centraldark_omni_router.py
```

**Important**: Do NOT use the system Python (`python` from PATH) even with `sys.path.insert`.
The C extension modules (`pydantic_core._pydantic_core`, etc.) will fail to load. Always
use `venv/Scripts/python.exe` directly.

## Startup

Run the router as a background process:

```bash
# From Git Bash / MSYS
"C:/Users/danda/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe" \
  "E:/CentralDark/copilot-worktrees/CentralDark/feat-semantic-triggers-graphrag-fixedpoint-main90c4/apps/modulos/elite-gateway/scripts/centraldark_omni_router.py" &
```

Or using PowerShell:

```powershell
Start-Process -FilePath "C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe" `
  -ArgumentList "E:\CentralDark\copilot-worktrees\...\centraldark_omni_router.py" `
  -WindowStyle Hidden
```

The router listens on `127.0.0.1:8099` by default. Verify with:

```bash
curl http://127.0.0.1:8099/health
```

Expected response: `{"ok":true,"service":"centraldark-omni-router",...}`

## Self-Test Before Startup

The router has a built-in self-test:

```bash
"C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe" \
  centraldark_omni_router.py --self-test
```

Expected: `{"ok": true, "checks": {...}, "failed": []}`

Run this before starting the server to catch import/dependency issues early.

## Verification After Config Edit

After editing `config.yaml` to use `centraldark-router` as provider:

1. Verify router is running: `curl http://127.0.0.1:8099/health`
2. Verify Hermes sees the config: `hermes config show`
3. Verify fallback chain: `hermes fallback list`

If step 1 fails, the router is not running — start it before proceeding.

## Common Failure Modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `hermes fallback list` shows "No fallback providers configured" | Router not running OR config.yaml has wrong provider | Start router, verify config.yaml has `provider: centraldark-router` |
| `curl: (7) Failed to connect` | Router not running on port 8099 | Start the router process |
| Import errors when starting router | Wrong Python interpreter used | Use `venv/Scripts/python.exe`, not system `python` |
| Router starts but immediately exits | Missing dependencies or syntax error | Run `--self-test` first to catch issues |
| Config shows correct provider but fallback list empty | Router is running but `fallback_providers` in config.yaml is malformed | Validate YAML with PyYAML from Hermes venv |

## Relationship to Config Edit Skill

The `centraldark-hermes-config-edit` skill covers how to edit `config.yaml` correctly
using PyYAML from the Hermes venv. This reference covers what to do AFTER editing:
ensure the router process is running so the config changes take effect.

The two are complementary: config edit without router running = config changes have no
effect. Router running without correct config = router available but Hermes won't use it.
