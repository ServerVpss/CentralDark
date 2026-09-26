from pathlib import Path
import hashlib, json, sys

root = Path(__file__).resolve().parent
manifest = json.loads((root / "MANIFEST.json").read_text(encoding="utf-8"))
errors = []

for item in manifest["files"]:
    p = root / item["path"]
    if not p.exists():
        errors.append(f"MISSING {item['path']}")
        continue
    data = p.read_bytes()
    h = hashlib.sha256(data).hexdigest()
    if h != item["sha256"]:
        errors.append(f"HASH_MISMATCH {item['path']}")
    if len(data) != item["bytes"]:
        errors.append(f"SIZE_MISMATCH {item['path']}")

if errors:
    print("VERIFY=FAIL")
    for e in errors:
        print(e)
    sys.exit(1)

print("VERIFY=PASS")
print(f"FILES_VERIFIED={len(manifest['files'])}")
