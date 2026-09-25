#!/usr/bin/env python3
from pathlib import Path
import json, sys, re

ROOT=Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()
checks=[]

def check(path, needles=(), classification='PROVEN_IN_REPO'):
    p=ROOT/path
    ok=p.exists(); missing=[]; text=''
    if ok and needles:
        text=p.read_text(encoding='utf-8',errors='replace')
        for needle in needles:
            if needle not in text: missing.append(needle)
        ok=ok and not missing
    checks.append({'path':path,'classification':classification,'ok':ok,'missing':missing})

def check_absent(path, forbidden=(), classification='PROVEN_ABSENT_IN_REPO'):
    p=ROOT/path
    ok=p.exists(); violations=[]; text=''
    if ok:
        text=p.read_text(encoding='utf-8',errors='replace')
        for pattern in forbidden:
            if re.search(pattern,text): violations.append(pattern)
        ok=not violations
    checks.append({'path':path,'classification':classification,'ok':ok,'missing':violations})

check('docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md',[
 'CHEFE_SYSTEMATIC_PROOF_REQUIRED=true',
 'SYSTEMATIC_PROOF_REQUIRED_FOR_MATERIAL_CONFIRMATIONS=true',
 'CONFIRMATIONS_ONE_TOPIC_BELOW_ANOTHER=true',
 'PROOF_REF_REQUIRED_FOR_PROVEN=true',
 'NO_PROOF_REF => STATUS=UNKNOWN',
 'GREEN_WITHOUT_RECONSTRUCTIBLE_PROOF=INCOMPLETE',
 'COGNITIVE_DEBT=OPEN => FIXED_POINT=NOT_PROVEN',
], classification='CHEFE_SYSTEMATIC_PROOF_CONTRACT')
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-EXECUTABLE-RECIPE.yml',[
 'human_loop_required: false',
 'do_not_return_full_crystal_block_to_human_by_default: true',
 'human_output_role: HUD_STATUS_AND_BLOCKER_ONLY',
 'ASK_CHEFE_TO_COPY_CRYSTAL_BLOCK',
 'MAKE_HUMAN_CARRY_MACHINE_RECEIPT',
 'DELIVER_THIS_EXACT_BLOCK_TO_HUMAN_AS_REQUIRED_LOOP',
 'STORE_SESSION_CRYSTAL_ONLY_IN_CHAT',
 'vps_runtime_receipt: /root/CentralDark/.artifacts/system-sentinel/receipts/proven-executable-recipe-session-current.json',
 'human_is_not_crystal_transport: true',
 'machine_receipt_must_persist_in_vps_or_repo_owner: true',
], classification='PROVEN_EXECUTABLE_RECIPE_MACHINE_HANDOFF_NOT_HUMAN')
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-DETERMINISTIC-LOCK.yml',[
 'human_is_not_crystal_transport: true',
 'machine_receipt_must_persist_in_vps_or_repo_owner: true',
 'human_handoff_block_forbidden: true',
 'runtime_storage_required: true',
 'runtime_storage_owner: /root/CentralDark/.artifacts/system-sentinel/receipts',
], classification='PROVEN_LOCK_MACHINE_CRYSTAL_BOUNDARY')

print(json.dumps({'ok': all(c['ok'] for c in checks), 'checks': checks}, ensure_ascii=False, indent=2))
if not all(c['ok'] for c in checks):
    sys.exit(1)
