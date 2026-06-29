#!/usr/bin/env python3
"""
CentralDark Elite Anthropic Proxy v1.6
OpenAI Compatible + Anthropic nativo + Aliases + streaming fix + response conversion
"""
import asyncio
import json
import time
import logging
import logging.handlers
from itertools import cycle
from pathlib import Path
from datetime import datetime

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, Response, JSONResponse

UPSTREAM = "https://claude.ap7.site"
KEYS_FILE = Path(__file__).parent / "keys.json"
LOG_FILE = Path("/var/log/centralldark/elite-anthropic.log")
VERSION = "1.6.0"
PORT = 8082

MODEL_ALIASES = {
    "bear": "sonnet-4.6",
    "sonnet": "sonnet-4.6",
    "opus": "opus-4.8",
    "haiku": "haiku-4.6",
}

SUPPORTED_MODELS = ["sonnet-4.6", "sonnet-4.6[1m]", "opus-4.8", "opus-4.8[1m]", "haiku-4.6", "haiku-4.6[1m]"]

def resolve_model(model: str) -> str:
    if not model:
        return model
    return MODEL_ALIASES.get(str(model).lower().strip(), model)

# Logging
LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
_handler_file = logging.handlers.RotatingFileHandler(LOG_FILE, maxBytes=5*1024*1024, backupCount=3, encoding="utf-8")
_handler_stdout = logging.StreamHandler()
for h in (_handler_file, _handler_stdout):
    h.setFormatter(logging.Formatter("%(message)s"))
log = logging.getLogger("elite-anthropic")
log.setLevel(logging.DEBUG)
log.addHandler(_handler_file)
log.addHandler(_handler_stdout)

def _log(level: str, event: str, **kw):
    record = {"ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "level": level, "event": event, **kw}
    line = json.dumps(record, ensure_ascii=False)
    (log.error if level == "ERROR" else log.info)(line)

def load_keys():
    data = json.loads(KEYS_FILE.read_text())
    keys = [k.strip() for k in data.get("keys", []) if k.strip().startswith("sk-")]
    if not keys:
        raise RuntimeError("Nenhuma key válida em keys.json")
    return keys

KEYS = load_keys()
_key_iter = cycle(enumerate(KEYS))
_rotation_lock = asyncio.Lock()

_log("INFO", "proxy_start", version=VERSION, keys=len(KEYS))

async def next_key():
    async with _rotation_lock:
        return next(_key_iter)

def openai_to_anthropic(body: dict) -> dict:
    model = resolve_model(body.get("model", ""))
    anth = {
        "model": model,
        "max_tokens": body.get("max_tokens", 4096),
        "stream": body.get("stream", False),
        "messages": []
    }
    system = None
    for m in body.get("messages", []):
        if m.get("role") == "system":
            system = m.get("content", "")
        else:
            anth["messages"].append({
                "role": m.get("role", "user"),
                "content": m.get("content", "")
            })
    if system:
        anth["system"] = system
    return anth

def anthropic_to_openai(anth: dict, orig_model: str = "") -> dict:
    text = ""
    for block in anth.get("content", []):
        if block.get("type") == "text":
            text += block.get("text", "")
    usage = anth.get("usage", {})
    stop_reason = anth.get("stop_reason", "end_turn")
    finish_reason = "stop" if stop_reason in ("end_turn", "stop_sequence") else stop_reason
    return {
        "id": anth.get("id", f"chatcmpl-{int(time.time())}"),
        "object": "chat.completion",
        "created": int(time.time()),
        "model": orig_model or anth.get("model", ""),
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": text},
            "finish_reason": finish_reason,
        }],
        "usage": {
            "prompt_tokens": usage.get("input_tokens", 0),
            "completion_tokens": usage.get("output_tokens", 0),
            "total_tokens": usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
        },
    }

async def anthropic_stream_to_openai(byte_iter, chat_id: str, model: str):
    """Converte Anthropic SSE → OpenAI SSE chunk a chunk."""
    buffer = b""
    async for chunk in byte_iter:
        buffer += chunk
        while b"\n\n" in buffer:
            event_bytes, buffer = buffer.split(b"\n\n", 1)
            lines = event_bytes.decode("utf-8", errors="replace").strip().split("\n")
            data_line = next((l[6:] for l in lines if l.startswith("data: ")), None)
            if not data_line or data_line == "[DONE]":
                continue
            try:
                ev = json.loads(data_line)
            except Exception:
                continue

            ev_type = ev.get("type", "")

            if ev_type == "content_block_delta":
                delta = ev.get("delta", {})
                if delta.get("type") == "text_delta":
                    oai_chunk = {
                        "id": chat_id,
                        "object": "chat.completion.chunk",
                        "created": int(time.time()),
                        "model": model,
                        "choices": [{"index": 0, "delta": {"content": delta.get("text", "")}, "finish_reason": None}],
                    }
                    yield f"data: {json.dumps(oai_chunk)}\n\n".encode()

            elif ev_type == "message_delta":
                stop_reason = ev.get("delta", {}).get("stop_reason", "end_turn")
                finish_reason = "stop" if stop_reason in ("end_turn", "stop_sequence") else stop_reason
                oai_chunk = {
                    "id": chat_id,
                    "object": "chat.completion.chunk",
                    "created": int(time.time()),
                    "model": model,
                    "choices": [{"index": 0, "delta": {}, "finish_reason": finish_reason}],
                }
                yield f"data: {json.dumps(oai_chunk)}\n\n".encode()

            elif ev_type == "message_stop":
                yield b"data: [DONE]\n\n"

