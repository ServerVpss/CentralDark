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


def normalize(text: str) -> str:
    raw = unicodedata.normalize("NFKD", str(text or ""))
    raw = "".join(ch for ch in raw if not unicodedata.combining(ch))
    return " ".join(raw.strip().lower().split())


def _contains_phrase(normalized: str, phrase: str) -> bool:
    target = normalize(phrase)
    if not target:
        return False
    padded = f" {normalized} "
    return f" {target} " in padded


def resolve(text: str):
    raw = str(text or "")
    normalized = normalize(raw)
    tokens = normalized.split()
    explicit_master = (
        "!centraldark" in tokens
        or "!central-dark" in tokens
        or "!cdark" in tokens
    )
    delta_match = next((alias for alias in DELTA_ALIASES if _contains_phrase(normalized, alias)), None)
    delta_active = delta_match is not None

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
        "status": "MATCH" if explicit_master or delta_active else "NO_MATCH",
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
            ok = ok and got["authority_changed"] is False
            ok = ok and got["mutation_authorized"] is False
        results.append({"kind": "delta", "input": text, "expected": expected, "got": actual, "ok": ok})

    return {"ok": all(x["ok"] for x in results), "cases": results}


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
