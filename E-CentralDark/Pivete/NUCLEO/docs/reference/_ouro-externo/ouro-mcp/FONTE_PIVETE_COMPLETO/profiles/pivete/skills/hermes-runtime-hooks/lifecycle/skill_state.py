"""
Hermes Runtime Hooks - Estado da Skill
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum


class SkillStatus(Enum):
    """Status da skill no pipeline."""
    UNKNOWN = "unknown"
    BASELINE = "baseline"
    IN_PROGRESS = "in_progress"
    FIXED_POINT = "fixed_point"
    BLOCKED = "blocked"
    REGRESSION = "regression"


@dataclass
class SkillGap:
    """Gap identificado na skill."""
    id: str
    title: str
    description: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    category: str  # structural, test, contract, dependency, docs
    files_affected: List[str]
    discovered_at: datetime = field(default_factory=datetime.now)
    resolved: bool = False
    resolved_at: Optional[datetime] = None


@dataclass
class GenerationRecord:
    """Registro de uma geração de refinamento."""
    generation: int
    candidate_id: str
    description: str
    status: str  # ACCEPTED, REJECTED, PENDING
    evidence: Dict
    regression_check: bool
    counterproof_passed: bool
    created_at: datetime = field(default_factory=datetime.now)
    accepted_at: Optional[datetime] = None


@dataclass
class SkillState:
    """Estado completo de uma skill no pipeline regenerativo."""
    name: str
    path: str
    
    # Status geral
    status: SkillStatus = SkillStatus.UNKNOWN
    generation: int = 0
    
    # Baseline
    baseline_tests_passed: int = 0
    baseline_tests_total: int = 0
    baseline_build: bool = False
    baseline_lint: bool = False
    
    # Gaps
    gaps: List[Dict] = field(default_factory=list)
    gaps_resolved: int = 0
    gaps_total: int = 0
    
    # Gerações
    generations: List[Dict] = field(default_factory=list)
    current_generation: int = 0
    accepted_generations: int = 0
    rejected_generations: int = 0
    
    # Fixed Point
    fixed_point: bool = False
    fixed_point_conditions: Dict[str, bool] = field(default_factory=dict)
    
    # Timestamps
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    fixed_point_at: Optional[datetime] = None
    
    # Metadados
    metadata: Dict = field(default_factory=dict)
    
    def to_dict(self) -> dict:
        """Converte para dicionário serializável."""
        return {
            "name": self.name,
            "path": self.path,
            "status": self.status.value,
            "generation": self.generation,
            "baseline_tests_passed": self.baseline_tests_passed,
            "baseline_tests_total": self.baseline_tests_total,
            "baseline_build": self.baseline_build,
            "baseline_lint": self.baseline_lint,
            "gaps": self.gaps,
            "gaps_resolved": self.gaps_resolved,
            "gaps_total": self.gaps_total,
            "generations": self.generations,
            "current_generation": self.current_generation,
            "accepted_generations": self.accepted_generations,
            "rejected_generations": self.rejected_generations,
            "fixed_point": self.fixed_point,
            "fixed_point_conditions": self.fixed_point_conditions,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "fixed_point_at": self.fixed_point_at.isoformat() if self.fixed_point_at else None,
            "metadata": self.metadata,
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "SkillState":
        """Cria SkillState a partir de dicionário."""
        state = cls(
            name=data.get("name", ""),
            path=data.get("path", ""),
        )
        state.status = SkillStatus(data.get("status", "unknown"))
        state.generation = data.get("generation", 0)
        state.baseline_tests_passed = data.get("baseline_tests_passed", 0)
        state.baseline_tests_total = data.get("baseline_tests_total", 0)
        state.baseline_build = data.get("baseline_build", False)
        state.baseline_lint = data.get("baseline_lint", False)
        state.gaps = data.get("gaps", [])
        state.gaps_resolved = data.get("gaps_resolved", 0)
        state.gaps_total = data.get("gaps_total", 0)
        state.generations = data.get("generations", [])
        state.current_generation = data.get("current_generation", 0)
        state.accepted_generations = data.get("accepted_generations", 0)
        state.rejected_generations = data.get("rejected_generations", 0)
        state.fixed_point = data.get("fixed_point", False)
        state.fixed_point_conditions = data.get("fixed_point_conditions", {})
        
        for dt_field in ["created_at", "updated_at", "fixed_point_at"]:
            if data.get(dt_field):
                setattr(state, dt_field, datetime.fromisoformat(data[dt_field]))
        
        state.metadata = data.get("metadata", {})
        return state
    
    def update_timestamp(self):
        """Atualiza timestamp de atualização."""
        self.updated_at = datetime.now()
    
    def mark_fixed_point(self):
        """Marca skill como atingiu Fixed Point."""
        self.fixed_point = True
        self.fixed_point_at = datetime.now()
        self.status = SkillStatus.FIXED_POINT
        self.update_timestamp()
    
    def add_generation(self, gen_data: dict):
        """Adiciona registro de geração."""
        # Garantir campos obrigatórios
        gen_data.setdefault("generation", len(self.generations) + 1)
        gen_data.setdefault("created_at", datetime.now().isoformat())
        self.generations.append(gen_data)
        self.current_generation = len(self.generations)
        self.update_timestamp()
    
    def mark_generation_accepted(self, gen_index: int):
        """Marca geração como aceita."""
        if 0 <= gen_index < len(self.generations):
            self.generations[gen_index]["status"] = "ACCEPTED"
            self.accepted_generations = len([g for g in self.generations if g.get("status") == "ACCEPTED"])
            self.generation = self.accepted_generations
            self.update_timestamp()
    
    def mark_generation_rejected(self, gen_index: int):
        """Marca geração como rejeitada."""
        if 0 <= gen_index < len(self.generations):
            self.generations[gen_index]["status"] = "REJECTED"
            self.rejected_generations = len([g for g in self.generations if g.get("status") == "REJECTED"])
            self.update_timestamp()