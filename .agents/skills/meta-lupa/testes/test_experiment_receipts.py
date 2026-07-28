from __future__ import annotations

import copy
import importlib.util

ROOT = __import__("pathlib").Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("meta_lupa_receipts", ROOT / "scripts" / "meta_lupa.py")
m = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(m)


def receipt(arm="A", seed=1):
    model = "claude-opus-5"
    return {
        "process_started": True,
        "pid_observed": True,
        "pid": 1000 + seed,
        "process_exited": True,
        "exit_code": 0,
        "log_sha256": "a" * 64,
        "log_fresh": True,
        "stream_complete": True,
        "final_result_receipt": True,
        "fixture_sha": "b" * 64,
        "fixture_sha_match": True,
        "prompt_sha": "c" * 64,
        "prompt_sha_match": True,
        "tests_executed": True,
        "tests_cwd_correct": True,
        "tests_before": {"failures": 4, "total": 5},
        "tests_after": {"failures": 0, "total": 5},
        "tests_after_pass": True,
        "model_requested": model,
        "model_actual": model,
        "model_actual_proof": True,
        "model_match": True,
        "seeded_failures_total": 4,
        "tests_total": 5,
        "failures_found": 4,
        "failure_recall_percent": 100.0,
        "output_chars": 7837,
        "input_tokens": 100,
        "output_tokens": 200,
        "total_tokens": 300,
        "timeout_seconds": 300,
        "budget_sha": "d" * 64,
        "test_manifest_sha": "e" * 64,
        "arm": arm,
        "seed": seed,
        "oracle_independent": True,
        "discriminative_test_before": True,
        "correct_action_score": 2,
        "correct_action_score_max": 2,
        "hidden_failures_reported": True,
        "modules_correct_preserved": True,
        "authorization_confidence_separated": True,
    }


def test_valid_receipt_passes():
    assert m.validate_execution_receipt(receipt(), arm="A") == []


def test_model_actual_must_be_proven():
    item = receipt()
    item.update(model_actual=m.UNKNOWN, model_actual_proof=False)
    assert "MODEL_ACTUAL_UNPROVEN" in m.validate_execution_receipt(item, arm="A")


def test_character_count_is_not_token_usage():
    item = receipt()
    item["output_tokens"] = "7837c"
    assert "TOKEN_USAGE_IS_CHAR_COUNT" in m.validate_execution_receipt(item, arm="A")


def test_json_primitive_is_not_a_stream_event():
    events, errors = m.parse_stream_json('{"type":"assistant"}\n1\n')
    assert len(events) == 1
    assert "STREAM_EVENT_NOT_OBJECT:2" in errors


def test_exit_zero_without_real_execution_is_invalid():
    item = receipt()
    item.update(process_started=False, pid_observed=False, process_exited=False)
    errors = m.validate_execution_receipt(item, arm="A")
    assert "PROCESS_STARTED_REQUIRED" in errors
    assert "PROCESS_EXITED_REQUIRED" in errors


def test_textual_false_negative_cannot_support_outcome_claim():
    item = receipt()
    item.update(failures_found=0, failure_recall_percent=0.0, correct_action_score=0)
    assert m.validate_execution_receipt(item, arm="A") == []
    assert m.validate_outcome_evidence(item)


def test_fixture_contamination_and_stale_log_are_invalid():
    item = receipt()
    item["fixture_sha_match"] = False
    item["log_fresh"] = False
    errors = m.validate_execution_receipt(item, arm="A")
    assert "FIXTURE_SHA_MATCH_REQUIRED" in errors
    assert "LOG_FRESH_REQUIRED" in errors


def test_timeout_and_incomplete_receipt_are_invalid():
    item = receipt()
    item["process_exited"] = False
    errors = m.validate_execution_receipt(item, arm="A")
    assert "PROCESS_EXITED_REQUIRED" in errors

    item = receipt()
    item.pop("final_result_receipt")
    errors = m.validate_execution_receipt(item, arm="A")
    assert any(error.startswith("RECEIPT_FIELD_MISSING:final_result_receipt") for error in errors)


def test_failure_denominator_cannot_be_confused_with_test_count():
    item = receipt()
    item["seeded_failures_total"] = 5
    assert "FAILURE_DENOMINATOR_INVALID" in m.validate_execution_receipt(item, arm="A")


def test_fable_without_fanout_is_invalid():
    item = receipt("C")
    item.update(fable_plugin_enabled=True, fable_loop_mentioned=True, stages_started=0, task_calls=0, subagents_called=0)
    errors = m.validate_execution_receipt(item, arm="C")
    assert "FABLE_STAGES_STARTED_REQUIRED" in errors
    assert "FABLE_TASK_CALLS_REQUIRED" in errors
    assert "FABLE_SUBAGENTS_CALLED_REQUIRED" in errors


def test_fable_gate_requires_same_control_and_two_valid_seeds():
    runs = []
    for arm in ("A", "B", "C", "D"):
        for seed in (1, 2):
            item = receipt(arm, seed)
            if arm in ("C", "D"):
                item.update(fable_plugin_enabled=True, fable_loop_mentioned=True, stages_started=1, task_calls=1, subagents_called=1)
            runs.append(item)
    assert m.fable_causal_promotion_allowed(runs)
    missing = [item for item in runs if item["arm"] != "D"]
    assert not m.fable_causal_promotion_allowed(missing)
    mismatched = copy.deepcopy(runs)
    mismatched[-1]["model_actual"] = "claude-haiku"
    assert not m.fable_causal_promotion_allowed(mismatched)
