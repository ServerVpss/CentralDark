#!/usr/bin/env python3
from pathlib import Path
import json, sys, re

ROOT=Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()
checks=[]

def check(path, needles=(), classification='PROVEN_IN_REPO'):
    p=ROOT/path
    ok=p.exists(); missing=[]; text=''
    if ok and needles:
        text=p.read_text(encoding='utf-8',errors='replace')
        for needle in needles:
            if needle not in text: missing.append(needle)
        ok=ok and not missing
    checks.append({'path':path,'classification':classification,'ok':ok,'missing':missing})

def check_absent(path, forbidden=(), classification='PROVEN_ABSENT_IN_REPO'):
    p=ROOT/path
    ok=p.exists(); violations=[]; text=''
    if ok:
        text=p.read_text(encoding='utf-8',errors='replace')
        for pattern in forbidden:
            if re.search(pattern,text): violations.append(pattern)
        ok=not violations
    checks.append({'path':path,'classification':classification,'ok':ok,'missing':violations})

check('LEIA-ME-IA.md',['#ACORDAR','!CALIBRAR','CENTRALDARK_AI_BOOT'])
check('LEIA-ME-IA.md',[
 'CAPABILITY_IS_AUTHORITY=false',
 'AGENT_MAY_REDUCE_HUMAN_OBJECTIVE=false',
 'METHOD_MAY_OPTIMIZE_OBJECTIVE_MUST_BE_PRESERVED=true',
 'FULL_REQUESTED_MATERIAL_MUST_BE_PROCESSED=true',
 'SESSION_OBSERVATION_IS_GLOBAL_CURRENT_STATE=false',
 'SINGLE_READER_MAY_DECLARE_GLOBAL_REALITY=false',
 'DIVERGENT_READERS_REQUIRE_RENDEZVOUS=true',
 'CURRENT_REALITY_REQUIRES_RECONCILIATION=true',
], classification='HUMAN_OBJECTIVE_AUTHORITY_BOUNDARY')
check('CENTRALDARK_AI_BOOT.yaml',[
 'adaptive_payload: true',
 'observed_evidence: "MEASURE_AT_RUNTIME: branch, HEAD, PR, runtime, tools, owner, writer_scope"',
 'role: "DISCOVER_FROM_PRESENT_GAP_AND_CAPABILITY"',
 'writer: "UNKNOWN_UNTIL_WRITER_SCOPE_MEASURED"',
 'frequency: "ADAPTIVE"',
], classification='LIVE_BOOT_PAYLOAD_CONTRACT')
check_absent('CENTRALDARK_AI_BOOT.yaml',[
 r'(?mi)^\s*observed_evidence:\s*".*\bbranch=',
 r'(?mi)^\s*observed_evidence:\s*".*\bHEAD=[0-9a-f]{7,40}\b',
 r'(?mi)^\s*role:\s*"EXECUTOR"\s*$',
 r'(?mi)^\s*writer:\s*"NONE"\s*$',
], classification='NO_FROZEN_BOOT_SNAPSHOT')
check('AGENTS.md',['#ACORDAR','!CALIBRAR','REALITY=JUDGE'])
check('docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md',['#ACORDAR + !CALIBRAR + !MULTIBUSSOLA','MESMO_CONTRATO=SIM'])
check('docs/CONSCIENCIA/MULTIBUSSOLA.md',['!MULTIBUSSOLA','REALITY_IS_JUDGE=true','BOTTOM-UP','ROUND-TRIP'])
check('.agents/skills/meta-lupa/SKILL.md',['# META LUPA','FALSO_VERDE_BLOQUEADO=SIM'])
check('docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md',[
 'PAPAGAIO_MODE=OFF',
 'POMBO_MODE=CHECKSUM_ON',
 'HISTORY != CURRENT_STATE',
 'ACTION != PROOF',
 'UNKNOWN != PASS',
 'ESTADO_MUDOU',
 'NOT_PROVEN',
 'DESTINATION_LOCK_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'UNKNOWN_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'PROVENIENCIA_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'NEXT_CURSOR_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'LEARNING_TRANSFER_FAIL',
 'ARCHITECTURE_CLASS = PROOF_CARRYING_CLOSED_LOOP_CONTROL',
 'STATE_MODEL = EPISTEMIC_STATE_MACHINE',
 'MUTATION_MODEL = SERIALIZED_SINGLE_WRITER',
 'CONTINUITY_MODEL = RECEIPT_PLUS_CHECKSUM_PLUS_NEXT_CURSOR',
 'EXECUTOR_CANNOT_SELF_APPROVE=true',
 'JUDGE_DOES_NOT_MUTATE=true',
 'GRAPH_IS_DERIVED_NOT_AUTHORITY=true',
], classification='CANONICAL_HANDOFF_POMBO_CHECKSUM')
check('docs/CONSCIENCIA/APRENDIZADOS/2026-08-24-alquimia-operacional-minerio-ouro-cristal.md',[
 'PAPAGAIO_IS_FAILURE_SIGNATURE=true',
 'POMBO_MODE=CHECKSUM_ON',
 'PROOF_WITHOUT_DESTINATION_BINDING = INCOMPLETE_HANDOFF',
 'RECEIPT_HEAD_SHA != CURRENT_HEAD_SHA',
 'PR_SUPERSEDED',
 'MULTIPLE_SURFACES_ARE_NOT_MULTIPLE_BRAINS=true',
 'RAW_MATERIAL_IS_NOT_GOLD=true',
 'GOLD_IS_NOT_CRYSTAL=true',
 'CRYSTAL_REQUIRES_OWNER_CONSUMER_TEST_GATE=true',
 'ALCHEMISTIC_CABINET_IS_CULTURAL_ALIAS_ONLY=true',
 'ITEM_PROOF_DESTINATION_BINDING',
 'ITEM_SAME_HEAD_RECEIPT',
 'ITEM_SUPERSEDED_CHAIN_FOLLOW',
 'ITEM_SCREENSHOT_SCOPE_GUARD',
 'ITEM_MULTI_SURFACE_ONE_DESTINATION',
 'ITEM_ALCHEMICAL_MATTER_STATES',
 'ITEM_LEARNING_TRANSFER',
], classification='ALCHEMICAL_OPERATIONAL_LEARNING_CRYSTAL')
check('docs/CONSCIENCIA/APRENDIZADOS/2026-08-24-estabilidade-sob-perturbacao-liberdade-com-fronteira.md',[
 'SOURCE=USER_SUPPLIED_LYRICAL_MATERIAL',
 'ABSTRACTION_ONLY=true',
 'FREEDOM_WITHOUT_BOUNDARY = DRIFT_RISK',
 'BOUNDARY_WITHOUT_ADAPTATION = BRITTLENESS_RISK',
 'SEGREDO/CHEFE_REMAINS_FINAL_AUTHORITY=true',
 'ONE_WRITER_PER_SCOPE=true',
 'UNKNOWN_IS_NOT_PASS=true',
 'REALITY_IS_JUDGE=true',
 'ROLLBACK_PATH_MUST_EXIST_FOR_MUTATION=true',
 'ANTIFRAGILE_CANDIDATE',
 'PERTURBATION_TEST',
 'CURRENT_INTENT',
], classification='RESILIENT_AUTONOMY_BOUNDARY_CRYSTAL')
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MATERIAL-INGEST.md',[
 'RAW_MATERIAL',
 'ASSAY',
 'CANDIDATE',
 'COUNTERPROOF',
 'GOLD',
 'CRYSTAL',
 'FLASH',
 'PROOF_DESTINATION_BINDING=true',
 'RECEIPT_IS_HEAD_SCOPED=true',
 'SUPERSEDED_PR_REQUIRES_SUCCESSOR_RESOLUTION=true',
 'SCREENSHOT_IS_NOT_RUNTIME_PROOF=true',
 'MULTIPLE_SURFACES_ARE_NOT_MULTIPLE_BRAINS=true',
 'LEARNING_TRANSFER_FAIL_ON_RETEACH=true',
 'ALCHEMISTIC_CABINET_IS_CULTURAL_ALIAS_ONLY=true',
 'ALCHEMISTIC_CABINET_IS_ENGINE=false',
 'SETOR_COGNITIVO',
 'SETOR_DETERMINISTICO',
 'ITEM_MINIMAL_CONTEXT_MAX_DETERMINISM=true',
 'ITEM_DETERMINISTIC_GAUNTLET=true',
 'ITEM_SHORT_LIVED_ROLE_CONTEXT=true',
 'ITEM_ARCHITECTURE_DEPENDENCY_GUARD=true',
 'ITEM_ITERATE_MEASURE_REORGANIZE=true',
 'ITEM_VALUES_OVER_BLIND_HUMAN_RITUAL=true',
 'RISK_PROPORTIONAL_GAUNTLET = true',
 'SAME_HEAD_EVIDENCE_REQUIRED = true',
], classification='MATERIAL_STATE_MACHINE_AND_DETERMINISTIC_SCAFFOLD')
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml',[
 'inherited_on_bot_entry: true',
 'mandatory_before_human_return: true',
 'no_new_workflow_when_owner_exists: true',
 'yellow_status_semantics: FORBIDDEN',
 'github_hosted_runner: FORBIDDEN',
 'scope: ALL_ACTIVE_ROOT_GITHUB_WORKFLOWS',
 'scope: ALL_PR_COMMIT_AND_RUNTIME_ELIGIBLE_FAILURES',
 'operational_rule_learning:',
 'proven_operational_rule_must_bind_to_runtime: true',
 'BIND_RULE_TO_ENGINE_OR_GATE',
 'POSITIVE_TEST',
 'NEGATIVE_TEST',
 'prose_only_rule: NOT_LEARNED',
 'repeated_chefe_instruction_after_promoted_rule: LEARNING_TRANSFER_FAIL',
 'verified_continuity:',
 'architecture_class: PROOF_CARRYING_CLOSED_LOOP_CONTROL',
 'state_model: EPISTEMIC_STATE_MACHINE',
 'mutation_model: SERIALIZED_SINGLE_WRITER',
 'continuity_model: RECEIPT_PLUS_CHECKSUM_PLUS_NEXT_CURSOR',
 'papagaio_mode: OFF',
 'pombo_mode: CHECKSUM_ON',
 'unknown_action: MEASURE_REALITY',
 'state_changed: RECALIBRATE',
 'checksum_semantics: BYTE_IDENTITY_NOT_SEMANTIC_PROOF',
 'executor_cannot_self_approve: true',
 'judge_does_not_mutate: true',
 'graph_is_derived_not_authority: true',
 'reality_is_final_judge: true',
 'next_equivalent_event_must_reuse_without_chefe_reteaching: true',
 'deterministic_scaffold:',
 'boot_prompt_policy: MINIMUM_SUFFICIENT_CONTEXT',
 'retrieval_policy: PRECISE_RETRIEVAL_SMALL_CONTEXT',
 'deterministic_gauntlet_required: true',
 'gauntlet_is_risk_proportional: true',
 'same_head_evidence_required: true',
 'machine_checkable_dependency_rules: PREFER_WHEN_MATERIAL',
 'use_only_if_material_gain_exceeds_coordination_overhead: true',
 'copy_human_ritual_blindly: false',
 'ITEM_MINIMAL_CONTEXT_MAX_DETERMINISM',
 'ITEM_DETERMINISTIC_GAUNTLET',
 'ITEM_SHORT_LIVED_ROLE_CONTEXT',
 'ITEM_ARCHITECTURE_DEPENDENCY_GUARD',
 'ITEM_ITERATE_MEASURE_REORGANIZE',
 'ITEM_VALUES_OVER_BLIND_HUMAN_RITUAL',
 'accepted_entries: ["!CENTRALDARK", "#CENTRALDARK"]',
 'one_writer_per_conflict_scope: true',
 'judge_independent_from_writer: true',
 'judge_may_mutate: false',
 'head_integrity: TESTED_HEAD_EQUALS_COMMITTED_HEAD_EQUALS_PUSHED_PR_HEAD',
 'CREATE_FALSIFIER',
 'GENERALIZE_IF_REUSABLE',
 'capability_is_authority: false',
 'agent_may_reduce_human_objective: false',
 'objective_must_be_preserved: true',
 'full_requested_material_must_be_processed: true',
 'AGENT_REDUCED_HUMAN_OBJECTIVE_WITHOUT_AUTHORIZATION',
 'session_observation_is_global_current_state: false',
 'single_reader_may_declare_global_reality: false',
 'divergent_readers_require_rendezvous: true',
 'current_reality_requires_reconciliation: true',
 'reconciliation_flow: [READERS, MEASURE, RENDEZVOUS, RECONCILE, CURRENT_REALITY, ONE_WRITER, PROOF]',
])
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml',[
 'event: BOT_ENTRY','event: PRE_HUMAN_RETURN','event: RESUME',
 'event: ANY_PR_OR_COMMIT','event: CI_RUNNER_ROUTE_FAILURE',
 'BYTE_IDENTICAL -> PROCESS_ONCE_KEEP_PROVENANCE',
 'GITHUB_HOSTED_RUNNER -> FAIL_CLOSED',
 'SAME_FAILURE_NO_NEW_INFO -> REUSE_CRYSTAL',
 'explicit_triggers: ["!CENTRALDARK", "#CENTRALDARK"]',
])
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml',[
 'engine_is_owner: false','prompt_consumer: apps/modulos/HERMES-CORE/prompts/hermes-core.md','LOAD_REFERENCE',
 'SELF_HEALING_FAILURE_LOOP','ANY_PR_OR_COMMIT_GATE','CANONICAL_SELF_HOSTED_RUNNER_POLICY'
])
check('apps/modulos/HERMES-CORE/prompts/hermes-core.md',[
 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml','OUTPUT_GUARD','LAST_GOOD_STATE','WORKING/FORJA != PASS',
 'Self-healing operacional universal','SAME_FAILURE_REUSES_CRYSTAL=true','GITHUB_HOSTED_RUNNER_ALLOWED=false'
])
check('apps/modulos/HERMES-CORE/core/orchestrator.mjs',[
 'const INTERVAL  = 5000',
 'const RETOMAR_INTERVALO = 45_000',
 'const GRAFO_INTERVAL = 30 * 60_000',
 'atualizarGrafo()',
 'const GC_INTERVAL     = 6 * 3600_000'
])
check('apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs',['export async function atualizarGrafo()','export async function buscarContexto'])
check('scripts/memory-linker/README.md',['NO_NEW_INFORMATION=STOP=true','DIRECT_CANONICAL_MUTATION=false','AUTONOMY_QUEUE_DIRECT_APPLY=false'])
check('scripts/memory-linker/dream-review-run.mjs')
check('scripts/memory-linker/pattern-discovery.mjs')
check('.agents/skills/session-intelligence-harvester/SKILL.md',['Run on session end (hook).'],'DECLARED_HOOK_NOT_RUNTIME_PROOF')
check('.agents/skills/knowledge-compiler/SKILL.md',[
 'MUITO MINERIO ENTRA',
 'POUCO OURO SAI',
 'OPERATIONAL_CRYSTAL',
 'FLASH_DOES_NOT_REPLAY_FULL_INGESTION=true',
 'SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true',
])
check('.agents/skills/vector-memory/SKILL.md',classification='CONTRACT_EXISTS_RUNTIME_NOT_PROVEN')
check('.github/workflows/porta-de-entrada.yml',[
 'WORKFLOW_REUSE_REQUIRED=1','GLOBAL_CONTINUITY_HARD_GATE=1','ANY_BRANCH_PUSH_GATED=1',
 'GITHUB_HOSTED_RUNNER_ALLOWED=0','SELF_HEALING_CONTRACT_REQUIRED=1'
])
check('.github/workflows/autonomia-promocao.yml',['Juiz determinístico','github-pr-confirmado-label.mjs'])
check('.github/workflows/trigger-fabric-package.yml',['Trigger Fabric Full Package','Fresh-extraction counterproof'])
check('docs/CONSCIENCIA/GITHUB-LABELS-OPERACIONAIS.md',['👑 PERMITO-SEGREDO','✅ PR CONFIRMADO','Label roteia trabalho; **nunca concede autoridade humana**.'])
check('docs/CONSCIENCIA/APRENDIZADOS/2026-08-24-pombo-correio-com-checksum.md',[
 'POMBO != CÉREBRO',
 'POMBO != OWNER',
 'POMBO != JUIZ',
 'DESTINATION_LOCK_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'UNKNOWN_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'PROVENIÊNCIA_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'NEXT_CURSOR_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'LEARNING_TRANSFER_FAIL',
 'CHECKSUM != PROVA_SEMÂNTICA',
 'docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md',
], classification='POMBO_CHECKSUM_HANDOFF_CONTRACT')

