# 🧠🪬 BUSCA — binding executável mínimo da Cognitive BIOS

PR_MOTHER=#1562  
OBSERVED_HEAD=57f9636e47385f94c4ba40ebf9fb335a3ebb1342

## Consumers lidos

### scripts/trigger-fabric/centraldark_full_trigger_boot.py

É loader determinístico, sem dependências externas, que:
- lê owners do Trigger Fabric;
- normaliza comandos;
- produz plano/JSON de boot;
- classifica feedback;
- não executa mutação de negócio.

Hoje require_files() exige TRIGGERS, MASTER, ENGINE, MEGAZORD e LOCK_CONTRACT, mas não CENTRALDARK_AI_BOOT.yaml nem as fontes cognitivas.

cmd_boot() emite canonical_chain, registry, source_sha256, feedback e rules, mas não projeta cognitive_bios/HUD cognitivo.

### tlc23_runtime_gate.py

Já referencia:
BOOT = ROOT / CENTRALDARK_AI_BOOT.yaml.

measure_source() mede boot_present.

binding_check() exige boot_present, SOUL/binding/skill/contract e fingerprints de runtime.

Hoje não verifica:
- bloco cognitive_bios;
- CAPACIDADES-COGNITIVAS.md;
- METACOGNICAO-OPERACIONAL.md.

## Delta mínimo funcional

1. CENTRALDARK_AI_BOOT.yaml:
   adicionar cognitive_bios como ADAPTIVE_BOOT_POLICY_LAYER referenciando os owners cognitivos existentes.

2. centraldark_full_trigger_boot.py:
   adicionar BOOT + COGNITIVE_CAPABILITIES + METACOGNITION aos required canonical sources;
   verificar tokens mínimos do contrato;
   emitir cognitive_bios no boot JSON;
   emitir HUD cognitivo com UNKNOWN explícito onde runtime ainda não escolheu estado.

3. tlc23_runtime_gate.py:
   medir cognitive_bios_contract_present;
   medir cognitive_capabilities_present;
   medir metacognition_present;
   exigir os três no binding_check;
   atualizar self-test.

## Resultado esperado

TEXT_CONTRACT=true  
EXECUTABLE_CONSUMER=true  
FAIL_CLOSED_BINDING=true  
HUD_PROJECTION=true

NEW_ENGINE=false  
NEW_OWNER=false  
NEW_KERNEL=false  
FIRMWARE_MUTATION=false

## NEXT_CURSOR

Patch no mesmo PR-filho #1597 → executar testes Python sem dependências externas → SAME-HEAD CI → receipt no PR-MÃE.
