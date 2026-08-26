#!/usr/bin/env python3
import argparse
import json

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


def normalize(text: str) -> str:
    return " ".join(str(text or "").strip().split())


def resolve(text: str):
    raw = str(text or "")
    normalized = normalize(raw)
    tokens = normalized.lower().split()
    explicit = MASTER.lower() in tokens or "!central-dark" in tokens or "!cdark" in tokens
    return {
        "schema": "centraldark.master-cycle-receipt.v1",
        "input": raw,
        "master_trigger": MASTER,
        "explicit_match": explicit,
        "expanded_chain": CHAIN if explicit else [],
        "status": "MATCH" if explicit else "NO_MATCH",
        "authority_changed": False,
        "mutation_authorized": False,
        "all_phases_considered": explicit,
        "phase_execution_is_adaptive": True,
        "unknown_is_pass": False,
        "graph_is_authority": False,
        "plain_word_centraldark_does_not_trigger": True,
    }


def self_test():
    cases = [
        ("!CENTRALDARK", True),
        ("!centraldark fecha essa missão", True),
        ("!central-dark fecha", True),
        ("!cdark", True),
        ("CentralDark e o nome do repo", False),
        ("fala normal", False),
    ]
    results = []
    for text, expected in cases:
        got = resolve(text)
        ok = got["explicit_match"] is expected
        if expected:
            ok = ok and got["expanded_chain"] == CHAIN
            ok = ok and got["authority_changed"] is False
            ok = ok and got["mutation_authorized"] is False
        results.append({"input": text, "expected": expected, "got": got["explicit_match"], "ok": ok})
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
