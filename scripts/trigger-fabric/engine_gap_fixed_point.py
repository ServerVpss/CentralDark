#!/usr/bin/env python3
"""Bounded self-healing loop for CentralDark engine-gap closure.

This controller reuses engine_gap_probe and never promotes UNKNOWN to PASS.
It may remeasure automatically, but it does not restart services, deploy, merge,
change credentials, or mutate production. External frontiers remain explicit.
"""
from __future__ import annotations

import argparse
import json
import time
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional, Tuple

import engine_gap_probe

PASS = "PASS"
FAIL = "FAIL"
UNKNOWN = "UNKNOWN"
BLOCKED = "BLOCKED"


@dataclass
class FixedPointReceipt:
    state: str
    round: int
    fixed_point: bool
    selected_engine: Optional[str]
    unknowns: List[str]
    failures: List[str]
    conditions: Dict[str, bool]
    next_cursor: str
    observed_head: Optional[str]
    observed_branch: Optional[str]


def verdict(value: Any) -> str:
    raw = str(value or UNKNOWN).strip().upper()
    return raw if raw in {PASS, FAIL, UNKNOWN, BLOCKED} else UNKNOWN


def choose_engine(cards: Dict[str, Any]) -> Optional[str]:
    """Choose only from locally observed configured cards; no hidden fallback."""
    order = ("claude-code", "openai", "hermes")
    for name in order:
        card = cards.get(name)
        if isinstance(card, dict) and bool(card.get("configured")):
            return name
    for name in sorted(cards):
        card = cards.get(name)
        if isinstance(card, dict) and bool(card.get("configured")):
            return name
    return None


def evaluate(
    report: Dict[str, Any],
    *,
    writer: str,
    ci_verdict: str,
    counterproof: str,
    provider_invocation: str,
    boundary_guard_bound: bool = True,
    round_no: int = 1,
) -> FixedPointReceipt:
    claims = report.get("claims") if isinstance(report, dict) else {}
    claims = claims if isinstance(claims, dict) else {}
    cards = report.get("engine_capability_cards") if isinstance(report, dict) else {}
    cards = cards if isinstance(cards, dict) else {}
    repo = report.get("repository") if isinstance(report, dict) else {}
    repo = repo if isinstance(repo, dict) else {}

    runtime = verdict(claims.get("router_runtime_observed"))
    ci = verdict(ci_verdict)
    cp = verdict(counterproof)
    invocation = verdict(provider_invocation)
    writer_value = (writer or "UNKNOWN").strip()
    writer_resolved = writer_value.upper() not in {"", "UNKNOWN", "NONE"}
    selected_engine = choose_engine(cards)

    engine_card_matches = bool(selected_engine) and runtime == PASS
    no_material_unknown = all(
        [
            runtime != UNKNOWN,
            ci != UNKNOWN,
            cp != UNKNOWN,
            invocation != UNKNOWN,
            writer_resolved,
        ]
    )

    conditions = {
        "BOUNDARY_GUARD_BOUND": bool(boundary_guard_bound),
        "WRITER_RESOLVED_FOR_MUTATION": writer_resolved,
        "RUNTIME_CLAIM_MEASURED": runtime == PASS,
        "CI_CLAIM_HAS_APPLICABLE_EVIDENCE": ci == PASS,
        "ENGINE_CARD_MATCHES_OBSERVED_STATE": engine_card_matches,
        "PROVIDER_INVOCATION_PROVEN": invocation == PASS,
        "COUNTERPROOF_SURVIVED": cp == PASS,
        "NO_MATERIAL_UNKNOWN_FOR_VERDICT": no_material_unknown,
    }

    unknowns: List[str] = []
    failures: List[str] = []

    if not writer_resolved:
        unknowns.append("WRITER_UNKNOWN")
    if runtime == UNKNOWN:
        unknowns.append("RUNTIME_UNMEASURED")
    elif runtime == FAIL:
        failures.append("RUNTIME_FAILED")
    if ci == UNKNOWN:
        unknowns.append("CI_NO_STATUS")
    elif ci == FAIL:
        failures.append("CI_FAILED")
    if invocation == UNKNOWN:
        unknowns.append("ENGINE_INVOCATION_UNKNOWN")
    elif invocation == FAIL:
        failures.append("ENGINE_INVOCATION_FAILED")
    if cp == UNKNOWN:
        unknowns.append("COUNTERPROOF_UNKNOWN")
    elif cp == FAIL:
        failures.append("COUNTERPROOF_FAILED")
    if not selected_engine:
        unknowns.append("ENGINE_CAPABILITY_UNKNOWN")
    if not boundary_guard_bound:
        failures.append("BOUNDARY_GUARD_UNBOUND")

    fixed = all(conditions.values()) and not unknowns and not failures
    if fixed:
        state = "ENGINE_GAP_FIXED_POINT"
        next_cursor = "RECEIPT_AND_NEXT_ACORDAR"
    elif failures:
        state = "REMEDIATE"
        next_cursor = "EXISTING_OWNER_MINIMUM_DELTA_RETEST"
    else:
        state = "HUMAN_OR_EXTERNAL_FRONTIER"
        next_cursor = "MEASURE_MISSING_EVIDENCE"

    return FixedPointReceipt(
        state=state,
        round=round_no,
        fixed_point=fixed,
        selected_engine=selected_engine,
        unknowns=sorted(set(unknowns)),
        failures=sorted(set(failures)),
        conditions=conditions,
        next_cursor=next_cursor,
        observed_head=repo.get("head"),
        observed_branch=repo.get("branch"),
    )


