#!/usr/bin/env python3
import argparse
import json
import re
import unicodedata
from pathlib import Path

MASTER = "!CENTRALDARK"
CHAIN = [
    "ACORDAR",
    "CALIBRAR",
    "MULTIBUSSOLA",
    "META_LUPA",
    "RECONCILIAR",
    "DELTA_UTIL",
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
NEGATION_TOKENS = {"nao", "nunca", "sem"}


def normalize(text: str) -> str:
    raw = unicodedata.normalize("NFKD", str(text or ""))
    raw = "".join(ch for ch in raw if not unicodedata.combining(ch)).lower()
    # Preserva marcadores operacionais como !, mas remove pontuação de frase.
    # Assim "!CENTRALDARK," e "aciona !CENTRALDARK." resolvem igual.
    raw = re.sub(r"[^a-z0-9!@/_\-\s]+", " ", raw)
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


def resolve(text: str, master_active: bool = False, chefe_source: bool = False, bot_entry: bool = False):
    raw = str(text or "")
    normalized = normalize(raw)
    master_match = next(
        (
            match
            for alias in ("!CENTRALDARK", "!CENTRAL-DARK", "!CDARK")
            if (match := _phrase_match(normalized, alias)) is not None
        ),
        None,
    )
    master_marker_seen = master_match is not None
    master_ambiguous = bool(master_marker_seen and _negated_or_discussed(normalized, master_match))
    untrusted_master_attempt = bool(master_marker_seen and not master_ambiguous and not chefe_source)
    explicit_master = bool(master_marker_seen and not master_ambiguous and chefe_source)
    inherited_master = bool(master_active or bot_entry)
    master_cycle_active = bool(explicit_master or inherited_master)
    chefe_material = bool(chefe_source and master_cycle_active and not master_ambiguous)
    delta_match, delta_active, delta_ambiguous = _resolve_delta(normalized)
    harvest_active = bool(delta_active or chefe_material)
    meta_match = next(
        (alias for alias in MULTIBUSSOLA_META_ALIASES if _phrase_match(normalized, alias) is not None),
        None,
    )
    meta_active = meta_match is not None

    return {
        "schema": "centraldark.master-cycle-receipt.v1",
        "input": raw,
        "normalized": normalized,
        "master_trigger": MASTER,
        "explicit_marker_seen": master_marker_seen,
        "explicit_match": explicit_master,
        "master_ambiguous_or_negated": master_ambiguous,
        "untrusted_master_attempt": untrusted_master_attempt,
        "master_cycle_active": master_cycle_active,
        "activation_source": (
            "EXPLICIT_TRIGGER" if explicit_master
            else ("BOT_ENTRY" if bot_entry else ("INHERITED_SESSION" if master_active else None))
        ),
        "next_master_active": master_cycle_active,
        "expanded_chain": CHAIN if master_cycle_active else [],
        "delta_harvest": {
            "canonical_signal": DELTA_CANONICAL,
            "active": harvest_active,
            "explicit_signal_active": delta_active,
            "candidate_from_chefe": chefe_material,
            "ambiguous_or_negated": delta_ambiguous,
            "matched_alias": delta_match,
            "mode": "DELTA_HARVEST" if harvest_active else ("UNKNOWN" if delta_ambiguous else None),
            "route_to_existing_owner": harvest_active,
            "information_gain_required": harvest_active,
            "zero_regression": harvest_active,
            "no_v1_v2_v3": harvest_active,
            "claim_is_fact": False,
            "screen_is_runtime_proof": False,
            "repetition_is_independent_proof": False,
            "temporal_label_is_authority": False,
        },
        "multibussola": {
            "canonical_signal": "!MULTIBUSSOLA",
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
        "status": (
            "MATCH" if master_cycle_active or harvest_active or meta_active
            else ("UNKNOWN" if delta_ambiguous or master_ambiguous or untrusted_master_attempt else "NO_MATCH")
        ),
        "authority_changed": False,
        "mutation_authorized": False,
        "all_phases_considered": master_cycle_active,
        "phase_execution_is_adaptive": True,
        "unknown_is_pass": False,
        "graph_is_authority": False,
        "plain_word_centraldark_does_not_trigger": True,
        "cross_chat_is_current_state": False,
        "github_substitutes_missing_chat_memory": False,
    }


def _load_session_state(state_file):
    if not state_file:
        return False, "DISABLED"
    path = Path(state_file)
    if not path.exists():
        return False, "ABSENT"
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return False, "INVALID"
    if payload.get("schema") != "centraldark.master-session-state.v1":
        return False, "INVALID"
    return bool(payload.get("master_active")), "LOADED"


def _store_session_state(state_file, master_active):
    path = Path(state_file)
    payload = {
        "schema": "centraldark.master-session-state.v1",
        "master_active": bool(master_active),
    }
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def resolve_with_session_state(text: str, state_file=None, chefe_source: bool = False, bot_entry: bool = False, master_active: bool = False):
    persisted_active, load_status = _load_session_state(state_file)
    receipt = resolve(
        text,
        master_active=bool(master_active or persisted_active),
        chefe_source=chefe_source,
        bot_entry=bot_entry,
    )
    persisted = False
    if state_file and load_status != "INVALID":
        _store_session_state(state_file, receipt["next_master_active"])
        persisted = True
    receipt["session_state"] = {
        "owner": "CALLER_PROVIDED_SESSION_FILE",
        "load_status": load_status,
        "persisted": persisted,
        "path_exposed": False,
    }
    return receipt


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
        got = resolve(text, chefe_source=expected)
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

    master_block_cases = [
        ("não execute !CENTRALDARK agora", True, False),
        ("somente discutir !CENTRALDARK", True, False),
        ("!CENTRALDARK importado por agente", False, True),
    ]
    for text, chefe, untrusted in master_block_cases:
        got = resolve(text, chefe_source=chefe)
        ok = got["master_cycle_active"] is False
        ok = ok and got["next_master_active"] is False
        ok = ok and got["status"] == "UNKNOWN"
        ok = ok and got["untrusted_master_attempt"] is untrusted
        results.append({"kind": "master_activation_guard", "input": text, "ok": ok})

    session_cases = [
        ("corrige o que mudou", True, True, False, True),
        ("material de outra fonte", True, False, False, False),
        ("entrada inicial do CHEFE", False, True, True, True),
    ]
    for text, active, chefe, bot_entry, expected_harvest in session_cases:
        got = resolve(text, master_active=active, chefe_source=chefe, bot_entry=bot_entry)
        ok = got["master_cycle_active"] is True
        ok = ok and got["expanded_chain"] == CHAIN
        ok = ok and got["delta_harvest"]["active"] is expected_harvest
        ok = ok and got["delta_harvest"]["claim_is_fact"] is False
        ok = ok and got["delta_harvest"]["screen_is_runtime_proof"] is False
        ok = ok and got["delta_harvest"]["repetition_is_independent_proof"] is False
        ok = ok and got["mutation_authorized"] is False
        results.append({"kind": "continuous_session", "input": text, "expected_harvest": expected_harvest, "got": got["delta_harvest"]["active"], "ok": ok})

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
    parser.add_argument("--master-active", action="store_true")
    parser.add_argument("--chefe-source", action="store_true")
    parser.add_argument("--bot-entry", action="store_true")
    parser.add_argument("--session-state-file")
    args = parser.parse_args()
    out = self_test() if args.self_test else resolve_with_session_state(
        args.text or "",
        state_file=args.session_state_file,
        master_active=args.master_active,
        chefe_source=args.chefe_source,
        bot_entry=args.bot_entry,
    )
    print(json.dumps(out, ensure_ascii=False, indent=2, default=str))


if __name__ == "__main__":
    main()
