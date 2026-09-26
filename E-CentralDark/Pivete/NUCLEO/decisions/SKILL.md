# DECISAO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\skills\ngs-amplicon-microbiome\SKILL.md
**SHA:** 4e60f815623855ba
**Timestamp:** 2026-08-26T18:31:16.923925
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- nf-core preflight run:

### Ouro Bruto (primeiros 5000 chars)
```
---
name: ngs-amplicon-microbiome
description: Kick off public 16S, 18S, ITS, COI, or other marker-gene amplicon microbiome workflows using nf-core/ampliseq, QIIME2, DADA2, and Cutadapt.
---

# Amplicon Microbiome

Use this skill for marker-gene microbiome analysis from amplicon FASTQs.

## Essential Inputs

Confirm:

- marker region: 16S, 18S, ITS, COI, or custom
- primer sequences and orientation
- paired-end or single-end reads
- whether reads should be merged
- taxonomy database and version
- sample metadata
- endpoint: ASV table, taxonomy, diversity, differential abundance, or plots

## Public Defaults

Prefer `nf-core/ampliseq` for reproducible end-to-end runs. Use QIIME2 or DADA2 directly when the user wants notebook-level control or an existing lab protocol requires it.

## Preflight

```bash
python plugins/ngs-analysis/scripts/ngs_preflight.py --pipeline amplicon_microbiome --emit-install-plan
```

## Local Execution Package

For FASTQ intake/QC before primer, ASV, and taxonomy decisions, use:

```bash
python plugins/ngs-analysis/scripts/run_fastq_assay_package.py \
  --lane amplicon_microbiome \
  --sample-sheet amplicon_samples.tsv \
  --execute
```

This validates read paths and structure, runs seqkit stats and FastQC/MultiQC when available, and writes `amplicon_analysis_status.json`. The runner now also emits `methods/amplicon_methods.json` plus a concrete backend handoff bundle under `workflow/` so primer, denoiser, truncation, normalization, and taxonomy choices are machine-readable even before a full backend is run.

If the user asks for a full amplicon analysis rather than QC/readiness, do not treat FASTQs alone as sufficient. Require primer sequences, primer orientation, taxonomy database plus version, and sample metadata before presenting the run as analysis-ready. Without that context, run the local execution package and describe the result as a read-QC/readiness bundle only.

For backend ASV/taxonomy/diversity execution when primers, metadata, and taxonomy resources are available, use:

```bash
python plugins/ngs-analysis/scripts/run_amplicon_microbiome.py \
  --sample-sheet amplicon_samples.tsv \
  --backend qiime2 \
  --primer-forward GTGYCAGCMGCCGCGGTAA \
  --primer-reverse GGACTACNVGGGTWTCTAAT \
  --taxonomy-classifier silva-138-classifier.qza \
  --metadata sample_metadata.tsv \
  --execute
```

Use `--backend dada2` for a direct R/Bioconductor ASV path. The plugin includes `workflows/amplicon_microbiome/run_dada2_backend.R`; the runner checks for `Rscript` and the `dada2` R package before execution, then writes normalized ASV, representative-sequence, read-retention, and optional taxonomy tables under `tables/`.

For nf-core execution, use `plugins/ngs-analysis/scripts/run_nfcore_pipeline.py --pipeline ampliseq`.

The direct backend runner also emits `resources/resource_plan.json`, `resource_manifest.tsv`, `resource_env.sh`, and `resource_readiness.md`. The resource check is advisory by default when a QIIME classifier is supplied directly; add `--bundle-root silva_138_amplicon=<path>`, `--include-optional-resources`, and `--require-resource-plan` when missing registered taxonomy databases should block readiness.

The backend runner writes native normalized tables when QIIME2/DADA2/nf-core outputs are present:

- `tables/asv_table.tsv`
- `tables/representative_sequences.fasta` for direct DADA2 runs
- `tables/taxonomy.tsv`
- `tables/read_retention.tsv`
- `tables/amplicon_backend_summary.json`
- `tables/alpha_diversity.tsv`, `tables/bray_curtis_distance.tsv`, and `tables/top_taxa_or_features.tsv` when a normalized ASV/feature table is available

QIIME2 BIOM-only feature-table exports are recorded as requiring conversion, with a `biom convert` command in the backend summary. Do not claim diversity or taxonomy interpretation unless these normalized tables or equivalent supplied inputs exist.

## Kickoff Pattern

nf-core preflight run:

```bash
nextflow run nf-core/ampliseq \
  -profile test,docker \
  --outdir results/ampliseq_test
