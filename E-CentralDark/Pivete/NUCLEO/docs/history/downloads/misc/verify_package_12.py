#!/usr/bin/env python3
from pathlib import Path
import hashlib, sys

root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd()
checks = root / "SHA256SUMS.txt"
if not checks.exists():
    print("VERIFY=FAIL missing SHA256SUMS.txt")
    raise SystemExit(1)

failed = 0
for line in checks.read_text(encoding="utf-8").splitlines():
    if not line.strip():
        continue
    expected, rel = line.split("  ", 1)
    p = root / rel
    if not p.exists():
        print(f"FAIL missing {rel}")
        failed += 1
        continue
    actual = hashlib.sha256(p.read_bytes()).hexdigest()
    if actual != expected:
        print(f"FAIL hash {rel}")
        failed += 1

if failed:
    print(f"VERIFY=FAIL failures={failed}")
    raise SystemExit(1)
print("VERIFY=PASS")
