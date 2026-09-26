"""
Hermes Runtime Hooks - Ciclo de Vida Regenerativo
Implementa hooks de ciclo de vida para auto-evolução regenerativa de skills.
"""

from .hooks import SkillLifecycleHooks, get_hooks
from .pipeline_runner import PipelineRunner, pipeline_runner
from .fixed_point import FixedPointVerifier
from .skill_state import SkillState, SkillStatus
from .config import PipelineConfig, DEFAULT_CONFIG
from .hooks import (
    on_skill_create,
    on_skill_update,
    on_skill_test,
    on_skill_load,
    on_pre_push,
)

__all__ = [
    "SkillLifecycleHooks",
    "PipelineRunner",
    "FixedPointVerifier",
    "SkillState",
    "SkillStatus",
    "PipelineConfig",
    "DEFAULT_CONFIG",
    "get_hooks",
    "on_skill_create",
    "on_skill_update",
    "on_skill_test",
    "on_skill_load",
    "on_pre_push",
    "pipeline_runner",
]

__version__ = "1.0.0"
__author__ = "Hermes Regenerative Runtime"