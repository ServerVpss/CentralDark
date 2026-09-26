from pathlib import Path
import math, random, hashlib

ROOT = Path(r'E:\CentralDark\worktrees\forja-viva-artifacts-4k-20260915')
OUT = ROOT / 'docs' / 'BRAIN' / '08-ARTEFATOS-VISUAIS' / 'CARTAZES-CANONICOS' / 'FORJA-VIVA'
W, H = 3840, 2160
random.seed(1543)

def esc(s):
    return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

def text(x,y,s,size=36,fill='#f8fafc',weight='600',anchor='start',opacity=1,mono=False):
    fam = 'JetBrains Mono, Consolas, monospace' if mono else 'Inter, Segoe UI, Arial, sans-serif'
    return f'<text x="{x}" y="{y}" font-family="{fam}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" fill="{fill}" opacity="{opacity}">{esc(s)}</text>'

def rect(x,y,w,h,stroke='#f97316',fill='#061018',rx=22,op=.92,sw=3):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" fill-opacity="{op}" stroke="{stroke}" stroke-width="{sw}"/>'

def line(x1,y1,x2,y2,stroke='#fb923c',sw=2,op=.75):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}" opacity="{op}"/>'

def circle(cx,cy,r,fill='#8b5cf6',stroke='#f8fafc',sw=2,op=1):
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" opacity="{op}"/>'
def defs():
    return '''<defs>
<radialGradient id="bg" cx="50%" cy="50%" r="78%"><stop offset="0%" stop-color="#1a1024"/><stop offset="55%" stop-color="#070b12"/><stop offset="100%" stop-color="#020305"/></radialGradient>
<linearGradient id="forge" x1="0" x2="1"><stop offset="0" stop-color="#ff3b00"/><stop offset=".45" stop-color="#ffb000"/><stop offset="1" stop-color="#ff5a00"/></linearGradient>
<linearGradient id="violet" x1="0" x2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset=".55" stop-color="#22d3ee"/><stop offset="1" stop-color="#f97316"/></linearGradient>
<filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="soft" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<style>.small{font-family:JetBrains Mono,Consolas,monospace;font-size:24px;fill:#cbd5e1}.tiny{font-family:JetBrains Mono,Consolas,monospace;font-size:19px;fill:#94a3b8}.label{font-family:Inter,Segoe UI,Arial,sans-serif;font-weight:800;letter-spacing:1px}.panelTitle{font-family:Inter,Segoe UI,Arial,sans-serif;font-size:34px;font-weight:900;fill:#fbbf24}.ok{fill:#22c55e}.warn{fill:#f97316}.bad{fill:#ef4444}</style>
</defs>'''

def label_box(x,y,w,h,title,stroke='#f97316'):
    return [rect(x,y,w,h,stroke=stroke,fill='#050b12',rx=26,op=.88,sw=3), text(x+28,y+50,title,34,'#fbbf24','900')]

def status_item(x,y,label,value,color='#22c55e'):
    return circle(x,y-8,12,color,'#d1fae5',2)+text(x+28,y,label,22,'#d8dee9','650')+text(x+310,y,value,22,color,'800',mono=True)

