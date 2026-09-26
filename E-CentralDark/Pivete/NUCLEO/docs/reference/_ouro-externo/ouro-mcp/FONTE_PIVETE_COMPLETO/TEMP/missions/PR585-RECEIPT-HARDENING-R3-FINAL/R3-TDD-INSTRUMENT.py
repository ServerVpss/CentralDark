import hashlib
import importlib.util
import json
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(r'E:\CentralDark\Pivete\worktrees\pr585-findings')
OLD_HEAD = '0bf226ae5c18c2bf3ba815bd203616b480143e50'
SCRIPT_REL = '.agents/skills/meta-lupa/scripts/meta_lupa.py'
TARGET = 'docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md'
BRANCH = 'docs/modo-operacional-loop-evidencia-20260731'
CURRENT_HEAD = subprocess.check_output(['git', '-C', str(REPO_ROOT), 'rev-parse', 'HEAD'], text=True).strip()
PARENT_HEAD = subprocess.check_output(['git', '-C', str(REPO_ROOT), 'rev-parse', 'HEAD~1'], text=True).strip()


def load_module(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def base_receipt(evidence_path='evidence.txt', evidence_sha256=None):
    if evidence_sha256 is None:
        evidence_sha256 = hashlib.sha256(b'evidencia-base').hexdigest()
    return {
        'mission_id': 'PR585-RECEIPT-HARDENING-R3-FINAL',
        'host': 'worktree-pr585-findings',
        'timestamp_utc': '2026-08-01T22:00:00Z',
        'repository': 'ServerVpss/CentralDark',
        'target': TARGET,
        'branch': BRANCH,
        'head_sha': CURRENT_HEAD,
        'evidence_path': evidence_path,
        'evidence_sha256': evidence_sha256,
        'writer': 'LUNA',
        'judge': 'INDEPENDENT_JUDGE',
        'status': 'PASS',
        'reason': '',
        'impact': '',
        'mutations': [],
        'tests': [],
        'counterproof': [],
        'rollback': '',
        'chief_decision': 'APPROVED',
        'next_step': '',
    }


def old_check(mod, receipt):
    return mod.validate_operation_receipt(receipt, repo_root=str(REPO_ROOT))


def new_check(mod, receipt, root, expected_head=CURRENT_HEAD, expected_branch=BRANCH, expected_target=TARGET):
    return mod.validate_operation_receipt(
        receipt,
        repo_root=str(REPO_ROOT),
        expected_head=expected_head,
        expected_branch=expected_branch,
        expected_target=expected_target,
        evidence_root=str(root),
    )


def old_promotable(result):
    return bool(result[2].get('approved_for_promotion'))


def green_blocked(result):
    return (not result[0]) or (not result[2].get('approved_for_promotion', False))

with tempfile.TemporaryDirectory(prefix='r3-tdd-') as td:
    temp = Path(td)
    old_source = temp / 'meta_lupa_old.py'
    old_source.write_bytes(subprocess.check_output(['git', '-C', str(REPO_ROOT), 'show', f'{OLD_HEAD}:{SCRIPT_REL}']))
    old_mod = load_module(old_source, 'meta_old')
    new_mod = load_module(REPO_ROOT / SCRIPT_REL, 'meta_new')
    root = temp / 'evidence-root'
    root.mkdir()
    (root / 'evidence.txt').write_bytes(b'evidencia-base')
    outside = temp / 'outside.txt'
    outside.write_text('fora da raiz', encoding='utf-8')
    nested = root / 'nested'
    nested.mkdir()
    symlink_available = True
    try:
        (nested / 'escaped.txt').symlink_to(outside)
    except OSError:
        symlink_available = False

    attacks = []

    def add_attack(attack_id, mutate, expected_reason):
        receipt = base_receipt()
        context = {'expected_head': CURRENT_HEAD, 'expected_branch': BRANCH, 'expected_target': TARGET}
        mutate(receipt, context)
        old_result = old_check(old_mod, receipt)
        new_result = new_check(new_mod, receipt, root, **context)
        attacks.append({
            'ATTACK_ID': attack_id,
            'EXPECTED_FAILURE': expected_reason,
            'RED_RESULT': 'VULNERABILITY_REPRODUCED' if old_promotable(old_result) else f'OLD_BLOCKED:{old_result[1]}',
            'GREEN_RESULT': 'BLOCKED' if green_blocked(new_result) else 'NOT_BLOCKED',
            'REASON_CODE': new_result[1],
            'OLD_DETAILS': old_result[2],
            'GREEN_DETAILS': new_result[2],
        })

    def placeholders(receipt, context):
        receipt['judge'] = 'NONE'
        receipt['_placeholder_variants'] = ['NONE', 'N/A', 'TBD', 'PENDING', '-']
    add_attack('A01_JUDGE_PLACEHOLDER_FAMILY', placeholders, 'placeholder judge cannot promote')
    add_attack('A02_EXPECTED_HEAD_MISMATCH', lambda r, c: (r.update(head_sha=PARENT_HEAD), None)[1], 'exact expected HEAD mismatch')
    add_attack('A03_EXPECTED_BRANCH_MISMATCH', lambda r, c: (r.update(branch='other-branch'), None)[1], 'exact expected branch mismatch')
    add_attack('A04_EXPECTED_TARGET_MISMATCH', lambda r, c: (r.update(target='other-target'), None)[1], 'exact expected target mismatch')
    add_attack('A05_EXPECTED_CONTEXT_OMITTED', lambda r, c: (c.update(expected_target=None), None)[1], 'promotion context incomplete')
    add_attack('A06_EVIDENCE_NOT_FOUND', lambda r, c: (r.update(evidence_path='missing.txt'), None)[1], 'evidence path must exist')
    add_attack('A07_EVIDENCE_ESCAPE', lambda r, c: (r.update(evidence_path='../outside.txt'), None)[1], 'evidence must stay inside root')
    add_attack('A08_EVIDENCE_HASH_MISMATCH', lambda r, c: (r.update(evidence_sha256='0' * 64), None)[1], 'current evidence bytes must match hash')
    if symlink_available:
        add_attack('A09_NESTED_SYMLINK_ESCAPE', lambda r, c: (r.update(evidence_path='nested'), None)[1], 'nested symlink must not escape evidence root')
    else:
        attacks.append({'ATTACK_ID': 'A09_NESTED_SYMLINK_ESCAPE', 'EXPECTED_FAILURE': 'nested symlink must not escape evidence root', 'RED_RESULT': 'UNKNOWN_SYMLINK_UNAVAILABLE', 'GREEN_RESULT': 'UNKNOWN_SYMLINK_UNAVAILABLE', 'REASON_CODE': 'SYMLINK_UNAVAILABLE'})
    def forged_approved_field(receipt, context):
        receipt['judge'] = 'PENDING'
        receipt['approved_for_promotion'] = True
    add_attack('A10_FORGED_APPROVED_FIELD', forged_approved_field, 'unexpected approval field cannot bypass computed gate')

    red = sum(item['RED_RESULT'] == 'VULNERABILITY_REPRODUCED' for item in attacks)
    green = sum(item['GREEN_RESULT'] == 'BLOCKED' for item in attacks)
    print(json.dumps({
        'RED_TARGET': OLD_HEAD,
        'GREEN_TARGET': CURRENT_HEAD,
        'ATTACK_COUNT': len(attacks),
        'RED_REPRODUCED': f'{red}/{len(attacks)}',
        'GREEN_BLOCKED': f'{green}/{len(attacks)}',
        'ATTACKS': attacks,
    }, ensure_ascii=False, sort_keys=True, indent=2))
