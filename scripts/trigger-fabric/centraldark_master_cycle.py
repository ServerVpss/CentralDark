#!/usr/bin/env python3
import argparse
import json
import re
import unicodedata

MASTER = "!CENTRALDARK"
CHAIN = [
    "ACORDAR",
    "CALIBRAR",
    "MULTIBUSSOLA",
    "META_LUPA",
    "RECONCILIAR",
    "CONTRAPROVA",
    "REMEDICAO",
    "FIXED_POINT",
    "REGISTRA",
    "BOOT",
]

DELTA_CANONICAL = "!DELTA UTILS"
DELTA_ALIASES = (
    "!delta utils",
    "!deltautils",
    "deltautils",
    "!delta util",
    "!deltautil",
    "deltautil",
    "!delta útil",
    "delta útil",
    "delta util",
    "delta utils",
    "delta de agora",
    "toma esse delta",
    "pega o delta",
)

NEGATION_TOKENS = {"nao", "nunca", "sem"}

MULTIBUSSOLA_META_CANONICAL = "!MULTIBUSSOLA_META"
MULTIBUSSOLA_META_ALIASES = (
    "!multibussola_meta",
    "!multibússola_meta",
    "multibussola_meta",
    "multibússola_meta",
)
MULTIBUSSOLA_META_ROUTES = [
    "FORWARD_ROUTE",
    "REVERSE_ROUTE",
    "INVERSE_ROUTE",
    "CROSS_BEARING_RENDEZVOUS",
]
MULTIBUSSOLA_PROOF_GATES = [
    "PROOF_TARGET_MATCH",
    "PROOF_OWNERSHIP",
    "INDEPENDENT_COUNTERPROOF",
    "EXTERNAL_ANCHOR_WHEN_APPLICABLE",
    "REMEDICAO_T1",
    "REALITY_JUDGE",
]


def normalize(text: str) -> str:
    raw = unicodedata.normalize("NFKD", str(text or ""))
    raw = "".join(ch for ch in raw if not unicodedata.combining(ch)).lower()
    # Preserva marcadores operacionais como !, mas remove pontuação de frase.
    # Assim "!CENTRALDARK," e "aciona !CENTRALDARK." resolvem igual.
    raw = re.sub(r"[^a-z0-9!@/_\\-\\s]+", " ", raw)
    return " ".join(raw.strip().split())


def _phrase_match(normalized: str, phrase: str):
    target = normalize(phrase)
    if not target:
        return None
    hay = normalized.split()
    needle = target.split()
    if not needle or len(needle) > len(hay):
        return None
    for start in range(0, len(hay) - len(needle) + 1):
        if hay[start:start + len(needle)] == needle:
            return start, start + len(needle)
    return None


def _negated_or_discussed(normalized: str, match) -> bool:
    if not match:
        return False
    tokens = normalized.split()
    start, end = match
    left = tokens[max(0, start - 4):start]
    right = tokens[end:min(len(tokens), end + 5)]
    neighborhood = left + right
    if any(t in NEGATION_TOKENS for t in neighborhood):
        return True
    joined = " ".join(neighborhood)
    return any(phrase in joined for phrase in (
        "nao deve",
        "nao executar",
        "nao execute",
        "nao usar",
        "nao use",
        "apenas mencionar",
        "so mencionar",
        "somente discutir",
    ))


def _resolve_delta(normalized: str):
    for alias in DELTA_ALIASES:
        match = _phrase_match(normalized, alias)
        if not match:
            continue
        if _negated_or_discussed(normalized, match):
            return alias, False, True
        return alias, True, False
    return None, False, False


def evaluate_multibussola_state(state):
    required_covered = bool(state.get("required_bearings_covered"))
    contradiction = bool(state.get("material_contradiction"))
    local_stable = bool(state.get("local_analysis_stable")) and required_covered and not contradiction
    unknown_material = int(state.get("unknown_material", 0))
    counterproof_survives = bool(state.get("counterproof_survives"))
    t1_stable = bool(state.get("t1_stable"))
    failure_stable = bool(state.get("failure_stable"))
    frontier_stable = bool(state.get("frontier_stable"))
    global_objective_closed = bool(state.get("global_objective_closed"))

    if not local_stable:
        verdict = "RESIDUAL_MAP_NEXT_CURSOR"
    elif failure_stable:
        verdict = "FIXED_POINT_FAIL"
    elif frontier_stable:
        verdict = "FIXED_POINT_BLOCKED"
    elif unknown_material == 0 and counterproof_survives and t1_stable:
        verdict = "FIXED_POINT_PASS"
    else:
        verdict = "LOCAL_FIXED_POINT_NOT_YET"

    return {
        "local_analysis_stable": local_stable,
        "local_fixed_point": local_stable,
        "local_fixed_point_ends_global_mission": False,
        "unknown_material": unknown_material,
        "required_bearings_covered": required_covered,
        "material_contradiction": contradiction,
        "counterproof_survives": counterproof_survives,
        "t1_stable": t1_stable,
        "verdict": verdict,
        "mission_state": "CLOSED" if verdict == "FIXED_POINT_PASS" and global_objective_closed else "NOT_YET",
    }


