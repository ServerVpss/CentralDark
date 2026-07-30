#!/usr/bin/env python3
"""Aplica uma única correção contábil append-only para dois FINAIS legados.

Os registros históricos não são editados. A MetaLupa acrescenta BEGIN + FINAL com
penalidade de -50 XP, equivalente aos dois achievements inválidos de 25 XP.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LEDGER = ROOT / ".agents/skills/meta-lupa/references/uso-ledger.jsonl"
LUPA = ROOT / ".agents/skills/meta-lupa/scripts/meta_lupa.py"
SKILL = ".agents/skills/meta-lupa/SKILL.md"
MISSION = "CORRECAO-XP-LEGADO-AUTOLUPA-20260730"
FINDING_ID = "CD-AUTO-LUPA-XP-LEGACY"
TARGET_HASHES = {
    "6c0eb4a383c69221e5027e2bab20557cfd37b199516c7b198bab5bf0c7d5c1bb",
    "971f1efea856f84ef9056eb1725c869abcd1e61e331f0f64abcb8443e59c18d8",
}


def records() -> list[dict]:
    if not LEDGER.is_file():
        raise RuntimeError("LEDGER_AUSENTE")
    result = []
    for line_number, line in enumerate(LEDGER.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"LEDGER_JSON_INVALIDO:{line_number}") from exc
        if not isinstance(value, dict):
            raise RuntimeError(f"LEDGER_REGISTRO_INVALIDO:{line_number}")
        result.append(value)
    return result


def correction_exists(rows: list[dict]) -> bool:
    return any(
        row.get("event") == "FINAL"
        and row.get("mission_id") == MISSION
        and row.get("xp_gained") == -50
        and "evidencia_inventada" in (row.get("penalties") or [])
        for row in rows
    )


def invalid_targets(rows: list[dict]) -> set[str]:
    found = set()
    for row in rows:
        record_hash = row.get("record_hash")
        if record_hash not in TARGET_HASHES:
            continue
        if (
            row.get("event") == "FINAL"
            and row.get("autolupa_executed") is False
            and row.get("point_fixed_evidential") is True
            and "ponto_fixo_atingido" in (row.get("achievements") or [])
        ):
            found.add(record_hash)
    return found


def git(*args: str) -> str:
    proc = subprocess.run(
        ["git", "-C", str(ROOT), *args],
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if proc.returncode != 0 or not proc.stdout.strip():
        raise RuntimeError(f"GIT_PROOF_UNAVAILABLE:{' '.join(args)}")
    return proc.stdout.strip()


def workspace_branch() -> str:
    for key in ("GITHUB_HEAD_REF", "GITHUB_REF_NAME"):
        value = os.environ.get(key, "").strip()
        if value:
            return value
    value = git("rev-parse", "--abbrev-ref", "HEAD")
    return "detached-head" if value == "HEAD" else value


def run(command: list[str]) -> str:
    proc = subprocess.run(
        command,
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if proc.returncode != 0:
        raise RuntimeError(
            f"META_LUPA_FAILED:{proc.returncode}:"
            f"{proc.stdout.strip()}:{proc.stderr.strip()}"
        )
    return proc.stdout.strip()


def main() -> int:
    before = records()
    if correction_exists(before):
        print(json.dumps({
            "schema": 1,
            "changed": False,
            "finding_id": FINDING_ID,
            "reason": "CORRECAO_JA_EXISTE",
        }, ensure_ascii=False, sort_keys=True))
        return 0

    found = invalid_targets(before)
    if found != TARGET_HASHES:
        missing = sorted(TARGET_HASHES - found)
        print(json.dumps({
            "schema": 1,
            "changed": False,
            "finding_id": FINDING_ID,
            "reason": "ALVOS_LEGADOS_NAO_COMPROVADOS",
            "missing_hashes": missing,
        }, ensure_ascii=False, sort_keys=True), file=sys.stderr)
        return 2

    head = git("rev-parse", "HEAD")
    branch = workspace_branch()
    skill_blob = git("rev-parse", f"HEAD:{SKILL}")
    run_url = os.environ.get("RUN_URL", "https://github.com/ServerVpss/CentralDark/pull/499")

    begin = [
        "python3", str(LUPA), "begin-use",
        "--repo", "ServerVpss/CentralDark",
        "--mission-id", MISSION,
        "--skill-path", SKILL,
        "--skill-ref", "HEAD",
        "--skill-commit-sha", head,
        "--skill-blob-sha", skill_blob,
        "--workspace-branch", branch,
        "--workspace-head", head,
        "--mode", "append-only-accounting-correction",
    ]
    finish = [
        "python3", str(LUPA), "finish-use",
        "--mission-id", MISSION,
        "--verdict", "CORRIGIR",
        "--autolupa", "nao",
        "--point-fixed", "nao",
        "--test-suites", "1",
        "--checks", "2",
        "--test-cases", "2",
        "--pass", "2",
        "--fail", "0",
        "--files-changed", ".agents/skills/meta-lupa/references/uso-ledger.jsonl",
        "--pr", run_url,
        "--evidence",
        "legacy_invalid_records=2",
        "legacy_invalid_xp=50",
        *[f"target_record_hash={value}" for value in sorted(TARGET_HASHES)],
        "--result", "XP_LEGADO_CORRIGIDO_APPEND_ONLY",
        "--mode-used", "SCRIPT + META LUPA",
        "--error-found", "dois ponto_fixo_atingido foram pontuados sem AutoLupa executada",
        "--root-cause", "validação histórica exigia point_fixed=sim mas não exigia autolupa=sim",
        "--counter-evidence", "dois FINAIS canônicos têm autolupa_executed=false e ponto_fixo_atingido",
        "--test-created", "scripts/evolucao/test_autonomia.py",
        "--regression-created", "gate exige point_fixed=sim e autolupa=sim",
        "--false-green-blocked",
        "--guardrail-added", "_validate_achievements exige as duas condições",
        "--improvements", "accounting:append-only", f"fixed:{FINDING_ID}",
        "--penalty", "evidencia_inventada",
    ]

    begin_output = run(begin)
    finish_output = run(finish)
    run(["python3", str(LUPA), "verify-ledger"])

    after = records()
    if not correction_exists(after):
        raise RuntimeError("CORRECAO_NAO_CONFIRMADA_NO_LEDGER")
    correction = next(
        row for row in reversed(after)
        if row.get("event") == "FINAL" and row.get("mission_id") == MISSION
    )
    if correction.get("xp_gained") != -50:
        raise RuntimeError("CORRECAO_XP_DIVERGENTE")

    print(json.dumps({
        "schema": 1,
        "changed": True,
        "finding_id": FINDING_ID,
        "mission_id": MISSION,
        "xp_before": correction.get("xp_before"),
        "xp_gained": correction.get("xp_gained"),
        "xp_after": correction.get("xp_after"),
        "record_hash": correction.get("record_hash"),
        "begin_receipt": begin_output.splitlines()[-1] if begin_output else "",
        "finish_receipt": finish_output.splitlines()[-1] if finish_output else "",
    }, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
