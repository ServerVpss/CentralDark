#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, sys
root=Path(__file__).resolve().parent
m=json.loads((root/'MANIFEST.json').read_text(encoding='utf-8'))
fail=[]
for item in m['files']:
    p=root/item['path']
    if not p.exists(): fail.append((item['path'],'MISSING')); continue
    h=hashlib.sha256(p.read_bytes()).hexdigest()
    if h!=item['sha256']: fail.append((item['path'],'HASH_MISMATCH'))
print(f"FILES_VERIFIED={len(m['files'])-len(fail)}")
print('VERIFY=FAIL' if fail else 'VERIFY=PASS')
if fail:
    print(fail); sys.exit(1)
