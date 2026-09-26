# COMANDO - generate_rank_input.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\codex-security\scripts\generate_rank_input.py
**SHA:** 625913be1fa1339d
**Timestamp:** 2026-08-26T18:31:16.336304
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- for line_number, raw_line in enumerate(handle, start=1):
- write_jsonl(shard_path, rows[start : start + args.max_rows])

### Padroes
- SHARD_INPUT_PATTERN = re.compile(r"^rank-shard-([0-9]{4,})\.input\.jsonl$")

### Gaps
- raise SystemExit(f"{label} missing: {path}")
- missing = sorted(expected - actual)
- if missing:
- raise SystemExit(f"Rank shard directory missing: {shard_dir}")
- raise SystemExit(f"Rank pool plan missing: {plan_path}")
- f"missing={sorted(expected_fields - actual_fields)}; "
- f"missing={sorted(worker_fields - set(worker))}; "
- f"missing={missing}; duplicates={duplicates}; unexpected={unexpected}"
- f"missing={missing}; duplicates={duplicates}; unexpected={unexpected}"
- missing = sorted(expected_outputs - actual_output_names)

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Generate and post-process Codex Security scan worklists.

This script stays deliberately model-free:

- `make-repo-rank-input` creates the deterministic repository or scoped-path
  JSONL candidate worklist that ranking subagents consume.
- `make-diff-rank-input` creates the deterministic diff-scoped JSONL candidate
  worklist from Git changed paths. It supports committed revision diffs and
  local working-tree patches.
- `make-rank-shards` partitions the ranking input into deterministic shards.
- `make-rank-pool-plan` assigns those shards to a deterministic bounded worker
  pool.
- `validate-rank-worker` validates one worker slot and emits a content-bound
  completion receipt.
- `validate-rank-shard` validates one completed worker output before the
  coordinator accepts it.
- `validate-rank-pool` validates the pool plan and every assigned shard output.
- `merge-rank-outputs` validates and combines worker-local shard outputs.
- `copy-deep-review-input` copies every candidate into the deep-review worklist
  for exhaustive mode.
- `select-deep-review-input` selects the ranked rows for deep review.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from collections import Counter
from collections.abc import Callable
from pathlib import Path

# Some plugin hosts launch Python with safe-path isolation enabled.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from rank_preview import DEFAULT_PREVIEW_BYTES, TEXT_CODE_EXTENSIONS, preview_for

EXCLUDED_DIRS = {
    ".cache",
    ".circleci",
    ".devcontainer",
    ".git",
    ".github",
    ".idea",
    ".mypy_cache",
    ".pytest_cache",
    ".ruff_cache",
    ".tox",
    ".venv",
    ".vscode",
    "__pycache__",
    "bench",
    "benchmark",
    "bintest",
    "build",
    "build_config",
    "build_configs",
    "build-tools",
    "build_tools",
    "ci",
    "coverage",
    "deps",
    "dev",
    "dist",
    "doc",
    "docs",
    "example",
    "examples",
    "external",
    "extern",
    "fixture",
    "fixtures",
    "generated",
    "node_modules",
    "sample",
    "samples",
    "target",
    "test",
    "tests",
    "testing",
    "third-party",
    "third_party",
    "tmp",
    "vendor",
}

EXCLUDED_FILENAMES = {
    ".DS_Store",
    "CHANGELOG",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "Dockerfile",
    "Gemfile",
    "Gemfile.lock",
    "LICENSE",
    "LICENSE.md",
    "Makefile",
    "NEWS",
    "NEWS.md",
    "NOTICE",
    "README",
    "README.md",
    "README.rst",
    "Rakefile",
    "SECURITY.md",
    "TODO",
    "TODO.md",
    "docker-compose.yml",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
}

SHARD_INPUT_GLOB = "rank-shard-*.input.jsonl"
SHARD_OUTPUT_GLOB = "rank-shard-*.output.jsonl"
SHARD_INPUT_PATTERN = re.compile(r"^rank-shard-([0-9]{4,})\.input\.jsonl$")
RANK_POOL_PLAN_SCHEMA_VERSION = 1
RANK_POOL_STRATEGY = "round_robin"
RANK_POOL_WORKER_CAP = 6
JsonRow = dict[str, object]
RowValidator = Callable[[JsonRow, Path, int], None]
RankWorkerAssignment = tuple[int, list[str], list[str]]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Codex Security scan worklist helper.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    make = subparsers.add_parser(
        "make-repo-rank-input",
        help="Create rank_input.jsonl for subagent-based file ranking.",
    )
    make.add_argument("--repo", required=True, help="Repository root.")
    make.add_argument(
        "--scope",
        default=".",
        help="Path within the repository to scan. Defaults to the repository root.",
    )
    make.add_argument("--out", required=True, help="Output rank_input.jsonl path.")
    make.add_argument("--area", default="", help="Area label. Defaults to scope.")
    make.add_argument(
        "--preview-bytes",
        type=int,
        default=DEFAULT_PREVIEW_BYTES,
        help=f"Maximum UTF-8 bytes in each preview. Defaults to {DEFAULT_PREVIEW_BYTES}.",
    )

    diff = subparsers.add_parser(
        "make-diff-rank-input",
        help="Create rank_input.jsonl from Git changed source-like files.",
    )
    diff.add_argument("--repo", required=True, help="Repository root.")
    diff.add_argument("--base", required=True, help="Git diff base revision.")
    diff.add_argument(
        "--mode",
        choices=("revisions", "local-patch"),
        default="revisions",
        help="Git diff mode: committed revisions or staged plus unstaged local patch.",
    )
    diff.add_argument("--head", default="HEAD", help="Git diff head revision.")
    diff.add_argument("--out", required=True, help="Output rank_input.jsonl path.")
    diff.add_argument("--area", default="diff", help="Area label for ranking rows.")
    diff.add_argument(
        "--preview-bytes",
        type=int,
        default=DEFAULT_PREVIEW_BYTES,
        help=f"Maximum UTF-8 bytes in each preview. 
```