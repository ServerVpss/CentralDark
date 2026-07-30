#!/usr/bin/env python3
"""Registra XP na MetaLupa somente para correções comprovadas no mesmo run.

O ledger é alterado em um segundo commit da branch automática. O primeiro commit
contém a correção testada; o recibo de XP aponta para esse SHA exato. Mensagem,
elogio ou análise sem correção não pontuam.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LUPA = ROOT / ".agents" / "skills" / "meta-lupa" / "scripts" / "meta_lupa.py"
SKILL = ".agents/skills/meta-lupa/SKILL.md"
LEDGER = ROOT / ".agents" / "skills" / "meta-lupa" / "references" / "uso-ledger.jsonl"
FALSE_GREEN_IDS = {
    "CD-AUTO-EVOL-SIMULATED",
    "CD-AUTO-EVOL-FAKE-FALLBACK",
    "CD-AUTO-LUPA-AUTOLUPA",
}
NON_REWARDING_FIX_IDS = {
    "CD-AUTO-LUPA-XP-LEGACY",
}


def load(path: str) -> dict:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def git(*args: str) -> str:
    proc = subprocess.run(["git", "-C", str(ROOT), *args], check=False, capture_output=True, text=True)
    if proc.returncode != 0 or not proc.stdout.strip():
        raise RuntimeError(f"GIT_PROOF_UNAVAILABLE:{' '.join(args)}")
    return proc.stdout.strip()


def run(cmd: list[str], env: dict[str, str]) -> None:
    proc = subprocess.run(cmd, cwd=ROOT, env=env, check=False, text=True, capture_output=True)
    if proc.returncode != 0:
        raise RuntimeError(f"META_LUPA_FAILED exit={proc.returncode} stdout={proc.stdout} stderr={proc.stderr}")
    print(proc.stdout.strip())


def safe_agent(value: str) -> str:
    clean = re.sub(r"[^A-Za-z0-9_-]+", "-", value.strip().lower()).strip("-")
    return clean or "desconhecido"


def commands_for(
    *, agent: str, mission_id: str, workspace_head: str, branch: str,
    fixed_ids: list[str], before: dict, after: dict, run_url: str,
    files_changed: list[str], ai_contribution: bool,
) -> tuple[list[str], list[str]]:
    skill_commit = git("rev-parse", "HEAD")
    skill_blob = git("rev-parse", f"HEAD:{SKILL}")
    begin = [
        "python3", str(LUPA), "begin-use",
        "--repo", "ServerVpss/CentralDark",
        "--mission-id", mission_id,
        "--skill-path", SKILL,
        "--skill-ref", "HEAD",
        "--skill-commit-sha", skill_commit,
        "--skill-blob-sha", skill_blob,
        "--workspace-branch", branch,
        "--workspace-head", workspace_head,
        "--mode", "write-authorized-ci",
    ]

    evidence = [
        f"run={run_url}",
        f"correction_sha={workspace_head}",
        f"audit_before={before.get('evidence_sha256', '')}",
        f"audit_after={after.get('evidence_sha256', '')}",
        f"fixed_ids={','.join(fixed_ids)}",
        "tests=PASS",
    ]
    finish = [
        "python3", str(LUPA), "finish-use",
        "--mission-id", mission_id,
        "--verdict", "APROVAR" if after.get("summary", {}).get("blockers", 1) == 0 else "CORRIGIR",
        "--autolupa", "sim" if not ai_contribution and after.get("summary", {}).get("blockers", 1) == 0 else "nao",
        "--point-fixed", "sim" if not ai_contribution and after.get("summary", {}).get("blockers", 1) == 0 else "nao",
        "--test-suites", "1",
        "--checks", "1",
        "--test-cases", os.environ.get("EVOLUCAO_TEST_CASES", "1"),
        "--pass", os.environ.get("EVOLUCAO_TEST_CASES", "1"),
        "--fail", "0",
        "--pr", run_url,
        "--result", "CANDIDATO_VALIDADO_EM_BRANCH",
        "--mode-used", "SCRIPT + IA OPCIONAL + META LUPA",
        "--error-found", ",".join(fixed_ids),
        "--root-cause", "finding_ids reproduzidos e removidos por transformação allowlisted",
        "--counter-evidence", f"antes={before.get('evidence_sha256', '')};depois={after.get('evidence_sha256', '')}",
        "--test-created", "scripts/evolucao/test_autonomia.py",
        "--regression-created", "auditoria antes/depois no mesmo run",
        "--improvements", f"agent:{agent}", *[f"fixed:{item}" for item in fixed_ids],
        "--files-changed", *files_changed,
        "--evidence", *evidence,
    ]
    if ai_contribution:
        finish += ["--achievement", "prova_contraria_encontrada"]
    else:
        finish += ["--achievement", "erro_reproduzido", "--achievement", "causa_raiz_provada"]
        if any(item in FALSE_GREEN_IDS or "WF-DIRECT" in item for item in fixed_ids):
            finish += ["--false-green-blocked", "--achievement", "falso_verde_bloqueado"]
        if after.get("summary", {}).get("blockers", 1) == 0:
            finish += ["--achievement", "ponto_fixo_atingido"]
    return begin, finish


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--before", required=True)
    parser.add_argument("--after", required=True)
    parser.add_argument("--autofix", required=True)
    parser.add_argument("--review", required=True)
    parser.add_argument("--run-url", required=True)
    parser.add_argument("--branch", required=True)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--files-changed", nargs="*", default=[])
    parser.add_argument("--output", default=".artifacts/evolucao/xp.json")
    args = parser.parse_args()

    before, after, autofix, review = map(load, (args.before, args.after, args.autofix, args.review))
    before_ids = {item["id"] for item in before.get("findings", [])}
    after_ids = {item["id"] for item in after.get("findings", [])}
    applied_ids = {item["id"] for item in autofix.get("fixes", [])}
    fixed_ids = sorted((before_ids - after_ids) & applied_ids)
    non_rewarding = sorted(set(fixed_ids) & NON_REWARDING_FIX_IDS)
    rewardable_ids = sorted(set(fixed_ids) - NON_REWARDING_FIX_IDS)
    payload = {
        "schema": 1,
        "fixed_ids": fixed_ids,
        "rewardable_fixed_ids": rewardable_ids,
        "non_rewarding_fixed_ids": non_rewarding,
        "contributors": [],
        "awarded": False,
    }
    output = ROOT / args.output
    output.parent.mkdir(parents=True, exist_ok=True)

    if not fixed_ids:
        output.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print("XP_SKIPPED_NO_PROVEN_FIX")
        return 0
    if os.environ.get("TESTS_PASS") != "true":
        raise RuntimeError("XP_BLOCKED_TESTS_NOT_PROVEN")
    if not rewardable_ids:
        payload["reason"] = "ACCOUNTING_CORRECTION_DOES_NOT_EARN_XP"
        output.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print("XP_SKIPPED_ACCOUNTING_CORRECTION")
        return 0

    contributors = [("script", False)]
    confirmed = set(review.get("confirmed_finding_ids", []))
    if review.get("mode") == "IA" and confirmed.intersection(rewardable_ids):
        contributors.append((safe_agent(review.get("agent", "ia")), True))

    workspace_head = git("rev-parse", "HEAD")
    files_changed = [item for item in args.files_changed if item]
    if not files_changed:
        files_changed = [line for line in git("diff", "--name-only", "HEAD^", "HEAD").splitlines() if line]
    command_sets = []
    for agent, ai_contribution in contributors:
        mission = f"AUTO-EVOLUCAO-{agent.upper()}-{args.run_id}"
        command_sets.append((agent, ai_contribution, *commands_for(
            agent=agent, mission_id=mission, workspace_head=workspace_head,
            branch=args.branch, fixed_ids=rewardable_ids, before=before, after=after,
            run_url=args.run_url, files_changed=files_changed,
            ai_contribution=ai_contribution,
        )))

    with tempfile.TemporaryDirectory() as tmp:
        temp_ledger = Path(tmp) / "uso-ledger.jsonl"
        if LEDGER.exists():
            shutil.copy2(LEDGER, temp_ledger)
        else:
            temp_ledger.write_text("", encoding="utf-8")
        dry_env = dict(os.environ, LUPA_LEDGER_PATH=str(temp_ledger))
        for _, _, begin, finish in command_sets:
            run(begin, dry_env)
            run(finish, dry_env)

    real_env = dict(os.environ)
    for agent, ai_contribution, begin, finish in command_sets:
        run(begin, real_env)
        run(finish, real_env)
        payload["contributors"].append({"agent": agent, "type": "IA" if ai_contribution else "SCRIPT"})
    payload["awarded"] = True
    payload["correction_sha"] = workspace_head
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
