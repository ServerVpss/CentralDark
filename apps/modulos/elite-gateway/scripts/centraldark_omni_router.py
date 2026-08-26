#!/usr/bin/env python3
"""
CentralDark Omni Router
ONE_SYSTEM_ONLY: one local entrypoint, multiple replaceable engines.

Supported engines:
- openai      -> official OpenAI Chat Completions API
- claude-code -> local Claude Code CLI
- hermes      -> local/OpenAI-compatible Hermes endpoint
- nous        -> Nous Research inference API (Hermes models)

Legacy Zendriver->chatgpt.com transport remains frozen and is not used here.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import time
import uuid
from typing import Any, Dict, List, Optional, Tuple

import requests
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

APP_VERSION = "0.1.0"
DEFAULT_ENGINE = os.getenv("CENTRALDARK_DEFAULT_ENGINE", "claude-code").strip().lower()
ROUTER_TOKEN = os.getenv("CENTRALDARK_ROUTER_TOKEN", "").strip()
REQUEST_TIMEOUT = float(os.getenv("CENTRALDARK_ROUTER_TIMEOUT", "180"))

# OpenAI / OpenAI-compatible (OpenRouter, etc.)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com").rstrip("/")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6").strip()

# Claude Code CLI
CLAUDE_BIN = os.getenv("CLAUDE_BIN", "claude").strip()
CLAUDE_CWD = os.getenv("CLAUDE_CWD", "").strip()

# Hermes local/OpenAI-compatible endpoint
HERMES_BASE_URL = os.getenv("HERMES_BASE_URL", "").rstrip("/")
HERMES_AUTH_TOKEN = os.getenv("HERMES_AUTH_TOKEN", "").strip()
HERMES_MODEL = os.getenv("HERMES_MODEL", "hermes").strip()

# Nous Research (Hermes) - read from auth.json dynamically
NOUS_INFERENCE_BASE_URL = "https://inference-api.nousresearch.com/v1"
NOUS_MODEL = os.getenv("NOUS_MODEL", "tencent/hy3:free").strip()

_REDACTIONS = [
    (re.compile(r"(bearer\s+)[A-Za-z0-9._~+/=-]+", re.I), r"\1[REDACTED]"),
    (re.compile(r"(sk-[A-Za-z0-9_-]{8,})"), "[OPENAI_KEY_REDACTED]"),
    (re.compile(r"(authorization[\"'\s:=]+)[^\s,\"']+", re.I), r"\1[REDACTED]"),
]

app = FastAPI(title="CentralDark Omni Router", version=APP_VERSION)


class ChatMessage(BaseModel):
    role: str
    content: Any


class ChatRequest(BaseModel):
    model: str = "auto"
    messages: List[ChatMessage]
    stream: bool = False
    temperature: Optional[float] = None


def sanitize(text: str) -> str:
    out = str(text)
    for pattern, replacement in _REDACTIONS:
        out = pattern.sub(replacement, out)
    return out[:2000]


def message_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: List[str] = []
        for item in content:
            if isinstance(item, dict):
                if isinstance(item.get("text"), str):
                    parts.append(item["text"])
                elif item.get("type") in {"input_text", "output_text", "text"}:
                    parts.append(str(item.get("content", "")))
            elif isinstance(item, str):
                parts.append(item)
        return "\n".join(p for p in parts if p)
    if content is None:
        return ""
    return str(content)


def flatten_messages(messages: List[ChatMessage]) -> str:
    chunks: List[str] = []
    for msg in messages:
        text = message_text(msg.content).strip()
        if not text:
            continue
        role = (msg.role or "user").upper()
        chunks.append(f"[{role}]\n{text}")
    return "\n\n---\n\n".join(chunks)


def route_model(model: str) -> Tuple[str, str]:
    raw = (model or "auto").strip()
    if raw.lower() == "auto":
        return DEFAULT_ENGINE, ""

    for sep in ("/", ":"):
        if sep in raw:
            prefix, target = raw.split(sep, 1)
            p = prefix.strip().lower()
            if p in {"openai", "claude", "claude-code", "hermes", "nous"}:
                if p == "claude":
                    p = "claude-code"
                return p, target.strip()

    return DEFAULT_ENGINE, raw


def get_nous_token() -> str:
    """Read Nous access token from auth.json dynamically."""
    try:
        auth_path = r"E:\CentralDark\Pivete\auth.json"
        with open(auth_path, "r") as f:
            data = json.load(f)
        nous = data.get("providers", {}).get("nous", {})
        return nous.get("access_token", "").strip()
    except Exception:
        return ""


def require_router_auth(authorization: Optional[str] = Header(default=None)) -> None:
    if not ROUTER_TOKEN:
        return
    expected = f"Bearer {ROUTER_TOKEN}"
    if authorization != expected:
        raise HTTPException(status_code=401, detail="router_auth_required")


def extract_openai_text(data: Dict[str, Any]) -> str:
    # Try Responses API format first (OpenAI official)
    chunks: List[str] = []
    for item in data.get("output", []) or []:
        if not isinstance(item, dict):
            continue
        for content in item.get("content", []) or []:
            if not isinstance(content, dict):
                continue
            if content.get("type") == "output_text" and isinstance(content.get("text"), str):
                chunks.append(content["text"])
    if chunks:
        return "\n".join(chunks).strip()

    # Try Chat Completions format (OpenAI, OpenRouter, compatible)
    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError):
        pass

    return ""


def extract_cli_text(data: Any) -> str:
    if isinstance(data, str):
        return data
    if isinstance(data, dict):
        for key in ("result", "output_text", "text", "message"):
            value = data.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
        content = data.get("content")
        if isinstance(content, list):
            parts = [extract_cli_text(x) for x in content]
            return "\n".join(p for p in parts if p).strip()
        if isinstance(content, dict):
            return extract_cli_text(content)
    if isinstance(data, list):
        parts = [extract_cli_text(x) for x in data]
        return "\n".join(p for p in parts if p).strip()
    return ""


def run_openai(prompt: str, target_model: str) -> Tuple[str, str]:
    # Read env vars dynamically at request time
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    openai_base = os.getenv("OPENAI_BASE_URL", "https://api.openai.com").rstrip("/")
    openai_model = os.getenv("OPENAI_MODEL", "gpt-5.6").strip()

    if not openai_key:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY_not_configured")

    model = target_model or openai_model
    # Use Chat Completions API (compatible with OpenAI, OpenRouter, and OpenAI-compatible endpoints)
    payload: Dict[str, Any] = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
    }

    try:
        response = requests.post(
            f"{openai_base}/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=REQUEST_TIMEOUT,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"openai_transport:{sanitize(exc)}") from exc

    if not response.ok:
        raise HTTPException(
            status_code=502,
            detail=f"openai_http_{response.status_code}:{sanitize(response.text)}",
        )

    data = response.json()
    text = extract_openai_text(data)
    if not text:
        raise HTTPException(status_code=502, detail="openai_empty_output")
    return text, model


def run_claude_code(prompt: str, target_model: str) -> Tuple[str, str]:
    binary = shutil.which(CLAUDE_BIN) or (CLAUDE_BIN if os.path.exists(CLAUDE_BIN) else None)
    if not binary:
        raise HTTPException(status_code=503, detail="claude_cli_not_found")

    cmd = [binary, "-p", prompt, "--output-format", "json"]
    if target_model:
        cmd.extend(["--model", target_model])

    try:
        proc = subprocess.run(
            cmd,
            cwd=CLAUDE_CWD or None,
            capture_output=True,
            text=True,
            timeout=REQUEST_TIMEOUT,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise HTTPException(status_code=504, detail="claude_cli_timeout") from exc
    except OSError as exc:
        raise HTTPException(status_code=502, detail=f"claude_cli_start:{sanitize(exc)}") from exc

    if proc.returncode != 0:
        err = sanitize(proc.stderr or proc.stdout)
        raise HTTPException(status_code=502, detail=f"claude_cli_exit_{proc.returncode}:{err}")

    stdout = (proc.stdout or "").strip()
    if not stdout:
        raise HTTPException(status_code=502, detail="claude_cli_empty_output")

    try:
        parsed = json.loads(stdout)
        text = extract_cli_text(parsed) or stdout
    except json.JSONDecodeError:
        text = stdout

    return text.strip(), target_model or "claude-code-default"


def run_hermes(messages: List[ChatMessage], target_model: str) -> Tuple[str, str]:
    # Read env vars dynamically at request time
    hermes_base = os.getenv("HERMES_BASE_URL", "").rstrip("/")
    hermes_token = os.getenv("HERMES_AUTH_TOKEN", "").strip()
    hermes_model = os.getenv("HERMES_MODEL", "hermes").strip()

    if not hermes_base:
        raise HTTPException(status_code=503, detail="HERMES_BASE_URL_not_configured")

    model = target_model or hermes_model
    headers = {"Content-Type": "application/json"}
    if hermes_token:
        headers["Authorization"] = f"Bearer {hermes_token}"

    payload = {
        "model": model,
        "messages": [
            {"role": m.role, "content": message_text(m.content)}
            for m in messages
        ],
        "stream": False,
    }

    try:
        response = requests.post(
            f"{hermes_base}/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=REQUEST_TIMEOUT,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"hermes_transport:{sanitize(exc)}") from exc

    if not response.ok:
        raise HTTPException(
            status_code=502,
            detail=f"hermes_http_{response.status_code}:{sanitize(response.text)}",
        )

    data = response.json()
    try:
        text = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="hermes_invalid_response") from exc

    if not isinstance(text, str) or not text.strip():
        raise HTTPException(status_code=502, detail="hermes_empty_output")
    return text.strip(), model


def run_nous(messages: List[ChatMessage], target_model: str) -> Tuple[str, str]:
    # Read Nous token from auth.json dynamically
    nous_token = get_nous_token()
    if not nous_token:
        raise HTTPException(status_code=503, detail="NOUS_TOKEN_not_configured")

    model = target_model or NOUS_MODEL
    headers = {
        "Authorization": f"Bearer {nous_token}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "messages": [
            {"role": m.role, "content": message_text(m.content)}
            for m in messages
        ],
        "stream": False,
    }

    try:
        response = requests.post(
            f"{NOUS_INFERENCE_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=REQUEST_TIMEOUT,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"nous_transport:{sanitize(exc)}") from exc

    if not response.ok:
        raise HTTPException(
            status_code=502,
            detail=f"nous_http_{response.status_code}:{sanitize(response.text)}",
        )

    data = response.json()
    try:
        text = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="nous_invalid_response") from exc

    if not isinstance(text, str) or not text.strip():
        raise HTTPException(status_code=502, detail="nous_empty_output")
    return text.strip(), model


@app.get("/health")
def health() -> Dict[str, Any]:
    claude_path = shutil.which(CLAUDE_BIN) or (CLAUDE_BIN if os.path.exists(CLAUDE_BIN) else None)
    # Read env vars dynamically at request time
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    hermes_url = os.getenv("HERMES_BASE_URL", "").rstrip("/")
    # Check Nous token from auth.json
    nous_token = get_nous_token()
    return {
        "ok": True,
        "service": "centraldark-omni-router",
        "version": APP_VERSION,
        "default_engine": DEFAULT_ENGINE,
        "engines": {
            "openai": {"configured": bool(openai_key), "transport": "official_api"},
            "claude-code": {"configured": bool(claude_path), "transport": "local_cli"},
            "hermes": {"configured": bool(hermes_url), "transport": "openai_compatible_http"},
            "nous": {"configured": bool(nous_token), "transport": "nous_inference_api"},
        },
        "legacy_zendriver_chatgpt": "FROZEN_NOT_ROUTED",
    }


@app.get("/v1/models")
def models(authorization: str = Header(default=None)) -> Dict[str, Any]:
    require_router_auth(authorization)
    # Read env vars dynamically at request time
    openai_model = os.getenv("OPENAI_MODEL", "gpt-5.6").strip()
    hermes_model = os.getenv("HERMES_MODEL", "hermes").strip()
    nous_model = os.getenv("NOUS_MODEL", "tencent/hy3:free").strip()
    return {
        "object": "list",
        "data": [
            {"id": "auto", "object": "model", "owned_by": "centraldark"},
            {"id": f"openai/{openai_model}", "object": "model", "owned_by": "openai"},
            {"id": "claude-code", "object": "model", "owned_by": "local-cli"},
            {"id": f"hermes/{hermes_model}", "object": "model", "owned_by": "local-runtime"},
            {"id": f"nous/{nous_model}", "object": "model", "owned_by": "nous-research"},
        ],
    }


@app.post("/v1/chat/completions")
def chat(
    request: ChatRequest,
    authorization: str = Header(default=None),
) -> Dict[str, Any]:
    require_router_auth(authorization)

    if request.stream:
        raise HTTPException(status_code=400, detail="stream_not_implemented_yet")

    provider, target_model = route_model(request.model)
    prompt = flatten_messages(request.messages)
    if not prompt:
        raise HTTPException(status_code=400, detail="empty_messages")

    started = time.time()
    if provider == "openai":
        text, resolved_model = run_openai(prompt, target_model)
    elif provider == "claude-code":
        text, resolved_model = run_claude_code(prompt, target_model)
    elif provider == "hermes":
        text, resolved_model = run_hermes(request.messages, target_model)
    elif provider == "nous":
        text, resolved_model = run_nous(request.messages, target_model)
    else:
        raise HTTPException(status_code=400, detail=f"unsupported_engine:{sanitize(provider)}")

    return {
        "id": f"cd-{uuid.uuid4().hex[:16]}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": f"{provider}/{resolved_model}",
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": text},
                "finish_reason": "stop",
            }
        ],
        "centraldark": {
            "engine": provider,
            "resolved_model": resolved_model,
            "duration_ms": round((time.time() - started) * 1000),
            "fallback_used": False,
            "action_is_proof": False,
        },
    }


def self_test() -> int:
    checks = {
        "route_openai": route_model("openai/gpt-x") == ("openai", "gpt-x"),
        "route_claude": route_model("claude:opus") == ("claude-code", "opus"),
        "route_nous": route_model("nous/tencent/hy3:free") == ("nous", "tencent/hy3:free"),
        "redaction": "sekret" not in sanitize("Authorization: ***"),
        "flatten": "[USER]" in flatten_messages([ChatMessage(role="user", content="oi")]),
        "openai_extract": extract_openai_text(
            {"output": [{"content": [{"type": "output_text", "text": "ok"}]}]}
        ) == "ok",
        "cli_extract": extract_cli_text({"result": "ok"}) == "ok",
    }
    failed = [name for name, ok in checks.items() if not ok]
    print(json.dumps({"ok": not failed, "checks": checks, "failed": failed}, ensure_ascii=False))
    return 1 if failed else 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--host", default=os.getenv("CENTRALDARK_ROUTER_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.getenv("CENTRALDARK_ROUTER_PORT", "8099")))
    args = parser.parse_args()

    if args.self_test:
        raise SystemExit(self_test())

    import uvicorn

    uvicorn.run(app, host=args.host, port=args.port)