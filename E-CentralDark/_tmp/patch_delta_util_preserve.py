from pathlib import Path
WT=Path(r'E:\CentralDark\worktrees\tlc23-master-fixed-point-20260915')
files=[
'scripts/trigger-fabric/centraldark_master_cycle.py',
'scripts/trigger-fabric/centraldark_full_trigger_boot.py',
'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml',
'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml',
'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml',
'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/UNIVERSAL-ENGINE-METHOD.yml',
]
for rel in files:
    p=WT/rel
    t=p.read_text(encoding='utf-8-sig')
    before=t
    t=t.replace('"DELTA_MINIMUM", "RENDEZVOUS"','"DELTA_MINIMUM", "DELTA_UTIL", "RENDEZVOUS"')
    t=t.replace('DELTA_MINIMUM, RENDEZVOUS','DELTA_MINIMUM, DELTA_UTIL, RENDEZVOUS')
    t=t.replace('  - DELTA_MINIMUM\n  - RENDEZVOUS','  - DELTA_MINIMUM\n  - DELTA_UTIL\n  - RENDEZVOUS')
    t=t.replace(' -> DELTA_MINIMUM -> RENDEZVOUS',' -> DELTA_MINIMUM -> DELTA_UTIL -> RENDEZVOUS')
    if t!=before:
        p.write_text(t,encoding='utf-8',newline='\n')
        print('PATCHED',rel)
