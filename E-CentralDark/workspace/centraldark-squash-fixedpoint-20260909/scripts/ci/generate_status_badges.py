#!/usr/bin/env python3
"""CentralDark Status Badge Fabric.

Gera um índice determinístico de badges GitHub Actions a partir da realidade observável:
- workflows presentes em .github/workflows;
- janela recente de workflow runs;
- branches ainda existentes;
- PRs abertos/fechados/mergeados.

O script NÃO interpreta badge como prova semântica. Badge é telemetria visual.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from collections import defaultdict
from pathlib import Path
from urllib.parse import quote

REPO = os.environ.get("GITHUB_REPOSITORY", "ServerVpss/CentralDark")
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "STATUS-BADGES.md"
RECENT_RUN_LIMIT = 100


def gh_json(endpoint: str, *, paginate: bool = True):
    args = ["gh", "api"]
    if paginate:
        args.append("--paginate")
    args.append(endpoint)
    p = subprocess.run(
        args,
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if p.returncode != 0:
        print(p.stderr, file=sys.stderr)
        raise SystemExit(p.returncode)
    chunks = [x for x in p.stdout.splitlines() if x.strip()]
    values = [json.loads(x) for x in chunks]
    return values


def flatten_pages(values, key=None):
    out = []
    for value in values:
        if isinstance(value, list):
            out.extend(value)
        elif key and isinstance(value, dict):
            out.extend(value.get(key, []))
        else:
            out.append(value)
    return out


def badge_url(workflow_file: str, branch: str | None = None, event: str | None = None) -> str:
    base = f"https://github.com/{REPO}/actions/workflows/{quote(workflow_file)}/badge.svg"
    q = []
    if branch:
        q.append("branch=" + quote(branch, safe=""))
    if event:
        q.append("event=" + quote(event, safe=""))
    return base + (("?" + "&".join(q)) if q else "")


def workflow_link(workflow_file: str) -> str:
    return f"https://github.com/{REPO}/actions/workflows/{quote(workflow_file)}"


def main() -> int:
    workflows = sorted(
        p.name for p in (ROOT / ".github" / "workflows").glob("*.y*ml") if p.is_file()
    )

    branches = flatten_pages(gh_json(f"repos/{REPO}/branches?per_page=100"))
    branch_names = sorted({b["name"] for b in branches if isinstance(b, dict) and b.get("name")})

    prs = flatten_pages(gh_json(f"repos/{REPO}/pulls?state=all&per_page=100"))
    pr_rows = []
    for pr in prs:
        head = ((pr.get("head") or {}).get("ref"))
        pr_rows.append(
            {
                "number": pr.get("number"),
                "state": "MERGED" if pr.get("merged_at") else str(pr.get("state", "UNKNOWN")).upper(),
                "head": head or "UNKNOWN",
                "base": ((pr.get("base") or {}).get("ref")) or "UNKNOWN",
                "url": pr.get("html_url") or "",
            }
        )

    # Badge é telemetria, não ledger. Paginar dezenas de milhares de runs
    # monopolizava o runner self-hosted sem aumentar a força da prova.
    # A janela recente é explícita e suficiente para mostrar atividade observada;
    # branches sem run nessa janela permanecem NO_OBSERVED_WORKFLOW_RUN.
    runs = flatten_pages(
        gh_json(
            f"repos/{REPO}/actions/runs?per_page={RECENT_RUN_LIMIT}&exclude_pull_requests=false",
            paginate=False,
        ),
        "workflow_runs",
    )

    observed = defaultdict(set)
    for run in runs:
        path = str(run.get("path") or "")
        wf = Path(path.split("@")[0]).name if path else ""
        branch = run.get("head_branch")
        event = run.get("event")
        if wf and branch:
            observed[branch].add((wf, event or ""))

    lines = [
        "# 🏷️ CentralDark — Status Badge Fabric",
        "",
        "> Gerado deterministicamente por `scripts/ci/generate_status_badges.py`.",
        "> **BADGE = TELEMETRIA VISUAL; BADGE != PROVA SEMÂNTICA; UNKNOWN != PASS.**",
        "",
        "## Workflows — badge canônico da branch padrão",
        "",
        "| Workflow | Badge | SVG |",
        "|---|---|---|",
    ]

    for wf in workflows:
        svg = badge_url(wf)
        lines.append(f"| `{wf}` | [![{wf}]({svg})]({workflow_link(wf)}) | [badge.svg]({svg}) |")

    lines += [
        "",
        "## Branches observadas no repositório",
        "",
        f"Total atual: **{len(branch_names)}**.",
        "",
        f"A telemetria abaixo considera as **{RECENT_RUN_LIMIT} execuções mais recentes**. Isso evita varrer dezenas de milhares de runs históricos só para fabricar um painel visual. Branch sem execução nessa janela permanece explicitamente não observada.",
        "",
    ]

    for branch in branch_names:
        combos = sorted(observed.get(branch, set()))
        lines.append(f"### `{branch}`")
        if not combos:
            lines.append("")
            lines.append("`NO_OBSERVED_WORKFLOW_RUN` — branch existe, mas nenhuma execução foi encontrada na janela recente consultada.")
            lines.append("")
            continue
        lines.append("")
        lines.append("| Workflow | Evento | Badge | SVG |")
        lines.append("|---|---|---|---|")
        for wf, event in combos:
            svg = badge_url(wf, branch, event or None)
            lines.append(
                f"| `{wf}` | `{event or 'UNKNOWN'}` | [![{wf}:{branch}]({svg})]({workflow_link(wf)}) | [badge.svg]({svg}) |"
            )
        lines.append("")

    lines += [
        "## PRs — passado + presente",
        "",
        "PR não possui um `badge.svg` nativo próprio. A Badge Fabric preserva o PR e sua head branch; quando houve workflow run recente nessa branch, os badges estão na seção da branch acima.",
        "",
        "| PR | Estado | Head | Base |",
        "|---:|---|---|---|",
    ]
    for pr in sorted(pr_rows, key=lambda x: int(x["number"] or 0), reverse=True):
        num = pr["number"]
        label = f"[#{num}]({pr['url']})" if pr["url"] else f"#{num}"
        lines.append(f"| {label} | `{pr['state']}` | `{pr['head']}` | `{pr['base']}` |")

    lines += [
        "",
        "## Contrato",
        "",
        "```text",
        "BADGE_SOURCE=GITHUB_ACTIONS_NATIVE_SVG",
        "BADGE_IS_TELEMETRY_NOT_PROOF=true",
        "WORKFLOW_BADGE_COVERAGE=ALL_WORKFLOW_FILES",
        f"WORKFLOW_RUN_WINDOW=LATEST_{RECENT_RUN_LIMIT}",
        "BRANCH_BADGE_COVERAGE=ONLY_OBSERVED_RUNS_IN_WINDOW",
        "PR_HISTORY=ALL_PRS_RETURNED_BY_GITHUB_API",
        "DELETED_BRANCH_WITHOUT_RUN_HISTORY=HISTORICAL_UNKNOWN",
        "SAME_HEAD_PROOF_REQUIRED_FOR_CI_CLAIM=true",
        "UNKNOWN_IS_NOT_PASS=true",
        "```",
        "",
    ]

    OUT.parent.mkdir(parents=True, exist_ok=True)
    content = "\n".join(lines)
    OUT.write_text(content, encoding="utf-8")
    print(f"BADGE_FABRIC_OUTPUT={OUT.relative_to(ROOT)}")
    print(f"WORKFLOWS={len(workflows)}")
    print(f"BRANCHES={len(branch_names)}")
    print(f"PRS={len(pr_rows)}")
    print(f"RUN_WINDOW={len(runs)}/{RECENT_RUN_LIMIT}")
    print(f"OBSERVED_BRANCH_WORKFLOW_COMBOS={sum(len(v) for v in observed.values())}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
