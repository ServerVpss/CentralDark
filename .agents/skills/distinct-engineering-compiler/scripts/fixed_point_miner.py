#!/usr/bin/env python3
import argparse
import hashlib
import json
from copy import deepcopy

LENSES = [
    "provenance",
    "signal",
    "abstraction",
    "remove_domain_lore",
    "semantic_location",
    "capability",
    "owner",
    "consumer",
    "boundary_writer",
    "proof",
    "counterproof",
    "compression",
]

REQUIRED_FOR_CRYSTAL = {
    "source_ref",
    "abstract_function",
    "capability",
    "canonical_owner",
    "consumer",
    "proof_target",
    "counterproof",
}


def _norm(value):
    if value is None:
        return None
    if isinstance(value, str):
        value = " ".join(value.strip().split())
        return value or None
    if isinstance(value, list):
        normalized = [_norm(v) for v in value]
        return sorted({v for v in normalized if v is not None})
    if isinstance(value, dict):
        return {k: _norm(value[k]) for k in sorted(value)}
    return value


def _digest(value):
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _present(item, key):
    value = item.get(key)
    return value not in (None, "", [], {})


def apply_lens(item, lens):
    item = deepcopy(item)
    checks = item.setdefault("lens_checks", {})

    rules = {
        "provenance": ["source_ref"],
        "signal": ["observed_pattern"],
        "abstraction": ["abstract_function"],
        "remove_domain_lore": ["domain_lore_removed"],
        "semantic_location": ["semantic_location"],
        "capability": ["capability"],
        "owner": ["canonical_owner"],
        "consumer": ["consumer"],
        "boundary_writer": ["boundary", "writer_scope"],
        "proof": ["proof_target"],
        "counterproof": ["counterproof"],
        "compression": ["compressed_rule"],
    }

    missing = [key for key in rules[lens] if not _present(item, key)]
    checks[lens] = "PASS" if not missing else "UNKNOWN:" + ",".join(missing)
    return _norm(item)


def classify(item):
    checks = item.get("lens_checks", {})
    if any(str(v).startswith("UNKNOWN") for v in checks.values()):
        if _present(item, "abstract_function") and _present(item, "source_ref"):
            return "GOLD_CANDIDATE"
        return "RAW"
    if all(_present(item, key) for key in REQUIRED_FOR_CRYSTAL):
        return "CRYSTAL"
    return "GOLD_CANDIDATE"


def converge(payload, max_rounds=10):
    items = [_norm(x) for x in payload.get("items", [])]
    if not items:
        return {"status": "BLOCKED_INVALID_INPUT", "error": "items required"}

    state = {"items": items}
    previous = None
    trace = []
    fixed_point = False

    for round_index in range(1, max_rounds + 1):
        order = LENSES if round_index % 2 else list(reversed(LENSES))
        next_items = []
        for raw in state["items"]:
            item = deepcopy(raw)
            for lens in order:
                item = apply_lens(item, lens)
            item["crystal_status"] = classify(item)
            next_items.append(_norm(item))

        next_items.sort(key=lambda x: str(x.get("id", "")))
        state = {"items": next_items}
        digest = _digest(state)
        trace.append(
            {
                "round": round_index,
                "direction": "FORWARD" if round_index % 2 else "REVERSE",
                "lenses": len(order),
                "digest": digest,
            }
        )

        if previous == digest:
            fixed_point = True
            break
        previous = digest

    crystals = [x for x in state["items"] if x.get("crystal_status") == "CRYSTAL"]
    candidates = [x for x in state["items"] if x.get("crystal_status") == "GOLD_CANDIDATE"]
    raw = [x for x in state["items"] if x.get("crystal_status") == "RAW"]

    return {
        "schema": "centraldark.fixed-point-mine.v1",
        "status": "PASS_FIXED_POINT" if fixed_point else "NOT_PROVEN_FIXED_POINT",
        "fixed_point": fixed_point,
        "max_rounds": max_rounds,
        "lenses_per_round": len(LENSES),
        "max_passes": max_rounds * len(LENSES),
        "passes_executed": len(trace) * len(LENSES),
        "trace": trace,
        "counts": {
            "crystal": len(crystals),
            "gold_candidate": len(candidates),
            "raw": len(raw),
        },
        "state": state,
    }


def self_test():
    complete = {
        "id": "goroma-route-recovery",
        "source_ref": "goroma",
        "observed_pattern": "route can degrade; recovery has prerequisites",
        "abstract_function": "degraded-route recovery contract",
        "domain_lore_removed": True,
        "semantic_location": "routing/recovery",
        "capability": "recover_degraded_route",
        "canonical_owner": "existing-routing-owner",
        "consumer": "runtime-router",
        "boundary": "authorized-route-only",
        "writer_scope": "routing/recovery",
        "proof_target": "route restored and remeasured",
        "counterproof": "stale route or missing prerequisite must block",
        "compressed_rule": "ROUTE_DEGRADED -> PREREQUISITES -> RECOVER -> REMEASURE",
    }
    incomplete = {
        "id": "unknown",
        "source_ref": "x",
        "observed_pattern": "something changed",
        "abstract_function": "unknown transfer candidate",
    }

    out = converge({"items": [complete, incomplete]}, max_rounds=10)
    by_id = {x["id"]: x for x in out.get("state", {}).get("items", [])}
    failures = []
    if out.get("status") != "PASS_FIXED_POINT":
        failures.append("fixed_point")
    if by_id.get("goroma-route-recovery", {}).get("crystal_status") != "CRYSTAL":
        failures.append("complete_not_crystal")
    if by_id.get("unknown", {}).get("crystal_status") != "GOLD_CANDIDATE":
        failures.append("incomplete_not_candidate")
    if out.get("passes_executed", 0) > 120:
        failures.append("pass_bound")

    return {
        "status": "PASS" if not failures else "FAIL",
        "failures": failures,
        "observed": out,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input")
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--rounds", type=int, default=10)
    args = parser.parse_args()

    if args.self_test:
        result = self_test()
    else:
        if not args.input:
            result = {"status": "BLOCKED_INVALID_INPUT", "error": "--input required"}
            print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
            return 2
        with open(args.input, encoding="utf-8") as handle:
            result = converge(json.load(handle), max_rounds=max(1, min(args.rounds, 10)))

    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0 if result.get("status") in {"PASS", "PASS_FIXED_POINT"} else 1


if __name__ == "__main__":
    raise SystemExit(main())