```

Before a real run, verify primer trimming and truncation choices from read-quality profiles.

## Visualization Outputs

The local FASTQ package always writes `visualizations/index.html` and `visualizations/visualization_manifest.json`. With only FASTQs, this is a read-QC/readiness bundle. If an ASV/feature table is available, pass it to the runner with `--asv-table` to generate alpha diversity, Bray-Curtis PCoA, and rarefaction artifacts. If a feature taxonomy table is available, pass `--taxonomy-table` to generate taxa barplots. When downstream tables are labeled synthetic or contain sample columns that are not present in the real sample sheet, the runner marks the run review-only and blocks beta-diversity/PCoA unless `--allow-synthetic-diversity` is set explicitly.

The run also emits `qc_verdict.json` and, for amplicon runs, `qc_interpretation.json` with machine-readable reason codes, a readiness verdict, and follow-on command templates for generatin
```

---

# DECISAO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\render\skills\render-migrate-from-heroku\SKILL.md
**SHA:** 03634b5a7ad35d98
**Timestamp:** 2026-08-26T18:41:08.307409
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Principios
- Key principle: **Heroku stays fully functional until the user explicitly cuts over DNS.** The migration is additive until that final step.

### Ouro Bruto (primeiros 5000 chars)
```
---
name: render-migrate-from-heroku
description: "Migrate from Heroku to Render by reading local project files and generating equivalent Render services. Triggers: any mention of migrating from Heroku, moving off Heroku, Heroku to Render migration, or switching from Heroku. Reads Procfile, dependency files, and app config from the local repo. Optionally uses Heroku MCP to enrich with live config vars, add-on details, and dyno sizes. Uses Render MCP or Blueprint YAML to create services."
license: MIT
compatibility: Render MCP server recommended for direct creation and automated verification; not required for the Blueprint path. Heroku MCP server is optional (enhances config var and add-on discovery).
metadata:
  author: Render
  version: "1.5.0"
  category: migration
---

# Heroku to Render Migration

Migrate from Heroku to Render by reading local project files first, then optionally enriching with live Heroku data via MCP.

## Prerequisites Check

Before starting, verify what's available:

1. **Local project files** (required) — confirm the current directory contains a Heroku app (look for `Procfile`, `app.json`, `package.json`, `requirements.txt`, `Gemfile`, `go.mod`, or similar)
2. **Render MCP** (recommended) — check if `list_services` tool is available. Required for MCP Direct Creation (Step 3B) and automated verification (Step 6). Not required for the Blueprint path — the Render CLI and Dashboard handle generation, validation, and deployment.
3. **Heroku MCP** (optional) — check if `list_apps` tool is available

If Render MCP is missing and the user needs it, guide them through setup using the [MCP setup guide](references/mcp-setup.md). If Heroku MCP is missing, note that config var values and add-on plan details will need to be provided manually.

## Migration Workflow

Execute steps in order. Present findings to the user and get confirmation before creating any resources.

### Step 1: Inventory Heroku App

Gather app details from local files first, then supplement with Heroku MCP if available.

#### 1a. Read local project files (always)

Read these files from the repo to determine runtime, commands, and dependencies:

| File                                              | What it tells you                                                      |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| `Procfile`                                        | Process types and start commands (`web`, `worker`, `clock`, `release`) |
| `package.json`                                    | Node.js runtime, build scripts, framework deps (Next.js, React, etc.)  |
| `requirements.txt` / `Pipfile` / `pyproject.toml` | Python runtime, dependencies (Django, Flask, etc.)                     |
| `Gemfile`                                         | Ruby runtime, dependencies (Rails, Sidekiq, etc.)                      |
| `go.mod`                                          | Go runtime                                                             |
| `Cargo.toml`                                      | Rust runtime                                                           |
| `app.json`                                        | Declared add-ons, env var descriptions, buildpacks                     |
| `runtime.txt`                                     | Pinned runtime version                                                 |
| `static.json`                                     | Static site indicator                                                  |
| `yarn.lock` / `pnpm-lock.yaml`                    | Package manager (affects build command)                                |

From these files, determine:

- **Runtime** — from dependency files (see the [buildpack mapping](references/buildpack-mapping.md))
- **Runtime version** — from `runtime.txt`, `.node-version`, or `engines` in `package.json`. If pinned, carry it over as an env var (e.g., `PYTHON_VERSION`, `NODE_VERSION`). If not pinned, do not specify a version — never assume or state what Render's default version is.
- **Build command** — from package manager and framework (see the [buildpack mapping](references/buildpack-mapping.md))
- **Start commands** — from `Procfile` entries
- **Process types** — from `Procfile` (web, worker, clock, release)
- **Add-ons needed** — from `app.json` `addons` field, or infer from dependency files (e.g., `pg` in `package.json` suggests Postgres, `redis` suggests Key Value)
- **Static site?** — from `static.json`, SPA framework deps, or static buildpack in `app.json`

#### 1b. Enrich with Heroku MCP (if available)

If the Heroku MCP server is connected, call these tools to fill in details that aren't in the repo. The **dyno size** and **add-on plan slug** are critical — they determine which Render plans to use.

1. `list_apps` — let user select which app to migrate (confirms app name)
2. `get_app_info` — capture: region, stack, buildpacks, **config var names**
3. `list_addon
```

---

# DECISAO - SKILL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\superpowers\skills\writing-plans\SKILL.md
**SHA:** 4fd4627d2c023678
**Timestamp:** 2026-08-26T18:42:08.321567
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- **Announce at start:** "I'm using the writing-plans skill to create the implementation plan."
- Run: `pytest tests/path/test.py::test_name -v`
- Run: `pytest tests/path/test.py::test_name -v`

### Ouro Bruto (primeiros 5000 chars)
```
---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Context:** If working in an isolated worktree, it should have been created via the `superpowers:using-git-worktrees` skill at execution time.

