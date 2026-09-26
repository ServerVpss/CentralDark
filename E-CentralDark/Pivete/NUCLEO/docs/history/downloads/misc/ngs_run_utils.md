# OUTRO - ngs_run_utils.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\ngs_run_utils.py
**SHA:** ee2d718ee8faae16
**Timestamp:** 2026-08-26T18:31:48.074472
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dry_run: dict[str, Any] | None = None,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Shared helpers for plugin-owned NGS execution runners."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import os
import platform
import shlex
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

RUN_ENVELOPE_SCHEMA_VERSION = "0.4.0"
MAX_AUTO_CHECKSUM_BYTES = 128 * 1024 * 1024
LOCAL_ENV_FILE = Path.cwd() / ".ngs-analysis-local.env"


def _load_local_env_file(path: Path = LOCAL_ENV_FILE) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values
    for raw_line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[len("export ") :].strip()
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if not key:
            continue
        values[key] = os.path.expandvars(value)
    return values


LOCAL_ENV = _load_local_env_file()


def _apply_local_env() -> None:
    for key, value in LOCAL_ENV.items():
        if key == "NGS_TOOL_PATH_PREPEND":
            continue
        os.environ.setdefault(key, value)


def _effective_path() -> str:
    base_path = os.environ.get("PATH", "")
    prepend = LOCAL_ENV.get("NGS_TOOL_PATH_PREPEND", "").strip()
    if not prepend:
        return base_path
    return os.pathsep.join([prepend, base_path]) if base_path else prepend


def _effective_env() -> dict[str, str]:
    env = os.environ.copy()
    for key, value in LOCAL_ENV.items():
        if key == "NGS_TOOL_PATH_PREPEND":
            continue
        env.setdefault(key, value)
    env["PATH"] = _effective_path()
    return env


_apply_local_env()


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def slug_timestamp(label: str) -> str:
    safe_label = label.strip().replace("_", "-")
    return datetime.now().strftime(f"%Y-%m-%dT%H-%M-%S-{safe_label}")


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def write_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding="utf-8")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while True:
            chunk = handle.read(1024 * 1024)
            if not chunk:
                break
            digest.update(chunk)
    return digest.hexdigest()


def sha256_json(value: Any) -> str:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":"), default=str).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def command_path(name: str) -> str | None:
    return shutil.which(name, path=_effective_path())


def module_present(name: str) -> bool:
    return importlib.util.find_spec(name) is not None


def shell_tool_command(name: str) -> str | None:
    resolved = command_path(name)
    if resolved:
        return name
    module_fallbacks = {
        "snakemake": "snakemake",
        "multiqc": "multiqc",
        "cutadapt": "cutadapt",
    }
    module_name = module_fallbacks.get(name)
    if module_name and module_present(module_name):
        return f"{sys.executable} -m {module_name}"
    return None


def run_cmd(cmd: list[str], cwd: Path, timeout: int | None = None) -> dict[str, Any]:
    started = now_iso()
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=timeout,
            env=_effective_env(),
        )
        output = result.stdout or ""
        return {
            "cmd": cmd,
            "cwd": str(cwd),
            "started_at": started,
            "finished_at": now_iso(),
            "returncode": result.returncode,
            "ok": result.returncode == 0,
            "stdout_tail": output[-12000:],
        }
    except subprocess.TimeoutExpired as exc:
        output = exc.stdout if isinstance(exc.stdout, str) else ""
        return {
            "cmd": cmd,
            "cwd": str(cwd),
            "started_at": started,
            "finished_at": now_iso(),
            "returncode": None,
            "ok": False,
            "error": f"TimeoutExpired: exceeded {timeout}s",
            "stdout_tail": output[-12000:],
        }


def run_cmd_stdout_to_file(
    cmd: list[str],
    cwd: Path,
    stdout_path: Path,
    timeout: int | None = None,
) -> dict[str, Any]:
    started = now_iso()
    stdout_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        with stdout_path.open("w", encod
```