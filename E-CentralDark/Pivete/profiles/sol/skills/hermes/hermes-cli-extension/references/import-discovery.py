#!/usr/bin/env python3
"""
Discover Hermes CLI internal imports: which module exports what.

Usage:
    python3 import-discovery.py [func1 func2 ...]

If no functions given, checks the known set: _cprint, save_config_value, load_config.
Prints which module each function is importable from, so you can pick the correct import.
"""

import sys, importlib

sys.path.insert(0, r"C:\Users\danda\AppData\Local\hermes\hermes-agent")
sys.path.insert(0, r"C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Lib\site-packages")

MODULES = {
    "cli": "cli",
    "hermes_cli.config": "hermes_cli.config",
    "hermes_cli.cli_commands_mixin": "hermes_cli.cli_commands_mixin",
}

DEFAULT_FUNCS = ["_cprint", "save_config_value", "load_config"]


def discover(funcs):
    for modname in MODULES:
        try:
            mod = importlib.import_module(modname)
        except Exception as e:
            print(f"[SKIP] {modname}: {e}")
            continue
        for f in funcs:
            if hasattr(mod, f):
                qual = getattr(mod, f)
                print(f"  {f:25s} ← {modname}")
                if hasattr(qual, "__module__"):
                    print(f"{'':25s}   __module__: {qual.__module__}")


if __name__ == "__main__":
    funcs = sys.argv[1:] if len(sys.argv) > 1 else DEFAULT_FUNCS
    if not funcs:
        funcs = DEFAULT_FUNCS
    print(f"=== Import discovery: {', '.join(funcs)} ===")
    discover(funcs)
