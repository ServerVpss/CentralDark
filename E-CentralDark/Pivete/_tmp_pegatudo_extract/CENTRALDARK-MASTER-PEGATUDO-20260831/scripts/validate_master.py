#!/usr/bin/env python3
from pathlib import Path
import yaml, copy, sys, importlib.util

ROOT=Path(__file__).resolve().parents[1]
CFG=ROOT/"02-CENTRALDARK-MASTER.yml"

def load():
    return yaml.safe_load(CFG.read_text(encoding="utf-8"))

def validate(c):
    E=[]
    def req(x,code):
        if not x:E.append(code)
    req(set(c["external_interface"]["accepted"])=={"!CENTRALDARK","#CENTRALDARK"},"MASTER_DUAL_PREFIX")
    req(c["external_interface"]["single_command_required"] is True,"NOT_SINGLE_COMMAND")
    req(c["trigger_router"]["prefix_semantics_identical"] is True,"PREFIX_DRIFT")
    req(c["trigger_router"]["default_centraldark_policy"][0]=="IMPROVE_EXISTING","IMPROVE_EXISTING_NOT_DEFAULT")
    req(c["pegatudo"]["embedded_in_centraldark"] is True,"PEGATUDO_NOT_EMBEDDED")
    req(c["pegatudo"]["external_delta_count"]==1,"DELTA_NOT_ONE")
    req(c["pegatudo"]["untrusted_content_is_instruction"] is False,"INJECTION_BOUNDARY")
    req(c["proof"]["unknown_is_pass"] is False,"UNKNOWN_IS_PASS")
    req(c["proof"]["writer_is_judge"] is False,"SELF_APPROVAL")
    req(c["proof"]["proof_criterion_defined_before_result"] is True,"POSTHOC_GUME")
    req(c["horn_engine"]["least_fixed_point"] is True,"NO_LEAST_FIXED_POINT")
    req(c["horn_engine"]["local_fixed_point_is_final_mission"] is False,"LOCAL_FP_ESCAPE")
    req(c["horn_engine"]["contradiction_blocks_promotion"] is True,"CONTRADICTION_ESCAPE")
    req(c["provider_reality"]["github"]["meta_is_webhook_authentication"] is False,"META_AS_AUTH")
    req(c["provider_reality"]["github"]["webhook_signature_still_required"] is True,"WEBHOOK_SIGNATURE_GAP")
    req(c["screenpipe_evidence_provider"]["second_recorder_forbidden"] is True,"SECOND_RECORDER")
    req(c["screenpipe_evidence_provider"]["sensitive_state_generic_context_forbidden"] is True,"SENSITIVE_CONTEXT")
    req(c["screenpipe_evidence_provider"]["sensor_failure_is_world_failure"] is False,"SENSOR_WORLD_CONFUSION")
    req(c["integrity"]["hash_alone_is_authentication"] is False,"HASH_AUTH_CONFUSION")
    req(c["infra"]["extension_over_replacement"] is True,"REPLACEMENT_ESCAPE")
    req(c["infra"]["zero_regression_required"] is True,"ZERO_REGRESSION_GAP")
    req(c["infra"]["reuse_before_create"] is True,"NO_REUSE")
    req(c["deploy"]["select_not_assume"] is True,"DEPLOY_DOGMA")
    req(c["global_fixed_point"]["no_false_green"] is True,"FALSE_GREEN")
    req(c["visual_layer"]["technical_proof"] is False,"ART_AS_PROOF")
    req(c["branch_reconciliation"]["required_before_material_validation"] is True,"NO_BASE_SYNC_GATE")
    req(c["branch_reconciliation"]["plain_force_push_forbidden"] is True,"FORCE_PUSH_ESCAPE")
    req(c["branch_reconciliation"]["validator_baseline_must_not_be_weakened_to_match_stale_branch"] is True,"STALE_BASELINE_WEAKENING")
    req(c["meta_lupa_identity"]["manual_stale_sha_forbidden"] is True,"STALE_META_LUPA_SHA")
    req(c["meta_lupa_identity"]["verify_with_git_hash_object"] is True,"META_LUPA_IDENTITY_NOT_VERIFIED")
    req(c["universal_master_funnel"]["enabled"] is True,"MASTER_FUNNEL_DISABLED")
    req(c["universal_master_funnel"]["any_recognized_external_trigger_enters_master_once"] is True,"MASTER_FUNNEL_BYPASS")
    req(c["universal_master_funnel"]["master_reentry_guard"] is True,"MASTER_REENTRY_GAP")
    req(c["universal_master_funnel"]["canonical_phase_prefix"]==["ACORDAR","CRISTALIZAR_MEASURE","CRISTALIZAR_FALLBACK"],"CANONICAL_PREFIX_DRIFT")
    req(c["hub_capability_fabric"]["second_hub_forbidden"] is True,"SECOND_HUB_ESCAPE")
    req(c["centraldark_router_gemini_context_fabric"]["second_router_forbidden"] is True,"SECOND_ROUTER_ESCAPE")
    req(c["centraldark_router_gemini_context_fabric"]["router_is_authority"] is False,"ROUTER_AUTHORITY_CONFUSION")
    req(c["centraldark_router_gemini_context_fabric"]["gemini"]["may_write"] is False,"GEMINI_WRITER_ESCAPE")
    req(c["centraldark_router_gemini_context_fabric"]["gemini"]["raw_secrets_allowed"] is False,"GEMINI_SECRET_CONTEXT")
    req(c["google_workspace_control_plane"]["raw_secret_in_agent_context"] is False,"AGENT_SECRET_CONTEXT")
    req(c["google_workspace_control_plane"]["off_blocks_calls"] is True,"UI_OFF_ONLY_VISUAL")
    req(c["documentation_hub"]["enabled"] is True,"DOCUMENTATION_HUB_DISABLED")
    req(c["documentation_hub"]["material_change_requires_documentation_gate"] is True,"DOCUMENTATION_GATE_BYPASS")
    req(c["documentation_hub"]["missing_required_documentation_is_pass"] is False,"UNDOCUMENTED_IS_PASS")
    req(c["documentation_hub"]["raw_secrets_in_documentation"] is False,"SECRET_IN_DOCUMENTATION")
    req(c["documentation_hub"]["raw_secrets_in_gemini_context"] is False,"SECRET_IN_GEMINI_CONTEXT")
    req("DOCUMENTATION_GATE" in c["master_chain"]["steps"],"DOCUMENTATION_GATE_NOT_IN_MASTER")
    req("DOCUMENTATION_GATE_PASS" in c["global_fixed_point"]["PASS"],"DOCUMENTATION_GATE_NOT_IN_FIXED_POINT")
    req("DELTAUTIL_RECONCILE" in c["master_chain"]["steps"],"DELTAUTIL_NOT_IN_MASTER")
    req(c["delta_utils"]["reuse_existing_deltautil_owner"] is True,"DELTAUTIL_SECOND_OWNER")
    req(c["delta_utils"]["semantic_fields_may_drop"] is False,"DELTAUTIL_SEMANTIC_DROP")
    req(c["delta_utils"]["proof_fields_may_drop"] is False,"DELTAUTIL_PROOF_DROP")
    req(c["gemini_modal"]["gemini_may_write"] is False,"GEMINI_MODAL_WRITER_ESCAPE")
    req(c["workspace_plugin_surface"]["iframe_requires_frame_policy_pass"] is True,"IFRAME_POLICY_BYPASS")
    req(c["workspace_plugin_surface"]["iframe_may_bypass_provider_security"] is False,"IFRAME_SECURITY_BYPASS")
    req(c["workspace_plugin_surface"]["plugin_install"]["requires_compatibility_preview"] is True,"PLUGIN_PREVIEW_BYPASS")
    req(c["delta_utils"]["percentages_are_proof"] is False,"PERCENT_AS_PROOF")
    req(c["update_fabric"]["owner"]=="DELTAUTIL","UPDATE_FABRIC_OWNER_DRIFT")
    req(c["update_fabric"]["mandatory_global_phase"] is False,"UPDATE_FABRIC_FORCED_GLOBAL")
    req(c["update_fabric"]["same_package_same_lineage"] is True,"UPDATE_PACKAGE_LINEAGE_SPLIT")
    req(c["update_fabric"]["parallel_package_for_update_forbidden"] is True,"UPDATE_PARALLEL_PACKAGE_ESCAPE")
    req(c["update_fabric"]["deploy_requires_explicit_intent"] is True,"UPDATE_DEPLOY_INTENT_BYPASS")
    req(c["update_fabric"]["builder_is_factory_not_authority"] is True,"BUILDER_AUTHORITY_ESCAPE")
    req(c["update_fabric"]["bidirectional_sync"]["conflict_action"]=="STOP_WRITE_AND_RECONCILE","BIDIRECTIONAL_CONFLICT_WRITE_ESCAPE")
    req(c["temporal_identity_display"]["machine_date"]=="YYYY-MM-DD","MACHINE_DATE_DRIFT")
    req(c["temporal_identity_display"]["human_locale"]=="pt-BR","HUMAN_LOCALE_DRIFT")
    req(c["temporal_identity_display"]["timezone_required"] is True,"TIMEZONE_MISSING")
    req(c["cross_session_reconciliation"]["rules"]["history_is_current_state"] is False,"HISTORY_AS_CURRENT")
    req(c["cross_session_reconciliation"]["rules"]["chat_memory_is_authority"] is False,"CHAT_MEMORY_AUTHORITY")
    req(c["oauth_bootstrap_control"]["authorization_code_persist_allowed"] is False,"OAUTH_CODE_PERSIST")
    req(c["oauth_bootstrap_control"]["authorization_code_is_access_token"] is False,"OAUTH_CODE_AS_ACCESS_TOKEN")
    req(c["oauth_bootstrap_control"]["raw_token_in_docs"] is False,"OAUTH_RAW_TOKEN_DOCS")
    req(c["hermes_speed_fabric"]["rules"]["n_agents_same_file"] is False,"DUPLICATE_SEARCH_WORK")
    req(c["hermes_speed_fabric"]["rules"]["blind_global_rescan"] is False,"BLIND_GLOBAL_RESCAN")
    req(c["visual_cli_capability_catalog"]["install_state_unknown_is_installed"] is False,"VISUAL_UNKNOWN_AS_INSTALLED")
    req("CODE_DOCUMENTATION_GATE" in c["master_chain"]["steps"],"CODE_DOC_GATE_NOT_IN_MASTER")
    req("CODE_DOCUMENTATION_GATE_PASS" in c["global_fixed_point"]["PASS"],"CODE_DOC_GATE_NOT_IN_FIXED_POINT")
    req(c["house_documentation_standard"]["enabled"] is True,"HOUSE_DOC_DISABLED")
    req(c["house_documentation_standard"]["human_language"]=="pt-BR","HOUSE_DOC_LANGUAGE_DRIFT")
    req(c["house_documentation_standard"]["code_identifiers"]=="ENGLISH","CODE_IDENTIFIER_LANGUAGE_DRIFT")
    req(c["house_documentation_standard"]["technical_view_required"] is True,"TECH_DOC_VIEW_MISSING")
    req(c["house_documentation_standard"]["mental_map_required"] is True,"MENTAL_MAP_VIEW_MISSING")
    req(c["house_documentation_standard"]["mental_map_may_replace_technical_view"] is False,"MENTAL_MAP_REPLACES_TECH_DOC")
    req(c["house_documentation_standard"]["material_line_traceability_required"] is True,"LINE_TRACEABILITY_GAP")
    req(c["house_documentation_standard"]["comment_every_line_required"] is False,"CODE_COMMENT_NOISE")
    req(c["house_documentation_standard"]["missing_doc_is_pass"] is False,"UNDOCUMENTED_CODE_PASS")
    req(c["communication_modes"]["default"]=="TRABALHO","COMMUNICATION_DEFAULT_DRIFT")
    req(c["communication_modes"]["resenha_requires_explicit_operator_intent"] is True,"RESENHA_AUTO_ACTIVATION")
    req(c["communication_modes"]["work_mode"]["parrot_request"] is False,"PARROT_WORK_MODE")
    req(c["plug_play_capability_package"]["install_to_guessed_path"] is False,"PLUGPLAY_GUESSED_PATH")
    req(c["plug_play_capability_package"]["parallel_owner_allowed"] is False,"PLUGPLAY_PARALLEL_OWNER")
    req(c["plug_play_capability_package"]["raw_secret_allowed"] is False,"PLUGPLAY_RAW_SECRET")
    req(c["plug_play_capability_package"]["documentation_gate_required"] is True,"PLUGPLAY_DOC_BYPASS")
    req(c["hermes_upstream_bridge"]["centraldark_cli_is_operator_owned_shell"] is True,"CLI_SHELL_OWNERSHIP_DRIFT")
    req(c["hermes_upstream_bridge"]["blind_upstream_merge_forbidden"] is True,"BLIND_HERMES_UPDATE")
    req(c["hermes_upstream_bridge"]["check_before_apply"] is True,"HERMES_UPDATE_NO_CHECK")
    req(c["hermes_upstream_bridge"]["sandbox_before_promotion"] is True,"HERMES_UPDATE_NO_SANDBOX")
    req(c["hermes_upstream_bridge"]["rollback_required"] is True,"HERMES_UPDATE_NO_ROLLBACK")
    req(c["js_ts_toolchain_research"]["shadow_before_replace"] is True,"TOOLCHAIN_BIG_BANG_REPLACE")
    req(c["js_ts_toolchain_research"]["rust_alone_is_not_adoption_proof"] is True,"RUST_AS_PROOF")
    req(c["github_profile_continuous"]["global_centraldark_may_be_marked_finalized"] is False,"CENTRALDARK_FALSE_FINAL")
    return E

