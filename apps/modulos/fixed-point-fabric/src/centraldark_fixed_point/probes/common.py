from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any


def fetch_json(url: str, headers: dict[str, str] | None = None, timeout: float = 5.0) -> tuple[int, Any]:
    request = urllib.request.Request(url, headers=headers or {"Accept": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = response.read().decode("utf-8", errors="replace")
            return response.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            payload = {"error": body[:500]}
        return error.code, payload
