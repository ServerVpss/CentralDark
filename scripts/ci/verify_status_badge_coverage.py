#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
WORKFLOWS_DIR = ROOT / '.github' / 'workflows'
INDEX = ROOT / 'docs' / 'STATUS-BADGES.md'

def workflow_files():
    return sorted(p.name for p in WORKFLOWS_DIR.glob('*.y*ml') if p.is_file())

def indexed_workflows(text: str):
    found = set()
    for line in text.splitlines():
        m = re.match(r'^\| `([^`]+\.ya?ml)` \|', line)
        if m:
            found.add(m.group(1))
    return found

def main():
    workflows = workflow_files()
    if not INDEX.is_file():
        print('STATUS_BADGE_COVERAGE=FAIL')
        print('CAUSE=STATUS_BADGES_INDEX_MISSING')
        return 1
    text = INDEX.read_text(encoding='utf-8')
    indexed = indexed_workflows(text)
    missing = sorted(set(workflows) - indexed)
    extra = sorted(indexed - set(workflows))
    print(f'WORKFLOW_FILES={len(workflows)}')
    print(f'WORKFLOW_BADGES_INDEXED={len(indexed)}')
    print(f'MISSING={len(missing)}')
    print(f'EXTRA={len(extra)}')
    if missing:
        print('MISSING_WORKFLOWS=' + ','.join(missing))
    if extra:
        print('EXTRA_WORKFLOWS=' + ','.join(extra))
    required = [
        'BADGE_IS_TELEMETRY_NOT_PROOF=true',
        'UNKNOWN_IS_NOT_PASS=true',
        'SAME_HEAD_PROOF_REQUIRED_FOR_CI_CLAIM=true',
        'WORKFLOW_BADGE_COVERAGE=ALL_WORKFLOW_FILES',
    ]
    absent = [token for token in required if token not in text]
    if absent:
        print('ABSENT_CONTRACT=' + ','.join(absent))
        print('STATUS_BADGE_COVERAGE=FAIL')
        return 1
    if missing or extra:
        print('STATUS_BADGE_COVERAGE=FAIL')
        return 1
    print('WORKFLOW_FILES_EQ_WORKFLOW_BADGES_INDEXED=true')
    print('STATUS_BADGE_COVERAGE=PASS')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
