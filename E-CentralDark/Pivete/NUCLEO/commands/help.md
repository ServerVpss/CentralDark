# COMANDO - help.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\mixpanel-headless\skills\mixpanelyst\scripts\help.py
**SHA:** 8a3d23d0e76d0593
**Timestamp:** 2026-08-26T18:31:18.134411
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- if field.default is not dataclasses.MISSING:
- elif field.default_factory is not dataclasses.MISSING:  # type: ignore[misc]

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Programmatic API documentation lookup for mixpanel_headless.

Usage:
    python help.py Workspace                    # List all Workspace methods
    python help.py Workspace.segmentation       # Method signature + docstring
    python help.py SegmentationResult           # Type/class documentation
    python help.py FeatureFlagStatus            # Enum members + values
    python help.py types                        # List all public types
    python help.py exceptions                   # List all exceptions
    python help.py search <term>                # Search all names for a term
"""

import contextlib
import dataclasses
import difflib
import enum
import importlib
import inspect
import re
import sys
from pathlib import Path
from typing import Any

try:
    from pydantic_core import PydanticUndefined
except ImportError:
    PydanticUndefined = None  # type: ignore[assignment,misc]


def get_obj(path: str) -> Any:
    """Navigate a dotted path from mixpanel_headless to find the target object."""
    mod = importlib.import_module("mixpanel_headless")
    parts = path.split(".")
    obj: Any = mod
    for part in parts:
        obj = getattr(obj, part)
    return obj


def format_type(annotation: Any) -> str:
    """Format a type annotation for clean display.

    Args:
        annotation: A type annotation (class, generic, union, etc.).

    Returns:
        Human-readable type string with noise removed.
    """
    if annotation is None or annotation is type(None):
        return "None"
    if hasattr(annotation, "__name__") and not hasattr(annotation, "__args__"):
        return annotation.__name__
    s = str(annotation)
    s = s.replace("typing.", "").replace("typing_extensions.", "")
    s = s.replace("<class '", "").replace("'>", "")
    s = s.replace("NoneType", "None")
    return s


def _enum_values_inline(annotation: Any) -> str:
    """Return inline enum member names if annotation contains an Enum type.

    Args:
        annotation: A type annotation to inspect.

    Returns:
        String like ' [ENABLED | DISABLED | ARCHIVED]' or empty string.
    """
    candidates: list[type] = []
    if isinstance(annotation, type) and issubclass(annotation, enum.Enum):
        candidates.append(annotation)
    args = getattr(annotation, "__args__", None)
    if args:
        for arg in args:
            if isinstance(arg, type) and issubclass(arg, enum.Enum):
                candidates.append(arg)
    if not candidates:
        return ""
    all_names: list[str] = []
    for cls in candidates:
        all_names.extend(m.name for m in cls)
    return f" [{' | '.join(all_names)}]"


def format_signature(obj: Any, name: str) -> str:
    """Format a callable's full signature with type annotations."""
    try:
        sig = inspect.signature(obj)
        params = []
        for pname, param in sig.parameters.items():
            if pname == "self":
                continue
            annotation = ""
            if param.annotation != inspect.Parameter.empty:
                annotation = f": {format_type(param.annotation)}"
            default = ""
            if param.default != inspect.Parameter.empty:
                default = f" = {param.default!r}"
            params.append(f"    {pname}{annotation}{default}")

        ret = ""
        if sig.return_annotation != inspect.Signature.empty:
            ret = f" -> {format_type(sig.return_annotation)}"

        param_str = ",\n".join(params)
        if params:
            return f"{name}(\n{param_str}\n){ret}"
        return f"{name}(){ret}"
    except (ValueError, TypeError):
        return f"{name}(...)"


def show_enum(obj: type, name: str) -> None:
    """Display enum members with their values.

    Args:
        obj: An Enum subclass.
        name: Display name for the enum.
    """
    members = list(obj)  # type: ignore[arg-type]
    print(f"# {name} \u2014 {len(members)} members\n")
    max_name_len = max((len(m.name) for m in members), default=0)
    for member in members:
        print(f"  {member.name:<{max_name_len}}  = {member.value!r}")
    doc = inspect.getdoc(obj)
    if doc:
        print(f"\n{doc}")


def list_members(obj: Any, name: str) -> None:
    """List public methods and properties of an object."""
    if isinstance(obj, type) and issubclass(obj, enum.Enum):
        show_enum(obj, name)
        return

    members: list[tuple[str, str]] = []
    for attr_name in sorted(dir(obj)):
        if attr_name.startswith("_"):
            continue
        try:
            attr = getattr(obj, attr_name, None)
        except Exception:
            continue

        if attr is None:
            continue

        doc = inspect.getdoc(attr) or ""
        first_line = doc.split("\n")[0] if doc else "(no description)"

        if isinstance(attr, property):
            members.append((attr_name, f"[property] {first_line}"))
        elif callable(attr):
            members.append((attr_name, first_line))

    print(f"# {nam
```