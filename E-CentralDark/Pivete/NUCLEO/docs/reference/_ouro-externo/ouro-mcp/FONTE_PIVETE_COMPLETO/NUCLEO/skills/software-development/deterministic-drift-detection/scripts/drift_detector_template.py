#!/usr/bin/env python3
"""
Drift Detector Template — Reusable skeleton for deterministic drift detection.
Adapt for specific surface (Kanban, config, schema, API, etc.).
"""

import json
import hashlib
import subprocess
import sqlite3
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum


class DriftResult(Enum):
    NO_CHANGE = "NO_CHANGE"
    SAFE_ADAPTER_DRIFT = "SAFE_ADAPTER_DRIFT"
    UPSTREAM_DRIFT = "UPSTREAM_DRIFT"
    AMBIGUOUS_DRIFT = "AMBIGUOUS_DRIFT"
    BROKEN_CONTRACT = "BROKEN_CONTRACT"
    BLOCKED = "BLOCKED"


@dataclass
class DriftReport:
    timestamp: str
    result: str
    details: Dict[str, Any]
    actions_required: List[str]
    unknown_factors: List[str]
    contract_hash: str
    adapter_hash: str
    schema_hash: str


class DriftDetector:
    """Base drift detector — override capture/normalize/compare/classify for your surface."""
    
    def __init__(self, skill_root: Path, contract_name: str = "canonical-contract.json"):
        self.skill_root = skill_root
        self.contracts_dir = skill_root / "contracts"
        self.state_dir = skill_root / "state"
        self.contract_path = self.contracts_dir / contract_name
        self.hash_path = self.state_dir / "contract_hash.txt"
        
    def _run_cmd(self, cmd: List[str]) -> Tuple[int, str, str]:
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            return result.returncode, result.stdout, result.stderr
        except subprocess.TimeoutExpired:
            return -1, "", "TIMEOUT"
        except Exception as e:
            return -1, "", str(e)
    
    # ===== OVERRIDE THESE METHODS FOR YOUR SURFACE =====
    
    def capture_runtime(self) -> Dict[str, Any]:
        """CAPTURE: Probe runtime and return raw observations."""
        raise NotImplementedError("Subclass must implement capture_runtime()")
    
    def normalize(self, captured: Dict[str, Any]) -> Dict[str, Any]:
        """NORMALIZE: Sort lists, strip volatile fields for deterministic comparison."""
        normalized = captured.copy()
        # Default: sort any list values
        for k, v in normalized.items():
            if isinstance(v, list):
                try:
                    normalized[k] = sorted(v)
                except TypeError:
                    pass  # unsortable, leave as-is
        return normalized
    
    def compare(self, current: Dict[str, Any], contract: Dict[str, Any]) -> Dict[str, Any]:
        """COMPARE: Diff current normalized state against canonical contract."""
        differences = {}
        canonical = contract.get("canonical", {})
        
        # Default comparison: check each captured key against contract
        for key, actual in current.items():
            contract_key = key.upper()  # convention: contract keys are uppercase
            if contract_key in canonical:
                expected = canonical[contract_key].get("value")
                if expected is not None and actual != expected:
                    differences[key] = {
                        "expected": expected,
                        "actual": actual,
                        "type": "value_changed"
                    }
        return differences
    
    def classify(self, differences: Dict[str, Any], contract: Dict[str, Any]) -> DriftResult:
        """CLASSIFY: Map differences to one of six drift classes."""
        if not differences:
            return DriftResult.NO_CHANGE
        
        diff_keys = set(differences.keys())
        
        # Only adapter hash changed (owned code)
        if diff_keys <= {"adapter_hash"}:
            return DriftResult.SAFE_ADAPTER_DRIFT
        
        # Only schema changed (upstream migration)
        if diff_keys <= {"schema_hash"}:
            return DriftResult.UPSTREAM_DRIFT
        
        # Only URL changed (dynamic discovery)
        if diff_keys <= {"surface_url", "url"}:
            return DriftResult.UPSTREAM_DRIFT
        
        # Contract violation (runtime violates expectations)
        if "invalid_states" in diff_keys or "invalid_types" in diff_keys:
            return DriftResult.BROKEN_CONTRACT
        
        # Upstream keys that can change
        upstream_keys = {"cli_version", "cli_commands", "resource_name", "surface_url", "url"}
        if diff_keys.issubset(upstream_keys):
            if len(diff_keys) > 1:
                return DriftResult.AMBIGUOUS_DRIFT
            return DriftResult.UPSTREAM_DRIFT
        
        # Adapter + upstream = ambiguous
        if diff_keys & {"adapter_hash"} and diff_keys & upstream_keys:
            return DriftResult.AMBIGUOUS_DRIFT
        
        # Schema + other = ambiguous (breaking)
        if "schema_hash" in diff_keys and len(diff_keys) > 1:
            return DriftResult.AMBIGUOUS_DRIFT
        
        return DriftResult.AMBIGUOUS_DRIFT
    
    def decide(self, classification: DriftResult, differences: Dict[str, Any]) -> Tuple[List[str], List[str]]:
        """DECIDE: Actions + unknowns per classification."""
        actions = []
        unknowns = []
        
        if classification == DriftResult.NO_CHANGE:
            actions.append("Nenhuma ação necessária — estado consistente com contrato")
        
        elif classification == DriftResult.SAFE_ADAPTER_DRIFT:
            actions.append("Atualizar hash do adapter no contrato (LAST_KNOWN_GOOD)")
            actions.append("Executar testes de regressão")
            actions.append("Promover se testes passarem")
        
        elif classification == DriftResult.UPSTREAM_DRIFT:
            actions.append("NÃO modificar upstream")
            actions.append("Atualizar contrato/seletor se relação determinística")
            actions.append("Registrar drift como cartão material")
            unknowns.append("Comportamento do upstream pode ter mudado — validar manualmente")
        
        elif classification == DriftResult.AMBIGUOUS_DRIFT:
            actions.append("NÃO corrigir automaticamente")
            actions.append("Criar/atualizar cartão com detalhes exatos")
            actions.append("Aguardar decisão humana")
            unknowns.append("Múltiplas mudanças simultâneas — causa raiz não identificada")
        
        elif classification == DriftResult.BROKEN_CONTRACT:
            actions.append("Restaurar LAST_KNOWN_GOOD da camada própria (skill, seletores, regras)")
            actions.append("NUNCA reverter arquivos upstream")
            actions.append("Registrar rollback")
            actions.append("Criar cartão com causa e evidência")
            unknowns.append("Contrato violado — upstream pode ter breaking change")
        
        elif classification == DriftResult.BLOCKED:
            actions.append("Não prosseguir")
            actions.append("Registrar condição desconhecida")
            unknowns.append("Classificação BLOCKED — investigar manualmente")
        
        return actions, unknowns
    
    def report(self, captured: Dict[str, Any], normalized: Dict[str, Any],
               differences: Dict[str, Any], classification: DriftResult,
               actions: List[str], unknowns: List[str]) -> DriftReport:
        contract = self._load_contract()
        last_good_hash = self._load_last_known_good_hash()
        
        return DriftReport(
            timestamp=datetime.now().isoformat(),
            result=classification.value,
            details={
                "captured_keys": list(captured.keys()),
                "differences": differences,
                "normalized_sample": {k: str(v)[:200] for k, v in normalized.items()},
            },
            actions_required=actions,
            unknown_factors=unknowns,
            contract_hash=last_good_hash,
            adapter_hash=captured.get("adapter_hash", ""),
            schema_hash=captured.get("schema_hash", "")
        )
    
    def _load_contract(self) -> Dict[str, Any]:
        if self.contract_path.exists():
            return json.loads(self.contract_path.read_text(encoding="utf-8"))
        return {}
    
    def _load_last_known_good_hash(self) -> str:
        if self.hash_path.exists():
            return self.hash_path.read_text(encoding="utf-8").strip()
        return ""
    
    # ===== MAIN PIPELINE =====
    
    def run(self, mode: str = "readonly") -> DriftReport:
        print(f"🔍 [DRIFT DETECTOR] Iniciando pipeline ({mode})...")
        
        contract = self._load_contract()
        if not contract:
            print("⚠️  Contrato não encontrado — primeira captura como baseline")
            captured = self.capture_runtime()
            normalized = self.normalize(captured)
            return DriftReport(
                timestamp=datetime.now().isoformat(),
                result=DriftResult.NO_CHANGE.value,
                details={"baseline": True, "message": "Primeira captura — estabelecendo baseline"},
                actions_required=["Salvar contrato canônico e hash LAST_KNOWN_GOOD"],
                unknown_factors=[],
                contract_hash="",
                adapter_hash=captured.get("adapter_hash", ""),
                schema_hash=captured.get("schema_hash", "")
            )
        
        print("  📸 CAPTURE...")
        captured = self.capture_runtime()
        
        print("  🔧 NORMALIZE...")
        normalized = self.normalize(captured)
        
        print("  ⚖️  COMPARE...")
        differences = self.compare(normalized, contract)
        
        print("  🏷️  CLASSIFY...")
        classification = self.classify(differences, contract)
        
        print("  🎯 DECIDE...")
        actions, unknowns = self.decide(classification, differences)
        
        print("  📋 REPORT...")
        report = self.report(captured, normalized, differences, classification, actions, unknowns)
        
        print(f"  ✅ Resultado: {classification.value}")
        
        # Save report
        report_path = self.state_dir / f"drift_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        report_path.write_text(json.dumps(asdict(report), indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"  📄 Relatório salvo: {report_path}")
        
        return report


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Drift Detector Template")
    parser.add_argument("--mode", choices=["readonly", "apply"], default="readonly")
    parser.add_argument("--skill-root", type=str, required=True)
    parser.add_argument("--contract", type=str, default="canonical-contract.json")
    args = parser.parse_args()
    
    skill_root = Path(args.skill_root)
    # Subclass must be instantiated by concrete implementation
    print("ERROR: This is a template. Import and subclass DriftDetector for your surface.")
    sys.exit(1)


if __name__ == "__main__":
    main()