def make_dashboard():
    s=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="CentralDark Forja Viva dashboard 4K coerente">',defs(),f'<rect width="{W}" height="{H}" fill="url(#bg)"/>']
    for i in range(140):
        x=random.randint(0,W); y=random.randint(0,H); r=random.choice([1,1.5,2,2.5]); op=random.uniform(.08,.28)
        s.append(circle(x,y,r,'#f97316','#f97316',0,op))
    s += [rect(34,34,W-68,H-68,'#f97316','#050505',36,.35,4), rect(54,54,W-108,H-108,'#0ea5e9','#000000',28,.18,2)]
    # left hero
    s += [rect(90,110,760,1420,'#f97316','#09080a',36,.74,4), text(145,205,'CENTRALDARK',62,'#f8fafc','900'), text(145,300,'FORJA VIVA',112,'url(#forge)','900'), text(150,360,'UMA PROVA. UMA VERDADE. UM FIXED POINT.',29,'#fff7ed','800')]
    cx,cy=470,770
    s += [circle(cx,cy,255,'none','#f97316',10,.9), circle(cx,cy,225,'#06070a','#fb923c',5,.95), circle(cx-86,cy-20,48,'#ffb000','#fff7ed',0,1), circle(cx+86,cy-20,48,'#ffb000','#fff7ed',0,1)]
    s += [f'<path d="M{cx-210},{cy-135} L{cx-320},{cy-330} L{cx-145},{cy-220}" fill="none" stroke="#ff4d00" stroke-width="18" stroke-linecap="round"/>', f'<path d="M{cx+210},{cy-135} L{cx+320},{cy-330} L{cx+145},{cy-220}" fill="none" stroke="#ff4d00" stroke-width="18" stroke-linecap="round"/>']
    s += [text(150,1120,'BOT_AICENTRALDARK',39,'#fbbf24','900'), text(150,1175,'CAPETINHA DA FORJA',28,'#e2e8f0','800'), text(150,1240,'Código planeja. Automação executa.',25,'#cbd5e1','600'), text(150,1285,'Realidade julga. Prova fecha.',25,'#cbd5e1','600')]
    # architecture + runner
    s += label_box(900,110,1560,255,'ARQUITETURA CANÔNICA','#0ea5e9')
    names=['Dependabot','GitHub Actions','Bot','CLI','Runner']; xs=[1040,1325,1610,1895,2180]
    for i,x in enumerate(xs):
        s += [circle(x,245,43,['#111827','#2563eb','#f97316','#0f172a','#16a34a'][i],'#67e8f9',3,1), text(x,320,names[i],25,'#e5e7eb','700','middle')]
        if i<4: s.append(line(x+70,245,xs[i+1]-70,245,'#e5e7eb',5,.8))
    s += label_box(900,395,1560,205,'RUNNER: BOOT END-TO-END FIXED POINT','#f59e0b')
    for i in range(17):
        x=975+i*84; col='#22c55e' if i<12 else '#f97316' if i<15 else '#ef4444'
        s += [circle(x,505,28,'#06131a',col,5,1), text(x,515,f'{i+1:02}',21,col,'900','middle',mono=True)]
        if i<16: s.append(line(x+32,505,x+52,505,col,4,.85))
    s += label_box(900,630,1560,325,'REGRAS DE OURO','#f59e0b')
    rules=[('✓','REUSE_BEFORE_CREATE','#22c55e'),('✓','ONE_SYSTEM_ONLY','#22c55e'),('✓','ONE_WRITER_PER_SCOPE','#22c55e'),('✓','ACTION != PROOF','#22c55e'),('✕','SIMULAÇÃO != REALIDADE','#ef4444'),('✕','UNKNOWN != PASS','#ef4444'),('✕','MERGED != DEPLOYED','#ef4444'),('✓','REALITY = JUDGE','#22c55e'),('✓','CONTRAPROVA SEMPRE','#22c55e')]
    for i,(sym,lab,col) in enumerate(rules):
        x=955+(i//4)*475; y=725+(i%4)*52
        s += [circle(x,y-7,15,col,col,0,1), text(x,y,sym,21,'#041010','900','middle'), text(x+34,y,lab,24,'#dbeafe','700',mono=True)]
    s += label_box(2500,110,1245,555,'CLI — COCKPIT DA FORJA VIVA','#f97316')
    for i,(k,v,c) in enumerate([('Respiração','09/17','#22c55e'),('Main','VIVA','#22c55e'),('PR #1540','MERGED','#22c55e'),('Estado','OPERACIONAL','#22c55e'),('Lacuna','GraphPanel skins','#f97316')]):
        s.append(status_item(2550,220+i*58,k,v,c))
    s += [circle(3160,420,132,'#0b0b0f','#f97316',8,1), text(3160,415,'FORJA',50,'#fbbf24','900','middle'), text(3160,465,'VIVA',45,'#ffedd5','900','middle')]
    s += label_box(2500,700,1245,360,'3 PELES CANÔNICAS','#f59e0b')
    skins=[('EMERALD','#10b981'),('OPERATIONAL','#22d3ee'),('FORGE','#f97316')]
    for i,(name,col) in enumerate(skins):
        x=2580+i*240; s += [rect(x,800,190,170,col,'#031013',18,.95,3), circle(x+95,860,38,col,'#fff',2,1), text(x+95,940,name,24,col,'900','middle')]
    s += [text(3330,810,'DEFINIDAS = SIM',28,'#22c55e','900',mono=True), text(3330,865,'6 combinações claro/escuro',24,'#e2e8f0','700'), text(3330,920,'APLICADAS GLOBALMENTE = NÃO',24,'#f97316','900',mono=True)]
    s += label_box(900,990,760,300,'CONTINUIDADE DIRETA DA MAIN','#0ea5e9')
    for i,t in enumerate(['PR #1540 já entrou na main','commit atômico','contrato Mermaid + arte 4K','sem segundo grafo']): s += [circle(945,1088+i*44,12,'#22c55e','#22c55e',0,1), text(975,1098+i*44,t,23,'#dbeafe','700')]
    s += label_box(1695,990,765,300,'MODAL DE FALHA','#ef4444')
    for i,t in enumerate(['GraphPanel ainda não aplica skins','2D/3D/Celestial/Vault hardcoded','não marcar como pronto','lacuna aberta']): s += [circle(1740,1088+i*44,12,'#ef4444','#ef4444',0,1), text(1770,1098+i*44,t,23,'#fecaca','800')]
    s += label_box(2500,1090,560,440,'FIXED POINT PARCIAL','#22c55e')
    for i,t in enumerate(['artefatos 4K','Mermaid','receipt','sem falso-verde']): s += [circle(2545,1195+i*55,13,'#22c55e','#dcfce7',2,1), text(2580,1205+i*55,t,26,'#dcfce7','800')]
    s += label_box(3095,1090,650,440,'17 RESPIRAÇÕES DA FORJA','#f97316')
    for i in range(17):
        x=3150+(i%9)*60; y=1200+(i//9)*95; s += [circle(x,y,18,'#180605','#f97316',4,1), text(x,y+7,str(i+1),16,'#fed7aa','900','middle',mono=True)]
    # bottom flow
    s += label_box(90,1580,3655,440,'MAPA MENTAL — FLUXO TOTAL','#f97316')
    bx=[260,815,1370,1925,2480,3035]; labs=['Entradas','Runner','Gates','Contraprova','Reality Judge','Fixed Point']
    for i,x in enumerate(bx):
        s += [rect(x,1725,360,185,'#22c55e' if i==5 else '#f97316','#061018',20,.88,3), text(x+180,1805,labs[i],32,'#fde68a','900','middle'), text(x+180,1855,['GitHub/CLI/Bot','Boot/Jobs','TLC23/MetaLupa','Teste/CI','Prova real','Cristal'][i],24,'#cbd5e1','700','middle')]
        if i<5: s.append(line(x+380,1817,bx[i+1]-25,1817,'#fbbf24',5,.85))
    s += [text(W/2,H-70,'UMA PROVA. UMA VERDADE. UM FIXED POINT. — REALIDADE JULGA.',36,'#ffedd5','900','middle')]
    s.append('</svg>')
    return '\n'.join(s)
def make_caracol():
    s=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="CentralDark mapa do cérebro caracol 4K coerente">',defs(),f'<rect width="{W}" height="{H}" fill="#03040a"/>']
    cx,cy=1920,1080; R=840
    s += [circle(cx,cy,R,'#050816','#f59e0b',4,.55), circle(cx,cy,R*0.78,'none','#334155',2,.35), circle(cx,cy,R*0.52,'none','#334155',2,.28)]
    nodes=[]
    for i in range(620):
        th=i*0.208; rr=R*(0.18+0.82*(i/620)**0.78); x=cx+rr*math.cos(th); y=cy+rr*math.sin(th)
        nodes.append((x,y,rr,th))
    # global grey web links
    for i in range(0,len(nodes)-9,3):
        x1,y1,_,_=nodes[i]; x2,y2,_,_=nodes[i+9]
        s.append(line(x1,y1,x2,y2,'#475569',1,.22))
    for ring in [260,420,600,760]:
        pts=[]
        for k in range(72):
            th=2*math.pi*k/72 + ring/500
            pts.append((cx+ring*math.cos(th),cy+ring*math.sin(th)))
        for k in range(72):
            x1,y1=pts[k]; x2,y2=pts[(k+1)%72]; s.append(line(x1,y1,x2,y2,'#334155',1,.25))
    # spiral arms
    for arm in range(9):
        phase=arm*2*math.pi/9
        prev=None
        for j in range(110):
            t=j/109; rr=R*(1-t)**0.86+120*t; th=phase + 4.8*t + .15*math.sin(t*10+arm)
            x=cx+rr*math.cos(th); y=cy+rr*math.sin(th)
            if prev: s.append(line(prev[0],prev[1],x,y,'#8b5cf6' if arm%2 else '#22d3ee',3.2,.76))
            if j%9==0: s.append(circle(x,y,8+(1-t)*5,'#a855f7','#f5f3ff',1.5,.95))
            prev=(x,y)
    # all nodes visible
    for x,y,rr,th in nodes:
        r=2.1 if rr>450 else 3.2
        s.append(circle(x,y,r,'#d1d5db','#d1d5db',0,.58))
    # central locked nucleus, no harsh line crossing
    s += [circle(cx,cy,122,'#39115d','#e9d5ff',5,1), circle(cx,cy,86,'#6d28d9','#f5d0fe',3,.95), text(cx,cy+12,'CONSCIÊNCIA',42,'#ffffff','900','middle')]
    anchors=[('MAPA-DO-CÉREBRO',cx,cy-210,'#a855f7'),('00-LEIA-PRIMEIRO',cx-235,cy+125,'#8b5cf6'),('INDEX',cx+235,cy+125,'#8b5cf6')]
    for lab,x,y,col in anchors:
        s += [circle(x,y,44,col,'#f5f3ff',4,1), line(x,y,cx+(x-cx)*.46,cy+(y-cy)*.46,'#c084fc',4,.85), text(x,y+82,lab,32,'#f5f3ff','900','middle')]
    hubs=[('INTENÇÃO',cx-520,cy-650),('BOOT',cx+440,cy-640),('MEMÓRIA',cx-730,cy-150),('OWNERS',cx+730,cy-70),('EXECUÇÃO',cx-620,cy+390),('PROVA',cx+610,cy+405),('MAIN',cx-330,cy+680),('RUNTIME',cx+360,cy+685)]
    for i,(lab,x,y) in enumerate(hubs):
        col='#22d3ee' if i%2 else '#a855f7'
        s += [circle(x,y,38,col,'#f8fafc',4,1), text(x,y-58,lab,31,'#e9d5ff','900','middle')]
        # curved approximated by segmented spiral approach outside core
        for k in range(8):
            a=k/8; px=x*(1-a)+(cx+(x-cx)*.24)*(a); py=y*(1-a)+(cy+(y-cy)*.24)*(a); qx=x*(1-(a+.1))+(cx+(x-cx)*.24)*(a+.1); qy=y*(1-(a+.1))+(cy+(y-cy)*.24)*(a+.1)
            s.append(line(px,py,qx,qy,col,2.5,.5))
    s += [text(160,160,'CENTRALDARK',55,'#f8fafc','800'), text(160,225,'MAPA DO CÉREBRO',36,'#fde68a','800'), text(160,285,'todo conhecimento em um só lugar',26,'#cbd5e1','600'), text(160,1775,'DO CAOS AO CRISTAL',40,'#fde68a','800'), text(160,1835,'sem repetir • sem falso-verde • só delta útil',26,'#cbd5e1','600'), text(3650,190,'REALIDADE JULGA',30,'#f97316','900','end'), text(3650,1835,'DO INDIVÍDUO PARA O INFINITO',30,'#fde68a','800','end'), text(cx,H-88,'EXPLORAR • APRENDER • CONSTRUIR • COMPARTILHAR • TRANSCENDER',31,'#e9d5ff','800','middle')]
    s.append('</svg>')
    return '\n'.join(s)

files = {
 'forja-viva-dashboard-melhorado-4k.svg': make_dashboard(),
 'mapa-cerebro-caracol-melhorado-4k.svg': make_caracol(),
}
for name, data in files.items():
    p=OUT/name
    p.write_text(data, encoding='utf-8')
    print(f'{name} bytes={p.stat().st_size} sha256={hashlib.sha256(p.read_bytes()).hexdigest()} 4k={"width=\"3840\"" in data and "height=\"2160\"" in data}')
