"""Deterministic tests for the script-first recovery gate (contract recovery_first).

Regra metodologica: se o script ja sabe comprovar, nao chamar IA. O testador
duplica so o dependencia externa (centraldark_master_cycle) que o loader
resolvera no runtime publico; a politica abaixo nao depende dela.
"""
import json
import pathlib
import runpy
import sys
import tempfile

REPO = pathlib.Path(__file__).resolve().parents[2]  # CentralDark root (dynamic; no hardcode)

# O loader resolve centraldark_master_cycle no bootstrap publico; no sandbox
# esse modulo nao esta instalado (apenas o tests coverage precisa). Duplica
# a funcao `resolve` e mantem o teste focado na politica recovery_first.
import types
_sd = types.ModuleType("centraldark_master_cycle")
_sd.resolve = lambda *a, **k: None
sys.modules["centraldark_master_cycle"] = _sd


def _load_loader():
    return runpy.run_path(
        str(REPO / "scripts" / "trigger-fabric" / "centraldark_full_trigger_boot.py"))


def test_positive_recovery_script_first():
    m = _load_loader()
    result = m["cmd_script_first_preflight"](REPO)
    assert result["script_first_recovery_passed"] is True
    assert result["script_first_recovery_failed"] is False
    assert result["script_first_model_authorized"] is False
    assert result["script_first_sentinel_command"].endswith(
        "scripts/trigger-fabric/system_sentinel.py")


def test_negative_recovery_script_first_leaves_model_authorized():
    probe = pathlib.Path(tempfile.mkdtemp(prefix="sf-neg-"))
    (probe / "CENTRALDARK_AI_BOOT.yaml").write_text("marker\n")
    (probe / "scripts" / "trigger-fabric").mkdir(parents=True)
    sentinel = probe / "scripts" / "trigger-fabric" / "system_sentinel.py"
    sentinel.write_text(
        "import json,sys\nprint(json.dumps({'ok':False,'checks':{},'failed':['FACTOR_VERIFICADO']}))\n",
        encoding="utf-8")
    m = _load_loader()
    result = m["cmd_script_first_preflight"](probe)
    assert result["script_first_recovery_passed"] is False
    assert result["script_first_recovery_failed"] is True
    assert result["script_first_model_authorized"] is True
    assert result["script_first_recovery_error"] == ["FACTOR_VERIFICADO"]
    import shutil
    shutil.rmtree(probe, ignore_errors=True)


if __name__ == "__main__":
    test_positive_recovery_script_first()
    test_negative_recovery_script_first_leaves_model_authorized()
    print("SCRIPT_FIRST_TESTS: PASS (positive unit + negative unit)")
