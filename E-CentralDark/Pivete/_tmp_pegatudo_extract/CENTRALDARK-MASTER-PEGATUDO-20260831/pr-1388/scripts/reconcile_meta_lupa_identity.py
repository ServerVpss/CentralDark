#!/usr/bin/env python3
from pathlib import Path
import subprocess, sys

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
SKILL = ROOT / ".agents/skills/meta-lupa/SKILL.md"
IDENT = ROOT / ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA"

if not SKILL.exists():
    raise SystemExit("META_LUPA_SKILL_NOT_FOUND")

rel = SKILL.relative_to(ROOT).as_posix()
blob = subprocess.check_output(["git", "-C", str(ROOT), "hash-object", rel], text=True).strip()
expected = f"{blob}  {rel}\n"
old = IDENT.read_text(encoding="utf-8") if IDENT.exists() else ""

IDENT.parent.mkdir(parents=True, exist_ok=True)
IDENT.write_text(expected, encoding="utf-8")

again = subprocess.check_output(["git", "-C", str(ROOT), "hash-object", rel], text=True).strip()
if again != blob:
    raise SystemExit("META_LUPA_IDENTITY_RECHECK_FAILED")

print(f"META_LUPA_BLOB={blob}")
print(f"IDENTITY_UPDATED={1 if old != expected else 0}")
