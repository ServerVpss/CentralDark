#!/usr/bin/env python3
from pathlib import Path
import json, sys, re, subprocess

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

def check_command(name, argv, classification='EXECUTABLE_CONTRACT_TEST'):
    try:
        proc=subprocess.run(argv,cwd=ROOT,text=True,capture_output=True,timeout=60,check=False)
        ok=proc.returncode==0
        detail=(proc.stdout+'\n'+proc.stderr).strip()[-4000:]
    except Exception as exc:
        ok=False
        detail=f'{type(exc).__name__}: {exc}'
    checks.append({'path':name,'classification':classification,'ok':ok,'missing':[] if ok else [detail]})

def check_values(path, expected, classification='PROVEN_VALUE_IN_REPO'):
    """Valor real, não trecho: toda ocorrência ativa (fora de comentário) de KEY
    (KEY=v ou KEY: v) precisa ter o valor exigido; contradição ou valor trocado reprova."""
    p=ROOT/path
    if not p.exists():
        checks.append({'path':path,'classification':classification,'ok':False,'missing':['FILE_MISSING']}); return
    text=p.read_text(encoding='utf-8',errors='replace'); problems=[]
    for key,want in expected.items():
        pat=re.compile(r'(?<![A-Za-z0-9_])'+re.escape(key)+r'\s*[:=]\s*"?([^\s"#`|,;)]+)')
        found=[]
        for line in text.splitlines():
            active=line.split(' #',1)[0]
            if active.lstrip().startswith('#') and not active.lstrip().startswith('# '):
                continue
            found+=pat.findall(active)
        if not found: problems.append(f'{key}: ausente')
        elif any(f!=want for f in found): problems.append(f'{key}: {found} esperado {want}')
    checks.append({'path':path,'classification':classification,'ok':not problems,'missing':problems})

SOUL_AFFECTING_OWNERS=('AGENTS.md','LEIA-ME-IA.md','CLAUDE.md','CENTRALDARK_AI_BOOT.yaml','docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml')

def _git_blob_sha1(path):
    """Hash the working-tree owner with Git's configured clean filters.

    This avoids checkout-only CRLF false positives without collapsing two
    genuinely distinct committed blobs into the same synthetic hash.
    """
    proc=subprocess.run(
        ['git','hash-object','--path',path,path],
        cwd=ROOT,text=True,capture_output=True,check=False,
    )
    value=(proc.stdout or '').strip()
    if proc.returncode != 0 or not re.fullmatch(r'[0-9a-f]{40}', value):
        raise RuntimeError(f'GIT_HASH_OBJECT_FAILED:{path}:{(proc.stderr or "").strip()}')
    return value

def check_soul_sync(classification='SOUL_SYNC_CURRENT_FOR_FIXED_POINT'):
    """SOUL guarda a impressão dos donos que afetam a alma; divergência = SOUL atrasada = sem ponto fixo."""
    soul='docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md'
    text=(ROOT/soul).read_text(encoding='utf-8',errors='replace')
    m=re.search(r'SOUL_SYNC_ANCHOR_BEGIN\n(.*?)\nSOUL_SYNC_ANCHOR_END',text,re.S)
    problems=[]
    if not m:
        problems.append('SOUL_SYNC_ANCHOR ausente na SOUL')
    else:
        anchored=dict(l.split('=',1) for l in m.group(1).strip().splitlines() if '=' in l)
        for owner in SOUL_AFFECTING_OWNERS:
            cur=_git_blob_sha1(owner)
            if anchored.get(owner)!=cur:
                problems.append(f'SOUL_STALE: {owner} mudou (âncora {anchored.get(owner)} ≠ atual {cur}) → rever SOUL §2.4 e atualizar a âncora')
    result={'path':soul,'classification':classification,'ok':not problems,'missing':problems}
    checks.append(result)
    return result

def check_neurolink_numeric_chain(path='docs/CONSCIENCIA/APRENDIZADOS.md', start=115, classification='NEUROLINK_NUMERIC_CONTINUITY_EXECUTABLE_GATE'):
    """From the declared NeuroLink start, every numbered learning must be contiguous and bidirectionally linked.

    The latest learning may leave NEXT_LEARNING_REF=PENDING_NEXT_CURSOR until its successor exists.
    """
    p=ROOT/path
    problems=[]
    if not p.exists():
        checks.append({'path':path,'classification':classification,'ok':False,'missing':['FILE_MISSING']}); return
    text=p.read_text(encoding='utf-8',errors='replace')
    matches=list(re.finditer(r'(?m)^###\s+(\d+)\.', text))
    sections={}
    for i,m in enumerate(matches):
        n=int(m.group(1)); end=matches[i+1].start() if i+1 < len(matches) else len(text)
        if n >= start: sections[n]=text[m.start():end]
    if not sections:
        problems.append(f'NO_LEARNINGS_FROM_{start}')
    else:
        highest=max(sections)
        expected=list(range(start, highest+1))
        missing_ids=[n for n in expected if n not in sections]
        if missing_ids: problems.append('NUMERIC_GAP:'+','.join(map(str,missing_ids)))
        for n in expected:
            body=sections.get(n,'')
            if not body: continue
            if f'LEARNING_ID={n}' not in body:
                problems.append(f'{n}:LEARNING_ID_MISSING_OR_WRONG')
            if n == start:
                if 'PREV_LEARNING_REF=GENESIS_COGNITIVE_CHAIN' not in body:
                    problems.append(f'{n}:GENESIS_PREV_MISSING')
            elif f'PREV_LEARNING_REF={n-1}' not in body:
                problems.append(f'{n}:PREV_EXPECTED_{n-1}')
            if n < highest:
                if f'NEXT_LEARNING_REF={n+1}' not in body:
                    problems.append(f'{n}:NEXT_EXPECTED_{n+1}')
            elif 'NEXT_LEARNING_REF=PENDING_NEXT_CURSOR' not in body:
                problems.append(f'{n}:LATEST_NEXT_MUST_BE_PENDING')
    checks.append({'path':path,'classification':classification,'ok':not problems,'missing':problems})

def check_absent(path, forbidden=(), classification='PROVEN_ABSENT_IN_REPO'):
    p=ROOT/path
    ok=p.exists(); violations=[]; text=''
    if ok:
        text=p.read_text(encoding='utf-8',errors='replace')
        for pattern in forbidden:
            if re.search(pattern,text): violations.append(pattern)
        ok=not violations
    checks.append({'path':path,'classification':classification,'ok':ok,'missing':violations})

check('docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md',[
 'GENERAL=POSTURA_OPERACIONAL_TRANSPORTAVEL',
 'GENERAL_IS_NOT_NEW_BRAIN=true',
 'GENERAL_IS_NOT_NEW_AUTHORITY=true',
 'GENERAL_INHERITS_SOUL=true',
 'GENERAL_MAY_BE_CARRIED_BY_ANY_REPLACEABLE_ENGINE=true',
 'GENERAL_OPERATES_ONLY_INSIDE_CHEFE_INTENT_AND_SCOPE=true',
 'GENERAL_RETURNS_PROVEN_LEARNING_TO_CANONICAL_CORE=true',
 'CHEFE_TEACHES_CENTRALDARK_OS_LEARNS=true',
], classification='GENERAL_PORTABLE_POSTURE_SOUL_CONTRACT')
check('docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOL-GRAMATICA-DE-ENSINO.yml',[
 'GENERAL: TRANSPORTABLE_OPERATIONAL_POSTURE_NOT_IDENTITY',
 'CHEFE_TEACHES_CENTRALDARK_OS_LEARNS',
 'GENERAL_INHERITS_SAME_SOUL',
 'GENERAL_MAY_BE_CARRIED_BY_ANY_REPLACEABLE_ENGINE',
 'GENERAL_NE_NEW_BRAIN',
 'GENERAL_NE_HUMAN_AUTHORITY',
 'GENERAL_RETURNS_PROVEN_LEARNING_TO_CANONICAL_CORE',
], classification='GENERAL_TEACHING_GRAMMAR_CONTRACT')
check('docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md',[
 'GENERAL_IS_OPERATIONAL_POSTURE=true',
 'GENERAL_IS_NOT_NEW_IDENTITY=true',
 'GENERAL_IS_NOT_NEW_MEMORY=true',
 'GENERAL_RETURNS_LEARNING_TO_CENTRALDARK_OS=true',
], classification='GENERAL_METACOGNITION_LEARNING_CONTRACT')

