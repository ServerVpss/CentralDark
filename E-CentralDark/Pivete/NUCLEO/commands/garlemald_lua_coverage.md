# COMANDO - garlemald_lua_coverage.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\garlemald_lua_coverage.py
**SHA:** 5b46f2c450adb42b
**Timestamp:** 2026-08-28T12:23:03.581431
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- total_true_gap = 0
- true_gap = sorted(m for m in called_minus_bound
- any_gap = False
- any_gap = True
- if not any_gap:

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
# Copyright (C) 2026  Samuel Stegall
# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Coverage report: garlemald's Lua-binding API surface vs. the methods
its own server-side scripts actually call.

This is the actionable companion to `docs/cpp_bindings_index.md`. The
client-side C++ binding inventory tells us what the engine exposes;
this tool tells us what garlemald's scripts NEED its userdata.rs to
expose so they don't crash with `attempt to call a nil value`.

What it produces

  build/wire/garlemald_lua_coverage.json
  build/wire/garlemald_lua_coverage.md

For each garlemald UserData type (LuaPlayer, LuaActor, LuaNpc, ...)
we report:

  - Methods bound in `userdata.rs`     — defined via add_method()
  - Methods called from scripts         — observed in scripts/lua/
  - Coverage gaps                       — called but not bound (likely
                                          runtime errors)
  - Dead bindings                       — bound but never called (cleanup
                                          candidates)

Type inference is convention-based via variable-name → UserData mapping
(e.g. `player:` → LuaPlayer, `quest:` → LuaQuestHandle, ...). The
mapping table is in CONVENTIONS below; extend it as garlemald grows
new variable conventions.

Usage:
  tools/garlemald_lua_coverage.py
  tools/garlemald_lua_coverage.py --garlemald-root <path>
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# Variable-name → UserData type. Garlemald's scripts use these
# conventions consistently; if a script uses a non-conventional name
# (e.g. `myPlayer:GetName()`), this tool will undercount its calls.
#
# Important: a few "stub" types here actually delegate to a base type
# at runtime (LuaPlayer ⊂ LuaActor, LuaNpc ⊂ LuaActor). The tool
# reports cross-type bindings under "bound elsewhere" rather than as
# a true gap.
CONVENTIONS = {
    "player":       "LuaPlayer",
    "p":            "LuaPlayer",
    "npc":          "LuaNpc",
    "actor":        "LuaActor",
    "doorNpc":      "LuaNpc",
    "papalymo":     "LuaNpc",
    "yda":          "LuaNpc",
    "exitTriggerNpc": "LuaNpc",
    "quest":        "LuaQuestHandle",
    "data":         "LuaQuestDataHandle",
    "director":     "LuaDirectorHandle",
    "contentArea":  "LuaContentArea",
    "CurrentArea":  "LuaZone",   # CurrentArea field is a LuaZone, not LuaContentArea
    "zone":         "LuaZone",
    "party":        "LuaParty",
    "item":         "LuaItemData",
    "retainer":     "LuaRetainer",
    "package":      "LuaItemPackage",
    "recipe":       "LuaRecipe",
    "node":         "LuaGatherNode",
    "leve":         "LuaRegionalLeve",
}

# Methods bound on a "lower" type that get inherited by composition
# at runtime. Example: LuaPlayer holds a LuaActor base, and method
# calls like `player:PlayAnimation()` reach LuaActor's binding via
# garlemald's UserData metamethod forwarding.
#
# Calls of methods bound on a different UserData type than expected
# are categorized as "bound elsewhere" rather than true gaps.

# Calls of the form `GetWorldManager():method()` always go to LuaWorldManager.
WORLD_MANAGER_RE = re.compile(r"GetWorldManager\(\)\s*:\s*([A-Za-z_][A-Za-z0-9_]+)")


def find_userdata_bindings(rs_path: Path) -> dict[str, set[str]]:
    """Parse a Rust source file looking for `impl UserData for <T> {` blocks
    and per-block `add_method("name", ...)` declarations.
    """
    bindings: dict[str, set[str]] = defaultdict(set)
    if not rs_path.exists():
        return dict(bindings)
    text = rs_path.read_text()
    # Walk through `impl UserData for <T>` blocks. Track brace depth.
    impl_re = re.compile(r"impl\s+UserData\s+for\s+(\w+)\s*\{")
    method_re = re.compile(r'add_(?:async_)?method\(\s*"([^"]+)"')
    # Loop-bound stubs: `for stub in ["Name1", "Name2", ...] {` — a
    # common idiom for batch-binding LogError stubs. The stub names
    # are bound via `methods.add_method(name, ...)` inside the loop
    # body, which the per-call regex above can't catch (the name is a
    # variable). This regex captures the array literal directly.
    stub_array_re = re.compile(
        r'for\s+\w+\s+in\s+\[\s*((?:"[^"]+"\s*,?\s*)+)\]\s*\{'
    )
    string_lit_re = re.compile(r'"([^"]+)"')
    pos = 0
    while True:
        m = impl_re.search(text, pos)
        if not m:
            break
        cls = m.group(1)
        # Find matching closing brace by depth-tracking
        i = m.end()  # just past the `{`
        depth = 1
        while i < len(text) and depth > 0:
            c = text[i]
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    break
            i += 1
        block = te
```