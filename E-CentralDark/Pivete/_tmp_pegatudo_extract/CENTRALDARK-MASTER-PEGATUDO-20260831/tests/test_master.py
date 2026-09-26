from pathlib import Path
import importlib.util

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("v", ROOT/"scripts"/"validate_master.py")
v = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v)

def test_master_valid():
    assert v.validate(v.load()) == []

def test_pegatudo_linked():
    c = v.load()
    assert c["pegatudo"]["linked_to_master"] is True
    assert "#PEGATUDO" in c["master_command"]

def test_single_external_delta():
    c = v.load()
    assert c["mission"]["external_delta_count"] == 1
    assert c["delta"]["external_count"] == 1

def test_old_failure_becomes_knowledge():
    c = v.load()
    assert c["pegatudo"]["old_failure_policy"]["delete_and_forget"] is False
    assert "regression_test" in c["pegatudo"]["old_failure_policy"]["convert_to"]
