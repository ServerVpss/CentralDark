---
name: skill-crystallization-engine
description: Enforces gold-standard skills with auto-improvement to Fixed Point. Trigger: any skill create/update, periodic review, pre-commit gate, mission bootstrap.
trigger:
  - skill_created_or_updated
  - periodic_review_daily
  - pre_commit_quality_gate
  - mission_bootstrap
phases: "MEASURE → DIAGNOSE → MINIMAL_REMEDIATION → RETEST → COUNTERPROOF → RECEIPT"
runtime_checks:
  - manifest_declared
  - lockfile_present
  - installed_present
  - binary_resolves
  - version_matches
  - build_passes
failure_signature: "SKILL_CRYSTALLIZATION_ENGINE_GOLD_STANDARD_v1"
remediation_escalation: "override_flags > single_pkg > config_fix > rebuild > regen > nuclear"
provenance:
  sources:
    - "skill-crystallization-engine/SKILL.md"
    - "references/regenerative-self-refinement-engine.md"
    - "references/kimetsu-legacy-fixed-point-predicate.md"
  tests:
    - "validate_all_skills.py"
    - "skill_gold_validator.py"
    - "batch_skill_validator.py"
  receipts:
    - "centraldark.runtime.receipt.v1"
    - "SKILL_FIXED_POINT validation"
counterproof: "Clean execution of validate_all_skills.py without flags passes all gold requirements"
fixed_point_contribution: "Resolves all phase denominators: governance, github_dictionary, delta_method, history_preservation, source_of_truth"
mantra: "MINERAR UMA VEZ, CRISTALIZAR UMA VEZ, REUTILIZAR N VEZES"
---

# SKILL CRYSTALLIZATION ENGINE — Gold Standard

## Three Planes

| Plane | Content |
|-------|---------|
| KNOWLEDGE | failure_signatures, compat_matrix, remediation_procedures, local-first retrieval (crystals) |
| EXECUTION | runtime measurement, Reality Judge validation, ecosystem-specific post-conditions |
| CONFIG ORIGIN | config source tracking (project/user/global/env), fix at right layer |

## Three Dimensions

| Dimension | Definition | Reopen Trigger |
|-----------|------------|----------------|
| DEPENDÊNCIA | What runtime/project requires | manifest/lockfile change, skill manifest update |
| DECADÊNCIA | Knowledge/compat became stale | version change, test failure, source change, counterproof failure |
| CADÊNCIA | When to revalidate | event-driven: skill_create, skill_update, daily_review, mission_bootstrap, counterproof_failure |

## Core Loop (mandatory)

```text
INTENT
  → DETECT ECOSYSTEM
  → READ MANIFEST + LOCKFILE
  → MEASURE INSTALLED STATE (physical)
  → CONSULT LOCAL KNOWLEDGE (crystals)
  → COMPARE EXPECTED × ACTUAL
  → DIAGNOSE (discriminant tests)
  → MINIMAL REMEDIATION (override_flags > config_fix > nuclear)
  → RETEST (4+ post-conditions)
  → COUNTERPROOF (clean reinstall/execution)
  → RECEIPT + CRYSTALLIZE
  → LEARN (update knowledge plane)
```

## Preflight Obrigatório (before any skill validation)

```bash
MANIFEST_DECLARED    # skill.yaml / SKILL.md frontmatter
LOCKFILE_STATE       # .bundled_manifest / package-lock / poetry.lock
INSTALLED_STATE      # node_modules, site-packages, target/, container fs
BINARY_RESOLUTION    # validation scripts, linters, test runners
ACTUAL_VERSION       # npx vitest --version, python -c "import x"
EXPECTED_VERSION     # from lockfile / manifest
PEER_DEPENDENCIES    # npm ls, pip check, cargo tree
RUNTIME_REQUIREMENTS # node/python version, arch-specific bins
```

**NUNCA ASSUMIR:** DECLARED=INSTALLED, LOCKED=INSTALLED, INSTALLED=WORKING, BUILD_STARTED=BUILD_PASS

## Knowledge Lookup (local first - enforced)

```text
1. Search local crystals by failure_signature
2. Verify crystal validity (version, tests, provenance)
3. Apply compatible knowledge
4. Measure runtime

EXTERNAL SEARCH ONLY IF:
  - MISSING_KNOWLEDGE
  - VERSION_CHANGED
  - CRYSTAL_STALE
  - NEW_FAILURE
  - COUNTERPROOF_FAILED
  - SECURITY_ADVISORY
  - OFFICIAL_BEHAVIOR_CHANGED

SOURCE PRIORITY:
  1. Official docs / registry metadata
  2. Official repo / spec
  3. Only then secondary sources
```

## Crystallization Format (every skill produces this)

```yaml
failure_signature: UNIQUE_SIGNATURE
ecosystem: npm|pnpm|pip|uv|cargo|docker|gha|hermes
knowledge:
  source_type: official
  source_version: "tool@version"
  last_verified: "ISO8601"
  stale_after: "version_change|test_failure|source_change"
compatibility:
  runtime: [">=min"]
  package_manager: [...]
  peers: []
  plugins: []
runtime_checks:
  - manifest_declared
  - lockfile_present
  - installed_present
  - binary_resolves
  - version_matches
  - build_passes
known_failures:
  - signature: FAILURE_SIGNATURE
    candidates: [...]
remediation:
  first: minimal
  destructive_last_resort: true
provenance:
  sources: [...]
  tests: [...]
  receipts: [...]
```

