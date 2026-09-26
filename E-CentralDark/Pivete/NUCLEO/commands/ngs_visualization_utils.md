# COMANDO - ngs_visualization_utils.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\ngs_visualization_utils.py
**SHA:** 0963e6b13bc93077
**Timestamp:** 2026-08-26T18:31:14.065422
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- _items.append(mo.md(f"## {{_title}}\\nMissing: `{{_rel_path}}`"))
- _items.append(mo.md(f"## {{_title}}\\nMissing: `{{_rel_path}}`"))
- _items.append(mo.md(f"## {{_title}}\\nMissing: `{{_rel_path}}`"))

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Small visualization helpers for plugin-owned NGS runners."""

from __future__ import annotations

import csv
import html
import json
import os
import shlex
import shutil
import socket
import subprocess
import sys
import textwrap
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


def _json_default(value: Any) -> Any:
    if isinstance(value, Path):
        return str(value)
    return str(value)


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, indent=2, sort_keys=True, default=_json_default) + "\n", encoding="utf-8"
    )


def rel_link(index_dir: Path, target: Path) -> str:
    try:
        return os.path.relpath(target, index_dir)
    except ValueError:
        return str(target)


def _is_url(value: str) -> bool:
    return value.startswith(("http://", "https://"))


def localhost_url_for_path(
    relative_path: str | Path, *, port: int = 8765, host: str = "127.0.0.1"
) -> str:
    rel = Path(relative_path).as_posix().lstrip("/")
    return f"http://{host}:{port}/{rel}"


def preferred_http_server_python() -> str:
    system_python = Path("/usr/bin/python3")
    if system_python.exists():
        return str(system_python)
    return shutil.which("python3") or sys.executable or "python3"


def reachable_localhost_url_for_path(
    relative_path: str | Path,
    *,
    port: int = 8765,
    host: str = "127.0.0.1",
    timeout_seconds: float = 0.75,
) -> str | None:
    url = localhost_url_for_path(relative_path, port=port, host=host)
    request = urllib.request.Request(url, method="HEAD")
    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:  # noqa: S310
            if response.status == 200:
                return url
    except (urllib.error.URLError, TimeoutError, OSError):
        return None
    return None


def write_localhost_launch_hint(
    run_dir: Path,
    *,
    report_entries: list[tuple[str, str | Path]],
    port: int = 8765,
    host: str = "127.0.0.1",
) -> Path:
    python_cmd = preferred_http_server_python()
    lines = [
        f"cd {run_dir}",
        f"{python_cmd} -m http.server {port} --bind {host}",
        "",
    ]
    reported = 0
    for label, rel_path in report_entries:
        candidate = run_dir / rel_path
        if candidate.exists():
            lines.append(f"{label}: {localhost_url_for_path(rel_path, port=port, host=host)}")
            reported += 1
    if not reported:
        lines.append("No MultiQC reports were generated for this run.")
    path = run_dir / "visualizations" / "localhost_launch_hint.txt"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


def artifact_entry(
    *,
    artifact_id: str,
    title: str,
    path: str | Path | None,
    kind: str,
    status: str,
    description: str,
    source: str | None = None,
) -> dict[str, Any]:
    return {
        "id": artifact_id,
        "title": title,
        "path": str(path) if path else None,
        "kind": kind,
        "status": status,
        "description": description,
        "source": source,
    }


def copy_visual_asset(source: Path, dest: Path) -> Path | None:
    if not source.exists():
        return None
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, dest)
    return dest


def find_free_localhost_port(
    *, host: str = "127.0.0.1", start_port: int = 2719, max_tries: int = 50
) -> int:
    for port in range(start_port, start_port + max_tries):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind((host, port))
            except OSError:
                continue
            return port
    raise RuntimeError(f"Unable to find a free localhost port starting at {start_port}")


def wait_for_http_ready(url: str, *, timeout_seconds: float = 12.0) -> bool:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=1.5) as response:  # noqa: S310
                if response.status < 500:
                    return True
        except (urllib.error.URLError, TimeoutError, OSError):
            time.sleep(0.4)
    return False


def launch_marimo_review_app(
    *,
    notebook_path: Path,
    run_dir: Path,
    host: str = "127.0.0.1",
    start_port: int = 2719,
    python_executable: str | None = None,
) -> dict[str, Any]:
    runtime_root = run_dir / ".runtime" / "marimo"
    logs_dir = run_dir / "logs"
    runtime_root.mkdir(parents=True, exist_ok=True)
    logs_dir.mkdir(parents=True, exist_ok=True)
    xdg_cache_home = runtime_root / "xdg_cache"
    xdg_state_home = runtime_root / "xdg_state"
    xdg_cache_home.mkdir(parents=True, exist_ok=True)
 
```