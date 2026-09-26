from pathlib import Path
import importlib.util, yaml, json

ROOT=Path(__file__).resolve().parents[1]

def mod(name,path):
    s=importlib.util.spec_from_file_location(name,path)
    m=importlib.util.module_from_spec(s); s.loader.exec_module(m); return m

router=mod("router",ROOT/"scripts"/"trigger_router.py")
horn=mod("horn",ROOT/"scripts"/"horn_engine.py")
validator=mod("validator",ROOT/"scripts"/"validate_master.py")
meta=mod("meta",ROOT/"scripts"/"github_provider_reality.py")

def test_master_valid(): assert validator.validate(validator.load())==[]
def test_dual_prefix(): assert router.parse("!CENTRALDARK x")["event"]==router.parse("#CENTRALDARK x")["event"]=="CENTRALDARK"
def test_improve_alias_typo():
    p=router.parse("#VAMOS_MELHORAR_OQUE_JA_EXITE"); assert p["event"]=="CENTRALDARK" and p["requested_phase"]=="IMPROVE_EXISTING"
def test_improve_alias_correct():
    p=router.parse("!MELHORE_OQUE_JA_EXISTE"); assert p["event"]=="CENTRALDARK" and p["requested_phase"]=="IMPROVE_EXISTING"
def test_pegatudo_in_master(): assert "PEGATUDO" in router.parse("!CENTRALDARK x")["chain"]
def test_unknown_trigger_fail_closed(): assert router.parse("!NAO_EXISTE")["status"]=="UNKNOWN_TRIGGER"
def test_local_fixed_point_not_finish():
    r=horn.close({"LOCAL_FIXED_POINT"},horn.centraldark_rules())
    assert "CONTINUE_GLOBAL_PROOF" in r["facts"] and "FIXED_POINT_PASS" not in r["facts"]
def test_horn_pass():
    facts={"CURRENT_HEAD","TESTS_PASS","COUNTERPROOF_SURVIVES","T1_STABLE","HASH_CHAIN_VALID","REQUIRED_BEARINGS_COVERED","UNKNOWN_MATERIAL_ZERO","NO_CONTRADICTION"}
    r=horn.close(facts,horn.centraldark_rules())
    assert not r["contradiction"] and "FIXED_POINT_PASS" in r["facts"]
def test_horn_writer_collision():
    r=horn.close({"WRITER_COLLISION"},horn.centraldark_rules())
    assert r["contradiction"]
def test_horn_unknown_promotion():
    r=horn.close({"UNKNOWN_MATERIAL","PROMOTION_ATTEMPT"},horn.centraldark_rules())
    assert r["contradiction"]
def test_meta_hash_deterministic():
    sample={"hooks":["1.2.3.4/32"],"domains":{"website":["github.com"]},"ssh_key_fingerprints":{"SHA256_RSA":"x"}}
    a=meta.build_receipt(sample,["2026-03-10"])
    b=meta.build_receipt(sample,["2026-03-10"])
    for k in ["meta_sha256","domains_sha256","hooks_sha256","versions_sha256"]: assert a[k]==b[k]
def test_meta_not_authentication():
    sample={}
    assert meta.build_receipt(sample)["meta_is_webhook_authentication"] is False
def test_art_is_not_proof():
    c=validator.load(); assert c["visual_layer"]["technical_proof"] is False
def test_screenpipe_sensor_boundary():
    c=validator.load(); assert c["screenpipe_evidence_provider"]["sensor_failure_is_world_failure"] is False
def test_hash_not_authentication():
    c=validator.load(); assert c["integrity"]["hash_alone_is_authentication"] is False
def test_v2_v3_forbidden():
    c=validator.load(); assert "V2" in c["infra"]["forbid_parallel_versions"] and "V3" in c["infra"]["forbid_parallel_versions"]


def test_universal_master_funnel_contract():
    c=validator.load(); f=c["universal_master_funnel"]
    assert f["enabled"] is True
    assert f["any_recognized_external_trigger_enters_master_once"] is True
    assert f["master_reentry_guard"] is True
    assert f["canonical_phase_prefix"]==["ACORDAR","CRISTALIZAR_MEASURE","CRISTALIZAR_FALLBACK"]

def test_hub_router_gemini_boundaries():
    c=validator.load()
    h=c["hub_capability_fabric"]; g=c["centraldark_router_gemini_context_fabric"]
    assert h["reuse_existing_hub"] is True and h["second_hub_forbidden"] is True
    assert g["reuse_existing_centraldark_router"] is True and g["second_router_forbidden"] is True
    assert g["router_is_authority"] is False
    assert g["gemini"]["may_write"] is False and g["gemini"]["may_judge"] is False
    assert g["gemini"]["raw_secrets_allowed"] is False

def test_google_control_plane_secret_boundary():
    c=validator.load()["google_workspace_control_plane"]
    assert c["credential_plane_is_agent_plane"] is False
    assert c["raw_secret_in_agent_context"] is False
    assert c["off_blocks_calls"] is True
