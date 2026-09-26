from pathlib import Path
import hashlib, json
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/"MANIFEST.json").read_text(encoding="utf-8"))
errors=[]
for item in manifest["files"]:
    p=root/item["path"]
    if not p.exists(): errors.append("MISSING "+item["path"]); continue
    got=hashlib.sha256(p.read_bytes()).hexdigest()
    if got!=item["sha256"]: errors.append("HASH "+item["path"])
print(f"FILES={len(manifest['files'])}")
print(f"ERRORS={len(errors)}")
for e in errors: print(e)
raise SystemExit(1 if errors else 0)
