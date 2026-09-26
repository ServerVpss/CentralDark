from pathlib import Path
WT=Path(r'E:\CentralDark\worktrees\tlc23-master-fixed-point-20260915')

def replace(rel, old, new):
    p=WT/rel
    t=p.read_text(encoding='utf-8-sig')
    if old not in t: raise SystemExit(f'MISSING:{rel}:{old[:60]}')
    p.write_text(t.replace(old,new,1),encoding='utf-8',newline='\n')
    print('PATCHED',rel)

rel='docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml'
old='''artifact_properties:\n  contract: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml\n  hermes_requires_properties: true\n  missing_required: NOT_FLASH_READY\noperational_rule_learning:'''
new='''artifact_properties:\n  contract: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml\n  hermes_requires_properties: true\n  missing_required: NOT_FLASH_READY\nworkspace_artifact_lifecycle:\n  casa_root: E:\\CentralDark\n  casa_engineering_repo: E:\\CentralDark\\CentralDark\n  casa_worktrees: E:\\CentralDark\\worktrees\n  casa_tmp: E:\\CentralDark\\_tmp\n  casa_cache: E:\\CentralDark\\cache\n  casa_site_build_preview: C:\\CentralDark\n  vps_root: CENTRALDARK_VPS_ROOT\n  vps_tmp: CENTRALDARK_VPS_ROOT/_tmp\n  vps_cache: CENTRALDARK_VPS_ROOT/cache\n  same_taxonomy_not_same_state: true\n  desktop_or_os_temp_for_agent_helpers: FORBIDDEN_WHEN_CENTRALDARK_TMP_AVAILABLE\n  os_or_tool_internal_temp: ALLOWED_NOT_CANONICAL\n  npx_npm_cache_node_modules: RECONSTRUCTIBLE_PACKAGE_MANAGER_CACHE\n  package_cache_must_not_be_absorbed_wholesale_into_apps_modulos: true\n  dependencies_enter_canonical_only_through_manifest_or_existing_owner: true\n  temp_without_consumer_after_persisted_result: SAFE_DELETE_AFTER_VERIFICATION\n  cache_without_reuse_value: EXPIRE_OR_CLEAN\n  repo_or_worktree: PRESERVE_BY_GIT_OWNER_POLICY\noperational_rule_learning:'''
replace(rel,old,new)
rel='docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml'
old='''  F_SEMANTICA:\n    related_notes:\n      required: false\n      type: list\n      description: Notas/owners relacionados; qualidade acima de quantidade'''
new='''  F_SEMANTICA:\n    related_notes:\n      required: false\n      type: list\n      description: Notas/owners relacionados; qualidade acima de quantidade\n  G_LIFECYCLE:\n    artifact_class:\n      required: false\n      type: enum\n      values: [SOURCE, WORKTREE, BUILD, TEMP, CACHE, LOG, RECEIPT, RUNTIME_STATE]\n    lifecycle_state:\n      required: false\n      type: enum\n      values: [ACTIVE, RECONSTRUCTIBLE, PERSISTED, CLEANUP_ELIGIBLE, EXPIRED, REMOVED]\n    environment_id:\n      required: false\n      type: enum\n      values: [CASA, GITHUB, VPS, EXTERNAL]\n    mission_id:\n      required: false\n      type: string\n    parent_event_id:\n      required: false\n      type: string\n    cleanup_eligible:\n      required: false\n      type: boolean\n    expires_at:\n      required: false\n      type: datetime'''
replace(rel,old,new)
old='''  unresolved_known_identity: UNKNOWN\n  unknown_is_not_pass: true'''
new='''  unresolved_known_identity: UNKNOWN\n  unknown_is_not_pass: true\n  agent_created_artifact_requires_lifecycle_classification: true\n  temp_is_not_canonical_asset: true\n  cache_is_reconstructible_not_authority: true\n  npm_npx_cache_node_modules_is_source_code: false\n  package_manager_cache_must_not_be_copied_into_apps_modulos: true\n  source_dependency_promotion_requires_existing_owner_or_manifest: true\n  casa_tmp_owner: E:\\CentralDark\\_tmp\n  casa_cache_owner: E:\\CentralDark\\cache\n  casa_site_build_preview_owner: C:\\CentralDark\n  same_taxonomy_does_not_mean_same_environment_state: true'''
replace(rel,old,new)

rel='.gitignore'
p=WT/rel
t=p.read_text(encoding='utf-8-sig')
append='''\n# CentralDark workspace lifecycle (Casa/VPS runtime state; never canonical source)\n_tmp/\ncache/\n'''
if '\n_tmp/\n' not in t:
    p.write_text(t.rstrip()+append,encoding='utf-8',newline='\n')
    print('PATCHED',rel)
else:
    print('UNCHANGED',rel)
