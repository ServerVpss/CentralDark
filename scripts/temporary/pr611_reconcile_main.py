#!/usr/bin/env python3
from __future__ import annotations

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


def final_porta_workflow(main_workflow: str) -> str:
    setup_anchor = """      - uses: actions/setup-node@v4
        with:
          node-version: 22
"""
    if setup_anchor not in main_workflow:
        raise SystemExit("PORTA_SETUP_NODE_ANCHOR_MISSING")
    result = main_workflow.replace(
        setup_anchor,
        setup_anchor + """

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
""",
        1,
    )

    test_anchor = """      - name: Testar política de promoção autônoma
        run: node --test scripts/github-autonomia-promocao.test.mjs
"""
    if test_anchor not in result:
        raise SystemExit("PORTA_AUTONOMIA_TEST_ANCHOR_MISSING")
    return result.replace(
        test_anchor,
        test_anchor + """

      - name: Testar Escola agentic internamente
        run: |
          set -euo pipefail
          node --test scripts/lupa/agentic-school-loader.test.mjs
          node --test scripts/lupa/agentic-loop-progress.test.mjs
          node --test scripts/lupa/validar-relato-pivete.test.mjs
          python scripts/lupa/test_validar_agentic_visual_package.py

      - name: Validar manifesto e pacote visual da Escola
        run: |
          set -euo pipefail
          node scripts/lupa/agentic-school-loader.mjs --task feature --json
          python scripts/lupa/validar_agentic_visual_package.py --json
""",
        1,
    )


def final_coderabbit(main_config: str) -> str:
    contract = ".agents/skills/agentic-ci-loop/references/CONTRATO-UNIFICADO-RELATO-PIVETE.md"
    result = main_config
    if contract not in result:
        path_anchor = "  path_instructions:\n"
        if path_anchor not in result:
            raise SystemExit("CODERABBIT_PATH_INSTRUCTIONS_ANCHOR_MISSING")
        result = result.replace(
            path_anchor,
            path_anchor
            + f'''    - path: "{contract}"
      instructions: >-
        Use como contrato técnico interno da Escola. Verifique provas, HEAD e
        separação Writer/Judge sem exigir que o CHEFE preencha relato extenso.
''',
            1,
        )

        pattern_anchor = "    filePatterns:\n"
        if pattern_anchor not in result:
            raise SystemExit("CODERABBIT_FILE_PATTERNS_ANCHOR_MISSING")
        result = result.replace(
            pattern_anchor,
            pattern_anchor + f'      - "{contract}"\n',
            1,
        )
    return result


def remove_versioned(path: str) -> None:
    target = ROOT / path
    if target.exists():
        target.unlink()
        git("add", "-u", "--", path)


def main() -> None:
    branch_before = git("rev-parse", "HEAD").stdout.strip()
    main_head = git("rev-parse", "origin/main").stdout.strip()
    branch_leia = show(branch_before, "LEIA-ME-IA.md")
    main_porta = show("origin/main", ".github/workflows/porta-de-entrada.yml")
    main_coderabbit = show("origin/main", ".coderabbit.yaml")

    merge = git("merge", "--no-commit", "--no-ff", "-X", "theirs", "origin/main", check=False)
    if merge.returncode not in (0, 1):
        raise SystemExit(f"MERGE_START_FAILED:{merge.stderr[-1000:]}")

    conflicts = git("diff", "--name-only", "--diff-filter=U", check=False).stdout.splitlines()
    for path in conflicts:
        checkout = git("checkout", "--theirs", "--", path, check=False)
        if checkout.returncode != 0:
            raise SystemExit(f"CONFLICT_RESOLUTION_FAILED:{path}:{checkout.stderr[-500:]}")
        git("add", "--", path)

    (ROOT / "LEIA-ME-IA.md").write_text(branch_leia, encoding="utf-8", newline="\n")
    (ROOT / ".github/workflows/porta-de-entrada.yml").write_text(
        final_porta_workflow(main_porta), encoding="utf-8", newline="\n"
    )
    (ROOT / ".coderabbit.yaml").write_text(
        final_coderabbit(main_coderabbit), encoding="utf-8", newline="\n"
    )
    git("add", "LEIA-ME-IA.md", ".github/workflows/porta-de-entrada.yml", ".coderabbit.yaml")

    remove_versioned("scripts/temporary/pr611-trigger.txt")
    remove_versioned("scripts/lupa/validar-porta-de-entrada.test.mjs")
    remove_versioned("docs/ARQUITETURA/CENTRALDARK-AGENTIC-LOOP-4K-STATUS.json")

    unresolved = git("diff", "--name-only", "--diff-filter=U", check=False).stdout.strip()
    if unresolved:
        raise SystemExit(f"UNRESOLVED_CONFLICTS:{unresolved.replace(chr(10), ',')}")

    print(f"BRANCH_BEFORE={branch_before}")
    print(f"MAIN_INCORPORATED={main_head}")
    print(f"CONFLICTS_RESOLVED={len(conflicts)}")
    print("HUMAN_PR_BODY_GATE=REMOVED")
    print("STATIC_PROGRESS_FILE=REMOVED")
    print("CODERABBIT_SCHOOL_POINTER=KEPT_MINIMAL")
    print("AGENTIC_SCHOOL=KEPT")
    print("ACORDA_CALIBRAR=KEPT")


if __name__ == "__main__":
    main()
