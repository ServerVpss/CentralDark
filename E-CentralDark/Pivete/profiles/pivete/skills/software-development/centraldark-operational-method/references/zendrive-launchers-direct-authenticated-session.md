# Zendrive Launchers for Direct Authenticated Browser Sessions (Windows + PS1 + .BAT + PowerShell 7)

## Trigger
User needs one-click execution of Zendrive capture scripts against already-logged Chrome profiles (e.g. Profile 15 Segredo, Profile 14 Fulano) without re-typing long cd + env + python commands every time. Prioritizes "sessão já aberta" (authenticated session) and ultra-concise execution.

## Pattern
- Use `.ps1` for core logic (env vars, cd, python invocation, prompt handling).
- Use `.bat` as thin wrapper: detect `pwsh.exe` (PowerShell 7, preferred) or fallback to `powershell.exe`, call the .ps1 with args.
- Place in `apps/modulos/elite-gateway/test-local/` alongside `local_send_dump.py`, `zendrive_gateway_bridge.py`.
- Env: `ZENDRIVER_PROFILE=segredo|fulano`, `HEADLESS=false` for visible E2E/debug.
- Profile paths hard-coded from measurement: `C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 15` etc.
- Default prompt for test: "Diga APENAS 'ZENDRIVE_LOCAL_OK'. Depois diga a capital do Brasil em uma frase curta."
- Support both-mode via arg or separate launcher.

## Implementation Notes (from 2026-09-05 session)
- .ps1 sets `$env:ZENDRIVER_PROFILE`, `$env:HEADLESS`, cds to test-local, calls `.venv\Scripts\python.exe local_send_dump.py $prompt`.
- .bat: `@echo off`, `where %PS7%`, `%PS7% -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_zendrive_segredo.ps1" %*`, `pause`.
- For "já aberta": Script uses `--user-data-dir` of the logged profile. Close all Chrome instances first to avoid lock (user-data-dir conflict). If user wants to keep open, use `--remote-debugging-port` + connect mode (future extension).
- After run: `cat logs/last_messages.json`, then `python zendrive_gateway_bridge.py` for gateway-ready output.
- Absorb into existing: elite-gateway owner, no V2 script.
- Verification: Run .bat → visible Chrome on correct profile → input found after "Novo chat" clicks + modal dismiss → real assistant text in dump.

## Usage
1. Ensure Chrome fully closed (or use clean profile).
2. Double-click `run_zendrive_segredo.bat` (or pass custom prompt as arg).
3. For both/contra: Extend .ps1 or create `run_zendrive_both.bat` calling with "both" arg.
4. Check `logs/last_messages.json` and `reconciled_both.json`.
5. Wire to gateway: `zendrive_gateway_bridge.py` produces OpenAI-compatible snippet.

## Pitfalls
- Chrome lock on user-data-dir if session open → always close GUI first for launchers.
- Restore/images page landing: Script must aggressively click "Novo chat", dismiss modals ("Conclua a criação"), force `https://chatgpt.com/`.
- PowerShell version: Prefer pwsh (PS7) for better env/encoding; .bat auto-detects.
- Paths: Use absolute Windows paths in .ps1; test with `ZENDRIVER_PROFILE=segredo`.
- No re-ask: Once launcher exists, user double-clicks — no verbose instructions unless error.

## References in SKILL.md
See ZENDRIVE DUAL PROFILE section. Add launcher pattern here for future one-click authenticated captures.

## Related
- `local_send_dump.py` (core script with REAL_PROFILES, ensure_chat_input, both mode).
- `zendrive_gateway_bridge.py` (dump → gateway).
- CentralDark SOUL: REUSE_BEFORE_CREATE, execute-first, ultra-conciso PT-BR, REALITY=JUDGE.