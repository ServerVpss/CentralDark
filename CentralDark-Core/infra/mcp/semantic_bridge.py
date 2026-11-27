#!/usr/bin/env python3
"""JSONL adapter for the canonical local semantic core.

Long-running mode keeps one loaded model per consumer process. It never writes
memory/repo and never downloads a model implicitly.
"""
from __future__ import annotations

import argparse
import json
import sys
from typing import Any

from semantic_core import GloveSemanticCore, SemanticCoreError

_CORE: GloveSemanticCore | None = None


def core() -> GloveSemanticCore:
    global _CORE
    if _CORE is None:
        _CORE = GloveSemanticCore()
    return _CORE


def handle(payload: dict[str, Any]) -> dict[str, Any]:
    request_id = payload.get("id")
    operation = str(payload.get("operation") or "")
    args = payload.get("args") or {}
    if not isinstance(args, dict):
        return {"id": request_id, "ok": False, "error": "ARGS_INVALID"}
    try:
        result = core().dispatch(operation, args)
        return {"id": request_id, "ok": True, "result": result}
    except SemanticCoreError as exc:
        return {"id": request_id, "ok": False, "error": exc.code, "message": str(exc)}
    except Exception as exc:
        return {"id": request_id, "ok": False, "error": type(exc).__name__, "message": str(exc)}


def serve() -> int:
    for raw in sys.stdin:
        raw = raw.strip()
        if not raw:
            continue
        try:
            payload = json.loads(raw)
            if not isinstance(payload, dict):
                raise ValueError("PAYLOAD_INVALID")
            response = handle(payload)
        except Exception as exc:
            response = {"id": None, "ok": False, "error": "JSON_INVALID", "message": str(exc)}
        sys.stdout.write(json.dumps(response, ensure_ascii=False, separators=(",", ":")) + "\n")
        sys.stdout.flush()
    return 0


def once(operation: str, args_json: str) -> int:
    try:
        args = json.loads(args_json)
    except json.JSONDecodeError as exc:
        print(json.dumps({"ok": False, "error": "ARGS_JSON_INVALID", "message": str(exc)}))
        return 2
    response = handle({"id": "once", "operation": operation, "args": args})
    print(json.dumps(response, ensure_ascii=False))
    return 0 if response.get("ok") else 1


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--serve", action="store_true")
    parser.add_argument("--operation")
    parser.add_argument("--args", default="{}")
    ns = parser.parse_args()
    if ns.serve:
        return serve()
    if ns.operation:
        return once(ns.operation, ns.args)
    parser.error("use --serve or --operation")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
