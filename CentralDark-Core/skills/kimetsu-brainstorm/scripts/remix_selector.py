#!/usr/bin/env python3
"""Pure, deterministic Kimetsu REMIX planner. No tools, writes or subprocesses.

Input is an OBSERVED task state; output is a proposal for Hermes, NOT execution.
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from typing import Any

CATALOG = (
    (1, "Ucchuha", "perceive"),
    (2, "Hinoko", "root_cause"),
    (3, "Mafu", "precision"),
    (4, "Susamaru", "monitor"),
    (5, "Kyojuro", "synthesize"),
    (6, "Gyomei", "verify"),
    (7, "Sangue da Respiração", "confidence_candidate"),
    (8, "Respiração do Inferno", "persistence_candidate"),
    (9, "Respiração do Sol", "creation_candidate"),
    (10, "Respiração da Linha", "clarity_candidate"),
    (11, "Respiração do Eclipse", "system_view_candidate"),
    (12, "Respiração do Amanhecer", "transition_candidate"),
    (13, "Respiração da Flor", "adapt_candidate"),
    (14, "Respiração da Serpente", "flexibility_candidate"),
    (15, "Respiração do Gato", "signals_candidate"),
    (16, "Respiração do PekOpenedki", "precision_candidate"),
    (17, "Respiração Suprema", "integrate_candidate"),
)
METHODS = ("ToT", "CoT", "ReAct", "GoT", "AoT", "SoT", "PoT", "CoT-SC")


def plan(state: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(state, dict):
        raise ValueError("state must be an object")
    intent = str(state.get("intent", "")).strip()
    if not intent:
        raise ValueError("intent required")
    category = state.get("category", "SPIKE")
    if category not in ("SPIKE", "BOUNDED", "ARCHITECTURAL"):
        raise ValueError("invalid category")
    authorized = state.get("authorized", False) is True
    tools = state.get("tools_available", False) is True
    steps = state.get("steps", 1)
    if type(steps) is not int or not 1 <= steps <= 100:
        raise ValueError("steps must be an integer 1..100")
    independent = state.get("independent_tasks", 0)
    if type(independent) is not int or not 0 <= independent <= 32:
        raise ValueError("independent_tasks must be an integer 0..32")
    observed = state.get("observed", {})
    if not isinstance(observed, dict):
        raise ValueError("observed must be an object")
    flags = {name: observed.get(name) is True for name in (
        "unknown_state", "ambiguous", "cause_unknown", "cause_isolated",
        "multi_system", "needs_calculation", "needs_alternatives",
        "long_output", "requires_monitoring", "contradiction", "proof_missing",
        "evidence_complete", "new_design", "phase_transition", "change_detected",
    )}
    if flags["unknown_state"] or flags["ambiguous"]:
        style, why, breaths = "ÁGUA", "Ambiguidade/estado não medido", [1, 10]
    elif flags["cause_unknown"] or flags["multi_system"]:
        style, why, breaths = "FERA", "Causa distribuída/desconhecida", [1, 4, 11]
    elif flags["cause_isolated"]:
        style, why, breaths = "INSETO", "Causa exata isolada", [3, 16]
    elif steps >= 3:
        style, why, breaths = "CHAMAS", "Execução multietapa", [5, 6, 17]
    else:
        style, why, breaths = "TROVÃO", "Caminho curto e conhecido", [3, 6]
    methods = []
    if flags["needs_alternatives"]:
        methods.append("ToT")
    if flags["multi_system"]:
        methods.append("GoT")
    if flags["needs_calculation"]:
        methods.append("PoT")
    if flags["long_output"]:
        methods.append("SoT")
    if steps >= 4 and flags["cause_unknown"]:
        methods.append("AoT")
    if tools and authorized and steps >= 3:
        methods.append("ReAct")
    elif not methods:
        methods.append("CoT")  # Structured decision summary, never hidden chain of thought.
    if flags["needs_alternatives"] and flags["contradiction"]:
        methods.append("CoT-SC")  # Independent agreement != proof.
    methods = list(dict.fromkeys(methods))
    # Optional independent READ-ONLY work; Hermes remains owner/executor.
    delegate = min(independent, 5) if tools and authorized and independent >= 2 else 0
    need_fable = flags["contradiction"] or flags["proof_missing"] or flags["unknown_state"]
    need_react = tools and authorized and steps >= 3
    # Design-approval and scope remain above confidence/score.
    decision = ("PLAN_ONLY" if not authorized or flags["ambiguous"] or
                (category != "SPIKE" and not state.get("design_approved", False))
                else "EXECUTION_ELIGIBLE")
    signals_by_breath = {
        1: ("unknown_state", "ambiguous", "cause_unknown"),
        2: ("cause_unknown",), 3: ("cause_isolated", "needs_calculation"),
        4: ("requires_monitoring", "multi_system"),
        5: ("long_output",), 6: ("proof_missing", "contradiction"),
        7: ("evidence_complete",), 8: ("evidence_complete",),
        9: ("new_design",), 10: ("unknown_state", "long_output"),
        11: ("multi_system",), 12: ("phase_transition",),
        13: ("change_detected",), 14: ("needs_alternatives",),
        15: ("cause_unknown",), 16: ("cause_isolated",),
        17: ("evidence_complete",),
    }
    # Score ALL 17: ranking is a suggestion, not proof of historical techniques.
    catalog_scores = []
    for idx, name, role in CATALOG:
        matching = [signal for signal in signals_by_breath[idx] if flags[signal]]
        base = 2 if idx in breaths else 0
        score = base + len(matching)
        catalog_scores.append({"id": idx, "name": name, "role": role,
                               "score": score, "signals": matching,
                               "status": "HISTORICAL_CANDIDATE" if idx >= 7 else "HISTORICAL_MAPPING"})
    selected = sorted((x for x in catalog_scores if x["score"] > 0),
                      key=lambda x: (-x["score"], x["id"]))[:4]
    return {
        "owner": ".agents/skills/kimetsu-brainstorm/SKILL.md",
        "intent": intent, "category": category, "decision": decision,
        "breathing": style, "reason": why,
        "catalog_evaluated": 17, "catalog_origin": "historical_dependabot_not_runtime_homologation",
        "catalog_scores": catalog_scores, "selected_breaths": selected, "methods": methods,
        "fable_loop": "CALIBRATE_READ_ONLY" if need_fable else "SKIP_NO_MATERIAL_GAP",
        "cot_react_loop": "ELIGIBLE_REAL_TOOLS" if need_react else "SKIP_NO_AUTHORIZED_MULTI_STEP_TOOLS",
        "delegation": {"mode": "INDEPENDENT_READ_ONLY" if delegate else "NONE",
                       "max_subagents": delegate, "execution_proven": False},
        "evidence": "NOT_PROVEN_BY_PLANNER", "xp_gained": 0,
        "next": "HERMES_ROUTE_AND_MEASURE" if decision == "EXECUTION_ELIGIBLE" else "ASK_OR_DESIGN_GATE",
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--state", required=True, help="JSON observed task state")
    args = ap.parse_args()
    result = plan(json.loads(args.state))
    result["planned_at"] = datetime.now(timezone.utc).isoformat()
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
