from pathlib import Path
import yaml, json
ROOT=Path(__file__).resolve().parents[1]
CFG=yaml.safe_load((ROOT/'02-CENTRALDARK-MASTER.yml').read_text(encoding='utf-8'))

def test_cross_session_not_authority():
    x=CFG['cross_session_reconciliation']; assert x['rules']['history_is_current_state'] is False; assert x['rules']['chat_memory_is_authority'] is False; assert x['rules']['unknown_remains_unknown'] is True

def test_oauth_code_is_ephemeral_not_plugin_token():
    x=CFG['oauth_bootstrap_control']; assert x['authorization_code_is_access_token'] is False; assert x['authorization_code_is_refresh_token'] is False; assert x['authorization_code_persist_allowed'] is False; assert 'CONNECT_OAUTH' in x['buttons']; assert 'REVOKE_DISCONNECT' in x['buttons']

def test_speed_fabric_anti_duplicate():
    x=CFG['hermes_speed_fabric']; assert x['rules']['n_agents_same_file'] is False; assert x['rules']['blind_global_rescan'] is False; assert x['rules']['k_is_minimum_parallelism_for_next_discriminant'] is True

def test_task_snapshot_and_visual_unknown():
    assert CFG['scheduled_task_ledger']['active_task_snapshot'][0]['title']=='CentralDark Status'; assert CFG['visual_cli_capability_catalog']['install_state_unknown_is_installed'] is False

def test_ui_hides_raw_credentials():
    u=json.loads((ROOT/'ui/admin/oauth-control-plane.json').read_text(encoding='utf-8')); assert u['rules']['raw_access_token_visible'] is False; assert u['rules']['raw_refresh_token_visible'] is False; assert u['rules']['button_click_implies_success'] is False
