from __future__ import annotations

# #OBSERVACOES#
# @owner: apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/probes/github.py
# @doc_ref: docs/CONSCIENCIA/RECEIPTS/2026-11-03-branches-891-funil-hud.md
# @last_updated: 2026-11-03T18:45:59.211Z
# @implementado: CI de SHA candidato obrigatorio antes de GitHub PASS.
# @pendente: suite source/CI real SAME_HEAD no PR; nao mediu runtime.
# @estado: SOURCE_PATCHED; CI=UNKNOWN; RUNTIME=NOT_TESTED_BY_SCOPE
# @next_cursor: validar checks no SHA atual, preservar branches.

import os
from urllib.parse import quote

from ..models import Evidence, ProbeReceipt, Status
from .common import fetch_json


class GitHubProbe:
    domain = "github"

    def __init__(self, config: dict):
        self.config = config

    def run(self) -> ProbeReceipt:
        repo = self.config.get("repository", "ServerVpss/CentralDark")
        branch = self.config.get("branch", "main")
        token_env = self.config.get("token_env", "GITHUB_TOKEN")
        token = os.getenv(token_env)
        headers = {"Accept": "application/vnd.github+json", "User-Agent": "centraldark-fixed-point-fabric"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        api = self.config.get("api_url", "https://api.github.com").rstrip("/")
        blockers: list[str] = []
        evidence: list[Evidence] = []
        try:
            ref_status, ref = fetch_json(f"{api}/repos/{repo}/git/ref/heads/{quote(branch)}", headers=headers)
            head = ref.get("object", {}).get("sha") if isinstance(ref, dict) else None
            evidence.append(Evidence("github", "main_head", head, reference=f"https://github.com/{repo}/commit/{head}" if head else None))
            if ref_status != 200 or not head:
                blockers.append("MAIN_HEAD_UNRESOLVED")
            else:
                # P1 #1381: sem check runs da REVISAO exata nao existe PASS.
                check_status, check_data = fetch_json(
                    f"{api}/repos/{repo}/commits/{quote(head)}/check-runs?per_page=100",
                    headers=headers,
                )
                runs = check_data.get("check_runs", []) if isinstance(check_data, dict) else []
                total = check_data.get("total_count") if isinstance(check_data, dict) else None
                if check_status != 200 or not isinstance(runs, list) or not isinstance(total, int) or not runs or total != len(runs):
                    blockers.append("CANDIDATE_CHECKS_MISSING_OR_PARTIAL")
                else:
                    success = sum(1 for run in runs if run.get("conclusion") == "success")
                    pending = sum(1 for run in runs if run.get("status") != "completed")
                    mismatched = sum(1 for run in runs if run.get("head_sha") != head)
                    failed = sum(1 for run in runs if run.get("status") == "completed" and run.get("conclusion") not in ("success", "neutral", "skipped"))
                    evidence.append(Evidence("github", "candidate_check_summary", {
                        "head_sha": head, "total": total, "success": success,
                        "pending": pending, "failed": failed, "mismatched": mismatched,
                    }, reference=f"https://github.com/{repo}/commit/{head}/checks"))
                    if pending:
                        blockers.append("CANDIDATE_CHECKS_PENDING")
                    if failed:
                        blockers.append("CANDIDATE_CHECKS_FAILED")
                    if mismatched:
                        blockers.append("CANDIDATE_CHECKS_SHA_MISMATCH")
                    if success == 0:
                        blockers.append("CANDIDATE_CHECKS_NO_SUCCESS")
            prs_status, prs = self._fetch_all(f"{api}/repos/{repo}/pulls?state=open&base={quote(branch)}&per_page=100", headers)
            if prs_status != 200 or not isinstance(prs, list):
                blockers.append("OPEN_PRS_UNRESOLVED")
                prs = []
            promotion_prs = [{"number": p.get("number"), "draft": p.get("draft"), "head": p.get("head", {}).get("sha"), "mergeable_state": p.get("mergeable_state")} for p in prs]
            evidence.append(Evidence("github", "open_promotion_prs", promotion_prs, reference=f"https://github.com/{repo}/pulls"))
            max_open = int(self.config.get("max_open_promotion_prs", 1))
            if len(prs) > max_open:
                blockers.append(f"OPEN_PROMOTION_PRS_{len(prs)}_GT_{max_open}")
            issues_status, issues = self._fetch_all(f"{api}/repos/{repo}/issues?state=open&per_page=100", headers)
            if issues_status == 200 and isinstance(issues, list):
                issue_count = sum(1 for item in issues if "pull_request" not in item)
                evidence.append(Evidence("github", "open_issues_page_count", issue_count, reference=f"https://github.com/{repo}/issues"))
            else:
                blockers.append("OPEN_ISSUES_UNRESOLVED")
        except Exception as error:
            return ProbeReceipt(self.domain, Status.BLOCKED, "GitHub não pôde ser medido", tuple(evidence), (type(error).__name__,))
        status = Status.PASS if not blockers else Status.FAIL
        return ProbeReceipt(self.domain, status, f"GitHub {repo}@{branch}", tuple(evidence), tuple(blockers))

    @staticmethod
    def _fetch_all(url: str, headers: dict[str, str]) -> tuple[int, list]:
        items: list = []
        separator = "&" if "?" in url else "?"
        for page in range(1, 101):
            status, payload = fetch_json(f"{url}{separator}page={page}", headers=headers)
            if status != 200 or not isinstance(payload, list):
                return status, items
            items.extend(payload)
            if len(payload) < 100:
                return 200, items
        return 206, items
