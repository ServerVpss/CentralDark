from pathlib import Path
import yaml

ROOT=Path(__file__).resolve().parents[1]

def test_mermaid_pack_complete():
    files=sorted((ROOT/'diagrams').glob('*.mmd'))
    assert len(files) >= 9
    assert all(f.read_text(encoding='utf-8').strip() for f in files)

def test_router_gemini_contract_is_extension():
    c=yaml.safe_load((ROOT/'integration'/'centraldark-router-gemini-hub.yml').read_text(encoding='utf-8'))
    assert c['mode']=='EXTEND_EXISTING_ONLY'
    assert c['router']['reuse_existing'] is True
    assert c['router']['second_router_forbidden'] is True
    assert c['router']['authority'] is False
    assert c['gemini_sweeper']['may_write'] is False
    assert c['gemini_sweeper']['may_judge'] is False
    assert c['gemini_sweeper']['raw_secrets_allowed'] is False

def test_context_persistence_is_distilled_not_secret_dump():
    c=yaml.safe_load((ROOT/'integration'/'centraldark-router-gemini-hub.yml').read_text(encoding='utf-8'))
    p=c['context_persistence']
    assert p['persist_raw_secrets'] is False
    assert p['persist_full_raw_external_sources_by_default'] is False
    assert 'receipt' in p['persist'] and 'next_cursor' in p['persist']

def test_hub_off_is_not_cosmetic():
    c=yaml.safe_load((ROOT/'integration'/'centraldark-router-gemini-hub.yml').read_text(encoding='utf-8'))
    assert c['hub']['off_means_calls_blocked'] is True
    assert c['hub']['hard_disconnect_is_separate_action'] is True

def test_architecture_doc_states_runtime_boundary():
    t=(ROOT/'architecture'/'11-CENTRALDARK-HUB-GEMINI-CONTEXT-FABRIC.md').read_text(encoding='utf-8')
    assert 'does not prove' in t
    assert 'GEMINI_MAY_WRITE=false' in t
    assert 'SECOND_ROUTER_FORBIDDEN=true' in t
