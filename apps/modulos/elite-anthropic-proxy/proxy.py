#!/usr/bin/env python3
"""
CentralDark Elite Anthropic Proxy v1.0
Porta 8081 | Rotação de keys | Camouflage via claude.ap7.site
"""
import asyncio
import json
import time
import logging
import logging.handlers
from itertools import cycle
from pathlib import Path

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, Response

# ── Config ────────────────────────────────────────────────────────────────────
UPSTREAM   = "https://claude.ap7.site"
KEYS_FILE  = Path(__file__).parent / "keys.json"
LOG_FILE   = Path("/var/log/centralldark/elite-anthropic.log")
VERSION    = "1.0.0"
PORT       = 8082

# ── Logging ───────────────────────────────────────────────────────────────────
LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

_handler_file = logging.handlers.RotatingFileHandler(
    LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
)
_handler_stdout = logging.StreamHandler()
for h in (_handler_file, _handler_stdout):
    h.setFormatter(logging.Formatter("%(message)s"))

log = logging.getLogger("elite-anthropic")
log.setLevel(logging.INFO)
log.addHandler(_handler_file)
log.addHandler(_handler_stdout)


def _log(level: str, event: str, **kw):
    record = {"ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "level": level, "event": event, **kw}
    line = json.dumps(record, ensure_ascii=False)
    if level == "ERROR":
        log.error(line)
    else:
        log.info(line)


# ── Key rotation ──────────────────────────────────────────────────────────────
def load_keys() -> list[str]:
    if not KEYS_FILE.exists():
        raise RuntimeError(f"keys.json não encontrado: {KEYS_FILE}")
    data = json.loads(KEYS_FILE.read_text())
    keys = [k.strip() for k in data.get("keys", []) if k and k.strip().startswith("sk-")]
    if not keys:
        raise RuntimeError("Nenhuma key Anthropic válida em keys.json")
    return keys


KEYS = load_keys()
_key_iter = cycle(enumerate(KEYS))
_rotation_lock = asyncio.Lock()

_log("INFO", "proxy_start", version=VERSION, upstream=UPSTREAM, keys=len(KEYS), port=PORT)


async def next_key() -> tuple[int, str]:
    async with _rotation_lock:
        return next(_key_iter)


# ── FastAPI ───────────────────────────────────────────────────────────────────
app = FastAPI(title="CentralDark Elite Anthropic Proxy", version=VERSION)

# Headers que não devem ser repassados ao upstream
_HOP_BY_HOP = {
    "host", "x-api-key", "authorization", "content-length",
    "transfer-encoding", "connection", "keep-alive", "upgrade",
}


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "elite-anthropic-proxy",
        "version": VERSION,
        "upstream": UPSTREAM,
        "keys_count": len(KEYS),
    }


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"])
async def proxy(request: Request, path: str):
    idx, key = await next_key()

    upstream_url = f"{UPSTREAM}/{path}"
    if request.url.query:
        upstream_url += f"?{request.url.query}"

    # Monta headers com key rotacionada
    headers = {k: v for k, v in request.headers.items() if k.lower() not in _HOP_BY_HOP}
    headers["x-api-key"] = key
    headers.setdefault("anthropic-version", "2023-06-01")
    headers.setdefault("anthropic-beta", "output-128k-2025-02-19")

    body = await request.body()

    # Detecta streaming
    is_stream = False
    if body:
        try:
            is_stream = bool(json.loads(body).get("stream", False))
        except Exception:
            pass

    t0 = time.time()
    _log("INFO", "request", method=request.method, path=path, stream=is_stream, key_idx=idx)

    proxy_headers = {
        "X-Proxy": f"CentralDark-EliteAnthropicProxy/{VERSION}",
        "X-Key-Index": str(idx),
    }

    if is_stream:
        async def stream_gen():
            try:
                async with httpx.AsyncClient(timeout=httpx.Timeout(5, read=120)) as client:
                    async with client.stream(
                        request.method, upstream_url,
                        headers=headers, content=body,
                    ) as resp:
                        async for chunk in resp.aiter_bytes(chunk_size=None):
                            if chunk:
                                yield chunk
                _log("INFO", "stream_done", elapsed=round(time.time() - t0, 2), key_idx=idx)
            except Exception as e:
                _log("ERROR", "stream_error", error=str(e), key_idx=idx)
                yield b"data: [DONE]\n\n"

        return StreamingResponse(
            stream_gen(),
            media_type="text/event-stream",
            headers={**proxy_headers, "Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.request(
                request.method, upstream_url,
                headers=headers, content=body,
            )
        _log("INFO", "done", status=resp.status_code, elapsed=round(time.time() - t0, 2), key_idx=idx)
        return Response(
            content=resp.content,
            status_code=resp.status_code,
            media_type=resp.headers.get("content-type", "application/json"),
            headers=proxy_headers,
        )
    except Exception as e:
        _log("ERROR", "request_error", error=str(e), key_idx=idx)
        return Response(
            content=json.dumps({"error": {"message": str(e), "type": "proxy_error"}}).encode(),
            status_code=502,
            media_type="application/json",
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("proxy:app", host="0.0.0.0", port=PORT, log_level="warning")
