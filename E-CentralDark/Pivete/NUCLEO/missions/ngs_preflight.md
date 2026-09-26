# MISSAO - ngs_preflight.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\ngs_preflight.py
**SHA:** c5ccb0ce8758434d
**Timestamp:** 2026-08-26T18:31:14.795304
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- def missing_by_profile_role(profile: dict[str, Any], missing: list[str]) -> dict[str, list[str]]:
- def missing_by_pipeline_role(pipeline: dict[str, Any], missing: list[str]) -> dict[str, list[str]]:
- missing: list[str], registry: dict[str, Any], manager: str
- for name in missing:
- missing: list[str],
- runtime_missing: list[str],
- blocking_missing: list[str],
- missing = [status["tool"] for status in statuses if not tool_is_present(status)]
- runtime_missing = [
- blocking_missing = missing + runtime_missing

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Check NGS tool availability before suggesting or running installs."""

from __future__ import annotations

import argparse
import importlib.util
import json
import shlex
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from ngs_run_utils import command_path

DEFAULT_REGISTRY = Path(__file__).resolve().parents[1] / "references" / "pipeline-registry.json"


def load_registry(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def executable_status(name: str) -> dict[str, Any]:
    resolved = command_path(name)
    return {"name": name, "present": resolved is not None, "path": resolved}


def module_status(name: str) -> dict[str, Any]:
    spec = importlib.util.find_spec(name)
    return {"name": name, "present": spec is not None}


def executable_uses_docker(path: str | None) -> bool:
    if not path:
        return False
    candidate = Path(path)
    if not candidate.exists():
        return False
    try:
        head = candidate.read_text(encoding="utf-8", errors="ignore")[:2000]
    except OSError:
        return False
    return "docker run" in head


def run_probe(cmd: list[str], timeout: int = 30) -> dict[str, Any]:
    try:
        result = subprocess.run(
            cmd,
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=timeout,
        )
    except FileNotFoundError:
        return {"cmd": cmd, "present": False, "ok": False, "detail": "command not found"}
    except subprocess.TimeoutExpired:
        return {"cmd": cmd, "present": True, "ok": False, "detail": "timeout"}
    detail = (result.stdout or result.stderr).strip().splitlines()
    return {
        "cmd": cmd,
        "present": True,
        "ok": result.returncode == 0,
        "returncode": result.returncode,
        "detail": detail[:5],
    }


def check_index(tool_name: str, tool: dict[str, Any], network_checks: bool) -> dict[str, Any]:
    checks: dict[str, Any] = {
        "tool": tool_name,
        "executables": [executable_status(item) for item in tool.get("executables", [])],
        "python_modules": [module_status(item) for item in tool.get("python_modules", [])],
        "network": [],
        "install": tool.get("install", {}),
        "notes": tool.get("notes"),
        "license": tool.get("license", "public_or_open"),
    }
    if tool_name == "bcl-convert":
        resolved = next((item["path"] for item in checks["executables"] if item["present"]), None)
        if executable_uses_docker(resolved):
            checks["runtime"] = {
                "docker_backed_wrapper": True,
                "docker_daemon": run_probe(["docker", "info"], timeout=30),
            }
    if not network_checks:
        return checks

    install = tool.get("install", {})
    conda_spec = install.get("conda")
    pip_spec = install.get("pip")

    conda_cmd = shutil.which("mamba") or shutil.which("conda") or shutil.which("micromamba")
    if conda_spec and conda_cmd:
        package = conda_spec.split("::", 1)[-1]
        channel = conda_spec.split("::", 1)[0] if "::" in conda_spec else "bioconda"
        channels = (
            ["-c", "conda-forge", "-c", "bioconda"] if channel == "bioconda" else ["-c", channel]
        )
        checks["network"].append(run_probe([conda_cmd, "search", *channels, package], timeout=60))

    if pip_spec:
        checks["network"].append(
            run_probe([sys.executable, "-m", "pip", "index", "versions", pip_spec], timeout=60)
        )

    docker_cmd = shutil.which("docker") or shutil.which("podman")
    if docker_cmd:
        for image in tool.get("container_images", []):
            checks["network"].append(
                run_probe([docker_cmd, "manifest", "inspect", image], timeout=60)
            )

    return checks


def tool_is_present(status: dict[str, Any]) -> bool:
    exe_ok = any(item["present"] for item in status.get("executables", []))
    module_ok = any(item["present"] for item in status.get("python_modules", []))
    return exe_ok or module_ok


def missing_by_profile_role(profile: dict[str, Any], missing: list[str]) -> dict[str, list[str]]:
    missing_set = set(missing)
    return {
        role: [name for name in profile.get(field, []) if name in missing_set]
        for role, field in [
            ("required", "required_tools"),
            ("preferred", "preferred_tools"),
            ("optional", "optional_tools"),
        ]
    }


def missing_by_pipeline_role(pipeline: dict[str, Any], missing: list[str]) -> dict[str, list[str]]:
    missing_set = set(missing)
    return {
        role: [name for name in pipeline.get(field, []) if name in missing_set]
        for role, field in [
            ("preferred", "preferred_tools"),
            ("optional", "optional_tools"),
            ("local_light", "local_light_too
```