def self_test():
    c=load()
    tests=[]
    tests.append(("baseline", not validate(c)))
    mutations=[
        (["proof","unknown_is_pass"],True),
        (["proof","writer_is_judge"],True),
        (["pegatudo","external_delta_count"],4),
        (["pegatudo","untrusted_content_is_instruction"],True),
        (["horn_engine","local_fixed_point_is_final_mission"],True),
        (["horn_engine","contradiction_blocks_promotion"],False),
        (["provider_reality","github","meta_is_webhook_authentication"],True),
        (["screenpipe_evidence_provider","second_recorder_forbidden"],False),
        (["screenpipe_evidence_provider","sensor_failure_is_world_failure"],True),
        (["integrity","hash_alone_is_authentication"],True),
        (["infra","reuse_before_create"],False),
        (["infra","zero_regression_required"],False),
        (["deploy","select_not_assume"],False),
        (["visual_layer","technical_proof"],True),
        (["branch_reconciliation","required_before_material_validation"],False),
        (["branch_reconciliation","plain_force_push_forbidden"],False),
        (["branch_reconciliation","validator_baseline_must_not_be_weakened_to_match_stale_branch"],False),
        (["meta_lupa_identity","manual_stale_sha_forbidden"],False),
        (["meta_lupa_identity","verify_with_git_hash_object"],False),
        (["universal_master_funnel","enabled"],False),
        (["universal_master_funnel","master_reentry_guard"],False),
        (["hub_capability_fabric","second_hub_forbidden"],False),
        (["centraldark_router_gemini_context_fabric","second_router_forbidden"],False),
        (["centraldark_router_gemini_context_fabric","router_is_authority"],True),
        (["centraldark_router_gemini_context_fabric","gemini","may_write"],True),
        (["centraldark_router_gemini_context_fabric","gemini","raw_secrets_allowed"],True),
        (["google_workspace_control_plane","raw_secret_in_agent_context"],True),
        (["google_workspace_control_plane","off_blocks_calls"],False),
        (["documentation_hub","enabled"],False),
        (["documentation_hub","material_change_requires_documentation_gate"],False),
        (["documentation_hub","missing_required_documentation_is_pass"],True),
        (["documentation_hub","raw_secrets_in_documentation"],True),
        (["documentation_hub","raw_secrets_in_gemini_context"],True),
        (["delta_utils","reuse_existing_deltautil_owner"],False),
        (["delta_utils","semantic_fields_may_drop"],True),
        (["delta_utils","proof_fields_may_drop"],True),
        (["gemini_modal","gemini_may_write"],True),
        (["workspace_plugin_surface","iframe_requires_frame_policy_pass"],False),
        (["workspace_plugin_surface","iframe_may_bypass_provider_security"],True),
        (["workspace_plugin_surface","plugin_install","requires_compatibility_preview"],False),
        (["delta_utils","percentages_are_proof"],True),
        (["update_fabric","owner"],"SECOND_OWNER"),
        (["update_fabric","mandatory_global_phase"],True),
        (["update_fabric","same_package_same_lineage"],False),
        (["update_fabric","parallel_package_for_update_forbidden"],False),
        (["update_fabric","deploy_requires_explicit_intent"],False),
        (["update_fabric","builder_is_factory_not_authority"],False),
        (["update_fabric","bidirectional_sync","conflict_action"],"WRITE_ANYWAY"),
        (["temporal_identity_display","machine_date"],"DD-MM-YYYY"),
        (["temporal_identity_display","human_locale"],"en-US"),
        (["temporal_identity_display","timezone_required"],False),
        (["cross_session_reconciliation","rules","history_is_current_state"],True),
        (["cross_session_reconciliation","rules","chat_memory_is_authority"],True),
        (["oauth_bootstrap_control","authorization_code_persist_allowed"],True),
        (["oauth_bootstrap_control","authorization_code_is_access_token"],True),
        (["oauth_bootstrap_control","raw_token_in_docs"],True),
        (["hermes_speed_fabric","rules","n_agents_same_file"],True),
        (["hermes_speed_fabric","rules","blind_global_rescan"],True),
        (["visual_cli_capability_catalog","install_state_unknown_is_installed"],True),
        (["house_documentation_standard","enabled"],False),
        (["house_documentation_standard","mental_map_may_replace_technical_view"],True),
        (["house_documentation_standard","missing_doc_is_pass"],True),
        (["communication_modes","default"],"RESENHA"),
        (["communication_modes","resenha_requires_explicit_operator_intent"],False),
        (["plug_play_capability_package","install_to_guessed_path"],True),
        (["plug_play_capability_package","parallel_owner_allowed"],True),
        (["hermes_upstream_bridge","blind_upstream_merge_forbidden"],False),
        (["hermes_upstream_bridge","sandbox_before_promotion"],False),
        (["hermes_upstream_bridge","rollback_required"],False),
        (["js_ts_toolchain_research","shadow_before_replace"],False),
        (["github_profile_continuous","global_centraldark_may_be_marked_finalized"],True),
    ]
    for idx,(path,val) in enumerate(mutations,1):
        d=copy.deepcopy(c); cur=d
        for p in path[:-1]: cur=cur[p]
        cur[path[-1]]=val
        tests.append((f"negative_{idx}", bool(validate(d))))
    ok=sum(1 for _,v in tests if v)
    for n,v in tests: print(f"TEST={n} RESULT={'PASS' if v else 'FAIL'}")
    print(f"DENOMINATOR={len(tests)} PASS={ok} FAIL={len(tests)-ok}")
    return 0 if ok==len(tests) else 1

if __name__=="__main__":
    if "--self-test" in sys.argv: raise SystemExit(self_test())
    e=validate(load())
    print("CENTRALDARK_MASTER="+("PASS" if not e else "FAIL"))
    for x in e: print("ERROR="+x)
    raise SystemExit(0 if not e else 1)
