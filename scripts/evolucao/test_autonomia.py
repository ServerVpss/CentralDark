#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent


def load(name: str, filename: str):
    spec = importlib.util.spec_from_file_location(name, HERE / filename)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module


audit = load("audit_autonomia", "auditar-autonomia.py")
autofix = load("autofix_autonomia", "aplicar-autofix.py")
review = load("review_autonomia", "revisar-com-ia.py")
score = load("score_autonomia", "gerar-placar.py")


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
            autofix.remove_telegram_literal(path, fixes)
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
