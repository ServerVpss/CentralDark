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
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARCHITECTURE.md',[
 'Mapa visual derivado — aliases, nunca novos owners',
 'VISUAL_ALIAS_IS_NOT_OWNER=true',
 'VISUAL_ALIAS_IS_NOT_RUNTIME_PROOF=true',
 'FABLE_JUDGE_IS_ALIAS_OF_REALITY_JUDGE=true',
 'FABLE_LOOP_IS_ALIAS_OF_EXECUTE_MEASURE_REMEDIATE_LOOP=true',
 'JRVS_VISUAL_ALIAS_IS_NOT_CANONICAL_OWNER=true',
 'GUARDIAO_CASA_REPRESENTATION_GAP_IS_NOT_CANONICAL_OWNER=true',
 'NO_NEW_OWNER_FROM_VISUAL_METAPHOR=true',
], classification='VISUAL_ARCHITECTURE_ALIAS_CONTRACT')
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
check('.agents/skills/knowledge-compiler/SKILL.md')
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
 'PAPAGAIO_MODE = OFF',
 'POMBO_MODE = CHECKSUM_ON',
 'UNMEASURED_LANGUAGE_IS_NOT_STATE=true',
 'STATE_CHANGE_REQUIRES_RECALIBRATION=true',
 'ACTION_IS_NOT_PROOF=true',
 'FAILURE_REQUIRES_CAUSE_OWNER_MINIMAL_DELTA_RETEST=true',
 'PROVEN_RETURN_REQUIRES_RECEIPT_SHA_NEXT_CURSOR=true',
 'NOT_PROVEN_MUST_REMAIN_NOT_PROVEN=true',
 'POMBO_CHECKSUM_REQUIRES_MEASURED_STATE_TIME_HEAD_EVIDENCE_RESIDUAL_DESTINATION=true',
], classification='POMBO_CHECKSUM_HANDOFF_CONTRACT')

# Regra operacional global: a Casa não usa GitHub-hosted runners nos workflows raiz.
# Linux self-hosted é o default. Se a capacidade exigir outra plataforma, ela ainda
# precisa ser self-hosted e a necessidade deve permanecer explícita no próprio workflow.
workflow_dir=ROOT/'.github'/'workflows'
forbidden_runner_labels=('ubuntu-latest','windows-latest','macos-latest')
runner_violations=[]
workflow_files=[]
if workflow_dir.exists():
    workflow_files=sorted([*workflow_dir.glob('*.yml'),*workflow_dir.glob('*.yaml')])
    for wf in workflow_files:
        text=wf.read_text(encoding='utf-8',errors='replace')
        for label in forbidden_runner_labels:
            if re.search(r'(?mi)^\s*runs-on\s*:\s*[^#\n]*\b'+re.escape(label)+r'\b', text):
                runner_violations.append({'path':str(wf.relative_to(ROOT)),'label':label})
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
print('POMBO_CHECKSUM_HANDOFF_CONTRACT=PASS')
print('VISUAL_ARCHITECTURE_ALIAS_CONTRACT=PASS')
print('NOTE=PASS proves repository contract/path/runner-policy facts only; it does not prove live Windows/VPS/runtime inheritance.')
