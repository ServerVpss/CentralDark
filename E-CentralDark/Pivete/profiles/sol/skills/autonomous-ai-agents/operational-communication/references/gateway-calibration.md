# Gateway Calibration and Wake Procedure

## Purpose
Calibrate and awaken the Omni Router gateway to ensure the Hermes engine is active and ready for use via Screenpipe or direct API calls.

## Prerequisites
- Omni Router is running and listening on port 8099 (default).
- Hermes Agent is installed and available locally (`hermes` CLI).
- You have edit access to the Omni Router configuration file (`config.yaml` or similar).

## Steps

1. **Ensure Hermes engine is enabled**
   - Open the Omni Router config file (e.g., `E:\CentralDark\apps\omni-router\config.yaml`).
   - Locate the `engines:` section and set `hermes.configured: true`.
   - Ensure `hermes.transport: openai_compatible_http` and leave `base_url` and `api_key` empty (uses local CLI).
   - Save the file.

2. **Calibrate the gateway**
   ```powershell
   !calibrar
   ```
   This command checks engine configuration, adjusts timeouts, and writes a state file (`gateway.state.json`).

3. **Awaken (start) the gateway listener**
   ```powershell
   #acodar
   ```
   This starts the listeners on the configured ports (default 8099 for Omni Router, 8787 for Hermes Dashboard) and confirms readiness.

4. **Verify the gateway is ready**
   ```powershell
   # Health check
   curl -s http://127.0.0.1:8099/health | ConvertFrom-Json
   # Should show hermes.configured: true

   # List available models
   curl -s http://127.0.0.1:8099/v1/models | ConvertFrom-Json
   # Look for an entry like {"id":"hermes/hermes", ...}

   # Test a simple chat completion
   $body = @{
       model    = "hermes/hermes"
       messages = @(@{role="user";content="Olá, teste"})
       max_tokens = 8
   } | ConvertTo-Json -Depth 4
   curl -s -X POST http://127.0.0.1:8099/v1/chat/completions `
        -H "Content-Type: application/json" `
        -d $body
   # Expect a JSON response with a message from the assistant.
   ```

5. **Configure Screenpipe to use the gateway (optional)**
   - Open Screenpipe → Settings → Providers → Add Provider.
   - Fill:
     - Provider ID: `centraldark-hermes`
     - Provider Name: `CentralDark Hermes`
     - Base URL: `http://127.0.0.1:8099/v1`
     - Model Source URL: `http://127.0.0.1:8099/v1/models`
     - Model: `auto` (or `hermes/hermes` to force)
     - API Key: *leave blank* (unless you added auth to the router).
   - Save and test connection; should report *success*.

## Troubleshooting
- If `/health` returns `hermes.configured: false`, double-check the config file and restart the Omni Router.
- If the `/v1/models` call returns `Unauthorized`, verify that no accidental auth token is being sent; the local Hermes engine does not require a token.
- If Screenpipe provider test fails, ensure the router is reachable (`ping 127.0.0.1:8099`) and that the provider URL matches exactly.

## Notes
- This procedure is read‑only with respect to the CentralDark repository; it only touches local configuration and services.
- After calibration and awakening, you can use the Hermes Agent via Screenpipe, the ChatGPT sidebar, or direct API calls without further changes.