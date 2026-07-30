#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import textwrap
from pathlib import Path

HERE = Path(__file__).resolve().parent


def load(name: str, filename: str):
    spec = importlib.util.spec_from_file_location(name, HERE / filename)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


audit = load("audit_autonomia", "auditar-autonomia.py")
autofix = load("autofix_autonomia", "aplicar-autofix.py")
review = load("review_autonomia", "revisar-com-ia.py")
score = load("score_autonomia", "gerar-placar.py")
legacy_xp = load("legacy_xp_correction", "corrigir-xp-legado.py")
register_xp = load("register_xp_ci", "registrar-xp-ci.py")


def test_workflow_exige_componentes_e_bloqueia_push_direto():
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        workflows = root / ".github/workflows"
        workflows.mkdir(parents=True)
        (workflows / "bad.yml").write_text("name: bad\non:\n  push:\njobs:\n  x:\n    runs-on: ubuntu-latest\n    steps:\n      - run: git push\n", encoding="utf-8")
        old_root, old_workflows = audit.ROOT, audit.WORKFLOWS
        try:
            audit.ROOT, audit.WORKFLOWS = root, workflows
            findings = []
            audit.workflow_findings(findings)
        finally:
            audit.ROOT, audit.WORKFLOWS = old_root, old_workflows
        assert any("WF-DIRECT" in item.id for item in findings)
        assert not any("SCHEMA" in item.id for item in findings)


def test_auto_fix_workflow_troca_push_por_branch_e_pr():
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        workflows = root / ".github/workflows"
        workflows.mkdir(parents=True)
        workflow = workflows / "writer.yml"
        workflow.write_text(
            "name: writer\non:\n  workflow_dispatch:\npermissions:\n  contents: write\njobs:\n  x:\n    runs-on: ubuntu-latest\n    steps:\n      - run: git push || true\n",
            encoding="utf-8",
        )
        old_autofix_root = autofix.ROOT
        old_audit_root, old_audit_workflows = audit.ROOT, audit.WORKFLOWS
        try:
            autofix.ROOT = root
            fixes = []
            autofix.convert_workflow_push_to_pr(workflow, fixes)
            audit.ROOT, audit.WORKFLOWS = root, workflows
            findings = []
            audit.workflow_findings(findings)
        finally:
            autofix.ROOT = old_autofix_root
            audit.ROOT, audit.WORKFLOWS = old_audit_root, old_audit_workflows
        text = workflow.read_text(encoding="utf-8")
        assert "git push" not in text
        assert "publicar-pr-automatico.sh" in text
        assert "pull-requests: write" in text
        assert fixes and fixes[0]["id"].startswith("CD-AUTO-WF-DIRECT-")
        assert not any("WF-DIRECT" in item.id for item in findings)


def test_publicador_bash_tem_sintaxe_valida():
    result = subprocess.run(
        ["bash", "-n", str(HERE / "publicar-pr-automatico.sh")],
        check=False,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr


def test_evolucao_bloqueia_segredo_e_aprendizado_simulado():
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        engine = root / "evolucao-ias.cjs"
        fake_token = "123456789" + ":" + ("A" * 35)
        engine.write_text(
            "const t=process.env.BOT_TOKEN_X || '" + fake_token + "';\n"
            "function gerarAprendizado(){}; Math.random(); registrarAprendizadoPermanente();\n"
            "function fallbackMensagem(){}\n",
            encoding="utf-8",
        )
        old_root, old_engine = audit.ROOT, audit.EVOLUTION_ENGINE
        try:
            audit.ROOT, audit.EVOLUTION_ENGINE = root, engine
            findings = []
            audit.evolution_findings(findings)
        finally:
            audit.ROOT, audit.EVOLUTION_ENGINE = old_root, old_engine
        ids = {item.id for item in findings}
        assert "CD-AUTO-EVOL-SECRET" in ids
        assert "CD-AUTO-EVOL-SIMULATED" in ids
        assert "CD-AUTO-EVOL-FAKE-FALLBACK" in ids


def test_auto_fix_remove_token_sem_expor_valor():
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        path = root / "evolucao-ias.cjs"
        fake_token = "123456789" + ":" + ("B" * 35)
        path.write_text("const token = process.env.BOT_TOKEN_X || '" + fake_token + "';\n", encoding="utf-8")
        old_root = autofix.ROOT
        try:
            autofix.ROOT = root
            fixes = []
            autofix.remove_telegram_literal(path, fixes, "CD-AUTO-EVOL-SECRET")
        finally:
            autofix.ROOT = old_root
        text = path.read_text(encoding="utf-8")
        assert fake_token not in text
        assert "process.env.BOT_TOKEN_X || ''" in text
        assert fixes[0]["id"] == "CD-AUTO-EVOL-SECRET"


def test_auto_fix_meta_lupa_exige_as_duas_condicoes():
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        path = root / "meta_lupa.py"
        old = '        "ponto_fixo_atingido": args.point_fixed == "sim",'
        new = (
            '        "ponto_fixo_atingido": (\n'
            '            args.point_fixed == "sim" and args.autolupa == "sim"\n'
            '        ),'
        )
        path.write_text(old + "\n", encoding="utf-8")
        old_root = autofix.ROOT
        try:
            autofix.ROOT = root
            fixes = []
            autofix.replace_exact(path, old, new, "CD-AUTO-LUPA-AUTOLUPA", fixes)
        finally:
            autofix.ROOT = old_root
        assert "args.autolupa == \"sim\"" in path.read_text(encoding="utf-8")
        assert len(fixes) == 1


def test_divida_xp_legada_e_detectada_e_some_apos_append():
    invalid_rows = [
        {
            "event": "FINAL",
            "record_hash": record_hash,
            "autolupa_executed": False,
            "point_fixed_evidential": True,
            "achievements": ["ponto_fixo_atingido"],
        }
        for record_hash in sorted(audit.LEGACY_XP_TARGET_HASHES)
    ]
    with tempfile.TemporaryDirectory() as tmp:
        ledger = Path(tmp) / "ledger.jsonl"
        ledger.write_text("".join(json.dumps(row) + "\n" for row in invalid_rows), encoding="utf-8")
        findings = []
        audit.legacy_xp_findings(findings, ledger)
        assert [item.id for item in findings] == ["CD-AUTO-LUPA-XP-LEGACY"]

        correction = {
            "event": "FINAL",
            "mission_id": audit.LEGACY_XP_CORRECTION_MISSION,
            "xp_gained": -50,
            "penalties": ["evidencia_inventada"],
        }
        with ledger.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(correction) + "\n")
        findings = []
        audit.legacy_xp_findings(findings, ledger)
        assert findings == []


