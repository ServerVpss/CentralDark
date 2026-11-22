#!/usr/bin/env python3
"""Generate a deterministic CentralDark house inventory.

The script turns one-off repository scans into a repeatable film: every PR/push can
re-measure the house and classify files without creating a parallel system.

Important invariant: when writing the canonical baseline, the output file itself
is excluded from the scan. Otherwise the inventory would hash its own changing
content and never reach a fixed point.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

SKIP_DIRS = {
    '.git', 'node_modules', '.next', 'dist', 'build', '.venv', 'venv', '__pycache__',
    '.cache', '.turbo', '.pytest_cache', '.mypy_cache', '.pnpm-store'
}
SUSPECT_HINTS = ('drift', 'tmp', 'backup', 'old', 'deprecated', 'lixo', 'stale')
CRYSTAL_PREFIXES = (
    'docs/CONSCIENCIA/', 'docs/BRAIN/', 'scripts/', '.github/workflows/',
    'apps/', 'src/', 'supabase/functions/'
)
TRASH_NAMES = {'.DS_Store', 'Thumbs.db'}
DETERMINISTIC_TIMESTAMP = '1970-01-01T00:00:00+00:00'


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def classify(rel: str) -> str:
    name = Path(rel).name
    low = rel.lower()
    if name in TRASH_NAMES or any(part in low for part in ('/tmp/', '/cache/', '/logs/')):
        return 'lixo'
    if any(hint in low for hint in SUSPECT_HINTS):
        return 'suspeito'
    if rel.startswith(CRYSTAL_PREFIXES):
        return 'cristal'
    return 'neutro'


def iter_files(root: Path, excluded: set[str]):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        base = Path(dirpath)
        for filename in sorted(filenames):
            path = base / filename
            rel = path.relative_to(root).as_posix()
            if rel.startswith('.git/') or rel in excluded:
                continue
            yield path, rel


def build_inventory(root: Path, *, excluded: set[str], deterministic: bool) -> dict:
    items = []
    counts = {'cristal': 0, 'suspeito': 0, 'lixo': 0, 'neutro': 0}
    for path, rel in iter_files(root, excluded):
        try:
            stat = path.stat()
            kind = classify(rel)
            counts[kind] = counts.get(kind, 0) + 1
            items.append({
                'path': rel,
                'class': kind,
                'size': stat.st_size,
                'sha256': sha256_file(path),
            })
        except OSError as exc:
            items.append({'path': rel, 'class': 'erro', 'error': str(exc)})

    generated_at = DETERMINISTIC_TIMESTAMP if deterministic else datetime.now(timezone.utc).isoformat()
    return {
        'schema': 'centraldark.inventory.v1',
        'generated_at_utc': generated_at,
        'generation_mode': 'deterministic-baseline' if deterministic else 'runtime-snapshot',
        'root': str(root),
        'excluded_paths': sorted(excluded),
        'counts': counts,
        'items': sorted(items, key=lambda item: item['path']),
        'truth_rules': [
            'CURRENT > HISTORY',
            'UNKNOWN != PASS',
            'DOCUMENTED != EXECUTED',
            'REUSE_BEFORE_CREATE',
            'INVENTORY_OUTPUT_DOES_NOT_HASH_ITSELF',
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', default='.', help='repository root')
    parser.add_argument('--output', default='docs/CONSCIENCIA/INVENTARIO-CASA.json')
    parser.add_argument('--write', action='store_true', help='write output file')
    parser.add_argument('--deterministic-baseline', action='store_true', help='stable output suitable for committing')
    args = parser.parse_args()

    root = Path(args.root).resolve()
    output_rel = Path(args.output).as_posix()
    excluded = {output_rel}
    inventory = build_inventory(root, excluded=excluded, deterministic=args.deterministic_baseline)
    payload = json.dumps(inventory, ensure_ascii=False, indent=2, sort_keys=True) + '\n'

    if args.write:
        output = root / args.output
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(payload, encoding='utf-8')
        print(f'INVENTARIO_WRITTEN {output}')
    else:
        print(payload)
    print('COUNTS', inventory['counts'])
    print('EXCLUDED', sorted(excluded))
    print('MODE', inventory['generation_mode'])
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
