# COMANDO - 05-configuration.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\docs\user-guide\05-configuration.md
**SHA:** 4de8385f08545e7b
**Timestamp:** 2026-08-28T02:52:42.022236
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- new_session_worktree_mode = "never"    # /new worktree prompt: "ask" | "always" | "never"
- fork_worktree_mode = "ask"             # /fork worktree prompt: "ask" | "always" | "never"

### Ouro Bruto (primeiros 5000 chars)
```
# Configuration

Grok reads settings from config files, environment variables, and CLI flags. This page covers the common options.

---

## Precedence

Settings resolve highest-priority first:

1. **CLI flags** (e.g. `--yolo`, `--model`, `--sandbox`)
2. **Environment variables** (e.g. `XAI_API_KEY`, `GROK_MEMORY`)
3. **`requirements.toml` / MDM** (org-enforced; clamps every config layer below, including the overlay)
4. **`GROK_CONFIG` / `GROK_CONFIG_PATH` overlay** (above `config.toml` and managed, below `requirements.toml` / MDM)
5. **config.toml** (`~/.grok/config.toml`)
6. **`managed_config.toml`** (org-deployed defaults; below `config.toml`)
7. **Built-in defaults**

Within the config-file tier, the layers merge lowest-to-highest: `managed_config.toml` → `config.toml` → `GROK_CONFIG` overlay → `requirements.toml` / MDM. So `requirements.toml` and MDM clamp **both** your `config.toml` and the overlay.

`GROK_CONFIG` / `GROK_CONFIG_PATH` (tier 4) are config **overlays**: a merged config layer, not direct-setting environment variables like `XAI_API_KEY` (tier 2). They set config keys (subject to the allowlist below), so read them as part of the config-file tier rather than the env-var tier.

### Injecting config with `GROK_CONFIG`

A harness or ACP client that launches `grok agent stdio` can inject settings without writing a `config.toml` or relocating `$GROK_HOME`:

- **`GROK_CONFIG`**: an inline JSON object overlay.
- **`GROK_CONFIG_PATH`**: an *additional* file overlay (not a replacement for `config.toml`), a JSON or TOML file read by its extension (`.json` → JSON, else TOML). `GROK_CONFIG` wins if both are set. An empty `GROK_CONFIG` is treated as unset, and a malformed one logs a warning and falls through to `GROK_CONFIG_PATH`.

The overlay is **deep-merged** on top of your `config.toml` (it overrides only the keys it sets), placed above the user/managed layers but **below** `requirements.toml` / MDM so an enterprise pin still wins. A malformed blob is ignored with a warning. This mirrors `CODEX_CONFIG` from the `codex-acp` adapter (a JSON object merged into the session config); Grok is ACP-native, so the overlay lives in the agent itself. It only affects settings read from the merged config, and it is **not** a permission-escalation path. The overlay is confined, fail-closed, to an **allowlist** of soft settings (`models`, `features`, a narrowed `toolset`, and a `shell_environment_policy` limited to its filter fields, which select among env names the launcher already controls and cannot inject an env value into tool subprocesses); every other table is dropped at the choke point, so the overlay cannot spawn commands, set auth policy, redirect network traffic, elevate trust, or add a discovery source. Even on the allowlisted settings, a specific set of security gates read the raw disk layers rather than the overlay. The `ConfigLayers::env_overlay` rustdoc is the canonical list of what the overlay can and cannot reach and which gates read it overlay-free; see also the [internal environment-variables reference](../internal/22-environment-variables.md). Use `GROK_DEFAULT_SELECTED_PERMISSION` for headless permission control. For example, to set the default reasoning effort:

```bash
GROK_CONFIG='{"models": {"default_reasoning_effort": "high"}}' grok agent stdio
```

---

## config.toml (main configuration)

Location: `~/.grok/config.toml`. If the file is missing, Grok uses its built-in defaults, so you only need to set the values you want to override.

### General settings

```toml
[cli]
auto_update = true                     # check for updates on launch

[models]
default = "grok-4.5"                   # model used for new sessions
web_search = "grok-4.5"                # model used by the web_search tool

# Defaults applied to every model; a per-model [model.<id>] value always wins.
# See "Custom Models" for the per-model overrides and full details.
extra_headers = { "X-Request-Tags" = "team=example,env=prod" }
temperature = 0.7
top_p = 0.95
max_completion_tokens = 8192
max_retries = 8
inference_idle_timeout_secs = 600
stream_tool_calls = true

[ui]
simple_mode = true                     # readline-style prompt editing (default); false = vim editing in the prompt
vim_mode = false                       # vim-style scrollback navigation keys (default: false)
max_thoughts_width = 120               # max column width for reasoning display
default_selected_permission = "always_allow_all_sessions" # preselected row on the FIRST approval prompt
remember_tool_approvals = false        # show per-command "Always allow" options on permission prompts;
                                       # grants are remembered per project (default: false); see 22-permissions-and-safety.md
show_thinking_blocks = true            # show agent thinking blocks in the TUI (default: true)
group_tool_verbs = true                # fold runs of read/search/list tool calls and subagent rows
                                       # — and fin
```