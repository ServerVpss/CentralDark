#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LEDGER = ROOT / ".agents/skills/meta-lupa/references/uso-ledger.jsonl"


def canonical_bytes(obj: dict) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def with_hash(row: dict) -> dict:
    payload = dict(row)
    payload["record_hash"] = hashlib.sha256(canonical_bytes(payload)).hexdigest()
    return payload


def git(*args: str) -> str:
    return subprocess.check_output(["git", "-C", str(ROOT), *args], text=True).strip()


rows = [json.loads(line) for line in LEDGER.read_text(encoding="utf-8").splitlines() if line.strip()]
existing_ids = {row.get("usage_id") for row in rows}
now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
current_head = git("rev-parse", "HEAD")
current_branch = git("branch", "--show-current")

corrections = [
    {
        "schema_version": 1,
        "event": "CORRECTION",
        "usage_id": "pr585-ledger-correction-open-threads-20260803",
        "finished_at_utc": now,
        "repo": "ServerVpss/CentralDark",
        "mission_id": "PR585-META-LUPA-CONFORMANCE-01",
        "workspace_branch": current_branch,
        "workspace_head": current_head,
        "target_usage_id": "29c375c66d5bd3af3f6aa1dc064411e1d4a989b4ed064d32d8ed413475d4a33e",
        "target_record_hash": "03f080a6dc10053017b39956d60d4d1bdf7b56e4a80c23ad567015e5c3d1ac71",
        "verdict": "CONDICIONAR",
        "result": "HISTORICAL_APPROVAL_REVOKED_PENDING_FRESH_CURRENT_HEAD_GATE",
        "error_found": "O FINAL corrigido declarava zero risco e ciclo fechado enquanto a própria evidência registrava 15 review threads não resolvidas.",
        "corrections": [
            "revogada semanticamente a aprovação histórica sem contraprova",
            "threads de código corrigidas no HEAD atual e resolvidas após 209 testes",
            "promoção atual depende exclusivamente de checks e review threads do HEAD vigente",
        ],
        "new_defect_ids": [
            "PR585_LEDGER_FALSE_ZERO_THREADS",
            "PR585_STALE_BODY_AND_OPEN_THREADS",
        ],
        "residual_risk": [
            "o registro histórico permanece imutável e deve ser lido junto desta correção append-only",
            "esta correção não promove o PR; exige gate fresco no HEAD atual",
        ],
        "evidence_manifest": {
            "schema": "centraldark.ledger-correction-evidence.v1",
            "validated_code_head": "6aa81d64fa8b6fdaefc19493e0145220cc3fee79",
            "workflow_run_id": 30861168731,
            "workflow_job_id": 91843233579,
            "tests": {"passed": 209, "skipped": 4, "failed": 0},
            "current_head_when_recorded": current_head,
            "non_ledger_review_threads_open": 0,
        },
        "point_fixed_evidential": False,
        "autolupa_executed": True,
    },
    {
        "schema_version": 1,
        "event": "CORRECTION",
        "usage_id": "pr585-ledger-correction-proof-head-20260803",
        "finished_at_utc": now,
        "repo": "ServerVpss/CentralDark",
        "mission_id": "PR585-OPERATION-RECEIPT-HARDENING",
        "workspace_branch": current_branch,
        "workspace_head": current_head,
        "target_usage_id": "8ba63e268c922925ad7861e74ef000ba81339a4c878259fe3b119c6a6d19d7bd",
        "target_record_hash": "1ee53808e42f887ff7313e8d45b86fe4bc0de59fa2ed157f9cfbf66c43175e01",
        "verdict": "CONDICIONAR",
        "result": "HISTORICAL_PROOF_REBOUND_TO_COMMIT_CONTAINING_TEST_SUITE",
        "error_found": "O FINAL histórico citava uma suíte e 23 casos ausentes no head_sha registrado.",
        "corrections": [
            "retirada a validade promocional do FINAL histórico",
            "prova reproduzível vinculada ao commit que contém implementação, testes e documentação",
            "resultado atual permanece condicionado ao gate fresco do HEAD do PR",
        ],
        "new_defect_ids": ["PR585_LEDGER_TEST_SUITE_HEAD_MISMATCH"],
        "residual_risk": [
            "o FINAL histórico não deve ser usado como aprovação",
            "qualquer promoção exige receipt fresco preso ao mesmo HEAD testado e revisado",
        ],
        "evidence_manifest": {
            "schema": "centraldark.ledger-correction-evidence.v1",
            "path": ".agents/skills/meta-lupa/testes/test_operation_receipt_validator.py",
            "producer": "GitHub Actions / lupa-conformance",
            "command": "pytest .agents/skills/meta-lupa/testes -q",
            "validated_code_head": "6aa81d64fa8b6fdaefc19493e0145220cc3fee79",
            "workflow_run_id": 30861168731,
            "workflow_job_id": 91843233579,
            "tests": {"passed": 209, "skipped": 4, "failed": 0},
            "current_head_when_recorded": current_head,
            "judge_verdict": "CONDICIONAR_HISTORICAL_RECORD; CURRENT_HEAD_GATE_REQUIRED",
        },
        "point_fixed_evidential": False,
        "autolupa_executed": True,
    },
]

new_rows = [with_hash(row) for row in corrections if row["usage_id"] not in existing_ids]
if not new_rows:
    print("LEDGER_CORRECTIONS=ALREADY_PRESENT")
    raise SystemExit(0)

with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
    for row in new_rows:
        handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")

print(f"LEDGER_CORRECTIONS_APPENDED={len(new_rows)}")
