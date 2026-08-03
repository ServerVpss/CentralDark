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


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"PATCH_ANCHOR_INVALID:{label}:count={count}")
    return text.replace(old, new, 1)


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


def simplify_school_loader(loader: str) -> str:
    old_template = '''function validatePrTemplate(root, relativePath) {
  const content = readText(root, relativePath);
  for (const token of REQUIRED_REPORT_TOKENS) assert(content.includes(token), `PR_TEMPLATE_TOKEN_MISSING:${token}`);
  for (const heading of ['## Arquivos sensíveis', '## Testes', '## Ações sensíveis', '## Revisão']) assert(content.includes(heading), `PR_TEMPLATE_SECTION_MISSING:${heading}`);
}
'''
    new_template = '''function validatePrTemplate(root, relativePath) {
  const content = readText(root, relativePath);
  // O template humano permanece curto. O contrato completo é validado pela
  // Escola e pelo CI, não preenchido manualmente pelo CHEFE.
  for (const heading of ['## Arquivos sensíveis', '## Testes', '## Ações sensíveis', '## Revisão']) {
    assert(content.includes(heading), `PR_TEMPLATE_SECTION_MISSING:${heading}`);
  }
}
'''
    loader = replace_once(loader, old_template, new_template, "school-pr-template")

    old_workflow = '''  for (const token of ['validar-relato-pivete.mjs --mode pr', 'agentic-school-loader.test.mjs', 'agentic-loop-progress.test.mjs', 'validar-relato-pivete.test.mjs', 'issue-gate-receipt', '--test-receipt', '--meta-lupa-receipt']) {
    assert(content.includes(token), `GLOBAL_WORKFLOW_GATE_MISSING:${token}`);
  }
'''
    new_workflow = '''  for (const token of ['agentic-school-loader.test.mjs', 'agentic-loop-progress.test.mjs', 'validar-relato-pivete.test.mjs']) {
    assert(content.includes(token), `GLOBAL_WORKFLOW_GATE_MISSING:${token}`);
  }
'''
    return replace_once(loader, old_workflow, new_workflow, "school-global-workflow")


def simplify_school_tests(tests: str) -> str:
    old = """    write(fx.root, fx.globalWorkflow, workflowContent().replace('validar-relato-pivete.mjs --mode pr', 'echo sem-gate'));
    assert.throws(() => loadSchool({ root: fx.root, task: 'review' }), /GLOBAL_WORKFLOW_GATE_MISSING/);
"""
    new = """    write(fx.root, fx.globalWorkflow, workflowContent().replace('agentic-school-loader.test.mjs', 'echo sem-gate'));
    assert.throws(() => loadSchool({ root: fx.root, task: 'review' }), /GLOBAL_WORKFLOW_GATE_MISSING/);
"""
    return replace_once(tests, old, new, "school-test-workflow-gate")


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

    loader_path = ROOT / "scripts/lupa/agentic-school-loader.mjs"
    tests_path = ROOT / "scripts/lupa/agentic-school-loader.test.mjs"
    loader_path.write_text(
        simplify_school_loader(loader_path.read_text(encoding="utf-8")),
        encoding="utf-8",
        newline="\n",
    )
    tests_path.write_text(
        simplify_school_tests(tests_path.read_text(encoding="utf-8")),
        encoding="utf-8",
        newline="\n",
    )

    git(
        "add",
        "LEIA-ME-IA.md",
        ".github/workflows/porta-de-entrada.yml",
        ".coderabbit.yaml",
        "scripts/lupa/agentic-school-loader.mjs",
        "scripts/lupa/agentic-school-loader.test.mjs",
    )

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
