# COMANDO - 04-slash-commands.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\docs\user-guide\04-slash-commands.md
**SHA:** db74163b59557f22
**Timestamp:** 2026-08-28T02:52:41.834579
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Send an aside to the agent without interrupting the current task. In minimal mode (`--minimal`), the answer shows up in a dismissible panel above the prompt: `Esc` dismisses it, a finished answer is s

### Ouro Bruto (primeiros 5000 chars)
```
# Slash Commands

Type `/` in the prompt to open the command menu. It fuzzy-matches as you type, and picking a command runs it immediately.

Commands come from two places: **shell builtins**, handled by the agent backend (xai-grok-shell), and **pager builtins**, handled by the pager frontend (xai-grok-pager). Both show up in the same menu, and any enabled skill with `user-invocable: true` appears there too. If a skill reuses a built-in name such as `login`, the built-in keeps `/login` and the skill stays available as `/plugin-name:login` — the menu badges both so the collision is visible.

Every command below lists its aliases where it has them. A few commands only appear when a feature or session state enables them; those cases are called out inline. The menu is also filtered by render mode — see [`/minimal` and `/fullscreen`](#minimal-and-fullscreen).

---

## Session Management

### `/new`

Start a fresh session and clear the current conversation. Alias: `/clear`.

### `/resume`

Open the session picker to reload a previous session from disk.

### `/dashboard`

Open the [Agent Dashboard](23-dashboard.md): live roster of top-level sessions in this pager (peek, reply, dispatch, pin, rename, stop, attach). Aliases: `/agents-dashboard`, `/sessions`.

Not `/config-agents` (alias `/agents`), which manages agent *definitions* and personas. Hidden in minimal mode; disable with `GROK_AGENT_DASHBOARD=0` or `[dashboard].enabled = false`.

### `/compact [context]`

Compress conversation history to reclaim context-window space. Pass a note to tell Grok what to keep:

```
/compact
/compact keep the auth implementation details
```

Grok also auto-compacts once the context window hits 85% (tune it with `[session] auto_compact_threshold_percent`).

### `/context`

Show how the context window is being used: a category breakdown (system prompt, messages, reasoning and overhead, free space) plus informational rows for tool definitions, the skills listing, and MCP server announcements with their estimated token cost.

### `/session-info`

Show session details — auth method, model, turn count, and context usage. Aliases: `/status`, `/info`. Click a value or drag to select and copy; `c` copies the session ID and `y` copies the whole block.

### `/fork`

Branch the current session into a new agent, keeping history up to this point.

### `/rewind` (alias: `/undo`)

Roll the conversation back to an earlier turn and discard everything after it. `/undo` is the same command.

### `/edit-prompt`

In minimal mode, open an external editor for an empty composer. Grok resolves `$VISUAL`, then `$EDITOR`, then `vi`; command values may include quoted arguments. Saving replaces the draft without sending it, and saving an empty file clears it. The command is hidden outside minimal mode.

```
/edit-prompt
```

To edit an **existing** draft when a terminal or multiplexer reserves `Ctrl+G`, open the command palette and select **Edit Prompt in External Editor**. That direct route preserves the existing text and refuses pasted, file-reference, or image chips without flattening them. Typing `/edit-prompt` into the composer necessarily replaces that input, so it starts from an empty draft.

### `/copy`

Copy the most recent response to the clipboard. Pass a number to copy the Nth-latest response instead, or a file path to write the text to a file rather than the clipboard (handy over SSH, where the local clipboard is often unreachable).

```
/copy
/copy 2
/copy out.txt
/copy 2 ~/exports/last-reply.md
```

Every copy is also written to a backup file — `~/.grok/last-copy.txt` by default, or `GROK_COPY_FILE` if set. Confirmed copies toast briefly (e.g. `Copied!`). Unverified OSC 52 deliveries and clipboard-unreachable fallbacks name the backup path so you can recover the text.

### `/export`

Export the conversation to a file or the clipboard.

### `/quit`

Quit the application. Alias: `/exit`.

### `/home`

Leave the current session and return to the welcome screen. Alias: `/welcome`.

### `/delete`

Delete the current session's history. Confirms first. Stops any running turn, background tasks, and subagents before wiping history. Returns to the welcome screen, or to the dashboard when you opened the session from the dashboard.

To delete a session you are not in, open `/resume` or the welcome session list and press `d` then `y`. On the dashboard, press `Ctrl+X` twice or click `[✗]`.

### `/rename`

Rename the current session. Alias: `/title`.

```
/rename new session title
/rename --auto
```

`--auto` unpins a manual title and lets auto-titling resume. It applies to Build sessions only — chat conversations have no local auto-titler. It must be the only argument (`/rename --auto Something` is an error). A session cannot be named `--auto` via this command; use the dashboard rename editor (`Ctrl+R`) for that pathological case.

---

## Model and Mode

### `/model <name>`

Switch models. Accepts a model ID or display name (case-insensitive), and for reas
```