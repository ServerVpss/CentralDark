#!/usr/bin/env python3
import argparse
import json

REQUIRED_TASK_FIELDS = ["task_id", "required_capabilities"]
REQUIRED_CANDIDATE_FIELDS = ["id", "capabilities"]


def normalize_caps(values):
    return sorted({str(v).strip().lower() for v in values if str(v).strip()})


def validate(payload):
    errors = []
    task = payload.get("task", {})
    for field in REQUIRED_TASK_FIELDS:
        if field not in task:
            errors.append(f"TASK_MISSING:{field}")

    candidates = payload.get("candidates")
    if not isinstance(candidates, list) or not candidates:
        errors.append("CANDIDATES_MISSING")
    else:
        for index, candidate in enumerate(candidates):
            for field in REQUIRED_CANDIDATE_FIELDS:
                if field not in candidate:
                    errors.append(f"CANDIDATE_{index}_MISSING:{field}")
    return errors


def route(payload):
    errors = validate(payload)
    if errors:
        return {"status": "BLOCKED_INVALID_INPUT", "errors": errors}

    task = payload["task"]
    required = set(normalize_caps(task["required_capabilities"]))
    optional = set(normalize_caps(task.get("optional_capabilities", [])))
    forbidden = set(normalize_caps(task.get("forbidden_capabilities", [])))
    writer_scope = task.get("writer_scope")
    remaining = set(required)
    selected = []
    rejected = []
    candidates = []

    for candidate in payload["candidates"]:
        candidate_id = str(candidate["id"])
        caps = set(normalize_caps(candidate.get("capabilities", [])))
        available = bool(candidate.get("available", True))
        conflicts = {str(x) for x in candidate.get("writer_conflicts", [])}
        blocked_reason = None

        if not available:
            blocked_reason = "UNAVAILABLE"
        elif writer_scope and writer_scope in conflicts:
            blocked_reason = "WRITER_CONFLICT"
        elif caps & forbidden:
            blocked_reason = "FORBIDDEN_CAPABILITY_PRESENT"

        if blocked_reason:
            rejected.append({"id": candidate_id, "reason": blocked_reason})
            continue
        candidates.append((candidate_id, caps))

    while remaining:
        ranked = []
        for candidate_id, caps in candidates:
            if any(item["id"] == candidate_id for item in selected):
                continue
            cover = remaining & caps
            if not cover:
                continue
            ranked.append(
                (
                    -len(cover),
                    -len(optional & caps),
                    len(caps),
                    candidate_id,
                    cover,
                    caps,
                )
            )

        if not ranked:
            break

        ranked.sort(key=lambda item: (item[0], item[1], item[2], item[3]))
        _, _, _, candidate_id, cover, caps = ranked[0]
        selected.append(
            {
                "id": candidate_id,
                "assigned_capabilities": sorted(cover),
                "all_capabilities": sorted(caps),
            }
        )
        remaining -= cover

    covered = sorted(required - remaining)
    unresolved = sorted(remaining)
    status = "PASS_ROUTE_READY" if not unresolved else "BLOCKED_CAPABILITY_GAP"

    return {
        "schema": "centraldark.capability-contract-route.v1",
        "task_id": str(task["task_id"]),
        "status": status,
        "required_capabilities": sorted(required),
        "covered_capabilities": covered,
        "unresolved_capabilities": unresolved,
        "coverage": {"covered": len(covered), "denominator": len(required)},
        "selected": selected,
        "rejected": rejected,
        "writer_scope": writer_scope,
        "proof_target": task.get("proof_target"),
        "handoff_contract": {
            "required": bool(selected),
            "fields": [
                "task_id",
                "role_contract",
                "target",
                "state",
                "evidence_ref",
                "next_cursor",
            ],
        },
    }


def self_test():
    fixtures = [
        (
            {
                "task": {
                    "task_id": "t1",
                    "required_capabilities": ["deliver", "verify"],
                    "optional_capabilities": ["audit"],
                    "writer_scope": "docs/x",
                    "proof_target": "receipt",
                },
                "candidates": [
                    {"id": "hermes", "capabilities": ["deliver", "verify"]},
                    {"id": "reviewer", "capabilities": ["verify", "audit"]},
                ],
            },
            "PASS_ROUTE_READY",
            ["hermes"],
        ),
        (
            {
                "task": {
                    "task_id": "t2",
                    "required_capabilities": ["deliver", "verify"],
                    "writer_scope": "docs/x",
                },
                "candidates": [{"id": "reader", "capabilities": ["verify"]}],
            },
            "BLOCKED_CAPABILITY_GAP",
            ["reader"],
        ),
        (
            {
                "task": {
                    "task_id": "t3",
                    "required_capabilities": ["deliver"],
                    "writer_scope": "docs/x",
                },
                "candidates": [
                    {
                        "id": "a",
                        "capabilities": ["deliver"],
                        "writer_conflicts": ["docs/x"],
                    },
                    {"id": "b", "capabilities": ["deliver"]},
                ],
            },
            "PASS_ROUTE_READY",
            ["b"],
        ),
    ]

    failures = []
    for index, (payload, expected_status, expected_ids) in enumerate(fixtures, 1):
        output = route(payload)
        selected_ids = [item["id"] for item in output.get("selected", [])]
        if output.get("status") != expected_status or selected_ids != expected_ids:
            failures.append(
                {
                    "fixture": index,
                    "expected_status": expected_status,
                    "expected_ids": expected_ids,
                    "observed": output,
                }
            )

    return {
        "status": "PASS" if not failures else "FAIL",
        "fixtures": len(fixtures),
        "failures": failures,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        output = self_test()
    else:
        if not args.input:
            output = {
                "status": "BLOCKED_INVALID_INPUT",
                "errors": ["--input required"],
            }
            print(json.dumps(output, ensure_ascii=False, indent=2, sort_keys=True))
            return 2
        with open(args.input, encoding="utf-8") as handle:
            output = route(json.load(handle))

    print(json.dumps(output, ensure_ascii=False, indent=2, sort_keys=True))
    return 0 if output.get("status") in {"PASS", "PASS_ROUTE_READY"} else 1


if __name__ == "__main__":
    raise SystemExit(main())
