#!/usr/bin/env python3
"""
GreenStateManager - Preservação do Último Estado Bom (EICPF §10.6).

Execução: python3 green_state_manager.py
Recursos: Python 3.8+ | Dependências: None (subprocess+json+hashlib nativos)

MODO DE USO:
  python3 green_state_manager.py [--repo PATH] [--commit SHA] [--branch BRANCH]
"""

import hashlib
import json
import subprocess
import sys
import argparse
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime, timezone


@dataclass
class GreenSnapshot:
    """Captura do estado verde (último bom)."""
    repo_head: str
    runtime_hash: str
    resources: Dict[str, Any]
    writer_scope: str
    timestamp: str
    fingerprint: str

    def sha256(self) -> str:
        return self.fingerprint


class GreenStateManager:
    """
    Gerencia snapshots do estado verde e rollback.

    Invariantes:
      - ONE_WRITER_PER_SCOPE: apagar com escritor único
      - REUSE_BEFORE_CREATE: reutilizar antes de criar
      - CURRENT > HISTORY: decisões baseadas em medição atual
    """

    def __init__(self, repo_path: str = "/data/CentralDark/CentralDark"):
        self.repo_path = repo_path
        self.snapshots: List[GreenSnapshot] = []

    # ------------------------------------------------------------------
    # Snapshot
    # ------------------------------------------------------------------
    def snapshot(self, runtime: Dict[str, Any]) -> GreenSnapshot:
        """Cria snapshot do estado atual, preservando o bom anterior."""
        head = self._git_rev_parse("HEAD")
        resources = self._measure_resources()
        payload = json.dumps({
            "head": head, "runtime": runtime,
            "resources": resources, "writer_scope": "unknown"
        }, sort_keys=True)
        fp = hashlib.sha256(payload.encode()).hexdigest()
        snap = GreenSnapshot(
            repo_head=head,
            runtime_hash=payload,
            resources=resources,
            writer_scope="unknown",
            timestamp=datetime.now(timezone.utc).isoformat(),
            fingerprint=fp,
        )
        self.snapshots.append(snap)
        return snap

    # ------------------------------------------------------------------
    # Rollback
    # ------------------------------------------------------------------
    def rollback_to(self, snapshot: GreenSnapshot) -> GreenSnapshot:
        """Restaura o estado registrado (apenas no escopo do writer)."""
        os_system = subprocess.run(
            ["git", "-C", self.repo_path, "checkout", snapshot.repo_head],
            capture_output=True, text=True
        )
        if os_system.returncode != 0:
            raise RuntimeError(f"Rollback failed: {os_system.stderr}")
        return snapshot

    # ------------------------------------------------------------------
    # Verificação
    # ------------------------------------------------------------------
    def verify_green(self, required_layers: List[str]) -> Tuple[bool, Dict[str, bool]]:
        """Verifica todas as camadas aplicáveis com readback."""
        results = {}
        for layer in required_layers:
            results[layer] = self._verify_layer(layer)
        return all(results.values()), results

    def _verify_layer(self, layer: str) -> bool:
        """Substituir por verificação real de camada."""
        return True  # Placeholder: implementar por camada

    # ------------------------------------------------------------------
    # Util
    # ------------------------------------------------------------------
    def _git_rev_parse(self, ref: str) -> str:
        out = subprocess.run(
            ["git", "-C", self.repo_path, "rev-parse", ref],
            capture_output=True, text=True
        )
        if out.returncode != 0:
            raise RuntimeError(f"git rev-parse failed: {out.stderr}")
        return out.stdout.strip()

    def _measure_resources(self) -> Dict[str, Any]:
        """Mede recursos Cloudflare via API (placeholder - requer auth)."""
        return {"workers": [], "dns": [], "tunnels": [], "mcp": []}


# ----------------------------------------------------------------------
# TESTE RÁPIDO
# ----------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GreenStateManager test")
    parser.add_argument("--repo", default="/data/CentralDark/CentralDark")
    args = parser.parse_args()

    manager = GreenStateManager(repo_path=args.repo)
    snap = manager.snapshot({"test": "state"})
    print(f"✓ Snapshot: {snap.fingerprint[:16]}...")
    print(f"✓ Total snapshots: {len(manager.snapshots)}")
    print(f"✓ Repo head: {snap.repo_head[:16]}...")

    # Testa a verificação vazia
    ok, results = manager.verify_green(["layer1"])
    print(f"✓ Green verify: {ok} | {results}")
