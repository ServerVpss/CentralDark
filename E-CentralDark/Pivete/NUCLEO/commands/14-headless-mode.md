# COMANDO - 14-headless-mode.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\docs\user-guide\14-headless-mode.md
**SHA:** 10912fab1fe5ea84
**Timestamp:** 2026-08-28T02:52:42.572079
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt = messages[-1]["content"] if len(messages) == 1 else "\n".join(

### Ouro Bruto (primeiros 5000 chars)
```
# Headless Mode and Scripting

Headless mode runs Grok non-interactively from the command line. It accepts a single prompt, executes it with full tool access, and returns the result. Use it to automate tasks, script workflows, build integrations, and parse output programmatically.

---

## Basic Usage

Passing a prompt non-interactively triggers headless mode. The most common way is the `-p` flag (short for `--single`); `--prompt-json` and `--prompt-file` also trigger it:

```bash
grok -p "Your prompt here"
```

Grok processes the prompt, runs any necessary tools, and prints the result to stdout. The process exits when the response is complete.

---

## Command-Line Options

| Flag                    | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| `-p, --single <PROMPT>` | The prompt to send (or use `--prompt-json` / `--prompt-file`) |
| `-m, --model <MODEL>`   | Model to use (e.g., `grok-build`)              |
| `-s, --session-id <ID>` | Create a **new** session with this **UUID** (errors if invalid UUID or already in use under the target session directory; does not resume, use `-r`/`-c`) |
| `--fork-session`        | With `-r`/`-c`, fork into a new session ID instead of appending to the original |
| `-r, --resume <ID_OR_TITLE>` | Resume an existing session by ID, or by title for the current directory, ignoring letter case (a sole manually renamed match wins among duplicates; remaining duplicates error with their IDs; UUID-shaped values always take the ID path; scripts should prefer IDs) |
| `-c, --continue`        | Continue the most recent session in current directory  |
| `--cwd <PATH>`          | Set working directory                                 |
| `--output-format <FMT>` | Output format: `plain`, `json`, `streaming-json`, `streaming-messages-json` |
| `--include-partial-messages` | Emit raw `stream_event` deltas. Only affects `--output-format streaming-messages-json`; ignored (with a warning) otherwise. |
| `--yolo`                | Auto-approve all tool executions                      |
| `--rules <TEXT>`        | Custom rules for the system prompt                    |
| `--tools <TOOLS>`       | Allowlist of built-in tools (comma-separated). MCP meta-tools remain available unless denied. Headless only. |
| `--disallowed-tools <TOOLS>` | Denylist of built-in tools to remove (comma-separated). Supports `Agent` entries. Headless only. |
| `--max-turns <N>`       | Maximum number of agentic turns before stopping. Headless only. |
| `--reasoning-effort` / `--effort <LEVEL>` | Reasoning effort for reasoning models. Canonical levels: `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max` (each a distinct tier; a model only accepts the levels its menu advertises). Also accepts per-model menu option ids (e.g. `deep` → mapped wire value), same as `/effort`. Works in TUI and headless. |
| `--permission-mode <MODE>` | Permission mode. `bypassPermissions` enables always-approve (see [Permissions and safety](22-permissions-and-safety.md#permission-modes)); for deny-by-default use `defaultMode` in `.claude/settings.json`. |
| `--allow <RULE>`        | Permission allow rule with glob patterns (repeatable). Works in TUI and headless. |
| `--deny <RULE>`         | Permission deny rule with glob patterns (repeatable). Works in TUI and headless. |
| `--prompt-json <JSON>`  | Prompt as JSON content blocks                         |
| `--prompt-file <PATH>`  | Prompt from a file                                    |
| `--verbatim`            | Send prompt exactly as given                          |
| `--no-auto-update`      | Disable update checks for this session                |
| `--sandbox <PROFILE>`   | Sandbox profile for filesystem/network access         |

> **Note:** `--tools`, `--disallowed-tools`, `--max-turns`, and `--agents` are headless-only flags. If used in the interactive TUI, a warning is printed and the flag is ignored. `--reasoning-effort`/`--effort`, `--permission-mode`, `--allow`, and `--deny` work in both modes. For more flags (agents and worktrees), see [Additional Headless Flags](#additional-headless-flags).

### Tool Filtering

Use `--tools` to restrict the agent to an explicit set of tools (allowlist), or `--disallowed-tools` to remove specific tools from the default set (denylist). Both accept comma-separated tool names.

Tool names are internal tool IDs (e.g. the shell tool is `run_terminal_cmd`, not `bash`).

```bash
# Only allow read-only tools
grok -p "Explain this codebase" --tools "read_file,grep,list_dir"

# Remove web access and file editing
grok -p "Review this code" --disallowed-tools "web_search,web_fetch,search_replace"

# Remove shell access
grok -p "Review this code" --disallowed-tools "run_terminal_cmd"
```

`--disallowed-tools` also supports special `Agent` entries to control subagent spawning:

| Entry                  | Effect                                  |
| -----------
```