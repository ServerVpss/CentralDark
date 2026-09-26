#!/usr/bin/env python3
from pathlib import Path
import subprocess, sys, tarfile, tempfile

ROOT = Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()
OWNER = Path('docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md')
VERIFIER = Path('scripts/trigger-fabric/verify_repo_contract.py')
INVARIANT = 'UNKNOWN_DEVE_SOBREVIVER_AO_HANDOFF=true'

def run(cmd, cwd):
    return subprocess.run(cmd, cwd=cwd, text=True, capture_output=True)

def archive_head(parent, name):
    dst = parent / name
    dst.mkdir()
    tar_path = dst / 'repo.tar'
    p = run(['git','archive','--format=tar','HEAD','-o',str(tar_path)], ROOT)
    if p.returncode:
        print(p.stdout); print(p.stderr, file=sys.stderr)
        raise SystemExit('GIT_ARCHIVE_FAIL')
    tree = dst / 'tree'
    tree.mkdir()
    with tarfile.open(tar_path, 'r') as tf:
        tf.extractall(tree)
    return tree

with tempfile.TemporaryDirectory(prefix='centraldark-pombo-owner-') as td:
    td = Path(td)

    baseline = archive_head(td, 'baseline')
    p = run([sys.executable,str(baseline/VERIFIER),str(baseline)], baseline)
    if p.returncode != 0 or 'POMBO_CANONICAL_HANDOFF_OWNER=PASS' not in p.stdout:
        print(p.stdout); print(p.stderr, file=sys.stderr)
        raise SystemExit('BASELINE_OWNER_VERIFICATION_FAIL')
    print('BASELINE_OWNER_VERIFICATION=PASS')

    missing = archive_head(td, 'missing')
    (missing/OWNER).unlink()
    p = run([sys.executable,str(missing/VERIFIER),str(missing)], missing)
    if p.returncode == 0 or 'REPO_CONTRACT_VERIFY=FAIL' not in p.stdout:
        print(p.stdout)
        raise SystemExit('DELETE_OWNER_FALSE_GREEN')
    print('DELETE_OWNER_FAILS_CLOSED=PASS')

    regressed = archive_head(td, 'regressed')
    op = regressed/OWNER
    text = op.read_text(encoding='utf-8')
    if INVARIANT not in text:
        raise SystemExit('COUNTERPROOF_INVARIANT_NOT_FOUND')
    op.write_text(text.replace(INVARIANT,'UNKNOWN_DEVE_SOBREVIVER_AO_HANDOFF=false',1),encoding='utf-8')
    p = run([sys.executable,str(regressed/VERIFIER),str(regressed)], regressed)
    if p.returncode == 0 or 'REPO_CONTRACT_VERIFY=FAIL' not in p.stdout:
        print(p.stdout)
        raise SystemExit('REGRESSED_OWNER_FALSE_GREEN')
    print('REGRESSED_OWNER_FAILS_CLOSED=PASS')

print('POMBO_OWNER_COUNTERPROOF=PASS')
