#!/usr/bin/env python3
"""CentralDark Omni compatibility/autonomy extension.

This module imports the existing `centraldark_omni_router` app and adds only
wire-compatibility endpoints to the SAME FastAPI process. It does not create a
second router, second port, second brain, or second provider-control path.
"""

from __future__ import annotations

import argparse
import json
import os
import time
import uuid
from typing import Any, Dict, List, Optional

from fastapi import Header, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

import centraldark_omni_router as core


class AnthropicMessagesRequest(BaseModel):
    model: str = "auto"
    messages: List[core.ChatMessage]
    system: Optional[Any] = None
    stream: bool = False
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None

    class Config:
        extra = "allow"


def env_bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() not in {"0", "false", "off", "no", ""}


def normalize_requested_model(model: str) -> str:
    """Route UI aliases through CentralDark instead of making them dependencies."""
    raw = (model or "auto").strip()
    lowered = raw.lower()
    aliases = {
        "claude": "claude-code",
        "claude-code": "claude-code",
        "hermes": "hermes",
        "nous": "nous",
        "google": "google",
        "xai": "xai",
        "abacus": "abacus",
        "openai": "openai",
    }
    provider = aliases.get(lowered)
    if not provider:
        return raw
    if provider != "hermes" and not env_bool("CENTRALDARK_ALLOW_EXTERNAL_PROVIDERS", False):
        return "hermes/"
    return provider + "/"


def anthropic_messages(request: AnthropicMessagesRequest) -> List[core.ChatMessage]:
    messages: List[core.ChatMessage] = []
    if request.system is not None:
        text = core.message_text(request.system).strip()
        if text:
            messages.append(core.ChatMessage(role="system", content=text))
    messages.extend(request.messages)
    return messages


def anthropic_response(result: Dict[str, Any], requested_model: str, normalized_model: str) -> Dict[str, Any]:
    return {
        "id": f"msg_{uuid.uuid4().hex}",
        "type": "message",
        "role": "assistant",
        "model": f"{result['provider']}/{result['resolved_model']}",
        "content": [{"type": "text", "text": result["text"]}],
        "stop_reason": "end_turn",
        "stop_sequence": None,
        "usage": {"input_tokens": 0, "output_tokens": 0},
        "centraldark": {
            "requested_model": requested_model,
            "normalized_model": normalized_model,
            "engine": result["provider"],
            "resolved_model": result["resolved_model"],
            "fallback_used": result["fallback_used"],
            "attempts": result["attempts"],
            "same_router": True,
            "action_is_proof": False,
        },
    }


def anthropic_stream(result: Dict[str, Any], requested_model: str, normalized_model: str):
    message = anthropic_response(result, requested_model, normalized_model)
    start = {"type": "message_start", "message": {**message, "content": [], "stop_reason": None}}
    yield f"event: message_start\ndata: {json.dumps(start, ensure_ascii=False)}\n\n"
    block_start = {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}
    yield f"event: content_block_start\ndata: {json.dumps(block_start, ensure_ascii=False)}\n\n"
    for word in result["text"].split(" "):
        delta = {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": word + " "}}
        yield f"event: content_block_delta\ndata: {json.dumps(delta, ensure_ascii=False)}\n\n"
    yield "event: content_block_stop\ndata: {\"type\":\"content_block_stop\",\"index\":0}\n\n"
    message_delta = {"type": "message_delta", "delta": {"stop_reason": "end_turn", "stop_sequence": None}, "usage": {"output_tokens": 0}}
    yield f"event: message_delta\ndata: {json.dumps(message_delta, ensure_ascii=False)}\n\n"
    yield "event: message_stop\ndata: {\"type\":\"message_stop\"}\n\n"


@core.app.post("/v1/messages")
def messages(
    request: AnthropicMessagesRequest,
    http_request: Request,
    authorization: str = Header(default=None),
) -> Any:
    core.require_router_auth(authorization)
    normalized_model = normalize_requested_model(request.model)
    result = core.execute_with_failover(normalized_model, anthropic_messages(request), http_request.headers)
    if request.stream:
        return StreamingResponse(
            anthropic_stream(result, request.model, normalized_model),
            media_type="text/event-stream",
        )
    return anthropic_response(result, request.model, normalized_model)


@core.app.get("/v1/autonomy")
def autonomy(authorization: str = Header(default=None)) -> Dict[str, Any]:
    core.require_router_auth(authorization)
    return {
        "ok": True,
        "contract": "centraldark.one-blood.autonomy.v1",
        "one_system_only": True,
        "one_router_process": True,
        "router_port": int(os.getenv("CENTRALDARK_ROUTER_PORT", "8099")),
        "primary_engine": os.getenv("CENTRALDARK_DEFAULT_ENGINE", "hermes"),
        "hermes_base_url": os.getenv("HERMES_BASE_URL", "http://127.0.0.1:8645"),
        "external_providers_enabled": env_bool("CENTRALDARK_ALLOW_EXTERNAL_PROVIDERS", False),
        "external_providers_required": False,
        "wire_apis": ["chat_completions", "responses", "anthropic_messages"],
        "tool_execution_owner": "centraldark",
        "secrets_exposed": False,
        "action_is_proof": False,
        "checked_at": int(time.time()),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default=os.getenv("CENTRALDARK_ROUTER_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.getenv("CENTRALDARK_ROUTER_PORT", "8099")))
    args = parser.parse_args()
    import uvicorn

    uvicorn.run(core.app, host=args.host, port=args.port)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