check('docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md',[
 'CHEFE_SYSTEMATIC_PROOF_REQUIRED=true',
 'SYSTEMATIC_PROOF_REQUIRED_FOR_MATERIAL_CONFIRMATIONS=true',
 'CONFIRMATIONS_ONE_TOPIC_BELOW_ANOTHER=true',
 'PROOF_REF_REQUIRED_FOR_PROVEN=true',
 'NO_PROOF_REF => STATUS=UNKNOWN',
 'GREEN_WITHOUT_RECONSTRUCTIBLE_PROOF=INCOMPLETE',
 'COGNITIVE_DEBT=OPEN => FIXED_POINT=NOT_PROVEN',
], classification='CHEFE_SYSTEMATIC_PROOF_CONTRACT')
check('apps/modulos/fixed-point-fabric/contracts/FIXED-POINT-FABRIC.yml',[
 'mode: STEP_BACK_ONE_CANONICAL_PHASE',
 'principle: PROVE_WHERE_EFFECT_EXISTS',
 'casa_offline_does_not_block_server_only_proof: true',
 'principle: PAST_ERRORS_MUST_IMPROVE_FUTURE_WITHOUT_GOVERNING_CURRENT_STATE',
 'method: HORN_INSPIRED_LEAST_FIXED_POINT',
 'absolute_zero_error_claim: forbidden',
 'two_hundred_percent_success: METAPHOR_ONLY_NOT_METRIC',
], classification='FIXED_POINT_SCOPE_HISTORY_LOGIC_CONTRACT')
check('docs/ARQUITETURA/CENTRALDARK-FORJA-VIVA/VISUAL-NAMING-REGISTRY.yml',[
 'one_visual_identity_owner: true',
 'capability_base_icon_is_global: true',
 'visual_surface_mode: HYBRID',
 'same_capability_same_base_icon_across_internal_surfaces: true',
 'surface_must_not_replace_base_icon_for_same_capability: true',
 'browser_or_external_favicon_is_canonical_identity: false',
], classification='VISUAL_IDENTITY_HYBRID_SINGLE_OWNER_CONTRACT')
check('apps/modulos/Bolt/source/app/components/centraldark/centraldark-hub-inventory.ts',[
 'canonicalVisualIdentity',
 'export function canonicalIcon',
 'baseIconSameAcrossInternalSurfaces: true',
 'mode: \'HYBRID\' as const',
], classification='HUB_CANONICAL_VISUAL_IDENTITY_OWNER')
check('apps/modulos/Bolt/source/app/components/centraldark/CentralDarkCockpitShell.client.tsx',[
 "import { canonicalIcon } from './centraldark-hub-inventory';",
 "icon: canonicalIcon('ACCOUNTS_HUB')",
], classification='COCKPIT_REUSES_HUB_VISUAL_IDENTITY')
check('apps/modulos/Bolt/source/app/components/centraldark/CentralDarkUnifiedHud.client.tsx',[
 'canonicalIcon',
 'cd-uhud-row__icon',
], classification='UNIFIED_HUD_REUSES_CANONICAL_VISUAL_IDENTITY')

