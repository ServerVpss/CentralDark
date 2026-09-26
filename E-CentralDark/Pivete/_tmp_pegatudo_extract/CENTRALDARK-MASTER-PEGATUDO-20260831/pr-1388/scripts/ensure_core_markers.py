#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
CORE = ROOT / "LEIA-ME-IA.md"

REQUIRED = [
    "REUSE_BEFORE_CREATE_REQUIRED=true",
    "ARCHITECTURE_LOCK=true",
    "UNKNOWN_IS_NOT_PASS=true",
    "EXECUTOR_CANNOT_SELF_APPROVE=true",
    "JUDGE_DOES_NOT_MUTATE=true",
    "GRAPH_IS_DERIVED_NOT_AUTHORITY=true",
]

if not CORE.exists():
    raise SystemExit("CORE_NOT_FOUND: LEIA-ME-IA.md")

text = CORE.read_text(encoding="utf-8")
missing = [m for m in REQUIRED if m not in text]

if not missing:
    print("CORE_MARKERS=PASS")
    print("CHANGED=0")
    raise SystemExit(0)

anchor = "REUSE_BEFORE_CREATE_REQUIRED=true"
if anchor not in text:
    raise SystemExit("ANCHOR_MISSING: refusing blind insertion")

block = "\n".join(m for m in REQUIRED if m != anchor and m in missing)
text = text.replace(anchor, anchor + "\n" + block, 1)
CORE.write_text(text, encoding="utf-8")

check = CORE.read_text(encoding="utf-8")
still = [m for m in REQUIRED if m not in check]
if still:
    raise SystemExit("CORE_MARKERS_RECHECK_FAILED: " + ",".join(still))

print("CORE_MARKERS=PASS")
print("CHANGED=1")
for m in missing:
    print("ADDED=" + m)
