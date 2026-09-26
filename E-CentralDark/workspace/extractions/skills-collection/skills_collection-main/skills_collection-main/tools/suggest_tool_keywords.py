#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


FENCE_RE = re.compile(r"^```")

# Keep short and safe: avoid enormous token space.
STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "but",
    "by",
    "for",
    "from",
    "has",
    "have",
    "how",
    "i",
    "if",
    "in",
    "into",
    "is",
    "it",
    "its",
    "of",
    "on",
    "or",
    "our",
    "should",
    "that",
    "the",
    "their",
    "then",
    "this",
    "to",
    "use",
    "when",
    "with",
    "you",
    "your",
}

# Common tokens that are artifacts of this repo's skill-file templates/index fields.
DEFAULT_IGNORE_TOKENS = {
    "claude",
    "skill",
    "skills",
    "skill.md",
    "collection",
    "github.com",
    "https",
    "blob",
    "sha",
    "html_url",
    "local_path",
    "discovered_at",
    "references",
    "workflow",
    "validation",
    "documentation",
    "example",
    "examples",
    "context",
    "phase",
    "structure",
    "pattern",
    "patterns",
}

# Some multi-word phrases worth tracking even if tokenization splits them.
PHRASES = [
    "github actions",
    "gitlab ci",
    "app router",
    "pages router",
    "cloudflare workers",
    "cloudflare r2",
    "google cloud",
    "azure devops",
    "openai api",
    "anthropic claude",
    "prompt engineering",
    "vector db",
    "vector database",
    "feature flags",
    "unit tests",
    "integration tests",
    "end to end",
]


@dataclass(frozen=True)
class ScanResult:
    tokens: Counter[str]
    bigrams: Counter[str]
    phrases: Counter[str]


def strip_code_blocks(markdown: str) -> str:
    lines = markdown.splitlines()
    out: list[str] = []
    in_fence = False
    for line in lines:
        if FENCE_RE.match(line.strip()):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        out.append(line)
    return "\n".join(out)


def iter_files(collection_dir: Path) -> Iterable[Path]:
    for p in sorted(collection_dir.glob("*")):
        if p.is_file():
            yield p


TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9+._-]{1,}" )


def _looks_like_datetime_token(token: str) -> bool:
    # e.g. 2025-12-30t23
    return bool(re.match(r"^20\d{2}-\d{2}-\d{2}t\d{1,2}$", token))


def tokenize(text: str, ignore: set[str]) -> list[str]:
    text = text.lower()
    # normalize some separators
    text = text.replace("/", " ")
    toks = TOKEN_RE.findall(text)

    # drop obvious noise
    cleaned: list[str] = []
    for t in toks:
        if len(t) < 3:
            continue
        if t in STOPWORDS:
            continue
        if t in ignore:
            continue
        if _looks_like_datetime_token(t):
            continue
        if t.isdigit():
            continue
        cleaned.append(t)
    return cleaned


def scan(collection_dir: Path, ignore: set[str]) -> ScanResult:
    token_counts: Counter[str] = Counter()
    bigram_counts: Counter[str] = Counter()
    phrase_counts: Counter[str] = Counter()

    for path in iter_files(collection_dir):
        try:
            raw = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            raw = path.read_text(encoding="utf-8", errors="replace")

        body = strip_code_blocks(raw)

        # phrases
        low = body.lower()
        for ph in PHRASES:
            if ph in low:
                phrase_counts[ph] += low.count(ph)

        toks = tokenize(body, ignore)
        token_counts.update(toks)

        for a, b in zip(toks, toks[1:]):
            bigram_counts[f"{a} {b}"] += 1

    return ScanResult(tokens=token_counts, bigrams=bigram_counts, phrases=phrase_counts)


def main() -> int:
    ap = argparse.ArgumentParser(description="Suggest common tool/framework keywords from collection/")
    ap.add_argument("--collection-dir", default="collection")
    ap.add_argument("--top", type=int, default=80)
    ap.add_argument("--min", dest="min_count", type=int, default=15)
    ap.add_argument(
        "--ignore",
        action="append",
        default=[],
        help="Ignore token (can be passed multiple times).",
    )
    ap.add_argument("--out", default="", help="Optional JSON output path")

    args = ap.parse_args()

    root = Path(__file__).resolve().parents[1]
    collection_dir = (root / args.collection_dir).resolve()
    if not collection_dir.exists():
        raise SystemExit(f"collection dir not found: {collection_dir}")

    ignore = set(DEFAULT_IGNORE_TOKENS)
    ignore.update([x.strip().lower() for x in args.ignore if x.strip()])

    result = scan(collection_dir, ignore)

    top_tokens = [(k, v) for k, v in result.tokens.most_common(args.top) if v >= args.min_count]
    top_bigrams = [(k, v) for k, v in result.bigrams.most_common(args.top) if v >= args.min_count]
    top_phrases = [(k, v) for k, v in result.phrases.most_common(args.top) if v >= max(3, args.min_count // 3)]

    report = {
        "collection_dir": str(collection_dir),
        "top": args.top,
        "min": args.min_count,
        "ignore": sorted(ignore),
        "tokens": top_tokens,
        "bigrams": top_bigrams,
        "phrases": top_phrases,
    }

    if args.out:
        out_path = (root / args.out).resolve()
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Wrote {out_path}")
    else:
        print("\n== Tokens ==")
        for k, v in top_tokens[: args.top]:
            print(f"{v:>6}  {k}")

        print("\n== Bigrams ==")
        for k, v in top_bigrams[: args.top]:
            print(f"{v:>6}  {k}")

        print("\n== Phrases ==")
        for k, v in top_phrases[: args.top]:
            print(f"{v:>6}  {k}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