**Save plans to:** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`
- (User preferences for plan location override this default)

## Scope Check

If the spec covers multiple independent subsystems, it should have been broken into sub-project specs during brainstorming. If it wasn't, suggest breaking this into separate plans — one per subsystem. Each plan should produce working, testable software on its own.

## File Structure

Before defining tasks, map out which files will be created or modified and what each one is responsible for. This is where decomposition decisions get locked in.

- Design units with clear boundaries and well-defined interfaces. Each file should have one clear responsibility.
- You reason best about code you can hold in context at once, and your edits are more reliable when files are focused. Prefer smaller, focused files over large ones that do too much.
- Files that change together should live together. Split by responsibility, not by technical layer.
- In existing codebases, follow established patterns. If the codebase uses large files, don't unilaterally restructure - but if a file you're modifying has grown unwieldy, including a split in the plan is reasonable.

This structure informs the task decomposition. Each task should produce self-contained changes that make sense independently.

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

## Task Structure

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## No Placeholders

Every step must contain the actual content an engineer needs. These are **plan failures** — never write them:
- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the code — the engineer may be reading tasks out of order)
- Steps that describe what to do without showing how (code blocks required for code steps)
- References to types, functions, or methods not defined in any task

## Remember
- Exact file paths always
- Complete code in every step — if a step changes code, show the code
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits

## Self-Review

After writing the complete plan, look at the spec with fresh eyes and check the plan against it. This is a checklist you run yourself — not a subagent dispatch.

**1. Spec coverage:** Skim each section/requirement in the spec. Can you point to a task that implements it? List any gaps.

**2. Placeholder scan:** Search your plan for red flags — any of the patterns from the "No Placeholders" section abov
```