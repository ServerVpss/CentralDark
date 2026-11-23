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
import urllib.request
import urllib.error
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
        layer_methods = {
            "gateway": self._check_gateway,
            "mcp": self._check_mcp,
            "tunnel": self._check_tunnel,
            "worker": self._check_worker,
            "hermes": self._check_hermes,
            "dns": self._check_dns,
        }
        verifier = layer_methods.get(layer)
        if verifier:
            return verifier()
        return False

    def _check_gateway(self) -> bool:
        """Gateway Hermes local: HTTP 200 no localhost:8642/health"""
        try:
            req = urllib.request.Request(
                "http://localhost:8642/health",
                headers={"User-Agent": "ClosedLoop/1.0"}
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode())
                    return data.get("status") == "ok"
                return False
        except Exception:
            return False

    def _check_mcp(self) -> bool:
        try:
            req = urllib.request.Request(
                "https://mcp.centralldark.com/health",
                headers={"User-Agent": "ClosedLoop/1.0"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode())
                    return data.get("ok") is True and data.get("toolCount", 0) > 0
                return False
        except Exception:
            return False

    def _check_tunnel(self) -> bool:
        import subprocess as _sp
        try:
            result = _sp.run(["cloudflared", "tunnel", "list"],
                           capture_output=True, text=True, timeout=15)
            return result.returncode == 0 and "Hostinger" in result.stdout
        except Exception:
            return False

    def _check_worker(self) -> bool:
        try:
            req = urllib.request.Request(
                "https://centraldark-site-preview.centraldark.workers.dev/",
                headers={"User-Agent": "ClosedLoop/1.0"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status != 200:
                    return False
                body = resp.read().decode()
                return "CentralDark" in body or "centralldark" in body.lower()
        except Exception:
            return False

    def _check_hermes(self) -> bool:
        """Hermes: gateway run + dashboard 18787 processos ativos (ps aux)."""
        try:
            result = subprocess.run(
                ["ps", "aux"], capture_output=True, text=True, timeout=5
            )
            if result.returncode != 0:
                return False
            out = result.stdout
            has_gateway = "gateway run" in out
            has_dashboard = "dashboard" in out and "18787" in out
            return has_gateway and has_dashboard
        except Exception:
            return False

    def _check_dns(self) -> bool:
        import subprocess as _sp2
        try:
            result = _sp2.run(["getent", "hosts", "centralldark.com"],
                           capture_output=True, text=True, timeout=10)
            return result.returncode == 0
        except Exception:
            return False

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
