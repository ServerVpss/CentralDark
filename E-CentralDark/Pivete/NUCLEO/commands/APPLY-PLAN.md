# COMANDO - APPLY-PLAN.yml
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_CENTRALDARK-HERMES-BROWSER-ADAPTER-PACK-20260823\CENTRALDARK-HERMES-BROWSER-ADAPTER-PACK-20260823\APPLY-PLAN.yml
**SHA:** 0b2873a226416a69
**Timestamp:** 2026-08-26T19:43:48.481875
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- foreground_contract:

### Ouro Bruto (primeiros 5000 chars)
```
schema_version: 1
mission_id: CENTRALDARK-HERMES-BROWSER-ADAPTER-01
baseline_main: dcf70053f2af1d95bd86867e6f043fb634e919d0
baseline_is_future_authority: false

preflight:
  - remeasure_main
  - remeasure_open_pr_writers
  - inspect_local_chrome
  - inspect_existing_zendriver_runtime
  - inspect_existing_mcp_runtime
  - prove_localhost_binding
  - prove_no_conflicting_browser_bridge

reuse:
  hermes_transport:
    owner: apps/modulos/HERMES-CORE/agents/Universal-Handler/agent.mjs
  evidence:
    owner: supabase/functions/_shared/evidence-envelope.mjs
  ingestion:
    owner: supabase/functions/agent-log/index.ts
  browser_mining:
    owner: scripts/memory-linker/artifact-capability.mjs
  dream:
    owner: scripts/memory-linker/dream-review-run.mjs
  zendriver:
    owner_root: apps/modulos/elite-gateway
  foreground_contract:
    owner: docs/INTEGRACOES/CHROME-DEVTOOLS-MCP.md

create:
  - local Browser Bridge V1 implementation
  - provider foreground adapter
  - provider zendriver adapter
  - tests
  - runtime receipt

do_not_create:
  - second_hermes
  - second_mcp_core
  - second_evidence_store
  - second_dream_engine
  - browser_brain
  - chatgpt_private_api_client

execution_order:
  - converge_zendriver_legacy_behind_provider
  - bind_foreground_provider_to_measured_chrome_mcp
  - start_browser_bridge_local_only
  - health_check
  - expose_capability_to_hermes_via_handler
  - run_foreground_e2e
  - run_background_e2e
  - wire_agent_log
  - wire_artifact_capability_when_learning_is_requested
  - prove_dream_candidate_path
  - emit_receipt

activation:
  localhost_only_default: true
  deploy: false
  vps_change: false
  public_exposure: false

final_claim:
  wired_requires:
    - foreground_e2e_pass_if_enabled
    - background_e2e_pass_if_enabled
    - hermes_receive_pass
    - browser_return_pass
    - evidence_envelope_pass

```

---

# COMANDO - APPLY-PLAN.yml
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_CENTRALDARK-LIVING-LEARNING-OS-CRYSTALLIZED-PACK-20260823\CENTRALDARK-LIVING-LEARNING-OS-CRYSTALLIZED-PACK-20260823\SOURCE-MATERIAL\.extracted_CENTRALDARK-HUMAN-MIND-ROUTER-APPLY-PACK-20260823\CENTRALDARK-HUMAN-MIND-ROUTER-APPLY-PACK-20260823\APPLY-PLAN.yml
**SHA:** 281eca2bf25eee4e
**Timestamp:** 2026-08-26T19:43:48.781770
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- orchestrator_contract: docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md

### Ouro Bruto (primeiros 5000 chars)
```
schema_version: 1
mission_id: CENTRALDARK-HUMAN-MIND-ROUTER-01
mode: APPLY_TO_EXISTING_SYSTEM
intent_authority: SEGREDO/CHEFE
deploy_authorized: false
vps_mutation_authorized: false

baseline:
  repository: ServerVpss/CentralDark
  observed_main_head: dcf70053f2af1d95bd86867e6f043fb634e919d0
  baseline_is_future_authority: false
  remeasure_before_write: true

preflight:
  - measure_main_head
  - measure_open_prs
  - measure_writer_scopes
  - verify_no_active_writer_same_scope
  - fetch_current_library_readme
  - fetch_current_catalog
  - fetch_current_library_router
  - run_existing_library_router_tests
  - classify_state_drift

scope:
  primary_owner: docs/BRAIN/03-DOCUMENTACAO/BIBLIOTECA/README.md
  runtime_owner: scripts/memory-linker/library-router.mjs
  orchestrator_contract: docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md
  agent_root: apps/modulos/HERMES-CORE/agents

phases:
  - id: P1
    name: materialize_documentation
    actions:
      - copy_repo_overlay
      - link_from_library_readme
      - link_conditionally_from_leia_me_ia
      - add_short_jarvis_integration_reference
    no_runtime_activation: true

  - id: P2
    name: extend_library_source_contract
    targets:
      - scripts/memory-linker/library-router.mjs
      - docs/BRAIN/03-DOCUMENTACAO/BIBLIOTECA/catalog.json
    actions:
      - add_allowed_formats_web_rss_github_podcast_public_social
      - add_public_source_provenance_validation
      - preserve_all_existing_formats
      - preserve_evidence_session_semantics
      - merge_catalog_delta_not_replace

  - id: P3
    name: add_generic_human_mind_router_agent
    create:
      - apps/modulos/HERMES-CORE/agents/Human-Mind-Router/agent.mjs
    actions:
      - load_routers_yml
      - instantiate_named_lenses_declaratively
      - route_problem_to_minimum_sufficient_lenses
      - recover_public_professional_sources
      - output_structured_lens_packets
      - normalize_and_reconcile
    invariants:
      - one_generic_runtime
      - no_impersonation
      - read_only
      - no_canonical_authority

  - id: P4
    name: tests
    modify:
      - scripts/memory-linker/library-router.test.mjs
      - apps/modulos/HERMES-CORE/agents/agents-contract.test.mjs
    implement_from: TEST-MATRIX.yml

  - id: P5
    name: gate_reuse
    target: .github/workflows/porta-de-entrada.yml
    actions:
      - reuse_existing_workflow
      - run_human_mind_router_tests_when_relevant_paths_change
    create_new_workflow: false

  - id: P6
    name: scheduler_binding
    actions:
      - discover_current_scheduler_owner
      - bind_living_update_only_to_existing_authorized_scheduler
    blocked_until:
      - scheduler_owner_measured
      - runtime_location_measured
      - activation_authorized
    note: "Preparar código/config é diferente de ativar runtime/deploy."

acceptance:
  - all_existing_library_tests_pass
  - all_human_mind_router_tests_pass
  - no_duplicate_runtime
  - no_private_tracking
  - no_impersonation
  - no_write_authority_in_lenses
  - public_sources_fail_closed_without_provenance
  - majority_does_not_equal_truth
  - current_position_unknown_without_fresh_evidence
  - catalog_old_formats_remain_valid
  - porta_de_entrada_gate_executes_relevant_suite
  - no_deploy

final_state_allowed:
  - READY_FOR_REVIEW
  - BLOCKED_STATE_DRIFT
  - BLOCKED_WRITER_CONFLICT
  - BLOCKED_TEST_FAILURE
  - BLOCKED_GATE_FAILURE

forbidden_final_claims:
  - PASS_without_same_head_evidence
  - deployed
  - live_monitoring_active_without_runtime_observation

```