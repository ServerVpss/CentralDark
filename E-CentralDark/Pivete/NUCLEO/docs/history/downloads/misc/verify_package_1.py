#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, zipfile, sys
root=Path(__file__).resolve().parents[1]
errors=[]

def h(p):
    x=hashlib.sha256()
    with open(p,'rb') as f:
        for c in iter(lambda:f.read(1024*1024),b''): x.update(c)
    return x.hexdigest()

manifest=json.loads((root/'07_INTEGRITY/MANIFEST.json').read_text(encoding='utf-8'))
for rel in manifest['required_files']:
    if not (root/rel).is_file(): errors.append(f'MISSING {rel}')

for line in (root/'07_INTEGRITY/SHA256SUMS.txt').read_text(encoding='utf-8').splitlines():
    if not line.strip(): continue
    expected, rel=line.split('  ',1)
    p=root/rel
    if not p.is_file(): errors.append(f'HASH_MISSING {rel}'); continue
    got=h(p)
    if got!=expected: errors.append(f'HASH_MISMATCH {rel}')

chars=len((root/'01_CANONICAL/PROJECT_INSTRUCTIONS_COMPACT.md').read_text(encoding='utf-8'))
if chars>8000: errors.append(f'PROJECT_INSTRUCTIONS_TOO_LONG {chars}')

for rel in manifest['historical_zips']:
    p=root/rel
    try:
        with zipfile.ZipFile(p) as z:
            bad=z.testzip()
            if bad: errors.append(f'NESTED_ZIP_BAD {rel}:{bad}')
    except Exception as e: errors.append(f'NESTED_ZIP_ERROR {rel}:{e}')

if errors:
    print('FAIL')
    print('\n'.join(errors))
    sys.exit(1)
print('PASS')
print(f'project_instructions_chars={chars}')
print(f'required_files={len(manifest["required_files"])}')
print('hashes=PASS')
print('nested_zips=PASS')
