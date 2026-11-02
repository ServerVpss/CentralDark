"""Hermes Visual Computer Use bridge: one bounded child per authorized session.
#OBSERVACOES# @owner=centraldark-hermes-visual-computer-use @doc_ref=../references/technical.md
No mouse injection. Existing Hermes computer_use owns all input.
"""
from __future__ import annotations
import atexit, base64, json, os, queue, subprocess, sys, threading
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
EXE = ROOT / "runtime" / "HermesVisual.exe"
CONFIG = ROOT / "default.json"
_hosts = {}
_lock = threading.RLock()

class VisualHost:
    def __init__(self):
        if os.name != "nt" or not EXE.is_file():
            raise RuntimeError("WINDOWS_VISUAL_RUNTIME_NOT_BUILT")
        self.lock = threading.RLock()
        self.responses = queue.Queue()
        self.process = subprocess.Popen(
            [str(EXE), "--config", str(CONFIG)], stdin=subprocess.PIPE,
            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, encoding="utf-8",
            creationflags=subprocess.CREATE_NO_WINDOW)
        def reader():
            for line in self.process.stdout:
                self.responses.put(line)
            self.responses.put(None)
        threading.Thread(target=reader, daemon=True).start()

    def call(self, payload):
        with self.lock:
            if self.process.poll() is not None:
                raise RuntimeError("VISUAL_HOST_EXITED")
            self.process.stdin.write(json.dumps(payload) + "\n")
            self.process.stdin.flush()
            try:
                line = self.responses.get(timeout=20)
            except queue.Empty:
                self.close()
                raise TimeoutError("VISUAL_CAPTURE_TIMEOUT")
            if line is None:
                raise RuntimeError("VISUAL_HOST_CLOSED")
            return json.loads(line)

    def close(self):
        try:
            if self.process.poll() is None:
                self.process.stdin.close()
                self.process.wait(timeout=4)
        except (OSError, subprocess.TimeoutExpired):
            self.process.kill()
            self.process.wait(timeout=3)

def request(operation, args=None, session="default"):
    payload = dict(args or {})
    payload["operation"] = operation
    with _lock:
        host = _hosts.get(session)
        if host is None:
            if len(_hosts) >= 8:
                raise RuntimeError("VISUAL_SESSION_LIMIT")
            host = _hosts[session] = VisualHost()
    return host.call(payload)

def close_session(session):
    with _lock:
        host = _hosts.pop(session, None)
    if host:
        host.close()

def close_all():
    with _lock:
        sessions = list(_hosts)
    for session in sessions:
        close_session(session)

def tool(operation, args, **context):
    session = str(context.get("session_id") or context.get("task_id") or "default")
    try:
        if operation == "capture_monitor" and args.get("authorized") is not True:
            return json.dumps({"ok": False, "error": "EXPLICIT_CAPTURE_AUTHORIZATION_REQUIRED"})
        result = request(operation, args, session)
        if operation != "capture_monitor" or not result.get("ok"):
            return json.dumps(result)
        path = Path(result["result"]["image"]["path"])
        if path.stat().st_size > 32 * 1024 * 1024:
            raise RuntimeError("CAPTURE_TOO_LARGE")
        encoded = base64.b64encode(path.read_bytes()).decode("ascii")
        # Caller-specified output is an explicit retention request; otherwise delete immediately.
        if not args.get("output"):
            path.unlink()
            result["result"]["image"]["path"] = None
            result["result"]["image"]["retention"] = "deleted_after_encoding"
        summary = json.dumps(result)
        return {"_multimodal": True, "text_summary": summary,
                "content": [{"type": "text", "text": summary},
                            {"type": "image_url", "image_url": {"url": "data:image/png;base64,"+encoded}}]}
    except Exception as exc:
        close_session(session)
        return json.dumps({"ok": False, "error": type(exc).__name__, "message": str(exc)})

atexit.register(close_all)
if __name__ == "__main__":
    try:
        arg = json.loads(sys.argv[1]) if len(sys.argv)>1 else {"operation":"list_monitors"}
        print(json.dumps(request(arg.pop("operation"), arg)))
    finally:
        close_all()
