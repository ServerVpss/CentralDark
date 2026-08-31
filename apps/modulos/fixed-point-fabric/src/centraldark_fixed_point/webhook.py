from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from .github_state import GitHubStateLibrary, WebhookRejected


def serve(library: GitHubStateLibrary, host: str = "127.0.0.1", port: int = 8790) -> None:
    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            if self.path != "/github/webhook":
                self.send_error(404)
                return
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length)
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

    ThreadingHTTPServer((host, port), Handler).serve_forever()