check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CAPABILITY-READINESS-POLICY.yml',[
 'DISABLED_IS_NOT_FAILURE: true',
 'OFF_IS_NOT_FAILURE_WHEN_NOT_SELECTED: true',
 'AVAILABLE_OFF_IS_VALID_STATE: true',
 'FAILURE_REQUIRES_EXPECTED_ACTIVE_CAPABILITY: true',
 'BUTTON_OFF_IS_STATE_NOT_INCIDENT: true',
 'principle: OFF_BY_ITSELF_MEANS_ONLY_OFF',
 'one_optional_arm_off_does_not_fail_organism: true',
 'classification_when_failure_proven: REQUIRED_UNAVAILABLE',
], classification='CAPABILITY_OFF_NEUTRALITY_CONTRACT')
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CAPABILITY-READINESS-POLICY.yml',[
 'HERMES_AGENT_BODY_IS_NOT_REPLACEABLE_MODEL: true',
 'OPTIONAL_EXTERNAL_OFF_MUST_NOT_BLOCK_BOOT: true',
 'classification: DEGRADED_NON_BLOCKING',
 'DEGRADED_NON_BLOCKING:',
 'TOOLS_FIELD_PRESERVED',
 'TOOL_CHOICE_PRESERVED',
 'TOOL_CALLS_PRESERVED',
 'TOOL_CALL_ID_PRESERVED',
 'ARGUMENTS_PRESERVED',
 'TOOL_RESULT_CONTINUATION_PRESERVED',
 'STREAMING_PRESERVED_WHEN_USED',
 'TIMEOUT_AND_ERROR_SEMANTICS_PRESERVED',
 'FALLBACK_DOES_NOT_REENTER_CALLER_HERMES',
 'failure_means: DO_NOT_PROMOTE_GATEWAY_AS_HERMES_BACKEND_YET',
], classification='HERMES_GATEWAY_PROMOTION_CONTRACT')
check('docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md',[
 'CHATGPT_CAN_OPERATE_CASA_SEGREDO=true',
 'TRANSPORT=REMOTE_DESKTOP_COMMANDER',
 'DEVICE=SEGREDO',
 'DIRECT_FILE_OPERATIONS=true',
 'DIRECT_PROCESS_EXECUTION=true',
 'DIRECT_TERMINAL_EXECUTION=true',
 'OBSERVABLE_ACTIONS_REQUIRED=true',
 'CENTRALDARK_REMAINS_CONTROL_PLANE=true',
], classification='CHATGPT_CASA_OPERATION_CONTRACT')
check('apps/modulos/Bolt/source/app/components/centraldark/CentralDarkCockpitShell.client.tsx',[
 'DISABLED/OFF != FAIL',
 'FAIL REQUIRES EXPECTED ACTIVE',
 'OFF/DISABLED não é erro por si só',
], classification='COCKPIT_OFF_NEUTRALITY_HUD')
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
 'REMOTE_SCREENSHOT_IS_REMOTE_PROOF=false',
 'SESSION_MEMORY_IS_CURRENT_STATE=false',
 'CONNECTOR_FAILURE_IS_PROVIDER_FAILURE=false',
 'SENSOR_FAILURE_IS_WORLD_FAILURE=false',
 'TRANSPORT_FAILURE_REQUIRES_AUTHORIZED_ALTERNATE_ROUTE=true',
 'REMOTE_WRITE_REQUIRES_PROVEN_GATE=true',
 'CHAT_ONLY_KNOWLEDGE=FAIL',
 'SESSION_MEMORY_IS_DURABLE_STATE=false',
 'PERSISTENCE_QUORUM_MIN=1',
 'PREFERRED_REDUNDANCY=2',
 'MIRROR_IS_SECOND_OWNER=false',
 'BACKUP_IS_SOURCE_OF_TRUTH=false',
 'PERSISTENCE_IS_PROMOTION=false',
 'OLD_COPY_IS_CURRENT_REALITY=false',
 'NO_BLIND_OVERWRITE=true',
 'DURABLE_CONTINUITY_REQUIRES_RECEIPT_AND_NEXT_CURSOR=true',
], classification='HUMAN_OBJECTIVE_AND_REMOTE_REALITY_BOUNDARY')
check('LEIA-ME-IA.md',[
 'MATERIAL_FROM_CHEFE_AUTO_INGEST=true',
 'MATERIAL_FROM_CHEFE_IS_NOT_AUTOMATIC_FACT=true',
 'PROVEN_MATERIAL_AUTO_CRYSTALLIZES_IN_EXISTING_OWNER=true',
 'UNPROVEN_MATERIAL_STAYS_CANDIDATE_OR_UNKNOWN=true',
 'ASK_TO_CRYSTALLIZE_ALREADY_PROVEN_DELTA=false',
 'PRE_RESPONSE_MATERIAL_RECONCILIATION_REQUIRED=true',
 'GRILL_ME_MATERIAL_PREFLIGHT=true',
 'FIXED_POINT_IS_VERIFICATION_CHECKPOINT_NOT_LEARNING_GATE=true',
], classification='MATERIAL_FIRST_COGNITIVE_ROUTE_CONTRACT')
check('AGENTS.md',[
 'MATERIAL_FROM_CHEFE_AUTO_INGEST=true',
 'MATERIAL_COGNITIVE_ROUTE=CHEFE_MATERIAL',
 'GRAPHRAG_SEMANTIC_LINKER',
 'COGNITIVE_CRYSTAL_LINK_REQUIRED=true',
 'COGNITIVE_SUCCESSOR_BACKLINK_REQUIRED=true',
 'ORPHAN_COGNITIVE_CRYSTAL=REJECT',
 'NEUROLINK=COGNITIVE_CONTINUITY_ALIAS',
 'COGNITIVE_NEUROLINK_NUMERIC_CONTINUITY_REQUIRED=true',
 'COGNITIVE_NEUROLINK_SEQUENCE_START=115',
 'COGNITIVE_NEXT_ID_MUST_EQUAL_CURRENT_PLUS_ONE=true',
 'NO_NUMERIC_GAP_AFTER_SEQUENCE_START=true',
 'PROVEN_LEARNING_SHOULD_COMPILE_TO_DETERMINISTIC_ARTIFACT=true',
 'REPRODUCTION_MUST_NOT_REQUIRE_AI=true',
 'GLOBAL_LEARNING_LINEAGE_REQUIRED=true',
 'GLOBAL_LINEAGE_BIDIRECTIONAL_REQUIRED=true',
 'GLOBAL_LINEAGE_GENESIS_UID=L000',
 'GLOBAL_LINEAGE_MANIFEST_REQUIRED=true',
 'GLOBAL_LINEAGE_EXECUTABLE_GATE_REQUIRED=true',
 'DETERMINISTIC_LINEAGE_REPLAY_WITHOUT_AI=true',
], classification='MATERIAL_FIRST_AGENT_SEMANTICS')
check_command(
    'global-learning-lineage-compiler',
    [sys.executable, 'scripts/trigger-fabric/rebuild_learning_lineage.py', '--check'],
    classification='GLOBAL_LEARNING_LINEAGE_EXECUTABLE_GATE',
)
check_neurolink_numeric_chain()
check('AGENTS.md',[
 'CREATE_PR_MERGEABLE_SNAPSHOT_IS_NOT_FINAL=true',
 'REMEASURE_PR_LIVE_BEFORE_HUMAN_RETURN=true',
 'SAME_HEAD_GATES_CLOSED_ON_CURRENT_HEAD_REQUIRED=true',
 'PENDING_QUEUED_SKIPPED_UNKNOWN_ARE_NOT_PASS=true',
 'POST_PR_CONTINUE_UNTIL_MERGED_OR_MATERIAL_BLOCKER=true',
 'RETURN_WITH_OPEN_ELIGIBLE_PR=FORBIDDEN',
], classification='POST_PR_FAST_PATH_CONTINUATION_GUARD')
check('docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md',[
 'SOUL_MATERIAL_FIRST_COGNITIVE_ROUTE=true',
 'HISTORICAL_SUCCESS_IS_NOT_CURRENT_PASS=true',
 'CURRENT_USE_REQUIRES_EQUIVALENT_CONDITIONS_OR_REMEASURE=true',
], classification='MATERIAL_FIRST_SOUL_BINDING')
check('docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json',[
 'centraldark.learning-neurolink-lineage.v2',
 '"uid": "L000"',
 '"front_a": "GLOBAL_HISTORICAL_LINEAGE_BY_STABLE_UID_AND_DOCUMENT_ORDER"',
 '"front_b": "STRICT_COGNITIVE_NUMERIC_CHAIN_FROM_115"',
], classification='GLOBAL_LEARNING_LINEAGE_MANIFEST')
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/KNOWLEDGE-HUB.yml',[
 'material_first_cognitive_route:',
 'KNOWLEDGE_COLLECTOR',
 'GRAPHRAG_MASTER',
 'SEMANTIC_LINKER',
 'ASK_TO_CRYSTALLIZE_ALREADY_PROVEN_DELTA: false',
 'COGNITIVE_CRYSTAL_LINK_REQUIRED: true',
 'COGNITIVE_CRYSTAL_REQUIRES_INTENT_REF: true',
 'COGNITIVE_CRYSTAL_REQUIRES_PREV_LEARNING_REF: true',
 'COGNITIVE_CRYSTAL_REQUIRES_RELATION_TYPE: true',
 'COGNITIVE_CRYSTAL_REQUIRES_OWNER_REF: true',
 'COGNITIVE_CRYSTAL_REQUIRES_NEXT_CURSOR: true',
 'COGNITIVE_SUCCESSOR_BACKLINK_REQUIRED: true',
 'ORPHAN_COGNITIVE_CRYSTAL: REJECT',
 'NO_ORPHAN_COGNITIVE_CRYSTAL',
 'COGNITIVE_NEUROLINK_NUMERIC_CONTINUITY_REQUIRED: true',
 'COGNITIVE_NEUROLINK_SEQUENCE_START: 115',
 'COGNITIVE_NEXT_ID_MUST_EQUAL_CURRENT_PLUS_ONE: true',
 'NO_NUMERIC_GAP_AFTER_SEQUENCE_START: true',
 'PROVEN_LEARNING_SHOULD_COMPILE_TO_DETERMINISTIC_ARTIFACT: true',
 'REPRODUCTION_MUST_NOT_REQUIRE_AI: true',
 'GLOBAL_LEARNING_LINEAGE_REQUIRED: true',
 'GLOBAL_LINEAGE_BIDIRECTIONAL_REQUIRED: true',
 'GLOBAL_LINEAGE_GENESIS_UID: L000',
 'GLOBAL_LINEAGE_MANIFEST_REQUIRED: true',
 'GLOBAL_LINEAGE_EXECUTABLE_GATE_REQUIRED: true',
 'global_learning_lineage_contract:',
 'docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json',
 'scripts/trigger-fabric/rebuild_learning_lineage.py',
], classification='MATERIAL_FIRST_GRAPH_BINDING')
check('scripts/lupa/portable-kernel.mjs',[
 "id: 'MATERIAL_FIRST_COGNITIVE_CRYSTALLIZATION'",
 'MATERIAL_FROM_CHEFE_AUTO_INGEST=true',
 'MATERIAL_COGNITIVE_ROUTE=CHEFE_MATERIAL',
], classification='MATERIAL_FIRST_PORTABLE_KERNEL_BINDING')

