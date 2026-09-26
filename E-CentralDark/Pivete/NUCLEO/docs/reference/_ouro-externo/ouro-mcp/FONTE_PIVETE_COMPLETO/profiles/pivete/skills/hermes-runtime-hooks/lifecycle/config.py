"""
Hermes Runtime Hooks - Configuração do Pipeline Regenerativo
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional
import yaml
from pathlib import Path


@dataclass
class PipelinePolicy:
    """Políticas do pipeline regenerativo."""
    auto_accept_if_fixed_point: bool = True
    require_manual_approval_on: str = "regression_detected"
    max_generations_per_session: int = 50
    timeout_per_skill_minutes: int = 30
    auto_accept_if_fixed_point: bool = True


@dataclass
class PipelineTriggers:
    """Gatilhos do pipeline regenerativo."""
    on_skill_create: bool = True
    on_skill_update: bool = True
    on_skill_test: str = "verify_only"  # verify_only, full, skip
    on_skill_load: str = "verify_fixed_point"  # verify_fixed_point, skip, full
    on_pre_push: bool = True


@dataclass
class PipelineConfig:
    """Configuração completa do pipeline regenerativo."""
    enabled: bool = True
    mode: str = "always"  # always, on_demand, scheduled
    scope: str = "all_skills"  # all_skills, specific_skills
    mode_execution: str = "until_fixed_point"  # until_fixed_point, single_pass, incremental
    
    triggers: PipelineTriggers = field(default_factory=PipelineTriggers)
    policy: PipelinePolicy = field(default_factory=PipelinePolicy)
    exclusions: List[str] = field(default_factory=list)
    
    # Configurações de execução
    max_generations_per_session: int = 50
    timeout_per_skill_minutes: int = 30
    max_concurrent_skills: int = 1
    
    # Configurações de Fixed Point
    fixed_point_conditions: Dict[str, bool] = field(default_factory=lambda: {
        "objective_closed": True,
        "counterproof_survived": True,
        "applicable_invariants_hold": True,
        "no_material_unknown": True,
    })
    
    @classmethod
    def from_yaml(cls, path: Path) -> "PipelineConfig":
        """Carrega configuração de arquivo YAML."""
        if not path.exists():
            return cls()
        with open(path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f) or {}
        return cls(**data.get('regenerative_pipeline', {}))
    
    def to_yaml(self, path: Path) -> None:
        """Salva configuração em arquivo YAML."""
        data = {'regenerative_pipeline': {
            'enabled': self.enabled,
            'mode': self.mode,
            'scope': self.scope,
            'mode_execution': self.mode_execution,
            'triggers': {
                'on_skill_create': self.triggers.on_skill_create,
                'on_skill_update': self.triggers.on_skill_update,
                'on_skill_test': self.triggers.on_skill_test,
                'on_skill_load': self.triggers.on_skill_load,
                'on_pre_push': self.triggers.on_pre_push,
            },
            'policy': {
                'auto_accept_if_fixed_point': self.policy.auto_accept_if_fixed_point,
                'require_manual_approval_on': self.policy.require_manual_approval_on,
                'max_generations_per_session': self.policy.max_generations_per_session,
                'timeout_per_skill_minutes': self.policy.timeout_per_skill_minutes,
                'auto_accept_if_fixed_point': self.policy.auto_accept_if_fixed_point,
            },
            'exclusions': self.exclusions,
            'max_generations_per_session': self.max_generations_per_session,
            'timeout_per_skill_minutes': self.timeout_per_skill_minutes,
            'max_concurrent_skills': self.max_concurrent_skills,
            'fixed_point_conditions': self.fixed_point_conditions,
        }}
        with open(path, 'w', encoding='utf-8') as f:
            yaml.dump(data, f, default_flow_style=False, allow_unicode=True)


# Configuração padrão
DEFAULT_CONFIG = PipelineConfig()