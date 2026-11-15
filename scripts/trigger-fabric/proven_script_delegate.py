#!/usr/bin/env python3
"""Thin script-only preflight for CentralDark's EXISTING sealed recipe runner.

No LLM, network, agent spawning, registry mutation or new executor. A known
fingerprint routes to the canonical replay[-run]; all other inputs stop for a
scoped delta. The underlying runner owns authorization, commands and proofs.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

LOADER = Path('scripts/trigger-fabric/centraldark_full_trigger_boot.py')
REGISTRY = 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-CLAIMS.lock.json'


def call(argv: list[str]) -> tuple[int, dict]:
    try:
        p = subprocess.run(argv, capture_output=True, text=True, timeout=180, check=False)
        payload = json.loads(p.stdout)
        if not isinstance(payload, dict):
            raise ValueError('NON_OBJECT_RESULT')
        return p.returncode, payload
    except (OSError, ValueError, subprocess.TimeoutExpired, json.JSONDecodeError) as exc:
        return 70, {'verdict': 'UNKNOWN', 'reason': f'EXECUTOR_UNAVAILABLE:{type(exc).__name__}'}


def delegate(args: argparse.Namespace) -> tuple[int, dict]:
    repo = Path(args.repo).resolve()
    runner = repo / LOADER
    base = [sys.executable, str(runner)]
    if not runner.is_file():
        return 70, {'verdict': 'UNKNOWN', 'reason': 'CANONICAL_RUNNER_MISSING', 'model_calls': 0}
    if bool(args.fingerprint) == bool(args.material):
        return 2, {'verdict': 'DENY', 'reason': 'EXACTLY_ONE_FINGERPRINT_SOURCE_REQUIRED', 'model_calls': 0}

    fingerprint = args.fingerprint
    if args.material:
        fcmd = base + ['fingerprint']
        for value in args.material:
            fcmd += ['--material', value]
        code, result = call(fcmd)
        if code != 0 or not result.get('dependency_fingerprint'):
            return 70, {'verdict': 'UNKNOWN', 'reason': 'FINGERPRINT_FAILED', 'model_calls': 0}
        fingerprint = result['dependency_fingerprint']

    common = ['--repo', str(repo), '--registry', args.registry, '--claim', args.claim,
              '--owner', args.owner, '--dependency-fingerprint', fingerprint]
    code, probe = call(base + ['replay'] + common)
    registry = Path(args.registry)
    if not registry.is_absolute():
        registry = repo / registry
    registry_missing = not registry.is_file()
    if (code == 70 or probe.get('verdict') == 'UNKNOWN'
            or (registry_missing and probe.get('reason') == 'CLAIM_NOT_SEALED')):
        return 70, {'verdict': 'UNKNOWN',
                    'reason': ('RECIPE_REGISTRY_UNAVAILABLE' if registry_missing
                               else probe.get('reason', 'EXECUTOR_UNAVAILABLE')),
                    'claim': args.claim, 'owner': args.owner,
                    'dependency_fingerprint': fingerprint,
                    'model_calls': 0, 'subagent_calls': 0, 'script_executed': False}
    if code != 0 or probe.get('verdict') != 'PASS':
        return 3, {'verdict': 'DELTA_REQUIRED', 'reason': probe.get('reason', probe.get('action', 'NOT_PROVEN')),
                   'claim': args.claim, 'owner': args.owner, 'dependency_fingerprint': fingerprint,
                   'next_cursor': 'EXISTING_OWNER_AFFECTED_CONE_ONLY', 'model_calls': 0,
                   'subagent_calls': 0, 'script_executed': False}
    if not args.execute:
        return 0, {'verdict': 'SCRIPT_REPLAY_ELIGIBLE', 'action': 'REPLAY_PROVEN_RECIPE',
                   'claim': args.claim, 'owner': args.owner, 'dependency_fingerprint': fingerprint,
                   'model_calls': 0, 'subagent_calls': 0, 'script_executed': False}

    run = base + ['replay-run'] + common + ['--timeout', str(args.timeout)]
    for binding in args.binding:
        run += ['--binding', binding]
    if args.shell:
        run += ['--shell', args.shell]
    if args.allow_mutation:
        run += ['--allow-mutation']
    if args.receipt_out:
        run += ['--receipt-out', args.receipt_out]
    code, result = call(run)
    # Um selo do owner sem comprovacao dos tres efeitos nao e Fixed Point.
    ok = (code == 0 and result.get('verdict') == 'REUSE_CRYSTAL'
          and result.get('execution_pass') is True
          and result.get('proof_pass') is True
          and result.get('expected_effect_match') is True)
    return (0 if ok else 7), {
        'verdict': 'REUSE_CRYSTAL' if ok else 'REPLAY_FAILED',
        'claim': args.claim, 'owner': args.owner, 'dependency_fingerprint': fingerprint,
        'execution_pass': result.get('execution_pass'),
        'proof_pass': result.get('proof_pass'),
        'expected_effect_match': result.get('expected_effect_match'),
        'reason': (None if ok else ('PROOF_INCOMPLETE' if result.get('verdict') == 'REUSE_CRYSTAL'
                                    else result.get('reason', 'OWNER_REPLAY_FAILED'))),
        'receipt_out': result.get('receipt_out'),
        'model_calls': 0, 'subagent_calls': 0,
        'script_executed': True if ok else None,
        'execution_attempted': True,
        'next_cursor': 'FIXED_POINT' if ok else 'AFFECTED_CONE_COUNTERPROOF',
    }


def main() -> int:
    p = argparse.ArgumentParser(description='Script-first delegate; no model invocation')
    p.add_argument('--repo', default=str(Path(__file__).resolve().parents[2]))
    p.add_argument('--registry', default=REGISTRY)
    p.add_argument('--claim', required=True)
    p.add_argument('--owner', required=True)
    p.add_argument('--fingerprint', default='')
    p.add_argument('--material', action='append', default=[])
    p.add_argument('--binding', action='append', default=[])
    p.add_argument('--execute', action='store_true')
    p.add_argument('--allow-mutation', action='store_true')
    p.add_argument('--shell', default='')
    p.add_argument('--timeout', type=int, default=60)
    p.add_argument('--receipt-out', default='')
    args = p.parse_args()
    code, receipt = delegate(args)
    print(json.dumps(receipt, ensure_ascii=False, indent=2))
    return code


if __name__ == '__main__':
    sys.exit(main())
