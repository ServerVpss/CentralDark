#!/usr/bin/env python3
"""Canonical launcher/supervisor for the CentralDark Omni Router.

One process, one port, one control plane. Hermes/local is the default engine.
External providers are optional and disabled from the fallback chain unless the
operator explicitly enables them with CENTRALDARK_ALLOW_EXTERNAL_PROVIDERS=1.
"""

from __future__ import annotations

import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROUTER_SCRIPT = ROOT / "apps" / "modulos" / "elite-gateway" / "scripts" / "centraldark_omni_compat.py"
DEFAULT_HERMES_PYTHON = Path.home() / "AppData" / "Local" / "hermes" / "hermes-agent" / "venv" / "Scripts" / "python.exe"


def env_bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() not in {"0", "false", "off", "no", ""}


def build_env() -> dict[str, str]:
    env = os.environ.copy()
    env.setdefault("HERMES_BASE_URL", "http://127.0.0.1:8645")
    env.setdefault("CENTRALDARK_DEFAULT_ENGINE", "hermes")
    env.setdefault("CENTRALDARK_AUTO_FALLBACK", "true")
    env.setdefault("CENTRALDARK_ROUTER_HOST", "127.0.0.1")
    env.setdefault("CENTRALDARK_ROUTER_PORT", "8099")

    if "CENTRALDARK_FALLBACK_CHAIN" not in env:
        if env_bool("CENTRALDARK_ALLOW_EXTERNAL_PROVIDERS", False):
            env["CENTRALDARK_FALLBACK_CHAIN"] = "hermes,nous,google,claude-code,xai,abacus,openai"
        else:
            env["CENTRALDARK_FALLBACK_CHAIN"] = "hermes"
    return env


def choose_python() -> str:
    configured = os.getenv("CENTRALDARK_ROUTER_PYTHON", "").strip()
    if configured:
        return configured
    if os.name == "nt" and DEFAULT_HERMES_PYTHON.is_file():
        return str(DEFAULT_HERMES_PYTHON)
    return sys.executable


def run_once(env: dict[str, str]) -> int:
    python = choose_python()
    host = env["CENTRALDARK_ROUTER_HOST"]
    port = env["CENTRALDARK_ROUTER_PORT"]
    print("[CENTRALDARK] one-blood router boot")
    print(f"[CENTRALDARK] python={python}")
    print(f"[CENTRALDARK] root={ROOT}")
    print(f"[CENTRALDARK] router=http://{host}:{port}")
    print(f"[CENTRALDARK] primary={env['CENTRALDARK_DEFAULT_ENGINE']}")
    print(f"[CENTRALDARK] fallback={env['CENTRALDARK_FALLBACK_CHAIN']}")
    print(f"[CENTRALDARK] external_optional={env_bool('CENTRALDARK_ALLOW_EXTERNAL_PROVIDERS', False)}")
    return subprocess.run(
        [python, str(ROUTER_SCRIPT), "--host", host, "--port", port],
        env=env,
        cwd=str(ROOT),
        check=False,
    ).returncode


def main() -> int:
    env = build_env()
    supervise = env_bool("CENTRALDARK_ROUTER_SUPERVISE", True)
    restart_delay = max(1.0, float(env.get("CENTRALDARK_ROUTER_RESTART_DELAY", "2")))
    max_delay = max(restart_delay, float(env.get("CENTRALDARK_ROUTER_RESTART_MAX_DELAY", "30")))
    delay = restart_delay

    while True:
        try:
            code = run_once(env)
        except KeyboardInterrupt:
            return 130

        if not supervise:
            return code
        if code == 0 and env_bool("CENTRALDARK_ROUTER_EXIT_ON_CLEAN", False):
            return 0

        print(f"[CENTRALDARK] router exited rc={code}; restart in {delay:.1f}s")
        try:
            time.sleep(delay)
        except KeyboardInterrupt:
            return 130
        delay = min(max_delay, delay * 2)


if __name__ == "__main__":
    raise SystemExit(main())
