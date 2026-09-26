# Screenpipe ↔ Hermes Integration via Omni Router (Session Notes)

**Date:** 2026-08-28  
**Session ID:** proc_... (latest background telemetry)  
**Key Points:**

- Screenpipe Browser Bridge already connected/authenticated to local Screenpipe on port 3030.
- Omni Router listening on 127.0.0.1:8099, with hermes engine initially disabled.
- Enabled hermes engine in config.yaml (set `configured: true`), restarted router.
- Verified `/health` shows hermes configured, `/v1/models` lists hermes/hermes.
- Tested direct POST to `/v1/chat/completions` with model hermes/hermes – successful.
- Configured Screenpipe custom provider:
  - Base URL: http://127.0.0.1:8099/v1
  - Model Source URL: http://127.0.0.1:8099/v1/models
  - Model: auto (or hermes/hermes)
  - API Key: left blank
- Test connection succeeded; Screenpipe can now route requests via Omni Router to Hermes Agent.

**Commands used:**
```powershell
# Check router PID
netstat -ano | findstr :8099
# Stop router (replace PID)
Stop-Process -Id 1768 -Force
# Start router
cd E:\CentralDark\apps\omni-router
python .\run.py
# Verify
curl -s http://127.0.0.1:8099/health | ConvertFrom-Json
curl -s http://127.0.0.1:8099/v1/models | ConvertFrom-Json
# Test call
$body = @{model="hermes/hermes";messages=@{@{role="user";content="Olá, teste"}};max_tokens=8} | ConvertTo-Json -Depth 4
curl -s -X POST http://127.0.0.1:8099/v1/chat/completions -H "Content-Type: application/json" -d $body
```

**Outcome:** Integration successful; Screenpipe can now leverage Hermes reasoning while keeping the agent behind the Omni Router for routing, fallbacks, and audit.