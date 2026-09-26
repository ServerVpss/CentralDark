from pathlib import Path
import math, random, hashlib
WT=Path(r'E:\CentralDark\worktrees\forja-viva-artifacts-4k-20260915')
OUT=WT/'docs'/'BRAIN'/'08-ARTEFATOS-VISUAIS'/'CARTAZES-CANONICOS'/'FORJA-VIVA'
OUT.mkdir(parents=True, exist_ok=True)
W,H=3840,2160

def esc(s):
    return (str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;'))

def save(name, parts):
    p=OUT/name
    txt='\n'.join(parts)
    p.write_text(txt, encoding='utf-8')
    b=p.read_bytes()
    print(f'{name} bytes={len(b)} sha256={hashlib.sha256(b).hexdigest()}')

def svg_head(title):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="{esc(title)}">',
    '<defs><radialGradient id="bg"><stop offset="0" stop-color="#17102b"/><stop offset="0.58" stop-color="#070b14"/><stop offset="1" stop-color="#020306"/></radialGradient>',
    '<linearGradient id="fire" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffb000"/><stop offset=".45" stop-color="#ff4d00"/><stop offset="1" stop-color="#7a0800"/></linearGradient>',
    '<linearGradient id="violet" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d8b4fe"/><stop offset=".48" stop-color="#8b5cf6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>',
    '<filter id="glow"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
    '</defs>']
# Arte 1: dashboard Forja Viva
p=svg_head('CentralDark Forja Viva 4K')
p += [f'<rect width="{W}" height="{H}" fill="#020306"/>',
      '<rect x="28" y="28" width="3784" height="2104" rx="34" fill="none" stroke="url(#fire)" stroke-width="8"/>',
      '<text x="110" y="150" fill="#f8fafc" font-family="Arial" font-size="78" font-weight="800">CENTRALDARK</text>',
      '<text x="110" y="265" fill="url(#fire)" font-family="Arial" font-size="128" font-weight="900" filter="url(#glow)">FORJA VIVA</text>',
      '<text x="112" y="330" fill="#f59e0b" font-family="Arial" font-size="32">UMA PROVA. UMA VERDADE. UM FIXED POINT.</text>']
# mascote abstrato
p += ['<circle cx="420" cy="850" r="300" fill="#090b10" stroke="#ff6a00" stroke-width="14"/>',
      '<path d="M190 700 Q420 420 650 700 L610 1120 Q420 1280 230 1120Z" fill="#08090d" stroke="#ff4d00" stroke-width="16"/>',
      '<path d="M265 595 L175 425 L320 520 M575 595 L665 425 L520 520" fill="none" stroke="#ff4d00" stroke-width="22"/>',
      '<path d="M305 800 Q355 755 400 800 M440 800 Q490 755 535 800" fill="none" stroke="#ff9d00" stroke-width="34" stroke-linecap="round" filter="url(#glow)"/>',
      '<line x1="650" y1="610" x2="820" y2="1180" stroke="#ff7a00" stroke-width="18"/><path d="M820 1180 l-55 -120 m55 120 l55 -120" stroke="#ff7a00" stroke-width="18" fill="none"/>']
# painéis
panels=[(900,80,1600,330,'ARQUITETURA CANÔNICA'),(2540,80,1180,690,'CLI — COCKPIT DA FORJA VIVA'),(900,440,1600,300,'RUNNER: BOOT END-TO-END FIXED POINT'),(900,770,1600,390,'REGRAS DE OURO'),(900,1190,790,400,'CONTINUIDADE DIRETA DA MAIN'),(1710,1190,790,400,'MODAL DE FALHA'),(2540,800,1180,440,'3 PELES CANÔNICAS'),(2540,1270,1180,320,'17 RESPIRAÇÕES DA FORJA'),(900,1620,820,440,'MODAL DE SUCESSO'),(1750,1620,820,440,'INTEGRAÇÕES'),(2600,1620,1120,440,'MAPA MENTAL — FLUXO TOTAL')]
for x,y,w,h,t in panels:
    stroke='#22d3ee' if 'ARQUITETURA' in t or 'CLI' in t else ('#ef4444' if 'FALHA' in t else '#f59e0b')
    p.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="24" fill="#07101a" fill-opacity=".92" stroke="{stroke}" stroke-width="4"/>')
    p.append(f'<text x="{x+30}" y="{y+55}" fill="{stroke}" font-family="Arial" font-size="34" font-weight="700">{esc(t)}</text>')
