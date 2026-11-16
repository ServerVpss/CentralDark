#!/usr/bin/env python3
"""Read-only PR inventory for the CentralDark merge/reconciliation ROV."""
from __future__ import annotations

import argparse
import base64
import concurrent.futures
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from collections import Counter
from pathlib import Path
from typing import Any

API = "https://api.github.com"


def credentials() -> tuple[str, str]:
    proc = subprocess.run(
        ["git", "credential", "fill"],
        input="protocol=https\nhost=github.com\n\n",
        text=True,
        capture_output=True,
        check=True,
    )
    values = dict(
        line.split("=", 1)
        for line in proc.stdout.splitlines()
        if "=" in line
    )
    username = values.get("username", "")
    password = values.get("password", "")
    if not username or not password:
        raise RuntimeError("GITHUB_CREDENTIAL_NOT_AVAILABLE")
    return username, password


def repo_slug() -> str:
    url = subprocess.check_output(
        ["git", "remote", "get-url", "origin"], text=True
    ).strip()
    if "github.com" not in url:
        raise RuntimeError("ORIGIN_IS_NOT_GITHUB")
    slug = url.split("github.com", 1)[1].lstrip(":/")
    return slug.removesuffix(".git")


def api_get(path: str, headers: dict[str, str]) -> Any:
    request = urllib.request.Request(f"{API}{path}", headers=headers)
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def latest_review_states(reviews: list[dict]) -> dict[str, str]:
    latest: dict[str, str] = {}
    for review in reviews:
        user = review.get("user") or {}
        login = user.get("login")
        if login:
            latest[login] = review.get("state", "UNKNOWN")
    return latest


def classify(detail: Any, checks: list[dict], reviews: list[dict]) -> dict:
    states = latest_review_states(reviews)
    pending = [
        check.get("name", "UNKNOWN")
        for check in checks
        if check.get("status") != "completed"
    ]
    failed = [
        check.get("name", "UNKNOWN")
        for check in checks
        if check.get("status") == "completed"
        and check.get("conclusion") not in {"success", "neutral", "skipped"}
    ]
    approvals = sum(state == "APPROVED" for state in states.values())
    changes_requested = sum(
        state == "CHANGES_REQUESTED" for state in states.values()
    )
    state = detail.get("mergeable_state")
    if detail.get("draft"):
        category = "DRAFT"
    elif state == "behind":
        category = "NEEDS_BRANCH_UPDATE"
    elif state == "dirty" or detail.get("mergeable") is False:
        category = "NEEDS_RECONCILIATION"
    elif (
        state == "clean"
        and not pending
        and not failed
        and changes_requested == 0
    ):
        category = (
            "READY_TECHNICAL_WITHOUT_REVIEW_PROOF"
            if approvals == 0
            else "READY_TECHNICAL"
        )
    elif pending:
        category = "BLOCKED_CHECKS_PENDING"
    elif failed:
        category = "BLOCKED_CHECKS_FAILED"
    else:
        category = "UNKNOWN"
    return {
        "number": detail["number"],
        "title": detail["title"],
        "url": detail["html_url"],
        "head_ref": detail["head"]["ref"],
        "head_sha": detail["head"]["sha"],
        "base_ref": detail["base"]["ref"],
        "base_sha": detail["base"]["sha"],
        "mergeable": detail.get("mergeable"),
        "mergeable_state": state,
        "draft": detail.get("draft", False),
        "checks_total": len(checks),
        "checks_pending": pending,
        "checks_failed": failed,
        "approvals": approvals,
        "changes_requested": changes_requested,
        "category": category,
    }


def audit_one(pr: Any, headers: dict[str, str], repo: str) -> dict:
    number = pr["number"]
    detail = api_get(f"/repos/{repo}/pulls/{number}", headers)
    checks = api_get(
        f"/repos/{repo}/commits/{detail['head']['sha']}/check-runs?per_page=100",
        headers,
    ).get("check_runs", [])
    reviews = api_get(f"/repos/{repo}/pulls/{number}/reviews?per_page=100", headers)
    return classify(detail, checks, reviews)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--contract", required=True)
    parser.add_argument("--wait-seconds", type=int, default=10)
    parser.add_argument("--max-workers", type=int, default=8)
    args = parser.parse_args()
    contract = Path(args.contract)
    if not contract.exists():
        raise SystemExit(f"CONTRACT_NOT_FOUND:{contract}")
    username, password = credentials()
    token = base64.b64encode(f"{username}:{password}".encode()).decode()
    headers = {
        "Authorization": f"Basic {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    repo = repo_slug()
    if args.wait_seconds:
        time.sleep(args.wait_seconds)
    prs: list[dict] = []
    for page in range(1, 100):
        batch = api_get(
            f"/repos/{repo}/pulls?state=open&per_page=100&page={page}", headers
        )
        if not isinstance(batch, list):
            raise RuntimeError("GITHUB_PR_LIST_INVALID")
        prs.extend(batch)
        if len(batch) < 100:
            break
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.max_workers) as pool:
        rows = list(pool.map(lambda pr: audit_one(pr, headers, repo), prs))
    rows.sort(key=lambda row: row["number"], reverse=True)
    counts = Counter(row["category"] for row in rows)
    print(
        json.dumps(
            {
                "schema": "centraldark.rov.pr-reconciliation.result.v1",
                "contract": str(contract),
                "repository": repo,
                "open_total": len(rows),
                "read_only": True,
                "readiness_counts": dict(counts),
                "rows": rows,
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (urllib.error.URLError, subprocess.CalledProcessError, RuntimeError) as error:
        print(f"ROV_BLOCKED:{error}", file=sys.stderr)
        raise SystemExit(2)
