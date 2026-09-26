#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,sys
root=Path(__file__).resolve().parents[1]
def h(p):
 x=hashlib.sha256();
 with open(p,'rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''): x.update(b)
 return x.hexdigest()
m=json.loads((root/'04_INTEGRITY/DELIVERY_MANIFEST.json').read_text(encoding='utf-8'))
errs=[]
for e in m['payload']:
 p=root/e['path']
 if not p.exists(): errs.append('MISSING '+e['path']); continue
 if h(p)!=e['sha256']: errs.append('HASH '+e['path'])
print('PASS' if not errs else 'FAIL')
for e in errs: print(e)
sys.exit(0 if not errs else 1)
