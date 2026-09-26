# Hermes CLI Extension — Import Map Reference

## The core discovery

Hermes CLI internal functions are NOT symmetrically exported. The most common source of patching errors is importing from the wrong module.

### Verified import table (2026-08-31)

| Function             | Import from                  | Also available in      |
|----------------------|-----------------------------|------------------------|
| `_cprint`           | `from cli import _cprint`  | — (not in submodules) |
| `save_config_value` | `from cli import save_config_value` | — (not in config module) |
| `load_config`       | `from hermes_cli.config import load_config` | NOT in `cli` (no re-export) |

### Why `cli` is special

`cli.py` re-exports some functions from submodules for convenience, but NOT all:

- `save_config_value` — re-exported by `cli` ✓
- `_cprint` — re-exported by `cli` ✓
- `load_config` — NOT re-exported by `cli` ✗ (must import from `hermes_cli.config`)

### What happens if you get it wrong

```python
# WRONG
from cli import load_config
# ImportError: cannot import name 'load_config' from 'cli'

# WRONG
from hermes_cli.config import save_config_value
# ImportError: cannot import name 'save_config_value' from 'hermes_cli.config'
```

Both look plausible because both functions exist somewhere in the codebase, but only one module exports each.

## Discovery commands

To verify which module exports a given function:

```python
import sys
sys.path.insert(0, r"C:\Users\danda\AppData\Local\hermes\hermes-agent")
sys.path.insert(0, r"C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Lib\site-packages")

import cli, hermes_cli.config

for mod, name in [(cli, "cli"), (hermes_cli.config, "hermes_cli.config")]:
    for f in ["_cprint", "save_config_value", "load_config"]:
        if hasattr(mod, f):
            print(f"{f}: {name} ✓")
```

Or use the bundled script:

```bash
python3 references/import-discovery.py
# or with specific functions:
python3 references/import-discovery.py _cprint save_config_value load_config
```

## Handler method import pattern

Handler methods in `cli_commands_mixin.py` should import internally (inside the method body), not at module top-level, to avoid circular imports:

```python
def _my_handler(self, cmd_original: str) -> None:
    from cli import _cprint
    from hermes_cli.config import load_config
    from cli import save_config_value
    # ... use the functions
```

This is especially important when the handler touches both `cli`-exported functions and `hermes_cli.config` functions — you need BOTH imports.

## Additional known exports from `cli`

These are re-exported by `cli.py` and can be imported as `from cli import X`:

- `save_config_value`
- `_cprint`

These are NOT re-exported by `cli.py` (import from their source module):

- `load_config` → `from hermes_cli.config import load_config`
