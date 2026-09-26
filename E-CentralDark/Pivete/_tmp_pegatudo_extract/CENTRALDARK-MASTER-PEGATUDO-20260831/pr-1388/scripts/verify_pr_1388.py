#!/usr/bin/env python3
from pathlib import Path
import subprocess, sys, json, os

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()

candidates = [
    ["node", "apps/modulos/mapeamento/core/validar-mapa.mjs"],
    ["node", "scripts/lupa/validar-identidade-operacional.mjs"],
    ["node", "scripts/lupa/validar-porta-de-entrada.mjs"],
    ["node", "--test", "tests/agent-core-adapters.test.mjs"],
    ["node", "--test", "tests/safe-git-deploy.test.mjs"],
]

results=[]
for cmd in candidates:
    # Skip only if the referenced script/test path is absent. Never skip an existing failing gate.
    ref = next((x for x in cmd if "/" in x and not x.startswith("--")), None)
    if ref and not (ROOT / ref).exists():
        results.append({"cmd":cmd,"status":"NOT_PRESENT"})
        continue
    p=subprocess.run(cmd,cwd=ROOT,text=True,capture_output=True)
    results.append({"cmd":cmd,"status":"PASS" if p.returncode==0 else "FAIL","exit":p.returncode,
                    "stdout_tail":p.stdout[-2000:],"stderr_tail":p.stderr[-2000:]})
    if p.returncode != 0:
        print(json.dumps(results,ensure_ascii=False,indent=2))
        raise SystemExit(1)

print(json.dumps(results,ensure_ascii=False,indent=2))
print("PR_1388_LOCAL_GATES=PASS")
