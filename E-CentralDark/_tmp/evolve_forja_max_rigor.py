from pathlib import Path
import math, random, json, hashlib
ROOT=Path(r'E:\CentralDark\worktrees\forja-viva-artifacts-4k-20260915')
OUT=ROOT/'docs'/'BRAIN'/'08-ARTEFATOS-VISUAIS'/'CARTAZES-CANONICOS'/'FORJA-VIVA'
W,H=3840,2160
DASH=OUT/'forja-viva-dashboard-melhorado-4k.svg'
CAR=OUT/'mapa-cerebro-caracol-melhorado-4k.svg'

def esc(s):
    return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
def txt(x,y,s,size=30,fill='#f8fafc',weight='700',anchor='start',mono=False):
    fam='JetBrains Mono,Consolas,monospace' if mono else 'Inter,Segoe UI,Arial,sans-serif'
    return f'<text x="{x}" y="{y}" font-family="{fam}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" fill="{fill}">{esc(s)}</text>'
def circ(x,y,r,fill='#8b5cf6',stroke='#fff',sw=2,extra=''):
    return f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{r:.2f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'
def edge(x1,y1,x2,y2,stroke='#8b5cf6',sw=1.4,op=.45,extra=''):
    return f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="{stroke}" stroke-width="{sw}" opacity="{op}" {extra}/>'
def evolve_dashboard():
    t=DASH.read_text(encoding='utf-8')
    proof={
      'artifact_id':'CENTRALDARK_FORJA_VIVA_DASHBOARD_4K',
      'pr':1543,'one_system_only':True,'create_parallel_graph':False,
      'dimensions':'3840x2160','skins':['emerald','operational','forge'],
      'skins_defined':True,'skins_global_applied':False,
      'unknown_is_pass':False,'reality_is_judge':True,
      'parent_artifact_head':'0b16229ff758131ba1578fcfe89876734be5f6c0'
    }
    meta='<metadata id="centraldark-proof">'+esc(json.dumps(proof,ensure_ascii=False,sort_keys=True))+'</metadata>'
    if 'id="centraldark-proof"' not in t:
        pos=t.find('>')+1; t=t[:pos]+meta+t[pos:]
    overlay='''<g id="rigor-proof-panel"><rect x="2670" y="1940" width="1000" height="120" rx="18" fill="#020617" fill-opacity=".94" stroke="#22d3ee" stroke-width="3"/><text x="2700" y="1982" font-family="JetBrains Mono,Consolas,monospace" font-size="22" font-weight="800" fill="#67e8f9">PR #1543 · ARTEFATO 4K · PROVA ESTRUTURAL</text><text x="2700" y="2020" font-family="JetBrains Mono,Consolas,monospace" font-size="20" fill="#86efac">REUSE_BEFORE_CREATE · ONE_SYSTEM_ONLY · REALITY=JUDGE</text><text x="2700" y="2054" font-family="JetBrains Mono,Consolas,monospace" font-size="20" fill="#fdba74">UNKNOWN != PASS · MERGED != DEPLOYED · GLOBAL_SKINS=NÃO</text></g>'''
    if 'id="rigor-proof-panel"' not in t:
        t=t.replace('</svg>',overlay+'</svg>')
    DASH.write_text(t,encoding='utf-8')

def make_caracol():
    random.seed(1543)
    cx,cy=1920,1080; core_r=118; inner=190; outer=890
    parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="CentralDark mapa do cérebro caracol 4K rigoroso">']
    proof={'artifact_id':'CENTRALDARK_MAPA_CEREBRO_CARACOL_4K','pr':1543,'topology':'single_connected_spiral_web','nucleus_touch_forbidden':True,'one_system_only':True,'dimensions':'3840x2160'}
    parts.append('<metadata id="centraldark-proof">'+esc(json.dumps(proof,ensure_ascii=False,sort_keys=True))+'</metadata>')
    parts.append('''<defs><radialGradient id="bg" cx="50%" cy="50%" r="76%"><stop offset="0" stop-color="#20103a"/><stop offset=".58" stop-color="#080b16"/><stop offset="1" stop-color="#020308"/></radialGradient><filter id="glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>''')
    parts.append(f'<rect width="{W}" height="{H}" fill="url(#bg)"/>')
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="{outer+70}" fill="none" stroke="#f59e0b" stroke-width="5" opacity=".72"/>')
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="{outer}" fill="#050816" fill-opacity=".62" stroke="#7c3aed" stroke-width="2" opacity=".95"/>')
    nodes={}
    arms=12; per_arm=64
    for a in range(arms):
        phase=2*math.pi*a/arms
        for j in range(per_arm):
            t=j/(per_arm-1)
            r=inner+(outer-inner)*(t**0.96)
            th=phase+4.75*t+0.10*math.sin(7*t+a)
            x=cx+r*math.cos(th); y=cy+r*math.sin(th)
            nid=f'a{a:02d}n{j:02d}'
            nodes[nid]=(x,y,a,j)
    anchor_defs=[('core_map','MAPA-DO-CÉREBRO',cx,cy-220,'#a855f7'),('core_read','00-LEIA-PRIMEIRO',cx-235,cy+120,'#22d3ee'),('core_index','INDEX',cx+235,cy+120,'#22d3ee')]
    for nid,lab,x,y,col in anchor_defs: nodes[nid]=(x,y,-1,-1)
    nodes['core_consciencia']=(cx,cy,-2,-2)
    edges=[]
    for a in range(arms):
        for j in range(per_arm-1): edges.append((f'a{a:02d}n{j:02d}',f'a{a:02d}n{j+1:02d}','spiral'))
        edges.append((f'a{a:02d}n00',['core_map','core_read','core_index'][a%3],'anchor'))
    for j in range(0,per_arm,4):
        for a in range(arms): edges.append((f'a{a:02d}n{j:02d}',f'a{(a+1)%arms:02d}n{j:02d}','lateral'))
    for a in range(arms): edges.append((f'a{a:02d}n{per_arm-1:02d}',f'a{(a+1)%arms:02d}n{per_arm-1:02d}','lateral'))
    for anchor in ['core_map','core_read','core_index']:
        edges.append((anchor,'core_consciencia','core-boundary'))
    for s,t,kind in edges:
        x1,y1,_,_=nodes[s]; x2,y2,_,_=nodes[t]
        if t=='core_consciencia':
            dx,dy=x1-cx,y1-cy; d=max((dx*dx+dy*dy)**0.5,1); x2=cx+dx/d*core_r; y2=cy+dy/d*core_r
        col={'spiral':'#8b5cf6','lateral':'#475569','anchor':'#22d3ee','core-boundary':'#c084fc'}[kind]
        sw={'spiral':2.6,'lateral':1.15,'anchor':3.2,'core-boundary':3.4}[kind]
        op={'spiral':.72,'lateral':.32,'anchor':.82,'core-boundary':.72}[kind]
        parts.append(edge(x1,y1,x2,y2,col,sw,op,f'data-graph-edge="true" data-source="{s}" data-target="{t}" data-kind="{kind}"'))
    for nid,(x,y,a,j) in nodes.items():
        if nid.startswith('core_'): continue
        r=4.2 if j%8 else 8.0
        col='#d8b4fe' if a%3==0 else '#67e8f9' if a%3==1 else '#c4b5fd'
        parts.append(circ(x,y,r,col,'#f8fafc',1.1,f'id="{nid}" data-graph-node="true"'))
    parts.append(circ(cx,cy,core_r,'#581c87','#f5d0fe',5,'id="core_consciencia" data-graph-node="true" filter="url(#glow)"'))
    parts.append(txt(cx,cy+13,'CONSCIÊNCIA',42,'#ffffff','900','middle'))
    for nid,lab,x,y,col in anchor_defs:
        parts.append(circ(x,y,44,col,'#f8fafc',4,f'id="{nid}" data-graph-node="true" filter="url(#glow)"'))
        parts.append(txt(x,y+82,lab,31,'#f5f3ff','900','middle'))
    hubs=[('INTENÇÃO',0,12),('MEMÓRIA',2,22),('MAIN',4,36),('PROVA',5,50),('EXECUÇÃO',7,50),('RUNTIME',8,36),('OWNERS',10,22),('BOOT',11,12)]
    for lab,a,j in hubs:
        nid=f'a{a:02d}n{j:02d}'; x,y,_,_=nodes[nid]
        parts.append(circ(x,y,28,'#f97316','#fff7ed',3,'filter="url(#glow)"'))
        parts.append(txt(x,y-45,lab,29,'#f8fafc','900','middle'))
    parts += [txt(130,145,'CENTRALDARK',58,'#f8fafc','900'),txt(130,210,'MAPA DO CÉREBRO — CARACOL',34,'#fde68a','900'),txt(130,260,'grafo único · todos os pontos ligados · núcleo preservado',24,'#cbd5e1','700'),txt(3705,150,'REALIDADE JULGA',27,'#f97316','900','end'),txt(cx,H-62,'GLOBAL WEB → ESPIRAL → ÂNCORAS → NÚCLEO · SEM SEGUNDO GRAFO',28,'#e9d5ff','900','middle')]
    parts.append('</svg>')
    CAR.write_text('\n'.join(parts),encoding='utf-8')

if __name__=='__main__':
    evolve_dashboard(); make_caracol()
    for p in (DASH,CAR):
        b=p.read_bytes(); print(p.name,'bytes='+str(len(b)),'sha256='+hashlib.sha256(b).hexdigest())
