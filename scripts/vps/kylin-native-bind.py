#!/usr/bin/env python3
"""Bind an existing KylinBot workspace to a measured CentralDark checkout.
No model installation, credential migration or daemon scheduling here.
"""
import argparse
import datetime
import json
import os
from pathlib import Path
import subprocess


def bind(repo, workspace, expected_sha):
    repo = repo.resolve(strict=True)
    workspace = workspace.resolve(strict=True)
    sha = subprocess.check_output(["git", "-C", str(repo), "rev-parse", "HEAD"], text=True).strip()
    if sha != expected_sha:
        raise RuntimeError("SOURCE_SHA_DRIFT")
    links = {
        "SOUL.md": "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md",
        "AGENTS.md": "AGENTS.md", "LEIA-ME-IA.md": "LEIA-ME-IA.md",
        "CLAUDE.md": "CLAUDE.md", "CENTRALDARK_AI_BOOT.yaml": "CENTRALDARK_AI_BOOT.yaml",
        "docs": "docs", ".agents": ".agents",
        "CentralDark": ".",
        "skills/centraldark-operational-method": ".agents/skills/centraldark-operational-method",
        "skills/capability-contract-router": ".agents/skills/capability-contract-router",
    }
    for src in links.values():
        if not (repo / src).exists():
            raise RuntimeError("MISSING_OWNER:" + src)
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup = workspace / "state" / "centraldark-bind-backups" / stamp
    changes = []
    try:
        for name, src in links.items():
            dest = workspace / name
            target = repo / src
            if dest.is_symlink() and dest.resolve() == target.resolve():
                continue
            dest.parent.mkdir(parents=True, exist_ok=True)
            old = None
            if os.path.lexists(dest):
                old = backup / name
                old.parent.mkdir(parents=True, exist_ok=True)
                dest.rename(old)
            changes.append((dest, old))
            dest.symlink_to(target, target_is_directory=target.is_dir())
    except Exception:
        for dest, old in reversed(changes):
            if dest.is_symlink():
                dest.unlink()
            if old is not None:
                old.rename(dest)
        raise
    receipt = {"source_sha": sha, "repo": str(repo), "workspace": str(workspace),
               "backup": str(backup), "links": links, "result": "BOUND_REFERENCE",
               "runtime_inheritance": "REQUIRES_AGENT_COUNTERPROOF", "secrets_exposed": False}
    state = workspace / "state"
    state.mkdir(exist_ok=True)
    (state / "centraldark-main-binding.json").write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps(receipt))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--workspace", type=Path, required=True)
    parser.add_argument("--sha", required=True)
    args = parser.parse_args()
    bind(args.repo, args.workspace, args.sha)
