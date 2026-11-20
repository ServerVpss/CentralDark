#!/usr/bin/env python3
import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STITCH_MARKER = "🪡"


def run_git(args, cwd=ROOT, check=True, timeout=30):
    proc = subprocess.run(
        ["git", *args],
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=timeout,
        check=False,
    )
    if check and proc.returncode != 0:
        raise RuntimeError(f"GIT_FAILED:{' '.join(args)}:{proc.stderr.strip()}")
    return proc


def current_head(cwd=ROOT):
    sha = run_git(["rev-parse", "HEAD"], cwd=cwd).stdout.strip()
    branch_proc = run_git(["symbolic-ref", "--quiet", "--short", "HEAD"], cwd=cwd, check=False)
    branch = branch_proc.stdout.strip() if branch_proc.returncode == 0 else "DETACHED"
    return branch, sha


def object_available(sha, cwd=ROOT):
    proc = run_git(["cat-file", "-e", f"{sha}^{{object}}"], cwd=cwd, check=False)
    return proc.returncode == 0


def local_refs(cwd=ROOT):
    proc = run_git([
        "for-each-ref",
        "--format=%(refname)%09%(objectname)%09%(objecttype)",
        "refs/heads",
        "refs/remotes",
        "refs/tags",
    ], cwd=cwd)
    items = []
    for line in proc.stdout.splitlines():
        if not line.strip():
            continue
        parts = line.split("\t")
        if len(parts) != 3:
            continue
        ref, sha, obj_type = parts
        source = (
            "LOCAL_HEADS" if ref.startswith("refs/heads/") else
            "LOCAL_REMOTES" if ref.startswith("refs/remotes/") else
            "TAGS"
        )
        items.append({"ref": ref, "sha": sha, "object_type": obj_type, "source": source})
    return items


def reachable_commits(cwd=ROOT):
    proc = run_git(["rev-list", "--all"], cwd=cwd)
    return [line.strip() for line in proc.stdout.splitlines() if line.strip()]


def ls_remote(pattern_args, cwd=ROOT):
    proc = run_git(["ls-remote", "origin", *pattern_args], cwd=cwd, check=False, timeout=45)
    if proc.returncode != 0:
        return [], proc.stderr.strip() or "ls-remote failed"
    items = []
    for line in proc.stdout.splitlines():
        if not line.strip():
            continue
        try:
            sha, ref = line.split("\t", 1)
        except ValueError:
            continue
        if ref.endswith("^{}"):
            continue
        if ref.startswith("refs/heads/"):
            source = "REMOTE_HEADS"
        elif ref.startswith("refs/tags/"):
            source = "REMOTE_TAGS"
        elif ref.startswith("refs/pull/"):
            source = "REMOTE_PULL_HEADS_WHEN_DISCOVERABLE"
        else:
            source = "REMOTE_OTHER"
        items.append({"ref": ref, "sha": sha, "object_type": "UNKNOWN_REMOTE", "source": source})
    return items, None


def classify(item, current_branch, head_sha, main_sha):
    ref = item["ref"]
    sha = item["sha"]
    if sha == head_sha and ref == f"refs/heads/{current_branch}":
        return "CURRENT_HEAD"
    if main_sha and sha == main_sha and ref in {"refs/heads/main", "refs/remotes/origin/main"}:
        return "CURRENT_MAIN"
    if item["source"] == "REMOTE_PULL_HEADS_WHEN_DISCOVERABLE":
        return "PR_HEAD_REMOTE"
    if item["source"].startswith("REMOTE_") and not item.get("object_available_locally", False):
        return "REMOTE_ONLY_REF"
    return "HISTORICAL_REACHABLE"


def build_inventory(cwd=ROOT, include_remote=False):
    current_branch, head_sha = current_head(cwd)
    main_proc = run_git(["rev-parse", "refs/heads/main"], cwd=cwd, check=False)
    if main_proc.returncode != 0:
        main_proc = run_git(["rev-parse", "refs/remotes/origin/main"], cwd=cwd, check=False)
    main_sha = main_proc.stdout.strip() if main_proc.returncode == 0 else None

    refs = local_refs(cwd)
    remote_errors = []
    if include_remote:
        remote_regular, error = ls_remote(["--heads", "--tags"], cwd=cwd)
        if error:
            remote_errors.append({"scope": "heads_tags", "error": error})
        refs.extend(remote_regular)
        remote_prs, error = ls_remote(["refs/pull/*/head"], cwd=cwd)
        if error:
            remote_errors.append({"scope": "pull_heads", "error": error})
        refs.extend(remote_prs)

    dedup = {}
    for item in refs:
        key = (item["ref"], item["sha"], item["source"])
        dedup[key] = item
    refs = sorted(dedup.values(), key=lambda x: (x["source"], x["ref"], x["sha"]))

    for item in refs:
        item["object_available_locally"] = object_available(item["sha"], cwd=cwd)
        item["classification"] = classify(item, current_branch, head_sha, main_sha)
        item["current_state_claim"] = item["classification"] in {"CURRENT_HEAD", "CURRENT_MAIN"}
        item["stitch_marker"] = STITCH_MARKER
        item["provenance"] = f"git:{item['source']}:{item['ref']}"

    commits = reachable_commits(cwd)
    ref_shas = {item["sha"] for item in refs}
    commit_records = [
        {
            "sha": sha,
            "reachable_from_discovered_refs": sha in set(commits),
            "is_ref_tip": sha in ref_shas,
            "stitch_marker": STITCH_MARKER,
            "classification": "CURRENT_HEAD" if sha == head_sha else "HISTORY",
        }
        for sha in commits
    ]

    return {
        "schema": "centraldark.pegatudo-history-inventory.v1",
        "ok": not (include_remote and remote_errors),
        "root": str(Path(cwd).resolve()),
        "current_branch": current_branch,
        "head_sha": head_sha,
        "main_sha": main_sha,
        "remote_requested": include_remote,
        "remote_status": "PASS" if include_remote and not remote_errors else ("UNKNOWN" if include_remote else "SKIPPED"),
        "remote_errors": remote_errors,
        "ref_count": len(refs),
        "commit_count": len(commits),
        "refs": refs,
        "commits": commit_records,
        "rules": {
            "history_is_current_state": False,
            "discovered_ref_is_crystal": False,
            "unknown_is_pass": False,
            "direct_main_write": False,
        },
    }


