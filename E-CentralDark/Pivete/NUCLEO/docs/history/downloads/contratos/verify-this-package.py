#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, sys

ROOT=Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()
manifest_path=ROOT/'MANIFEST.json'
if not manifest_path.exists():
    print('PACKAGE_VERIFY=FAIL')
    print('MANIFEST_MISSING')
    raise SystemExit(1)

manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
errors=[]

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

for item in manifest['files']:
    p=ROOT/item['path']
    if not p.exists():
        errors.append('MISSING:'+item['path'])
    elif sha(p)!=item['sha256']:
        errors.append('HASH_MISMATCH:'+item['path'])

required=[
 'LEIA-ME.md','DOCS/VEREDITO.md','DOCS/PR-BODY.md','DOCS/PATCH-MAP.md',
 'TOOLS/APPLY-LOCAL.ps1','TOOLS/PROVE-LOCAL.ps1',
 'PATCH_TREE/docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md',
 'PATCH_TREE/scripts/trigger-fabric/verify_repo_contract.py',
 'PATCH_TREE/scripts/trigger-fabric/test_pombo_handoff_counterproof.py',
 'PATCH_TREE/.github/workflows/trigger-fabric-package.yml',
 'PATCH_TREE/scripts/trigger-fabric/build_package.py',
 'PATCH_TREE/scripts/trigger-fabric/verify_package.py',
]
for rel in required:
    if not (ROOT/rel).exists():
        errors.append('REQUIRED_MISSING:'+rel)

if errors:
    print('PACKAGE_VERIFY=FAIL')
    print('\n'.join(errors))
    raise SystemExit(1)

print('PACKAGE_VERIFY=PASS')
print('UNKNOWN_IS_NOT_PASS=PASS')
print('OWNER_DIRECT_VERIFICATION_PATCH_PRESENT=PASS')
print('NEGATIVE_COUNTERPROOF_PATCH_PRESENT=PASS')
