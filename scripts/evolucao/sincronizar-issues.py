#!/usr/bin/env python3
"""Abre, deduplica e fecha Issues automáticas conforme o relatório atual."""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TITLE_RE = re.compile(r"^\[AUTO ([A-Za-z0-9_.:-]+)\]")


def gh(repo: str, *args: str) -> str:
    proc = subprocess.run(["gh", *args, "-R", repo], cwd=ROOT, check=False, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"GH_FAILED:{' '.join(args)}:{proc.stderr.strip()}")
    return proc.stdout.strip()


def body_for(item: dict, evidence_sha: str, run_url: str) -> str:
    return (
        "> Issue mantida automaticamente pelo auditor determinístico do CentralDark.\n\n"
        f"## Finding ID\n`{item['id']}`\n\n"
        f"## Severidade\n`{item.get('severity', 'unknown')}`\n\n"
        f"## Área\n`{item.get('area', 'autonomia')}`\n\n"
        f"## Achado\n{item.get('title', '')}\n\n"
        f"## Evidência sanitizada\n```text\n{item.get('evidence', '')}\n```\n\n"
        f"## Recibo\n- Evidência SHA-256: `{evidence_sha}`\n"
        f"- Run: {run_url}\n\n"
        "## Critério para fechamento\n"
        "O mesmo auditor precisa deixar de reproduzir este finding ID. A automação fecha a Issue com o novo SHA.\n"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", required=True)
    parser.add_argument("--repo", required=True)
    parser.add_argument("--run-url", required=True)
    parser.add_argument("--output", default=".artifacts/evolucao/issues.json")
    args = parser.parse_args()

    report = json.loads((ROOT / args.report).read_text(encoding="utf-8"))
    current = {item["id"]: item for item in report.get("findings", [])}
    evidence_sha = report.get("evidence_sha256", "")
    rows = json.loads(gh(args.repo, "issue", "list", "--state", "open", "--json", "number,title", "--limit", "200") or "[]")
    existing: dict[str, dict] = {}
    for row in rows:
        match = TITLE_RE.match(row.get("title", ""))
        if match:
            existing[match.group(1)] = row

    opened, closed, kept = [], [], []
    for finding_id, item in sorted(current.items()):
        if finding_id in existing:
            kept.append(existing[finding_id]["number"])
            continue
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".md", delete=False) as handle:
            handle.write(body_for(item, evidence_sha, args.run_url))
            body_path = handle.name
        title = f"[AUTO {finding_id}] {item.get('title', 'lacuna detectada')}"
        url = gh(args.repo, "issue", "create", "--title", title[:240], "--body-file", body_path)
        opened.append(url)
        Path(body_path).unlink(missing_ok=True)

    for finding_id, row in sorted(existing.items()):
        if finding_id in current:
            continue
        number = str(row["number"])
        comment = (
            f"Fechado automaticamente: o finding `{finding_id}` não foi reproduzido na evidência "
            f"`{evidence_sha}`. Run: {args.run_url}"
        )
        gh(args.repo, "issue", "comment", number, "--body", comment)
        gh(args.repo, "issue", "close", number, "--reason", "completed")
        closed.append(row["number"])

    payload = {"schema": 1, "opened": opened, "kept": kept, "closed": closed, "evidence_sha256": evidence_sha}
    output = ROOT / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