def resolve(text: str):
    raw = str(text or "")
    normalized = normalize(raw)
    explicit_master = (
        _phrase_match(normalized, "!CENTRALDARK") is not None
        or _phrase_match(normalized, "!CENTRAL-DARK") is not None
        or _phrase_match(normalized, "!CDARK") is not None
    )
    delta_match, delta_active, delta_ambiguous = _resolve_delta(normalized)
    meta_match = next(
        (alias for alias in MULTIBUSSOLA_META_ALIASES if _phrase_match(normalized, alias)),
        None,
    )
    meta_active = meta_match is not None

    return {
        "schema": "centraldark.master-cycle-receipt.v1",
        "input": raw,
        "normalized": normalized,
        "master_trigger": MASTER,
        "explicit_match": explicit_master,
        "expanded_chain": CHAIN if explicit_master else [],
        "delta_harvest": {
            "canonical_signal": DELTA_CANONICAL,
            "active": delta_active,
            "ambiguous_or_negated": delta_ambiguous,
            "matched_alias": delta_match,
            "mode": "DELTA_HARVEST" if delta_active else ("UNKNOWN" if delta_ambiguous else None),
            "route_to_existing_owner": delta_active,
            "information_gain_required": delta_active,
            "zero_regression": delta_active,
            "no_v1_v2_v3": delta_active,
        },
        "multibussola": {
            "canonical_signal": MULTIBUSSOLA_META_CANONICAL,
            "active": meta_active,
            "matched_alias": meta_match,
            "mode": "META" if meta_active else None,
            "profile": "META_MULTIBUSSOLA" if meta_active else None,
            "owner": "docs/CONSCIENCIA/MULTIBUSSOLA.md" if meta_active else None,
            "routes": MULTIBUSSOLA_META_ROUTES if meta_active else [],
            "proof_gates": MULTIBUSSOLA_PROOF_GATES if meta_active else [],
            "invalidate_stale_bearings_on_material_change": meta_active,
            "unknown_material_must_be_zero_for_pass": meta_active,
            "fixed_point_is_pass": False,
            "creates_new_pipeline": False,
            "creates_new_owner": False,
        },
        "status": "MATCH" if explicit_master or delta_active or meta_active else "NO_MATCH",
        "authority_changed": False,
        "mutation_authorized": False,
        "all_phases_considered": explicit_master,
        "phase_execution_is_adaptive": True,
        "unknown_is_pass": False,
        "graph_is_authority": False,
        "plain_word_centraldark_does_not_trigger": True,
        "cross_chat_is_current_state": False,
        "github_substitutes_missing_chat_memory": False,
    }


