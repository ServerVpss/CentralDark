# OUTRO - ragflow_manage.py
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_agi-self-improvement-main\agi-self-improvement-main\scripts\ragflow_manage.py
**SHA:** ec15f8caa4f5f4d5
**Timestamp:** 2026-08-26T19:43:45.655538
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- issues.append(f"Required upstream files missing: {', '.join(info['required_files_missing'])}")

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Hermes manager for RAGFlow.

RAGFlow is a large Docker/Python/Go/Node RAG platform. Hermes keeps it as a
pinned external source tree and manages it through Docker Compose/HTTP/process
boundaries instead of importing its dependencies into the Hermes runtime.
"""

from __future__ import annotations

import argparse
import json
import os
import platform
import shutil
import subprocess
import time
import urllib.request
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REMOTE = "https://github.com/infiniflow/ragflow.git"
PINNED_COMMIT = "b0cac0ac9dc88dddfde183f62a7d940af07dc9cd"
SOURCE_DIR = Path(os.environ.get("RAGFLOW_SOURCE_DIR", ROOT / "integrations" / "ragflow")).resolve()
HOME = Path(os.environ.get("HERMES_RAGFLOW_HOME", Path.home() / ".hermes" / "ragflow")).resolve()
RUNTIME_DOCKER_DIR = Path(os.environ.get("HERMES_RAGFLOW_DOCKER_DIR", HOME / "docker")).resolve()
COMPOSE_FILE = RUNTIME_DOCKER_DIR / "docker-compose.yml"
BASE_COMPOSE_FILE = RUNTIME_DOCKER_DIR / "docker-compose-base.yml"
ENV_FILE = RUNTIME_DOCKER_DIR / ".env"
WEB_URL = os.environ.get("RAGFLOW_WEB_URL", "http://127.0.0.1:8088").rstrip("/")
API_URL = os.environ.get("RAGFLOW_API_URL", "http://127.0.0.1:9380").rstrip("/")
ADMIN_URL = os.environ.get("RAGFLOW_ADMIN_URL", "http://127.0.0.1:9381").rstrip("/")
MCP_URL = os.environ.get("RAGFLOW_MCP_URL", "http://127.0.0.1:9382").rstrip("/")

REQUIRED_FILES = [
    "README.md",
    "LICENSE",
    "pyproject.toml",
    "uv.lock",
    "go.mod",
    "Dockerfile",
    "docker/docker-compose.yml",
    "docker/docker-compose-base.yml",
    "docker/service_conf.yaml.template",
    "docker/entrypoint.sh",
    "docker/init.sql",
    "docker/.env",
    "web/package.json",
]

SENSITIVE_KEY_FRAGMENTS = (
    "PASSWORD",
    "SECRET",
    "TOKEN",
    "API_KEY",
    "PRIVATE",
    "ACCESS_KEY",
)

SAFE_ENV_OVERRIDES = {
    # Use a small local footprint and non-conflicting ports by default.
    "COMPOSE_PROFILES": "cpu,elasticsearch",
    "DEVICE": "cpu",
    "SVR_WEB_HTTP_PORT": "8088",
    "SVR_WEB_HTTPS_PORT": "8443",
    "SVR_HTTP_PORT": "9380",
    "ADMIN_SVR_HTTP_PORT": "9381",
    "SVR_MCP_PORT": "9382",
    "GO_HTTP_PORT": "9384",
    "GO_ADMIN_PORT": "9383",
    "ES_PORT": "9208",
    "EXPOSE_MYSQL_PORT": "3308",
    "MINIO_PORT": "9008",
    "MINIO_CONSOLE_PORT": "9009",
    "REDIS_PORT": "6388",
    "INFINITY_HTTP_PORT": "23828",
    "INFINITY_THRIFT_PORT": "23818",
    "INFINITY_PSQL_PORT": "5438",
    "NATS_PORT": "4228",
    "KIBANA_PORT": "5608",
    "MEM_LIMIT": "8073741824",
    # Local dev credentials only. Override via environment for real deployments.
    "MYSQL_PASSWORD": "hermes-ragflow-mysql-password",
    "ELASTIC_PASSWORD": "hermes-ragflow-elastic-password",
    "OPENSEARCH_PASSWORD": "hermes-ragflow-opensearch-password",
    "MINIO_PASSWORD": "hermes-ragflow-minio-password",
    "REDIS_PASSWORD": "hermes-ragflow-redis-password",
    "OCEANBASE_PASSWORD": "hermes-ragflow-oceanbase-password",
    "OB_SYS_PASSWORD": "hermes-ragflow-ob-sys-password",
    "OB_TENANT_PASSWORD": "hermes-ragflow-ob-tenant-password",
    "SEEKDB_PASSWORD": "hermes-ragflow-seekdb-password",
}


def _run_capture(cmd: list[str], cwd: Path | None = None, timeout: int = 60, env: dict[str, str] | None = None) -> dict[str, Any]:
    try:
        completed = subprocess.run(
            cmd,
            cwd=str(cwd) if cwd else None,
            env=env,
            text=True,
            capture_output=True,
            timeout=timeout,
        )
        return {
            "ok": completed.returncode == 0,
            "returncode": completed.returncode,
            "stdout": completed.stdout.strip(),
            "stderr": completed.stderr.strip(),
            "cmd": cmd,
        }
    except FileNotFoundError as exc:
        return {"ok": False, "returncode": None, "stdout": "", "stderr": str(exc), "cmd": cmd}
    except subprocess.TimeoutExpired as exc:
        return {
            "ok": False,
            "returncode": None,
            "stdout": (exc.stdout or "").strip() if isinstance(exc.stdout, str) else "",
            "stderr": f"Timed out after {timeout}s",
            "cmd": cmd,
        }


def _git(args: list[str], timeout: int = 30) -> dict[str, Any]:
    if not SOURCE_DIR.exists():
        return {"ok": False, "stdout": "", "stderr": f"missing source: {SOURCE_DIR}"}
    return _run_capture(["git", *args], cwd=SOURCE_DIR, timeout=timeout)


def _tool_version(cmd: list[str]) -> str | None:
    result = _run_capture(cmd, timeout=10)
    return result["stdout"] if result.get("ok") else None


def _http_probe(url: str, timeout: int = 3) -> dict[str, Any]:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            body = response.read(300).decode("utf-8", errors="replace")
            return {"ok": 200 <= response.status < 400, "status": response.status, "url": url, "body_preview": body}
    except Exception as exc
```