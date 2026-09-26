# COMANDO - model-routing.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\squad-creator\config\model-routing.yaml
**SHA:** 1eb3d3fe80d91cb3
**Timestamp:** 2026-08-28T13:25:25.240306
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- #      prompt: "..."

### Riscos
- privacy_risk: "moderate"  # Singapore entity, China parent
- privacy_risk: "high"  # China, trains on prompts
- downgrade_risk: "Quality degradation in voice capture"
- downgrade_risk: "Missing mental models and heuristics"
- downgrade_risk: "Hallucinated frameworks"
- downgrade_risk: "Incomplete procedures"
- downgrade_risk: "Missing implicit patterns"
- downgrade_risk: "Generic agent without depth"
- downgrade_risk: "Incomplete clone structure"
- downgrade_risk: "Missing DNA layers"

### Ouro Bruto (primeiros 5000 chars)
```
# ============================================================================
# Squad Creator Model Routing Configuration
# ============================================================================
# Self-contained config for task-to-model routing.
# Squad Chief consults this before executing tasks to optimize token costs.
#
# PHILOSOPHY: "Use the cheapest model that maintains quality"
# - Haiku: Deterministic tasks (validation, scoring, admin)
# - Sonnet: Moderate analysis (documentation, templates)
# - Opus: Complex reasoning (DNA extraction, agent creation)
#
# Based on empirical analysis: docs/enhance/squad_creator_token_economy/
# Expected savings: 60-70% of token consumption (validated)
# ============================================================================

version: "2.4.0"
updated: "2026-02-13"

# ============================================================================
# ROUTING TIERS
# ============================================================================

tiers:
  haiku:
    description: "Fast, cheap. For deterministic tasks with clear patterns."
    model_id: "haiku"  # Maps to Task tool model parameter
    cost_per_mtok:
      input: 1.00
      output: 5.00
    best_for:
      - "Checklist validation"
      - "Formula-based scoring"
      - "File operations"
      - "Registry updates"
      - "Pattern matching"

  sonnet:
    description: "Balanced. For moderate analysis and generation."
    model_id: "sonnet"
    cost_per_mtok:
      input: 3.00
      output: 15.00
    best_for:
      - "Documentation generation"
      - "Template creation"
      - "Source collection"
      - "Workflow design"

  opus:
    description: "Most capable. For complex reasoning and synthesis."
    model_id: "opus"
    cost_per_mtok:
      input: 5.00
      output: 25.00
    best_for:
      - "DNA extraction"
      - "Agent creation"
      - "Deep research"
      - "Creative synthesis"
      - "Multi-source analysis"

# ============================================================================
# EXTERNAL PROVIDERS (v2.0 - Cross-Provider Support)
# ============================================================================
# External models via OpenRouter that can substitute Opus for cost savings.
# These require LLM Router or direct API calls (not Task tool).

external_providers:
  glm5:
    display_name: "GLM-5"
    provider: "openrouter"
    model_id: "z-ai/glm-5"
    cost_per_mtok:
      input: 0.80
      output: 3.20
    context_window: 200000
    qualified_date: "2026-02-13"
    validation_report: "test-cases/cross-provider/extract-voice-dna/glm5/qualification-report.yaml"
    quality_vs_opus: "85-98% (task/runner dependent)"
    latency_vs_opus: "25x faster"
    savings_vs_opus: "97.7%"
    pt_br_quality: "9/10"
    privacy_risk: "moderate"  # Singapore entity, China parent
    best_for:
      - "Voice DNA extraction (production-ready with v1.4.0 task + v2.0 runner)"
      - "Batch processing"
      - "All DNA extraction tasks"
    not_for:
      - "Tasks using runner v1 (quality drops to 85%)"
    notes: |
      Empirically tested 2026-02-12, quality upgraded 2026-02-13.
      Record-low hallucination rate.
      MIT license enables self-hosting.
      CRITICAL: Quality depends on runner passing FULL task content.
      Runner v2.0 required for 95%+ quality.

  kimi:
    display_name: "Kimi K2.5"
    provider: "openrouter"
    model_id: "moonshotai/kimi-k2.5"
    cost_per_mtok:
      input: 0.50
      output: 2.80
    context_window: 256000
    qualified_date: null  # Not yet tested
    validation_report: "infrastructure/services/llm-router/docs/model-discovery/scans/2026-02-08/validation-kimi-k2-5.md"
    verdict: "MONITOR"
    privacy_risk: "high"  # China, trains on prompts
    latency_warning: "HIGH (15-200s per request)"
    notes: |
      Validation report exists but not empirically tested on squad-creator tasks.
      Agent Swarm capability may excel on research tasks.
      High latency is a concern.

# ============================================================================
# TASK ROUTING MAP
# ============================================================================
# Format: task_file -> tier
# Squad Chief looks up task here before spawning agent
# ============================================================================

tasks:
  # --------------------------------------------------------------------------
  # HAIKU TIER - Immediate candidates (validated)
  # --------------------------------------------------------------------------
  # These tasks are deterministic and can safely use Haiku

  ## Validation Tasks
  qa-after-creation.md:
    tier: haiku
    confidence: high
    reason: "Checklist validation, gatekeeper task (pass/fail)"
    validated: true
    test_date: "2026-02-11"
    test_result: "QUALIFIED (Opus 8.32 APPROVED, Haiku 9.9 APPROVED - same decision)"
    caveat: "Haiku score inflation +19%, but pass/fail matches"

  validate-squad.md:
    tier: haiku
```