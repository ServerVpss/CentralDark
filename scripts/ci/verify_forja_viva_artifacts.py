#!/usr/bin/env python3
from __future__ import annotations
import json, sys, xml.etree.ElementTree as ET
from collections import defaultdict, deque
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
ART=ROOT/'docs'/'BRAIN'/'08-ARTEFATOS-VISUAIS'/'CARTAZES-CANONICOS'/'FORJA-VIVA'
DASH=ART/'forja-viva-dashboard-melhorado-4k.svg'
CAR=ART/'mapa-cerebro-caracol-melhorado-4k.svg'
NS='{http://www.w3.org/2000/svg}'

def fail(msg:str)->None:
    print(f'FORJA_VIVA_GATE=FAIL reason={msg}')
    raise SystemExit(1)

def parse(path:Path):
    if not path.is_file(): fail(f'missing:{path.relative_to(ROOT)}')
    try: root=ET.fromstring(path.read_text(encoding='utf-8'))
    except Exception as exc: fail(f'xml:{path.name}:{exc}')
    if root.attrib.get('width')!='3840' or root.attrib.get('height')!='2160': fail(f'not_4k:{path.name}')
    if root.attrib.get('viewBox')!='0 0 3840 2160': fail(f'viewbox:{path.name}')
    return root
def metadata(root):
    for e in root.iter():
        if e.tag.endswith('metadata') and e.attrib.get('id')=='centraldark-proof':
            try: return json.loads(e.text or '{}')
            except Exception as exc: fail(f'metadata_json:{exc}')
    fail('metadata_missing')

def text_blob(root)->str:
    return '\n'.join((e.text or '') for e in root.iter() if (e.text or '').strip())

def check_dashboard()->None:
    root=parse(DASH); meta=metadata(root); blob=text_blob(root)
    required=['REUSE_BEFORE_CREATE','ONE_SYSTEM_ONLY','UNKNOWN != PASS','MERGED != DEPLOYED','REALITY = JUDGE','CONTRAPROVA SEMPRE','3 PELES CANÔNICAS','APLICADAS GLOBALMENTE = NÃO']
    for token in required:
        if token not in blob: fail(f'dashboard_missing:{token}')
    if 'APLICADAS GLOBALMENTE = SIM' in blob: fail('dashboard_false_green_global_skin')
    if meta.get('skins_global_applied') is not False: fail('dashboard_metadata_skin_truth')
    if meta.get('one_system_only') is not True: fail('dashboard_metadata_one_system')
    print('FORJA_DASHBOARD=PASS required_contracts=8 truth=fail_closed 4k=PASS')
def check_caracol()->None:
    root=parse(CAR); meta=metadata(root); blob=text_blob(root)
    for token in ['CONSCIÊNCIA','MAPA-DO-CÉREBRO','00-LEIA-PRIMEIRO','INDEX','GLOBAL WEB → ESPIRAL → ÂNCORAS → NÚCLEO']:
        if token not in blob: fail(f'caracol_missing:{token}')
    nodes={e.attrib['id']:e for e in root.iter(NS+'circle') if e.attrib.get('data-graph-node')=='true' and e.attrib.get('id')}
    edges=[e for e in root.iter(NS+'line') if e.attrib.get('data-graph-edge')=='true']
    if len(nodes)<770: fail(f'caracol_nodes:{len(nodes)}')
    if len(edges)<950: fail(f'caracol_edges:{len(edges)}')
    adj=defaultdict(set)
    for e in edges:
        s=e.attrib.get('data-source'); t=e.attrib.get('data-target')
        if s not in nodes or t not in nodes: fail(f'edge_unknown_node:{s}->{t}')
        adj[s].add(t); adj[t].add(s)
    start=next(iter(nodes)); seen={start}; q=deque([start])
    while q:
        u=q.popleft()
        for v in adj[u]:
            if v not in seen: seen.add(v); q.append(v)
    if len(seen)!=len(nodes): fail(f'caracol_components:connected={len(seen)}/{len(nodes)}')
    degrees=[len(adj[n]) for n in nodes]
    if min(degrees)<2: fail(f'caracol_leaf_node:min_degree={min(degrees)}')
    cx=1920.0; cy=1080.0; forbidden=118.0
    for nid,e in nodes.items():
        if nid.startswith('core_'): continue
        x=float(e.attrib['cx']); y=float(e.attrib['cy'])
        if ((x-cx)**2+(y-cy)**2)**0.5 < 180.0: fail(f'node_touches_nucleus:{nid}')
    for e in edges:
        if e.attrib.get('data-kind')=='core-boundary':
            x2=float(e.attrib['x2']); y2=float(e.attrib['y2'])
            d=((x2-cx)**2+(y2-cy)**2)**0.5
            if d < forbidden-0.5: fail(f'edge_enters_nucleus:{d}')
    if meta.get('topology')!='single_connected_spiral_web': fail('caracol_metadata_topology')
    print(f'FORJA_CARACOL=PASS nodes={len(nodes)} edges={len(edges)} connected=TRUE min_degree={min(degrees)} nucleus_preserved=TRUE 4k=PASS')

def main()->int:
    check_dashboard(); check_caracol(); print('FORJA_VIVA_ARTIFACT_GATE=PASS'); return 0

if __name__=='__main__':
    raise SystemExit(main())
