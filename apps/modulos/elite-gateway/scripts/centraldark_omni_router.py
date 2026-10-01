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
import glob
import hashlib
import json
import os
from datetime import datetime, timezone
import re
import shutil
import sqlite3
import subprocess
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import requests
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

APP_VERSION = "0.3.1"
ENGINE_PROVIDERS = frozenset({"antigravity", "openai", "claude-code", "nous", "google", "xai", "abacus", "zendrive-chatgpt-local"})
hermes_is_agent_runtime_not_engine = True
DEFAULT_ENGINE = os.getenv("CENTRALDARK_DEFAULT_ENGINE", "nous").strip().lower()
default_engine_config_valid = DEFAULT_ENGINE in ENGINE_PROVIDERS
if not default_engine_config_valid:
    DEFAULT_ENGINE = "nous"
ROUTER_TOKEN = os.getenv("CENTRALDARK_ROUTER_TOKEN", "").strip()
REQUEST_TIMEOUT = float(os.getenv("CENTRALDARK_ROUTER_TIMEOUT", "180"))
DEFAULT_FALLBACK_CHAIN = "nous,google,claude-code,xai,abacus,openai"
CENTRAL_LOG_ROOT = Path(os.getenv("CENTRALDARK_LOG_ROOT", "/root/CentralDark/logs"))
HERMES_HEALTH_WINDOW_MINUTES = int(os.getenv("CENTRALDARK_HERMES_HEALTH_WINDOW_MINUTES", "30"))
HERMES_HEALTH_MIN_SAMPLE = int(os.getenv("CENTRALDARK_HERMES_HEALTH_MIN_SAMPLE", "5"))
HERMES_FAILURE_RATE_MAX = float(os.getenv("CENTRALDARK_HERMES_FAILURE_RATE_MAX", "0.25"))
HERMES_P95_MAX_MS = int(os.getenv("CENTRALDARK_HERMES_P95_MAX_MS", "180000"))
ANTIGRAVITY_AGENTAPI = os.getenv(
    "ANTIGRAVITY_AGENTAPI",
    "/root/snap/antigravity-cli/common/.gemini/antigravity-cli/bin/agentapi",
).strip()
ANTIGRAVITY_CONVERSATIONS = Path(os.getenv(
    "ANTIGRAVITY_CONVERSATIONS",
    "/root/snap/antigravity-cli/common/.gemini/antigravity-cli/conversations",
))

NOUS_INFERENCE_BASE_URL = os.getenv(
    "NOUS_INFERENCE_BASE_URL", "https://inference-api.nousresearch.com/v1"
).rstrip("/")

ZENDRIVE_MODEL_ALIAS = os.getenv(
    "ZENDRIVE_MODEL_ALIAS", "zendrive-chatgpt-local"
).strip().lower()
ZENDRIVE_SIMULATION_RESPONSE = os.getenv("ZENDRIVE_SIMULATION_RESPONSE", "oi").strip()