workflow_dir=ROOT/'.github'/'workflows'
forbidden_runner_labels=('ubuntu-latest','windows-latest','macos-latest')
# Exceções legítimas à GLOBAL_RUNNER_POLICY (self-hosted-only):
# estes dois são workflow_dispatch manuais R4 que PRECISAM de runner hosted
# por desenho — não são CI automático. vps-wake-hosted-ssh acorda o próprio
# runner self-hosted quando ele cai (self-hosted não acorda a si mesmo);
# vps-reboot-forensic precisa de saída pra API Contabo/Cloudflare. Autorizado
# por PERMITO-SEGREDO no cabeçalho de cada arquivo. Isentar, não remover.
runner_policy_exempt=frozenset({
    '.github/workflows/vps-reboot-forensic.yml',
    '.github/workflows/vps-wake-hosted-ssh.yml',
})
runner_violations=[]
workflow_files=[]
if workflow_dir.exists():
    workflow_files=sorted([*workflow_dir.glob('*.yml'),*workflow_dir.glob('*.yaml')])
    for wf in workflow_files:
        rel=str(wf.relative_to(ROOT)).replace('\\','/')
        if rel in runner_policy_exempt:
            continue
        text=wf.read_text(encoding='utf-8',errors='replace')
        for label in forbidden_runner_labels:
            if re.search(r'(?mi)^\s*runs-on\s*:\s*[^#\n]*\b'+re.escape(label)+r'\b', text):
                runner_violations.append({'path':rel,'label':label})
