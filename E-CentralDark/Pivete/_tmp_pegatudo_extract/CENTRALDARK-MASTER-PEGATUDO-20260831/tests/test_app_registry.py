from pathlib import Path
import yaml, json
ROOT=Path(__file__).resolve().parents[1]

def cfg():
    return yaml.safe_load((ROOT/'integration'/'delta-utils-gemini-modal.yml').read_text(encoding='utf-8'))['app_registry']

def test_registry_reuses_hub():
    c=cfg(); assert c['mode']=='ONE_HUB_MANY_APPS'; assert c['second_app_control_plane_forbidden'] is True

def test_secrets_never_become_context():
    i=cfg()['invariants']; assert i['raw_secret_in_context'] is False; assert i['token_in_docs'] is False

def test_connected_not_write_authority():
    i=cfg()['invariants']; assert i['connection_implies_write_authority'] is False; assert i['oauth_scope_implies_runtime_success'] is False

def test_measured_slack_and_figma_present():
    a=cfg()['provider_adapters']; assert a['SLACK']['workspace']=='CENTRALDARK'; assert a['SLACK']['workspace_id']=='T0BTRETGDC5'; assert a['FIGMA']['plan_tier']=='starter'; assert a['FIGMA']['write_authority']=='MEASURE_PER_TARGET'

def test_ui_has_status_dots_and_controls():
    u=json.loads((ROOT/'ui'/'admin'/'app-registry.json').read_text(encoding='utf-8')); assert u['states']['CONNECTED']['glyph']=='🟢'; assert 'TEST' in u['actions']; assert u['rules']['raw_secret_visible'] is False
