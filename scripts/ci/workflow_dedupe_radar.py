#!/usr/bin/env python3
"""CentralDark Workflow Dedupe + Visual Canon Radar.

Deterministic scanner for GitHub Actions duplication and visual naming.
It does not mutate workflows.
It classifies:
- exact duplicate jobs/steps -> REUSE_CANDIDATE
- shared runner labels with different logic -> INTENTIONAL_PARALLEL
- reusable workflow availability -> WORKFLOW_CALL_PRESENT/ABSENT
- missing emoji in workflow/job/step names -> VISUAL_CANON_VIOLATION

Stdlib only. UNKNOWN != PASS.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import os
import subprocess
from collections import Counter, defaultdict
from pathlib import Path
from typing import Iterable

JOB_RE = re.compile(r"^  ([A-Za-z0-9_.-]+):\s*$")
STEP_RE = re.compile(r"^      - (?:name:\s*(.*)|uses:\s*(.*)|run:\s*[|>-]?\s*)$")
RUNNER_RE = re.compile(r"^\s*runs-on:\s*(.+?)\s*$")
TOP_RE = re.compile(r"^[A-Za-z0-9_.-]+:\s*")
COMMENT_RE = re.compile(r"^\s*#")
WORKFLOW_NAME_RE = re.compile(r"^name:\s*(.+?)\s*$", re.MULTILINE)
JOB_NAME_RE = re.compile(r"^    name:\s*(.+?)\s*$", re.MULTILINE)
STEP_NAME_RE = re.compile(r"^      - name:\s*(.+?)\s*$", re.MULTILINE)

NORMALIZE_DROP_PREFIXES = (
    "name:",
    "timeout-minutes:",
)

EMOJI_RE = re.compile(
    "["
    "\U0001F300-\U0001FAFF"
    "\U00002700-\U000027BF"
    "\U00002600-\U000026FF"
    "]"
)


def sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def has_emoji(text: str) -> bool:
    return bool(EMOJI_RE.search(text or ""))


def normalize_lines(lines: Iterable[str]) -> str:
    out = []
    for line in lines:
        stripped = line.strip()
        if not stripped or COMMENT_RE.match(line):
            continue
        if any(stripped.startswith(prefix) for prefix in NORMALIZE_DROP_PREFIXES):
            continue
        out.append(re.sub(r"\s+", " ", stripped))
    return "\n".join(out)


def extract_jobs(text: str, path: str):
    lines = text.splitlines()
    in_jobs = False
    current = None
    jobs = []
    for idx, line in enumerate(lines):
        if line == "jobs:":
            in_jobs = True
            current = None
            continue
        if in_jobs and TOP_RE.match(line) and not line.startswith(" "):
            in_jobs = False
            current = None
        if not in_jobs:
            continue
        m = JOB_RE.match(line)
        if m:
            if current:
                jobs.append(current)
            current = {"path": path, "job": m.group(1), "start": idx + 1, "lines": []}
            continue
        if current is not None:
            current["lines"].append(line)
    if current:
        jobs.append(current)
    for job in jobs:
        job["runner"] = next((m.group(1) for l in job["lines"] if (m := RUNNER_RE.match(l))), "UNKNOWN")
        job["normalized"] = normalize_lines(job["lines"])
        job["fingerprint"] = sha(job["normalized"])
        job["uses"] = [l.strip()[6:].strip() for l in job["lines"] if l.strip().startswith("uses:")]
        job["step_names"] = [m.group(1).strip() for l in job["lines"] if (m := STEP_RE.match(l)) and m.group(1)]
    return jobs


def extract_step_blocks(text: str, path: str):
    lines = text.splitlines()
    steps = []
    i = 0
    while i < len(lines):
        if re.match(r"^\s{6}- (name:|uses:|run:)", lines[i]):
            indent = len(lines[i]) - len(lines[i].lstrip())
            block = [lines[i]]
            j = i + 1
            while j < len(lines):
                nxt = lines[j]
                nindent = len(nxt) - len(nxt.lstrip())
                if nxt.strip() and nindent <= indent and re.match(r"^\s{6}- ", nxt):
                    break
                if nxt.strip() and nindent < indent:
                    break
                block.append(nxt)
                j += 1
            norm = normalize_lines(block)
            if norm:
                steps.append({
                    "path": path,
                    "line": i + 1,
                    "label": lines[i].strip()[:160],
                    "fingerprint": sha(norm),
                    "normalized": norm,
                })
            i = j
        else:
            i += 1
    return steps


def scan_visual_names(text: str, path: str):
    violations = []

    wf = WORKFLOW_NAME_RE.search(text)
    if wf:
        value = wf.group(1).strip().strip('"\'')
        if not has_emoji(value):
            violations.append({"path": path, "kind": "workflow", "name": value})
    else:
        violations.append({"path": path, "kind": "workflow", "name": "<missing>"})

    for match in JOB_NAME_RE.finditer(text):
        value = match.group(1).strip().strip('"\'')
        if value and not has_emoji(value):
            violations.append({"path": path, "kind": "job", "name": value})

    for match in STEP_NAME_RE.finditer(text):
        value = match.group(1).strip().strip('"\'')
        if value and not has_emoji(value):
            violations.append({"path": path, "kind": "step", "name": value})

    return violations


def scan(root: Path):
    workflow_dir = root / ".github" / "workflows"
    paths = sorted(list(workflow_dir.glob("*.yml")) + list(workflow_dir.glob("*.yaml")))
    all_jobs = []
    all_steps = []
    workflow_call_files = []
    visual_violations = []
    for path in paths:
        text = path.read_text(encoding="utf-8", errors="replace")
        rel = path.relative_to(root).as_posix()
        if "workflow_call:" in text:
            workflow_call_files.append(rel)
        all_jobs.extend(extract_jobs(text, rel))
        all_steps.extend(extract_step_blocks(text, rel))
        visual_violations.extend(scan_visual_names(text, rel))

    jobs_by_fp = defaultdict(list)
    for job in all_jobs:
        jobs_by_fp[job["fingerprint"]].append(job)

    steps_by_fp = defaultdict(list)
    for step in all_steps:
        steps_by_fp[step["fingerprint"]].append(step)

    exact_jobs = []
    for fp, items in jobs_by_fp.items():
        files = {x["path"] for x in items}
        if len(items) > 1 and len(files) > 1:
            exact_jobs.append({
                "fingerprint": fp,
                "classification": "REUSE_CANDIDATE",
                "occurrences": [{"path": x["path"], "job": x["job"], "line": x["start"]} for x in items],
            })

    repeated_steps = []
    for fp, items in steps_by_fp.items():
        files = {x["path"] for x in items}
        if len(items) > 1 and len(files) > 1 and len(items[0]["normalized"]) >= 80:
            repeated_steps.append({
                "fingerprint": fp,
                "classification": "REUSE_CANDIDATE",
                "sample": items[0]["label"],
                "occurrences": [{"path": x["path"], "line": x["line"]} for x in items],
            })

    runner_usage = Counter(job["runner"] for job in all_jobs)
    runners = []
    for runner, count in runner_usage.most_common():
        runners.append({
            "runner": runner,
            "job_count": count,
            "classification": "INTENTIONAL_PARALLEL" if count > 1 else "UNIQUE",
            "note": "same runner pool is not code duplication",
        })

    return {
        "schema": "centraldark.workflow-dedupe-radar.v2",
        "root": str(root),
        "workflow_count": len(paths),
        "job_count": len(all_jobs),
        "workflow_call_count": len(workflow_call_files),
        "workflow_call_files": workflow_call_files,
        "exact_duplicate_jobs": sorted(exact_jobs, key=lambda x: (-len(x["occurrences"]), x["fingerprint"])),
        "repeated_step_blocks": sorted(repeated_steps, key=lambda x: (-len(x["occurrences"]), x["fingerprint"])),
        "runner_usage": runners,
        "visual_canon": {
            "required": True,
            "rule": "workflow/job/step display names must carry a functional emoji",
            "violations": visual_violations,
            "violation_count": len(visual_violations),
        },
        "verdict": {
            "duplication_detected": bool(exact_jobs or repeated_steps),
            "reuse_candidates": len(exact_jobs) + len(repeated_steps),
            "visual_canon_ok": len(visual_violations) == 0,
            "policy": "REUSE_BEFORE_CREATE; PARALLEL_RUNNERS_ALLOWED_WHEN_LOGIC_DIFFERS; EMOJI_VISUAL_CANON_REQUIRED",
        },
    }


def render_markdown(report: dict) -> str:
    lines = [
        "## 🧬 CentralDark Workflow Dedupe Radar",
        "",
        f"- Workflows: **{report['workflow_count']}**",
        f"- Jobs: **{report['job_count']}**",
        f"- `workflow_call`: **{report['workflow_call_count']}**",
        f"- Candidatos de reuso: **{report['verdict']['reuse_candidates']}**",
        f"- Violações do cânone visual: **{report['visual_canon']['violation_count']}**",
        "",
        "### 🎨 Cânone visual",
    ]
    if report["visual_canon"]["violations"]:
        for item in report["visual_canon"]["violations"][:200]:
            lines.append(f"- **VISUAL_CANON_VIOLATION** → `{item['path']}` · {item['kind']} · `{item['name']}`")
    else:
        lines.append("- 🟢 workflow/job/step names padronizados com emoji funcional")

    lines += ["", "### 🧵 Runners"]
    for item in report["runner_usage"][:10]:
        lines.append(f"- `{item['runner']}` → {item['job_count']} jobs → **{item['classification']}**")
    lines += ["", "### 🧩 Jobs duplicados exatos"]
    if report["exact_duplicate_jobs"]:
        for group in report["exact_duplicate_jobs"][:20]:
            refs = ", ".join(f"`{x['path']}::{x['job']}`" for x in group["occurrences"])
            lines.append(f"- **REUSE_CANDIDATE** → {refs}")
    else:
        lines.append("- nenhum")
    lines += ["", "### 🧱 Blocos de step repetidos"]
    if report["repeated_step_blocks"]:
        for group in report["repeated_step_blocks"][:20]:
            refs = ", ".join(f"`{x['path']}:{x['line']}`" for x in group["occurrences"])
            lines.append(f"- **REUSE_CANDIDATE** `{group['sample']}` → {refs}")
    else:
        lines.append("- nenhum")
    lines += [
        "",
        "> Mesmo `runs-on` não é duplicação: é pool compartilhado. Duplicação é lógica repetida sem owner reutilizável.",
        "> Emoji é contexto visual funcional, não prova. `UNKNOWN != PASS`.",
        "",
    ]
    return "\n".join(lines)


def changed_workflow_paths(root: Path) -> set[str]:
    """Return workflow files changed against the PR base when git context exists.

    Visual canon debt is repository-wide, but PR gates must not turn historical
    debt into a false-red for unrelated deltas. In pull_request context, block
    the changed workflow files only; full-repo scans still report every finding.
    """
    base_ref = os.environ.get("GITHUB_BASE_REF") or "main"
    candidates = [f"origin/{base_ref}", base_ref, "origin/main"]
    base = None
    for candidate in candidates:
        probe = subprocess.run(
            ["git", "-C", str(root), "merge-base", candidate, "HEAD"],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        if probe.returncode == 0 and probe.stdout.strip():
            base = probe.stdout.strip()
            break
    if not base:
        return set()
    diff = subprocess.run(
        ["git", "-C", str(root), "diff", "--name-only", f"{base}...HEAD", "--", ".github/workflows"],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )
    if diff.returncode != 0:
        return set()
    return {line.strip() for line in diff.stdout.splitlines() if line.strip().endswith((".yml", ".yaml"))}


def self_test() -> int:
    sample = """name: 🧪 x
