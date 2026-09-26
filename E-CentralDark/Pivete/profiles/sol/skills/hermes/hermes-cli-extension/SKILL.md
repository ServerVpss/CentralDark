---
name: hermes-cli-extension
version: "1.0.0"
description: "Extend Hermes CLI with slash commands and handlers."
trigger: "When adding or modifying a Hermes CLI slash command (/something)."
author: "Hermes Agent"
license: "MIT"
tags: ["hermes", "cli", "commands", "extension", "patching"]
related_skills: ["hermes-agent-skill-authoring", "centraldark-hermes-config-edit"]
---

# Hermes CLI Extension

## Overview

Add a new slash command to Hermes CLI by modifying three files in the installed Hermes location. This skill captures the file layout, the import map for internal functions, the CommandDef structure, the handler pattern, and the pitfalls discovered during extension work.

**Hermes installation path (Windows):** `C:\Users\<user>\AppData\Local\hermes\hermes-agent\`

## The Three-File Pattern

| File | Role | What you add |
|------|------|-------------|
| `hermes_cli/commands.py` | Registry | `CommandDef("name", ...)` with optional `aliases` |
| `cli.py` | Dispatch | `elif canonical == "name": self._handle_name_command(cmd_original)` |
| `hermes_cli/cli_commands_mixin.py` | Handler | `_handle_name_command(self, cmd_original)` method + auxiliaries |

## Step 1: Registry (`hermes_cli/commands.py`)

The registry is `COMMAND_REGISTRY` — a list of `CommandDef` objects. Find an existing entry nearby and insert yours after it.

```python
CommandDef(
    "nous_free",                                              # canonical name (no slash, underscores)
    "Ativar cadeia fixa de modelos FREE do Nous Portal",     # description
    "Configuration",                                          # category
    args_hint="[prompt | --show-chain | --reset]",           # usage hint
    aliases=("free", "nous-free"),                           # alias list (WITHOUT leading slash)
    busy_policy="dispatch",
)
```

**Rules:**
- `name` is the canonical internal name (underscores, no slashes).
- `aliases` are the slash forms the user types, WITHOUT the leading `/` (e.g. `("free", "nous-free")`).
- The flat dict `COMMANDS` (used for autocomplete) is derived from registry + aliases. Test with `resolve_command("/nous-free")` after patching.

## Step 2: Dispatch (`cli.py`)

Find the dispatch chain — a series of `elif canonical == "..."` blocks. Insert yours in alphabetical/logical order among existing commands.

```python
elif canonical == "nous_free":
    self._handle_nous_free_command(cmd_original)
```

**Anchor:** existing entries near the insertion point include `model`, `codex-runtime`, `personality`. Pick the right neighbors.

## Step 3: Handler (`hermes_cli/cli_commands_mixin.py`)

Add the handler method at the end of the file (after the last existing `_handle_*_command` method).

```python
def _handle_nous_free_command(self, cmd_original: str) -> None:
    """Dispatch /nous-free modes: no-arg, prompt, --show-chain, --reset."""
    cmd = cmd_original.strip()
    if cmd == "/nous-free" or cmd == "/free":
        self._nous_free_activate()
        self._nous_free_show_chain()
    elif cmd.startswith("/nous-free ") or cmd.startswith("/free "):
        prompt = cmd[len("/nous-free "):] if cmd.startswith("/nous-free ") else cmd[len("/free "):]
        self._nous_free_activate()
        self._nous_free_show_chain()
        self._enqueue_prompt(prompt)
    elif cmd == "/nous-free --show-chain":
        self._nous_free_show_chain()
    elif cmd == "/nous-free --reset":
        self._nous_free_reset()
    else:
        self._nous_free_usage()
```

## Critical: Import Map for Internal Functions

This is the most common source of errors. The functions are NOT symmetrically exported.

| Function | Correct import | WRONG import (causes ImportError) |
|----------|---------------|----------------------------------|
| `_cprint` | `from cli import _cprint` | `from hermes_cli.xxx import _cprint` |
| `save_config_value` | `from cli import save_config_value` | `from hermes_cli.config import save_config_value` |
| `load_config` | `from hermes_cli.config import load_config` | `from cli import load_config` |

**Why this matters:** `cli.py` re-exports `save_config_value` and `_cprint`, but NOT `load_config`. `hermes_cli.config` exports `load_config` but NOT `save_config_value`. When patching handler methods, you may need BOTH imports:

```python
from hermes_cli.config import load_config
from cli import save_config_value
```

**Discovery pattern:** If you get `ImportError: cannot import name X from 'cli'`, check whether `X` is actually defined in `cli.py` or only in a submodule. Use:

```python
import cli
print(hasattr(cli, 'load_config'))       # False — not re-exported
print(hasattr(cli, 'save_config_value')) # True  — re-exported
```

## Config Persistence Pattern

When persisting state to `config.yaml` (e.g. `fallback_providers`):

```python
from hermes_cli.config import load_config
from cli import save_config_value

cfg = load_config() or {}
cfg_set = cfg.setdefault("fallback_providers", [])
cfg_set.clear()          # ← CRITICAL: replace, don't append
cfg_set.extend(new_chain)
save_config_value("fallback_providers", cfg_set)
```

**Pitfall:** Omitting `cfg_set.clear()` causes the new chain to APPEND to existing entries, producing duplicate/wrong config. Always clear before extending when replacing.

## Handler Method Structure

Each handler method should be self-contained and handle its own imports locally (inside the method body, not at module top-level) when those imports are only needed for that method. This avoids circular import issues.

```python
def _nous_free_activate(self) -> bool:
    from cli import _cprint
    from hermes_cli.config import load_config
    from cli import save_config_value
    # ... method body
```

## Validation After Patching

1. **Syntax check:** `python3 -m py_compile <file>` on each modified file.
2. **Registry check:** import `COMMAND_REGISTRY` and confirm the new `CommandDef` is present.
3. **Resolve check:**
   ```python
   from hermes_cli.commands import resolve_command
   assert resolve_command("/nous-free").name == "nous_free"
   assert resolve_command("/free").name == "nous_free"
   ```
4. **CLI instantiation:** `from cli import HermesCLI; cli = HermesCLI()` — must not raise.
5. **Handler invocation:** call `cli._handle_nous_free_command("/nous-free")` and check stdout.

## Common Pitfalls

1. **Missing local import:** Handler uses `_cprint` but forgot `from cli import _cprint` inside the method → `NameError` at runtime. Always check every function call in the handler body for local imports.

2. **Wrong import source:** `from cli import load_config` → ImportError. `load_config` is in `hermes_cli.config`, not re-exported by `cli`.

3. **Config append instead of replace:** Forgetting `cfg_set.clear()` before `extend()`.

4. **Hardcoding model list in handler output:** If the chain is defined as a class constant, reference it in show_chain rather than re-listing inline — avoids drift.

5. **Alias collision:** Check that the alias doesn't conflict with an existing command. Test `resolve_command("/alias")` — if it resolves to a different command, pick another alias.

6. **Editing the wrong copy:** The registry lives in the INSTALLED Hermes location (`AppData/Local/hermes/hermes-agent/`), NOT in the project directory. Verify path before patching.

## Reinhardt (activação)

Para ativar o comando depois dePatch no disco, basta reiniciar o Hermes CLI — o registry é estático (importado no boot), não requer reload de skill ou reinstalação. O comando está disponível na próxima sessão.

---

## References

- `references/cli-import-map.md` — full import resolution table with discovery commands.
- `references/command-def-pattern.md` — annotated CommandDef example with all fields.
