"""
Hermes Runtime Hooks - Hooks Principais do Ciclo de Vida
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
import json
import subprocess
import sys

from .config import PipelineConfig, DEFAULT_CONFIG
from .skill_state import SkillState, SkillStatus
from .pipeline_runner import PipelineRunner
from .fixed_point import FixedPointVerifier


@dataclass
class HookResult:
    """Resultado de execução de um hook."""
    success: bool
    message: str
    data: Dict = None
    error: str = None


class SkillLifecycleHooks:
    """Hooks principais do ciclo de vida regenerativo de skills."""
    
    def __init__(self, config: PipelineConfig = None, profile_path: str = None):
        self.config = config or DEFAULT_CONFIG
        self.profile_path = profile_path or self._detect_profile_path()
        self.skills_dir = Path(self.profile_path) / "skills" if self.profile_path else None
        self.state_dir = Path(self.profile_path) / "runtime" / "skill_states" if self.profile_path else None
        
        # Inicializar componentes
        self.pipeline_runner = PipelineRunner(self.config)
        self.fixed_point_verifier = FixedPointVerifier()
        
        # Cache de estados
        self._skill_states: Dict[str, SkillState] = {}
    
    def _detect_profile_path(self) -> str:
        """Detecta o caminho do perfil pivete."""
        # Tentar caminhos conhecidos
        possible_paths = [
            "E:/CentralDark/Pivete/profiles/pivete",
            "/e/CentralDark/Pivete/profiles/pivete",
            "C:/Users/danda/AppData/Local/hermes/profiles/pivete",
        ]
        for path in possible_paths:
            if Path(path).exists():
                return path
        return "E:/CentralDark/Pivete/profiles/pivete"  # fallback
    
    def _ensure_dirs(self):
        """Garante que diretórios necessários existem."""
        if self.skills_dir:
            self.skills_dir.mkdir(parents=True, exist_ok=True)
        if self.state_dir:
            self.state_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_skill_state_path(self, skill_name: str) -> Path:
        """Retorna caminho do arquivo de estado da skill."""
        self._ensure_dirs()
        return self.state_dir / f"{skill_name}_state.json"
    
    def _load_skill_state(self, skill_name: str) -> SkillState:
        """Carrega estado da skill do disco."""
        state_path = self._get_skill_state_path(skill_name)
        if state_path.exists():
            with open(state_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return SkillState.from_dict(data)
        return SkillState(name=skill_name, path=str(self.skills_dir / skill_name))
    
    def _save_skill_state(self, state: SkillState):
        """Salva estado da skill no disco."""
        self._ensure_dirs()
        state_path = self._get_skill_state_path(state.name)
        state.update_timestamp()
        with open(self._get_skill_state_path(state.name), 'w', encoding='utf-8') as f:
            json.dump(state.to_dict(), f, indent=2, ensure_ascii=False)
    
    def get_skill_state(self, skill_name: str) -> SkillState:
        """Obtém estado da skill (cache + disco)."""
        if skill_name not in self._skill_states:
            self._skill_states[skill_name] = self._load_skill_state(skill_name)
        return self._skill_states[skill_name]
    
    def save_skill_state(self, state: SkillState):
        """Salva estado da skill."""
        self._save_skill_state(state)
        self._skill_states[state.name] = state
    
    # ==================== HOOKS PRINCIPAIS ====================
    
    def on_skill_create(self, skill_name: str, skill_path: str = None) -> HookResult:
        """Hook: Nova skill criada - executa pipeline completo até FIXED_POINT."""
        if not self.config.enabled or not self.config.triggers.on_skill_create:
            return HookResult(success=True, message="Hook desabilitado na configuração")
        
        if skill_name in self.config.exclusions:
            return HookResult(success=True, message="Skill excluída do pipeline")
        
        try:
            skill_path = skill_path or str(Path(self.skills_dir) / skill_name)
            
            # Inicializar estado
            state = SkillState(name=skill_name, path=skill_path)
            state.status = SkillStatus.IN_PROGRESS
            self.save_skill_state(state)
            
            # Executar pipeline completo
            result = self._run_full_pipeline(skill_name)
            
            if result.success:
                return HookResult(
                    success=True,
                    message=f"Skill '{skill_name}' criada e evoluída até FIXED_POINT",
                    data={"skill": skill_name, "fixed_point": True}
                )
            else:
                return HookResult(
                    success=False,
                    message=f"Falha no pipeline de criação: {result.error}",
                    error=result.error
                )
                
        except Exception as e:
            return HookResult(
                success=False,
                message=f"Erro no hook on_skill_create: {str(e)}",
                error=str(e)
            )
    
    def on_skill_update(self, skill_name: str, changes: List[str] = None) -> HookResult:
        """Hook: Skill atualizada - executa pipeline incremental."""
        if not self.config.enabled or not self.config.triggers.on_skill_update:
            return HookResult(success=True, message="Hook desabilitado na configuração")
        
        if skill_name in self.config.exclusions:
            return HookResult(success=True, message="Skill excluída do pipeline")
        
        try:
            state = self.get_skill_state(skill_name)
            
            # Identificar gaps novos baseados nas mudanças
            # Por enquanto, executa pipeline incremental completo
            result = self._run_incremental_pipeline(skill_name)
            
            if result.success:
                return HookResult(
                    success=True,
                    message=f"Skill '{skill_name}' atualizada e evoluída até FIXED_POINT",
                    data={"skill": skill_name, "fixed_point": True}
                )
            else:
                return HookResult(
                    success=False,
                    message=f"Falha no pipeline incremental: {result.error}",
                    error=result.error
                )
                
        except Exception as e:
            return HookResult(
                success=False,
                message=f"Erro no hook on_skill_update: {str(e)}",
                error=str(e)
            )
    
    def on_skill_test(self, skill_name: str) -> HookResult:
        """Hook: Skill testada - verifica FIXED_POINT válido."""
        if not self.config.enabled or self.config.triggers.on_skill_test == "skip":
            return HookResult(success=True, message="Hook desabilitado")
        
        try:
            state = self.get_skill_state(skill_name)
            
            if self.config.triggers.on_skill_test == "verify_only":
                # Apenas verificar se FIXED_POINT ainda vale
                fp_result = self.fixed_point_verifier.verify(skill_name)
                
                if fp_result.fixed_point:
                    return HookResult(
                        success=True,
                        message=f"Skill '{skill_name}' - FIXED_POINT válido",
                        data={"fixed_point": True, "conditions": fp_result.conditions}
                    )
                else:
                    return HookResult(
                        success=False,
                        message=f"Skill '{skill_name}' - FIXED_POINT INVÁLIDO",
                        data={"fixed_point": False, "conditions": fp_result.conditions},
                        error="FIXED_POINT inválido"
                    )
            else:
                # Executar teste completo
                result = subprocess.run(
                    ["hermes", "--profile", "pivete", "skills", "test", skill_name],
                    capture_output=True, text=True, timeout=120
                )
                
                if result.returncode == 0:
                    return HookResult(success=True, message="Testes passaram")
                else:
                    return HookResult(
                        success=False,
                        message="Testes falharam",
                        error=result.stderr
                    )
                    
        except Exception as e:
            return HookResult(
                success=False,
                message=f"Erro no hook on_skill_test: {str(e)}",
                error=str(e)
            )
    
    def on_skill_load(self, skill_name: str) -> HookResult:
        """Hook: Skill carregada - verifica FIXED_POINT válido."""
        if not self.config.enabled or self.config.triggers.on_skill_load == "skip":
            return HookResult(success=True, message="Hook desabilitado")
        
        if self.config.triggers.on_skill_load == "verify_fixed_point":
            fp_result = self.fixed_point_verifier.verify(skill_name)
            
            if fp_result.fixed_point:
                return HookResult(
                    success=True,
                    message=f"Skill '{skill_name}' carregada - FIXED_POINT válido",
                    data={"fixed_point": True}
                )
            else:
                return HookResult(
                    success=False,
                    message=f"Skill '{skill_name}' - FIXED_POINT inválido ao carregar",
                    data={"fixed_point": False},
                    error="FIXED_POINT inválido"
                )
        
        return HookResult(success=True, message="Hook desabilitado ou verificação pulada")
    
    def on_pre_push(self, skill_name: str = None) -> HookResult:
        """Hook: Antes de git push - validar FIXED_POINT=TRUE."""
        if not self.config.enabled or not self.config.triggers.on_pre_push:
            return HookResult(success=True, message="Hook desabilitado")
        
        try:
            if skill_name:
                skills_to_check = [skill_name]
            else:
                # Verificar todas as skills modificadas no commit
                result = subprocess.run(
                    ["git", "diff", "--name-only", "HEAD"],
                    capture_output=True, text=True, cwd="E:/CentralDark/Pivete"
                )
                modified_files = result.stdout.strip().split('\n')
                skills_to_check = set()
                for f in modified_files:
                    if f.startswith("skills/"):
                        skill_name = f.split('/')[1]
                        skills_to_check.add(skill_name)
                skills_to_check = list(skills_to_check)
            
            failed_skills = []
            for skill in skills_to_check:
                fp_result = self.fixed_point_verifier.verify(skill)
                if not fp_result.fixed_point:
                    failed_skills.append(skill)
            
            if failed_skills:
                return HookResult(
                    success=False,
                    message=f"Push bloqueado: skills sem FIXED_POINT: {failed_skills}",
                    data={"failed_skills": failed_skills},
                    error="FIXED_POINT inválido em skills modificadas"
                )
            
            return HookResult(
                success=True,
                message="Push autorizado: todas skills com FIXED_POINT=TRUE",
                data={"checked_skills": skills_to_check}
            )
            
        except Exception as e:
            return HookResult(
                success=False,
                message=f"Erro no hook on_pre_push: {str(e)}",
                error=str(e)
            )
    
    # ==================== PIPELINE EXECUTION ====================
    
    def _run_full_pipeline(self, skill_name: str) -> HookResult:
        """Executa pipeline completo até FIXED_POINT."""
        try:
            # Usar pipeline runner
            result = self.pipeline_runner.run_full_pipeline(
                skill_name=skill_name,
                config=self.config
            )
            
            if result.fixed_point:
                # Atualizar estado final
                state = self.get_skill_state(result.skill_name)
                state.mark_fixed_point()
                self.save_skill_state(state)
                
                return HookResult(
                    success=True,
                    message="Pipeline completo - FIXED_POINT atingido",
                    data={"skill": result.skill_name, "fixed_point": True}
                )
            else:
                return HookResult(
                    success=False,
                    message="Pipeline não atingiu FIXED_POINT",
                    error="FIXED_POINT não atingido"
                )
                
        except Exception as e:
            return HookResult(
                success=False,
                message=f"Erro no pipeline completo: {str(e)}",
                error=str(e)
            )
    
    def _run_incremental_pipeline(self, skill_name: str) -> HookResult:
        """Executa pipeline incremental (apenas gaps novos)."""
        try:
            # Pipeline incremental usa mesma lógica mas apenas gaps novos
            result = self.pipeline_runner.run_incremental_pipeline(
                skill_name=skill_name,
                config=self.config
            )
            
            if result.fixed_point:
                state = self.get_skill_state(result.skill_name)
                state.mark_fixed_point()
                self.save_skill_state(state)
                
                return HookResult(
                    success=True,
                    message="Pipeline incremental completo - FIXED_POINT atingido",
                    data={"skill": result.skill_name, "fixed_point": True}
                )
            else:
                return HookResult(
                    success=False,
                    message="Pipeline incremental não atingiu FIXED_POINT",
                    error="FIXED_POINT não atingido"
                )
                
        except Exception as e:
            return HookResult(
                success=False,
                message=f"Erro no pipeline incremental: {str(e)}",
                error=str(e)
            )


# Instância global para uso direto
def get_hooks(profile_path: str = None) -> SkillLifecycleHooks:
    """Retorna instância dos hooks (singleton pattern)."""
    global _hooks_instance
    if '_hooks_instance' not in globals():
        globals()['_hooks_instance'] = SkillLifecycleHooks(profile_path=profile_path)
    return globals()['_hooks_instance']


# Funções de conveniência para uso direto nos hooks do Hermes
def on_skill_create(skill_name: str, skill_path: str = None):
    return get_hooks().on_skill_create(skill_name, skill_path)

def on_skill_update(skill_name: str, changes: list = None):
    return get_hooks().on_skill_update(skill_name)

def on_skill_test(skill_name: str):
    return get_hooks().on_skill_test(skill_name)

def on_skill_load(skill_name: str):
    return get_hooks().on_skill_load(skill_name)

def on_pre_push(skill_name: str = None):
    return get_hooks().on_pre_push(skill_name)