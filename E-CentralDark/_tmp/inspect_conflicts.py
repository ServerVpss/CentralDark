from pathlib import Path
repo=Path(r'E:\CentralDark\worktrees\tlc23-master-fixed-point-20260915')
files=[
 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml',
 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml',
 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml',
]
for f in files:
    p=repo/f
    lines=p.read_text(encoding='utf-8',errors='replace').splitlines()
    print('---',f)
    for i,l in enumerate(lines,1):
        if l.startswith(('<<<<<<<','=======','>>>>>>>')):
            print(i,l)
            for j in range(max(1,i-4), min(len(lines), i+5)+1):
                print(f'{j}: {lines[j-1]}')
