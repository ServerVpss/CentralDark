from pathlib import Path
import yaml
ROOT=Path(__file__).resolve().parents[1]

def test_one_command_inventory_contract():
    c=yaml.safe_load((ROOT/'integration'/'one-command-inventory-site.yml').read_text(encoding='utf-8'))
    assert c['entry']['canonical']=='!CENTRALDARK'
    assert c['operators']['>>']=='FORWARD_CONTINUE'
    assert c['operators']['<<<']=='REVERSE_REMEASURE'
    assert c['operators']['shell_redirection'] is False
    assert c['inventory']['adaptive_fronts_max']==10
    assert c['inventory']['mirror_factor_max']==5
    assert c['readiness']['target_before_deploy_percent']==90
    assert c['readiness']['deploy_without_explicit_intent'] is False

def test_master_contains_inventory_and_readiness_gate():
    c=yaml.safe_load((ROOT/'02-CENTRALDARK-MASTER.yml').read_text(encoding='utf-8'))
    steps=c['master_chain']['steps']
    assert steps.index('UNIVERSAL_INVENTORY') > steps.index('PEGATUDO')
    assert steps.index('SITE_READINESS_GATE') < steps.index('DOCUMENTATION_GATE')
    assert c['one_command_execution']['bare_master_means']=='CONTINUE_CURRENT_DURABLE_MISSION_FROM_NEXT_CURSOR'
    assert c['trigger_router']['operator_tokens_are_shell_redirection'] is False
