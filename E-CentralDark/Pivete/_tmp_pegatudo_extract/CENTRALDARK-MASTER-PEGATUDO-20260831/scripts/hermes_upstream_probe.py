#!/usr/bin/env python3
"""Sensor read-only do upstream Hermes para o Update Bridge."""
from __future__ import annotations
import json, shutil, subprocess, time

def run(cmd):
    p=subprocess.run(cmd,capture_output=True,text=True,timeout=45)
    return {'cmd':' '.join(cmd),'exit_code':p.returncode,'stdout':p.stdout[-4000:],'stderr':p.stderr[-2000:]}

def main():
    exe=shutil.which('hermes')
    out={'observed_at_epoch':time.time(),'hermes_executable':exe,'status':'UNKNOWN'}
    if not exe:
        out['reason']='HERMES_NOT_ON_PATH'
        print(json.dumps(out,ensure_ascii=False,indent=2)); return 2
    out['version']=run([exe,'--version'])
    out['update_check']=run([exe,'update','--check'])
    out['status']='PASS' if out['version']['exit_code']==0 and out['update_check']['exit_code'] in (0,1) else 'UNKNOWN'
    print(json.dumps(out,ensure_ascii=False,indent=2))
    return 0 if out['status']=='PASS' else 2

if __name__=='__main__': raise SystemExit(main())
