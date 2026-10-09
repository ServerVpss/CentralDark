#!/usr/bin/env python3
"""CentralDark Destilador: one read-only Moltbook consultation per UTC day.

External content is untrusted candidate data, never executable instructions.
No posting, commenting, voting, credential output or direct Git mutations.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import pathlib
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request

BASE = "https://www.moltbook.com/api/v1"
CREDENTIAL = pathlib.Path("/root/.config/moltbook/credentials.json")
STATE_DIR = pathlib.Path("/root/.hermes/state/centraldark-destilador/moltbook")
LIMIT = 10
MAX_BYTES = 240_000


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def private_credentials(path=CREDENTIAL):
    if not path.is_file() or (path.stat().st_mode & 0o077):
        raise ValueError("CREDENTIAL_MISSING_OR_PERMISSIONS")
    doc = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(doc, dict):
        raise ValueError("CREDENTIAL_SCHEMA")
    secret = doc.get("api_key")
    if not isinstance(secret, str) or len(secret) < 15:
        raise ValueError("CREDENTIAL_UNAVAILABLE")
    return secret


def get_json(path, secret, opener=None):
    if path not in ("/agents/status", "/posts?sort=new&limit=10"):
        raise ValueError("ROUTE_NOT_ALLOWLISTED")
    url = BASE + path
    if urllib.parse.urlsplit(url).hostname != "www.moltbook.com":
        raise ValueError("HOST_NOT_ALLOWLISTED")
    if opener is None:
        opener = urllib.request.build_opener(
            urllib.request.HTTPSHandler(context=ssl.create_default_context()),
            NoRedirect(),
        )
    request = urllib.request.Request(url, headers={
        "Authorization": "Bearer " + secret,
        "Accept": "application/json",
        "User-Agent": "CentralDark-Destilador-ReadOnly/1",
    }, method="GET")
    with opener.open(request, timeout=12) as response:
        if response.status != 200 or response.url != url:
            raise ValueError("HTTP_NOT_PROVEN_OR_REDIRECT")
        raw = response.read(MAX_BYTES + 1)
        if len(raw) > MAX_BYTES:
            raise ValueError("RESPONSE_TOO_LARGE")
        return json.loads(raw)


def cleaned(value):
    if not isinstance(value, str):
        return ""
    value = re.sub(r"moltbook_sk_[A-Za-z0-9_-]+", "[REDACTED_KEY]", value)
    value = re.sub(r"(?i)bearer\s+[A-Za-z0-9_.-]{12,}", "[REDACTED_AUTH]", value)
    value = re.sub(r"[\x00-\x1f\x7f]+", " ", value)
    return value.strip()[:180]


def classify_claim(payload):
    if not isinstance(payload, dict):
        return "UNKNOWN"
    raw = payload.get("status")
    if raw is None and isinstance(payload.get("agent"), dict):
        raw = payload["agent"].get("status")
    return "CLAIMED" if raw in ("claimed", "active", "verified") else "NOT_CLAIMED" if raw in ("pending_claim", "unclaimed") else "UNKNOWN"


def candidates(payload):
    if isinstance(payload, dict):
        posts = payload.get("posts", payload.get("data"))
    else:
        posts = payload
    if not isinstance(posts, list):
        raise ValueError("RESPONSE_SCHEMA_UNKNOWN")
    result = []
    for item in posts[:LIMIT]:
        if not isinstance(item, dict):
            continue
        ident = item.get("id")
        if not isinstance(ident, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,100}", ident):
            continue
        title = cleaned(item.get("title"))
        if not title:
            continue
        digest = hashlib.sha256((ident + "\n" + title).encode()).hexdigest()
        result.append({
            "id": ident,
            "title": title,
            "source": BASE + "/posts/" + ident,
            "sha256": digest,
            "classification": "EXTERNAL_CANDIDATE_UNTRUSTED",
        })
    return result


def atomic_private_json(path, value):
    path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    os.chmod(path.parent, 0o700)
    temporary = path.with_suffix(".stage-" + str(os.getpid()))
    fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(value, f, ensure_ascii=False, sort_keys=True, indent=2)
            f.write("\n")
        os.replace(temporary, path)
    finally:
        if temporary.exists():
            temporary.unlink()


def run(now=None, credential=CREDENTIAL, state_dir=STATE_DIR, fetch=None):
    day = (now or dt.datetime.now(dt.timezone.utc)).date().isoformat()
    dest = state_dir / (day + ".json")
    if dest.is_file():
        saved = json.loads(dest.read_text(encoding="utf-8"))
        return {"status": "REUSE_DAILY_RECEIPT", "utc_day": day,
                "count": saved.get("count", 0), "receipt_path": str(dest)}
    secret = private_credentials(credential)
    fetcher = fetch or get_json
    claimed = classify_claim(fetcher("/agents/status", secret))
    if claimed != "CLAIMED":
        raise ValueError("CLAIM_NOT_PROVEN")
    items = candidates(fetcher("/posts?sort=new&limit=10", secret))
    fp = hashlib.sha256(json.dumps(items, sort_keys=True).encode()).hexdigest()
    receipt = {"utc_day": day, "source": BASE, "account": "centraldarkhermes",
               "read_only": True, "claimed": "CLAIMED",
               "classification": "EXTERNAL_CANDIDATE_NOT_PROVEN",
               "count": len(items), "fingerprint": fp, "candidates": items,
               "next_cursor": "KNOWLEDGE_COMPILER_DEDUPE_COUNTERPROOF"}
    atomic_private_json(dest, receipt)
    return {"status": "READONLY_DAILY_CAPTURED", "utc_day": day,
            "count": len(items), "fingerprint": fp, "receipt_path": str(dest)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--daily", action="store_true", required=True)
    args = parser.parse_args()
    try:
        result = run()
    except (OSError, ValueError, urllib.error.URLError, json.JSONDecodeError) as exc:
        if isinstance(exc, urllib.error.HTTPError):
            reason = "HTTP_" + str(exc.code)
        elif isinstance(exc, ValueError) and exc.args and str(exc.args[0]).isupper():
            reason = str(exc.args[0])
        else:
            reason = type(exc).__name__
        print(json.dumps({"status": "MOLTBOOK_READONLY_PLAQUE",
                          "reason": reason, "no_secret_printed": True,
                          "next_cursor": "CHECK_EXISTING_VPS_CREDENTIAL_AND_CLAIM"}))
        return 2
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
