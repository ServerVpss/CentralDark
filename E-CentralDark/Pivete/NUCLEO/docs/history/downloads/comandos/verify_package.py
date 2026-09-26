#!/usr/bin/env python3
from pathlib import Path
from zipfile import ZipFile
import hashlib, json, sys, tempfile, shutil
root=Path(__file__).resolve().parents[1]
required=[
 '00_START_HERE/README.md','01_CANONICAL/CENTRALDARK_PROJECT_CONTRACT.md',
 '01_CANONICAL/CENTRALDARK_PROJECT_CANONICAL.mmd','02_STATE_RECONCILIATION/LIVE_STATE.json',
 '03_CHATGPT_CROSS_SESSION/COVERAGE_RECEIPT.json','06_PROOF_COUNTERPROOF/COUNTERPROOF.md',
 '06_PROOF_COUNTERPROOF/PROJECT_FIXED_POINT_CHECK.json','10_INTEGRITY/MANIFEST.json',
 '10_INTEGRITY/FINAL_RECEIPT_INTERNAL.json','10_INTEGRITY/SHA256SUMS.txt'
]
errs=[]
for r in required:
    if not (root/r).is_file(): errs.append('missing:'+r)
# verify hashes: sums file excludes itself
for line in (root/'10_INTEGRITY/SHA256SUMS.txt').read_text(encoding='utf-8').splitlines():
    if not line.strip(): continue
    h, rel=line.split('  ',1)
    p=root/rel
    if not p.is_file(): errs.append('hash-missing:'+rel); continue
    hh=hashlib.sha256(p.read_bytes()).hexdigest()
    if hh!=h: errs.append('hash-mismatch:'+rel)
# semantic gates
fp=json.loads((root/'06_PROOF_COUNTERPROOF/PROJECT_FIXED_POINT_CHECK.json').read_text(encoding='utf-8'))
if fp.get('verdict')=='PROVEN': errs.append('project-global-fixed-point-overclaimed')
receipt=json.loads((root/'10_INTEGRITY/FINAL_RECEIPT_INTERNAL.json').read_text(encoding='utf-8'))
if not receipt.get('receipt_is_inside_package'): errs.append('internal-receipt-flag-false')
# nested zips
for z in (root/'07_HANDOFF_HISTORY').glob('*.zip'):
    try:
        with ZipFile(z) as f:
            if f.testzip() is not None: errs.append('nested-zip-crc:'+z.name)
    except Exception as e: errs.append('nested-zip-open:'+z.name+':'+str(e))
print('PASS' if not errs else 'FAIL')
for e in errs: print(e)
sys.exit(0 if not errs else 1)