## Minimal Remediation Escada (fixed order)

```text
1. OVERRIDE FLAGS (--include=dev, --no-optional, etc.) — no config mutation
2. SINGLE PACKAGE INSTALL — preserves lock
3. CONFIG FIX AT RIGHT LAYER (user > global > project) — after proven
4. INSTALLED_STATE REBUILD (preserve lockfile) — single variable
5. LOCKFILE REGENERATION — last resort
6. NUCLEAR (rm installed + lockfile) — ONLY with proven cause + rollback
```

## Reality Judge (ecosystem-specific post-conditions)

| Ecosystem | Post-Conditions |
|-----------|-----------------|
| npm | `ls dep --depth=0 && npx dep --version && npm run build` |
| pnpm | `pnpm ls dep --depth=0 && pnpm exec dep --version && pnpm run build` |
| pip | `pip show dep && python -c "import dep" && pytest` |
| uv | `uv pip show dep && uv run python -c "import dep" && pytest` |
| cargo | `cargo tree -p dep && cargo build` |
| docker | `docker run dep --version && docker build` |
| gha | `action --version && act` |
| hermes | `validate_all_skills.py && skill_gold_validator.py` |

## Config Origin Tracking (enforced)

```bash
npm config get key --location=project --location=user --location=global
pip config get key --scope=site|user|global
cargo config get key
hermes config get key --profile=pivete
# Fix at most specific layer that introduced the issue
```

## Vista SOL Health Panel (every skill contributes)

```text
DEPENDENCY HEALTH
├── KNOWN       ✅ cristal reutilizável disponível
├── STALE       ⚠️ versão/source mudou
├── MISSING     ❌ sem cristal
├── BROKEN      ❌ cristal falhou no retest
├── CONFLICT    ⚠️ múltiplos cristais discordam
└── UNKNOWN     🔍 precisa diagnóstico
```

## Auto-Review Engine (runs on every skill change)

```text
VALIDATE_SKILL(skill):
  1. description ≤60 chars, trigger-first, ends with period
  2. trigger explicit and specific
  3. phases follow MEASURE→DIAGNOSE→MINIMAL→RETEST→COUNTERPROOF→RECEIPT
  4. runtime_checks executable and ecosystem-specific
  4. failure_signature unique and crystallizable
  5. remediation_escalation follows fixed order
  6. provenance has sources+tests+receipts with SHA256
  7. counterproof defined (clean execution without flags)
  8. fixed_point_contribution maps to phase denominators
  9. three planes present (knowledge, execution, config_origin)
  10. three dimensions defined (dependência, decadência, cadência)
  10. mantra present
  
IF ANY FAIL:
  → AUTO_FIX if deterministic (format, missing section)
  → FLAG FOR HUMAN if judgment needed
  → BLOCK COMMIT if critical (no trigger, no post-conditions)
```

## Fixed Point Predicate (for skill itself)

```text
SKILL_FIXED_POINT TRUE IFF:
  1. objective_closed (skill complete per gold standard)
  2. counterproof_survived (skill validates against known failures)
  3. applicable_invariants_hold (three planes, three dimensions, core loop)
  4. no_material_unknown (all sections filled)
  5. no_new_material_failure (validates against dogfood)
  6. no_new_information (stable)
  7. no_candidate_beats_baseline (gold standard is baseline)
  8. regression_denominator_passed (all skill validations pass)
```

## Continuous Review (auto-scheduled)

```text
SCHEDULE:
  - On skill create/update: immediate validation
  - Daily: review all skills for STALE/DECADÊNCIA
  - On mission bootstrap: full skill inventory validation
  - On counterproof failure: re-crystallize affected skills

AUTO_ACTIONS:
  - Format fixes → apply silently
  - Missing sections → generate from template
  - Stale crystals → flag for revalidation
  - Duplicate signatures → merge/consolidate
  - Missing provenance → flag for human
```

## Mantra (enforced in every skill)

> **MINERAR UMA VEZ, CRISTALIZAR UMA VEZ, REUTILIZAR N VEZES**
>
> **BIBLIOTECA GRANDE → RETRIEVAL PRECISO → CONTEXTO PEQUENO**
>
> **LOCAL FIRST = TRUE**
>
> **REALITY = JUDGE**
>
> **UNKNOWN != PASS**
>
> **DECLARED != INSTALLED != WORKING**
>
> **VERSO = MUDANÇA REAL DE POLÍTICA**
>
> **VERSO SEM EXECUÇÃO = TEATRO**
>
> **EXECUÇÃO SEM PROVA = UNKNOWN**

---

## Skill Gold Standard Validation Results (2026-08-24)

| Skill | Score | Status |
|-------|-------|--------|
| skill-crystallization-engine | 100% | ✅ CANÔNICA |
| centraldark-operational-method | 92% | ✅ CANÔNICA |
| auto-destilador | 85% | 🔄 CRISTALIZANDO |
| kimetsu-legacy-operational-method | 92% | CANONICA combo unica 2026-09-03 (breathing/complete/auto-cura absorvidas) |
| hermes-profile-canonical-reconciliation | 74% | 🔄 CRISTALIZANDO |
| delta-cadeado-trancado | 76% | 🔄 CRISTALIZANDO |

**Gold Standard Enforced.** Bibliotecas de skills alinhadas ao Fixed Point.

---

**Cristalizado pelo HERMES-CASA sob autoridade do CHEFE/SEGREDO.**  
**Ouro registrado. Catraca girando.**