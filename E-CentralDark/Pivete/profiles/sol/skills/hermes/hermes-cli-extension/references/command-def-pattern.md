# Hermes CLI Extension — CommandDef Pattern Reference

## Annotated example

This is the full pattern used to register a new Hermes CLI slash command. All fields are optional except `name` and `description`.

```python
CommandDef(
    # Canonical internal name. Used as the dispatch key.
    #   - Lowercase, underscores (not hyphens)
    #   - No leading slash
    #   - Must be unique across COMMAND_REGISTRY
    "nous_free",

    # Human-readable description. Shown in help output.
    "Ativar cadeia fixa de modelos FREE do Nous Portal "
    "(6 modelos com failover automático; sem fallback pago)",

    # Category for help grouping. Pick an existing category or add a new one.
    "Configuration",

    # Usage hint. Shown next to the command in autocomplete/help.
    # Format: space-separated list of accepted argument patterns.
    #   - "[prompt | --show-chain | --reset]" means:
    #       /nous-free                          (no args)
    #       /nous-free < algum prompt aqui >   (with prompt)
    #       /nous-free --show-chain            (flag)
    #       /nous-free --reset                 (flag)
    args_hint="[prompt | --show-chain | --reset]",

    # Aliases: alternate slash forms the user can type.
    #   - Include each alias WITHOUT the leading slash
    #   - All aliases resolve to the same canonical name
    #   - Check for collisions before adding:
    #         resolve_command("/alias") → must return this command
    aliases=("free", "nous-free"),

    # Busy policy: how the command behaves when Hermes is busy.
    #   - "dispatch" = dispatch immediately (default for most commands)
    #   - "queue"    = queue until Hermes is idle
    #   - "reject"   = reject with a message
    busy_policy="dispatch",

    # Handler method name (optional). If omitted, the dispatch block in
    # cli.py must call the method explicitly:
    #     elif canonical == "nous_free":
    #         self._handle_nous_free_command(cmd_original)
    #
    # If set, the registry auto-dispatches to this method.
    # Pattern: _handle_<name>_command(self, cmd_original: str) -> None
    handler="_handle_nous_free_command",
)
```

## Placement in COMMAND_REGISTRY

Find an existing entry with a similar category and insert yours after it. Example: place `nous_free` after the `model` entry.

```python
# Existing entry (example)
CommandDef(
    "model",
    "Gerenciar modelo ativo",
    "Configuration",
    args_hint="[set | list | reset]",
    aliases=("m",),
    busy_policy="dispatch",
),

# ← Insert new entry here
CommandDef(
    "nous_free",
    "Ativar cadeia fixa de modelos FREE do Nous Portal...",
    "Configuration",
    args_hint="[prompt | --show-chain | --reset]",
    aliases=("free", "nous-free"),
    busy_policy="dispatch",
),
```

## Verification after patching

```python
from hermes_cli.commands import COMMAND_REGISTRY, COMMANDS, resolve_command

# 1. CommandDef está na lista
assert any(c.name == "nous_free" for c in COMMAND_REGISTRY), "CommandDef não encontrado"

# 2. Resolve por nome canônico
assert resolve_command("/nous_free").name == "nous_free"

# 3. Resolve por alias
assert resolve_command("/free").name == "nous_free"
assert resolve_command("/nous-free").name == "nous_free"

# 4. Aparece no dict de autocomplete
assert "/nous-free" in COMMANDS
assert "/free" in COMMANDS
```

## Common mistakes

1. **Alias com barra:** `aliases=("/free",)` → resolve falha. Sem barra: `aliases=("free",)`.
2. **Nome com hífen:** `name="nous-free"` → a classe pode rejeitar ou o dispatch falhar. Use underscores: `name="nous_free"`.
3. **Alias duplicado:** Se `/free` já existe como comando separado, seu alias não resolve para `nous_free`. Verifique com `resolve_command("/free")` antes de patchar.
4. **Descrição muito longa:** A descrição é exibida no help. Mantenha informativa mas concisa.