_REDACTIONS = [
    (re.compile(r"(bearer\s+)[A-Za-z0-9._~+/=-]+", re.I), r"\1[REDACTED]"),
    (re.compile(r"(sk-[A-Za-z0-9_-]{8,})"), "[API_KEY_REDACTED]"),
    (re.compile(r"(authorization[\"'\s:=]+)[^\s,\"']+", re.I), r"\1[REDACTED]"),
    (re.compile(r"([A-Z0-9_]*API_KEY[\"'\s:=]+)[^\s,\"']+", re.I), r"\1[REDACTED]"),
    (re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"), "[EMAIL_REDACTED]"),
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
    tools: Optional[List[Dict[str, Any]]] = None
    tool_choice: Any = None
    max_tokens: Optional[int] = None
    max_completion_tokens: Optional[int] = None


class ResponsesRequest(BaseModel):
    model: str = "auto"
    input: Any
    stream: bool = False
    instructions: Optional[str] = None
    temperature: Optional[float] = None
    tools: Optional[List[Dict[str, Any]]] = None

    class Config:
        extra = "allow"


class ZendriveProviderRequest(BaseModel):
    model: str = ZENDRIVE_MODEL_ALIAS
    messages: Optional[List[ChatMessage]] = None
    input: Any = None

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


# CENTRALDARK_VPS_KERNEL_DELTA_STREAM
# Read-only FastAPI traversal of bounded, allowlisted VPS log surfaces.
# Raw logs stay available in the MCP Admin; this layer derives useful delta
# without becoming authority, writer, or a second observability system.
VPS_DELTA_ALLOWED_ROOTS = tuple(Path(p) for p in (
    "/root/CentralDark",
    "/root/.pm2/logs",
    "/var/log",
    "/var/lib/docker/containers",
))
VPS_DELTA_DEFAULT_GLOBS = (
    "/root/CentralDark/logs/mcp/*.jsonl",
    "/root/.pm2/logs/*.log",
    "/var/log/caddy/*.log",
    "/var/log/syslog",
    "/var/log/messages",
    "/var/lib/docker/containers/*/*-json.log",
    "/root/CentralDark/apps/modulos/HERMES-CORE/missions/em-andamento/*/hermes.log",
    "/root/CentralDark/actions-runner/_diag/*.log",
)
VPS_DELTA_MAX_FILES = max(1, min(128, int(os.getenv("CENTRALDARK_VPS_DELTA_MAX_FILES", "64"))))
VPS_DELTA_MAX_BYTES_PER_FILE = max(4096, min(262144, int(os.getenv("CENTRALDARK_VPS_DELTA_MAX_BYTES_PER_FILE", "65536"))))
VPS_DELTA_MAX_EVENTS = max(20, min(2000, int(os.getenv("CENTRALDARK_VPS_DELTA_MAX_EVENTS", "500"))))
VPS_DELTA_STREAM_INTERVAL = max(1.0, min(30.0, float(os.getenv("CENTRALDARK_VPS_DELTA_STREAM_INTERVAL", "2"))))


def _path_is_allowed(path: Path) -> bool:
    try:
        resolved = path.resolve(strict=False)
    except OSError:
        return False
    for root in VPS_DELTA_ALLOWED_ROOTS:
        try:
            if resolved == root or root.resolve(strict=False) in resolved.parents:
                return True
        except OSError:
            continue
    return False


def _vps_delta_globs() -> List[str]:
    rows = list(VPS_DELTA_DEFAULT_GLOBS)
    extra = os.getenv("CENTRALDARK_VPS_DELTA_EXTRA_GLOBS", "").strip()
    if extra:
        rows.extend(p.strip() for p in extra.split(";") if p.strip())
    return rows


def discover_vps_delta_sources() -> List[Path]:
    found: Dict[str, Path] = {}
    for pattern in _vps_delta_globs():
        for raw in glob.glob(pattern):
            path = Path(raw)
            if not path.is_file() or not _path_is_allowed(path):
                continue
            found[str(path.resolve(strict=False))] = path
    rows = list(found.values())
    rows.sort(key=lambda p: p.stat().st_mtime_ns if p.exists() else 0, reverse=True)
    return rows[:VPS_DELTA_MAX_FILES]


def _tail_lines(path: Path, max_bytes: int = VPS_DELTA_MAX_BYTES_PER_FILE) -> List[str]:
    try:
        size = path.stat().st_size
        with path.open("rb") as fh:
            if size > max_bytes:
                fh.seek(-max_bytes, os.SEEK_END)
                fh.readline()  # discard partial line
            data = fh.read(max_bytes)
        return data.decode("utf-8", errors="replace").splitlines()
    except (OSError, ValueError):
        return []


_UUID_RE = re.compile(r"\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b", re.I)
_HEX_RE = re.compile(r"\b[0-9a-f]{16,64}\b", re.I)
_LONG_INT_RE = re.compile(r"\b\d{5,}\b")
_ISO_TS_RE = re.compile(r"\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?\b", re.I)


def _normalize_delta_message(value: str) -> str:
    text = sanitize(value).strip()
    text = _UUID_RE.sub("<uuid>", text)
    text = _HEX_RE.sub("<hex>", text)
    text = _ISO_TS_RE.sub("<ts>", text)
    text = _LONG_INT_RE.sub("<n>", text)
    return re.sub(r"\s+", " ", text)[:500]


def parse_vps_delta_line(source: Path, raw_line: str, line_index: int = 0, mtime_ns: int = 0) -> Dict[str, Any]:
    # Parse the original line first. sanitize() intentionally truncates output,
    # so parsing the sanitized string would break long JSON records (Caddy,
    # Docker, structured PM2 logs) and lose route/status attribution.
    obj: Dict[str, Any] = {}
    stripped = raw_line.lstrip()
    if stripped.startswith("{"):
        try:
            parsed = json.loads(stripped)
            if isinstance(parsed, dict):
                obj = parsed
        except ValueError:
            obj = {}
    safe_raw = sanitize(raw_line)

    request_obj = obj.get("request") if isinstance(obj.get("request"), dict) else {}
    level = str(obj.get("level") or "").lower()
    status_raw = obj.get("status")
    try:
        status = int(status_raw) if status_raw is not None else None
    except (TypeError, ValueError):
        status = None

    route_candidate = obj.get("path") or obj.get("route") or obj.get("url") or request_obj.get("uri") or request_obj.get("path") or "-"
    method_candidate = obj.get("method") or request_obj.get("method") or ""
    base_message = obj.get("event") or obj.get("message") or obj.get("msg")
    if base_message:
        message = str(base_message)
    elif request_obj:
        message = f"{method_candidate} {route_candidate} status={status if status is not None else 'unknown'}".strip()
    else:
        message = safe_raw
    lowered = message.lower()
    if level in {"error", "fatal", "critical"} or (status is not None and status >= 500) or re.search(r"\b(error|failed|failure|exception|traceback|fatal)\b", lowered):
        severity = "error"
    elif level in {"warn", "warning"} or (status is not None and status >= 400) or re.search(r"\b(warn|degraded|timeout|retry|unauthorized|forbidden)\b", lowered):
        severity = "warn"
    else:
        severity = "info"

    route = str(route_candidate)
    service = str(obj.get("service") or obj.get("app") or obj.get("logger") or source.stem)
    normalized = _normalize_delta_message(message)
    signature = "|".join((severity, service, route, normalized))
    fingerprint = hashlib.sha256(signature.encode("utf-8", errors="replace")).hexdigest()[:24]
    event_id = hashlib.sha256(
        f"{source}:{mtime_ns}:{line_index}:{safe_raw}".encode("utf-8", errors="replace")
    ).hexdigest()[:24]
    timestamp = obj.get("timestamp") or obj.get("t") or obj.get("time")

    return {
        "event_id": event_id,
        "fingerprint": fingerprint,
        "severity": severity,
        "service": sanitize(service)[:120],
        "route": sanitize(route)[:200],
        "message": normalized,
        "status": status,
        "timestamp": sanitize(timestamp)[:80] if timestamp else None,
        "source": sanitize(str(source))[:500],
        "raw": safe_raw[:2000],
        "authority": False,
        "proof": False,
    }


def aggregate_vps_delta_events(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    grouped: Dict[str, Dict[str, Any]] = {}
    for event in events:
        fp = str(event.get("fingerprint") or "")
        if not fp:
            continue
        row = grouped.get(fp)
        if row is None:
            row = {
                "fingerprint": fp,
                "severity": event.get("severity", "info"),
                "service": event.get("service", "unknown"),
                "route": event.get("route", "-"),
                "message": event.get("message", ""),
                "count": 0,
                "last_event_id": None,
                "last_timestamp": None,
                "source": event.get("source"),
                "material": False,
            }
            grouped[fp] = row
        row["count"] += 1
        row["last_event_id"] = event.get("event_id")
        row["last_timestamp"] = event.get("timestamp")
        severity = str(row["severity"])
        row["material"] = severity == "error" or (severity == "warn" and row["count"] >= 3)

    rank = {"error": 0, "warn": 1, "info": 2}
    return sorted(grouped.values(), key=lambda r: (rank.get(str(r["severity"]), 9), -int(r["count"])))[:200]


def collect_vps_delta_snapshot(limit: int = VPS_DELTA_MAX_EVENTS) -> Dict[str, Any]:
    limit = max(20, min(VPS_DELTA_MAX_EVENTS, int(limit)))
    sources = discover_vps_delta_sources()
    source_errors: List[str] = []
    per_source = max(2, min(50, (limit + max(1, len(sources)) - 1) // max(1, len(sources))))
    source_batches: List[List[Dict[str, Any]]] = []

    # Whole-VPS means no single hot file may starve all other sensors. Take a
    # bounded newest slice from every allowlisted source, then interleave them.
    for source in sources:
        try:
            mtime_ns = source.stat().st_mtime_ns
        except OSError:
            source_errors.append(sanitize(str(source)))
            continue
        lines = [line for line in _tail_lines(source) if line.strip()]
        selected = lines[-per_source:]
        start = max(0, len(lines) - len(selected))
        batch = [
            parse_vps_delta_line(source, line, start + index, mtime_ns)
            for index, line in enumerate(selected)
        ]
        if batch:
            source_batches.append(list(reversed(batch)))  # newest first

    events: List[Dict[str, Any]] = []
    depth = max((len(batch) for batch in source_batches), default=0)
    for index in range(depth):
        for batch in source_batches:
            if index < len(batch):
                events.append(batch[index])
                if len(events) >= limit:
                    break
        if len(events) >= limit:
            break

    groups = aggregate_vps_delta_events(events)
    errors = sum(1 for e in events if e["severity"] == "error")
    warns = sum(1 for e in events if e["severity"] == "warn")
    try:
        loadavg = list(os.getloadavg())
    except (AttributeError, OSError):
        loadavg = []
    try:
        disk = shutil.disk_usage("/")
        disk_payload = {"total": disk.total, "used": disk.used, "free": disk.free}
    except OSError:
        disk_payload = None
    process_count = 0
    proc_root = Path("/proc")
    if proc_root.exists():
        try:
            process_count = sum(1 for p in proc_root.iterdir() if p.name.isdigit())
        except OSError:
            process_count = 0

    return {
        "schema": "centraldark.vps-kernel-delta-stream.v1",
        "ok": True,
        "owner": "centraldark-omni-router",
        "transport": "FASTAPI",
        "mode": "READ_ONLY_DERIVED_DELTA",
        "one_heart": "https://api.centralldark.com/heartbeat",
        "raw_stream_preserved": True,
        "raw_stream_owner": "apps/modulos/mcp/src/admin.js:/admin/logs/stream",
        "delta_is_authority": False,
        "delta_is_proof": False,
        "source_count": len(sources),
        "sampled_source_count": len(source_batches),
        "source_coverage_ratio": round(len(source_batches) / len(sources), 4) if sources else 0.0,
        "source_errors": source_errors,
        "events_seen": len(events),
        "error_events": errors,
        "warn_events": warns,
        "material_groups": sum(1 for g in groups if g["material"]),
        "groups": groups,
        "events": events[-limit:],
        "runtime": {
            "hostname": os.uname().nodename if hasattr(os, "uname") else "unknown",
            "loadavg": loadavg,
            "disk_root": disk_payload,
            "process_count": process_count,
        },
    }


def vps_delta_sse():
    seen: set[str] = set()
    while True:
        snapshot = collect_vps_delta_snapshot(min(300, VPS_DELTA_MAX_EVENTS))
        emitted = 0
        for event in snapshot["events"]:
            event_id = str(event.get("event_id") or "")
            if not event_id or event_id in seen:
                continue
            seen.add(event_id)
            emitted += 1
            yield f"event: vps_delta\nid: {event_id}\ndata: {json.dumps(event, ensure_ascii=False)}\n\n"
        if emitted == 0:
            heartbeat = {
                "event": "vps_delta_keepalive",
                "ts": int(time.time()),
                "source_count": snapshot["source_count"],
                "material_groups": snapshot["material_groups"],
                "authority": False,
                "proof": False,
            }
            yield f"event: keepalive\ndata: {json.dumps(heartbeat, ensure_ascii=False)}\n\n"
        if len(seen) > 5000:
            seen = set(list(seen)[-2500:])
        time.sleep(VPS_DELTA_STREAM_INTERVAL)


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



def zendrive_aliases() -> set[str]:
    aliases = {
        ZENDRIVE_MODEL_ALIAS,
        "zendrive",
        "chatgpt-zendrive",
        "zendrive-chatgpt",
        "zendrive-sol",
    }
    return {item.strip().lower() for item in aliases if item.strip()}


def zendrive_provider_health_payload() -> Dict[str, Any]:
    live_enabled = env_bool("ZENDRIVE_PROVIDER_LIVE_ENABLED", False)
    simulation_enabled = env_bool("ZENDRIVE_PROVIDER_SIMULATION_ENABLED", True)
    worker_url_present = bool(os.getenv("ZENDRIVE_WORKER_URL", "").strip())
    review_file_present = bool(os.getenv("ZENDRIVE_REVIEW_FILE", "").strip())
    local_profile_allowed = env_bool("ZENDRIVE_ALLOW_LOCAL_PROFILE", True)
    ok = simulation_enabled or (live_enabled and worker_url_present)
    return {
        "schema": "centraldark.zendrive-provider-health.v1",
        "ok": ok,
        "state": "LIVE_CONFIGURED" if live_enabled and worker_url_present else ("SIMULATION_READY" if simulation_enabled else "BLOCKED"),
        "model_alias": ZENDRIVE_MODEL_ALIAS,
        "live_enabled": live_enabled,
        "simulation_enabled": simulation_enabled,
        "worker_url_present": worker_url_present,
        "review_file_present": review_file_present,
        "local_profile_allowed": local_profile_allowed,
        "authority": False,
        "proof": False,
        "requires_hermes_counterproof": True,
        "secret_values_returned": False,
        "cookie_copy_allowed": False,
        "notes": [
            "Zendrive is a local/profile surface, not authority.",
            "Live worker requires explicit runtime health before promotion.",
        ],
    }


def _zendrive_request_messages(payload: ZendriveProviderRequest) -> List[ChatMessage]:
    if payload.messages:
        return payload.messages
    if payload.input is not None:
        return responses_messages(ResponsesRequest(model=payload.model, input=payload.input))
    return []


def _zendrive_simulation_payload(messages: List[ChatMessage], requested_model: str = "") -> Dict[str, Any]:
    prompt = flatten_messages(messages).strip()
    lowered = prompt.lower()
    response_text = ZENDRIVE_SIMULATION_RESPONSE or "oi"
    if lowered.endswith("oi") or "\noi" in lowered or lowered == "[user]\noi":
        response_text = "oi"
    return {
        "schema": "centraldark.zendrive-provider-call.v1",
        "state": "SIMULATED_PASS",
        "model_alias": ZENDRIVE_MODEL_ALIAS,
        "requested_model": requested_model or ZENDRIVE_MODEL_ALIAS,
        "response_text": response_text,
        "authority": False,
        "proof": False,
        "requires_hermes_counterproof": True,
        "secret_copied": False,
        "cookie_copied": False,
        "action_is_proof": False,
        "input_present": bool(prompt),
    }


def run_zendrive_provider(messages: List[ChatMessage], target_model: str) -> Tuple[str, str]:
    if env_bool("ZENDRIVE_PROVIDER_LIVE_ENABLED", False):
        worker_url = os.getenv("ZENDRIVE_WORKER_URL", "").strip()
        if not worker_url:
            raise HTTPException(status_code=503, detail="zendrive_worker_url_not_configured")
        headers = {"Content-Type": "application/json"}
        worker_token = os.getenv("ZENDRIVE_WORKER_TOKEN", "").strip()
        if worker_token:
            headers["Authorization"] = f"Bearer {worker_token}"
        payload = {
            "model": target_model or ZENDRIVE_MODEL_ALIAS,
            "messages": [{"role": m.role, "content": message_text(m.content)} for m in messages],
            "no_secret_print": True,
            "no_cookie_copy": True,
        }
        try:
            response = requests.post(worker_url, headers=headers, json=payload, timeout=REQUEST_TIMEOUT)
        except requests.RequestException as exc:
            raise HTTPException(status_code=502, detail=f"zendrive_worker_transport:{sanitize(exc)}") from exc
        if not response.ok:
            raise HTTPException(status_code=502, detail=f"zendrive_worker_http_{response.status_code}:{sanitize(response.text)}")
        try:
            data = response.json()
        except ValueError as exc:
            raise HTTPException(status_code=502, detail="zendrive_worker_invalid_json") from exc
        text = extract_openai_text(data) or extract_cli_text(data)
        if not text:
            raise HTTPException(status_code=502, detail="zendrive_worker_empty_output")
        return text, target_model or ZENDRIVE_MODEL_ALIAS

    if not env_bool("ZENDRIVE_PROVIDER_SIMULATION_ENABLED", True):
        raise HTTPException(status_code=503, detail="zendrive_provider_not_enabled")
    simulated = _zendrive_simulation_payload(messages, target_model or ZENDRIVE_MODEL_ALIAS)
    return simulated["response_text"], ZENDRIVE_MODEL_ALIAS

def route_model(model: str) -> Tuple[str, str]:
    raw = (model or "auto").strip()
    if raw.lower() == "auto":
        return DEFAULT_ENGINE, ""
    if raw.lower() in zendrive_aliases():
        return ZENDRIVE_MODEL_ALIAS, ""

    for sep in ("/", ":"):
        if sep in raw:
            prefix, target = raw.split(sep, 1)
            normalized = prefix.strip().lower()
            if normalized == "claude":
                normalized = "claude-code"
            if normalized == "hermes":
                return DEFAULT_ENGINE, target.strip()
            if normalized in ENGINE_PROVIDERS:
                return normalized, target.strip()
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
    if provider == "antigravity":
        return os.getenv("ANTIGRAVITY_MODEL", "flash_lite").strip()
    if provider == "openai":
        return os.getenv("OPENAI_MODEL", "gpt-5.6").strip()
    if provider == "nous":
        return discover_nous_free_model()
    if provider == "google":
        return os.getenv("GOOGLE_MODEL", "gemini-2.0-flash").strip()
    if provider == "xai":
        return os.getenv("XAI_MODEL", "grok-4-fast").strip()
    if provider == "abacus":
        return os.getenv("ABACUS_MODEL", "").strip()
    if provider == ZENDRIVE_MODEL_ALIAS:
        return ZENDRIVE_MODEL_ALIAS
    return ""


def provider_configured(provider: str) -> bool:
    if provider == "antigravity":
        return bool(ANTIGRAVITY_AGENTAPI and os.path.exists(ANTIGRAVITY_AGENTAPI))
    if provider == "openai":
        return bool(os.getenv("OPENAI_API_KEY", "").strip())
    if provider == "claude-code":
        binary = os.getenv("CLAUDE_BIN", "claude").strip()
        return bool(shutil.which(binary) or (binary and os.path.exists(binary)))
    if provider == "nous":
        return bool(get_nous_token())
    if provider == "google":
        return bool(os.getenv("GOOGLE_API_KEY", "").strip())
    if provider == "xai":
        return bool(os.getenv("XAI_API_KEY", "").strip())
    if provider == "abacus":
        return bool(os.getenv("ABACUS_API_KEY", "").strip())
    if provider == ZENDRIVE_MODEL_ALIAS:
        return env_bool("ZENDRIVE_PROVIDER_SIMULATION_ENABLED", True) or (
            env_bool("ZENDRIVE_PROVIDER_LIVE_ENABLED", False)
            and bool(os.getenv("ZENDRIVE_WORKER_URL", "").strip())
        )
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


_HERMES_HEALTH_CACHE: Dict[str, Any] = {"expires_at": 0.0, "value": None}


def _parse_iso_epoch(value: Any) -> Optional[float]:
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.timestamp()
    except (TypeError, ValueError):
        return None


def _tail_text(file: Path, max_bytes: int = 512 * 1024) -> str:
    try:
        size = file.stat().st_size
        with file.open("rb") as fh:
            start = max(0, size - max_bytes)
            fh.seek(start)
            data = fh.read()
        text = data.decode("utf-8", errors="ignore")
        if start > 0 and "\n" in text:
            text = text.split("\n", 1)[1]
        return text
    except OSError:
        return ""


def observed_hermes_health() -> Dict[str, Any]:
    if not env_bool("CENTRALDARK_ADAPTIVE_HERMES_HEALTH", True):
        return {"state": "DISABLED", "sample": 0, "proof": False}

    now = time.time()
    cached = _HERMES_HEALTH_CACHE.get("value")
    if cached is not None and now < float(_HERMES_HEALTH_CACHE.get("expires_at") or 0):
        return cached

    cutoff = now - max(1, HERMES_HEALTH_WINDOW_MINUTES) * 60
    rows: List[Dict[str, Any]] = []
    sector = CENTRAL_LOG_ROOT / "sectors" / "agents"
    try:
        files = sorted(sector.glob("*.jsonl"), reverse=True)[:2]
    except OSError:
        files = []

    for file in files:
        for line in _tail_text(file).splitlines():
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            if row.get("actor") != "hermes" or row.get("kind") != "scheduled_job":
                continue
            ts = _parse_iso_epoch(row.get("timestamp"))
            if ts is None or ts < cutoff:
                continue
            rows.append(row)

    failures = 0
    durations: List[int] = []
    for row in rows:
        data = row.get("data") if isinstance(row.get("data"), dict) else {}
        if row.get("level") == "error" or data.get("error"):
            failures += 1
        try:
            duration = int(data.get("duration_ms"))
            if duration >= 0:
                durations.append(duration)
        except (TypeError, ValueError):
            pass

    sample = len(rows)
    rate = failures / sample if sample else None
    durations.sort()
    p95 = durations[min(len(durations) - 1, max(0, ((95 * len(durations) + 99) // 100) - 1))] if durations else None

    if sample < max(1, HERMES_HEALTH_MIN_SAMPLE):
        state = "UNKNOWN_INSUFFICIENT_SAMPLE"
    elif (rate is not None and rate >= HERMES_FAILURE_RATE_MAX) or (p95 is not None and p95 > HERMES_P95_MAX_MS):
        state = "DEGRADED"
    else:
        state = "HEALTHY"

    value = {
        "state": state,
        "sample": sample,
        "failures": failures,
        "failure_rate": rate,
        "p95_duration_ms": p95,
        "window_minutes": HERMES_HEALTH_WINDOW_MINUTES,
        "thresholds": {
            "min_sample": HERMES_HEALTH_MIN_SAMPLE,
            "failure_rate_max": HERMES_FAILURE_RATE_MAX,
            "p95_max_ms": HERMES_P95_MAX_MS,
        },
        "probability_is_proof": False,
        "proof": sample >= max(1, HERMES_HEALTH_MIN_SAMPLE),
    }
    _HERMES_HEALTH_CACHE["value"] = value
    _HERMES_HEALTH_CACHE["expires_at"] = now + 15
    return value


def _reorder_hermes_by_health(
    candidates: List[Tuple[str, str]],
    health_state: str,
) -> List[Tuple[str, str]]:
    if health_state != "DEGRADED":
        return candidates
    non_hermes = [candidate for candidate in candidates if candidate[0] != "hermes"]
    hermes = [candidate for candidate in candidates if candidate[0] == "hermes"]
    return non_hermes + hermes


def candidate_routes(model: str) -> List[Tuple[str, str]]:
    primary_provider, primary_target = route_model(model)
    candidates: List[Tuple[str, str]] = [(primary_provider, primary_target)]
    if not env_bool("CENTRALDARK_AUTO_FALLBACK", True):
        return candidates
    chain = split_csv(os.getenv("CENTRALDARK_FALLBACK_CHAIN", DEFAULT_FALLBACK_CHAIN))
    for provider in chain:
        normalized = "claude-code" if provider == "claude" else provider
        if normalized == "hermes":
            continue
        if normalized not in ENGINE_PROVIDERS:
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


def _antigravity_model(target_model: str) -> str:
    requested = (target_model or "flash_lite").strip().lower()
    aliases = {
        "gemini-3.1-flash-lite": "flash_lite",
        "flash-lite": "flash_lite",
        "gemini-flash-lite": "flash_lite",
        "gemini-flash": "flash",
        "gemini-pro": "pro",
    }
    if requested in {"gpt-oss-120b", "gpt-oss-120b-medium"}:
        raise HTTPException(status_code=400, detail="antigravity_model_not_supported:gpt-oss-120b")
    resolved = aliases.get(requested, requested)
    if resolved not in {"flash_lite", "flash", "pro"}:
        raise HTTPException(status_code=400, detail=f"antigravity_model_not_supported:{sanitize(target_model)}")
    return resolved


def _length_delimited(data: bytes, tag: int) -> List[str]:
    """Read printable protobuf strings for one field number."""
    values: List[str] = []
    i = 0
    while i < len(data):
        pos = data.find(bytes([tag]), i)
        if pos < 0 or pos + 1 >= len(data):
            break
        j = pos + 1
        length = 0
        shift = 0
        while j < len(data) and shift < 35:
            byte = data[j]
            j += 1
            length |= (byte & 0x7F) << shift
            if not byte & 0x80:
                break
            shift += 7
        end = j + length
        if length > 0 and end <= len(data):
            raw = data[j:end]
            try:
                text = raw.decode("utf-8").strip()
            except UnicodeDecodeError:
                text = ""
            if text and all(ch.isprintable() or ch in "\n\r\t" for ch in text):
                values.append(text)
        i = pos + 1
    return values


def _read_antigravity_response(conversation_id: str) -> str:
    db = ANTIGRAVITY_CONVERSATIONS / f"{conversation_id}.db"
    if not db.exists():
        return ""
    try:
        with sqlite3.connect(db) as conn:
            errors = conn.execute("SELECT data FROM gen_metadata ORDER BY idx DESC LIMIT 3").fetchall()
            for (blob,) in errors:
                if blob and b"RESOURCE_EXHAUSTED" in blob:
                    raise RuntimeError("antigravity_quota_exhausted")
            rows = conn.execute(
                "SELECT step_payload FROM steps "
                "WHERE step_payload IS NOT NULL AND step_type = 15 AND status = 3 "
                "ORDER BY idx DESC LIMIT 1"
            ).fetchall()
    except sqlite3.Error as exc:
        raise RuntimeError(f"antigravity_conversation_db:{exc}") from exc

    for (blob,) in rows:
        if not blob:
            continue
        # Read only this conversation's completed response step. The filename
        # is the correlation key returned by agentapi; do not search other DBs.
        candidates = _length_delimited(blob, 0x42)
        if candidates:
            return candidates[-1]
    return ""


def run_antigravity(messages: List[ChatMessage], target_model: str) -> Tuple[str, str]:
    if not ANTIGRAVITY_AGENTAPI or not os.path.exists(ANTIGRAVITY_AGENTAPI):
        raise HTTPException(status_code=503, detail="antigravity_agentapi_not_found")
    prompt = flatten_messages(messages)
    model = _antigravity_model(target_model)
    env = os.environ.copy()
    env.setdefault("ANTIGRAVITY_LS_ADDRESS", "127.0.0.1:37859")
    env.setdefault("ANTIGRAVITY_PROJECT_ID", "default-cli-project")
    try:
        proc = subprocess.run(
            [ANTIGRAVITY_AGENTAPI, "new-conversation", f"--model={model}", "--title=hermes-router", prompt],
            capture_output=True,
            text=True,
            timeout=REQUEST_TIMEOUT,
            check=False,
            env=env,
        )
    except subprocess.TimeoutExpired as exc:
        raise HTTPException(status_code=504, detail="antigravity_timeout") from exc
    if proc.returncode != 0:
        detail = sanitize(proc.stdout or proc.stderr or "unknown_error")
        raise HTTPException(status_code=502, detail=f"antigravity_agentapi_exit_{proc.returncode}:{detail}")
    try:
        payload = json.loads(proc.stdout)
        conversation_id = payload["response"]["newConversation"]["conversationId"]
    except (ValueError, KeyError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="antigravity_invalid_agentapi_response") from exc

    deadline = time.time() + min(REQUEST_TIMEOUT, 60.0)
    last_error: Optional[Exception] = None
    while time.time() < deadline:
        try:
            text = _read_antigravity_response(conversation_id)
        except RuntimeError as exc:
            last_error = exc
            break
        if text:
            return text, model
        time.sleep(0.25)
    if last_error:
        raise HTTPException(status_code=502, detail=str(last_error)) from last_error
    raise HTTPException(status_code=502, detail="antigravity_empty_output")


def run_provider(provider: str, messages: List[ChatMessage], target_model: str) -> Tuple[str, str]:
    model = target_model or provider_default_model(provider)
    if provider == ZENDRIVE_MODEL_ALIAS:
        return run_zendrive_provider(messages, target_model)
    if provider == "openai":
        return run_compatible(
            "openai",
            os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/"),
            os.getenv("OPENAI_API_KEY", "").strip(),
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
    if provider == "antigravity":
        return run_antigravity(messages, target_model)
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



@app.get(f"/providers/{ZENDRIVE_MODEL_ALIAS}/health")
def zendrive_provider_health(authorization: str = Header(default=None)) -> Dict[str, Any]:
    require_router_auth(authorization)
    return zendrive_provider_health_payload()


@app.post(f"/providers/{ZENDRIVE_MODEL_ALIAS}/simulate")
def zendrive_provider_simulate(
    request: ZendriveProviderRequest,
    authorization: str = Header(default=None),
) -> Dict[str, Any]:
    require_router_auth(authorization)
    messages = _zendrive_request_messages(request)
    return _zendrive_simulation_payload(messages, request.model)

@app.get("/kernel/vps/delta/health")
def vps_delta_health(authorization: str = Header(default=None)) -> Dict[str, Any]:
    require_router_auth(authorization)
    snapshot = collect_vps_delta_snapshot(50)
    return {
        "ok": True,
        "service": "centraldark-vps-kernel-delta",
        "transport": "FASTAPI",
        "engine": "centraldark-omni-router",
        "one_heart": snapshot["one_heart"],
        "source_count": snapshot["source_count"],
        "sampled_source_count": snapshot["sampled_source_count"],
        "source_coverage_ratio": snapshot["source_coverage_ratio"],
        "material_groups": snapshot["material_groups"],
        "raw_stream_preserved": True,
        "authority": False,
        "proof": False,
    }


@app.get("/kernel/vps/delta")
def vps_delta(limit: int = 300, authorization: str = Header(default=None)) -> Dict[str, Any]:
    require_router_auth(authorization)
    return collect_vps_delta_snapshot(limit)


@app.get("/kernel/vps/delta/raw")
def vps_delta_raw(limit: int = 300, authorization: str = Header(default=None)) -> Dict[str, Any]:
    require_router_auth(authorization)
    snapshot = collect_vps_delta_snapshot(limit)
    return {
        "schema": snapshot["schema"],
        "ok": snapshot["ok"],
        "mode": "RAW_SANITIZED_BOUNDED",
        "raw_stream_preserved": True,
        "events": snapshot["events"],
        "authority": False,
        "proof": False,
    }


@app.get("/kernel/vps/delta/stream")
def vps_delta_stream(authorization: str = Header(default=None)) -> StreamingResponse:
    require_router_auth(authorization)
    return StreamingResponse(
        vps_delta_sse(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/health")
def health() -> Dict[str, Any]:
    providers = sorted(ENGINE_PROVIDERS)
    return {
        "ok": True,
        "service": "centraldark-omni-router",
        "version": APP_VERSION,
        "default_engine": DEFAULT_ENGINE,
        "auto_fallback": env_bool("CENTRALDARK_AUTO_FALLBACK", True),
        "free_only": env_bool("CENTRALDARK_FREE_ONLY", False),
        "fallback_chain": split_csv(os.getenv("CENTRALDARK_FALLBACK_CHAIN", DEFAULT_FALLBACK_CHAIN)),
        "hermes_adaptive_health": observed_hermes_health(),
        "engines": {provider: {"configured": provider_configured(provider)} for provider in providers},
        "wire_apis": ["chat_completions", "responses"],
        "legacy_zendriver_chatgpt": "FROZEN_NOT_ROUTED",
        "zendrive_provider": zendrive_provider_health_payload(),
        "vps_kernel_delta_stream": {
            "transport": "FASTAPI",
            "endpoints": ["/kernel/vps/delta", "/kernel/vps/delta/raw", "/kernel/vps/delta/stream", "/kernel/vps/delta/health"],
            "raw_stream_preserved": True,
            "one_heart": "https://api.centralldark.com/heartbeat",
            "authority": False,
            "proof": False,
        },
    }


@app.get("/v1/models")
def models(authorization: str = Header(default=None)) -> Dict[str, Any]:
    require_router_auth(authorization)
    rows = [{"id": "auto", "object": "model", "owned_by": "centraldark"}]
    for provider in sorted(ENGINE_PROVIDERS):
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
    if request.tools or request.tool_choice not in (None, "none"):
        raise HTTPException(status_code=501, detail="antigravity_tools_not_supported")
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
    if request.tools:
        raise HTTPException(status_code=501, detail="antigravity_tools_not_supported")
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
        "route_zendrive_alias": route_model(ZENDRIVE_MODEL_ALIAS) == (ZENDRIVE_MODEL_ALIAS, ""),
        "responses_input": "oi" in flatten_messages(responses_messages(response_request)),
        "fallback_event": event["context"].get("fallback_used") is True and event["context"].get("attempt") == 2,
        "action_not_proof": event["context"].get("action_is_proof") is False,
        "redaction": "sekret" not in sanitize("Authorization: ***"),
        "email_redaction": "user@example.com" not in sanitize("user@example.com") and "[EMAIL_REDACTED]" in sanitize("user@example.com"),
        "chain_dedup": len(candidate_routes("auto")) == len(set(candidate_routes("auto"))),
        "default_engine_config_valid": default_engine_config_valid,
        "hermes_is_agent_runtime_not_engine": hermes_is_agent_runtime_not_engine,
        "default_chain_excludes_hermes": "hermes" not in split_csv(DEFAULT_FALLBACK_CHAIN),
        "zendrive_health_safe": zendrive_provider_health_payload().get("proof") is False,
        "zendrive_simulation_oi": _zendrive_simulation_payload([ChatMessage(role="user", content="oi")]).get("response_text") == "oi",
        "vps_delta_error_class": parse_vps_delta_line(
            Path("/root/CentralDark/logs/mcp/test.jsonl"),
            '{"level":"error","service":"mcp","path":"/mcp","status":500,"event":"probe failed"}',
            1,
            1,
        ).get("severity") == "error",
        "vps_delta_dedupe": aggregate_vps_delta_events([
            parse_vps_delta_line(Path("/root/CentralDark/logs/mcp/test.jsonl"), '{"level":"warn","event":"timeout 12345"}', 1, 1),
            parse_vps_delta_line(Path("/root/CentralDark/logs/mcp/test.jsonl"), '{"level":"warn","event":"timeout 67890"}', 2, 1),
            parse_vps_delta_line(Path("/root/CentralDark/logs/mcp/test.jsonl"), '{"level":"warn","event":"timeout 99999"}', 3, 1),
        ])[0].get("count") == 3,
        "vps_delta_caddy_nested_route": (
            lambda e: e.get("route") == "/health/deep" and e.get("status") == 503 and e.get("severity") == "error"
        )(parse_vps_delta_line(
            Path("/var/log/caddy/mcp-access.log"),
            '{"level":"info","logger":"http.log.access.log1","msg":"handled request","request":{"method":"GET","uri":"/health/deep"},"status":503}',
            4,
            1,
        )),
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