checks.append({
    'path':'.github/workflows/*.{yml,yaml}',
    'classification':'GLOBAL_RUNNER_POLICY',
    'ok':not runner_violations,
    'missing':runner_violations,
    'files_scanned':len(workflow_files),
})

failed=[c for c in checks if not c['ok']]
print(json.dumps({'checks':checks,'failed':len(failed),'runner_violations':runner_violations},ensure_ascii=False,indent=2))
if failed:
    print('REPO_CONTRACT_VERIFY=FAIL')
    if runner_violations:
        print('CANONICAL_RUNNER_POLICY=FAIL')
    sys.exit(1)
print('REPO_CONTRACT_VERIFY=PASS')
print('BOT_ENTRY_CONTRACT=PASS')
print('OUTPUT_GUARD_CONTRACT=PASS')
print('WORKFLOW_REUSE_CONTRACT=PASS')
print('CANONICAL_RUNNER_POLICY=PASS')
print('SELF_HEALING_CONTRACT=PASS')
print('OPERATIONAL_RULE_LEARNING_CONTRACT=PASS')
print('CANONICAL_HANDOFF_POMBO_CHECKSUM=PASS')
print('POMBO_CHECKSUM_HANDOFF_CONTRACT=PASS')
print('PROOF_CARRYING_CLOSED_LOOP_CONTROL=PASS')
print('ALCHEMICAL_OPERATIONAL_LEARNING_CRYSTAL=PASS')
print('RESILIENT_AUTONOMY_BOUNDARY_CRYSTAL=PASS')
print('MATERIAL_STATE_MACHINE_AND_LEARNING_BINDING=PASS')
print('DETERMINISTIC_SCAFFOLD_CONTRACT=PASS')
print('NOTE=PASS proves repository contract/path/runner-policy facts only; it does not prove live Windows/VPS/runtime inheritance.')
