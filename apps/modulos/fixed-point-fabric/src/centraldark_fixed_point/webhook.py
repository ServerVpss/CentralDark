from __future__ import annotations

# #OBSERVACOES#
# @owner: apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/webhook.py
# @doc_ref: docs/CONSCIENCIA/RECEIPTS/2026-11-03-branches-891-funil-hud.md
# @last_updated: 2026-11-03T18:26:02.893Z
# @implementado: HTTPServer serializa ingestão SQLite na thread dona da conexão.
# @pendente: gates estaticos no HEAD vigente; nenhum teste de runtime.
# @estado: SOURCE_PATCHED; CI=UNKNOWN; RUNTIME=NOT_TESTED_BY_SCOPE
# @next_cursor: gates de source e revisoes ainda abertas no PR #1381.

import json
from http.server import BaseHTTPRequestHandler, HTTPServer

from .github_state import GitHubStateLibrary, WebhookRejected
from .centraldark_gate import validate_webhook_gate


def serve(library: GitHubStateLibrary, host: str = "127.0.0.1", port: int = 8790) -> None:
    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            if self.path != "/github/webhook":
                self.send_error(404)
                return
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length)
            gate = validate_webhook_gate(dict(self.headers.items()), body)
            if not gate.get("accepted", True):
                payload = json.dumps(gate, ensure_ascii=False).encode()
                self.send_response(422)
                self.send_header("Content-Type", "application/json")
                self.send_header("Cache-Control", "no-store")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return
            try:
                result = library.ingest(dict(self.headers.items()), body)
                status = 202
            except WebhookRejected as error:
                result = {"accepted": False, "error": str(error)}
                status = 401
            payload = json.dumps(result, ensure_ascii=False).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

        def log_message(self, *_args):
            return

    # O mesmo EventStore/SQLite pertence à thread que inicializou o servidor.
    HTTPServer((host, port), Handler).serve_forever()
