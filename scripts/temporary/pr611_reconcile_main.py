#!/usr/bin/env python3
from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def git(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", "-C", str(ROOT), *args],
        check=check,
        text=True,
        capture_output=True,
    )


def show(ref: str, path: str) -> str:
    return git("show", f"{ref}:{path}").stdout


def extract_calibration(text: str) -> str:
    start = text.find("### 1.2 Recalibração canônica")
    if start < 0:
        raise SystemExit("CALIBRATION_SECTION_MISSING")
    end = text.find("\n---\n\n## 2.", start)
    if end < 0:
        raise SystemExit("CALIBRATION_SECTION_END_MISSING")
    return text[start:end].rstrip() + "\n"


def merge_leia(main_text: str, branch_text: str) -> str:
    result = main_text
    agentic_lines = (
        "6. `.agents/skills/agentic-ci-loop/SKILL.md` para trabalho técnico, debugging, "
        "feature, review, refatoração crítica ou evolução de skill;\n"
        "7. `scripts/lupa/agentic-school-loader.mjs` para classificar a tarefa e carregar "
        "somente o módulo necessário;\n"
    )
    if ".agents/skills/agentic-ci-loop/SKILL.md" not in result:
        anchor = "6. o estado atual comprovado da branch, PR, HEAD e ferramentas aplicáveis.\n"
        if anchor not in result:
            raise SystemExit("LEIA_BOOT_ANCHOR_MISSING")
        result = result.replace(anchor, agentic_lines + "8. o estado atual comprovado da branch, PR, HEAD e ferramentas aplicáveis.\n", 1)
    if "agentic_school: LOADED" not in result:
        result = result.replace("  delta_method: LOADED\n", "  delta_method: LOADED\n  agentic_school: LOADED\n", 1)
    if "### 1.2 Recalibração canônica" not in result:
        section = extract_calibration(branch_text)
        anchor = "\n---\n\n## 2. As cinco coisas que não mudam"
        if anchor not in result:
            raise SystemExit("LEIA_SECTION_2_ANCHOR_MISSING")
        result = result.replace(anchor, "\n\n" + section + anchor, 1)
    return result


def main() -> None:
    branch_before = git("rev-parse", "HEAD").stdout.strip()
    main_head = git("rev-parse", "origin/main").stdout.strip()
    branch_leia = show(branch_before, "LEIA-ME-IA.md")
    branch_porta = show(branch_before + "^", ".github/workflows/porta-de-entrada.yml")
    branch_template = show(branch_before, ".github/pull_request_template.md")

    merge = git("merge", "--no-commit", "--no-ff", "origin/main", check=False)
    if merge.returncode not in (0, 1):
        raise SystemExit(f"MERGE_START_FAILED:{merge.stderr[-500:]}")

    conflicts = git("diff", "--name-only", "--diff-filter=U", check=False).stdout.splitlines()
    for path in conflicts:
        checkout = git("checkout", "--theirs", "--", path, check=False)
        if checkout.returncode != 0:
            raise SystemExit(f"CONFLICT_RESOLUTION_FAILED:{path}:{checkout.stderr[-300:]}")
        git("add", "--", path)

    main_leia = (ROOT / "LEIA-ME-IA.md").read_text(encoding="utf-8")
    (ROOT / "LEIA-ME-IA.md").write_text(
        merge_leia(main_leia, branch_leia), encoding="utf-8", newline="\n"
    )
    (ROOT / ".github/workflows/porta-de-entrada.yml").write_text(
        branch_porta, encoding="utf-8", newline="\n"
    )
    (ROOT / ".github/pull_request_template.md").write_text(
        branch_template, encoding="utf-8", newline="\n"
    )
    git("add", "LEIA-ME-IA.md", ".github/workflows/porta-de-entrada.yml", ".github/pull_request_template.md")

    unresolved = git("diff", "--name-only", "--diff-filter=U", check=False).stdout.strip()
    if unresolved:
        raise SystemExit(f"UNRESOLVED_CONFLICTS:{unresolved.replace(chr(10), ',')}")

    print(f"BRANCH_BEFORE={branch_before}")
    print(f"MAIN_INCORPORATED={main_head}")
    print(f"CONFLICTS_RESOLVED={len(conflicts)}")
    for path in conflicts:
        print(f"CONFLICT_MAIN_WON={path}")


if __name__ == "__main__":
    main()
