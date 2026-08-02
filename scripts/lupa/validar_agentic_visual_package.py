#!/usr/bin/env python3
"""Valida fontes visuais versionadas e, quando fornecido, o ZIP original."""
from __future__ import annotations
import argparse, hashlib, json, struct, sys, zipfile
from pathlib import Path
from typing import Any

DEFAULT_MANIFEST = Path('.agents/skills/agentic-ci-loop/references/school.manifest.json')
EXPECTED_MEMBERS = {
    'centraldark-agentic-loop-4k-completo.png': 'png_complete_sha256',
    'centraldark-agentic-loop-4k-clean.png': 'png_clean_sha256',
    'centraldark-agentic-loop-editavel.svg': 'svg_sha256',
    'LEIA-ME.txt': 'readme_sha256',
}

def sha256_bytes(data: bytes) -> str: return hashlib.sha256(data).hexdigest()
def sha256_file(path: Path) -> str:
    h=hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''): h.update(chunk)
    return h.hexdigest()
def png_dimensions(data: bytes) -> tuple[int,int]:
    if len(data)<24 or data[:8]!=b'\x89PNG\r\n\x1a\n' or data[12:16]!=b'IHDR': raise ValueError('PNG_HEADER_INVALID')
    return struct.unpack('>II',data[16:24])
def load_manifest(path: Path)->dict[str,Any]:
    m=json.loads(path.read_text(encoding='utf-8'))
    if m.get('schema_version')!=1: raise ValueError('SCHOOL_SCHEMA_INVALID')
    if not isinstance(m.get('source_artifacts'),dict): raise ValueError('SOURCE_ARTIFACTS_INVALID')
    return m

def validate_sources(repo_root:Path, manifest_path:Path=DEFAULT_MANIFEST)->dict[str,Any]:
    a=load_manifest(repo_root/manifest_path)['source_artifacts']
    svg_rel=a.get('visual_source_svg_path'); readme_rel=a.get('visual_readme_path')
    if not isinstance(svg_rel,str) or not isinstance(readme_rel,str): raise ValueError('VISUAL_SOURCE_PATHS_MISSING')
    svg=repo_root/svg_rel; readme=repo_root/readme_rel
    if not svg.is_file(): raise ValueError(f'VISUAL_SVG_MISSING:{svg_rel}')
    if not readme.is_file(): raise ValueError(f'VISUAL_README_MISSING:{readme_rel}')
    svg_digest=sha256_file(svg); readme_digest=sha256_file(readme)
    if svg_digest!=a.get('visual_source_svg_sha256'): raise ValueError('VISUAL_SVG_SHA_MISMATCH')
    if readme_digest!=a.get('visual_readme_source_sha256'): raise ValueError('VISUAL_README_SHA_MISMATCH')
    if svg_digest!=a.get('svg_sha256'): raise ValueError('VISUAL_SVG_SOURCE_MEMBER_MISMATCH')
    if readme_digest!=a.get('readme_sha256'): raise ValueError('VISUAL_README_SOURCE_MEMBER_MISMATCH')
    return {'source_status':'PASS','svg_sha256':svg_digest,'readme_sha256':readme_digest,'binary_storage':a.get('visual_binary_storage')}

def validate_zip(source_zip:Path, artifacts:dict[str,Any])->dict[str,Any]:
    if not source_zip.is_file(): raise ValueError(f'VISUAL_ZIP_MISSING:{source_zip}')
    raw=source_zip.read_bytes(); actual=sha256_bytes(raw)
    if actual!=artifacts.get('visual_zip_sha256'): raise ValueError(f'VISUAL_ZIP_SHA_MISMATCH:{actual}')
    if len(raw)!=artifacts.get('visual_zip_bytes'): raise ValueError(f'VISUAL_ZIP_SIZE_MISMATCH:{len(raw)}')
    members=[]
    with zipfile.ZipFile(source_zip) as z:
        bad=z.testzip()
        if bad is not None: raise ValueError(f'VISUAL_ZIP_CORRUPT:{bad}')
        if sorted(z.namelist())!=sorted(EXPECTED_MEMBERS): raise ValueError(f'VISUAL_ZIP_MEMBERS_INVALID:{z.namelist()}')
        for name,key in EXPECTED_MEMBERS.items():
            data=z.read(name); digest=sha256_bytes(data)
            if digest!=artifacts.get(key): raise ValueError(f'VISUAL_MEMBER_SHA_MISMATCH:{name}:{digest}')
            item={'name':name,'bytes':len(data),'sha256':digest}
            if name.endswith('.png'):
                w,h=png_dimensions(data)
                if (w,h)!=(3840,2160): raise ValueError(f'VISUAL_PNG_DIMENSIONS_INVALID:{name}:{w}x{h}')
                item['dimensions']=f'{w}x{h}'
            members.append(item)
    return {'zip_status':'PASS','package_sha256':actual,'package_bytes':len(raw),'members':members}

def validate_package(repo_root:Path, manifest_path:Path=DEFAULT_MANIFEST, source_zip:Path|None=None)->dict[str,Any]:
    manifest=load_manifest(repo_root/manifest_path); report={'schema_version':1,'status':'PARTIAL_SOURCE_ONLY',**validate_sources(repo_root,manifest_path)}
    if source_zip is not None:
        report.update(validate_zip(source_zip,manifest['source_artifacts'])); report['status']='PASS'
    return report

def main()->int:
    p=argparse.ArgumentParser(); p.add_argument('--repo-root',default='.'); p.add_argument('--manifest',default=str(DEFAULT_MANIFEST)); p.add_argument('--source-zip'); p.add_argument('--require-zip',action='store_true'); p.add_argument('--json',action='store_true'); a=p.parse_args()
    try:
        report=validate_package(Path(a.repo_root).resolve(),Path(a.manifest),Path(a.source_zip).resolve() if a.source_zip else None)
        if a.require_zip and report['status']!='PASS': raise ValueError('VISUAL_ZIP_REQUIRED_BUT_NOT_PROVIDED')
    except Exception as e:
        print(f'STATUS=BLOCKED_VISUAL_PACKAGE REASON={e}',file=sys.stderr); return 1
    if a.json: print(json.dumps(report,ensure_ascii=False,indent=2))
    else:
        print(f"VISUAL_SOURCE_STATUS={report['source_status']}"); print(f"VISUAL_PACKAGE_STATUS={report['status']}")
        if 'package_sha256' in report: print(f"VISUAL_PACKAGE_SHA256={report['package_sha256']}")
    return 0
if __name__=='__main__': raise SystemExit(main())
