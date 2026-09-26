# Dual Chrome Profiles for Zendrive / Elite-Gateway Browser Automation (CentralDark)

## Profiles Identified (2026-09-05)
- **Segredo** (Cobra Conta): `Profile 15`, email `contacobra3467@gmail.com`
  - Used for ChatGPT "Cobra Conta" login.
  - MFA challenge observed in OpenAI auth tab.
- **Fulano**: `Profile 14`, email `sonasmarcas@gmail.com` (and related accounts).
  - Display name "Fulano" in avatar menu.

**Discovery method**:
- Parse `Local State` for `profile.info_cache` (display names).
- Grep `Preferences` for `name` and `account_info[].email`.
- Paths: `C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile XX`

## Integration with Zendrive
Update scripts (e.g. `local_send_dump.py`, extend to `send_and_dump*.py`):
```python
PROFILE_MAP = {
    "segredo": r"C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 15",
    "fulano":  r"C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 14",
}
PROFILE = PROFILE_MAP.get(os.getenv("ZENDRIVER_PROFILE", "segredo"))
```
Launch: `ZENDRIVER_PROFILE=segredo python local_send_dump.py`

For agent: support profile param in elite_http_gateway / WS. Reuse existing capture (contenteditable, data-message-author-role, dump JSON).

## Linking Two Profiles (Flow + Reconciliation)
- **Separate sessions**: Each profile = independent user_data_dir + login state. Do NOT mix.
- **Orchestration**: Agent launches/controls two Zendrive instances.
  - Send to Profile A (e.g. Segredo "minha contra GPT").
  - Capture response.
  - Feed to Profile B (Fulano) for counter-analysis, continuation, or judgment.
  - Reconcile outputs (diff, consensus, one as verifier).
- Maintain flow between them for "ligadas juntas".
- **Incognito option**: For one temporary login (`--incognito` flag in uc.start).
- **Cookie sync**: Avoid. Risk of session poisoning, credential leak, identity confusion. Use separate authenticated profiles instead.

## Extensions Sharing (Export or Same Local)
User requirement: export existing extensions from one profile to the other **or** use the same local for both accounts.

**Close Chrome first** (profile lock).

### Option 1: Export / Copy (one direction or merge)
```cmd
robocopy "C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 14\Extensions" "C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 15\Extensions" /E /COPY:DAT /R:2 /W:2
```
(Reverse or run both ways for full merge. IDs are stable.)

### Option 2: Same Local (symlink for shared extensions dir)
```cmd
:: Run as Administrator, Chrome closed
mkdir "C:\Users\danda\AppData\Local\Google\Chrome\SharedExtensions" 2>nul
robocopy "C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 14\Extensions" "C:\Users\danda\AppData\Local\Google\Chrome\SharedExtensions" /E /COPY:DAT

mklink /J "C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 15\Extensions" "C:\Users\danda\AppData\Local\Google\Chrome\SharedExtensions"
mklink /J "C:\Users\danda\AppData\Local\Google\Chrome\User Data\Profile 14\Extensions" "C:\Users\danda\AppData\Local\Google\Chrome\SharedExtensions"
```
- Extensions code shared.
- Per-profile data (Local Extension Settings, etc.) remains isolated.
- After: reopen profiles in normal Chrome to enable.

## Pitfalls & Travas
- **Profile in use**: Always close normal Chrome (or specific profile) before automation or symlink. "Profile locked" errors common.
- **Headless + extensions**: Some extensions (UI, notifications) degrade in headless; test.
- **MFA/Login**: User may be mid-auth (as in images). Complete login manually in target profile first; automation assumes session present.
- **Security**: No cookie export/sync. No exposing tokens from profiles. Quarantine any detected secrets.
- **No new system**: Extend `elite-gateway` (send_and_dump, gateways) with profile selection. Add to browser session pool under existing router/MCP. ONE_SYSTEM_ONLY.
- **Windows paths**: Use raw strings or forward slashes in Python. git-bash /c/ vs native.
- **Verification**: After changes, test capture (last_messages.json), check extensions load in launched browser.
- **Reconciliation**: Agent must handle async captures from multiple profiles; dedupe, timestamp, attribute to source profile.

## Workflow for Agent Creation
1. Map real profiles (Local State / Preferences).
2. Update test script with PROFILE_MAP + env selector.
3. Handle extensions (copy or symlink as above).
4. Test capture on logged profile (close Chrome).
5. Extend canonical send_and_dump / elite_*_gateway.py with profile param.
6. In CentralDark: treat as browser session pool capability. Router selects healthy profile per task / "contra" needs.
7. Reconcile: cross-profile calls for verification/flow.
8. HUD: include profile selector in router UI (as in images: sidebar with Fulano/Segredo).

## Proven Pattern
- Reuse: elite-gateway owner, send_and_dump core, omni-router integration.
- Dual profile = two sessions in pool, not two systems.
- Extensions = shared catalog (code), not full profile state.
- Agent "minha contra GPT": run custom prompt in chosen profile(s), capture full convo, proxy to CD API behind scenes.

Update this reference for future dual-profile browser tool work in CentralDark. Always reconcile with SOUL (REUSE, LOCAL_REALITY=JUDGE, no cookie mixing).

## Related
- references/2026-09-05-zendriver-elite-gateway-mapping.md
- references/zendrive-agent-integration.md
- Profile paths and extension sharing commands as above.