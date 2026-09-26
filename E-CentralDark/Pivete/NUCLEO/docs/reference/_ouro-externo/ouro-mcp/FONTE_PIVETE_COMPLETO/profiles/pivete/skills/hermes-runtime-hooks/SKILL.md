---
name: hermes-runtime-hooks
description: Runtime hooks para ciclo de vida regenerativo de skills - auto-evolução automática
category: runtime
version: 1.0.0
author: Hermes Regenerative Runtime
---

# Hermes Runtime Hooks — Ciclo de Vida Regenerativo

Skill que implementa hooks de ciclo de vida para auto-evolução regenerativa de todas as skills do perfil.

## Hooks Implementados

| Hook | Evento | Ação |
|------|--------|------|
| `on_skill_create` | Nova skill criada | Pipeline completo até FIXED_POINT |
| `on_skill_update` | Skill editada | Pipeline incremental (gaps novos) |
| `on_skill_test` | Skill testada | Verificar FIXED_POINT válido |
| `on_skill_load` | Skill carregada | Verificar FIXED_POINT válido |
| `on_pre_push` | Antes de git push | Validar FIXED_POINT=TRUE |

## Configuração (profile.yaml)

```yaml
regenerative_pipeline:
  enabled: true
  mode: "always"
  scope: "all_skills"
  mode_execution: "until_fixed_point"
  
  triggers:
    on_skill_create: true
    on_skill_update: true
    on_skill_test: "verify_only"
    on_skill_load: "verify_fixed_point"
    on_pre_push: true
  
  policy:
    auto_accept_if_fixed_point: true
    require_manual_approval_on: "regression_detected"
    max_generations_per_session: 50
    timeout_per_skill_minutes: 30
  
  exclusions: []
```

## Arquitetura

```
hermes-runtime-hooks/
├── lifecycle/
│   ├── __init__.py
│   ├── hooks.py           # Hooks principais
│   ├── pipeline_runner.py # Executa pipeline regenerativo
│   ├── fixed_point.py     # Verifica FIXED_POINT
│   ├── skill_state.py     # Estado da skill
│   └── config.py          # Configuração do pipeline
├── SKILL.md
└── config.yaml
```

## Uso

O hook é carregado automaticamente ao iniciar o perfil `pivete`:

```bash
hermes --profile pivete skills load hermes-runtime-hooks
```

Após carregado, todos os eventos de ciclo de vida disparam o pipeline regenerativo automaticamente.

## Comandos Manuais

```bash
# Executar pipeline completo em uma skill
hermes --profile pivete run --skill <skill> --regenerative --until-fixed-point

# Verificar FIXED_POINT de uma skill
hermes --profile pivete run --skill <skill> --verify-fixed-point

# Pipeline incremental (apenas gaps novos)
hermes --profile pivete run --skill <skill> --regenerative --incremental
```