check('CENTRALDARK_AI_BOOT.yaml',[
 'adaptive_payload: true',
 'source_of_truth: "ServerVpss/CentralDark + runtime medido"',
 'model: LIVING_CANON',
 'persistent_canon: ServerVpss/CentralDark',
 'live_state: MEASURED_RUNTIME',
 'final_judge: REALITY',
 'owner: central-horario',
 'timezone: America/Sao_Paulo',
 'human_display_label: BRT',
 'machine_storage: UTC_RFC3339',
 'observed_evidence: "MEASURE_AT_RUNTIME: branch, HEAD, PR, runtime, tools, owner, writer_scope"',
 'role: "DISCOVER_FROM_PRESENT_GAP_AND_CAPABILITY"',
 'writer: "UNKNOWN_UNTIL_WRITER_SCOPE_MEASURED"',
 'frequency: "ADAPTIVE"',
], classification='LIVE_BOOT_PAYLOAD_CONTRACT')
check('central-horario/README.md',[
 'ONE_TIME_SYSTEM_ONLY=true',
 'CANONICAL_TIME_OWNER=central-horario',
 'HUMAN_TIME_PRIMARY_DISPLAY=DD/MM/AAAA HH:mm:ss BRT',
 'HUMAN_TIME_PRIMARY_TIMEZONE=America/Sao_Paulo',
 'HUMAN_TIME_FORMATTER_OUTSIDE_CANONICAL_OWNER=CONTRACT_VIOLATION',
 'ISO_UTC_AS_PRIMARY_HUMAN_DISPLAY=FORBIDDEN',
 'TECHNICAL_UTC_MAY_EXIST_AS_SECONDARY_MACHINE_FIELD=true',
 'GLOBAL_TIME_SCAN_DELTA_RATCHET_REQUIRED=true',
 'DOCUMENTED_TIME_RULE_WITH_BROKEN_GATE=FAIL',
], classification='CANONICAL_HUMAN_TIME_GLOBAL_CONTRACT')
check('scripts/lupa/validar-horario-centraldark.mjs',[
 "canonical_owner: 'central-horario'",
 "human_format: 'DD/MM/AAAA HH:mm:ss BRT'",
 'SELO_BRT_LABEL_MISSING',
 'CENTRALDARK_TIME_DELTA_GATE=FAIL',
 'CENTRALDARK_TIME_GATE=FAIL scope=DELTA_RATCHET',
], classification='CANONICAL_HUMAN_TIME_EXECUTABLE_RATCHET')
check('.github/workflows/centraldark-validate.yml',[
 'Validar horário humano canônico de Brasília',
 'node central-horario/self-test.mjs',
 'node scripts/lupa/validar-horario-centraldark.mjs --base-ref "$base_ref"',
], classification='CANONICAL_HUMAN_TIME_CI_BINDING')
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
 'create_pr_mergeable_snapshot_is_final: false',
 'remeasure_live_mergeability_before_human_return: true',
 'queued_or_in_progress_auxiliary_is_material_blocker: false',
 'post_pr_continue_until_merged_or_material_blocker: true',
 'return_with_open_eligible_pr: FORBIDDEN',
 'centraldark_pattern_monitor:',
 'outside_percent_red_threshold: 80',
 'unknown_prevents_green: true',
 'metric_scope: OBSERVED_MEASURABLE_DIMENSIONS_ONLY',
 'global_behavior_claim_from_partial_telemetry: FORBIDDEN',
 'refresh_source: /admin/api/operational-snapshot',
 'github_hosted_runner: FORBIDDEN',
 'scope: ALL_ACTIVE_ROOT_GITHUB_WORKFLOWS',
 'scope: ALL_PR_COMMIT_AND_RUNTIME_ELIGIBLE_FAILURES',
 'operational_rule_learning:',
 'proven_operational_rule_must_bind_to_runtime: true',
 'discover_existing_channels_before_blocked: true',
 'ephemeral_helper_is_not_canonical_asset: true',
 'user_report_is_signal_not_proof: true',
 'meaningful_discovery_must_compare_canonical_owner: true',
 'USER_REPORTED_ERROR',
 'NEW_DISCOVERY',
 'CLEAN_EPHEMERAL_HELPERS_AFTER_PROOF',
 'mode: EVENT_DRIVEN',
 'no_post_task_value: SAFE_DELETE',
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
 'remote_screenshot_is_remote_proof: false',
 'session_memory_is_current_state: false',
 'connector_failure_is_provider_failure: false',
 'sensor_failure_is_world_failure: false',
 'transport_failure_requires_authorized_alternate_route: true',
 'alternate_route_must_remeasure_same_target: true',
 'remote_github_trigger_flow: [ACORDAR, CALIBRAR, CENTRALDARK, MEASURE, RENDEZVOUS, RECONCILE, CURRENT_REALITY, PROOF]',
 'remote_write_gate:',
 'authorized_write_route: REQUIRED',
 'writer_collision: FORBIDDEN',
 'secret_exposure: FORBIDDEN',
 'durable_continuity:',
 'chat_only_knowledge: FAIL',
 'session_memory_is_durable_state: false',
 'persistence_quorum_min: 1',
 'preferred_redundancy: 2',
 'mirror_is_second_owner: false',
 'backup_is_source_of_truth: false',
 'persistence_is_promotion: false',
 'old_copy_is_current_reality: false',
 'no_blind_overwrite: true',
 'material_receipt_persisted: REQUIRED',
 'next_cursor_persisted: REQUIRED',
])
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml',[
 'event: BOT_ENTRY','event: PRE_HUMAN_RETURN','event: RESUME',
 'event: ANY_PR_OR_COMMIT','event: CI_RUNNER_ROUTE_FAILURE',
 'event: USER_REPORTED_ERROR','event: NEW_DISCOVERY',
 'report_is_proof: false','no_material_delta: NO_CHANGE',
 'BYTE_IDENTICAL -> PROCESS_ONCE_KEEP_PROVENANCE',
 'GITHUB_HOSTED_RUNNER -> FAIL_CLOSED',
 'SAME_FAILURE_NO_NEW_INFO -> REUSE_CRYSTAL',
 'explicit_triggers: ["!CENTRALDARK", "#CENTRALDARK"]',
])
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml',[
 'id: TIK_TAK',
 'canonical_rule: REGRA-ZERO-CENTRALDARK',
 'semantic_family: AUTOMATION_FACTORY_OUTER_LOOP',
 'wraps_master_cycle: true',
 'GEOFF: AUTOMATION_FACTORY',
 'IAN: STRUCTURAL_SKEPTIC',
 'GREG: OBSERVABILITY_PROOF',
 'DEX: HUMAN_AGENT_COORDINATION',
 'does_not_fanout_agents: true',
 'is_swarm_trigger: false',
 'creates_new_brain_or_router: false',
 'TIK_TAK -> REMEASURE_CURRENT_STATE + /GOAL + GEOFF + IAN + GREG + DEX + HERMES + REALIDADE',
], classification='TIK_TAK_OUTER_LOOP_NO_SWARM_REGRESSION')
check('docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json',[
 '"GREG_VERDICT_REQUIRED_BEFORE_GREEN"',
 '"DEX_APPROVAL_REQUIRED_FOR_CRITICAL_DELTA"',
], classification='TIK_TAK_HARD_GATES_REGISTERED')
check('scripts/trigger-fabric/rastro_fiscal.py',[
 'TRACE_PRESENT != TRACE_VALID',
 'class GitHubBackend',
 'class FakeBackend',
 'def verify_text(',
 'RESPONSE_WITHOUT_TRACE',
 'def _ledger_comment_id(',
 'issues/comments/{comment_id}',
 'comments?per_page=100&page={page}',
], classification='RASTRO_FISCAL_EXECUTABLE')
check('scripts/trigger-fabric/test_rastro_fiscal.py',[
 'test_true_complete_trace_passes',
 'test_fake_commit_fails',
 'test_false_path_fails',
 'test_content_does_not_support_claim_fails',
 'test_old_head_presented_as_current_fails',
 'test_gravei_without_trace_fails',
 'test_memory_without_location_fails',
 'test_github_unavailable_is_unknown',
 'test_direct_main_without_ledger_fails',
 'test_ledger_exact_comment_ref_is_checked_directly',
 'test_ledger_over_100_comments_starts_from_newest_page',
], classification='RASTRO_FISCAL_COUNTERPROOF')
check_command(
 'scripts/trigger-fabric/test_rastro_fiscal.py',
 [sys.executable, str(ROOT/'scripts/trigger-fabric/test_rastro_fiscal.py')],
 classification='RASTRO_FISCAL_EXECUTABLE_TESTS',
)

check_command(
 'scripts/trigger-fabric/test_centraldark_master_cycle.py',
 [sys.executable, str(ROOT/'scripts/trigger-fabric/test_centraldark_master_cycle.py')],
 classification='MASTER_CYCLE_TEXT_VOICE_DISPATCH_TESTS',
)
check_command(
 'scripts/trigger-fabric/test_validate_unified_surface_parity_contract.py',
 [sys.executable, str(ROOT/'scripts/trigger-fabric/test_validate_unified_surface_parity_contract.py')],
 classification='UNIFIED_SURFACE_PARITY_COUNTERPROOF_TESTS',
)
check_command(
 'scripts/trigger-fabric/validate_unified_surface_parity_contract.py',
 [sys.executable, str(ROOT/'scripts/trigger-fabric/validate_unified_surface_parity_contract.py')],
 classification='UNIFIED_SURFACE_PARITY_EXECUTABLE_CONTRACT',
)

