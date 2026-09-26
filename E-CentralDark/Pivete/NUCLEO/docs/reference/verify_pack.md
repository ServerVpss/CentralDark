# REFERENCIA - verify_pack.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\🔒PASTA TRANCADA APELO CHEFE🔒\.extracted_CENTRALDARK_BIOCOGNITIVE_OPENAI_NEURAL_ATLAS_ONE_FINAL_PACKAGE\CENTRALDARK_BIOCOGNITIVE_OPENAI_NEURAL_ATLAS\verify_pack.py
**SHA:** c0754e49bba8bae4
**Timestamp:** 2026-08-27T15:29:08.722312
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- if not (root/rel).exists(): errors.append('MISSING:'+rel)
- if not p.exists(): errors.append('MANIFEST_MISSING:'+it['path'])

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, sys, csv
root=Path(__file__).resolve().parent

def sha(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):
            h.update(chunk)
    return h.hexdigest()

required=[
 'CENTRALDARK_BIOCOGNITIVE_OPENAI_NEURAL_ATLAS.png',
 'CENTRALDARK_BIOCOGNITIVE_OPENAI_NEURAL_ATLAS.md',
 'CENTRALDARK_BIOCOGNITIVE_OPENAI_NEURAL_ATLAS.mmd',
 'SESSION_ANIMAL_INVENTORY.json','TAXONOMY_DEDUPE.md','CAPABILITY_MATRIX.csv',
 'BIOCOGNITIVE_CATALOG.md','LIVE_STATE.md','HISTORY.md','COUNTERPROOF.md','RASTRO.md','RECEIPT.md',
 'SOURCE_INDEX.md','TRACE.jsonl','OPENAI_NEURAL_ARCHITECTURES.md','CROSS_AGENT_DENOMINATOR.md','MANIFEST.json','MANIFEST.sha256','SHA256SUMS.txt'
]
errors=[]
for rel in required:
    if not (root/rel).exists(): errors.append('MISSING:'+rel)

inv=json.loads((root/'SESSION_ANIMAL_INVENTORY.json').read_text(encoding='utf-8'))
expected={'Formigas','Abelhas','Polvos','Corvídeos','Corvo','Papagaios','Elefantes','Cetáceos','Primatas','Macaco','Roedores','Peixes','Invertebrados','Predador','Presa'}
actual={x['entity'] for x in inv['items']}
if inv.get('count')!=15 or actual!=expected:
    errors.append(f'INVENTORY_MISMATCH count={inv.get("count")} actual={sorted(actual)}')

m=json.loads((root/'MANIFEST.json').read_text(encoding='utf-8'))
for it in m['files']:
    p=root/it['path']
    if not p.exists(): errors.append('MANIFEST_MISSING:'+it['path'])
    elif sha(p)!=it['sha256']: errors.append('HASH_MISMATCH:'+it['path'])

mh=(root/'MANIFEST.sha256').read_text(encoding='utf-8').split()[0]
if mh!=sha(root/'MANIFEST.json'): errors.append('MANIFEST_HASH_MISMATCH')

if errors:
    print('VERIFY=FAIL')
    print('\n'.join(errors))
    sys.exit(1)
print('VERIFY=PASS')
print('SESSION_ANIMAL_INVENTORY=15/15')
print('ZERO_REGRESSION_SCOPE=RECOVERED_SESSION_INVENTORY')

```