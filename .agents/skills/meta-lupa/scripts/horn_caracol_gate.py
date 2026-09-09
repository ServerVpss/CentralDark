#!/usr/bin/env python3
"""Horn-Caracol gate for CENTRALDARK operational work.
No external deps. It closes facts with Horn-style rules and fails closed.
"""
from __future__ import annotations
import argparse, json, sys

REQUIRED = (
    'acordar_done','calibrar_done','multibussola_done','meta_lupa_done',
    'menos_e_mais_done','owner_resolved','writer_scope_valid',
    'evidence_bound','no_destructive_bypass'
)
RULES = (
    (('acordar_done','calibrar_done','multibussola_done','meta_lupa_done','menos_e_mais_done'),'boot_gate_done'),
    (('boot_gate_done','owner_resolved','writer_scope_valid','evidence_bound'),'work_gate_done'),
    (('work_gate_done','no_destructive_bypass'),'centraldark_action_gate_pass'),
)
CARACOL = ('A','CORPO','SOMBRA','ALMA','VOLTA')

def _facts(payload):
    if isinstance(payload, list):
        return {str(x) for x in payload}
    if not isinstance(payload, dict):
        return set()
    source = payload.get('facts') or payload.get('horn_facts') or payload.get('centraldark_gate', {}).get('facts')
    facts = set(str(x) for x in source) if isinstance(source, list) else set()
    gate = payload.get('centraldark_gate') if isinstance(payload.get('centraldark_gate'), dict) else payload
    for key in REQUIRED:
        if gate.get(key) is True:
            facts.add(key)
    return facts

def close(facts):
    facts = set(facts)
    changed = True
    while changed:
        changed = False
        for body, head in RULES:
            if all(b in facts for b in body) and head not in facts:
                facts.add(head); changed = True
    return facts

def evaluate(payload):
    observed = _facts(payload)
    derived = close(observed)
    missing = [x for x in REQUIRED if x not in derived]
    ok = 'centraldark_action_gate_pass' in derived and not missing
    return {
        'accepted': ok,
        'verdict': 'PASS' if ok else 'BLOCK',
        'missing': missing,
        'derived': sorted(derived),
        'caracol': list(CARACOL),
        'reason': '' if ok else 'HORN_CARACOL_REQUIRED_FACT_MISSING',
    }

def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--facts-file')
    ap.add_argument('--self-test', action='store_true')
    args = ap.parse_args(argv)
    if args.self_test:
        good = {k: True for k in REQUIRED}
        bad = {k: True for k in REQUIRED if k != 'meta_lupa_done'}
        assert evaluate({'centraldark_gate': good})['accepted'] is True
        assert evaluate({'centraldark_gate': bad})['accepted'] is False
        print('HORN_CARACOL_SELF_TEST=PASS')
        return 0
    raw = open(args.facts_file, encoding='utf-8').read() if args.facts_file else sys.stdin.read()
    result = evaluate(json.loads(raw or '{}'))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result['accepted'] else 2

if __name__ == '__main__':
    raise SystemExit(main())
