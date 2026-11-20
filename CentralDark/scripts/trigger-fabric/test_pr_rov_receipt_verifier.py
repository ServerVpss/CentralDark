#!/usr/bin/env python3
"""Testes positivos e negativos do verificador de recibos ROV.

Owner: scripts/trigger-fabric/pr_rov_audit.py (verify_receipt)
Contrato: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PR-MERGE-RECONCILIATION-ROV.yml

Execução determinística, sem rede e sem IA:
    python3 scripts/trigger-fabric/test_pr_rov_receipt_verifier.py
"""
from __future__ import annotations

import copy
import importlib.util
import pathlib
import tempfile
import unittest

import yaml

HERE = pathlib.Path(__file__).resolve().parent
MODULE_PATH = HERE / "pr_rov_audit.py"
SPEC = importlib.util.spec_from_file_location("pr_rov_audit", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)

CONTRACT_PATH = (
    HERE.parents[1]
    / "docs"
    / "ARQUITETURA"
    / "CENTRALDARK-TRIGGER-FABRIC"
    / "PR-MERGE-RECONCILIATION-ROV.yml"
)
REAL_RECEIPT_PATH = (
    HERE.parents[1]
    / "docs"
    / "ARQUITETURA"
    / "CENTRALDARK-TRIGGER-FABRIC"
    / "receipts"
    / "2026-11-20-pr-2153-reconciliation.yml"
)

SHA_A = "4d927c47ad6f4e83f387c04c7a236932c1a0b97d"
SHA_B = "e2fff550451901161eac77d69c57b0df20877aa3"


def base_receipt() -> dict:
    """Recibo sintetico valido: mirrors o contrato sem depender de estado externo."""
    return {
        "schema": "centraldark.rov.pr-reconciliation.v1",
        "contract": CONTRACT_PATH.name,
        "contract_version": "centraldark.rov.pr-reconciliation.v1",
        "repository": "ServerVpss/CentralDark",
        "tested_origin_main_sha": SHA_A,
        "receipt_persisted_in_main_sha": SHA_B,
        "local_head_sha": SHA_B,
        "worktree_state": "CLEAN",
        "sentinel_result": "PASS ok:true failed:[]",
        "tlc23_result": "PROVED BYTE_IDENTITY_MATCH",
        "open_pr_total": 0,
        "readiness_counts": "{}",
        "selected_pr": 2153,
        "decision": {"action": "MERGE_EXECUTED", "human_authorization": "GRANTED"},
        "tests_t0": {"tests": "1 | pass: 1 | fail: 0"},
        "tests_t1": {"tests": "1 | pass: 1 | fail: 0"},
        "runtime_readback": {"pid": 1, "alive": True, "deployed": False},
        "rollback_reference": "/data/preservacao-centraldark-20261120/meta",
        "next_cursor": "NEXT_CURSOR",
        "merge_readback": {"merge_commit": SHA_B},
        "verdict": "PARTIAL",
        "proven": ["gate"],
        "blocked": ["runtime ainda nao promovido"],
        "unknown": ["efeito de runtime apos promocao"],
        "evidence": ["evidencia"],
    }


