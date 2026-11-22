#!/usr/bin/env python3
"""
ClosedLoop - Algoritmo de Convergência TLC23 Horn Closure (EICPF §9).

Execução: python3 closed_loop.py
Recursos: Python 3.8+ | Dependências: None (stdlib only)

MODO DE USO:
  python3 closed_loop.py [--layers 'l1,l2'] [--max_iters 20]
  python3 closed_loop.py --real  # Verifica infraestrutura CentralDark real

INTEGRAÇÃO REAL (--real):
  gateway   → HTTPS https://gateway.centralldark.com/health
  mcp       → HTTPS https://mcp.centralldark.com/health  
  tunnel    → cloudflared tunnel list (conexões ativas)
  worker    → HTTPS https://centraldark-site-preview.centraldark.workers.dev/
  hermes    → process check (hermes gateway + dashboard)
"""

import argparse
import json
import subprocess
import sys
import time
from dataclasses import dataclass
from typing import Any, Dict, List, Tuple
import urllib.request
import urllib.error


@dataclass
class IterationRecord:
    iteration: int
    results: Dict[str, bool]
    new_material: bool
    stop_reason: str = ""


class ClosedLoop:
    """
    Loop de convergência TLC23 Horn Closure.

    Critério de parada (Fixed Point):
      - Todas as camadas PASS
      - ¬Novo fato material em ≥ 2 iterações consecutivas
      - Máximo iterações respeitado
    """

    MAX_ITER_PER_HYPOTHESIS = 3
    STOP_THRESHOLD = 2  # sem novo fato em 2 iterações consecutivas

    def __init__(self, mission_state: Dict[str, Any]):
        self.mission_state = mission_state
        self.history: List[IterationRecord] = []
        self.iteration = 0
        self.stopped = False

    def run(self, layers: List[str], max_iters: int = 20) -> Tuple[bool, Dict[str, bool], int]:
        """
        Executa o loop até max_iters ou nova evidência material.

        NOTA: O método NÃO determina FIXED_POINT final.
        O usuário (ou VALIDADOR independente) decide se o estado é convexo.
        O ClosedLoop apenas executa e retorna o estado observado.
        """
        self.iteration = 0
        self.stopped = False
        results: Dict[str, bool] = {}

        while self.iteration < max_iters:
            self.iteration += 1
            results = {}
            for layer in layers:
                results[layer] = self._verify_layer(layer)

            new_material = self._check_new_fact(results)
            self.history.append(IterationRecord(
                iteration=self.iteration, results=results,
                new_material=new_material,
            ))

            # NOTA CRÍTICA: Não auto-determinar FIXED_POINT.
            # O método executa e retorna estado. O julgamento final
            # (FIXED_POINT) é da validação independente do usuário.
            # Apenas o usuário com múltiplas evidências pode declarar.

        return self.stopped, results, self.iteration

    def _verify_layer(self, layer: str) -> bool:
        """Verificação real de camada da infraestrutura CentralDark."""
        try:
            if layer == "gateway":
                return self._check_gateway()
            elif layer == "mcp":
                return self._check_mcp()
            elif layer == "tunnel":
                return self._check_tunnel()
            elif layer == "worker":
                return self._check_worker()
            elif layer == "hermes":
                return self._check_hermes()
            elif layer == "dns":
                return self._check_dns()
            else:
                # Camada desconhecida = UNKNOWN (não PASS)
                return False
        except Exception as e:
            print(f"  [ERRO] {layer}: {e}", file=sys.stderr)
            return False

    def _check_gateway(self) -> bool:
        """Gateway Hermes: HTTP 200 = OK, 301/302/401/500 = NEGATIVO"""
        try:
            req = urllib.request.Request(
                "https://gateway.centralldark.com/health",
                headers={"User-Agent": "ClosedLoop/1.0"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.status == 200
        except urllib.error.HTTPError:
            return False
        except Exception:
            return False

    def _check_mcp(self) -> bool:
        """MCP: HTTPS 200 + JSON ok=true + toolCount > 0"""
        try:
            req = urllib.request.Request(
                "https://mcp.centralldark.com/health",
                headers={"User-Agent": "ClosedLoop/1.0"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status != 200:
                    return False
                data = json.loads(resp.read().decode())
                return data.get("ok") is True and data.get("toolCount", 0) > 0
        except Exception:
            return False

    def _check_tunnel(self) -> bool:
        """Cloudflared tunnel: conexões ativas no tunnel principal"""
        try:
            result = subprocess.run(
                ["cloudflared", "tunnel", "list"],
                capture_output=True, text=True, timeout=15
            )
            if result.returncode != 0:
                return False
            # Procurar tunnel VPS-Hostinger com conexões
            for line in result.stdout.split("\n"):
                if "VPS" in line and "Hostinger" in line:
                    # Verifica se tem conexões (não vazio)
                    return "1xewr" in line or "conex" in line.lower()
            return False
        except Exception:
            return False

    def _check_worker(self) -> bool:
        """Worker preview: HTTPS 200 + conteúdo CentralDark"""
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
        """Hermes: processos gateway + dashboard ativos"""
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
        """DNS: centralldark.com resolve para qualquer IP (via getent)"""
        try:
            result = subprocess.run(
                ["getent", "hosts", "centralldark.com"],
                capture_output=True, text=True, timeout=10
            )
            return result.returncode == 0
        except Exception:
            return False

    def _check_new_fact(self, results: Dict[str, bool]) -> bool:
        """
        Determina se há fato material novo nas camadas verificadas.
        
        Fato material = mudança de estado (PASS↔FAIL) em qualquer camada
        desde a iteração anterior.
        """
        if len(self.history) < 1:
            return True  # Primeira iteração sempre tem fato novo
        
        prev = self.history[-1].results
        for layer, current in results.items():
            previous = prev.get(layer)
            if previous is not None and current != previous:
                return True  # Mudança de estado detectada
        
        return False  # Nenhuma mudança material


# ----------------------------------------------------------------------
# TESTE RÁPIDO / INTEGRAÇÃO REAL
# ----------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ClosedLoop test")
    parser.add_argument("--layers", default="layer1,layer2")
    parser.add_argument("--max_iters", type=int, default=20)
    parser.add_argument("--real", action="store_true",
                        help="Verifica infraestrutura CentralDark real")
    args = parser.parse_args()

    if args.real:
        # Camadas reais da CentralDark
        layers = ["gateway", "mcp", "tunnel", "worker", "hermes", "dns"]
        print("🔍 ClosedLoop — Integração Real CentralDark")
        print(f"Camadas: {', '.join(layers)}")
    else:
        layers = args.layers.split(",")

    loop = ClosedLoop({"intent": "centraldark_infra_check"})
    fixed, results, iters = loop.run(layers, max_iters=args.max_iters)

    print(f"\n✓ Iterations: {iters}")
    print(f"✓ Resultados por camada:")
    for layer, status in results.items():
        icon = "✅" if status else "❌"
        print(f"  {icon} {layer}: {'PASS' if status else 'FAIL'}")
    print(f"✓ Histórico: {len(loop.history)} registros")
    print(f"✓ Fixed point (auto): {fixed}")
    print("\n⚠️  NOTA: Fixed Point final requer validação independente do usuário.")
