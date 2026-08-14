from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "SKILL.md"
CONTRACT = ROOT / "contract.json"
GUARD = ROOT / "ERROR_CORRECTION_CANONICAL_SHA"


def load_contract() -> dict:
    return json.loads(CONTRACT.read_text(encoding="utf-8"))


def decide(trigger: str, *, writer_collision: bool = False, bypass: bool = False) -> str:
    contract = load_contract()
    if bypass:
        return "FAIL_BYPASS"
    if trigger not in contract["triggers"]:
        return "NO_TRIGGER"
    if writer_collision:
        return contract["decision_rules"]["writer_collision"]
    return contract["decision_rules"]["auto_trigger_starts"]


def git_blob_sha1(data: bytes) -> str:
    return hashlib.sha1(f"blob {len(data)}\0".encode("ascii") + data).hexdigest()


def test_detecta_erro_e_volta_ao_mesmo_fio():
    contract = load_contract()
    assert decide("ERROR") == "DIAGNOSTIC_ONLY"
    assert contract["return_to_mission_thread"] is True
    assert "RETURN_TO_SAME_THREAD" in contract["loop"]


def test_nao_rouba_caneta_de_writer_ativo():
    assert decide("FAIL", writer_collision=True) == "READ_ONLY_DELTA_MESSAGE"
    skill = SKILL.read_text(encoding="utf-8")
    assert "outro Writer no mesmo escopo => `READ_ONLY + DELTA_MESSAGE`" in skill


def test_unknown_nunca_vira_pass():
    contract = load_contract()
    assert contract["decision_rules"]["unknown_is_pass"] is False
    assert "UNKNOWN" in contract["non_pass_states"]


def test_rejeita_bypass():
    contract = load_contract()
    assert decide("ERROR", bypass=True) == "FAIL_BYPASS"
    assert contract["decision_rules"]["bypass_allowed"] is False
    assert "BYPASS_GATE" in contract["forbidden_actions"]


def test_prefere_causa_comum_a_sintomas():
    contract = load_contract()
    assert contract["decision_rules"]["prefer_common_cause_over_symptom_fixes"] is True
    skill = SKILL.read_text(encoding="utf-8")
    assert "corrigir fonte" in skill
    assert "43 sintomas" in skill


def test_falha_na_propria_skill_permite_refino():
    contract = load_contract()
    assert contract["decision_rules"]["self_failure_allows_refinement"] is True
    skill = SKILL.read_text(encoding="utf-8")
    assert "EVIDENCIA_MATA_SKILL" in skill


def test_hipotese_derrotada_nao_fica_como_verdade():
    contract = load_contract()
    assert contract["decision_rules"]["defeated_hypothesis_remains_active_truth"] is False


def test_aprendizado_valido_vira_delta_canonico():
    contract = load_contract()
    assert contract["decision_rules"]["valid_learning_requires"] == [
        "NEW_EVIDENCE",
        "BELIEF_DELTA",
        "REUSABLE",
    ]
    skill = SKILL.read_text(encoding="utf-8")
    assert "EVIDENCIA_NOVA=SIM" in skill
    assert "DELTA_DE_CRENCA=SIM" in skill
    assert "REUTILIZAVEL=SIM" in skill


def test_repeticao_sem_informacao_nova_nao_gera_ouro():
    contract = load_contract()
    assert contract["decision_rules"]["repetition_without_new_information"] == "NO_GOLD"


def test_modelo_diferente_aplica_o_mesmo_contrato():
    contract = load_contract()
    assert contract["all_model"] is True
    assert contract["decision_rules"]["model_name_changes_contract"] is False


def test_writer_nao_pode_ser_judge():
    contract = load_contract()
    assert contract["decision_rules"]["writer_equals_judge"] is False


def test_zero_deploy_e_sem_acoes_destrutivas():
    contract = load_contract()
    assert contract["zero_deploy"] is True
    forbidden = set(contract["forbidden_actions"])
    assert {"DEPLOY", "RESTART", "FORCE_PUSH", "DESTRUCTIVE_RESET"} <= forbidden


def test_auto_trigger_cobre_condicoes_materiais():
    contract = load_contract()
    expected = {
        "ERROR",
        "FAIL",
        "DRIFT",
        "REGRESSION",
        "CONFLICT",
        "UNKNOWN_MATERIAL",
        "CHECK_RED",
        "CONTRACT_DRIFT",
        "BROKEN_TEST",
        "HASH_DRIFT",
        "STALE_MEMORY_OR_STATE",
        "AMBIGUOUS_AUTHORITY",
        "TOOL_FAILURE",
    }
    assert expected <= set(contract["triggers"])


def test_delega_sem_duplicar_responsabilidade():
    contract = load_contract()
    assert contract["delegates"]["execution_loop"].endswith("cot-react-loop/SKILL.md")
    assert contract["delegates"]["falsification"].endswith("meta-lupa/SKILL.md")
    assert contract["reuse_before_create"] is True


def test_gate_de_promocao_e_fail_closed():
    gate = load_contract()["promotion_gate"]
    assert gate == {
        "head_fixed": True,
        "applicable_tests_pass": True,
        "independent_judge_pass": True,
        "material_p0_p1": 0,
        "promotion_unknown": 0,
        "receipt_coherent": True,
        "writer_collision": False,
        "return_to_mission_thread": True,
        "zero_deploy": True,
    }


def test_selo_bate_com_skill_atual():
    expected = GUARD.read_text(encoding="utf-8").strip().split()[0]
    actual = git_blob_sha1(SKILL.read_bytes())
    assert actual == expected
