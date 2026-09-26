from __future__ import annotations
import json, shutil
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from .types import Mission
from .ledger import Ledger
from .evidence import hash_tree, sha256_file, run_command
from .gates import evaluate_gates, gates_pass
from .adapters import MockAdapter, LocalProcessAdapter, FileBrokerAdapter

class SealedOrchestrator:
    def __init__(self, mission:Mission):
        self.m=mission
        for p in [mission.work_dir,mission.output_dir,mission.control_dir]: p.mkdir(parents=True,exist_ok=True)
        self.evidence_dir=mission.output_dir/'evidence'
        self.ledger=Ledger(mission.output_dir/'ledger.jsonl',mission.mission_id)

    def adapter(self):
        c=self.m.adapter_config
        if self.m.adapter=='mock': return MockAdapter()
        if self.m.adapter=='local_process': return LocalProcessAdapter(c['command'],self.m.timeout_seconds)
        if self.m.adapter=='file_broker': return FileBrokerAdapter(c['broker_dir'],self.m.timeout_seconds)
        raise ValueError(self.m.adapter)

    def aborted(self): return (self.m.control_dir/'ABORT').exists()

    def manifest(self,status,gates,candidate,critique,transfer):
        artifacts=[]
        if candidate and Path(candidate.artifact_path).exists():
            src=Path(candidate.artifact_path); dst=self.m.output_dir/src.name; shutil.copy2(src,dst)
            artifacts.append({'path':dst.name,'size':dst.stat().st_size,'sha256':sha256_file(dst)})
        lp=self.m.output_dir/'ledger.jsonl'
        data={'mission_id':self.m.mission_id,'status':status,'created_at':datetime.now(timezone.utc).isoformat(),
              'artifacts':artifacts,'ledger_sha256':sha256_file(lp) if lp.exists() else '',
              'critique':asdict(critique) if critique else None,
              'transfer_results':[asdict(x) for x in transfer],
              'gates':[asdict(g) for g in gates]}
        p=self.m.output_dir/'release-manifest.json'; p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        return p

    def run(self):
        adapter=self.adapter(); before=hash_tree(self.m.input_dir)
        self.ledger.append('BEGIN',{'objective':self.m.objective,'input_hash':before,'adapter':self.m.adapter})
        previous=None; last=None; stagnation=0; status='SEALED_LEARNING'; gates=[]; critique=None; transfer=[]
        for rid in range(1,self.m.max_rounds+1):
            if self.aborted():
                status='SEALED_ABORTED'; self.ledger.append('ABORTED',{'reason':'break-glass externo'},rid); break
            self.ledger.append('ROUND_STARTED',{'state':status},rid)
            candidate=adapter.construct(rid,self.m.objective,self.m.work_dir,previous)
            self.ledger.append('CANDIDATE_CREATED',{'artifact_path':candidate.artifact_path,
                'artifact_sha256':candidate.artifact_sha256,'operational_state':candidate.operational_state},rid)
            critique=adapter.self_confront(candidate,self.m.objective,self.m.work_dir)
            self.ledger.append('SELF_CONFRONT',asdict(critique),rid)
            transfer=adapter.transfer(critique,self.m.transfer_cases,self.m.objective,self.m.work_dir)
            self.ledger.append('TRANSFER_RESULT',{'results':[asdict(x) for x in transfer]},rid)
            pos=[run_command(c,self.m.work_dir,self.m.timeout_seconds,'positive_test',self.evidence_dir) for c in self.m.test_commands]
            neg=[run_command(c,self.m.work_dir,self.m.timeout_seconds,'negative_test',self.evidence_dir) for c in self.m.negative_test_commands]
            gates=evaluate_gates(input_hash_before=before,input_dir=self.m.input_dir,positive=pos,negative=neg,
                ledger=self.ledger,critique=critique,transfer_results=transfer,
                thread_preserved=bool(candidate.operational_state.get('thread_preserved')),
                artifact_exists=Path(candidate.artifact_path).exists())
            self.ledger.append('GATE_RESULT',{'gates':[asdict(g) for g in gates]},rid)
            if gates_pass(gates):
                status='SEALED_PASS'; previous=candidate
                self.ledger.append('ROUND_FINISHED',{'status':status,'understanding_functional':True},rid); break
            status='SEALED_TRANSFER' if transfer else 'SEALED_LEARNING'
            sig=(candidate.artifact_sha256,critique.error_mechanism,tuple((x.case_id,x.classification,x.repeated_error) for x in transfer))
            stagnation=stagnation+1 if sig==last else 0; last=sig; previous=candidate
            self.ledger.append('ROUND_FINISHED',{'status':status,'stagnation':stagnation},rid)
            if stagnation>=self.m.stagnation_limit:
                status='SEALED_BLOCKED'; self.ledger.append('STAGNATION',{'limit':self.m.stagnation_limit},rid); break
        self.ledger.append('FINAL',{'status':status,'input_hash_after':hash_tree(self.m.input_dir),
            'understanding_functional':status=='SEALED_PASS'})
        mp=self.manifest(status,gates,previous,critique,transfer)
        return {'status':status,'manifest':str(mp),'ledger':str(self.m.output_dir/'ledger.jsonl'),
            'ledger_state':self.ledger.validate(),'gates':[asdict(g) for g in gates],
            'critique':asdict(critique) if critique else None,'transfer_results':[asdict(x) for x in transfer]}
