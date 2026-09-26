from __future__ import annotations
import json, sys
from pathlib import Path
from .types import Mission
from .orchestrator import SealedOrchestrator

def load(path):
    path=Path(path).resolve(); d=json.loads(path.read_text(encoding='utf-8')); base=path.parent
    def r(v):
        p=Path(v); return p if p.is_absolute() else (base/p).resolve()
    return Mission(d['mission_id'],d['objective'],r(d['input_dir']),r(d['work_dir']),r(d['output_dir']),
        r(d.get('control_dir','./control')),d.get('adapter','mock'),d.get('max_rounds',12),
        d.get('stagnation_limit',3),d.get('timeout_seconds',120),d.get('test_commands',[]),
        d.get('negative_test_commands',[]),d.get('transfer_cases',[]),d.get('adapter_config',{}))

def main(argv=None):
    argv=argv or sys.argv[1:]
    if len(argv)!=1: print('usage: python -m runtime.cli mission.json',file=sys.stderr); return 2
    result=SealedOrchestrator(load(argv[0])).run(); print(json.dumps(result,ensure_ascii=False,indent=2))
    return 0 if result['status']=='SEALED_PASS' else 1
if __name__=='__main__': raise SystemExit(main())
