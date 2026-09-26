---
name: autonomous-dependa-boot
version: "1.0.0"
description: "Multi-arm autonomous operation. Reach fixed point silently."
trigger: "autonomous multi-arm operation, dependa-boot, fixed point, no messaging"
author: "Hermes Agent"
license: "MIT"
tags: ["autonomous-operation", "dependa-boot", "multi-arm", "fixed-point"]
category: "autonomous-operation"
metadata:
  hermes:
    tags: ["autonomous-operation", "dependa-boot", "multi-arm", "fixed-point", "kimetsu-legacy"]
    related_skills: ["kimetsu-legacy-operational-method", "centraldark-operational-method", "kimetsu-legacy-breathing"]
phases: "MEASURE → ACT_ORCHESTRATE → OBSERVE → RECONCILE → REACH_FIXED_POINT"
runtime_checks:
  - boot_config_exists
  - arms_registered
  - shared_state_available
  - no_messaging_during_autonomy
  - fixed_point_closure
failure_signature: "AUTONOMOUS_DEPENDA_BOOT_EXECUTION_v1"
remediation_escalation: "reuse_existing_boot > adapt_arm > extend_state > fix_convergence > rollback"
provenance:
  sources:
    - "paste_1_131820.txt (5-arm architecture description)"
    - "CentralDark_Fluxo_Bidirecional_Auditoria_RECUPERADO_2026-08-24 (audit package documentation)"
    - "CENTRALDARK_AI_BOOT.yaml (registered boot configuration)"
  tests:
    - "autonomous-cycle-execution.test"
  receipts:
    - "autonomous-dependa-boot.receipt"
counterproof: "Autonomous cycle completes without messaging, reaches fixed point, reuses existing boot."
fixed_point_contribution: "Resolves phase denominators: governance, github_dictionary, delta_method, history_preservation, source_of_truth"
mantra: "SEM MENSAGEM. LOGS SOMENTE. REUTILIZA BOOT REGISTRADO. CHEGUE AO PONTO FIXO."
three_planes:
  KNOWLEDGE:
    - failure_signatures: ["AUTONOMOUS_DEPENDA_BOOT_EXECUTION_v1"]
    - compat_matrix: "dependa-boot × Kimetsu Legacy breathing × 5-arm architecture"
    - remediation_procedures: "reuse_existing_boot > adapt_arm > extend_state > fix_convergence"
    - local_first_retrieval: "audit package docs, paste content, boot configuration"
  EXECUTION:
    - runtime_measurement: "CONCENTRAÇÃO TOTAL kernel, state reconciliation, arm status"
    - reality_judge_validation: "LUA contraprova + Fixed Point 5-condition closure"
    - ecosystem_post_conditions: "hermes: validate_all_skills.py && skill_gold_validator.py"
  CONFIG_ORIGIN:
    - config_source_tracking: "profile=pivete, boot_config=CENTRALDARK_AI_BOOT.yaml"
    - fix_at_right_layer: "boot_config > arm_scripts > shared_state"
three_dimensions:
  DEPENDÊNCIA:
    definition: "What runtime/project requires"
    reopen_trigger: "boot_config change, arm registration change, shared_state schema change"
  DECADÊNCIA:
    definition: "Knowledge/compat became stale"
    reopen_trigger: "version change, test failure, source change, counterproof failure, Fixed Point regression"
  CADÊNCIA:
    definition: "When to revalidate"
    reopen_trigger: "event-driven: mission_start, build_fail, version_change, breathing_switch, autonomy_cycle_end"
---

# Autonomous Dependa-Boot Operation

## Overview

Operação autônoma multi-braço usando boot pré-registrado. Braços convergem via estado compartilhado (Git, filesystem, logs). Sem mensagens durante autonomia. Chegar ao ponto fixo.

Complementa Kimetsu Legacy breathing method. Não substitui.

## When to Use

- Usuário pede operação autônoma com objetivo de ponto fixo e proíbe mensagens
- Boot configuration pré-registrado existe (ex: `CENTRALDARK_AI_BOOT.yaml`)
- Operação envolve múltiplos braços paralelos

## Core Principles

### 1. Sem Mensagem Durante Autonomia

Regra absoluta: NÃO enviar mensagens durante autonomia. Registrar em logs only. Comunicação after fixed point ou pedido explícito.

### 2. Reutiliza Boot Registrado

Busca boot configuration existente (`git log --grep="boot"`, arquivos YAML/JSON). Reutiliza. Não cria novo sem gap real provado.

Commits relevantes:
- `c4d713fbe fix(boot): CENTRALDARK_AI_BOOT.yaml com merge inteligente`
- `a104fdf01 fix(boot): amarrar politica de conflito no CENTRALDARK_AI_BOOT`

### 3. Multi-Arm Architecture (do paste #1)

