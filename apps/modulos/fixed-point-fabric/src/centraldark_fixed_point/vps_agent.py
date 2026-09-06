from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import os
import platform
import shutil
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


def payload(secret: str | None) -> dict:
    unsigned = {
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
