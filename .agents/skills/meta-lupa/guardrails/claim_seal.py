#!/usr/bin/env python3
"""Lacre determinístico para claims já provados.

Este guardrail pertence à META_LUPA existente. Não cria engine paralelo.

Objetivo:
- impedir que um claim não temporal já provado volte como pendência sem causa nova;
- preservar claims temporais como HISTORICAL, exigindo remedição para CURRENT;
- bloquear selo sem prova e reabertura sem causa rastreável;
- oferecer lookup determinístico para o preflight do HERMES.

Uso:
  python guardrails/claim_seal.py --self-test
  python guardrails/claim_seal.py validate references/claim-seals.jsonl
  python guardrails/claim_seal.py lookup references/claim-seals.jsonl --claim-key <KEY>
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1
EVENTS = {"SEAL", "REOPEN", "SUPERSEDE"}
PROOF_CLASSES = {
    "SOURCE",
    "TEST",
    "CI",
    "RUNTIME",
    "HISTORICAL_RUNTIME",
    "PACKAGE",
    "UPSTREAM_RELEASE",
    "CONTRACT",
}


class SealError(ValueError):
    pass


def _require_text(rec: dict[str, Any], field: str) -> str:
    value = rec.get(field)
    if not isinstance(value, str) or not value.strip():
        raise SealError(f"{field} ausente/vazio")
    return value.strip()


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        raise SealError(f"ledger ausente: {path}")
    rows: list[dict[str, Any]] = []
    for lineno, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        raw = raw.strip()
        if not raw:
            continue
        try:
            rec = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise SealError(f"JSON inválido linha {lineno}") from exc
        if not isinstance(rec, dict):
            raise SealError(f"linha {lineno}: registro não é objeto")
        rec["_line"] = lineno
        rows.append(rec)
    return rows


def validate_rows(rows: list[dict[str, Any]]) -> dict[str, Any]:
    state: dict[str, dict[str, Any]] = {}
    errors: list[str] = []
    seals = reopens = supersedes = 0

    for rec in rows:
        line = rec.get("_line", "?")
        try:
            if rec.get("schema_version") != SCHEMA_VERSION:
                raise SealError(f"schema_version deve ser {SCHEMA_VERSION}")
            event = _require_text(rec, "event")
            if event not in EVENTS:
                raise SealError(f"event inválido: {event}")
            key = _require_text(rec, "claim_key")

            if event == "SEAL":
                seals += 1
                _require_text(rec, "claim")
                _require_text(rec, "scope")
                _require_text(rec, "target")
                proof_class = _require_text(rec, "proof_class")
                if proof_class not in PROOF_CLASSES:
                    raise SealError(f"proof_class inválido: {proof_class}")
                evidence = rec.get("evidence_refs")
                if not isinstance(evidence, list) or not evidence or not all(isinstance(x, str) and x.strip() for x in evidence):
                    raise SealError("SEAL exige evidence_refs não vazio")
                temporal = rec.get("temporal")
                if not isinstance(temporal, bool):
                    raise SealError("SEAL exige temporal booleano")
                no_reexecute = rec.get("no_reexecute_without_reopen")
                if not isinstance(no_reexecute, bool):
                    raise SealError("SEAL exige no_reexecute_without_reopen booleano")
                if temporal and no_reexecute:
                    raise SealError("claim temporal não pode bloquear remedição CURRENT")
                if not temporal and not no_reexecute:
                    raise SealError("claim não temporal selado deve bloquear reexecução sem REOPEN")
                previous = state.get(key)
                if previous and previous["state"] == "SEALED":
                    raise SealError("claim já está SEALED; use REOPEN/SUPERSEDE antes de novo SEAL")
                state[key] = {"state": "SEALED", "record": rec}

            elif event == "REOPEN":
                reopens += 1
                cause_ref = _require_text(rec, "cause_ref")
                previous = state.get(key)
                if not previous or previous["state"] != "SEALED":
                    raise SealError("REOPEN exige claim previamente SEALED")
                state[key] = {"state": "REOPENED", "cause_ref": cause_ref, "record": rec}

            elif event == "SUPERSEDE":
                supersedes += 1
                _require_text(rec, "superseded_by")
                previous = state.get(key)
                if not previous:
                    raise SealError("SUPERSEDE exige claim conhecido")
                state[key] = {"state": "SUPERSEDED", "record": rec}

        except SealError as exc:
            errors.append(f"linha {line}: {exc}")

    return {
        "ok": not errors,
        "records": len(rows),
        "seals": seals,
        "reopens": reopens,
        "supersedes": supersedes,
        "active": state,
        "errors": errors,
    }


def lookup(rows: list[dict[str, Any]], claim_key: str) -> dict[str, Any]:
    result = validate_rows(rows)
    if not result["ok"]:
        return {"status": "BLOCKED_INVALID_LEDGER", "errors": result["errors"]}
    current = result["active"].get(claim_key)
    if not current:
        return {"status": "UNSEEN", "claim_key": claim_key, "action": "INVESTIGATE"}
    state = current["state"]
    rec = current.get("record") or {}
    if state == "SEALED":
        if rec.get("temporal"):
            return {
                "status": "HISTORICAL_SEAL",
                "claim_key": claim_key,
                "action": "REMEASURE_CURRENT",
                "evidence_refs": rec.get("evidence_refs", []),
            }
        return {
            "status": "SEALED",
            "claim_key": claim_key,
            "action": "NO_REEXECUTE_UNLESS_REOPEN_CAUSE",
            "evidence_refs": rec.get("evidence_refs", []),
        }
    if state == "REOPENED":
        return {
            "status": "REOPENED",
            "claim_key": claim_key,
            "action": "INVESTIGATE_CAUSAL_DELTA",
            "cause_ref": current.get("cause_ref"),
        }
    return {"status": "SUPERSEDED", "claim_key": claim_key, "action": "FOLLOW_SUPERSEDING_CLAIM"}


def self_test() -> None:
    base = {
        "schema_version": 1,
        "event": "SEAL",
        "claim_key": "OWNER::SOURCE::EXISTS",
        "claim": "owner existe no source",
        "scope": "SOURCE",
        "target": "path",
        "proof_class": "SOURCE",
        "evidence_refs": ["sha:abc"],
        "temporal": False,
        "no_reexecute_without_reopen": True,
    }
    ok = validate_rows([dict(base, _line=1)])
    assert ok["ok"]
    assert lookup([dict(base, _line=1)], base["claim_key"])["status"] == "SEALED"

    duplicate = validate_rows([dict(base, _line=1), dict(base, _line=2)])
    assert not duplicate["ok"]

    temporal_bad = dict(base, claim_key="RUNTIME::HEALTH", proof_class="HISTORICAL_RUNTIME", temporal=True)
    assert not validate_rows([dict(temporal_bad, _line=1)])["ok"]

    temporal_ok = dict(temporal_bad, no_reexecute_without_reopen=False)
    assert validate_rows([dict(temporal_ok, _line=1)])["ok"]
    assert lookup([dict(temporal_ok, _line=1)], temporal_ok["claim_key"])["status"] == "HISTORICAL_SEAL"

    reopen = {
        "schema_version": 1,
        "event": "REOPEN",
        "claim_key": base["claim_key"],
        "cause_ref": "sha:def",
    }
    assert validate_rows([dict(base, _line=1), dict(reopen, _line=2)])["ok"]
    assert lookup([dict(base, _line=1), dict(reopen, _line=2)], base["claim_key"])["status"] == "REOPENED"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--self-test", action="store_true")
    sub = ap.add_subparsers(dest="cmd")
    p_val = sub.add_parser("validate")
    p_val.add_argument("ledger")
    p_lookup = sub.add_parser("lookup")
    p_lookup.add_argument("ledger")
    p_lookup.add_argument("--claim-key", required=True)
    args = ap.parse_args()

    if args.self_test:
        self_test()
        print("CLAIM_SEAL_SELF_TEST=PASS")
        return 0
    if args.cmd == "validate":
        try:
            result = validate_rows(load_jsonl(Path(args.ledger)))
        except SealError as exc:
            print(json.dumps({"status": "BLOCKED", "error": str(exc)}, ensure_ascii=False))
            return 2
        print(json.dumps({k: v for k, v in result.items() if k != "active"}, ensure_ascii=False, sort_keys=True))
        return 0 if result["ok"] else 1
    if args.cmd == "lookup":
        try:
            out = lookup(load_jsonl(Path(args.ledger)), args.claim_key)
        except SealError as exc:
            out = {"status": "BLOCKED", "error": str(exc)}
        print(json.dumps(out, ensure_ascii=False, sort_keys=True))
        return 0 if not out["status"].startswith("BLOCKED") else 2
    ap.print_help()
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
