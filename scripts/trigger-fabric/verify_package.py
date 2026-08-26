#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, sys

ROOT=Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve()

def sha256(path):
    h=hashlib.sha256(); h.update(path.read_bytes()); return h.hexdigest()

errors=[]
manifest_path=ROOT/'MANIFEST.json'
if not manifest_path.exists():
    print('VERIFY=FAIL\nMANIFEST_MISSING'); sys.exit(1)
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))

for item in manifest.get('files',[]):
    p=ROOT/item['path']
    if not p.exists():
        errors.append(f"MISSING {item['path']}")
        continue
    if sha256(p)!=item['sha256']:
        errors.append(f"HASH_MISMATCH {item['path']}")

required=[
 'README.md','ARCHITECTURE.md','ARCHITECTURE.mmd','ARCHITECTURE.png',
 'CONTRACT.yml','TRIGGERS.yml','ENGINE_BINDING.yml','ADVERSARIAL_HANDOFF.yml','LIVE_STATE.md',
 'HISTORY.md','COUNTERPROOF.md','RASTRO.md','RECEIPT.md','SOURCES.json',
 'OLHO-BIONICO-ANTI-FLASH.md',
 'build_package.py','verify_package.py','MANIFEST.json','SHA256SUMS.txt'
]
for name in required:
    if not (ROOT/name).exists(): errors.append(f'REQUIRED_MISSING {name}')

# 2º CADEADO — Ontologia Musical + Judge Ternário
# Verifica se a ontologia musical está presente no PADRAO-PARCEIRO-DELTA-JUDGE.md
padrao_path = ROOT/'docs'/'ARQUITETURA'/'PADRAO-PARCEIRO-DELTA-JUDGE.md'
if not padrao_path.exists():
    errors.append('REQUIRED_MISSING docs/ARQUITETURA/PADRAO-PARCEIRO-DELTA-JUDGE.md')
else:
    padrao_content = padrao_path.read_text(encoding='utf-8', errors='replace')
    musical_tokens = [
        'MUSICIAN = agent role (not tool)',
        'INSTRUMENT = tool capability (not agent)',
        'JUDGE_THREE_WAY = ternary verdict (PASS | FAIL | UNKNOWN) + counterproof + receipt'
    ]
    for token in musical_tokens:
        if token not in padrao_content:
            errors.append(f'MUSICAL_ONTOLOGY_MISSING:{token}')

receipt=(ROOT/'RECEIPT.md').read_text(encoding='utf-8',errors='replace') if (ROOT/'RECEIPT.md').exists() else ''
if 'GLOBAL_RUNTIME_100_PERCENT = NOT_PROVEN' not in receipt:
    errors.append('FALSE_GREEN_GUARD_MISSING')

live=(ROOT/'LIVE_STATE.md').read_text(encoding='utf-8',errors='replace') if (ROOT/'LIVE_STATE.md').exists() else ''
history=(ROOT/'HISTORY.md').read_text(encoding='utf-8',errors='replace') if (ROOT/'HISTORY.md').exists() else ''
if not live or not history: errors.append('LIVE_HISTORY_SEPARATION_MISSING')

contract=(ROOT/'CONTRACT.yml').read_text(encoding='utf-8',errors='replace') if (ROOT/'CONTRACT.yml').exists() else ''
for token in [
 'inherited_on_bot_entry: true',
 'mandatory_before_human_return: true',
 'no_new_workflow_when_owner_exists: true',
 'yellow_status_semantics: FORBIDDEN',
]:
    if token not in contract: errors.append(f'CONTRACT_GUARD_MISSING:{token}')

triggers=(ROOT/'TRIGGERS.yml').read_text(encoding='utf-8',errors='replace') if (ROOT/'TRIGGERS.yml').exists() else ''
for token in ['event: BOT_ENTRY','event: PRE_HUMAN_RETURN','event: RESUME']:
    if token not in triggers: errors.append(f'TRIGGER_MISSING:{token}')

engine=(ROOT/'ENGINE_BINDING.yml').read_text(encoding='utf-8',errors='replace') if (ROOT/'ENGINE_BINDING.yml').exists() else ''
for token in ['engine_is_owner: false','binding_mode: LOAD_REFERENCE','prompt_consumer: apps/modulos/HERMES-CORE/prompts/hermes-core.md']:
    if token not in engine: errors.append(f'ENGINE_BINDING_GUARD_MISSING:{token}')

profile=(ROOT/'OLHO-BIONICO-ANTI-FLASH.md').read_text(encoding='utf-8',errors='replace') if (ROOT/'OLHO-BIONICO-ANTI-FLASH.md').exists() else ''
for token in [
 'OLHO_BIONICO_IS_PROFILE=true',
 'OLHO_BIONICO_IS_NEW_ENGINE=false',
 'DERIVED_OUTPUT',
 'NO_CLEAN_SOURCE_REGION',
 'UNKNOWN_OR_REVIEW_REQUIRED',
 'PLACA_CENTRAL_IS_SOURCE_OF_TRUTH=false',
 'CULTURAL_ALIAS_IS_NOT_ENGINE=true',
 'CI_QUEUED = NOT_PASS',
 'DEPLOY = OUT_OF_SCOPE_THIS_MISSION',
]:
    if token not in profile: errors.append(f'OLHO_BIONICO_GUARD_MISSING:{token}')

architecture=(ROOT/'ARCHITECTURE.mmd').read_text(encoding='utf-8',errors='replace') if (ROOT/'ARCHITECTURE.mmd').exists() else ''
for token in ['OLHO BIÔNICO ANTI-FLASH','DERIVED OUTPUT','MONITORES DA CASA']:
    if token not in architecture: errors.append(f'OLHO_BIONICO_DIAGRAM_MISSING:{token}')

if errors:
    print('VERIFY=FAIL')
    print('\n'.join(errors))
    sys.exit(1)

print('VERIFY=PASS')
print(f'FILES_VERIFIED={len(manifest.get("files",[]))}')
print('BOT_ENTRY_CONTRACT=PASS')
print('OUTPUT_GUARD_CONTRACT=PASS')
print('OLHO_BIONICO_ANTI_FLASH_CONTRACT=PASS')
print('GLOBAL_RUNTIME_100_PERCENT=NOT_PROVEN')