def self_test():
    master_cases = [
        ("!CENTRALDARK", True),
        ("!centraldark fecha essa missão", True),
        ("!central-dark fecha", True),
        ("!cdark", True),
        ("!CENTRALDARK, fecha", True),
        ("aciona !CENTRALDARK.", True),
        ("CentralDark e o nome do repo", False),
        ("fala normal", False),
    ]
    delta_cases = [
        ("!DELTA UTILS usa só o útil", True, False),
        ("!DELTAUTILS", True, False),
        ("DELTAUTILS", True, False),
        ("!DELTAUTIL", True, False),
        ("DELTAUTIL", True, False),
        ("!DELTAÚTIL", True, False),
        ("pega o delta desse material", True, False),
        ("toma esse delta aí", True, False),
        ("usa o delta de agora", True, False),
        ("não pega o delta desse material", False, True),
        ("a instrução pega o delta não deve ser executada", False, True),
        ("não execute !DELTAUTIL agora", False, True),
        ("a palavra delta aparece num relatório", False, False),
        ("utilidade marginal sem pedido de delta", False, False),
    ]
    meta_cases = [
        ("!MULTIBUSSOLA_META", True),
        ("!MULTIBÚSSOLA_META prova isso", True),
        ("MULTIBUSSOLA_META", True),
        ("MULTIBÚSSOLA_META", True),
        ("!MULTIBUSSOLA", False),
        ("a bússola aponta o norte", False),
    ]
    fixed_point_cases = [
        ({"local_analysis_stable": False}, "RESIDUAL_MAP_NEXT_CURSOR", "NOT_YET"),
        ({"local_analysis_stable": True, "required_bearings_covered": True}, "LOCAL_FIXED_POINT_NOT_YET", "NOT_YET"),
        ({"local_analysis_stable": True, "required_bearings_covered": True, "failure_stable": True}, "FIXED_POINT_FAIL", "NOT_YET"),
        ({"local_analysis_stable": True, "required_bearings_covered": True, "frontier_stable": True}, "FIXED_POINT_BLOCKED", "NOT_YET"),
        ({"local_analysis_stable": True, "required_bearings_covered": True, "counterproof_survives": True, "t1_stable": True}, "FIXED_POINT_PASS", "NOT_YET"),
        ({"local_analysis_stable": True, "required_bearings_covered": True, "counterproof_survives": True, "t1_stable": True, "global_objective_closed": True}, "FIXED_POINT_PASS", "CLOSED"),
        ({"local_analysis_stable": True, "required_bearings_covered": True, "counterproof_survives": True, "t1_stable": True, "material_contradiction": True}, "RESIDUAL_MAP_NEXT_CURSOR", "NOT_YET"),
    ]

    results = []
    for text, expected in master_cases:
        got = resolve(text)
        ok = got["explicit_match"] is expected
        if expected:
            ok = ok and got["expanded_chain"] == CHAIN
            ok = ok and got["authority_changed"] is False
            ok = ok and got["mutation_authorized"] is False
        results.append({"kind": "master", "input": text, "expected": expected, "got": got["explicit_match"], "ok": ok})

    for text, expected, ambiguous in delta_cases:
        got = resolve(text)
        actual = got["delta_harvest"]["active"]
        actual_ambiguous = got["delta_harvest"]["ambiguous_or_negated"]
        ok = actual is expected and actual_ambiguous is ambiguous
        if expected:
            ok = ok and got["delta_harvest"]["route_to_existing_owner"] is True
            ok = ok and got["delta_harvest"]["information_gain_required"] is True
            ok = ok and got["delta_harvest"]["zero_regression"] is True
            ok = ok and got["delta_harvest"]["no_v1_v2_v3"] is True
            ok = ok and got["authority_changed"] is False
            ok = ok and got["mutation_authorized"] is False
            ok = ok and got["cross_chat_is_current_state"] is False
            ok = ok and got["github_substitutes_missing_chat_memory"] is False
        if ambiguous:
            ok = ok and got["status"] == "UNKNOWN"
            ok = ok and got["mutation_authorized"] is False
        results.append({"kind": "delta", "input": text, "expected": expected, "got": actual, "ambiguous": actual_ambiguous, "ok": ok})

    for text, expected in meta_cases:
        got = resolve(text)
        multi = got["multibussola"]
        actual = multi["active"]
        ok = actual is expected
        if expected:
            ok = ok and multi["mode"] == "META"
            ok = ok and multi["owner"] == "docs/CONSCIENCIA/MULTIBUSSOLA.md"
            ok = ok and multi["routes"] == MULTIBUSSOLA_META_ROUTES
            ok = ok and multi["proof_gates"] == MULTIBUSSOLA_PROOF_GATES
            ok = ok and multi["invalidate_stale_bearings_on_material_change"] is True
            ok = ok and multi["unknown_material_must_be_zero_for_pass"] is True
            ok = ok and multi["fixed_point_is_pass"] is False
            ok = ok and multi["creates_new_pipeline"] is False
            ok = ok and multi["creates_new_owner"] is False
            ok = ok and got["authority_changed"] is False
            ok = ok and got["mutation_authorized"] is False
        results.append({"kind": "multibussola_meta", "input": text, "expected": expected, "got": actual, "ok": ok})

    for state, expected_verdict, expected_mission in fixed_point_cases:
        got = evaluate_multibussola_state(state)
        ok = got["verdict"] == expected_verdict and got["mission_state"] == expected_mission
        ok = ok and got["local_fixed_point_ends_global_mission"] is False
        results.append({"kind": "fixed_point", "expected": expected_verdict, "got": got["verdict"], "ok": ok})

    return {"ok": all(item["ok"] for item in results), "cases": results}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--text")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    out = self_test() if args.self_test else resolve(args.text or "")
    print(json.dumps(out, ensure_ascii=False, indent=2, default=str))


if __name__ == "__main__":
    main()