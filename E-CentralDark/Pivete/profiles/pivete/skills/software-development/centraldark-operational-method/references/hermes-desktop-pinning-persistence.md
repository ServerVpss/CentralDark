# Hermes Desktop Session Pinning Persistence

## Trigger
User pins critical session in desktop sidebar (Shift-click) and tests if it "fica fixa" after interaction/response. Common for SOL Orquestradora / main interface sessions.

## Known Behavior (from live tests + GitHub issues)
- Desktop sidebar pin (Shift-click) is primarily **visual/UI state**.
- Frequently does **not survive app restart** or certain state changes (multiple bugs: localStorage wipe, sync failures with backend, sidebar-only).
- Session itself remains alive (message_count increases, searchable via session_search).
- CLI `hermes sessions pin <id>` sets the **durable "keep" flag** in state.db (exempt from auto_archive, survives better, visible via `hermes sessions pinned`).
- Desktop pin and CLI pin are related but desktop implementation has persistence gaps.

## Recommended Workflow for Critical Sessions
1. Identify session ID (from sidebar or previous `hermes sessions list` / session_search).
2. Pin via CLI for durability: `hermes sessions pin <full-or-prefix-id>`
3. Verify: `hermes sessions pinned`
4. In conversation: respond normally (execute first).
5. After response: 
   - Use tools (session_search <id>) to confirm session still active (message_count up, not deleted).
   - Report liveness + "check your sidebar visually for PINNED section".
   - User confirms if UI pin held.
6. If UI pin drops but session alive: re-pin via CLI or advise user Shift-click again. Do not assume desktop pin is authoritative.

## Verification Pattern (this session example)
- User: "PINADO !" on 20260905_031340_68bd10
- Test: respond → tools confirm session active (41+ messages)
- CLI pinned: often empty or not reflecting desktop (env-specific)
- Report: "Sessão ainda viva. Olha o sidebar."
- User checks UI.

## Pitfalls
- Assuming desktop sidebar pin = durable (it isn't reliably).
- Relying only on visual "PINNED" section without backend/CLI verification.
- Not re-pin after restarts when using desktop only.
- For SOL Orquestradora / main CHEFE interface: treat as critical; use CLI pin + tool verification + user visual double-check.
- Error "claude_cli_start" unrelated (see separate ref if WinError 206).

## Commands
- Pin: `hermes sessions pin 20260905_031340_68bd10`
- List pinned: `hermes sessions pinned`
- Search session: use internal session_search tool with ID.

## Related
- centraldark-operational-method SKILL.md (this file)
- Known issues: desktop pinned sessions unpinned after restart (GitHub #38858, #52953, etc.)
- Use for any user testing "fica fixa" on Hermes sessions.