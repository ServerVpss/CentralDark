from __future__ import annotations

import html
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


def _page(state: dict) -> bytes:
    verdict = state.get("last_verdict") or {}
    reached = verdict.get("reached", False)
    color = "#35d07f" if reached else "#ffb020"
    blockers = "".join(f"<li>{html.escape(str(item))}</li>" for item in verdict.get("blockers", [])) or "<li>nenhum</li>"
    return f"""<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'><meta http-equiv='refresh' content='10'>
<meta name='viewport' content='width=device-width'><title>CentralDark Fixed Point</title>
<style>body{{font:16px system-ui;background:#090b10;color:#eee;max-width:900px;margin:3rem auto;padding:1rem}}.card{{background:#111722;border:1px solid #283243;border-radius:14px;padding:1.4rem}}h1{{color:{color}}}code{{color:#8bd5ff}}li{{margin:.35rem}}</style></head>
<body><div class='card'><h1>{html.escape(verdict.get('verdict','SEM MEDIÇÃO'))}</h1><p>!CENTRALDARK · #ACORDAR · !CALIBRAR</p>
<p>Snapshot: <code>{html.escape(verdict.get('snapshot_id','—'))}</code></p><p>Amostras: {verdict.get('stable_samples',0)}/{verdict.get('required_samples',0)}</p>
<h2>Bloqueios</h2><ul>{blockers}</ul><p>Atualização automática em 10s.</p></div></body></html>""".encode()


def serve(store, host: str, port: int) -> None:
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            state = {"last_verdict": store.get_state("last_verdict")}
            if self.path in ("/health", "/api/status"):
                body = json.dumps(state, ensure_ascii=False).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
            else:
                body = _page(state)
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, *_args):
            return

    ThreadingHTTPServer((host, port), Handler).serve_forever()