class ReceiptVerifierTest(unittest.TestCase):
    def write(self, receipt: dict) -> pathlib.Path:
        tmp = tempfile.NamedTemporaryFile("w", suffix=".yml", delete=False, encoding="utf-8")
        with tmp:
            yaml.safe_dump(receipt, tmp, allow_unicode=True, sort_keys=False)
        self.addCleanup(pathlib.Path(tmp.name).unlink, True)
        return pathlib.Path(tmp.name)

    def verify(self, receipt: dict) -> dict:
        return MODULE.verify_receipt(self.write(receipt), CONTRACT_PATH)

    # ---------- positivos ----------
    def test_positive_synthetic_receipt_is_valid(self):
        result = self.verify(base_receipt())
        self.assertTrue(result["valid"], result["problems"])
        self.assertEqual([], result["problems"])
        self.assertEqual([], result["missing"])
        self.assertTrue(all(v == "PASS" for v in result["checks"].values()), result["checks"])

    def test_positive_real_receipt_is_valid(self):
        result = MODULE.verify_receipt(REAL_RECEIPT_PATH, CONTRACT_PATH)
        self.assertTrue(result["valid"], result["problems"])
        self.assertEqual([], result["missing"])
        self.assertIn("REQUIRED_FIELDS_PRESENT", result["checks"])

    def test_positive_verifier_is_deterministic(self):
        receipt = base_receipt()
        first = self.verify(receipt)
        second = self.verify(copy.deepcopy(receipt))
        self.assertEqual(first, second)

    # ---------- negativos ----------
    def test_negative_missing_required_field(self):
        receipt = base_receipt()
        del receipt["rollback_reference"]
        result = self.verify(receipt)
        self.assertFalse(result["valid"])
        self.assertIn("rollback_reference", result["missing"])
        self.assertIn("MISSING_FIELD", result["problems"])

    def test_negative_invalid_sha_local_head(self):
        receipt = base_receipt()
        receipt["local_head_sha"] = "nao-e-um-sha"
        result = self.verify(receipt)
        self.assertFalse(result["valid"])
        self.assertIn("SHA_INVALID:local_head_sha", result["problems"])
        self.assertEqual("FAIL", result["checks"]["SHA_FORMAT:local_head_sha"])
        self.assertTrue(any(d.startswith("SHA_FORMAT:local_head_sha:") for d in result["details"]))

    def test_negative_invalid_sha_persisted(self):
        receipt = base_receipt()
        receipt["receipt_persisted_in_main_sha"] = "abc123"
        result = self.verify(receipt)
        self.assertFalse(result["valid"])
        self.assertIn("SHA_INVALID:receipt_persisted_in_main_sha", result["problems"])

    def test_negative_undeclared_pass_with_pending_persistence(self):
        receipt = base_receipt()
        receipt["verdict"] = "PASS"
        receipt["receipt_persisted_in_main_sha"] = "PENDING_PR_2153_MERGE"
        receipt["merge_readback"] = {}
        receipt["blocked"] = []
        receipt["unknown"] = []
        result = self.verify(receipt)
        self.assertFalse(result["valid"])
        self.assertIn("PASS_REQUIRES_RECEIPT_PERSISTED_IN_MAIN", result["problems"])

    def test_negative_undeclared_pass_with_material_unknown(self):
        receipt = base_receipt()
        receipt["verdict"] = "PASS"
        receipt["blocked"] = []
        receipt["unknown"] = ["sessao OAuth expirada ainda nao comprovada"]
        result = self.verify(receipt)
        self.assertFalse(result["valid"])
        self.assertIn("PASS_WITH_MATERIAL_UNKNOWN", result["problems"])

    def test_negative_undeclared_pass_with_blocked_gate(self):
        receipt = base_receipt()
        receipt["verdict"] = "PASS"
        receipt["blocked"] = ["gate de deploy nao executado"]
        receipt["unknown"] = []
        result = self.verify(receipt)
        self.assertFalse(result["valid"])
        self.assertIn("PASS_WITH_BLOCKED_GATE", result["problems"])

    def test_negative_pass_without_rollback_and_cursor(self):
        receipt = base_receipt()
        receipt["verdict"] = "PASS"
        receipt["blocked"] = []
        receipt["unknown"] = []
        receipt["rollback_reference"] = ""
        receipt["next_cursor"] = ""
        result = self.verify(receipt)
        self.assertFalse(result["valid"])
        self.assertIn("PASS_REQUIRES_ROLLBACK_AND_CURSOR", result["problems"])

    def test_negative_invalid_verdict(self):
        receipt = base_receipt()
        receipt["verdict"] = "QUASE"
        result = self.verify(receipt)
        self.assertFalse(result["valid"])
        self.assertIn("VERDICT_INVALID", result["problems"])

    def test_negative_merge_commit_inconsistent(self):
        receipt = base_receipt()
        receipt["merge_readback"]["merge_commit"] = SHA_A
        result = self.verify(receipt)
        self.assertFalse(result["valid"])
        self.assertIn("MERGE_COMMIT_INCONSISTENT", result["problems"])

    def test_negative_contract_version_mismatch(self):
        receipt = base_receipt()
        receipt["contract_version"] = "centraldark.rov.pr-reconciliation.v999"
        result = self.verify(receipt)
        self.assertFalse(result["valid"])
        self.assertIn("CONTRACT_VERSION_MISMATCH", result["problems"])

    def test_negative_contract_reference_mismatch(self):
        receipt = base_receipt()
        receipt["contract"] = "OUTRO-CONTRATO.yml"
        result = self.verify(receipt)
        self.assertFalse(result["valid"])
        self.assertIn("CONTRACT_REFERENCE_MISMATCH", result["problems"])

    def test_negative_schema_mismatch(self):
        receipt = base_receipt()
        receipt["schema"] = "schema.errado.v1"
        result = self.verify(receipt)
        self.assertFalse(result["valid"])
        self.assertIn("SCHEMA_MISMATCH", result["problems"])

    def test_negative_contract_not_found(self):
        result = MODULE.verify_receipt(self.write(base_receipt()), HERE / "nao-existe.yml")
        self.assertFalse(result["valid"])
        self.assertIn("CONTRACT_NOT_FOUND", result["problems"])

    def test_negative_receipt_not_a_mapping(self):
        tmp = tempfile.NamedTemporaryFile("w", suffix=".yml", delete=False, encoding="utf-8")
        with tmp:
            tmp.write("- apenas\n- uma\n- lista\n")
        self.addCleanup(pathlib.Path(tmp.name).unlink, True)
        result = MODULE.verify_receipt(pathlib.Path(tmp.name), CONTRACT_PATH)
        self.assertFalse(result["valid"])
        self.assertIn("RECEIPT_NOT_A_MAPPING", result["problems"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
