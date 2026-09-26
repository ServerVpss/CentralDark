from pathlib import Path
import json

ROOT = Path(r"E:\CentralDark\worktrees\tlc23-master-fixed-point-20260915")

def patch(rel, old, new):
    p = ROOT / rel
    b = p.read_bytes()
    text = b.decode("utf-8")
    nl = "\r\n" if "\r\n" in text else "\n"
    old_n = old.replace("\n", nl)
    new_n = new.replace("\n", nl)
    count = text.count(old_n)
    if count != 1:
        raise RuntimeError(f"{rel}: expected 1 match, got {count}")
    p.write_bytes(text.replace(old_n, new_n, 1).encode("utf-8"))
    print(f"PATCHED {rel}")

MASTER = "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml"
TRIGGERS = "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml"
ENGINE = "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml"
UNIVERSAL = "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/UNIVERSAL-ENGINE-METHOD.yml"
AUREOLA = "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AUREOLA-BAHIA-BIBLICA.yml"
RESOLVER = "scripts/trigger-fabric/centraldark_master_cycle.py"
VALIDATOR = "apps/modulos/HERMES-CORE/core/universal-method-contract.mjs"
ADMIN = "docs/CONSCIENCIA/ADMINISTRAVEIS.json"
patch(MASTER, '''expands_to:
  - ACORDAR
  - CALIBRAR
  - MULTIBUSSOLA
  - META_LUPA
  - RECONCILIAR
  - DELTA_UTIL
  - CONTRAPROVA
  - REMEDICAO
  - FIXED_POINT
  - REGISTRA
  - BOOT''', '''expands_to:
  - TLC23_OPEN
  - DESTINATION_LOCK
  - ACORDAR
  - CALIBRAR
  - MULTIBUSSOLA
  - PEGATUDO
  - DEBITO_COGNITIVO
  - READERS_MEASURE
  - META_LUPA
  - RENDEZVOUS
  - RECONCILIAR
  - DELTA_UTIL
  - OWNER
  - ONE_WRITER
  - PATCH_EXECUCAO
  - TESTE
  - CONTRAPROVA
  - REMEDICAO
  - REALITY_JUDGE
  - FIXED_POINT
  - TLC23_CLOSE
  - REGISTRA
  - HANDOFF
  - BOOT''')
old_chain = '''canonical_human_chain: "#CENTRALDARK -> #ACORDAR -> !CALIBRAR -> !MULTIBUSSOLA -> !META_LUPA -> !RECONCILIAR -> !DELTAUTIL -> !CONTRAPROVA -> !REMEDICAO -> !FIXED_POINT -> !REGISTRA -> !BOOT"
canonical_machine_chain: "!CENTRALDARK -> #ACORDAR -> !CALIBRAR -> !MULTIBUSSOLA -> !META_LUPA -> !RECONCILIAR -> !DELTAUTIL -> !CONTRAPROVA -> !REMEDICAO -> !FIXED_POINT -> !REGISTRA -> !BOOT"
canonical_chain: "!CENTRALDARK -> #ACORDAR -> !CALIBRAR -> !MULTIBUSSOLA -> !META_LUPA -> !RECONCILIAR -> !DELTAUTIL -> !CONTRAPROVA -> !REMEDICAO -> !FIXED_POINT -> !REGISTRA -> !BOOT"'''
new_chain = '''canonical_human_chain: "!CENTRALDARK -> TLC23_OPEN -> DESTINATION_LOCK -> #ACORDAR -> !CALIBRAR -> !MULTIBUSSOLA -> PEGATUDO -> DEBITO_COGNITIVO -> READERS_MEASURE -> !META_LUPA -> RENDEZVOUS -> !RECONCILIAR -> !DELTAUTIL -> OWNER -> ONE_WRITER -> PATCH/EXECUCAO -> TESTE -> !CONTRAPROVA -> !REMEDICAO -> REALITY_JUDGE -> !FIXED_POINT -> TLC23_CLOSE -> !REGISTRA -> HANDOFF -> !BOOT"
canonical_machine_chain: "!CENTRALDARK -> TLC23_OPEN -> DESTINATION_LOCK -> ACORDAR -> CALIBRAR -> MULTIBUSSOLA -> PEGATUDO -> DEBITO_COGNITIVO -> READERS_MEASURE -> META_LUPA -> RENDEZVOUS -> RECONCILIAR -> DELTA_UTIL -> OWNER -> ONE_WRITER -> PATCH_EXECUCAO -> TESTE -> CONTRAPROVA -> REMEDICAO -> REALITY_JUDGE -> FIXED_POINT -> TLC23_CLOSE -> REGISTRA -> HANDOFF -> BOOT"
canonical_chain: "!CENTRALDARK -> TLC23_OPEN -> DESTINATION_LOCK -> #ACORDAR -> !CALIBRAR -> !MULTIBUSSOLA -> PEGATUDO -> DEBITO_COGNITIVO -> READERS_MEASURE -> !META_LUPA -> RENDEZVOUS -> !RECONCILIAR -> !DELTAUTIL -> OWNER -> ONE_WRITER -> PATCH/EXECUCAO -> TESTE -> !CONTRAPROVA -> !REMEDICAO -> REALITY_JUDGE -> !FIXED_POINT -> TLC23_CLOSE -> !REGISTRA -> HANDOFF -> !BOOT"'''
patch(MASTER, old_chain, new_chain)

