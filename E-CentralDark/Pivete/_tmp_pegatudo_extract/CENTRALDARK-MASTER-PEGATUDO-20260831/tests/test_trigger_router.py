from pathlib import Path
import importlib.util

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("r", ROOT/"scripts"/"trigger_router.py")
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)

def test_dual_prefix_same_event():
    assert r.parse("!CENTRALDARK x")["event"] == "CENTRALDARK"
    assert r.parse("#CENTRALDARK x")["event"] == "CENTRALDARK"

def test_case_insensitive():
    assert r.parse("!centraldark x")["event"] == "CENTRALDARK"

def test_any_recognized_trigger_enters_master():
    p=r.parse("#ACORDAR objetivo")
    assert p["event"]=="CENTRALDARK" and p["requested_phase"]=="ACORDAR"
    assert p["chain"][:3]==["ACORDAR","CRISTALIZAR_MEASURE","CRISTALIZAR_FALLBACK"]

def test_cristalizar_typo_aliases_enter_same_master():
    for t in ["#CRISTALIZAR x","#CRYSTALIZAR x","#CRYSTALAIZAR x"]:
        p=r.parse(t); assert p["event"]=="CENTRALDARK" and p["requested_phase"]=="CRISTALIZAR"

def test_internal_phase_no_recursive_reentry():
    p=r.parse("#ACORDAR", master_context_active=True)
    assert p["master_reentry"] is False and p["status"]=="OK_INTERNAL_PHASE"

def test_pegatudo_in_master():
    assert "PEGATUDO" in r.parse("!CENTRALDARK x")["chain"]

def test_unknown_fail_closed():
    assert r.parse("!QUALQUERCOISA x")["status"] == "UNKNOWN_TRIGGER"

def test_objective_inline():
    assert r.parse("#CENTRALDARK resolver agora")["objective"] == "resolver agora"

def test_bare_master_continues_durable_cursor():
    p=r.parse('!CENTRALDARK')
    assert p['objective']=='CONTINUE_CURRENT_DURABLE_MISSION_FROM_NEXT_CURSOR'
    assert 'UNIVERSAL_INVENTORY' in p['chain']
    assert 'SITE_READINESS_GATE' in p['chain']
    assert 'DOCUMENTATION_GATE' in p['chain']

def test_operator_tokens_are_parser_semantics_not_shell_redirection():
    p=r.parse('!CENTRALDARK >> inventariar tudo')
    assert p['operator']=='FORWARD_CONTINUE'
    assert p['objective']=='inventariar tudo'
    q=r.parse('<<<', master_context_active=True)
    assert q['status']=='OK_INTERNAL_OPERATOR'
    assert q['operator']=='REVERSE_REMEASURE'
    assert r.parse('>>')['status']=='MASTER_CONTEXT_REQUIRED'


def test_deltautil_enters_master():
    p=r.parse('!DELTAUTIL candidato')
    assert p['event']=='CENTRALDARK'
    assert p['requested_phase']=='DELTAUTIL'
    assert 'DELTAUTIL_RECONCILE' in p['chain']
