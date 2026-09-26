#!/usr/bin/env python3
"""Normalize emoji list items from HTML into CentralDark's local visual registry.

This is a presentation-data importer. External text is discarded; only short
Unicode symbol values are stored. The external source is never an authority.
"""
from __future__ import annotations
import argparse
import html
import json
import re
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = ROOT / "ui" / "emoji-tui" / "emoji-registry.full.json"

EMOJI_RANGES = (
    (0x1F000, 0x1FAFF),
    (0x2600, 0x27BF),
    (0x2300, 0x23FF),
    (0x2B00, 0x2BFF),
)
EXTRA = {0x200D, 0xFE0E, 0xFE0F, 0x20E3}


def is_emojiish_char(ch: str) -> bool:
    cp = ord(ch)
    return cp in EXTRA or any(lo <= cp <= hi for lo, hi in EMOJI_RANGES) or 0x1F1E6 <= cp <= 0x1F1FF


def normalize_candidate(text: str) -> str | None:
    s = html.unescape(text).strip()
    if not s or len(s) > 32:
        return None
    if not any(is_emojiish_char(ch) for ch in s):
        return None
    # Reject descriptive prose. Keep emoji sequences plus joiners/selectors/keycap digits.
    allowed_ascii = set("0123456789#* ")
    for ch in s:
        if is_emojiish_char(ch) or ch in allowed_ascii:
            continue
        return None
    return s.replace(" ", "")


class LICollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_li = False
        self.buf: list[str] = []
        self.items: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "li":
            self.in_li = True
            self.buf = []

    def handle_data(self, data):
        if self.in_li:
            self.buf.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "li" and self.in_li:
            self.items.append("".join(self.buf))
            self.in_li = False
            self.buf = []


def read_source(args) -> str:
    if args.html:
        return Path(args.html).read_text(encoding="utf-8", errors="replace")
    req = urllib.request.Request(args.url, headers={"User-Agent": "CentralDark-Emoji-Registry/1.0"})
    with urllib.request.urlopen(req, timeout=args.timeout) as r:
        return r.read().decode("utf-8", errors="replace")


def main() -> int:
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--url")
    g.add_argument("--html")
    ap.add_argument("--timeout", type=int, default=20)
    ap.add_argument("--out", default=str(DEFAULT_OUT))
    ns = ap.parse_args()

    raw = read_source(ns)
    p = LICollector(); p.feed(raw)
    vals = []
    seen = set()
    for item in p.items:
        v = normalize_candidate(item)
        if v and v not in seen:
            seen.add(v); vals.append(v)

    out = {
        "schema": "CENTRALDARK_EMOJI_REGISTRY_FULL",
        "schema_version": 1,
        "authority": False,
        "source_ref": ns.url or str(Path(ns.html).resolve()),
        "count": len(vals),
        "emoji": vals,
    }
    path = Path(ns.out)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"EMOJI_COUNT={len(vals)}")
    print(f"OUT={path}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