def self_test():
    with tempfile.TemporaryDirectory(prefix="centraldark-pegatudo-") as tmp:
        repo = Path(tmp)
        run_git(["init", "-b", "main"], cwd=repo)
        run_git(["config", "user.email", "centraldark-test@example.invalid"], cwd=repo)
        run_git(["config", "user.name", "CentralDark Test"], cwd=repo)
        (repo / "a.txt").write_text("main\n", encoding="utf-8")
        run_git(["add", "a.txt"], cwd=repo)
        run_git(["commit", "-m", "main"], cwd=repo)
        main_sha = run_git(["rev-parse", "HEAD"], cwd=repo).stdout.strip()
        run_git(["checkout", "-b", "forgotten-branch"], cwd=repo)
        (repo / "b.txt").write_text("history\n", encoding="utf-8")
        run_git(["add", "b.txt"], cwd=repo)
        run_git(["commit", "-m", "forgotten delta"], cwd=repo)
        forgotten_sha = run_git(["rev-parse", "HEAD"], cwd=repo).stdout.strip()
        run_git(["tag", "history-tag"], cwd=repo)

        inv = build_inventory(repo, include_remote=False)
        refs = {(item["ref"], item["sha"]) for item in inv["refs"]}
        if ("refs/heads/main", main_sha) not in refs:
            raise RuntimeError("SELF_TEST_MAIN_NOT_FOUND")
        if ("refs/heads/forgotten-branch", forgotten_sha) not in refs:
            raise RuntimeError("SELF_TEST_FORGOTTEN_BRANCH_NOT_FOUND")
        if not any(ref == "refs/tags/history-tag" for ref, _ in refs):
            raise RuntimeError("SELF_TEST_TAG_NOT_FOUND")
        if forgotten_sha not in {item["sha"] for item in inv["commits"]}:
            raise RuntimeError("SELF_TEST_FORGOTTEN_COMMIT_NOT_FOUND")
        if inv["rules"]["history_is_current_state"] is not False:
            raise RuntimeError("SELF_TEST_HISTORY_CURRENT_GUARD_FAIL")
        return {
            "schema": "centraldark.pegatudo-history-self-test.v1",
            "ok": True,
            "main_sha": main_sha,
            "forgotten_branch_sha": forgotten_sha,
            "ref_count": inv["ref_count"],
            "commit_count": inv["commit_count"],
            "stitch_marker": STITCH_MARKER,
        }


def main():
    parser = argparse.ArgumentParser(description="🪡 CentralDark PEGATUDO historical git inventory")
    parser.add_argument("--inventory", action="store_true")
    parser.add_argument("--remote", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--output", default="")
    args = parser.parse_args()

    try:
        if args.self_test:
            result = self_test()
            print(json.dumps(result, ensure_ascii=False, indent=2))
            print("PEGATUDO_HISTORY_SELF_TEST=PASS")
            return 0

        inventory = build_inventory(ROOT, include_remote=args.remote)
        if args.output:
            output = Path(args.output)
            if not output.is_absolute():
                output = ROOT / output
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if args.inventory:
            print(json.dumps(inventory, ensure_ascii=False, indent=2))
        else:
            print(json.dumps({
                "schema": inventory["schema"],
                "ok": inventory["ok"],
                "current_branch": inventory["current_branch"],
                "head_sha": inventory["head_sha"],
                "main_sha": inventory["main_sha"],
                "ref_count": inventory["ref_count"],
                "commit_count": inventory["commit_count"],
                "remote_status": inventory["remote_status"],
                "stitch_marker": STITCH_MARKER,
            }, ensure_ascii=False, indent=2))
        return 0 if inventory["ok"] else 1
    except Exception as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        if args.self_test:
            print("PEGATUDO_HISTORY_SELF_TEST=FAIL", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
