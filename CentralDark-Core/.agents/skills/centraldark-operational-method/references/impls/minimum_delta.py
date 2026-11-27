#!/usr/bin/env python3
"""
MinimumDeltaPlanner - Planejador de Menor Delta (EICPF §8).

Execução: python3 minimum_delta.py
Recursos: Python 3.8+ | Dependências: None (stdlib only)

MODO DE USO:
  python3 minimum_delta.py [--scope SCOPE] [--goal GOAL]
"""

import heapq
import argparse
from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class DeltaCandidate:
    cost: int
    delta: str
    owner: str


class Owner:
    """Abstração de owner (actor, service, module)."""

    def __init__(self, name: str):
        self.name = name

    def blast_radius(self, delta: str) -> str:
        """Retorna o scope afetado pelo delta."""
        return self.name

    def minimum_change(self, objective: str) -> str:
        """Retorna o menor delta para atingir o objetivo."""
        return f"delta_for_{objective}_by_{self.name}"


class MinimumDeltaPlanner:
    """
    Planejador de menor delta com blast_radius ⊆ writer_scope.

    Estratégia REUSE_BEFORE_CREATE:
      - Reutilizar antes de criar
      - Um writer por escopo
      - Estado atual > Histórico
    """

    def __init__(self, owners: List[Owner], writer_scope: str):
        self.owners = owners
        self.writer_scope = writer_scope

    def plan(self, objective_residual: str) -> Optional[DeltaCandidate]:
        """
        Retorna o menor delta válido (blast_radius ⊆ writer_scope).
        Retorna None se não houver candidato viável.
        """
        candidates = []
        for owner in self.owners:
            delta = owner.minimum_change(objective_residual)
            br = owner.blast_radius(delta)
            if self._blast_allowed(br):
                cost = self._estimate_cost(delta)
                heapq.heappush(candidates, (cost, delta, owner.name))

        if not candidates:
            return None

        cost, delta, owner = heapq.heappop(candidates)
        return DeltaCandidate(cost=cost, delta=delta, owner=owner)

    def _blast_allowed(self, blast_radius: str) -> bool:
        """
        Retorna True se blast_radius ⊆ writer_scope.
        Corrigido: compara escopos semanticamente, não por string compare.
        Aceita separadores '-', '.', '/' para subescopos.
        """
        if blast_radius == self.writer_scope:
            return True
        for sep in ("-", ".", "/"):
            if blast_radius.startswith(self.writer_scope + sep):
                return True
        return False

    def _estimate_cost(self, delta: str) -> int:
        return len(delta)


# ----------------------------------------------------------------------
# TESTE RÁPIDO
# ----------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MinimumDeltaPlanner test")
    parser.add_argument("--scope", default="test_scope")
    parser.add_argument("--goal", default="test_goal")
    args = parser.parse_args()

    owners = [Owner("owner1"), Owner("owner2")]
    planner = MinimumDeltaPlanner(owners, args.scope)
    delta = planner.plan(args.goal)
    if delta:
        print(f"Delta planejado: {delta.delta}")
        print(f"Owner: {delta.owner}")
        print(f"Cost: {delta.cost}")
