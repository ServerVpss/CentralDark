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


def normalize(text: str) -> str:
    raw = unicodedata.normalize("NFKD", str(text or ""))
    raw = "".join(ch for ch in raw if not unicodedata.combining(ch)).lower()
    # Preserva marcadores operacionais como !, mas remove pontuação de frase.
    # Assim "!CENTRALDARK," e "aciona !CENTRALDARK." resolvem igual.
    raw = re.sub(r"[^a-z0-9!@/\-\s]+", " ", raw)
    return " ".join(raw.strip().split())


def _phrase_match(normalized: str, phrase: str):
    word = normalize(phrase)
    if not word:
        return None
    hay = normalized.split()
    needle = word.split()
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


def resolve(text: str):
    raw = str(text or "")
    normalized = normalize(raw)
    tokens = normalized.split()

    explicit_master = (
        "!centraldark" in tokens
        or "!central-dark" in tokens
        or "!cdark" in tokens
    )
    delta_match, delta_active, delta_ambiguous = _resolve_delta(normalized)

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
        "status": "MATCH" if explicit_master or delta_active else ("UNKNOWN" if delta_ambiguous else "NO_MATCH"),
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
