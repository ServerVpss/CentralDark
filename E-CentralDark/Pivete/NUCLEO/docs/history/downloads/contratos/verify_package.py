#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, sys

ROOT=Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()

def sha256(path):
    h=hashlib.sha256(); h.update(path.read_bytes()); return h.hexdigest()

errors=[]
manifest_path=ROOT/'MANIFEST.json'
if not manifest_path.exists():
    print('VERIFY=FAIL\nMANIFEST_MISSING'); sys.exit(1)
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))

for item in manifest.get('files',[]):
    p=ROOT/item['path']
    if not p.exists():
        errors.append(f"MISSING {item['path']}")
        continue
    if sha256(p)!=item['sha256']:
        errors.append(f"HASH_MISMATCH {item['path']}")

required=[
 'README.md','ARCHITECTURE.md','ARCHITECTURE.mmd','ARCHITECTURE.png',
 'CONTRACT.yml','TRIGGERS.yml','ENGINE_BINDING.yml','ADVERSARIAL_HANDOFF.yml','LIVE_STATE.md',
 'HISTORY.md','COUNTERPROOF.md','RASTRO.md','RECEIPT.md','SOURCES.json',
 'build_package.py','verify_package.py','MANIFEST.json','SHA256SUMS.txt',
 'CANONICAL_HANDOFF_OWNER.md','POMBO-CORREIO-COM-CHECKSUM.md',
 'verify_repo_contract.py','test_pombo_handoff_counterproof.py',
 'trigger-fabric-package.yml'
]
for name in required:
    if not (ROOT/name).exists(): errors.append(f'REQUIRED_MISSING {name}')

receipt=(ROOT/'RECEIPT.md').read_text(encoding='utf-8',errors='replace') if (ROOT/'RECEIPT.md').exists() else ''
if 'GLOBAL_RUNTIME_100_PERCENT = NOT_PROVEN' not in receipt:
    errors.append('FALSE_GREEN_GUARD_MISSING')

live=(ROOT/'LIVE_STATE.md').read_text(encoding='utf-8',errors='replace') if (ROOT/'LIVE_STATE.md').exists() else ''
history=(ROOT/'HISTORY.md').read_text(encoding='utf-8',errors='replace') if (ROOT/'HISTORY.md').exists() else ''
if not live or not history: errors.append('LIVE_HISTORY_SEPARATION_MISSING')

contract=(ROOT/'CONTRACT.yml').read_text(encoding='utf-8',errors='replace') if (ROOT/'CONTRACT.yml').exists() else ''
for token in [
 'inherited_on_bot_entry: true',
 'mandatory_before_human_return: true',
 'no_new_workflow_when_owner_exists: true',
 'yellow_status_semantics: FORBIDDEN',
]:
    if token not in contract: errors.append(f'CONTRACT_GUARD_MISSING:{token}')

owner=(ROOT/'CANONICAL_HANDOFF_OWNER.md').read_text(encoding='utf-8',errors='replace') if (ROOT/'CANONICAL_HANDOFF_OWNER.md').exists() else ''
for token in [
 'DESTINATION_LOCK_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'UNKNOWN_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'PROVENIÊNCIA_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'NEXT_CURSOR_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'CHECKSUM != PROVA_SEMÂNTICA',
 'OWNER_MISSING_OR_REGRESSED -> REPO_CONTRACT_VERIFY=FAIL',
]:
    if token not in owner: errors.append(f'CANONICAL_HANDOFF_OWNER_GUARD_MISSING:{token}')

repo_verifier=(ROOT/'verify_repo_contract.py').read_text(encoding='utf-8',errors='replace') if (ROOT/'verify_repo_contract.py').exists() else ''
for token in [
 "check('docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md'",
 "classification='POMBO_CANONICAL_HANDOFF_OWNER'",
 "POMBO_CANONICAL_HANDOFF_OWNER=PASS",
]:
    if token not in repo_verifier: errors.append(f'REPO_VERIFIER_OWNER_CHECK_MISSING:{token}')

counterproof=(ROOT/'test_pombo_handoff_counterproof.py').read_text(encoding='utf-8',errors='replace') if (ROOT/'test_pombo_handoff_counterproof.py').exists() else ''
for token in ['DELETE_OWNER_FAILS_CLOSED=PASS','REGRESSED_OWNER_FAILS_CLOSED=PASS','POMBO_OWNER_COUNTERPROOF=PASS']:
    if token not in counterproof: errors.append(f'COUNTERPROOF_GUARD_MISSING:{token}')

workflow=(ROOT/'trigger-fabric-package.yml').read_text(encoding='utf-8',errors='replace') if (ROOT/'trigger-fabric-package.yml').exists() else ''
for token in [
 'docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md',
 'docs/CONSCIENCIA/APRENDIZADOS/2026-08-24-pombo-correio-com-checksum.md',
 'test_pombo_handoff_counterproof.py',
]:
    if token not in workflow: errors.append(f'WORKFLOW_POMBO_WIRING_MISSING:{token}')

if errors:
    print('VERIFY=FAIL')
    print('\n'.join(errors))
    sys.exit(1)

print('VERIFY=PASS')
print(f'FILES_VERIFIED={len(manifest.get("files",[]))}')
print('BOT_ENTRY_CONTRACT=PASS')
print('OUTPUT_GUARD_CONTRACT=PASS')
print('POMBO_CANONICAL_HANDOFF_OWNER=PASS')
print('POMBO_OWNER_COUNTERPROOF_WIRED=PASS')
print('GLOBAL_RUNTIME_100_PERCENT=NOT_PROVEN')
