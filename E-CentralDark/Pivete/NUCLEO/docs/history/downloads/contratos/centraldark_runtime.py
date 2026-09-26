#!/usr/bin/env python3
from __future__ import annotations
import argparse,json,shutil,time,uuid
from pathlib import Path
CHAIN=["ACORDAR","CALIBRAR","MULTIBUSSOLA","META_LUPA","RECONCILIAR","CONTRAPROVA","REMEDICAO","FIXED_POINT","REGISTRA","BOOT"]
def load(p):
 d=json.loads(Path(p).read_text(encoding="utf-8")); assert d["name"]=="CENTRALDARK_AI_BOOT"; assert d["cycle"]==CHAIN; return d
def probe(cands):
 for c in cands:
  p=shutil.which(c)
  if p:return {"status":"FOUND","command":c,"path":p}
 return {"status":"NOT_FOUND","command":None,"path":None}
def scope(root,run,eid,mission):
 p=Path(root)/run/eid
 for s in ("state","learning","receipts","locks"): (p/s).mkdir(parents=True,exist_ok=True)
 m={"executorId":eid,"missionId":f"{mission}:{eid}","stateDir":str(p/"state"),"learningDir":str(p/"learning"),"receiptDir":str(p/"receipts"),"lockDir":str(p/"locks")}
 (p/"scope.json").write_text(json.dumps(m,indent=2),encoding="utf-8"); return m
def main():
 ap=argparse.ArgumentParser(); ap.add_argument("--contract",default=str(Path(__file__).with_name("centraldark-ai-boot.json"))); sp=ap.add_subparsers(dest="cmd",required=True); sp.add_parser("status"); sp.add_parser("probe"); f=sp.add_parser("fanout"); f.add_argument("--executors",type=int,required=True); f.add_argument("--mission",required=True); f.add_argument("--root",default=".centraldark-runtime"); f.add_argument("--probe-pass",action="store_true"); a=ap.parse_args(); c=load(a.contract)
 if a.cmd=="status": print(json.dumps({"boot":c["name"],"cycle":c["cycle"],"papagaio_mode":"OFF","fanout_default":c["runtime"]["fanout_default"],"public_exposure":c["runtime"]["public_exposure"]},indent=2,ensure_ascii=False)); return
 if a.cmd=="probe":
  out=[]
  for n,x in c["adapters"].items():
   r=probe(x.get("command_candidates",[])) if x["type"]=="cli" else {"status":"DECLARED_NOT_EXECUTED","endpoint_candidates":x.get("endpoint_candidates",[])}
   r.update({"adapter":n,"role":x.get("role")}); out.append(r)
  print(json.dumps({"mode":"PROBE_ONLY","adapters":out},indent=2,ensure_ascii=False)); return
 if a.executors<1: raise SystemExit("executors deve ser >=1")
 if a.executors>1 and c["runtime"]["fanout_default"]=="LOCKED" and not a.probe_pass: raise SystemExit("AUTO_FANOUT=LOCKED: multi-executor exige probe real de isolamento")
 run=uuid.uuid4().hex; scopes=[scope(a.root,run,f"H{i}",a.mission) for i in range(1,a.executors+1)]; rec={"runId":run,"mission":a.mission,"executors":a.executors,"mode":"DRY_RUN","scopes":scopes,"writerPolicy":"ONE_WRITER_PER_SCOPE","fixedPoint":"NOT_PROVEN","timestamp":time.time()}; rd=Path(a.root)/run/"rendezvous"; rd.mkdir(parents=True,exist_ok=True); (rd/"receipt.json").write_text(json.dumps(rec,indent=2),encoding="utf-8"); print(json.dumps(rec,indent=2,ensure_ascii=False))
if __name__=="__main__": main()
