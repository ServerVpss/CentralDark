---
name: centraldark-megazord-binding
description: MEGAZORD binding and engine gap checker.
tags: [megazord, engine_gap]
---

# CentralDark MEGAZORD Binding

## MEGAZORD-CENTRALDARK — binding existente no repo

O MEGAZORD já existe como arquitetura canônica. **Não criar segunda engine, V2/V3/V4, ou ZORD_WORKFLOW_DEDUPE como arquivo separado.**

```text
MEGAZORD binding: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MEGAZORD-CENTRALDARK.yml
Capability Router: .agents/skills/capability-contract-router/SKILL.md (CANONICAL)
Engine Binding: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml (tem megazord_binding)
Runtime Plug: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/RUNTIME-PLUG-CONTRACT.yml
Master Cycle: scripts/trigger-fabric/centraldark_master_cycle.py
Route Capabilities: .agents/skills/capability-contract-router/scripts/route_capabilities.py
Runtime Conformance: scripts/trigger-fabric/runtime_plug_conformance.py
Spiral Traversal: scripts/trigger-fabric/spiral_traversal.py
Engine Gap Fixed Point: scripts/trigger-fabric/engine_gap_fixed_point.py
```

`ZORD_WORKFLOW_DEDUPE` já está absorvido na arquitetura MEGAZORD. Não é arquivo separado.

**Provar que o MEGAZORD funciona:**
```bash
python scripts/trigger-fabric/centraldark_master_cycle.py --self-test
python .agents/skills/capability-contract-router/scripts/route_capabilities.py --self-test
python scripts/trigger-fabric/runtime_plug_conformance.py --self-test
python scripts/trigger-fabric/spiral_traversal.py --self-test
python scripts/trigger-fabric/semantic_crystal_tool.py --self-test
python scripts/trigger-fabric/verify_package.py
python scripts/trigger-fabric/engine_gap_fixed_point.py
```

## ENGINE GAP — canonical gap checker

`scripts/trigger-fabric/engine_gap_fixed_point.py` retorna JSON com `fixed_point`, `next_cursor`, `unknowns`, `conditions`.

- `fixed_point: false` → gap aberto, registrar `next_cursor`.
- `fixed_point: true` → engine gap fechado, mas FIXED_POINT final requer CI green.

## !CENTRALDARK é SKILL TRIGGER

### Entrypoint Universal

Para usar `!CENTRALDARK` diretamente do shell, crie um launcher (cmd ou PowerShell) que invoque o Hermes com o comando.

```cmd
@echo off
rem Ajuste %HEREMES_EXE% para o caminho do executável hermes
set HEREMES_EXE="E:\\CentralDark\\workspace\\centraldark-main\\hermes.exe"
if not exist %HEREMES_EXE% (
    echo hermes.exe não encontrado em %HEREMES_EXE%
    pause
    exit /b 1
)
%HEREMES_EXE% run "!CENTRALDARK"
```

O script pode ficar em `E:\CentralDark\workspace\centraldark-main\bin\centraldark.cmd` (adicione esse caminho ao PATH). Assim nenhuma nova janela irá Errar

> **Notar**: não use `!CENTRALDARK` como comando shell sem esse launcher; o shell emitirá “`CENTRALDARK` não é reconhecido”.

---
, NÃO shell command

`!CENTRALDARK` é gatilho resolvido por `centraldark_master_cycle.py`. Nunca executar como comando shell — falha com exit 127.

## References
- `ENGINE_BINDING.yml` — `megazord_binding` section
- `MEGAZORD-CENTRALDARK.yml` — arquitetura canônica
- `capability-contract-router/SKILL.md` — algoritmo de roteamento
- `centraldark_master_cycle.py` — resolve !CENTRALDARK triggers
