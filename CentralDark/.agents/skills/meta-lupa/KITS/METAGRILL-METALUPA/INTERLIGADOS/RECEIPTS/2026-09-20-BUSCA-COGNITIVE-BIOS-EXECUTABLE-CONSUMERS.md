# 🧠🪬 BUSCA — consumidores executáveis do boot

PR_MOTHER=#1562  
OBSERVED_HEAD=57f9636e47385f94c4ba40ebf9fb335a3ebb1342

## Resultado

CENTRALDARK_AI_BOOT.yaml é consumido/observado por mecanismos executáveis existentes:

- .agents/skills/centraldark-operational-method/scripts/tlc23_runtime_gate.py referencia BOOT = ROOT / CENTRALDARK_AI_BOOT.yaml;
- .github/workflows/trigger-fabric-package.yml observa CENTRALDARK_AI_BOOT.yaml;
- dependabot integration test registra CENTRALDARK_AI_BOOT.yaml como padrão canônico sensível a conflito.

Não foi encontrado consumidor existente do nome “cognitive_bios”, pois o bloco ainda não existe.

## Veredito

BOOT_IS_EXECUTABLE_CONTRACT_SOURCE=true.  
COGNITIVE_BIOS_BINDING_CAN_BE_HARDENED_WITH_EXISTING_GATE=true.  
NEW_RUNTIME_ENGINE_REQUIRED=false.

A integração deve:
1. adicionar cognitive_bios ao CENTRALDARK_AI_BOOT.yaml;
2. validar o bloco em gate executável existente, preferencialmente tlc23_runtime_gate.py ou verificador do Trigger Fabric;
3. manter HUD_FIRST/HUD_UPDATE nos owners existentes;
4. evitar duplicar algoritmo de capacidades cognitivas/metacognição.

## Invariante

TEXT_CONTRACT + EXECUTABLE_CONSUMER + TEST = HARDER_GUARANTEE_THAN_TEXT_ONLY.

## NEXT_CURSOR

Ler tlc23_runtime_gate.py e centraldark_full_trigger_boot.py para escolher o menor consumer executável a estender.