def signature(receipt: FixedPointReceipt) -> Tuple[Any, ...]:
    return (
        receipt.state,
        receipt.selected_engine,
        tuple(receipt.unknowns),
        tuple(receipt.failures),
        tuple(sorted(receipt.conditions.items())),
        receipt.observed_head,
        receipt.observed_branch,
    )


def run_loop(
    *,
    health_url: str,
    timeout: float,
    max_rounds: int,
    interval: float,
    writer: str,
    ci_verdict: str,
    counterproof: str,
    provider_invocation: str,
) -> Dict[str, Any]:
    history: List[Dict[str, Any]] = []
    previous: Optional[Tuple[Any, ...]] = None

    for round_no in range(1, max_rounds + 1):
        report = engine_gap_probe.build_report(health_url, timeout)
        receipt = evaluate(
            report,
            writer=writer,
            ci_verdict=ci_verdict,
            counterproof=counterproof,
            provider_invocation=provider_invocation,
            round_no=round_no,
        )
        history.append(asdict(receipt))

        if receipt.fixed_point:
            return {
                "loop": "SELF_HEALING_FAILURE_LOOP",
                "status": "FIXED_POINT",
                "rounds": round_no,
                "receipt": asdict(receipt),
                "history": history,
            }

        current = signature(receipt)
        if previous == current:
            return {
                "loop": "SELF_HEALING_FAILURE_LOOP",
                "status": "NO_NEW_INFORMATION",
                "rounds": round_no,
                "receipt": asdict(receipt),
                "history": history,
                "rule": "SAME_FAILURE_NO_NEW_INFO -> STOP_AND_PRESERVE_FRONTIER",
            }
        previous = current

        if receipt.failures:
            return {
                "loop": "SELF_HEALING_FAILURE_LOOP",
                "status": "REMEDIATION_REQUIRED",
                "rounds": round_no,
                "receipt": asdict(receipt),
                "history": history,
                "rule": "MUTATION_REQUIRES_EXISTING_OWNER_AND_AUTHORIZED_SAFE_ZONE",
            }

        if round_no < max_rounds and interval > 0:
            time.sleep(interval)

    return {
        "loop": "SELF_HEALING_FAILURE_LOOP",
        "status": "MAX_ROUNDS_WITHOUT_FIXED_POINT",
        "rounds": max_rounds,
        "receipt": history[-1] if history else None,
        "history": history,
    }


def self_test() -> int:
    good_report = {
        "repository": {"head": "abc", "branch": "feature", "measured": True},
        "claims": {"router_runtime_observed": PASS},
        "engine_capability_cards": {
            "claude-code": {"configured": True, "router_reachable": True},
        },
    }
    unknown_writer_report = dict(good_report)
    bad_runtime_report = {
        "repository": {"head": "abc", "branch": "feature", "measured": True},
        "claims": {"router_runtime_observed": UNKNOWN},
        "engine_capability_cards": {},
    }

    positive = evaluate(
        good_report,
        writer="SOL/ChatGPT",
        ci_verdict=PASS,
        counterproof=PASS,
        provider_invocation=PASS,
    )
    negative_writer = evaluate(
        unknown_writer_report,
        writer="UNKNOWN",
        ci_verdict=PASS,
        counterproof=PASS,
        provider_invocation=PASS,
    )
    negative_runtime = evaluate(
        bad_runtime_report,
        writer="SOL/ChatGPT",
        ci_verdict=PASS,
        counterproof=PASS,
        provider_invocation=UNKNOWN,
    )

    checks = {
        "positive_reaches_fixed_point": positive.fixed_point is True
        and positive.state == "ENGINE_GAP_FIXED_POINT",
        "unknown_writer_blocks_false_green": negative_writer.fixed_point is False
        and "WRITER_UNKNOWN" in negative_writer.unknowns,
        "unknown_runtime_blocks_false_green": negative_runtime.fixed_point is False
        and "RUNTIME_UNMEASURED" in negative_runtime.unknowns,
        "invocation_must_be_proven": negative_runtime.conditions["PROVIDER_INVOCATION_PROVEN"] is False,
        "fixed_point_has_no_unknowns": positive.unknowns == [] and positive.failures == [],
    }
    failed = [name for name, ok in checks.items() if not ok]
    print(json.dumps({"ok": not failed, "checks": checks, "failed": failed}, sort_keys=True))
    return 1 if failed else 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--health-url", default=engine_gap_probe.DEFAULT_HEALTH_URL)
    parser.add_argument("--timeout", type=float, default=2.5)
    parser.add_argument("--max-rounds", type=int, default=3)
    parser.add_argument("--interval", type=float, default=1.0)
    parser.add_argument("--writer", default="UNKNOWN")
    parser.add_argument("--ci-verdict", default=UNKNOWN)
    parser.add_argument("--counterproof", default=UNKNOWN)
    parser.add_argument("--provider-invocation", default=UNKNOWN)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    result = run_loop(
        health_url=args.health_url,
        timeout=args.timeout,
        max_rounds=max(1, args.max_rounds),
        interval=max(0.0, args.interval),
        writer=args.writer,
        ci_verdict=args.ci_verdict,
        counterproof=args.counterproof,
        provider_invocation=args.provider_invocation,
    )
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result.get("status") == "FIXED_POINT" else 2


if __name__ == "__main__":
    raise SystemExit(main())
