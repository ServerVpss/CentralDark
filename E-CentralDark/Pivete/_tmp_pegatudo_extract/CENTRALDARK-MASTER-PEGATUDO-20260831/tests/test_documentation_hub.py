from pathlib import Path
import yaml

ROOT=Path(__file__).resolve().parents[1]

def test_documentation_hub_contract():
    c=yaml.safe_load((ROOT/'integration'/'documentation-hub.yml').read_text(encoding='utf-8'))
    assert c['mode']=='EXTEND_EXISTING_HUB'
    assert c['panel']['tab']=='DOCUMENTACAO'
    assert c['documentation_gate']['required_for_material_change'] is True
    assert c['documentation_gate']['raw_secret_can_satisfy_field'] is False
    assert c['knowledge_library']['scope_default']=='AUTHORIZED_CENTRALDARK_ONLY'
    assert c['multi_account']['one_hub_n_accounts'] is True
    assert c['gemini']['role']=='READ_ONLY_SWEEPER'

def test_port_1420_is_not_false_failure():
    r=yaml.safe_load((ROOT/'docs'/'PORTAS-E-GATILHOS-REGISTRY.yml').read_text(encoding='utf-8'))
    p=r['ports']['1420']
    assert p['observed']=='NONE'
    assert p['expected']=='UNKNOWN'
    assert p['next_cursor']=='FIND_CANONICAL_OWNER_AND_EXPECTATION'

def test_master_requires_documentation_gate():
    c=yaml.safe_load((ROOT/'02-CENTRALDARK-MASTER.yml').read_text(encoding='utf-8'))
    assert 'DOCUMENTATION_GATE' in c['master_chain']['steps']
    assert 'DOCUMENTATION_GATE_PASS' in c['global_fixed_point']['PASS']
    assert c['documentation_hub']['raw_secrets_in_documentation'] is False
    assert c['documentation_hub']['raw_secrets_in_gemini_context'] is False

def test_mermaid_documentation_flows_present():
    names={p.name for p in (ROOT/'diagrams').glob('*.mmd')}
    required={'09-documentation-gate.mmd','10-google-library-multi-account.mmd','11-port-trigger-registry.mmd','12-pr-worktree-context.mmd','13-documentation-panel-tab.mmd'}
    assert required <= names