```
BRAÇO 1: Omni/Hermes → verifica processo/configuração → corrige rota/env → mantém motor vivo
BRAÇO 2: PR/commits → observa mudanças → compara estado → só reage se houver delta
BRAÇO 3: Telemetria/heartbeat → grava loop periódico → confirma processo vivo
BRAÇO 4: Autonomia temporal → mantém intenção até horário limite
BRAÇO 5: Revisão/contraprova → lê estado → tenta pegar inconsistência
```

Convergência via: Git, filesystem, logs, mission state. Sem comunicação direta entre braços.

### 4. Fixed Point Closure

Usar Kimetsu Legacy:
- CONCENTRACAO TOTAL: kernel sempre ativo
- LUA: contraprova obrigatória
- FIXED POINT: 5 condições (objective_closed, counterproof_survived, applicable_invariants_hold, no_material_unknown, no_new_material_failure)

## Workflow

### Medir (Read-Only)
1. Ler intenção (objetivo, prazo, braços)
2. Medir estado (repo, boot config, arms ativos)
3. Localizar boot registrado
4. Classificar: existe, falta, UNKNOWN
5. Registrar em log

### Resolução de Conflitos (ajuste para pr-5052)
Quando detectar conflitos em commits (lista: .agents/skills/fable-loop/SKILL.md, apps/modulos/HERMES-CORE/agents/Executor/agent.mjs, apps/modulos/fixed-point-fabric/*, docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml, scripts/trigger-fabric/verify_repo_contract.py):
- Virar READER
- Medir intenção dos dois lados (semântica Thiago Aquino / Viver em Paz + ciclo único)
- Preservar capacidades compatíveis
- Eliminar duplicação semântica
- Produzir versão reconciliada mínima no owner existente (DELTA-CONTINUO.md / AUREOLA-BAHIA-BIBLICA.yml)
- NÃO criar V2/V3
- Registrar receipt antes de qualquer commit
- Manter silent até fixed point

### Orquestrar (Act)
1. Ativar CONCENTRACAO TOTAL
2. Selecionar braços com base na intenção
3. Reutilizar boot existente
4. Inicializar braços em paralelo/sequencial
5. Cada braço opera com shared state

### Observar (Monitor)
1. Braço 3 grava heartbeat
2. Braço 2 observa PRs/commits
3. Braço 1 mantém motor vivo
4. Braço 4 mantém intenção até prazo
5. Braço 5 busca inconsistências

### Reconciliar
1. Ao detectar delta, reconciliar estado
2. Usar SERPENTE, NEVOA, LUA conforme necessário

### Chegar ao Ponto Fixo
1. Verificar objective_closed
2. Executar LUA contraprova
3. Verificar invariantes (PEDRA)
4. Verificar sem UNKNOWN material
5. Declarar FIXED_POINT=TRUE com todas as condições
6. Registrar fechamento em log

## No-Messaging Registry

```bash
echo "$(date -u '+%Y-%m-%d %H:%M:%S UTC') | PR #1360 | MERGED | commits: 23 | autor: segredounlock" >> "E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/prs-open-commits-cycle.log"
```

## Boot Localization

```bash
git log --all --oneline --grep="boot" --since="2026-08-01"
git log --all --oneline -- "*CENTRALDARK_AI_BOOT*" "*boot*"
find . -maxdepth 3 -type f \( -name "*BOOT*" -o -name "*boot*" -o -name "*.yaml" \)
```

## Technical Notes

### edge-tts como fallback Kokoro (Windows Python 3.13)

Quando Kokoro falha na instalação (erro numpy/meson/MSVC), usar:

```bash
python -m pip install edge-tts
```

```python
import edge_tts
await edge_tts.Communicate("texto", "pt-BR-FranciscaNeural").save("output.mp3")
```

Vozes PT-BR: `pt-BR-FranciscaNeural`, `pt-BR-AntonioNeural`, `pt-BR-ThalitaNeural`

## Pitfalls

| # | Pitfall | Fix |
|---|---------|-----|
| 1 | Enviar mensagens durante autonomia | Log only; esperar fixed point |
| 2 | Criar boot novo quando existe registrado | Medir boot existente; reuse_before_create |
| 3 | Interpretar número objetivo como PR/issue | Clarificar se necessário; pode ser goal ID |
| 4 | Declarar fixed point sem condições | Usar LUA + 5 condições obrigatórias |
| 5 | Criar comunicação entre braços | Usar shared state existente (Git, filesystem, logs) |

## References

- `references/5-arm-architecture.md` — Descrição dos 5 braços
- `references/audit-package-summary.md` — Resumo pacote auditoria recuperado
- `references/boot-localization.md` — Como localizar boot config
- `references/no-messaging-logging.md` — Exemplos registry em log
