#!/usr/bin/env python3
"""
Teste de Integração - Hermes Regenerative Runtime
Valida se o runtime regenerativo está funcionando corretamente.
"""

import sys
import os
sys.path.insert(0, r"E:\CentralDark\Pivete\profiles\pivete\skills\hermes-runtime-hooks")

from lifecycle import (
    SkillLifecycleHooks,
    PipelineRunner,
    FixedPointVerifier,
    SkillState,
    PipelineConfig,
    get_hooks,
    on_skill_create,
    on_skill_update,
    on_skill_test,
    on_skill_load,
    on_pre_push,
    pipeline_runner,
)

def test_imports():
    """Testa se todos os módulos importam corretamente."""
    print("✅ Imports OK")

def test_config():
    """Testa configuração padrão."""
    config = PipelineConfig()
    assert config.enabled == True
    assert config.mode == "always"
    assert config.triggers.on_skill_create == True
    print("✅ Config OK")

def test_skill_state():
    """Testa estado da skill."""
    state = SkillState(name="test-skill", path="/test/path")
    assert state.name == "test-skill"
    assert state.generation == 0
    assert state.status.value == "unknown"
    
    state.add_generation({"candidate_id": "test-1", "status": "PENDING"})
    assert state.current_generation == 1
    
    state.mark_generation_accepted(0)
    assert state.accepted_generations == 1
    assert state.generation == 1
    
    state.mark_fixed_point()
    assert state.fixed_point == True
    print("✅ SkillState OK")

def test_fixed_point_verifier():
    """Testa verificador de fixed point."""
    verifier = FixedPointVerifier()
    result = verifier.verify("test-skill")
    
    assert result.fixed_point == True
    assert all(result.conditions.values())
    print("✅ FixedPointVerifier OK")

def test_pipeline_runner():
    """Testa pipeline runner."""
    runner = PipelineRunner()
    result = runner.run_full_pipeline("test-skill")
    
    assert result.success == True
    assert result.fixed_point == True
    assert result.gaps_processed >= 0
    print("✅ PipelineRunner OK")

def test_hooks():
    """Testa hooks de ciclo de vida."""
    hooks = SkillLifecycleHooks()
    
    # Test on_skill_create
    result = on_skill_create("test-new-skill")
    assert result.success == True
    assert result.data["fixed_point"] == True
    
    # Test on_skill_test
    result = on_skill_test("test-skill")
    assert result.success == True
    assert result.data["fixed_point"] == True
    
    print("✅ Hooks OK")

def test_pipeline_config_yaml():
    """Testa carregamento de config YAML."""
    import yaml
    from pathlib import Path
    
    config_path = Path(r"E:\CentralDark\Pivete\profiles\pivete\skills\hermes-runtime-hooks\config.yaml")
    if config_path.exists():
        with open(config_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        
        assert 'regenerative_pipeline' in data
        assert data['regenerative_pipeline']['enabled'] == True
        print("✅ Config YAML OK")
    else:
        print("⚠️ Config YAML não encontrado")

def run_all_tests():
    """Executa todos os testes."""
    print("\n" + "="*60)
    print("TESTES DO HERMES REGENERATIVE RUNTIME")
    print("="*60 + "\n")
    
    try:
        test_imports()
        test_config()
        test_skill_state()
        test_fixed_point_verifier()
        test_pipeline_runner()
        test_hooks()
        test_pipeline_config_yaml()
        
        print("\n" + "="*60)
        print("✅ TODOS OS TESTES PASSARAM!")
        print("="*60)
        return True
    except Exception as e:
        print(f"\n❌ FALHA: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)