def test_correcao_xp_legado_e_idempotente_e_sem_recompensa():
    rows = [
        {
            "event": "FINAL",
            "record_hash": record_hash,
            "autolupa_executed": False,
            "point_fixed_evidential": True,
            "achievements": ["ponto_fixo_atingido"],
        }
        for record_hash in sorted(legacy_xp.TARGET_HASHES)
    ]
    assert legacy_xp.invalid_targets(rows) == legacy_xp.TARGET_HASHES
    assert legacy_xp.correction_exists(rows) is False
    rows.append({
        "event": "FINAL",
        "mission_id": legacy_xp.MISSION,
        "xp_gained": -50,
        "penalties": ["evidencia_inventada"],
    })
    assert legacy_xp.correction_exists(rows) is True
    assert legacy_xp.FINDING_ID in register_xp.NON_REWARDING_FIX_IDS


def test_fallback_da_revisao_declara_modo_script():
    result = review.script_result(
        {"evidence_sha256": "a" * 64, "findings": [{"id": "F-1"}]},
        "SEM_IA",
    )
    assert result["mode"] == "SCRIPT"
    assert result["agent"] == "script"
    assert result["confirmed_finding_ids"] == ["F-1"]
    assert result["reason"] == "SEM_IA"


def test_level_do_placar_e_deterministico():
    assert score.level_from_xp(0) == (1, 100)
    level, missing = score.level_from_xp(100)
    assert level == 2
    assert missing == score.xp_next(2)
    assert score.tier(10) == "MONOCULO"


def test_meta_lupa_rejeita_ponto_fixo_sem_autolupa():
    findings = []
    audit.meta_lupa_findings(findings)
    assert not any(item.id == "CD-AUTO-LUPA-AUTOLUPA" for item in findings), findings


def _run_embedded_pr_scanner(added_lines: list[str]) -> dict[str, str]:
    workflow_path = HERE.parent.parent / ".github/workflows/pr-auto-review.yml"
    workflow = workflow_path.read_text(encoding="utf-8")
    marker = "          python3 - \"$CHANGED_FILE\" \"$PATCH_FILE\" \"$GITHUB_OUTPUT\" <<'PY'\n"
    start = workflow.index(marker) + len(marker)
    end = workflow.index("\n          PY", start)
    code = textwrap.dedent(workflow[start:end])

    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        changed = root / "changed.bin"
        patch = root / "patch.diff"
        output = root / "output.txt"
        changed.write_bytes(b"")
        patch.write_text("\n".join(f"+{line}" for line in added_lines) + "\n", encoding="utf-8")
        result = subprocess.run(
            [sys.executable, "-c", code, str(changed), str(patch), str(output)],
            check=False,
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0, result.stderr
        return dict(line.split("=", 1) for line in output.read_text(encoding="utf-8").splitlines())


def test_scanner_distingue_env_de_segredo_literal():
    safe = _run_embedded_pr_scanner([
        "const BOT_TOKEN = process.env.BOT_TOKEN_CLAUDE || '';",
        "let token = process.env[agente.tokenEnv] || process.env.BOT_TOKEN_AUTONOMIA || '';",
    ])
    assert safe["secret_suspect"] == "false"

    telegram = "123456789:" + ("A" * 35)
    literal = _run_embedded_pr_scanner([f"const BOT_TOKEN = '{telegram}';"])
    assert literal["secret_suspect"] == "true"

    github_key = _run_embedded_pr_scanner(["token = ghp_abcdefghijklmnopqrstuvwxyz123456"])
    assert github_key["secret_suspect"] == "true"


def test_relatorio_json_estavel():
    report = {
        "schema": 1,
        "summary": {"blockers": 0, "warnings": 0, "findings": 0},
        "findings": [],
        "evidence_sha256": "b" * 64,
    }
    rendered = audit.markdown(report)
    assert "Bloqueadores: **0**" in rendered
    assert "áreas fora do escopo" in rendered
    json.dumps(report, sort_keys=True)


if __name__ == "__main__":
    tests = [value for name, value in sorted(globals().items()) if name.startswith("test_") and callable(value)]
    failures = 0
    for test in tests:
        try:
            test()
            print("PASS", test.__name__)
        except Exception as exc:
            failures += 1
            print("FAIL", test.__name__, repr(exc))
    print(f"TOTAL={len(tests)} PASS={len(tests)-failures} FAIL={failures}")
    raise SystemExit(1 if failures else 0)