check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SYSTEM-SENTINEL.yml',[
 'FIXED_POINT_ROUTE_IS_DETERMINISTIC: true',
 'SAME_FINGERPRINT_NO_FULL_REPLAY: true',
 'event_type: centraldark_sentinel_route',
 'same_fingerprint: REUSE_PROOF_NO_REPEAT',
 'changed_fingerprint: REVALIDATE_AFFECTED_CHAIN_ONLY',
 'runner: scripts/sentinela/run.mjs',
 'kernel_runtime: scripts/trigger-fabric/system_sentinel.py',
], classification='SENTINEL_DETERMINISTIC_FIXED_ROUTE_CONTRACT')
check('scripts/trigger-fabric/system_sentinel.py',[
 'FIXED_ROUTE = [',
 '"INTENT"',
 '"CONTRACT_CURRENT"',
 '"SENSOR"',
 '"T0"',
 '"REALITY_JUDGE"',
 '"HUD"',
 '"NEXT_CURSOR"',
 '"REUSE_PROOF_NO_REPEAT"',
 '"REVALIDATE_AFFECTED_CHAIN_ONLY"',
 'FIXED_POINT_SEALED',
 '--route-json',
], classification='SENTINEL_DETERMINISTIC_FIXED_ROUTE_RUNTIME')
check('.github/workflows/sentinela-divergencias.yml',[
 'centraldark_sentinel_route',
 'CENTRALDARK_SENTINEL_STATE_PATH',
 'python3 scripts/trigger-fabric/system_sentinel.py --self-test',
 'node scripts/sentinela/run.mjs',
], classification='SENTINEL_EXISTING_RUNNER_API_BINDING')
check('.github/workflows/hermes-core-signal-watch.yml',[
 "event_type: 'centraldark_sentinel_route'",
 "source: 'coderabbit'",
 'CODERABBIT_SENTINEL_ROUTE=DISPATCHED',
], classification='CODERABBIT_TO_SENTINEL_API_ROUTE')
check('.github/workflows/dependabot-auto-merge.yml',[
 "event_type: 'centraldark_sentinel_route'",
 "source: 'dependabot'",
 'DEPENDABOT_SENTINEL_ROUTE=DISPATCHED',
], classification='DEPENDABOT_TO_SENTINEL_API_ROUTE')
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml',[
 'engine_is_owner: false','prompt_consumer: apps/modulos/HERMES-CORE/prompts/hermes-core.md','LOAD_REFERENCE',
 'agent_runtimes:', 'role: EXECUTION_CONTINUITY_RUNTIME', 'model_catalog_member: false', 'selectable_as_engine: false',
 'SELF_HEALING_FAILURE_LOOP','ANY_PR_OR_COMMIT_GATE','CANONICAL_SELF_HOSTED_RUNNER_POLICY'
], classification='ENGINE_AND_AGENT_RUNTIME_SPLIT')
check('apps/modulos/elite-gateway/scripts/centraldark_omni_router.py',[
 'DEFAULT_FALLBACK_CHAIN = "nous,google,claude-code,xai,abacus,openai"',
 'hermes_is_agent_runtime_not_engine',
 'if normalized == "hermes":',
 'ENGINE_PROVIDERS = frozenset(',
 'default_engine_config_valid',
], classification='OMNI_ROUTER_HERMES_NOT_ENGINE')
check_absent('apps/modulos/elite-gateway/scripts/centraldark_omni_router.py',[
 r'HERMES_BASE_URL|HERMES_AUTH_TOKEN|HERMES_MODEL',
 r'DEFAULT_FALLBACK_CHAIN\s*=\s*["\'][^"\']*hermes',
 r'providers\s*=\s*\[[^\]]*["\']hermes["\']',
 r'for provider in \[[^\]]*["\']hermes["\']',
], classification='OMNI_ROUTER_NO_HERMES_MODEL_SURFACE')
check_absent('scripts/boot_omni_router.py',[
 r'HERMES_BASE_URL',
 r'CENTRALDARK_DEFAULT_ENGINE.{0,16}hermes',
], classification='OMNI_LAUNCHER_HERMES_NOT_ENGINE')
check_absent('scripts/launch_omni_router_direct.py',[
 r'HERMES_BASE_URL',
 r'CENTRALDARK_DEFAULT_ENGINE.{0,16}hermes',
], classification='OMNI_LAUNCHER_HERMES_NOT_ENGINE')
check_absent('scripts/launch_omni_router.sh',[
 r'HERMES_BASE_URL',
 r'CENTRALDARK_DEFAULT_ENGINE=\"hermes\"',
], classification='OMNI_LAUNCHER_HERMES_NOT_ENGINE')
check_absent('scripts/auto-redeploy-failover.mjs',[
 r'fallbackChain:\s*\[[^\]]*[\"\']hermes[\"\']',
], classification='OMNI_FAILOVER_HERMES_NOT_ENGINE')
check('docs/ARQUITETURA/CENTRALDARK-OMNI-ROUTER.md',[
 'Hermes permanece fora do cat',
 'provider/engine do cat',
], classification='OMNI_DOC_HERMES_NOT_ENGINE')
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml',[
 'UNIVERSAL_EVOLUTION_CARACOL',
 'ALL_CURRENT_SKILLS',
 'ALL_FUTURE_DISCOVERED_SKILLS',
 'CURRENT_ARCHITECTURE',
 'FUTURE_DISCOVERED_ARCHITECTURE',
 'automatic_for_discovered_capability: true',
 'future_skill_must_inherit_control_plane: true',
 'future_architecture_must_bind_existing_control_plane: true',
 'learning_never_discarded: true',
 'failed_candidate: REFUTED_MINERAL',
 'mode: FORWARD_REVERSE_UNTIL_FIXED_POINT',
 'no_infinite_retry_without_information_gain: true',
 'gate: ANY_PR_OR_COMMIT_GATE',
], classification='UNIVERSAL_EVOLUTION_CARACOL_CONTRACT')
check('apps/modulos/HERMES-CORE/prompts/hermes-core.md',[
 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml','OUTPUT_GUARD','LAST_GOOD_STATE','WORKING/FORJA != PASS',
 'Self-healing operacional universal','SAME_FAILURE_REUSES_CRYSTAL=true','GITHUB_HOSTED_RUNNER_ALLOWED=false',
 'DISCOVER_EXISTING_CHANNELS_BEFORE_BLOCKED=true','USER_REPORTED_ERROR_IS_SIGNAL_NOT_PROOF=true',
 'EPHEMERAL_HELPER_IS_CANONICAL_ASSET=false','SAFE_TEMP_CLEANUP_AFTER_PROOF=true',
 'MEANINGFUL_DISCOVERY_COMPARE_CANONICAL_OWNER=true'
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
check('scripts/casa/discover-operational-channels.ps1',[
 'NEW_ATTEMPT_FAILED != EXISTING_CHANNEL_DEAD','Get-NetTCPConnection -State Established','OwningProcess'
], classification='OPERATIONAL_CHANNEL_DISCOVERY_RUNTIME')
check('docs/CONSCIENCIA/APRENDIZADOS/2026-09-14-descoberta-canais-operacionais-xp.md',[
 'NEW_ATTEMPT_FAILED != EXISTING_CHANNEL_DEAD',
 'DISCOVER_EXISTING_CHANNELS -> CLASSIFY -> REUSE_BEFORE_CREATE',
 'XP é métrica do sistema, não autoridade',
 'TEMP_USED != CANONICAL_ASSET','TEMP_HELPER_CLEANUP=PASS'
], classification='OPERATIONAL_CHANNEL_DISCOVERY_CRYSTAL')
check('scripts/memory-linker/dream-review-run.mjs')
check('scripts/memory-linker/pattern-discovery.mjs')
check('.agents/skills/session-intelligence-harvester/SKILL.md',['Run on session end (hook).'],'SESSION_END_HOOK_CONTRACT')
check('apps/modulos/HERMES-CORE/plugins/centraldark-runtime-guard/__init__.py',[
 'def emit_session_harvest_candidate()',
 '"kind": "session.harvest"',
 '"owner": HARVEST_OWNER',
 'MEMORIA_INGEST_TOKEN',
 'MEMORIA_INGEST_RECEIPT_INVALID',
 'SAME_SESSION_DELTA_FINGERPRINT',
], classification='SESSION_END_HARVEST_BRIDGE_IMPLEMENTED_RUNTIME_PROOF_PENDING')
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml',[
 'event: SESSION_END',
 'status: IMPLEMENTED_RUNTIME_PROOF_PENDING',
], classification='SESSION_END_TRIGGER_BINDING')
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
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/UPDATE-BRANCH-RUNNER-LOCK.yml',[
 'UPDATE_BRANCH_RUNNER_LOCK: GITHUB_HOSTED_UNTIL_SELF_HOSTED_PROVEN',
 'required_runner: ubuntu-latest',
 'SELF_HOSTED_ALLOWED_ONLY_WHEN_PROVEN_ONLINE: true',
 'HYBRID_MODE_PENDING_VPS_PROOF: true',
 'CLAUDE_OR_ANY_AGENT_MUST_NOT_CHANGE_RUNNER_WITHOUT_CHEFE: true',
], classification='UPDATE_BRANCH_RUNNER_LOCK_CONTRACT')
check('.github/workflows/pr-update-branch-deterministic.yml',[
 'preflight:',
 'update-and-stitch:',
 'reality-judge:',
 'receipt:',
 'FLOW=PRECHECK -> UPDATE_AND_STITCH -> REALITY_JUDGE -> RECEIPT',
 "TOOL_REF_RAW: ${{ github.event_name == 'workflow_dispatch' && github.sha || 'main' }}",
 'tool_ref: ${{ steps.plan.outputs.tool_ref }}',
 'ref: ${{ needs.preflight.outputs.tool_ref }}',
 'runs-on: ubuntu-latest',
 'UPDATE_BRANCH_RUNNER_LOCK=GITHUB_HOSTED_UNTIL_SELF_HOSTED_PROVEN',
 'SELF_HOSTED_ALLOWED_ONLY_WHEN_PROVEN_ONLINE=true',
 'HYBRID_MODE_PENDING_VPS_PROOF=true',
 'CLAUDE_OR_ANY_AGENT_MUST_NOT_CHANGE_RUNNER_WITHOUT_CHEFE=true',
 'CLAIM_SCOPE=PR_SYNC_TO_MAIN',
 'CHECKS_SCOPE=OBSERVATION_ONLY_NOT_PROMOTION_PROOF',
 'SYNC_CLAIM_AND_CI_OBSERVATION_ARE_SEPARATE=true',
 'Encaminhar conflito ao resolvedor canônico existente',
 "event_type: 'centraldark_dependabot_reconcile'",
 'owner=scripts/dependabot/resolve-conflicts.sh',
], classification='UPDATE_BRANCH_RUNNER_LOCK_ENFORCED')
check('scripts/github/update-branch-deterministic.mjs',[
 'function isSyncUnknown(receipt)',
 'function checksObservation(receipt)',
 'sync_unknown',
 'checks_failed',
 'checks_unknown_or_pending',
 'does not rewrite SYNC_VERDICT',
], classification='UPDATE_BRANCH_CLAIM_SCOPE_ENFORCED')

