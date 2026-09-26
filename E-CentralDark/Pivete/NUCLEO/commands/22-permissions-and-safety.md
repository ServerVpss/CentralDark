# COMANDO - 22-permissions-and-safety.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\docs\user-guide\22-permissions-and-safety.md
**SHA:** 7552ed1c1c4ca5ee
**Timestamp:** 2026-08-28T02:52:41.965590
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Keep always-approve for automation, and add deny rules for paths or commands you never want run:

### Padroes
- { action = "allow", tool = "bash", pattern = "git *" },
- { action = "allow", tool = "bash", pattern = "gh *" },
- { action = "deny",  tool = "bash", pattern = "rm -rf *" },  # block a dangerous pattern

### Ouro Bruto (primeiros 5000 chars)
```
# Permissions and safety

Control what Grok can access and do: permission modes, allow/ask/deny rules, hooks, and the optional OS-level sandbox.

- **Modes** set how often Grok asks for approval (always-approve, auto, ask, and related).
- **Rules** set which tools are allowed, asked about, or blocked within that baseline.

---

## Permission modes

When Grok edits a file, runs a command, or calls an external tool, it may pause for approval. Permission modes control how often that happens.

Modes set a baseline. Allow, ask, and deny [rules](#configuring-permissions) still apply on top of any mode.

### Starting points

| Situation | Mode |
| --------- | ---- |
| Interactive TUI | Default (ask), or auto for fewer prompts with background checks |
| Scripts, SDKs, CI, agent servers | Always-approve; add [deny rules](#configuring-permissions) or hooks for hard limits |

```bash
grok -p "Run the tests" --always-approve
grok agent --always-approve stdio
grok agent --always-approve serve --bind 127.0.0.1:2419 --secret <token>
```

ACP clients can set `"_meta": { "yoloMode": true }` on `session/new`. See [Agent mode](15-agent-mode.md#automation-and-sdks).

### Available modes

| Mode | What runs without asking | Best for |
| ---- | ------------------------ | -------- |
| `default` (**ask**) | Read-only tools and built-in read-only shell commands | Interactive day-to-day use |
| `acceptEdits` | File edits without a prompt | Local coding while you review diffs later |
| `plan` | Accepted for compatibility; use [plan mode](19-plan-mode.md) for gated planning | Claude-compatible settings |
| `auto` | Work the safety check allows; other calls are blocked or escalated | Interactive sessions that want fewer prompts |
| `dontAsk` | Only pre-approved tools and built-in read-only handling | Strict CI allowlists |
| `bypassPermissions` (**always-approve**) | Tool calls in general (`deny` rules, hooks, and some shell `ask` rules still apply) | Trusted automation and agent servers |

**Always-approve** is the product name; config and Claude-compatible settings may use `bypassPermissions` for the same mode. Always-approve and auto are mutually exclusive (always-approve takes precedence when both are requested).

### How to set the mode

**Interactive TUI:** `Shift+Tab` / `Ctrl+O`, `/always-approve` or `/auto`, or `/settings` ([shortcuts](03-keyboard-shortcuts.md), [commands](04-slash-commands.md)).

**CLI:**

```bash
grok --always-approve -p "Run the test suite"
grok --permission-mode auto
grok agent --always-approve serve --bind 127.0.0.1:2419 --secret <token>
```

**Config:**

```toml
[ui]
permission_mode = "always-approve"   # or "auto", "ask", …
```

Claude-compatible `defaultMode` in `.claude/settings.json` is also supported (see [Claude-compatible settings](#3-claude-code-compatibility-claudesettingsjson)). CLI overrides config for that process.

### Always-approve

Skips ordinary permission prompts so tools run without waiting for a click. `deny` rules, hooks, and some shell `ask` rules still apply. Admins can lock the mode off (below).

| Mechanism | Example |
| --------- | ------- |
| CLI | `--always-approve` (alias `--yolo`), or `--permission-mode bypassPermissions` |
| Config | `[ui] permission_mode = "always-approve"` |
| Interactive | `/always-approve`, `Ctrl+O` |
| ACP | `_meta.yoloMode: true` on `session/new` |

#### Always-approve with hard limits

Keep always-approve for automation, and add deny rules for paths or commands you never want run:

```toml
# project .grok/config.toml
[ui]
permission_mode = "always-approve"

[permission]
deny = [
  "Bash(rm -rf *)",
  "MCPTool(sales__delete_*)",
]
```

```bash
grok -p "Deploy the service" --always-approve --deny 'Bash(rm -rf *)'
```

Deny always wins over allow and over always-approve’s normal pass-through. See [Configuring permissions](#configuring-permissions).

### Auto mode

Reduces interactive prompts by checking many tool calls before they run. Routine local work often proceeds; other calls may be blocked or escalated. In non-interactive sessions, a blocked call fails and is reported to the model (for example `Auto mode blocked this action …`). Behavior is the same for `grok -p`, `agent stdio`, and `agent serve`.

For automation that must run tools without interactive approval, use always-approve (and deny rules if you need hard blocks) rather than auto alone.

### Disable always-approve (administrators)

Organizations can prevent always-approve from being enabled via CLI, TUI, or `/always-approve`. Set this in `requirements.toml` (user-level under `~/.grok/`, or system-wide under `/etc/grok/` for enforcement users cannot remove):

```toml
[ui]
disable_bypass_permissions_mode = true
```

Do not use `permission_mode` for this lock; that key is a switchable default. The legacy `[ui] yolo = false` key in `requirements.toml` also disables always-approve for compatibility.

Grok can still load Claude-style permission **rules** from managed settings; always-approve is 
```