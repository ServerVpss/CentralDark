#!/usr/bin/env python3
"""CentralDark provider-control CLI.

Transport adapter only. Provider rules remain owned by the canonical MCP
provider control. This CLI talks to the existing FastAPI Arsenal surface.

Credentials are never accepted as command-line values. Authorization comes
from a local file path (CENTRALDARK_PROVIDER_BEARER_FILE or --bearer-file).
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import uuid
from pathlib import Path
from urllib import request as urlrequest, error as urlerror

DEFAULT_API = os.getenv("CENTRALDARK_PROVIDER_API_URL", "http://127.0.0.1:8083").rstrip("/")
DEFAULT_BEARER_FILE = os.getenv("CENTRALDARK_PROVIDER_BEARER_FILE", "").strip()


def fail(message: str, code: int = 2) -> None:
    print(json.dumps({"ok": False, "status": message}, ensure_ascii=False))
    raise SystemExit(code)


def load_bearer(path_text: str) -> str:
    if not path_text:
        fail("PROVIDER_BEARER_FILE_REQUIRED")
    path = Path(path_text)
    if not path.is_absolute():
        fail("PROVIDER_BEARER_FILE_MUST_BE_ABSOLUTE")
    try:
        if not path.is_file() or path.stat().st_size > 64_000:
            fail("PROVIDER_BEARER_FILE_INVALID")
        raw = path.read_text(encoding="utf-8").strip()
    except OSError:
        fail("PROVIDER_BEARER_FILE_UNREADABLE")
    if not raw:
        fail("PROVIDER_BEARER_FILE_EMPTY")
    return raw if raw.lower().startswith("bearer ") else f"Bearer {raw}"


def parse_json_object(raw: str, field: str) -> dict:
    try:
        value = json.loads(raw or "{}")
    except json.JSONDecodeError:
        fail(f"{field}_JSON_INVALID")
    if not isinstance(value, dict):
        fail(f"{field}_MUST_BE_OBJECT")
    return value


def call(api: str, bearer: str, method: str, path: str, payload: dict | None = None) -> tuple[int, dict]:
    body = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urlrequest.Request(
        f"{api}{path}",
        data=body,
        method=method,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": bearer,
        },
    )
    try:
        with urlrequest.urlopen(req, timeout=25) as resp:
            raw = resp.read(1_000_000).decode("utf-8", errors="replace")
            parsed = json.loads(raw) if raw else {}
            return int(resp.status), parsed if isinstance(parsed, dict) else {"data": parsed}
    except urlerror.HTTPError as exc:
        raw = exc.read(1_000_000).decode("utf-8", errors="replace")
        try:
            parsed = json.loads(raw) if raw else {}
        except Exception:
            parsed = {"ok": False, "status": f"HTTP_{exc.code}"}
        return int(exc.code), parsed if isinstance(parsed, dict) else {"data": parsed}
    except Exception as exc:
        return 1, {"ok": False, "status": "PROVIDER_FASTAPI_UNREACHABLE", "errorClass": type(exc).__name__}


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="CentralDark provider control via FastAPI")
    p.add_argument("--api", default=DEFAULT_API)
    p.add_argument("--bearer-file", default=DEFAULT_BEARER_FILE)
    sub = p.add_subparsers(dest="command", required=True)

    sub.add_parser("credentials")

    cap = sub.add_parser("capabilities")
    cap.add_argument("--provider", choices=["cloudflare", "contabo"])

    read = sub.add_parser("read")
    read.add_argument("--provider", required=True, choices=["cloudflare", "contabo"])
    read.add_argument("--capability", required=True)
    read.add_argument("--params", default="{}", help="JSON object with allowed path/query params")

    mutate = sub.add_parser("mutate")
    mutate.add_argument("--provider", required=True, choices=["cloudflare", "contabo"])
    mutate.add_argument("--capability", required=True)
    mutate.add_argument("--params", default="{}", help="JSON object with allowed path/query/body params")
    mutate.add_argument("--idempotency-key", default="")
    mutate.add_argument("--confirm-admin", required=True, help="Non-secret confirmation required by the canonical dispatcher")
    mutate.add_argument("--expected-amount", type=float)
    mutate.add_argument("--currency")
    return p


def main() -> int:
    args = parser().parse_args()
    api = str(args.api).rstrip("/")
    if not (api.startswith("http://127.0.0.1:") or api.startswith("http://localhost:") or api.startswith("https://")):
        fail("PROVIDER_API_URL_NOT_ALLOWED")
    bearer = load_bearer(args.bearer_file)

    if args.command == "credentials":
        status, out = call(api, bearer, "GET", "/arsenal/providers/credentials")
    elif args.command == "capabilities":
        suffix = f"?provider={args.provider}" if args.provider else ""
        status, out = call(api, bearer, "GET", f"/arsenal/providers/capabilities{suffix}")
    elif args.command == "read":
        payload = {
            "provider": args.provider,
            "capability": args.capability,
            "params": parse_json_object(args.params, "PARAMS"),
        }
        status, out = call(api, bearer, "POST", "/arsenal/providers/read", payload)
    else:
        payload = {
            "provider": args.provider,
            "capability": args.capability,
            "params": parse_json_object(args.params, "PARAMS"),
            "idempotencyKey": args.idempotency_key or str(uuid.uuid4()),
            "confirmAdmin": args.confirm_admin,
        }
        if args.expected_amount is not None:
            payload["expectedAmount"] = args.expected_amount
        if args.currency:
            payload["currency"] = args.currency.upper()
        status, out = call(api, bearer, "POST", "/arsenal/providers/mutate", payload)

    print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0 if 200 <= status < 300 and out.get("ok", True) is not False else 1


if __name__ == "__main__":
    raise SystemExit(main())