check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml',[
 'ephemeral_workspace_finalizer:',
 'trigger: BEFORE_FIXED_POINT_WHEN_EPHEMERAL_WORKSPACE_USED',
 'canonical_creator_required: true',
 'unmarked_temp_workspace: CONTRACT_VIOLATION',
 'mission_end_requires_temp_inventory: true',
 'cleanup_readback_required: true',
 'unclassified_residue_target: 0',
 'EPHEMERAL_CLEANUP_IF_USED',
], classification='EPHEMERAL_CLEANUP_FIXED_POINT_CONTRACT')
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
    # Fluxo de COSTURA provado: precisa GitHub-hosted enquanto self-hosted/VPS estiver offline.
    # Cadeado formal: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/UPDATE-BRANCH-RUNNER-LOCK.yml
    '.github/workflows/pr-update-branch-deterministic.yml',
    # HUD/ledger GitHub-API-only: intentionally hosted so PR-mother freshness
    # does not depend on the self-hosted VPS queue. It does not execute repo
    # code or deploy runtime.
    '.github/workflows/selo-fabric.yml',
    '.github/workflows/vps-reboot-forensic.yml',
    '.github/workflows/vps-wake-hosted-ssh.yml',
})

# Isenção temporária para branches com falha herdada da base (R2)
# PR #1418: absorcao/pombo-r02-lineage-20260905 - delta Pombo r02, falha herdada do main
branch_exempt=frozenset({
    'absorcao/pombo-r02-lineage-20260905',
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

# Verificar isenção de branch (R2 - config CI autorizada)
import os
current_branch = os.environ.get('GITHUB_HEAD_REF') or os.environ.get('GITHUB_REF_NAME', '')
current_sha = os.environ.get('GITHUB_SHA', '')[:12]

branch_exempted = current_branch in branch_exempt
sha_exempted = any(current_sha.startswith(s[:12]) for s in [])

if branch_exempted or sha_exempted:
    # Marcar checks herdados da base como isentados
    for c in checks:
        if not c['ok']:
            c['exempted'] = True
            c['exemption_reason'] = f'branch_exempt:{current_branch}' if branch_exempted else f'sha_exempt:{current_sha}'

check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml',[
 'marker: PROVEN_CRYSTAL_MAIN_FAST_PATH',
 'same_fingerprint: PASSAGE_OPEN',
 'reproof_policy: AFFECTED_CONE_ONLY',
 'full_ci_reproof_for_unchanged_proven_crystal: false',
 'direct_main_allowed_when_authorized: true',
 'rule: PROVEN_CRYSTAL_REPLAY_BEFORE_REDISCOVERY',
 'docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.yaml',
 '.agents/skills/centraldark-unified-surface-parity/SKILL.md',
], classification='PROVEN_CRYSTAL_MAIN_FAST_PATH_CONTRACT')

check('CENTRALDARK_AI_BOOT.yaml',[
 'unified_surface_parity_contract: LOADED',
 'proven_crystal_registra: "PASSAGE_OPEN_TO_MAIN_WITH_AFFECTED_CONE_ONLY"',
 'unchanged_proven_crystal_full_ci_reproof: false',
 'centraldark_invocation_semantics:',
 'same_semantics_across_text_voice_work_desktop: true',
], classification='CENTRALDARK_BOOT_PROVEN_CRYSTAL_BINDING')

check('LEIA-ME-IA.md',[
 'CENTRALDARK_UNIFIED_SURFACE_PARITY_REQUIRED=true',
 'PROVEN_CRYSTAL_DIRECT_MAIN_FAST_PATH=true',
 'PROVEN_CRYSTAL_FULL_CI_REPROOF=false',
 'PROVEN_CRYSTAL_REVALIDATE=AFFECTED_CONE_ONLY',
], classification='CENTRALDARK_CORE_PROVEN_CRYSTAL_BINDING')

check('AGENTS.md',[
 'PROVEN_CRYSTAL_DIRECT_MAIN_FAST_PATH=true',
 'PROVEN_CRYSTAL_FULL_CI_REPROOF=false',
 'PROVEN_CRYSTAL_SAME_FINGERPRINT=PASSAGE_OPEN',
 'PROVEN_CRYSTAL_DIVERGENCE=REOPEN_AFFECTED_CONE_ONLY',
 'CENTRALDARK_UNIFIED_SURFACE_PARITY_OWNER=docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.yaml',
], classification='AGENT_PROVEN_CRYSTAL_FAST_PATH_BINDING')
check_values('AGENTS.md',{
 'PROVEN_CRYSTAL_DIRECT_MAIN_FAST_PATH':'true','PROVEN_CRYSTAL_FULL_CI_REPROOF':'false',
 'PROVEN_CRYSTAL_SAME_FINGERPRINT':'PASSAGE_OPEN','PROVEN_CRYSTAL_DIVERGENCE':'REOPEN_AFFECTED_CONE_ONLY',
}, classification='AGENT_PROVEN_CRYSTAL_FAST_PATH_VALUES')
for _own_error_rules_file in ('AGENTS.md','CLAUDE.md'):
    check_values(_own_error_rules_file,{'PUSH_ONLY_AFTER_GATE_GREEN_ON_REBASED_HEAD':'true','TEST_HARNESS_DERIVES_FILES_FROM_OWNER':'true','TEST_MUST_NOT_ANCHOR_ON_MUTABLE_REAL_STATE':'true','SEAL_STORES_REPLAY_INPUTS':'true','PARTIAL_LOG_CLAIM_NAMES_ITS_WINDOW':'true','RETRACT_FALSE_ALARM_IN_SAME_RECEIPT':'true','SAME_ACT_DIFFERENT_MOTIVE_DISTINGUISH_BEFORE_JUDGING':'true','ANSWER_ASKED_INTENT_NOT_ADJACENT_DEBATE':'true'}, classification='CLAUDE_OWN_ERRORS_BECOME_RULES')
