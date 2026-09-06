#!/usr/bin/env python3
"""
CentralDark Omni Router
ONE_SYSTEM_ONLY: one entrypoint, multiple replaceable engines.

The surface talks to CentralDark. Providers stay behind this router.
A missing/blocked/exhausted optional provider must not become a surface-wide error
while another allowed route is available.
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
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

APP_VERSION = "0.3.0"
DEFAULT_ENGINE = os.getenv("CENTRALDARK_DEFAULT_ENGINE", "nous").strip().lower()
ROUTER_TOKEN = os.getenv("CENTRALDARK_ROUTER_TOKEN", "").strip()
REQUEST_TIMEOUT = float(os.getenv("CENTRALDARK_ROUTER_TIMEOUT", "180"))
DEFAULT_FALLBACK_CHAIN = "nous,hermes,google,claude-code,xai,abacus,openai"

NOUS_INFERENCE_BASE_URL = os.getenv(
    "NOUS_INFERENCE_BASE_URL", "https://inference-api.nousresearch.com/v1"
).rstrip("/")

_REDACTIONS = [
    (re.compile(r"(bearer\s+)[A-Za-z0-9._~+/=-]+", re.I), r"\1[REDACTED]"),
    (re.compile(r"(sk-[A-Za-z0-9_-]{8,})"), "[API_KEY_REDACTED]"),
    (re.compile(r"(authorization[\"'\s:=]+)[^\s,\"']+", re.I), r"\1[REDACTED]"),
    (re.compile(r"([A-Z0-9_]*API_KEY[\"'\s:=]+)[^\s,\"']+", re.I), r"\1[REDACTED]"),
]

app = FastAPI(title="CentralDark Omni Router", version=APP_VERSION)
_NOUS_MODEL_CACHE: Dict[str, Any] = {"expires_at": 0.0, "model": ""}


class ChatMessage(BaseModel):
    role: str
    content: Any


class ChatRequest(BaseModel):
    model: str = "auto"
    messages: List[ChatMessage]
    stream: bool = False
    temperature: Optional[float] = None


class ResponsesRequest(BaseModel):
    model: str = "auto"
    input: Any
    stream: bool = False
    instructions: Optional[str] = None
    temperature: Optional[float] = None

    class Config:
        extra = "allow"


def env_bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() not in {"0", "false", "off", "no", ""}


def split_csv(value: str) -> List[str]:
    out: List[str] = []
    for part in (value or "").split(","):
        item = part.strip().lower()
        if item and item not in out:
            out.append(item)
    return out


def sanitize(text: Any) -> str:
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
                    parts.append(str(item.get("content") or item.get("text") or ""))
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
        if text:
            chunks.append(f"[{(msg.role or 'user').upper()}]\n{text}")
    return "\n\n---\n\n".join(chunks)


def responses_messages(request: ResponsesRequest) -> List[ChatMessage]:
    messages: List[ChatMessage] = []
    if request.instructions:
        messages.append(ChatMessage(role="system", content=request.instructions))

    raw = request.input
    if isinstance(raw, str):
        messages.append(ChatMessage(role="user", content=raw))
        return messages

    if isinstance(raw, dict):
        raw = [raw]

    if isinstance(raw, list):
        loose_text: List[str] = []
        for item in raw:
            if isinstance(item, str):
                loose_text.append(item)
                continue
            if not isinstance(item, dict):
                loose_text.append(str(item))
                continue
            role = str(item.get("role") or "user")
            item_type = str(item.get("type") or "")
            if item_type == "message" or "role" in item:
                messages.append(ChatMessage(role=role, content=item.get("content", "")))
            elif item_type in {"input_text", "text"}:
                loose_text.append(str(item.get("text") or item.get("content") or ""))
            else:
                text = message_text(item.get("content")) or str(item.get("text") or "")
                if text:
                    loose_text.append(text)
        if loose_text:
            messages.append(ChatMessage(role="user", content="\n".join(loose_text)))
        return messages

    messages.append(ChatMessage(role="user", content=json.dumps(raw, ensure_ascii=False)))
    return messages


def route_model(model: str) -> Tuple[str, str]:
    raw = (model or "auto").strip()
    if raw.lower() == "auto":
        return DEFAULT_ENGINE, ""

    for sep in ("/", ":"):
        if sep in raw:
            prefix, target = raw.split(sep, 1)
            provider = prefix.strip().lower()
            if provider == "claude":
                provider = "claude-code"
            if provider in {
                "openai", "claude-code", "hermes", "nous", "google", "xai", "abacus"
            }:
                return provider, target.strip()
    return DEFAULT_ENGINE, raw


def require_router_auth(authorization: Optional[str] = Header(default=None)) -> None:
    if not ROUTER_TOKEN:
        return
    if authorization != f"Bearer {ROUTER_TOKEN}":
        raise HTTPException(status_code=401, detail="router_auth_required")


def get_nous_token() -> str:
    direct = os.getenv("NOUS_API_KEY", "").strip()
    if direct:
        return direct
    try:
        auth_path = os.getenv("NOUS_AUTH_JSON", r"E:\CentralDark\Pivete\auth.json")
        with open(auth_path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        return str(data.get("providers", {}).get("nous", {}).get("access_token", "")).strip()
    except Exception:
        return ""


def extract_openai_text(data: Dict[str, Any]) -> str:
    output_text = data.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text.strip()
    chunks: List[str] = []
    for item in data.get("output", []) or []:
        if not isinstance(item, dict):
            continue
        for content in item.get("content", []) or []:
            if isinstance(content, dict) and content.get("type") == "output_text":
                text = content.get("text")
                if isinstance(text, str):
                    chunks.append(text)
    if chunks:
        return "\n".join(chunks).strip()
    try:
        return str(data["choices"][0]["message"]["content"]).strip()
    except (KeyError, IndexError, TypeError):
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
        if content is not None:
            return extract_cli_text(content)
    if isinstance(data, list):
        return "\n".join(filter(None, (extract_cli_text(x) for x in data))).strip()
    return ""


def discover_nous_free_model() -> str:
    configured = os.getenv("NOUS_MODEL", "").strip()
    if configured:
        return configured
    now = time.time()
    if _NOUS_MODEL_CACHE["model"] and now < float(_NOUS_MODEL_CACHE["expires_at"]):
        return str(_NOUS_MODEL_CACHE["model"])
    token = get_nous_token()
    if not token:
        return ""
    try:
        response = requests.get(
            f"{NOUS_INFERENCE_BASE_URL}/models",
            headers={"Authorization": f"Bearer {token}"},
            timeout=min(10.0, REQUEST_TIMEOUT),
        )
        if not response.ok:
            return ""
        rows = response.json().get("data", []) or []
        ids = [str(row.get("id", "")) for row in rows if isinstance(row, dict)]
        preferred = split_csv(os.getenv("CENTRALDARK_NOUS_FREE_PREFERENCE", ""))
        free_ids = [model_id for model_id in ids if model_id.lower().endswith(":free")]
        chosen = ""
        for wanted in preferred:
            chosen = next((m for m in free_ids if m.lower() == wanted), "")
            if chosen:
                break
        if not chosen and free_ids:
            chosen = free_ids[0]
        if chosen:
            _NOUS_MODEL_CACHE.update({"model": chosen, "expires_at": now + 300.0})
        return chosen
    except requests.RequestException:
        return ""


def provider_default_model(provider: str) -> str:
    if provider == "openai":
        return os.getenv("OPENAI_MODEL", "gpt-5.6").strip()
    if provider == "hermes":
        return os.getenv("HERMES_MODEL", "hermes").strip()
    if provider == "nous":
        return discover_nous_free_model()
    if provider == "google":
        return os.getenv("GOOGLE_MODEL", "gemini-2.0-flash").strip()
    if provider == "xai":
        return os.getenv("XAI_MODEL", "grok-4-fast").strip()
    if provider == "abacus":
        return os.getenv("ABACUS_MODEL", "").strip()
    return ""


def provider_configured(provider: str) -> bool:
    if provider == "openai":
        return bool(os.getenv("OPENAI_API_KEY", "").strip())
    if provider == "claude-code":
        binary = os.getenv("CLAUDE_BIN", "claude").strip()
        return bool(shutil.which(binary) or (binary and os.path.exists(binary)))
    if provider == "hermes":
        return bool(os.getenv("HERMES_BASE_URL", "").strip())
    if provider == "nous":
        return bool(get_nous_token())
    if provider == "google":
        return bool(os.getenv("GOOGLE_API_KEY", "").strip())
    if provider == "xai":
        return bool(os.getenv("XAI_API_KEY", "").strip())
    if provider == "abacus":
        return bool(os.getenv("ABACUS_API_KEY", "").strip())
    return False


def free_only_allows(provider: str, target_model: str) -> bool:
    if not env_bool("CENTRALDARK_FREE_ONLY", False):
        return True
    allow = split_csv(os.getenv("CENTRALDARK_FREE_PROVIDER_ALLOWLIST", "nous"))
    if provider not in allow:
        return False
    if provider == "nous":
        model = target_model or provider_default_model(provider)
        return bool(model and model.lower().endswith(":free"))
    return True


def candidate_routes(model: str) -> List[Tuple[str, str]]:
    primary_provider, primary_target = route_model(model)
    candidates: List[Tuple[str, str]] = [(primary_provider, primary_target)]
    if not env_bool("CENTRALDARK_AUTO_FALLBACK", True):
        return candidates
    chain = split_csv(os.getenv("CENTRALDARK_FALLBACK_CHAIN", DEFAULT_FALLBACK_CHAIN))
    for provider in chain:
        normalized = "claude-code" if provider == "claude" else provider
        if normalized not in {"openai", "claude-code", "hermes", "nous", "google", "xai", "abacus"}:
            continue
        if normalized != primary_provider:
            candidates.append((normalized, ""))
    return candidates


def _header(headers: Any, name: str) -> Optional[str]:
    value = headers.get(name)
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def build_model_touch_event(
    headers: Any,
    *,
    provider: str,
    resolved_model: str,
    duration_ms: int,
    result: str,
    error: Optional[str] = None,
    fallback_used: bool = False,
    attempt: int = 1,
) -> Dict[str, Any]:
    event: Dict[str, Any] = {
        "event": "model_touch",
        "producer": "centraldark-omni-router",
        "target": f"{provider}/{resolved_model or 'unresolved'}",
        "latency_ms": max(0, int(duration_ms)),
        "result": result.upper(),
        "seal": "🔄" if fallback_used else "🧭",
        "context": {
            "engine": provider,
            "resolved_model": resolved_model or None,
            "fallback_used": fallback_used,
            "attempt": attempt,
            "action_is_proof": False,
            "request_id": _header(headers, "x-request-id"),
            "correlation_id": _header(headers, "x-correlation-id"),
        },
    }
    for source, target in (
        ("x-mission-id", "mission_id"),
        ("x-trace-id", "trace_id"),
        ("x-writer-scope", "writer_scope"),
    ):
        value = _header(headers, source)
        if value:
            event[target] = value
    sha = _header(headers, "x-centraldark-sha") or os.getenv("CENTRALDARK_SHA", "").strip()
    if sha:
        event["sha"] = sha
    if error:
        event["context"]["error"] = sanitize(error)
    event["context"] = {k: v for k, v in event["context"].items() if v is not None}
    return event


def emit_model_touch(event: Dict[str, Any]) -> Dict[str, Any]:
    url = os.getenv("CENTRALDARK_AGENT_LOG_URL", "").strip()
    secret = os.getenv("AGENT_LOG_SECRET", "").strip()
    if not url and not secret:
        return {"configured": False, "attempted": False, "delivered": False, "status": "NOT_CONFIGURED"}
    if not url or not secret:
        return {"configured": False, "attempted": False, "delivered": False, "status": "MISCONFIGURED"}
    payload = {
        "agent": "OmniRouter",
        "area": "AI/Routing",
        "acao": "model_touch",
        "status": "sucesso" if event.get("result") == "PASS" else "erro",
        "events": [event],
    }
    try:
        response = requests.post(
            url,
            headers={"X-Agent-Secret": secret, "Content-Type": "application/json"},
            json=payload,
            timeout=max(1.0, min(5.0, REQUEST_TIMEOUT)),
        )
        return {
            "configured": True,
            "attempted": True,
            "delivered": bool(response.ok),
            "status": "DELIVERED" if response.ok else f"HTTP_{response.status_code}",
        }
    except requests.RequestException as exc:
        return {
            "configured": True,
            "attempted": True,
            "delivered": False,
            "status": "TRANSPORT_ERROR",
            "detail": sanitize(exc),
        }


def run_compatible(
    provider: str,
    base_url: str,
    api_key: str,
    messages: List[ChatMessage],
    model: str,
    wire_api: str = "chat",
) -> Tuple[str, str]:
    if not base_url:
        raise HTTPException(status_code=503, detail=f"{provider}_base_url_not_configured")
    if not api_key and provider not in {"hermes"}:
        raise HTTPException(status_code=503, detail=f"{provider}_api_key_not_configured")
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    if wire_api == "responses":
        endpoint = f"{base_url.rstrip('/')}/responses"
        payload: Dict[str, Any] = {
            "model": model,
            "input": [{"role": m.role, "content": message_text(m.content)} for m in messages],
            "stream": False,
        }
    else:
        endpoint = f"{base_url.rstrip('/')}/chat/completions"
        payload = {
            "model": model,
            "messages": [{"role": m.role, "content": message_text(m.content)} for m in messages],
            "stream": False,
        }
    try:
        response = requests.post(endpoint, headers=headers, json=payload, timeout=REQUEST_TIMEOUT)
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"{provider}_transport:{sanitize(exc)}") from exc
    if not response.ok:
        raise HTTPException(
            status_code=502,
            detail=f"{provider}_http_{response.status_code}:{sanitize(response.text)}",
        )
    try:
        data = response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=f"{provider}_invalid_json") from exc
    text = extract_openai_text(data)
    if not text:
        raise HTTPException(status_code=502, detail=f"{provider}_empty_output")
    return text, model


def run_claude_code(messages: List[ChatMessage], target_model: str) -> Tuple[str, str]:
    binary_name = os.getenv("CLAUDE_BIN", "claude").strip()
    binary = shutil.which(binary_name) or (binary_name if os.path.exists(binary_name) else None)
    if not binary:
        raise HTTPException(status_code=503, detail="claude_cli_not_found")
    cmd = [binary, "-p", flatten_messages(messages), "--output-format", "json"]
    if target_model:
        cmd.extend(["--model", target_model])
    try:
        proc = subprocess.run(
            cmd,
            cwd=os.getenv("CLAUDE_CWD", "").strip() or None,
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
        raise HTTPException(
            status_code=502,
            detail=f"claude_cli_exit_{proc.returncode}:{sanitize(proc.stderr or proc.stdout)}",
        )
    stdout = (proc.stdout or "").strip()
    if not stdout:
        raise HTTPException(status_code=502, detail="claude_cli_empty_output")
    try:
        text = extract_cli_text(json.loads(stdout)) or stdout
    except json.JSONDecodeError:
        text = stdout
    return text.strip(), target_model or "claude-code-default"


def run_provider(provider: str, messages: List[ChatMessage], target_model: str) -> Tuple[str, str]:
    model = target_model or provider_default_model(provider)
    if provider == "openai":
        return run_compatible(
            "openai",
            os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/"),
            os.getenv("OPENAI_API_KEY", "").strip(),
            messages,
            model,
        )
    if provider == "hermes":
        return run_compatible(
            "hermes",
            os.getenv("HERMES_BASE_URL", "").rstrip("/"),
            os.getenv("HERMES_AUTH_TOKEN", "").strip(),
            messages,
            model,
        )
    if provider == "nous":
        if not model:
            raise HTTPException(status_code=503, detail="nous_free_model_not_discovered")
        return run_compatible("nous", NOUS_INFERENCE_BASE_URL, get_nous_token(), messages, model)
    if provider == "xai":
        return run_compatible(
            "xai",
            os.getenv("XAI_BASE_URL", "https://api.x.ai/v1").rstrip("/"),
            os.getenv("XAI_API_KEY", "").strip(),
            messages,
            model,
        )
    if provider == "abacus":
        return run_compatible(
            "abacus",
            os.getenv("ABACUS_BASE_URL", "https://routellm.abacus.ai/v1").rstrip("/"),
            os.getenv("ABACUS_API_KEY", "").strip(),
            messages,
            model,
            os.getenv("ABACUS_WIRE_API", "responses").strip().lower(),
        )
    if provider == "google":
        key = os.getenv("GOOGLE_API_KEY", "").strip()
        base = os.getenv("GOOGLE_BASE_URL", "https://generativelanguage.googleapis.com/v1beta").rstrip("/")
        transport = os.getenv("GOOGLE_TRANSPORT", "openai_compatible").strip().lower()
        if transport == "openai_compatible":
            return run_compatible("google", f"{base}/openai", key, messages, model)
        if not key:
            raise HTTPException(status_code=503, detail="google_api_key_not_configured")
        endpoint = f"{base}/models/{model}:generateContent?key={key}"
        payload = {
            "contents": [
                {"role": m.role, "parts": [{"text": message_text(m.content)}]}
                for m in messages
            ]
        }
        try:
            response = requests.post(endpoint, json=payload, timeout=REQUEST_TIMEOUT)
        except requests.RequestException as exc:
            raise HTTPException(status_code=502, detail=f"google_transport:{sanitize(exc)}") from exc
        if not response.ok:
            raise HTTPException(status_code=502, detail=f"google_http_{response.status_code}:{sanitize(response.text)}")
        data = response.json()
        candidates = data.get("candidates") or []
        parts = candidates[0].get("content", {}).get("parts") if candidates else []
        text = "\n".join(str(p.get("text", "")) for p in parts or [] if isinstance(p, dict)).strip()
        if not text:
            raise HTTPException(status_code=502, detail="google_empty_output")
        return text, model
    if provider == "claude-code":
        return run_claude_code(messages, target_model)
    raise HTTPException(status_code=400, detail=f"unsupported_engine:{sanitize(provider)}")


def execute_with_failover(
    requested_model: str,
    messages: List[ChatMessage],
    headers: Any,
) -> Dict[str, Any]:
    if not flatten_messages(messages):
        raise HTTPException(status_code=400, detail="empty_messages")

    attempts: List[Dict[str, Any]] = []
    candidates = candidate_routes(requested_model)
    for index, (provider, target_model) in enumerate(candidates, start=1):
        resolved_target = target_model or provider_default_model(provider)
        if not provider_configured(provider):
            attempts.append({
                "provider": provider,
                "model": resolved_target or None,
                "state": "SKIPPED_NOT_CONFIGURED",
            })
            continue
        if not free_only_allows(provider, resolved_target):
            attempts.append({
                "provider": provider,
                "model": resolved_target or None,
                "state": "SKIPPED_PRICE_POLICY",
            })
            continue

        started = time.time()
        fallback_used = index > 1
        try:
            text, resolved_model = run_provider(provider, messages, target_model)
        except HTTPException as exc:
            duration_ms = round((time.time() - started) * 1000)
            detail = sanitize(exc.detail)
            attempts.append({
                "provider": provider,
                "model": resolved_target or None,
                "state": "FAIL",
                "detail": detail,
                "duration_ms": duration_ms,
            })
            emit_model_touch(build_model_touch_event(
                headers,
                provider=provider,
                resolved_model=resolved_target,
                duration_ms=duration_ms,
                result="FAIL",
                error=detail,
                fallback_used=fallback_used,
                attempt=index,
            ))
            continue

        duration_ms = round((time.time() - started) * 1000)
        event = build_model_touch_event(
            headers,
            provider=provider,
            resolved_model=resolved_model,
            duration_ms=duration_ms,
            result="PASS",
            fallback_used=fallback_used,
            attempt=index,
        )
        evidence_delivery = emit_model_touch(event)
        attempts.append({
            "provider": provider,
            "model": resolved_model,
            "state": "PASS",
            "duration_ms": duration_ms,
        })
        return {
            "text": text,
            "provider": provider,
            "resolved_model": resolved_model,
            "duration_ms": duration_ms,
            "fallback_used": fallback_used,
            "attempts": attempts,
            "event": event,
            "evidence_delivery": evidence_delivery,
        }

    raise HTTPException(
        status_code=503,
        detail={
            "error": "all_allowed_routes_failed",
            "seal": "🧿",
            "fallback_attempted": len(candidates) > 1,
            "attempts": attempts,
        },
    )


def chat_response(result: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": f"cd-{uuid.uuid4().hex[:16]}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": f"{result['provider']}/{result['resolved_model']}",
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": result["text"]},
            "finish_reason": "stop",
        }],
        "centraldark": {
            "engine": result["provider"],
            "resolved_model": result["resolved_model"],
            "duration_ms": result["duration_ms"],
            "fallback_used": result["fallback_used"],
            "attempts": result["attempts"],
            "action_is_proof": False,
            "model_touch": {
                "event": "model_touch",
                "mission_id_present": bool(result["event"].get("mission_id")),
                "trace_id_present": bool(result["event"].get("trace_id")),
                "evidence_delivery": result["evidence_delivery"],
            },
        },
    }


def responses_response(result: Dict[str, Any]) -> Dict[str, Any]:
    response_id = f"resp_{uuid.uuid4().hex}"
    message_id = f"msg_{uuid.uuid4().hex}"
    return {
        "id": response_id,
        "object": "response",
        "created_at": int(time.time()),
        "status": "completed",
        "model": f"{result['provider']}/{result['resolved_model']}",
        "output": [{
            "id": message_id,
            "type": "message",
            "status": "completed",
            "role": "assistant",
            "content": [{"type": "output_text", "text": result["text"], "annotations": []}],
        }],
        "output_text": result["text"],
        "parallel_tool_calls": True,
        "usage": {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0},
        "centraldark": {
            "engine": result["provider"],
            "resolved_model": result["resolved_model"],
            "fallback_used": result["fallback_used"],
            "attempts": result["attempts"],
            "action_is_proof": False,
        },
    }


def chat_stream(result: Dict[str, Any]):
    chunk_id = f"cd-{uuid.uuid4().hex[:16]}"
    created = int(time.time())
    for word in result["text"].split(" "):
        payload = {
            "id": chunk_id,
            "object": "chat.completion.chunk",
            "created": created,
            "model": f"{result['provider']}/{result['resolved_model']}",
            "choices": [{"index": 0, "delta": {"content": word + " "}, "finish_reason": None}],
        }
        yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"
    yield "data: [DONE]\n\n"


def responses_stream(result: Dict[str, Any]):
    response = responses_response(result)
    created = {"type": "response.created", "response": {**response, "status": "in_progress", "output": []}}
    yield f"event: response.created\ndata: {json.dumps(created, ensure_ascii=False)}\n\n"
    for word in result["text"].split(" "):
        delta = {
            "type": "response.output_text.delta",
            "item_id": response["output"][0]["id"],
            "output_index": 0,
            "content_index": 0,
            "delta": word + " ",
        }
        yield f"event: response.output_text.delta\ndata: {json.dumps(delta, ensure_ascii=False)}\n\n"
    done = {
        "type": "response.output_text.done",
        "item_id": response["output"][0]["id"],
        "output_index": 0,
        "content_index": 0,
        "text": result["text"],
    }
    yield f"event: response.output_text.done\ndata: {json.dumps(done, ensure_ascii=False)}\n\n"
    completed = {"type": "response.completed", "response": response}
    yield f"event: response.completed\ndata: {json.dumps(completed, ensure_ascii=False)}\n\n"
    yield "data: [DONE]\n\n"


@app.get("/health")
def health() -> Dict[str, Any]:
    providers = ["nous", "hermes", "google", "claude-code", "xai", "abacus", "openai"]
    return {
        "ok": True,
        "service": "centraldark-omni-router",
        "version": APP_VERSION,
        "default_engine": DEFAULT_ENGINE,
        "auto_fallback": env_bool("CENTRALDARK_AUTO_FALLBACK", True),
        "free_only": env_bool("CENTRALDARK_FREE_ONLY", False),
        "fallback_chain": split_csv(os.getenv("CENTRALDARK_FALLBACK_CHAIN", DEFAULT_FALLBACK_CHAIN)),
        "engines": {provider: {"configured": provider_configured(provider)} for provider in providers},
        "wire_apis": ["chat_completions", "responses"],
        "legacy_zendriver_chatgpt": "FROZEN_NOT_ROUTED",
    }


@app.get("/v1/models")
def models(authorization: str = Header(default=None)) -> Dict[str, Any]:
    require_router_auth(authorization)
    rows = [{"id": "auto", "object": "model", "owned_by": "centraldark"}]
    for provider in ["nous", "hermes", "google", "claude-code", "xai", "abacus", "openai"]:
        if not provider_configured(provider):
            continue
        model = provider_default_model(provider)
        rows.append({
            "id": provider if not model else f"{provider}/{model}",
            "object": "model",
            "owned_by": provider,
        })
    return {"object": "list", "data": rows}


@app.post("/v1/chat/completions")
def chat(
    request: ChatRequest,
    http_request: Request,
    authorization: str = Header(default=None),
) -> Any:
    require_router_auth(authorization)
    result = execute_with_failover(request.model, request.messages, http_request.headers)
    if request.stream:
        return StreamingResponse(chat_stream(result), media_type="text/event-stream")
    return chat_response(result)


@app.post("/v1/responses")
def responses(
    request: ResponsesRequest,
    http_request: Request,
    authorization: str = Header(default=None),
) -> Any:
    require_router_auth(authorization)
    messages = responses_messages(request)
    result = execute_with_failover(request.model, messages, http_request.headers)
    if request.stream:
        return StreamingResponse(responses_stream(result), media_type="text/event-stream")
    return responses_response(result)


def self_test() -> int:
    event = build_model_touch_event(
        {"x-mission-id": "mission-test", "x-trace-id": "trace-test"},
        provider="nous",
        resolved_model="model:free",
        duration_ms=12,
        result="PASS",
        fallback_used=True,
        attempt=2,
    )
    response_request = ResponsesRequest(
        model="auto",
        input=[{"role": "user", "content": [{"type": "input_text", "text": "oi"}]}],
    )
    checks = {
        "route_openai": route_model("openai/gpt-x") == ("openai", "gpt-x"),
        "route_xai": route_model("xai/grok-x") == ("xai", "grok-x"),
        "route_abacus": route_model("abacus/model-x") == ("abacus", "model-x"),
        "route_nous": route_model("nous/tencent/hy3:free") == ("nous", "tencent/hy3:free"),
        "responses_input": "oi" in flatten_messages(responses_messages(response_request)),
        "fallback_event": event["context"].get("fallback_used") is True and event["context"].get("attempt") == 2,
        "action_not_proof": event["context"].get("action_is_proof") is False,
        "redaction": "sekret" not in sanitize("Authorization: ***"),
        "chain_dedup": len(candidate_routes("auto")) == len(set(candidate_routes("auto"))),
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