app = FastAPI(title="CentralDark Elite Anthropic Proxy", version=VERSION)

_HOP_BY_HOP = {"host", "x-api-key", "authorization", "content-length", "transfer-encoding", "connection", "keep-alive", "upgrade"}

@app.get("/health")
async def health():
    return {"status": "ok", "version": VERSION, "aliases": list(MODEL_ALIASES.keys())}

@app.get("/v1/models")
@app.get("/models")
async def list_models():
    created = int(datetime(2025, 2, 19).timestamp())
    data = [{"id": m, "object": "model", "created": created, "owned_by": "anthropic"} for m in SUPPORTED_MODELS]
    return JSONResponse({"object": "list", "data": data})

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"])
async def proxy(request: Request, path: str):
    idx, key = await next_key()
    body_bytes = await request.body()

    is_openai = "chat/completions" in path.lower()
    upstream_path = "v1/messages" if is_openai else path
    upstream_url = f"{UPSTREAM}/{upstream_path}"
    if request.url.query:
        upstream_url += f"?{request.url.query}"

    headers = {k: v for k, v in request.headers.items() if k.lower() not in _HOP_BY_HOP}
    headers["x-api-key"] = key
    headers.setdefault("anthropic-version", "2023-06-01")

    orig_model = ""
    is_stream = False
    final_body = body_bytes

    if is_openai and body_bytes:
        try:
            openai_body = json.loads(body_bytes.decode("utf-8"))
            orig_model = openai_body.get("model", "")
            is_stream = bool(openai_body.get("stream", False))
            anth_body = openai_to_anthropic(openai_body)
            final_body = json.dumps(anth_body).encode("utf-8")
            _log("INFO", "openai_converted", original=orig_model, resolved=anth_body["model"], stream=is_stream)
        except Exception as e:
            _log("ERROR", "conversion_error", error=str(e))

    t0 = time.time()
    _log("INFO", "request", method=request.method, path=path, key_idx=idx)

    try:
        if is_openai and is_stream:
            chat_id = f"chatcmpl-{int(time.time())}"
            resolved_model = resolve_model(orig_model)

            async def stream_gen():
                client = httpx.AsyncClient(timeout=httpx.Timeout(5, read=180))
                try:
                    async with client.stream(request.method, upstream_url, headers=headers, content=final_body) as resp:
                        async for oai_chunk in anthropic_stream_to_openai(resp.aiter_bytes(), chat_id, resolved_model):
                            yield oai_chunk
                except Exception as e:
                    _log("ERROR", "stream_error", error=str(e), key_idx=idx)
                    yield b'data: {"error": "stream failed"}\n\n'
                finally:
                    await client.aclose()
                _log("INFO", "stream_done", elapsed=round(time.time() - t0, 2), key_idx=idx)

            return StreamingResponse(stream_gen(), media_type="text/event-stream")

        else:
            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.request(request.method, upstream_url, headers=headers, content=final_body)
            _log("INFO", "done", status=resp.status_code, elapsed=round(time.time() - t0, 2), key_idx=idx)

            if is_openai and resp.status_code == 200:
                try:
                    anth_resp = json.loads(resp.content)
                    resolved_model = resolve_model(orig_model)
                    oai_resp = anthropic_to_openai(anth_resp, resolved_model)
                    return JSONResponse(content=oai_resp, status_code=200)
                except Exception as e:
                    _log("ERROR", "response_conversion_error", error=str(e), key_idx=idx)

            return Response(content=resp.content, status_code=resp.status_code, media_type=resp.headers.get("content-type", "application/json"))

    except Exception as e:
        _log("ERROR", "request_error", error=str(e), key_idx=idx)
        return Response(content=json.dumps({"error": str(e)}).encode(), status_code=502, media_type="application/json")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("proxy:app", host="0.0.0.0", port=PORT, log_level="warning")