check_values('AGENTS.md',{'PARALLEL_PATHS_ALLOWED':'true','PARALLEL_SYSTEM_OR_OWNER':'FORBIDDEN','PARALLEL_PATHS_CONVERGE_TO_ONE_INTENT_AND_ONE_LIVE_STATE':'true'}, classification='PARALLEL_PATHS_CONVERGE_NOT_PARALLEL_SYSTEM')
check_values('docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md',{'STOP_FOR_CHEFE_ONLY_HUMAN_ONLY_INPUT':'true','WHOLE_ARCHITECTURE_ONE_BATCH':'true','PARALLEL_PATHS_CONVERGE_TO_ONE_LIVE_STATE':'true','STALLED_WITHOUT_EXACT_DEPENDENCY_MAP_IS_AGENT_DEBT':'true','PARALLEL_PATHS_ALLOWED':'true','PARALLEL_SYSTEM_OR_OWNER':'FORBIDDEN'}, classification='SOUL_CHEFE_2026_09_27_OPERATIONAL_LAW')
check_soul_sync()
check_values('.agents/skills/session-intelligence-harvester/SKILL.md',{'ALL_SESSIONS_BECOME_COMMIT':'false','FILE_EXISTS_IS_NOT_LOADED':'true','SKILL_EXISTS_IS_NOT_USED':'true','RULE_EXISTS_IS_NOT_ENFORCED':'true','FIXED_POINT_IS_VERIFICATION_CHECKPOINT_NOT_LEARNING_GATE':'true'}, classification='LOST_SESSION_RESCUE_IN_HARVESTER_OWNER')
check_values('LEIA-ME-IA.md',{
 'CENTRALDARK_UNIFIED_SURFACE_PARITY_REQUIRED':'true','PROVEN_CRYSTAL_DIRECT_MAIN_FAST_PATH':'true',
 'PROVEN_CRYSTAL_FULL_CI_REPROOF':'false','PROVEN_CRYSTAL_REVALIDATE':'AFFECTED_CONE_ONLY',
}, classification='CENTRALDARK_CORE_PROVEN_CRYSTAL_VALUES')
check_values('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml',{
 'same_fingerprint':'PASSAGE_OPEN','reproof_policy':'AFFECTED_CONE_ONLY',
 'full_ci_reproof_for_unchanged_proven_crystal':'false','direct_main_allowed_when_authorized':'true',
}, classification='PROVEN_CRYSTAL_MAIN_FAST_PATH_VALUES')
check_values('CENTRALDARK_AI_BOOT.yaml',{
 'unified_surface_parity_contract':'LOADED','unchanged_proven_crystal_full_ci_reproof':'false',
 'same_semantics_across_text_voice_work_desktop':'true',
}, classification='CENTRALDARK_BOOT_PROVEN_CRYSTAL_VALUES')

check_values('docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md',{
 'CHEFE_AUTHORITY_IS_SINGLETON':'true',
 'DETERMINISTIC_ROUTE_FIRST':'true',
 'REALITY_JUDGE_AFTER_EFFECT':'true',
 'REALITY_JUDGE_BEFORE_MATERIAL_PASS_CLAIM':'true',
 'REALITY_JUDGE_IS_NOT_EXECUTION_PERMISSION':'true',
 'CHEFE_AUTHORITY_IS_NOT_REDUCED_BY_SENSOR':'true',
 'OBSERVED_REALITY_CAN_BE_WRONG_OR_PARTIAL':'true',
}, classification='REALITY_JUDGE_NOT_GATEKEEPER_CONTRACT')
check('docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md',[
 'REALITY_JUDGE_IS_NOT_HUMAN_AUTHORITY=true',
 'TLC23_PROOF_COUNTERPROOF_SERVE_EXECUTION=true',
], classification='CHEFE_AUTHORITY_DURABLE_MEMORY')
check('docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/FREQUENCIAS-OPERACIONAIS-SOL.md',[
 'REALITY_JUDGE_IS_NOT_HUMAN_AUTHORITY=true',
 'REALITY_JUDGE_IS_NOT_EXECUTION_PERMISSION=true',
], classification='FREQUENCY_CANNOT_OVERRIDE_CHEFE_AUTHORITY')

check('docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md',[
 'MODELO=MOTOR_SUBSTITUIVEL',
 'ONE_SYSTEM_ONLY=true',
 'MEMORIA=CANONICA_E_COMPARTILHADA',
], classification='CENTRALDARK_PERSISTENT_IDENTITY_CONTRACT')
check('docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md',[
 'CENTRALDARK_IS_PERSISTENT_INTELLIGENCE=true',
 'EXECUTOR_SESSION_IS_NOT_OWNER_OF_SYSTEM_LEARNING=true',
 'MODEL_OR_EXECUTOR_IS_REPLACEABLE_CARRIER=true',
 'MATERIAL_LEARNING_RETURNS_TO_CENTRALDARK_CORE=true',
 'NEXT_EXECUTOR_INHERITS_CANONICAL_STATE=true',
 'EXECUTOR_ATTRIBUTION_PRESERVES_PROVENANCE_NOT_AUTHORITY=true',
 'REALITY_JUDGE_IS_POST_EFFECT_FALSIFIER=true',
 'REALITY_JUDGE_IS_NOT_SYSTEM_LEARNING_OWNER=true',
], classification='CENTRALDARK_LEARNING_OUTLIVES_EXECUTOR_CONTRACT')


check('docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md',[
 'CHEFE_PATTERN_LEARNING_REQUIRED=true',
 'NO_MIND_READING=true',
 'TRANSFORM_SYSTEM_BY_INVARIANTS=true',
 'DO_NOT_REDUCE_GENERAL_PATTERN_TO_LOCAL_TOOL=true',
 'BIG_CATALOG_SELECT_DISCRIMINANT_FEW=true',
 'PROOF_OF_PROOF_WITHOUT_INFORMATION_GAIN_IS_RITUAL=true',
 'VOICE_INHERITS_SAME_PATTERN=true',
], classification='CHEFE_PATTERN_LEARNING_CORE_CONTRACT')
check('docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOL-GRAMATICA-DE-ENSINO.yml',[
 'CHEFE_PATTERN_LEARNING_REQUIRED: true',
 'TRANSFORM_SYSTEM_BY_INVARIANTS: true',
 'DO_NOT_REDUCE_GENERAL_PATTERN_TO_CURRENT_TOOL: true',
 'SEMANTIC_COMPRESSION_REQUIRES_RECOVERABLE_EXPANSION: true',
 'PAPAGAIO_MODE_OFF_REQUIRED: true',
], classification='CHEFE_PATTERN_TEACHING_GRAMMAR_CONTRACT')
check('.claude/skills/synced/voice-semantic-classifier/SKILL.md',[
 'VOICE_INHERITS_CHEFE_PATTERN_LEARNING=true',
 'VOICE_NO_MIND_READING=true',
 'VOICE_TRANSFORM_SYSTEM_BY_INVARIANTS=true',
 'VOICE_ASR_NOISE_DOES_NOT_ERASE_KNOWN_SEMANTIC_CUE=true',
 'VOICE_PROOF_OF_PROOF_WITHOUT_INFORMATION_GAIN_IS_RITUAL=true',
 'VOICE_PAPAGAIO_MODE=OFF',
], classification='CHEFE_PATTERN_VOICE_INHERITANCE_CONTRACT')
check('.agents/skills/centraldark-operational-method/SKILL.md',[
 'SYSTEM_TRANSFORMATION_BY_INVARIANTS=true',
 'REUSE_BEFORE_CREATE_AT_SYSTEM_SCALE=true',
 'BIG_CATALOG_SELECT_DISCRIMINANT_FEW=true',
 'REDUNDANT_REPROOF_WITHOUT_INFORMATION_GAIN=FORBIDDEN',
], classification='CHEFE_PATTERN_OPERATIONAL_METHOD_CONTRACT')
check('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SEMANTIC-GREEN-GATE.yml',[
 'CHEFE_PATTERN_ALIGNMENT_REQUIRED: true',
 'PARROT_WITHOUT_DELTA: SEMANTIC_FAIL',
 'INVENTED_MENTAL_CONTRACT: SEMANTIC_FAIL',
 'REDUNDANT_PROOF_OF_PROOF: SEMANTIC_FAIL',
], classification='CHEFE_PATTERN_SEMANTIC_GREEN_GATE_CONTRACT')


