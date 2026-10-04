#!/usr/bin/env python3
"""Adapter fino do !BOOT-FORJA-TOTAL para o motor canônico existente.

Não cria segundo cérebro, runner lógico ou Judge. O alias resolve para
!CENTRALDARK e exige que FIXED_POINT continue dentro da cadeia canônica.
"""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
MASTER_PATH = HERE / "centraldark_master_cycle.py"


def load_master():
    spec = importlib.util.spec_from_file_location("centraldark_master_cycle", MASTER_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def resolve_forja_total() -> dict:
    master = load_master()
    receipt = master.resolve("!CENTRALDARK", chefe_source=True)
    chain = list(receipt.get("expanded_chain") or [])
    ok = bool(
        receipt.get("master_cycle_active")
        and "FIXED_POINT" in chain
        and chain[-4:] == ["REGISTRA", "RASTRO", "HANDOFF", "BOOT"]
    )
    return {
        "schema": "centraldark.boot-forja-total.v1",
        "status": "PASS" if ok else "BLOCKED",
        "requested_trigger": "!BOOT-FORJA-TOTAL",
        "canonical_trigger": "!CENTRALDARK",
        "profile": "FORJA_TOTAL",
        "creates_second_brain": False,
        "creates_second_judge": False,
        "creates_second_fixed_point_runner": False,
        "chain": chain,
        "bindings": {
            "trigger_fabric": "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml",
            "fixed_point": "apps/modulos/fixed-point-fabric/",
            "forja_viva": "docs/ARQUITETURA/CENTRALDARK-FORJA-VIVA/",
            "drive_ingest": "CentralDark-SyncDrive -> scripts/drive-ingest-once.sh -> scripts/memory-linker/inbox",
            "dependabot": ".github/workflows/dependabot-auto-merge.yml",
            "reality_judge": "REALITY",
        },
        "runtime_is_proven_by_this_adapter": False,
        "unknown_is_pass": False,
    }


if __name__ == "__main__":
    result = resolve_forja_total()
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["status"] == "PASS" else 2)