# conteúdo dashboard
flow=[('Dependabot',1100),('GitHub Actions',1380),('Bot_AI',1660),('CLI',1940),('Runner',2220)]
for i,(name,x) in enumerate(flow):
    p.append(f'<circle cx="{x}" cy="250" r="50" fill="#0d1726" stroke="#22d3ee" stroke-width="6"/>')
    p.append(f'<text x="{x}" y="335" text-anchor="middle" fill="#e5e7eb" font-family="Arial" font-size="26">{name}</text>')
    if i<len(flow)-1: p.append(f'<path d="M{x+55} 250 H{flow[i+1][1]-55}" stroke="#a7f3d0" stroke-width="5" marker-end="url(#none)"/>')
for i in range(17):
    x=980+i*82; col='#22c55e' if i<12 else ('#f59e0b' if i<15 else '#ef4444')
    p.append(f'<circle cx="{x}" cy="610" r="24" fill="#07120c" stroke="{col}" stroke-width="5"/><text x="{x}" y="619" text-anchor="middle" fill="#fff" font-family="Arial" font-size="20">{i+1:02d}</text>')
for j,t in enumerate(['REUSE_BEFORE_CREATE','ONE_SYSTEM_ONLY','ONE_WRITER_PER_SCOPE','ACTION != PROOF','UNKNOWN != PASS','MERGED != DEPLOYED','REALITY = JUDGE','CONTRAPROVA SEMPRE']):
    x=960+(j%2)*720; y=855+(j//2)*70; col='#22c55e' if j not in (4,5) else '#ef4444'
    p.append(f'<text x="{x}" y="{y}" fill="{col}" font-family="Consolas" font-size="28">● {esc(t)}</text>')
for j,t in enumerate(['PR #1540 → MAIN','Mermaid + arte 4K','3 peles definidas','sem segundo grafo']):
    p.append(f'<text x="940" y="1295" dy="{j*60}" fill="#d1fae5" font-family="Arial" font-size="27">✓ {esc(t)}</text>')
for j,t in enumerate(['GraphPanel global skins','2D / 3D / Celestial / Vault','hardcoded colors restantes','LACUNA ABERTA']):
    p.append(f'<text x="1750" y="1295" dy="{j*60}" fill="#fecaca" font-family="Arial" font-size="27">⚠ {esc(t)}</text>')
skins=[('EMERALD','#10b981'),('OPERATIONAL','#22d3ee'),('FORGE','#f97316')]
for j,(name,col) in enumerate(skins):
    x=2600+j*350; p.append(f'<rect x="{x}" y="900" width="300" height="210" rx="28" fill="#071014" stroke="{col}" stroke-width="8"/>')
    p.append(f'<circle cx="{x+150}" cy="980" r="52" fill="{col}" filter="url(#glow)"/><text x="{x+150}" y="1075" text-anchor="middle" fill="#fff" font-family="Arial" font-size="28" font-weight="700">{name}</text>')
p += ['<text x="2600" y="1170" fill="#4ade80" font-family="Arial" font-size="30">DEFINIDAS = SIM</text>',
      '<text x="3010" y="1170" fill="#fbbf24" font-family="Arial" font-size="30">GLOBAL = NÃO</text>',
      '<text x="2810" y="2030" fill="#f59e0b" font-family="Arial" font-size="34" font-weight="700">REALIDADE JULGA.</text>','</svg>']
save('forja-viva-dashboard-melhorado-4k.svg',p)
# Arte 2: mapa do cérebro / caracol
random.seed(1542)
p=svg_head('CentralDark Mapa do Cérebro Caracol 4K')
p += [f'<rect width="{W}" height="{H}" fill="url(#bg)"/>',
      '<circle cx="1920" cy="1080" r="900" fill="none" stroke="#f59e0b" stroke-width="4" opacity=".6"/>',
      '<circle cx="1920" cy="1080" r="840" fill="#050816" fill-opacity=".55" stroke="#8b5cf6" stroke-width="3" opacity=".9"/>',
      '<text x="120" y="150" fill="#f3e8ff" font-family="Georgia" font-size="68" letter-spacing="10">CENTRALDARK</text>',
      '<text x="120" y="215" fill="#c4b5fd" font-family="Arial" font-size="30" letter-spacing="8">MAPA DO CÉREBRO — CARACOL VIVO</text>']
# malha global circular
nodes=[]
for i in range(760):
    a=random.random()*math.tau; r=130+math.sqrt(random.random())*720
    x=1920+math.cos(a)*r; y=1080+math.sin(a)*r
    nodes.append((x,y))
for i,(x,y) in enumerate(nodes):
    if i%4==0:
        j=(i*17+41)%len(nodes); x2,y2=nodes[j]
        if (x-x2)**2+(y-y2)**2 < 280**2:
            p.append(f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#65558f" stroke-width="1.5" opacity=".35"/>')
    p.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{1.8+(i%13==0)*2.5}" fill="#ddd6fe" opacity="{.28+(i%11==0)*.35}"/>')
# braços de caracol: curvas em espiral que orbitam o núcleo sem atravessá-lo
arms=10
for k in range(arms):
    pts=[]
    for n in range(135):
        t=n/134; theta=k*math.tau/arms + (1-t)*0.5 + t*4.6
        r=760*(1-t)**0.72 + 155
        x=1920+math.cos(theta)*r; y=1080+math.sin(theta)*r
        pts.append(f'{x:.1f},{y:.1f}')
    p.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="url(#violet)" stroke-width="9" opacity=".88" filter="url(#glow)"/>')
    for n in range(0,135,9):
        t=n/134; theta=k*math.tau/arms+(1-t)*0.5+t*4.6; r=760*(1-t)**0.72+155
        x=1920+math.cos(theta)*r; y=1080+math.sin(theta)*r
        p.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="8" fill="#c4b5fd" opacity=".95"/>')
# núcleo travado
p += ['<circle cx="1920" cy="1080" r="150" fill="#32105f" stroke="#e9d5ff" stroke-width="10" filter="url(#glow)"/>',
      '<circle cx="1920" cy="1080" r="92" fill="#7c3aed" opacity=".78"/>',
      '<text x="1920" y="1095" text-anchor="middle" fill="#fff" font-family="Arial" font-size="48" font-weight="800">CONSCIÊNCIA</text>']
core=[('MAPA-DO-CÉREBRO',1920,870),('00-LEIA-PRIMEIRO',1715,1180),('INDEX',2125,1180)]
for name,x,y in core:
    p.append(f'<circle cx="{x}" cy="{y}" r="56" fill="#8b5cf6" stroke="#f5d0fe" stroke-width="7" filter="url(#glow)"/>')
    p.append(f'<text x="{x}" y="{y+90}" text-anchor="middle" fill="#f5f3ff" font-family="Arial" font-size="31" font-weight="700">{esc(name)}</text>')
# hubs principais distribuídos no círculo
hubs=[('INTENÇÃO',1320,520),('BOOT',2370,520),('MEMÓRIA',1000,900),('OWNERS',2820,900),('EXECUÇÃO',1040,1390),('PROVA',2800,1390),('MAIN',1450,1690),('RUNTIME',2380,1690)]
for name,x,y in hubs:
    p.append(f'<circle cx="{x}" cy="{y}" r="34" fill="#22d3ee" stroke="#ddd6fe" stroke-width="6" filter="url(#glow)"/>')
    p.append(f'<text x="{x}" y="{y-55}" text-anchor="middle" fill="#fff" font-family="Arial" font-size="30" font-weight="700">{esc(name)}</text>')
    # conexão tangencial ao anel interno, sem perfurar o núcleo
    dx=x-1920; dy=y-1080; d=(dx*dx+dy*dy)**0.5; tx=1920+dx/d*190; ty=1080+dy/d*190
    p.append(f'<path d="M{x:.1f} {y:.1f} Q{(x+tx)/2+dy/d*120:.1f} {(y+ty)/2-dx/d*120:.1f} {tx:.1f} {ty:.1f}" fill="none" stroke="#a78bfa" stroke-width="5" opacity=".8"/>')
p += ['<text x="120" y="1950" fill="#c4b5fd" font-family="Arial" font-size="28">ORGANIZAR • CONECTAR • COMPREENDER • EXECUTAR • EVOLUIR</text>',
      '<text x="2630" y="1950" fill="#f59e0b" font-family="Arial" font-size="28">DO CAOS AO CRISTAL • REALIDADE JULGA</text>',
      '<text x="1920" y="2070" text-anchor="middle" fill="#e9d5ff" font-family="Arial" font-size="24" letter-spacing="7">TODO CONHECIMENTO EM UM SÓ LUGAR</text>','</svg>']
save('mapa-cerebro-caracol-melhorado-4k.svg',p)
