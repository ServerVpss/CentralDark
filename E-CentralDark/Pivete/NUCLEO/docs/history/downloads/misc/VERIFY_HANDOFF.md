# OUTRO - VERIFY_HANDOFF.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\🔒PASTA TRANCADA APELO CHEFE🔒\.extracted_CENTRALDARK_FINAL_SINGLE_DELIVERY\03_PREVIOUSLY_LINKED_FILES\VERIFY_HANDOFF.py
**SHA:** f0e732875431adc3
**Timestamp:** 2026-08-27T15:29:11.623139
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- if req not in names: errors.append('INNER_REQUIRED_MISSING:'+req)
- if not p.exists(): errors.append('MISSING:'+rel)

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
from pathlib import Path
from zipfile import ZipFile
import hashlib, json, sys
ROOT=Path(__file__).resolve().parents[1]
def sha(p):
    h=hashlib.sha256()
    with open(p,'rb') as f:
        for c in iter(lambda:f.read(1024*1024),b''): h.update(c)
    return h.hexdigest()
errors=[]
inner=ROOT/'02_CANONICAL_ZIP_OBJECT'/'CENTRALDARK_CANONICAL_PROJECT_FINAL.zip'
side=ROOT/'03_PROOF_OF_CANONICAL_ZIP'/'CENTRALDARK_CANONICAL_PROJECT_FINAL.zip.sha256'
receipt=ROOT/'03_PROOF_OF_CANONICAL_ZIP'/'CENTRALDARK_CANONICAL_PROJECT_FINAL.EXTERNAL_RECEIPT.json'
if not inner.exists(): errors.append('INNER_ZIP_MISSING')
else:
    with ZipFile(inner) as z:
        if z.testzip() is not None: errors.append('INNER_ZIP_CRC_FAIL')
        names=set(z.namelist())
        for req in ['10_INTEGRITY/FINAL_RECEIPT_INTERNAL.json','10_INTEGRITY/MANIFEST.json','10_INTEGRITY/SHA256SUMS.txt']:
            if req not in names: errors.append('INNER_REQUIRED_MISSING:'+req)
    s=sha(inner)
    if side.exists() and side.read_text(encoding='utf-8').split()[0] != s: errors.append('INNER_SIDECAR_SHA_MISMATCH')
    if receipt.exists() and json.loads(receipt.read_text(encoding='utf-8')).get('zip_sha256') != s: errors.append('INNER_RECEIPT_SHA_MISMATCH')
# Envelope payload hashes (excludes the hash file and receipt itself by design)
hf=ROOT/'06_INTEGRITY'/'HANDOFF_SHA256SUMS.txt'
if not hf.exists(): errors.append('HANDOFF_HASHFILE_MISSING')
else:
    for line in hf.read_text(encoding='utf-8').splitlines():
        if not line.strip(): continue
        expected, rel=line.split('  ',1)
        p=ROOT/rel
        if not p.exists(): errors.append('MISSING:'+rel)
        elif sha(p)!=expected: errors.append('HASH_MISMATCH:'+rel)
print('PASS' if not errors else 'FAIL')
for e in errors: print(e)
sys.exit(0 if not errors else 2)

```