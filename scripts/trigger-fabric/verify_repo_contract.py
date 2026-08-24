#!/usr/bin/env python3
from pathlib import Path
import json, sys

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
])
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml',[
 'event: BOT_ENTRY','event: PRE_HUMAN_RETURN','event: RESUME','BYTE_IDENTICAL -> PROCESS_ONCE_KEEP_PROVENANCE'
])
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml',[
 'engine_is_owner: false','prompt_consumer: apps/modulos/HERMES-CORE/prompts/hermes-core.md','LOAD_REFERENCE'
])
check('apps/modulos/HERMES-CORE/prompts/hermes-core.md',[
 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml','OUTPUT_GUARD','LAST_GOOD_STATE','WORKING/FORJA != PASS'
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
check('.github/workflows/porta-de-entrada.yml',['WORKFLOW_REUSE_REQUIRED=1','GLOBAL_CONTINUITY_HARD_GATE=1'])
check('.github/workflows/autonomia-promocao.yml',['Juiz determinístico','github-pr-confirmado-label.mjs'])
check('.github/workflows/trigger-fabric-package.yml',['Trigger Fabric Full Package','Fresh-extraction counterproof'])
check('docs/CONSCIENCIA/GITHUB-LABELS-OPERACIONAIS.md',['👑 PERMITO-SEGREDO','✅ PR CONFIRMADO','Label roteia trabalho; **nunca concede autoridade humana**.'])

failed=[c for c in checks if not c['ok']]
print(json.dumps({'checks':checks,'failed':len(failed)},ensure_ascii=False,indent=2))
if failed:
    print('REPO_CONTRACT_VERIFY=FAIL'); sys.exit(1)
print('REPO_CONTRACT_VERIFY=PASS')
print('BOT_ENTRY_CONTRACT=PASS')
print('OUTPUT_GUARD_CONTRACT=PASS')
print('WORKFLOW_REUSE_CONTRACT=PASS')
print('NOTE=PASS proves repository contract/path facts only; it does not prove live Windows/VPS/runtime inheritance.')
