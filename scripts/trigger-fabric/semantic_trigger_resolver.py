#!/usr/bin/env python3
import argparse
import json
import re
import unicodedata

TRIGGERS = {
    "ACORDAR": {
        "canonical": "#ACORDAR",
        "aliases": ["#acordar", "#acorda", "acordar", "acorda", "acordou", "acord"],
        "symbols": ["☼"],
    },
    "CALIBRAR": {
        "canonical": "!CALIBRAR",
        "aliases": ["!calibrar", "#calibrar", "calibrar", "calibar", "calibar", "calibr", "calibre"],
        "symbols": ["⚙"],
    },
    "MULTIBUSSOLA": {
        "canonical": "!MULTIBUSSOLA",
        "aliases": ["!multibussola", "!multi-bussola", "multibussola", "multi bussola", "multibuss", "bussola"],
        "symbols": ["🧭"],
    },
    "META_LUPA": {
        "canonical": "!META_LUPA",
        "aliases": ["!meta_lupa", "!metalupa", "meta lupa", "metalupa", "meta-lupa", "meta lupe", "meta lupe", "lupa meta"],
        "symbols": ["⊛"],
    },
}

MAX_TOKEN_EDIT_DISTANCE = 2


def strip_accents(text):
    return "".join(c for c in unicodedata.normalize("NFKD", text) if not unicodedata.combining(c))


def normalize(text):
    text = strip_accents(str(text).lower())
    text = re.sub(r"[_-]+", " ", text)
    text = re.sub(r"[^a-z0-9#!\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def levenshtein(a, b):
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, start=1):
        cur = [i]
        for j, cb in enumerate(b, start=1):
            cur.append(min(cur[-1] + 1, prev[j] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def tokenize(text):
    return [t for t in re.findall(r"[#!]?[a-z0-9]+", normalize(text)) if t]


def alias_tokens(alias):
    return tokenize(alias)


def fuzzy_token_match(token, alias_token):
    a = token.lstrip("#!")
    b = alias_token.lstrip("#!")
    if min(len(a), len(b)) < 5:
        return False
    return levenshtein(a, b) <= MAX_TOKEN_EDIT_DISTANCE


def resolve(text):
    raw = str(text)
    normalized = normalize(raw)
    tokens = tokenize(raw)
    matches = []

    for trigger_id, spec in TRIGGERS.items():
        reasons = []
        score = 0

        for symbol in spec["symbols"]:
            if symbol in raw:
                reasons.append(f"SYMBOL:{symbol}")
                score = max(score, 100)

        canonical_norm = normalize(spec["canonical"])
        if canonical_norm and canonical_norm in normalized:
            reasons.append(f"CANONICAL:{spec['canonical']}")
            score = max(score, 100)

        for alias in spec["aliases"]:
            an = normalize(alias)
            if not an:
                continue
            if an in normalized:
                reasons.append(f"ALIAS:{alias}")
                score = max(score, 90)
                continue
            ats = alias_tokens(alias)
            if len(ats) == 1 and any(fuzzy_token_match(t, ats[0]) for t in tokens):
                reasons.append(f"FUZZY_TOKEN:{alias}")
                score = max(score, 70)

        if score:
            matches.append({
                "id": trigger_id,
                "canonical": spec["canonical"],
                "score": score,
                "reasons": sorted(set(reasons)),
            })

    matches.sort(key=lambda x: (-x["score"], x["id"]))
    return {
        "schema": "centraldark.semantic-trigger-receipt.v1",
        "input": raw,
        "normalized": normalized,
        "matches": matches,
        "recognized": [m["id"] for m in matches],
        "status": "MATCH" if matches else "NO_MATCH",
        "authority_changed": False,
        "auto_mutation": False,
    }


def self_test():
    cases = [
        ("#ACORDAR !CALIBRAR", {"ACORDAR", "CALIBRAR"}),
        ("!calibar #acordar", {"ACORDAR", "CALIBRAR"}),
        ("⊛ melhora a meta lupe", {"META_LUPA"}),
        ("🧭 olha por todos os lados", {"MULTIBUSSOLA"}),
        ("texto comum sem gatilho", set()),
    ]
    results = []
    for text, expected in cases:
        got = set(resolve(text)["recognized"])
        ok = expected.issubset(got) and (expected or not got)
        results.append({"input": text, "expected": sorted(expected), "got": sorted(got), "ok": ok})
    return {"ok": all(r["ok"] for r in results), "cases": results}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--text")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        out = self_test()
    elif args.text is not None:
        out = resolve(args.text)
    else:
        raise SystemExit("use --text or --self-test")
    print(json.dumps(out, ensure_ascii=False, indent=2))
    if args.self_test and not out["ok"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
