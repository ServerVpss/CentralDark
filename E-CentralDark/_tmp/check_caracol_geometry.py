import xml.etree.ElementTree as ET, math
from pathlib import Path
p=Path(r'E:\CentralDark\worktrees\forja-viva-artifacts-4k-20260915\docs\BRAIN\08-ARTEFATOS-VISUAIS\CARTAZES-CANONICOS\FORJA-VIVA\mapa-cerebro-caracol-melhorado-4k.svg')
r=ET.fromstring(p.read_text(encoding='utf-8'))
ns='{http://www.w3.org/2000/svg}'
c=[]
for e in r.iter(ns+'circle'):
    try: c.append((float(e.attrib['cx']),float(e.attrib['cy']),float(e.attrib.get('r','0'))))
    except Exception: pass
lines=[]
for e in r.iter(ns+'line'):
    try: lines.append(tuple(float(e.attrib[k]) for k in ('x1','y1','x2','y2')))
    except Exception: pass
print('circles',len(c),'lines',len(lines))
for label,idxs in [('start',(0,1)),('end',(2,3))]:
    ds=[]
    for L in lines:
        x,y=L[idxs[0]],L[idxs[1]]
        ds.append(min(math.hypot(x-a,y-b) for a,b,_ in c))
    ds.sort()
    print(label,'max',max(ds),'p95',ds[int(.95*len(ds))],'<=3',sum(d<=3 for d in ds),'<=10',sum(d<=10 for d in ds))
