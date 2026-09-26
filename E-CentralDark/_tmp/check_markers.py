from pathlib import Path
repo=Path(r'E:\CentralDark\worktrees\tlc23-master-fixed-point-20260915')
bad=[]
for p in [repo/'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml',repo/'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml',repo/'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml']:
    txt=p.read_text(encoding='utf-8',errors='replace')
    for marker in ['<<<<<<<','=======','>>>>>>>']:
        if marker in txt: bad.append((str(p),marker))
print('CONFLICT_MARKERS=' + ('FAIL '+repr(bad) if bad else 'PASS'))
