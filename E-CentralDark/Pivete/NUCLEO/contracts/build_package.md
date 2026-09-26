# CONTRATO - build_package.py
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_CentralDark-Pombo-Owner-FailClosed-20260824\CentralDark-Pombo-Owner-FailClosed-20260824\PATCH_TREE\scripts\trigger-fabric\build_package.py
**SHA:** d9dcc9533b3f7524
**Timestamp:** 2026-08-26T19:43:49.361911
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- raise SystemExit(f'PACKAGE_EXTRA_MISSING:{src.relative_to(ROOT)}')

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, shutil, zipfile

ROOT = Path(__file__).resolve().parents[2]
FAMILY = ROOT / 'docs' / 'ARQUITETURA' / 'CENTRALDARK-TRIGGER-FABRIC'
STAGE = ROOT / '.artifacts' / 'trigger-fabric' / 'CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE'
OUT = ROOT / '.artifacts' / 'trigger-fabric' / 'CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE.zip'
PNG = FAMILY / 'ARCHITECTURE.png'

if not PNG.exists():
    raise SystemExit('ARCHITECTURE.png missing; render ARCHITECTURE.mmd before packaging')

if STAGE.exists():
    shutil.rmtree(STAGE)
STAGE.mkdir(parents=True)

for p in sorted(FAMILY.iterdir()):
    if p.is_file():
        shutil.copy2(p, STAGE / p.name)

shutil.copy2(ROOT/'scripts'/'trigger-fabric'/'verify_package.py', STAGE/'verify_package.py')
shutil.copy2(ROOT/'scripts'/'trigger-fabric'/'build_package.py', STAGE/'build_package.py')

extras = {
    ROOT/'docs'/'CONSCIENCIA'/'02-PROTOCOLO-HANDOFF-IA.md': STAGE/'CANONICAL_HANDOFF_OWNER.md',
    ROOT/'docs'/'CONSCIENCIA'/'APRENDIZADOS'/'2026-08-24-pombo-correio-com-checksum.md': STAGE/'POMBO-CORREIO-COM-CHECKSUM.md',
    ROOT/'scripts'/'trigger-fabric'/'verify_repo_contract.py': STAGE/'verify_repo_contract.py',
    ROOT/'scripts'/'trigger-fabric'/'test_pombo_handoff_counterproof.py': STAGE/'test_pombo_handoff_counterproof.py',
    ROOT/'.github'/'workflows'/'trigger-fabric-package.yml': STAGE/'trigger-fabric-package.yml',
}
for src,dst in extras.items():
    if not src.exists():
        raise SystemExit(f'PACKAGE_EXTRA_MISSING:{src.relative_to(ROOT)}')
    shutil.copy2(src,dst)

def sha256(path):
    h=hashlib.sha256(); h.update(path.read_bytes()); return h.hexdigest()

files=[]
for p in sorted(x for x in STAGE.rglob('*') if x.is_file() and x.name not in {'MANIFEST.json','SHA256SUMS.txt'}):
    files.append({'path':p.relative_to(STAGE).as_posix(),'bytes':p.stat().st_size,'sha256':sha256(p)})

manifest={
  'schema':'centraldark.package.manifest.v1',
  'mission':'CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE',
  'global_runtime_100_percent':False,
  'pombo_canonical_owner_included':True,
  'pombo_negative_counterproof_included':True,
  'files':files
}
(STAGE/'MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

sums=[]
for p in sorted(x for x in STAGE.rglob('*') if x.is_file() and x.name!='SHA256SUMS.txt'):
    sums.append(f'{sha256(p)}  {p.relative_to(STAGE).as_posix()}')
(STAGE/'SHA256SUMS.txt').write_text('\n'.join(sums)+'\n',encoding='utf-8')

OUT.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(OUT,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in sorted(x for x in STAGE.rglob('*') if x.is_file()):
        info=zipfile.ZipInfo(f'CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE/{p.relative_to(STAGE).as_posix()}',date_time=(1980,1,1,0,0,0))
        info.compress_type=zipfile.ZIP_DEFLATED
        info.external_attr=0o644<<16
        z.writestr(info,p.read_bytes())

print(OUT)
print('ZIP_SHA256='+sha256(OUT))

```