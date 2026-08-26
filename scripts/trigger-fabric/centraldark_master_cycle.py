#!/usr/bin/env python3
import argparse
import json
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
    "!delta util",
    "!deltautil",
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


def normalize(text: str) -> str:
    raw = unicodedata.normalize("NFKD", str(text or ""))
    raw = "".join(ch for ch in raw if not unicodedata.combining(ch))
    return " ".join(raw.strip().lower().split())


def _contains_phrase(normalized: str, phrase: str) -> bool:
    target = normalize(phrase)
    if not target:
        return False
    return f" {target} " in f" {normalized} "


def resolve(text: str):
    raw = str(text or "")
    normalized = normalize(raw)
    tokens = normalized.split()
    explicit_master = any(token in tokens for token in ("!centraldark", "!central-dark", "!cdark"))
    delta_match = next((alias for alias in DELTA_ALIASES if _contains_phrase(normalized, alias)), None)
    meta_match = next(
        (alias for alias in MULTIBUSSOLA_META_ALIASES if _contains_phrase(normalized, alias)),
        None,
    )
    delta_active = delta_match is not None
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
            "matched_alias": delta_match,
            "mode": "DELTA_HARVEST" if delta_active else None,
            "route_to_existing_owner": delta_active,
            "information_gain_required": delta_active,
            "zero_regression": delta_active,
            "no_v1_v2_v3": delta_active,
        },
        "multibussola": {
            "canonical_signal": "!MULTIBUSSOLA",
            "active": meta_active,
            "matched_alias": meta_match,
            "mode": "META" if meta_active else None,
            "profile": "META_MULTIBUSSOLA" if meta_active else None,
            "owner": "docs/CONSCIENCIA/MULTIBUSSOLA.md" if meta_active else None,
            "routes": MULTIBUSSOLA_META_ROUTES if meta_active else [],
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
    }


def self_test():
    master_cases = [
        ("!CENTRALDARK", True),
        ("!centraldark fecha essa missão", True),
        ("!central-dark fecha", True),
        ("!cdark", True),
        ("CentralDark e o nome do repo", False),
        ("fala normal", False),
    ]
    delta_cases = [
        ("!DELTA UTILS usa só o útil", True),
        ("!delta util", True),
        ("!DELTAÚTIL", True),
        ("pega o delta desse material", True),
        ("toma esse delta aí", True),
        ("usa o delta de agora", True),
        ("a palavra delta aparece num relatório", False),
        ("utilidade marginal sem pedido de delta", False),
    ]
    meta_cases = [
        ("!MULTIBUSSOLA_META", True),
        ("!MULTIBÚSSOLA_META prova isso", True),
        ("MULTIBUSSOLA_META", True),
        ("MULTIBÚSSOLA_META", True),
        ("!MULTIBUSSOLA", False),
        ("a bússola aponta o norte", False),
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

    for text, expected in delta_cases:
        got = resolve(text)
        actual = got["delta_harvest"]["active"]
        ok = actual is expected
        if expected:
            ok = ok and got["delta_harvest"]["route_to_existing_owner"] is True
            ok = ok and got["delta_harvest"]["information_gain_required"] is True
            ok = ok and got["delta_harvest"]["zero_regression"] is True
            ok = ok and got["delta_harvest"]["no_v1_v2_v3"] is True
        results.append({"kind": "delta", "input": text, "expected": expected, "got": actual, "ok": ok})

    for text, expected in meta_cases:
        got = resolve(text)
        multi = got["multibussola"]
        actual = multi["active"]
        ok = actual is expected
        if expected:
            ok = ok and multi["mode"] == "META"
            ok = ok and multi["owner"] == "docs/CONSCIENCIA/MULTIBUSSOLA.md"
            ok = ok and multi["routes"] == MULTIBUSSOLA_META_ROUTES
            ok = ok and multi["invalidate_stale_bearings_on_material_change"] is True
            ok = ok and multi["unknown_material_must_be_zero_for_pass"] is True
            ok = ok and multi["fixed_point_is_pass"] is False
            ok = ok and multi["creates_new_pipeline"] is False
            ok = ok and multi["creates_new_owner"] is False
            ok = ok and got["authority_changed"] is False
            ok = ok and got["mutation_authorized"] is False
        results.append({"kind": "multibussola_meta", "input": text, "expected": expected, "got": actual, "ok": ok})

    return {"ok": all(item["ok"] for item in results), "cases": results}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--text")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    out = self_test() if args.self_test else resolve(args.text or "")
    print(json.dumps(out, ensure_ascii=False, indent=2))
    if args.self_test and not out["ok"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
