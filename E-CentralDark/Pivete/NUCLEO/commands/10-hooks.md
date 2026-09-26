# COMANDO - 10-hooks.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\docs\user-guide\10-hooks.md
**SHA:** 2317095679b51939
**Timestamp:** 2026-08-28T02:52:41.907422
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- If your host must never miss an idle transition, listen for the `idle_prompt` `Notification` as well. It covers every exception in which the session is still alive, with one gap: a session whose only 

### Ouro Bruto (primeiros 5000 chars)
```
# Hooks

Hooks let you run a script or send an HTTP request at key moments in a Grok session. Use them to automate tasks, enforce safety checks, log activity, send notifications, and integrate your own tools.

---

## What Are Hooks?

A hook is a shell command or HTTP endpoint that Grok calls when a specific lifecycle event occurs. Hooks can:

- **Block actions**: A `PreToolUse` hook can deny a dangerous command before it runs.
- **Keep the agent working**: A `Stop` hook can block the agent from finishing its turn until a condition holds (e.g. the test suite passes) and feed the reason back to the model.
- **React to events**: A `PostToolUse` hook can log every tool execution to a file.
- **Set up context**: A `SessionStart` hook can export environment variables or run setup scripts.

---

## Common Use Cases

- **Safety guards**: Block commands such as `rm -rf /` before they run.
- **Audit logging**: Record tool use and sessions to a file or external service.
- **Notifications**: Send a message when a task finishes.
- **Auto-formatting**: Run `cargo fmt` or `prettier` after edits.
- **Environment setup**: Export variables at session start.
- **Custom workflows**: Trigger builds, tests, or deployments on specific events.

---

## Quick Start

1. Create the hooks directory:

   ```sh
   mkdir -p ~/.grok/hooks
   ```

2. Create a hook file, e.g. `~/.grok/hooks/session-start.json`:

   ```json
   {
     "hooks": {
       "SessionStart": [
         {
           "hooks": [
             { "type": "command", "command": "echo 'Grok session started in '$(pwd)" }
           ]
         }
       ]
     }
   }
   ```

3. Start (or restart) a Grok session. The hook runs automatically on `SessionStart`.

4. Press `Ctrl+L` on non–VS Code family terminals (or run `/hooks` anywhere — preferred on VS Code family) and check the Hooks tab to confirm it loaded.

---

## Hook Locations

Hooks are discovered from several places (all are merged):

| Scope | Path | Trusted? | Notes |
|-------|------|----------|-------|
| Global | `~/.grok/hooks/*.json` | Always | Personal hooks |
| Global | `~/.claude/settings.json` (and `settings.local.json`) | Always | Claude Code compatibility (configurable) |
| Global | `~/.cursor/hooks.json` | Always | Cursor compatibility (configurable) |
| Project | `<project>/.grok/hooks/*.json` | Requires trust | Per-repo automation |
| Project | `<project>/.claude/settings.json` (and `settings.local.json`) | Requires trust | Claude compatibility (configurable) |
| Project | `<project>/.cursor/hooks.json` | Requires trust | Cursor compatibility (configurable) |
| Config | `~/.grok/config.toml` | Always | Your hooks alongside the rest of your config |
| Config | `managed_config.toml` (`$GROK_HOME` and `/etc/grok`) | Always | Organization-distributed hooks (server-synced and on-device) |
| Config | `requirements.toml` (user and system) | Always | Organization-distributed hooks in the requirements layer |
| Plugin | Bundled inside installed plugins | Per-plugin | Shared team hooks |

Config-file hooks live in the same TOML your organization already controls; see [Hooks in Config Files](#hooks-in-config-files) for the format. The compatible vendor hook sources are scanned by default. To disable scanning for a specific vendor, set `[compat.<vendor>] hooks = false` in `~/.grok/config.toml` or the corresponding environment variable. See [Configuration](05-configuration.md#harness-compatibility) for details.

**Trusting a project**: The first time you open a project with hooks, you must trust it before its project hooks will run; until then they are silently skipped. Grant trust by running `/hooks-trust` (or launching with `--trust`); the decision is recorded in the unified folder-trust store (`~/.grok/trusted_folders.toml`), the same gate that governs repo-local MCP/LSP servers. Global hooks in `~/.grok/hooks/` are always trusted and need no entry. This prevents untrusted repos from running arbitrary code.

Because hooks are unified under folder-trust, a `--trust` / `/hooks-trust` grant trusts the whole folder for **MCP, LSP, and hooks** together, and cascades to subdirectories. Conversely, disabling folder-trust (`GROK_FOLDER_TRUST=0` or `[folder_trust] enabled = false`) ungates project hooks along with MCP/LSP.

---

## Hook Events

Events fire at three cadences: once per session (`SessionStart`, `SessionEnd`), once per turn (`UserPromptSubmit`, `Stop`, `StopFailure`), and on every tool call inside the turn (`PreToolUse`, `PostToolUse`, `PostToolUseFailure`).

| Event | When it fires | Blocking? |
|-------|---------------|-----------|
| `SessionStart` | A session starts. Does not fire for a subagent's own session. | No |
| `UserPromptSubmit` | You submit a prompt. | No |
| `PreToolUse` | A tool is about to run. | Yes: can deny |
| `PostToolUse` | A tool completes successfully. | No |
| `PostToolUseFailure` | A tool fails. | No |
| `PermissionDenied` | The permission system denies a tool call. | No |
| `Stop` | A
```