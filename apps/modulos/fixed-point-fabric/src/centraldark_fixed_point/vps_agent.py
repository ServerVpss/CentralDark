from __future__ import annotations

# #OBSERVACOES#
# @owner: apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/vps_agent.py
# @doc_ref: docs/CONSCIENCIA/RECEIPTS/2026-11-03-branches-891-funil-hud.md
# @last_updated: 2026-11-03T18:43:17.560Z
# @implementado: heartbeat assinado inclui Git HEAD observado do checkout real.
# @pendente: executar suite source e gates GitHub SAME_HEAD no PR #1977.
# @estado: SOURCE_PATCHED; CI=UNKNOWN; RUNTIME=NOT_TESTED_BY_SCOPE
# @next_cursor: validar P1 HEAD mismatch; nao declarar runtime nem merge sem gates.

import argparse
import hashlib
import hmac
import json
import os
import subprocess
import platform
import shutil
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


def payload(secret: str | None) -> dict:
    # Observa o SHA real do checkout; um env arbitrario nao basta para prova.
    repo_path = os.getenv("CENTRALDARK_HOME") or os.getcwd()
    try:
        head_sha = subprocess.check_output(
            ["git", "-C", repo_path, "rev-parse", "HEAD"],
            stderr=subprocess.DEVNULL, text=True, timeout=5,
        ).strip()
    except (OSError, subprocess.SubprocessError):
        head_sha = ""  # policy falha fechada ate ter checkout verificavel
    unsigned = {
        "head_sha": head_sha,
        "timestamp": time.time(),
        "hostname": platform.node(),
        "platform": platform.platform(),
        "disk_free_bytes": shutil.disk_usage("/").free,
        "agent_version": "1.0.0",
    }
    if secret:
        unsigned["signature"] = hmac.new(secret.encode(), json.dumps(unsigned, sort_keys=True, separators=(",", ":")).encode(), hashlib.sha256).hexdigest()
    return unsigned


def main(argv=None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=9119)
    args = parser.parse_args(argv)
    secret = os.getenv("CENTRALDARK_HEARTBEAT_SECRET")

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            body = json.dumps(payload(secret)).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, *_args):
            return

    ThreadingHTTPServer((args.host, args.port), Handler).serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
