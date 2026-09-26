from pathlib import Path
import yaml, json
ROOT=Path(__file__).resolve().parents[1]

def test_update_fabric_is_conditional_under_deltautil():
    m=yaml.safe_load((ROOT/'02-CENTRALDARK-MASTER.yml').read_text(encoding='utf-8'))
    u=m['update_fabric']
    assert u['owner']=='DELTAUTIL'
    assert u['mandatory_global_phase'] is False
    assert u['same_package_same_lineage'] is True
    assert u['parallel_package_for_update_forbidden'] is True

def test_bidirectional_sync_fails_closed_on_conflict():
    c=yaml.safe_load((ROOT/'integration'/'update-fabric-builder.yml').read_text(encoding='utf-8'))
    assert c['reconcile']['bidirectional'] is True
    assert c['reconcile']['conflict']=='STOP_WRITE_AND_RECONCILE'
    assert c['package']['new_parallel_package_for_same_lineage'] is False

def test_builder_is_factory_not_authority():
    c=yaml.safe_load((ROOT/'integration'/'update-fabric-builder.yml').read_text(encoding='utf-8'))
    assert c['builder']['role']=='FACTORY_NOT_AUTHORITY'
    assert c['builder']['deploy_requires_explicit_intent'] is True
    assert 'DOCUMENTATION' in c['builder']['required_before_promotion']

def test_temporal_machine_vs_human_formats():
    c=yaml.safe_load((ROOT/'docs'/'TEMPORAL-IDENTITY-DISPLAY.yml').read_text(encoding='utf-8'))
    assert c['machine']['date_key']=='YYYY-MM-DD'
    assert c['human_pt_BR']['date']=='DD/MM/YYYY'
    assert c['machine']['timestamp']=='RFC3339_WITH_OFFSET'
    assert c['package_visibility']['parallel_zip_per_update'] is False

def test_release_ledger_is_inside_same_package():
    cur=yaml.safe_load((ROOT/'releases'/'CURRENT.yml').read_text(encoding='utf-8'))
    rel=yaml.safe_load((ROOT/cur['release_ref']).read_text(encoding='utf-8'))
    assert cur['parallel_package'] is False
    assert rel['date_key']=='2026-08-31'
    assert rel['authority']=='LEDGER_ONLY_NOT_SECOND_PACKAGE'

def test_update_ui_exposes_sources_and_ptbr_time():
    u=json.loads((ROOT/'ui'/'admin'/'update-fabric.json').read_text(encoding='utf-8'))
    assert u['human_locale']=='pt-BR'
    assert u['timezone_required'] is True
    assert 'GitHub' in u['update_channels'] and 'Drive' in u['update_channels'] and 'SSH' in u['update_channels']
    assert u['rules']['parallel_package_for_same_lineage'] is False