on: push
jobs:
  a:
    name: 🧪 validar
    runs-on: [self-hosted, Linux]
    steps:
      - name: 🔎 Guard
        run: |
          echo one
          echo two
"""
    jobs = extract_jobs(sample, "a.yml")
    steps = extract_step_blocks(sample, "a.yml")
    visual = scan_visual_names(sample, "a.yml")
    checks = [
        len(jobs) == 1,
        jobs[0]["job"] == "a",
        jobs[0]["runner"] == "[self-hosted, Linux]",
        len(steps) == 1,
        len(visual) == 0,
    ]
    print("WORKFLOW_DEDUPE_SELF_TEST=" + ("PASS" if all(checks) else "FAIL"))
    return 0 if all(checks) else 3


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".")
    ap.add_argument("--json-out")
    ap.add_argument("--markdown-out")
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--fail-on-exact", action="store_true")
    ap.add_argument("--fail-on-visual-canon", action="store_true")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    report = scan(Path(args.root).resolve())
    raw = json.dumps(report, ensure_ascii=False, indent=2)
    print(raw)
    if args.json_out:
        Path(args.json_out).write_text(raw + "\n", encoding="utf-8")
    if args.markdown_out:
        Path(args.markdown_out).write_text(render_markdown(report), encoding="utf-8")

    if args.fail_on_exact and report["exact_duplicate_jobs"]:
        return 4
    if args.fail_on_visual_canon and report["visual_canon"]["violations"]:
        changed = changed_workflow_paths(Path(args.root).resolve())
        if changed:
            new_scope_violations = [
                item for item in report["visual_canon"]["violations"]
                if item["path"] in changed
            ]
            report["visual_canon"]["fail_scope"] = "CHANGED_WORKFLOWS_ONLY"
            report["visual_canon"]["changed_workflows"] = sorted(changed)
            report["visual_canon"]["blocking_violations"] = new_scope_violations
            if new_scope_violations:
                return 5
        else:
            report["visual_canon"]["fail_scope"] = "FULL_REPO_NO_BASELINE"
            report["visual_canon"]["blocking_violations"] = report["visual_canon"]["violations"]
            return 5
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
