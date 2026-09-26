from pathlib import Path
import importlib.util, json, yaml
ROOT=Path(__file__).resolve().parents[1]

def load_mod():
    spec=importlib.util.spec_from_file_location('du',ROOT/'scripts'/'delta_utils.py')
    m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

def test_deltautil_contract_reuses_owner():
    c=yaml.safe_load((ROOT/'integration'/'delta-utils-gemini-modal.yml').read_text(encoding='utf-8'))
    assert c['mode']=='EXTEND_EXISTING_ONLY'
    assert c['owner']['canonical']=='DELTAUTIL'
    assert c['owner']['reuse_existing'] is True
    assert c['owner']['second_delta_engine_forbidden'] is True

def test_semantic_compaction_never_drops_proof():
    c=yaml.safe_load((ROOT/'integration'/'delta-utils-gemini-modal.yml').read_text(encoding='utf-8'))
    assert c['semantic_compaction']['grammar_may_shrink'] is True
    assert 'proof_field' in c['semantic_compaction']['never_drop']
    assert c['semantic_compaction']['digest_is_retrieval_layer_not_replacement'] is True

def test_gemini_modal_is_read_only():
    c=yaml.safe_load((ROOT/'integration'/'delta-utils-gemini-modal.yml').read_text(encoding='utf-8'))['gemini_modal']
    assert c['may_write'] is False and c['may_install'] is False and c['may_self_approve'] is False

def test_iframe_fails_closed_when_unknown():
    c=yaml.safe_load((ROOT/'integration'/'delta-utils-gemini-modal.yml').read_text(encoding='utf-8'))['workspace_plugin_admin']['safe_iframe']
    assert c['unknown']=='DO_NOT_EMBED'
    assert c['bypass_security_headers'] is False

def test_scores_are_deterministic_and_not_proof():
    m=load_mod()
    x={'signals':{'owner_match':True,'extension_only':True,'contract_match':True,'tests':True,'no_writer_collision':True,'secret_boundary':True,'documentation':True},'evidence_fields':[True,True], 'readiness_gates':[True,True], 'security_gates':[True,True], 'projected_gain_percent':37}
    a=m.evaluate(x); b=m.evaluate(x)
    assert a==b and a['scores']['compatibility_percent']==100 and a['status']=='ACTIVE_PASS'
    assert a['percent_is_proof'] is False and a['color_is_proof'] is False

def test_unknown_remains_unknown_not_zero():
    m=load_mod(); a=m.evaluate({'signals':{},'evidence_fields':[],'readiness_gates':[],'security_gates':[]})
    assert a['status']=='PENDING_UNKNOWN'
    assert a['scores']['compatibility_percent'] is None

def test_status_tokens_include_colored_dots():
    t=json.loads((ROOT/'ui'/'admin'/'status-protection-tokens.json').read_text(encoding='utf-8'))
    assert t['states']['ACTIVE_PASS']['glyph']=='🟢'
    assert t['states']['PENDING_UNKNOWN']['glyph']=='🟡'
    assert t['states']['BLOCKED_CONFLICT']['glyph']=='🔴'
    assert t['invariants']['percent_is_proof'] is False

def test_master_has_deltautil_internal_phase():
    c=yaml.safe_load((ROOT/'02-CENTRALDARK-MASTER.yml').read_text(encoding='utf-8'))
    assert 'DELTAUTIL_RECONCILE' in c['master_chain']['steps']
    assert c['delta_utils']['reuse_existing_deltautil_owner'] is True
    assert c['gemini_modal']['gemini_may_write'] is False