patch(MASTER, '''phase_contracts:
  ACORDAR:''', '''tlc23_methodology:
  role: INTERNAL_LOGICAL_GATE_OF_EXISTING_MASTER
  creates_new_executor: false
  creates_parallel_gate_system: false
  source_pdf: docs/CONSCIENCIA/04-MCP-E-CONECTORES/tlc23.pdf
  logic: HORN_FORWARD_CHAINING_TO_FIXED_POINT
  open_phase: TLC23_OPEN
  close_phase: TLC23_CLOSE
  facts_must_be_measured: true
  contradiction_blocks: true
  unknown_is_not_pass: true
  local_newer_is_candidate_not_authority: true
  action_eligible_when: [CAPABILITY_MEASURED, AUTHORITY_VALID, SCOPE_DETERMINED, OWNER_RESOLVED, WRITER_SCOPE_VALID, EVIDENCE_BOUND, NO_DESTRUCTIVE_BYPASS]
  green_in_scope_when: [ACTION_ELIGIBLE, EXECUTED, TEST_PASS, COUNTERPROOF_SURVIVES, REMEDICAO_T1, REALITY_JUDGE_PASS]

phase_contracts:
  ACORDAR:''')
patch(MASTER, '''    runtime_restart_implied: false

supporting_methods:''', '''    runtime_restart_implied: false

workspace_lifecycle_contract:
  applies_to: ALL_AGENTS_OPERATING_IN_CASA
  casa_engineering_root: "E:\\\\CentralDark"
  casa_repo_root: "E:\\\\CentralDark\\\\CentralDark"
  casa_worktrees_root: "E:\\\\CentralDark\\\\worktrees"
  casa_agent_temp_root: "E:\\\\CentralDark\\\\_tmp"
  casa_agent_cache_root: "E:\\\\CentralDark\\\\cache"
  casa_site_build_preview_root: "C:\\\\CentralDark"
  desktop_is_agent_temp_root: false
  windows_appdata_temp_is_centraldark_agent_temp_root: false
  random_c_drive_clone_is_default: false
  agent_created_artifact_requires_lifecycle_class: true
  lifecycle_classes: [SOURCE, WORKTREE, BUILD, TEMP, CACHE, LOG, RECEIPT, RUNTIME_STATE]
  temp_without_consumer_after_receipt: SAFE_DELETE_AFTER_PROOF
  cache_is_rebuildable: true
  repo_or_worktree_preserve_by_git_owner: true
  os_or_tool_internal_temp_is_not_reclassified_as_centraldark_storage: true
  vps_uses_same_taxonomy_not_same_paths_or_state: true
  casa_state_is_vps_state: false
  github_is_runtime_storage: false

supporting_methods:''')
