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
from datetime import datetime, timezone
from pathlib import Path
import yaml
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


def git_ref(ref: str) -> str | None:
    """Resolve uma ref local sem mutar o repositorio (readback minimo do contrato)."""
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "--verify", ref], text=True
        ).strip()
    except subprocess.CalledProcessError:
        return None


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
        "html_url": detail["html_url"],
        "state": detail.get("state"),
        "head_ref": detail["head"]["ref"],
        "head_sha": detail["head"]["sha"],
        "base_ref": detail["base"]["ref"],
        "base_sha": detail["base"]["sha"],
        "mergeable": detail.get("mergeable"),
        "mergeable_state": state,
        "draft": detail.get("draft", False),
        "changed_files": detail.get("changed_files"),
        "labels": [label.get("name") for label in detail.get("labels", [])],
        "checks": {"total": len(checks), "pending": pending, "failed": failed},
        "reviews": {"approvals": approvals, "changes_requested": changes_requested},
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


def verify_receipt(receipt_path: Path, contract_path: Path) -> dict:
    """Valida um recibo ROV contra o contrato, sem alterar estado.

    Regras:
      - todos os receipts.required_fields do contrato estao presentes;
      - verdict pertence a {PASS, PARTIAL, BLOCKED, UNKNOWN};
      - verdict PASS exige receipt_persisted_in_main_sha != PENDING;
      - verdict PARTIAL exige ao menos um campo em 'blocked'/'unknown'.
    Saida: {valid, problems, missing} (json para readback).
    """
    contract = Path(contract_path)
    if not contract.exists():
        return {"valid": False, "problems": [f"CONTRACT_NOT_FOUND:{contract}"]}
    contract_data = yaml.safe_load(contract.read_text(encoding="utf-8"))
    required = contract_data.get("receipts", {}).get("required_fields", [])
    try:
        data = yaml.safe_load(receipt_path.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        return {"valid": False, "problems": [f"RECEIPT_PARSE_FAIL:{exc}"]}
    missing = [k for k in required if k not in data]
    problems: list[str] = []
    if missing:
        problems.append(f"MISSING_FIELD:{','.join(missing)}")
    verdict = data.get("verdict")
    if verdict not in {"PASS", "PARTIAL", "BLOCKED", "UNKNOWN"}:
        problems.append(f"VERDICT_INVALID:{verdict!r}")
    persisted = str(data.get("receipt_persisted_in_main_sha", ""))
    if "PENDING_" in persisted and verdict == "PASS":
        problems.append("PASS_REQUIRES_RECEIPT_PERSISTED_IN_MAIN")
    return {"valid": len(problems) == 0, "problems": problems, "missing": missing}


def main() -> int:
    parser = argparse.ArgumentParser(description="Read-only PR inventory for the CentralDark merge/reconciliation ROV.")
    parser.add_argument("--contract", required=True, help="caminho do contrato ROV")
    parser.add_argument("--verify-receipt", help="verificar um recibo ROV contra o contrato (saida JSON)")
    parser.add_argument("--wait-seconds", type=int, default=10)
    parser.add_argument("--max-workers", type=int, default=8)
    args = parser.parse_args()
    contract = Path(args.contract)
    if args.verify_receipt:
        result = verify_receipt(Path(args.verify_receipt), contract)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0 if result["valid"] else 1
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
    current_origin_main_sha = git_ref("origin/main")
    audit_timestamp = datetime.now(timezone.utc).isoformat()
    print(
        json.dumps(
            {
                "schema": "centraldark.rov.pr-reconciliation.result.v1",
                "contract": str(contract),
                "repository": repo,
                "open_total": len(rows),
                "read_only": True,
                "current_origin_main_sha": current_origin_main_sha,
                "audit_timestamp": audit_timestamp,
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
