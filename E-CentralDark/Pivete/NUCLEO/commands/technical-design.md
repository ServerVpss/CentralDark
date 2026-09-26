# COMANDO - technical-design.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\plugin-eval\references\technical-design.md
**SHA:** 22516fc42598cf2a
**Timestamp:** 2026-08-26T18:40:40.657258
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- Runtime contract:

### Ouro Bruto (primeiros 5000 chars)
```
# Plugin Eval Technical Design

## Overview

`plugin-eval` is a local-first Codex plugin and CLI for evaluating Codex skills and plugins. The design centers on a deterministic local engine that emits a stable `evaluation-result` JSON document. Skills orchestrate the engine. Report renderers, comparison views, workflow guides, and future app visualizations consume the same JSON contract.

The first version is intentionally static:

- No live Codex benchmarking
- No remote repository evaluation
- No automatic test execution
- No requirement for external dependencies beyond Node

## Primary Goals

- Evaluate local skill and plugin bundles with predictable results.
- Make token and context costs visible early, especially for skill authors.
- Provide concrete quality signals for TypeScript and Python code.
- Create a normalized extension point for custom metric packs.
- Generate improvement briefs that pair naturally with the shipped `skill-creator` workflow.
- Make the recommended chat-first workflow obvious for first-time skill authors.

## Non-Goals For V1

- Measuring actual Codex desktop host token consumption end to end
- Running a skill inside the Codex host as part of the evaluation
- Replacing model or product-level eval frameworks
- Language-specific deep analysis for every language beyond TypeScript and Python

## Architecture

### 1. Core Engine

The core engine lives under `src/core/` and owns:

- target resolution (`skill`, `plugin`, or generic directory/file)
- result schema creation
- budget calculation and banding
- score and risk summary generation
- metric-pack execution
- improvement brief generation

The engine is the source of truth. Other surfaces must not invent their own scoring logic.

### 2. Evaluators

Evaluators live under `src/evaluators/` and return normalized fragments:

- `checks[]`
- `metrics[]`
- `artifacts[]`

Built-in evaluators:

- skill structure and frontmatter checks
- plugin manifest and path checks
- token and context budget analysis
- TypeScript metrics
- Python metrics
- coverage artifact ingestion

### 3. Renderers

Renderers live under `src/renderers/` and consume the canonical evaluation payload.

Supported report formats:

- JSON
- Markdown
- HTML

The report output is deliberately thin. It should present the existing result cleanly, not compute new conclusions.

### 4. Codex Skills

The plugin exposes lightweight skills that route users into the engine:

- `plugin-eval`
- `evaluate-skill`
- `evaluate-plugin`
- `metric-pack-designer`
- `improve-skill`

These skills stay small and point users to references and CLI commands instead of embedding bulky logic.

The beginner paved road is:

1. User asks in chat: "Evaluate this skill." or "What should I run next?"
2. The umbrella skill or focused skill can run `plugin-eval start <path> --request "<user request>" --format markdown` to route that request intentionally.
3. The rendered output shows the routed chat request, the quick local entrypoint, and the first underlying workflow command side by side.

## Canonical Result Shape

The canonical result is a JSON object with:

- `target`
- `summary`
- `budgets`
- `checks[]`
- `metrics[]`
- `artifacts[]`
- `extensions[]`
- `improvementBrief`

### Summary

`summary` includes:

- `score`
- `grade`
- `riskLevel`
- `topRecommendations[]`

The summary is calculated from built-in checks only. Extension metric packs are stored under `extensions[]` and do not overwrite the core summary.

### Checks

Every check uses the normalized fields:

- `id`
- `category`
- `severity`
- `status`
- `message`
- `evidence[]`
- `remediation[]`
- `source`

### Metrics

Every metric uses the normalized fields:

- `id`
- `category`
- `value`
- `unit`
- `band`
- `source`

## Budget Model

The budget model is a first-class part of the evaluation result and uses three scored buckets:

- `trigger_cost_tokens`
- `invoke_cost_tokens`
- `deferred_cost_tokens`

Policy-aware plugin analyses may also include an unscored visibility bucket:

- `explicit_only_invoke_cost_tokens`

### Definitions

- `trigger_cost_tokens`: text likely to matter before explicit invocation, such as names, descriptions, and starter prompts
- `invoke_cost_tokens`: core instruction payloads that are likely loaded when the skill or plugin is invoked
- `deferred_cost_tokens`: supporting references, scripts, and related text assets that are only pulled in later
- `explicit_only_invoke_cost_tokens`: skill payloads marked `policy.allow_implicit_invocation: false` in `agents/openai.yaml`; these remain visible as explicit load ceilings but are excluded from implicit trigger/invoke scoring

### Measurement Mode In V1

The current implementation labels budget analysis as `estimated-static` or `estimated-static-policy-aware`.

That means:

- token counts are estimated locally from file contents
- the estimate is deterministic and repeatable
- budget bands are calibrated against a baseline corpus of shipped Codex skills and plugins when available lo
```