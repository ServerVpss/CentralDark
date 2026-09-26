from pathlib import Path
import hashlib, json, zipfile, sys
root = Path(__file__).resolve().parents[1]
sums = root/'06_INTEGRITY'/'SHA256SUMS.txt'
errors=[]
for line in sums.read_text(encoding='utf-8').splitlines():
    if not line.strip(): continue
    expected, rel = line.split('  ',1)
    p=root/rel
    if not p.exists(): errors.append(f'MISSING {rel}'); continue
    got=hashlib.sha256(p.read_bytes()).hexdigest()
    if got != expected: errors.append(f'HASH {rel}')
for zrel in ['05_PROVENANCE/PREVIOUS_MASTER_HANDOFF.zip']:
    p=root/zrel
    try:
        with zipfile.ZipFile(p) as z:
            bad=z.testzip()
            if bad: errors.append(f'NESTED_ZIP_BAD {zrel}:{bad}')
    except Exception as e: errors.append(f'NESTED_ZIP_ERROR {zrel}:{e}')
print(json.dumps({'status':'PASS' if not errors else 'FAIL','errors':errors},ensure_ascii=False))
sys.exit(0 if not errors else 1)
