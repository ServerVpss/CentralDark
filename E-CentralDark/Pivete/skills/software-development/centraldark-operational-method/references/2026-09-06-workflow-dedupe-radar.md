# 2026-09-06 — Workflow Dedupe Radar (Adicionado na main via PR #1425/#1432)

## Visão Geral

O **Workflow Dedupe Radar** é um scanner determinístico para GitHub Actions que detecta duplicação de jobs/steps/workflows sem mutar nada. Ele classifica:

- **REUSE_CANDIDATE** — jobs/steps com fingerprint idêntico em múltiplos workflows
- **INTENTIONAL_PARALLEL** — mesmo runner pool, mas lógica diferente (permitido)
- **WORKFLOW_CALL_PRESENT/ABSENT** — se há reusable workflows disponíveis

## Arquivos

| Arquivo | Função |
|---|---|
| `scripts/ci/workflow_dedupe_radar.py` | Scanner principal (stdlib only) |
| `.github/workflows/workflow-dedupe-radar.yml` | Workflow agendado (`23 3 * * *`) + push em `.github/workflows/**` |
| `.github/workflow-reuse-registry.json` | Registry de reuso (pools, ordem, candidatos conhecidos) |

## Como executar

```bash
# Self-test
python3 scripts/ci/workflow_dedupe_radar.py --self-test

# Scan completo
python3 scripts/ci/workflow_dedupe_radar.py \
  --root . \
  --json-out "$RUNNER_TEMP/workflow-dedupe.json" \
  --markdown-out "$RUNNER_TEMP/workflow-dedupe.md"
```

## Saída (JSON schema: `centraldark.workflow-dedupe-radar.v1`)

```json
{
  "workflow_count": 42,
  "job_count": 187,
  "workflow_call_count": 0,
  "exact_duplicate_jobs": [
    {
      "fingerprint": "sha256...",
      "classification": "REUSE_CANDIDATE",
      "occurrences": [
        {"path": ".github/workflows/a.yml", "job": "guard", "line": 10},
        {"path": ".github/workflows/b.yml", "job": "guard", "line": 12}
      ]
    }
  ],
  "repeated_step_blocks": [...],
  "runner_usage": [
    {"runner": "[self-hosted, Linux]", "job_count": 89, "classification": "INTENTIONAL_PARALLEL"}
  ],
  "verdict": {
    "duplication_detected": true,
    "reuse_candidates": 7,
    "policy": "REUSE_BEFORE_CREATE; PARALLEL_RUNNERS_ALLOWED_WHEN_LOGIC_DIFFERS"
  }
}
```

## Lei de Reuso (do Registry)

```text
1. existing_script_or_action
2. existing_reusable_workflow
3. matrix_job
4. composite_action
5. reusable_workflow
6. new_code_last
```

**Regra**: `MESMO_RUNNER + LOGICA_DIFERENTE → INTENTIONAL_PARALLEL` (permitido)
**Regra**: `MESMA_LOGICA + MESMO_CONTRATO → REUSE_CANDIDATE` (comprimir)
**Regra**: `MESMO_STEP_REPETIDO → COMPOSITE_ACTION_OR_SCRIPT_CANDIDATE`

## Primeiro Candidato Detectado

> **Bloquear HEAD de fork no runner persistente**
> 
> Aparece em: `porta-de-entrada.yml`, `codex-validate.yml`, `pr-auto-review.yml`, `lupa-conformance.yml`, `lupa-drift-guard.yml`
> 
> **Classificação**: REUSE_CANDIDATE
> 
> **Próximo passo**: Medir equivalência semântica exata antes de extrair (guard position em runner persistente é parte da segurança).

## Integração no !CENTRALDARK

O radar roda automaticamente:
- **Agenda**: `23 3 * * *` (diário)
- **Push**: em `.github/workflows/**`, `workflow-reuse-registry.json`, `scripts/ci/workflow_dedupe_radar.py`
- **Manual**: `workflow_dispatch`

O `!CENTRALDARK` dispara o radar como parte do `FULL_BOOT` persistente.

## Princípios

- `REUSE_BEFORE_CREATE=true`
- `AUTO_REFACTOR=false` (radar recomenda, não altera)
- `SAME_RUNNER_IS_NOT_DUPLICATION=true`
- `PARALLEL_RUNNERS_ALLOWED_WHEN_LOGIC_DIFFERS=true`
- `UNKNOWN_IS_NOT_PASS=true`