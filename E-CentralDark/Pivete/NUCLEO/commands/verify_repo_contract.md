# COMANDO - verify_repo_contract.py
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_CentralDark-Pombo-Owner-FailClosed-20260824\CentralDark-Pombo-Owner-FailClosed-20260824\PATCH_TREE\scripts\trigger-fabric\verify_repo_contract.py
**SHA:** 422e47c6d4f23125
**Timestamp:** 2026-08-26T19:43:49.382114
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- check('docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md',['#ACORDAR + !CALIBRAR + !MULTIBUSSOLA','MESMO_CONTRATO=SIM'])
- 'GLOBAL_CONTINUITY_HARD_GATE=1',
- print('BOT_ENTRY_CONTRACT=PASS')
- print('OUTPUT_GUARD_CONTRACT=PASS')
- print('WORKFLOW_REUSE_CONTRACT=PASS')
- print('SELF_HEALING_CONTRACT=PASS')
- print('OPERATIONAL_RULE_LEARNING_CONTRACT=PASS')
- print('POMBO_CHECKSUM_HANDOFF_CONTRACT=PASS')

### Gaps
- ok=p.exists(); missing=[]; text=''

### Ouro Bruto (primeiros 5000 chars)
```
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

check('LEIA-ME-IA.md',['#ACORDAR','!CALIBRAR','CENTRALDARK_AI_BOOT'])
check('AGENTS.md',['#ACORDAR','!CALIBRAR','REALITY=JUDGE'])
check('docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md',['#ACORDAR + !CALIBRAR + !MULTIBUSSOLA','MESMO_CONTRATO=SIM'])
check('docs/CONSCIENCIA/MULTIBUSSOLA.md',['!MULTIBUSSOLA','REALITY_IS_JUDGE=true','BOTTOM-UP','ROUND-TRIP'])
check('.agents/skills/meta-lupa/SKILL.md',['# META LUPA','FALSO_VERDE_BLOQUEADO=SIM'])

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
])

check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml',[
 'event: BOT_ENTRY','event: PRE_HUMAN_RETURN','event: RESUME',
 'event: ANY_PR_OR_COMMIT','event: CI_RUNNER_ROUTE_FAILURE',
 'BYTE_IDENTICAL -> PROCESS_ONCE_KEEP_PROVENANCE',
 'GITHUB_HOSTED_RUNNER -> FAIL_CLOSED',
 'SAME_FAILURE_NO_NEW_INFO -> REUSE_CRYSTAL',
])

check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml',[
 'engine_is_owner: false',
 'prompt_consumer: apps/modulos/HERMES-CORE/prompts/hermes-core.md',
 'LOAD_REFERENCE',
 'SELF_HEALING_FAILURE_LOOP',
 'ANY_PR_OR_COMMIT_GATE',
 'CANONICAL_SELF_HOSTED_RUNNER_POLICY'
])

check('apps/modulos/HERMES-CORE/prompts/hermes-core.md',[
 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml',
 'OUTPUT_GUARD','LAST_GOOD_STATE','WORKING/FORJA != PASS',
 'Self-healing operacional universal',
 'SAME_FAILURE_REUSES_CRYSTAL=true',
 'GITHUB_HOSTED_RUNNER_ALLOWED=false'
])

check('apps/modulos/HERMES-CORE/core/orchestrator.mjs',[
 'const INTERVAL  = 5000',
 'const RETOMAR_INTERVALO = 45_000',
 'const GRAFO_INTERVAL = 30 * 60_000',
 'atualizarGrafo()',
 'const GC_INTERVAL     = 6 * 3600_000'
])

check('apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs',[
 'export async function atualizarGrafo()',
 'export async function buscarContexto'
])

check('scripts/memory-linker/README.md',[
 'NO_NEW_INFORMATION=STOP=true',
 'DIRECT_CANONICAL_MUTATION=false',
 'AUTONOMY_QUEUE_DIRECT_APPLY=false'
])
check('scripts/memory-linker/dream-review-run.mjs')
check('scripts/memory-linker/pattern-discovery.mjs')
check('.agents/skills/session-intelligence-harvester/SKILL.md',['Run on session end (hook).'],'DECLARED_HOOK_NOT_RUNTIME_PROOF')
check('.agents/skills/knowledge-compiler/SKILL.md')
check('.agents/skills/vector-memory/SKILL.md',classification='CONTRACT_EXISTS_RUNTIME_NOT_PROVEN')

check('.github/workflows/porta-de-entrada.yml',[
 'WORKFLOW_REUSE_REQUIRED=1',
 'GLOBAL_CONTINUITY_HARD_GATE=1',
 'ANY_BRANCH_PUSH_GATED=1',
 'GITHUB_HOSTED_RUNNER_ALLOWED=0',
 'SELF_HEALING_CONTRACT_REQUIRED=1'
])

check('.github/workflows/autonomia-promocao.yml',['Juiz determinístico','github-pr-confirmado-label.mjs'])
check('.github/workflows/trigger-fabric-package.yml',['Trigger Fabric Full Package','Fresh-extraction counterproof'])
check('docs/CONSCIENCIA/GITHUB-LABELS-OPERACIONAIS.md',[
 '👑 PERMITO-SEGREDO','✅ PR CONFIRMADO',
 'Label roteia trabalho; **nunca concede autoridade humana**.'
])

# OWNER REAL: esta é a correção do falso verde achado no PR #1136.
check('docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md',[
 'DESTINATION_LOCK_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'UNKNOWN_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'PROVENIÊNCIA_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'NEXT_CURSOR_DEVE_SOBREVIVER_AO_HANDOFF=true',
 'CHECKSUM != PROVA_SEMÂNTICA',
 'HANDOFF != NOVA MISSÃO',
 'OWNER_MISSING_OR_REGRESSED -> REPO_CONTRACT_VERIFY=FAIL',
], classification='POMBO_CANONICAL_HANDOFF_OWNER')

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
], classification='
```

---

# COMANDO - verify_repo_contract.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\trigger-fabric\verify_repo_contract.py
**SHA:** 809b991e8eb5aed9
**Timestamp:** 2026-08-28T02:57:39.246588
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- check('docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md',['#ACORDAR + !CALIBRAR + !MULTIBUSSOLA','MESMO_CONTRATO=SIM'])
- 'CRYSTAL_REQUIRES_OWNER_CONSUMER_TEST_GATE=true',
- 'WORKFLOW_REUSE_REQUIRED=1','GLOBAL_CONTINUITY_HARD_GATE=1','ANY_BRANCH_PUSH_GATED=1',
- print('BOT_ENTRY_CONTRACT=PASS')
- print('OUTPUT_GUARD_CONTRACT=PASS')
- print('WORKFLOW_REUSE_CONTRACT=PASS')
- print('SELF_HEALING_CONTRACT=PASS')
- print('OPERATIONAL_RULE_LEARNING_CONTRACT=PASS')
- print('POMBO_CHECKSUM_HANDOFF_CONTRACT=PASS')
- print('DETERMINISTIC_SCAFFOLD_CONTRACT=PASS')

### Gaps
- ok=p.exists(); missing=[]; text=''

### Ouro Bruto (primeiros 5000 chars)
```
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

check('LEIA-ME-IA.md',['#ACORDAR','!CALIBRAR','CENTRALDARK_AI_BOOT'])
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
 'pombo_mode: CHECKSUM_ON
```