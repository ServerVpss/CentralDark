# Omni Router — Environment Startup Pattern (Session 2026-09-06)

## Problem
The `centraldark_omni_router.py` script does **not auto-load `.env`** (no `python-dotenv` import). Creating `.env` file alone does not configure the router.

## Working Pattern (verified 2026-09-06)

```bash
# Kill existing process on port 8099
netstat -ano | findstr :8099
taskkill /F /PID <pid>

# Start with env vars EXPORTED INLINE
cd "E:/CentralDark/workspace/apps/modulos/elite-gateway/scripts"
ABACUS_API_KEY="[REDIGIDO-PRESERVACAO]" \
ABACUS_BASE_URL="https://routellm.abacus.ai/v1" \
ABACUS_WIRE_API="responses" \
python centraldark_omni_router.py --host 127.0.0.1 --port 8099
```

## Engines Configured After This Start
- `nous` ✅ (via default `NOUS_AUTH_JSON` path)
- `abacus` ✅ (inline env vars)
- `claude-code` ✅ (binary in PATH)

## Persistent Config
`.env` file created at `apps/modulos/elite-gateway/scripts/.env` for documentation, but **not loaded by script**. For persistence across restarts, either:
1. Add `python-dotenv` import to router, or
2. Use PM2/ecosystem with `env` block, or
3. Wrap in startup script that exports vars

## Verification
```bash
curl -s http://127.0.0.1:8099/health | jq .engines
# Must show: "nous": {"configured":true}, "abacus": {"configured":true}, "claude-code": {"configured":true}
```

## Test Chat
```bash
curl -s -X POST http://127.0.0.1:8099/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"test"}]}'
```