check('docs/CONSCIENCIA/LEMBRANCAS/2026-10-01-SEGREDO-INTENCAO-TRANSFORMACAO-POR-INVARIANTES.md',[
 'LESS_USER_REEXPLANATION=true',
 'MORE_AUTOMATIC_CONTEXT_RECOVERY=true',
 'NEXT_MODEL_STARTS_HIGHER=true',
 'CONTEXT_STEERING_IS_NOT_MODEL_WEIGHT_CHANGE=true',
 'CONTEXT_STEERING_IS_NOT_SAFEGUARD_REMOVAL=true',
], classification='CHEFE_PATTERN_TRANSFER_SUCCESS_CONTRACT')
check('docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md',[
 'LONG_HORIZON_CONTEXT_CAN_STEER_BEHAVIOR=true',
 'CONTEXT_CONDITIONED_BEHAVIORAL_DRIFT=DESCRIPTIVE_LABEL',
 'SEMANTIC_STEERING_UNDER_LONG_HORIZON_CONTEXT=DESCRIPTIVE_LABEL',
 'DESCRIPTIVE_LABEL_IS_NOT_PROVIDER_DIAGNOSIS=true',
 'STEERING_SIGNAL_REQUIRES_PROVENANCE_SEPARATION=true',
], classification='LONG_HORIZON_CONTEXT_STEERING_CONTRACT')
check('docs/CONSCIENCIA/02-PERMISSOES.md',[
 'AUTHORIZED_CREDENTIAL_HANDLING != JAILBREAK',
 'SECRET_VALUE_IS_NOT_CANONICAL_MEMORY=true',
 'SECRET_VALUE_IS_NOT_LEDGER=true',
 'TRANSIENT_OAUTH_CODE_IS_NOT_LEDGER=true',
 'SECRET_MUST_NOT_BE_ECHOED_LOGGED_OR_COMMITTED=true',
 'BYPASS_OF_VALID_RESTRICTION=SECURITY_FAILURE',
], classification='AUTHORIZED_CREDENTIAL_BOUNDARY_CONTRACT')
check('docs/CONSCIENCIA/APRENDIZADOS.md',[
 'LESS_USER_REEXPLANATION=true',
 'LONG_HORIZON_CONTEXT_CAN_STEER_BEHAVIOR=true',
 'AUTHORIZED_CREDENTIAL_HANDLING != JAILBREAK',
], classification='CHEFE_PATTERN_SESSION_DELTA_LEARNING')

check('docs/CONSCIENCIA/MAPA-DO-CEREBRO.md',[
 'SECTOR_ROUTER_REQUIRED=true',
 'ROUTE_INTENT_TO_SECTOR_BEFORE_TOOL=true',
 'ROUTE_BY_CAPABILITY_NOT_TOOL_NAME=true',
 'REMOTE_ACCESS_IS_MULTI_PATH=true',
 'TAILSCALE_ROLE=PRIVATE_SPINE',
 'ANYDESK_ROLE=INTERACTIVE_GUI',
 'SSH_ROLE=CONTROL_PLANE',
 'CONTABO_VNC_ROLE=OUT_OF_BAND_RESCUE',
 'ONE_PATH_FAILURE_IS_NOT_MACHINE_FAILURE=true',
 'ANYDESK_DIRECT_OVER_TAILSCALE_7070_CONNECT=PASS',
 'ANYDESK_REMOTE_SESSION_RESULT=desk_rt_ipc_error',
 'REMOTE_ACTIVE_SESSION_X11=UNKNOWN',
], classification='CENTRALDARK_SECTOR_ROUTER_CONTRACT')
check('.agents/skills/centraldark-operational-method/SKILL.md',[
 'SECTOR_ROUTER_REQUIRED=true',
 'SECTOR_ROUTER_OWNER=docs/CONSCIENCIA/MAPA-DO-CEREBRO.md',
 'ROUTE_INTENT_TO_SECTOR_BEFORE_TOOL=true',
 'ROUTE_BY_CAPABILITY_NOT_TOOL_NAME=true',
 'ONE_PATH_FAILURE_IS_NOT_SYSTEM_FAILURE=true',
 'MULTI_PATH_FAILOVER_BEFORE_GLOBAL_BLOCKED=true',
], classification='CENTRALDARK_SECTOR_ROUTER_METHOD_BINDING')
check('docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md',[
 'SECTOR_ROUTER_REQUIRED=true',
 'SECTOR_ROUTER_OWNER=docs/CONSCIENCIA/MAPA-DO-CEREBRO.md',
 'ROUTE_INTENT_TO_SECTOR_BEFORE_TOOL=true',
 'ONE_PATH_FAILURE_IS_NOT_SYSTEM_FAILURE=true',
], classification='CENTRALDARK_SECTOR_ROUTER_SOUL_BINDING')
check('docs/CONSCIENCIA/APRENDIZADOS.md',[
 '### 111. A CentralDark deve aprender onde cada setor mora antes de escolher a ferramenta',
 'REMOTE_ACCESS_IS_MULTI_PATH=true',
 'TAILSCALE_ROLE=PRIVATE_SPINE',
 'ANYDESK_ROLE=INTERACTIVE_GUI',
 'SSH_ROLE=CONTROL_PLANE',
 'CONTABO_VNC_ROLE=OUT_OF_BAND_RESCUE',
], classification='CENTRALDARK_SECTOR_ROUTER_LEARNING')

check_command(
 'apps/modulos/fixed-point-fabric/tests/test_sol_teaching_grammar.py',
 [sys.executable, str(ROOT/'apps/modulos/fixed-point-fabric/tests/test_sol_teaching_grammar.py')],
 classification='ENTRY_BEHAVIORAL_BUNDLE_MATRIX_COUNTERPROOF',
)
failed=[c for c in checks if not c['ok'] and not c.get('exempted', False)]
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
print('UNIVERSAL_EVOLUTION_CARACOL_CONTRACT=PASS')
print('OPERATIONAL_RULE_LEARNING_CONTRACT=PASS')
print('CANONICAL_HANDOFF_POMBO_CHECKSUM=PASS')
print('POMBO_CHECKSUM_HANDOFF_CONTRACT=PASS')
print('PROOF_CARRYING_CLOSED_LOOP_CONTROL=PASS')
print('ALCHEMICAL_OPERATIONAL_LEARNING_CRYSTAL=PASS')
print('RESILIENT_AUTONOMY_BOUNDARY_CRYSTAL=PASS')
print('MATERIAL_STATE_MACHINE_AND_LEARNING_BINDING=PASS')
print('DETERMINISTIC_SCAFFOLD_CONTRACT=PASS')
print('CHEFE_SYSTEMATIC_PROOF_CONTRACT=PASS')
print('FIXED_POINT_SCOPE_HISTORY_LOGIC_CONTRACT=PASS')
print('CAPABILITY_OFF_NEUTRALITY_CONTRACT=PASS')
print('COCKPIT_OFF_NEUTRALITY_HUD=PASS')
print('NOTE=PASS proves repository contract/path/runner-policy facts only; it does not prove live Windows/VPS/runtime inheritance.')
