#!/usr/bin/env python3
"""Fail-closed preflight/finalizer for material CentralDark changes.

This extends the existing Trigger Fabric contract. It is not a scheduler,
writer, router, or second brain: it records the current main/PR/issue/commit
context and refuses finalization without a fresh preflight and GitHub receipt.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


def run(root: Path, argv: list[str], timeout: int = 45) -> tuple[int, str]:
    p = subprocess.run(argv, cwd=root, text=True, capture_output=True, timeout=timeout)
    return p.returncode, (p.stdout or p.stderr).strip()


def git(root: Path, *argv: str) -> str:
    code, out = run(root, ["git", *argv])
    if code:
        raise RuntimeError(f"GIT_FAILED:{' '.join(argv)}:{out[-1000:]}")
    return out


def gh_json(root: Path, argv: list[str]) -> object:
    code, out = run(root, ["gh", *argv])
    if code:
        raise RuntimeError(f"GITHUB_READ_FAILED:{' '.join(argv)}:{out[-1000:]}")
    return json.loads(out or "null")


def repo_name(root: Path) -> str:
    remote = git(root, "remote", "get-url", "origin")
    remote = remote.removesuffix(".git")
    if remote.endswith("/CentralDark"):
        return "ServerVpss/CentralDark"
    if remote.endswith(":ServerVpss/CentralDark"):
        return "ServerVpss/CentralDark"
    raise RuntimeError(f"UNEXPECTED_ORIGIN:{remote}")


def base_snapshot(root: Path, repo: str) -> dict:
    git(root, "fetch", "origin", "--prune")
    status = git(root, "status", "--porcelain=v1")
    main_sha = git(root, "rev-parse", "origin/main")
    head_sha = git(root, "rev-parse", "HEAD")
    branch = git(root, "branch", "--show-current")
    prs = gh_json(root, ["pr", "list", "--repo", repo, "--state", "open", "--limit", "100", "--json", "number,title,headRefOid,baseRefName,url"])
    issues = gh_json(root, ["issue", "list", "--repo", repo, "--state", "open", "--limit", "100", "--json", "number,title,url"])
    commits = git(root, "log", "origin/main", "-10", "--format=%H%x09%s").splitlines()
    return {
        "observed_at": datetime.now(timezone.utc).isoformat(),
        "repo": repo,
        "branch": branch,
        "head_sha": head_sha,
        "main_sha": main_sha,
        "dirty_paths": status.splitlines() if status else [],
        "open_prs": prs,
        "open_issues": issues,
        "main_commits": [{"sha": x.split("\t", 1)[0], "subject": x.split("\t", 1)[1]} for x in commits if "\t" in x],
        "consulted": {"main": True, "prs": True, "issues": True, "commits": True},
    }


def write_receipt(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def preflight(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    try:
        snap = base_snapshot(root, repo_name(root))
        snap["operation"] = "MAIN_FIRST_PREFLIGHT"
        snap["decision"] = "PASS" if not snap["dirty_paths"] else "BLOCKED_DIRTY_WORKTREE"
    except Exception as exc:
        snap = {"operation": "MAIN_FIRST_PREFLIGHT", "decision": "BLOCKED", "error": str(exc), "consulted": False}
    write_receipt(Path(args.receipt), snap)
    print(json.dumps(snap, ensure_ascii=False, indent=2))
    return 0 if snap.get("decision") == "PASS" else 2


def finalize(args: argparse.Namespace) -> int:
    root = Path(args.root).resolve()
    try:
        pre = json.loads(Path(args.preflight).read_text(encoding="utf-8"))
        if pre.get("decision") != "PASS":
            raise RuntimeError("PREFLIGHT_NOT_PASS")
        snap = base_snapshot(root, repo_name(root))
        commit = git(root, "rev-parse", "HEAD")
        if commit != args.commit:
            raise RuntimeError(f"COMMIT_MISMATCH:{commit}!={args.commit}")
        if snap["dirty_paths"]:
            raise RuntimeError("FINALIZE_DIRTY_WORKTREE")
        if args.pr:
            pr = gh_json(root, ["pr", "view", str(args.pr), "--repo", snap["repo"], "--json", "number,state,headRefOid,baseRefName,url"])
            if pr.get("headRefOid") != commit:
                raise RuntimeError("PR_HEAD_MISMATCH")
        payload = {"operation": "MAIN_FIRST_FINALIZE", "preflight": pre, "final": snap, "commit": commit, "pr": args.pr, "tests": args.tests, "debt": args.debt, "next_cursor": args.next_cursor, "decision": "PASS" if not args.debt else "PARTIAL"}
        write_receipt(Path(args.receipt), payload)
        if args.comment_pr:
            body = ("Main-first receipt\n\n" + f"COMMIT={commit}\nMAIN_SHA={snap['main_sha']}\n" + f"TESTS={args.tests or 'not supplied'}\nDEBT={args.debt or 'none declared'}\nNEXT_CURSOR={args.next_cursor}\n" + f"RECEIPT={args.receipt}\n")
            code, out = run(root, ["gh", "pr", "comment", str(args.comment_pr), "--repo", snap["repo"], "--body", body])
            if code:
                raise RuntimeError(f"PR_COMMENT_FAILED:{out[-1000:]}")
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0 if payload["decision"] == "PASS" else 2
    except Exception as exc:
        payload = {"operation": "MAIN_FIRST_FINALIZE", "decision": "BLOCKED", "error": str(exc)}
        write_receipt(Path(args.receipt), payload)
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 2


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".")
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("preflight")
    p.add_argument("--receipt", required=True)
    p.set_defaults(func=preflight)
    f = sub.add_parser("finalize")
    f.add_argument("--preflight", required=True)
    f.add_argument("--receipt", required=True)
    f.add_argument("--commit", required=True)
    f.add_argument("--pr")
    f.add_argument("--comment-pr")
    f.add_argument("--tests", default="")
    f.add_argument("--debt", default="")
    f.add_argument("--next-cursor", required=True)
    f.set_defaults(func=finalize)
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
