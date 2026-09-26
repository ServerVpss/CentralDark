from pathlib import Path
import yaml
ROOT=Path(__file__).resolve().parents[1]
M=yaml.safe_load((ROOT/"plugin/centraldark-master/plugin-manifest.yml").read_text(encoding="utf-8"))
B=yaml.safe_load((ROOT/"plugin/centraldark-master/BOOTSTRAP.yml").read_text(encoding="utf-8"))

def test_plugin_is_adapter_not_parallel_owner():
    assert M["mode"]=="adapter_to_existing_owner"
    assert M["contract"]["no_parallel_authority"] is True

def test_dual_master_trigger():
    assert set(M["entrypoints"])=={"!CENTRALDARK","#CENTRALDARK"}

def test_self_improvement_requires_tests():
    assert M["contract"]["self_improvement_requires_tests"] is True

def test_successor_remeasures():
    assert B["centraldark_bootstrap"]["successor_learning"]["next_agent"]["must_remeasure_live_state"] is True

def test_session_memory_not_truth():
    assert B["centraldark_bootstrap"]["successor_learning"]["next_agent"]["session_memory_is_current_state"] is False
