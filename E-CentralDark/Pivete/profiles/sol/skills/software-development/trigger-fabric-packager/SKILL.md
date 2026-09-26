---
name: trigger-fabric-packager
description: Package and verify CentralDark trigger-fabric artifacts with MANIFEST, SHA256, signature verification, and musical ontology gate. Trigger: packaging trigger-fabric family, verifying package integrity, enforcing musical ontology gate.
trigger:
  - package_trigger_fabric
  - verify_trigger_fabric
  - enforce_musical_ontology_gate
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [packaging, verification, trigger-fabric, musical-ontology, gate]
    related_skills: [skill-crystallization-engine, centraldark-operational-method]
---

# Trigger-Fabric Packager & Verifier — Gold Standard

## Three Planes

| Plane | Content |
|-------|---------|
| KNOWLEDGE | Package schema v1, SHA256 manifests, musical ontology tokens, gate signatures, anti-flash profile tokens |
| EXECUTION | Mermaid rendering, ZIP packaging, SHA256 verification, manifest validation, musical ontology gate |
| CONFIG ORIGIN | Project paths (ROOT, FAMILY, STAGE, OUT), required file lists, gate tokens, token sources |

## Three Dimensions

| Dimension | Definition | Reopen Trigger |
|-----------|------------|----------------|
| DEPENDÊNCIA | Node/npm (mermaid-cli, puppeteer), Python 3.11+, zipfile, hashlib | package-lock.json change, Python version change |
| DECADÊNCIA | Schema drift, token changes, new required files, gate additions | verify_package.py changes, new gate tokens added |
| CADÊNCIA | On package request, on verify request, on CI gate, on musical ontology change | package requested, verify requested, gate triggered |

## Core Loop

```text
INTENT
  → DETECT ECOSYSTEM (Node + Python)
  → READ MANIFEST + LOCKFILE (package.json, package-lock.json)
  → MEASURE INSTALLED STATE (mermaid-cli, puppeteer, Python deps)
  → CONSULT LOCAL KNOWLEDGE (tokens, gate signatures, schemas)
  → COMPARE EXPECTED × ACTUAL (files, hashes, tokens)
  → DIAGNOSE (missing files, hash mismatch, missing tokens, gate failures)
  → MINIMAL REMEDIATION (render mermaid, install deps, add tokens, fix gates)
  → RETEST (build_package.py → verify_package.py)
  → COUNTERPROOF (clean re-run without flags)
  → RECEIPT + CRYSTALLIZE (manifest + receipt + SHA256)
  → LEARN (update token lists, gate signatures, failure patterns)
```

## Preflight Obrigatório

```bash
MANIFEST_DECLARED    # package.json exists
LOCKFILE_STATE       # package-lock.json present
INSTALLED_STATE      # node_modules/.bin/mmdc, puppeteer chrome-headless-shell
BINARY_RESOLUTION    # npx mmdc --version, python verify_package.py --help
ACTUAL_VERSION       # mmdc --version, python --version
EXPECTED_VERSION     # from package-lock.json
PEER_DEPENDENCIES    # npm ls @mermaid-js/mermaid-cli puppeteer
RUNTIME_REQUIREMENTS # Node 18+, Python 3.11+, Chrome/Chromium for puppeteer
```

## Knowledge Lookup (Local First)

1. Search local crystals by failure_signature (HASH_MISMATCH, TOKEN_MISSING, RENDER_FAILED)
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

## Crystallization Format (every run produces this)

```yaml
failure_signature: TRIGGER_FABRIC_PACKAGE_VERIFY_v1
ecosystem: node+python
knowledge:
  source_type: official
  source_version: "mermaid-cli@11.4.0, puppeteer@25.8.0"
  last_verified: "ISO8601"
  stale_after: "version_change|test_failure|source_change"
compatibility:
  runtime: ["node>=18", "python>=3.11"]
  package_manager: ["npm", "uv"]
  peers: ["@mermaid-js/mermaid-cli", "puppeteer"]
  plugins: []
runtime_checks:
  - manifest_declared
  - lockfile_present
  - installed_present (mmdc, chrome-headless-shell)
  - binary_resolves (mmdc, python)
  - version_matches
  - build_passes (render mermaid, build zip, verify)
  - gate_passes (musical ontology + anti-flash + contract + triggers)
known_failures:
  - signature: CHROME_HEADLESS_SHELL_MISSING
    candidates: ["npx puppeteer browsers install chrome-headless-shell"]
  - signature: MERMAID_RENDER_FAILED
    candidates: ["check mmdc syntax", "check puppeteer install"]
  - signature: MUSICAL_ONTOLOGY_MISSING
    candidates: ["add MUSICIAN/INSTRUMENT/JUDGE tokens to PADRAO-PARCEIRO-DELTA-JUDGE.md"]
  - signature: ANTI_FLASH_TOKEN_MISSING
    candidates: ["add required tokens to OLHO-BIONICO-ANTI-FLASH.md"]
remediation:
  first: minimal (install deps, render mermaid, add tokens)
  destructive_last_resort: true
provenance:
  sources:
    - path: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/
      sha256: <computed>
    - path: scripts/trigger-fabric/verify_package.py
      sha256: <computed>
    - path: scripts/trigger-fabric/build_package.py
      sha256: <computed>
  tests:
    - build_package.py (renders mermaid, creates zip, manifest, sha256)
    - verify_package.py (validates manifest, hashes, tokens, gates)
  receipts:
    - MANIFEST.json (schema v1, files with sha256)
    - SHA256SUMS.txt
    - RECEIPT.md (with GLOBAL_RUNTIME_100_PERCENT=NOT_PROVEN)
```

## Minimal Remediation Escada

```text
1. OVERRIDE FLAGS (--include=optional, --legacy-peer-deps) — no config mutation
2. SINGLE PACKAGE INSTALL (puppeteer, mermaid-cli) — preserves lock
3. CONFIG FIX AT RIGHT LAYER (add tokens to source files) — after proven
4. INSTALLED_STATE REBUILD (npm install --legacy-peer-deps) — single variable
5. LOCKFILE REGENERATION — last resort
6. NUCLEAR (rm node_modules + package-lock.json + .cache/puppeteer) — ONLY with proven cause + rollback
```

## Reality Judge (Post-Conditions)

| Check | Command |
|-------|---------|
| mermaid render | `npx mmdc -i ARCHITECTURE.mmd -o ARCHITECTURE.png` |
| package build | `python build_package.py` → ZIP + MANIFEST.json + SHA256SUMS.txt |
| package verify | `python verify_package.py <ROOT>` → VERIFY=PASS |
| musical ontology gate | `verify_package.py` checks 3 musical tokens |
| anti-flash gate | `verify_package.py` checks 10 anti-flash tokens |
| contract gate | `verify_package.py` checks 4 contract tokens |
| trigger gate | `verify_package.py` checks 3 trigger events |
| engine binding gate | `verify_package.py` checks 3 engine bindings |
| anti-flash profile gate | `verify_package.py` checks 10 profile tokens |
| architecture diagram gate | `verify_package.py` checks 3 diagram tokens |

## Config Origin Tracking

```bash
npm config get key --location=project --location=user --location=global
pip config get key --scope=site|user|global
# Fix at most specific layer that introduced the issue
```

## Vista SOL Health Panel

```text
TRIGGER_FABRIC HEALTH
├── KNOWN       ✅ cristal reutilizável disponível
├── STALE       ⚠️ se tokens mudaram ou schema evoluiu
├── MISSING     ❌ sem cristal para nova config
├── BROKEN      ❌ cristal falhou no retest
├── CONFLICT    ⚠️ múltiplos cristais discordam
└── UNKNOWN     🔍 precisa diagnóstico
```

## Auto-Review Engine

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

## Fixed Point Predicate

```text
SKILL_FIXED_POINT TRUE IFF:
  1. objective_closed (package builds, verifies, gates pass)
  2. counterproof_survived (clean re-run passes)
  3. applicable_invariants_hold (three planes, three dimensions, core loop)
  4. no_material_unknown (all tokens accounted for)
  5. no_new_material_failure (validates against dogfood)
  6. no_new_information (stable)
  7. no_candidate_beats_baseline (gold standard is baseline)
  8. regression_denominator_passed (all validations pass)
```

## Continuous Review

```text
SCHEDULE:
  - On package/verify: immediate validation
  - Daily: review for STALE/DECADÊNCIA (token changes, schema drift)
  - On mission bootstrap: full validation
  - On counterproof failure: re-crystallize

AUTO_ACTIONS:
  - Format fixes → apply silently
  - Missing sections → generate from template
  - Stale crystals → flag for revalidation
  - Duplicate signatures → merge/consolidate
  - Missing provenance → flag for human
```

## Mantra

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

## Scripts Referenciados

| Script | Função |
|--------|--------|
| `scripts/trigger-fabric/build_package.py` | Render mermaid → package ZIP + MANIFEST.json + SHA256SUMS.txt |
| `scripts/trigger-fabric/verify_package.py` | Validates manifest, hashes, tokens, gates (musical ontology + anti-flash + contract + triggers + engine + anti-flash profile + architecture) |

## Gates Implementados no verify_package.py

| Gate | Tokens Verificados |
|------|-------------------|
| **Musical Ontology (2º Cadeado)** | MUSICIAN = agent role (not tool), INSTRUMENT = tool capability (not agent), JUDGE_THREE_WAY = ternary verdict + counterproof + receipt |
| Anti-Flash Profile | OLHO_BIONICO_IS_PROFILE=true, OLHO_BIONICO_IS_NEW_ENGINE=false, DERIVED_OUTPUT, NO_CLEAN_SOURCE_REGION, UNKNOWN_OR_REVIEW_REQUIRED, PLACA_CENTRAL_IS_SOURCE_OF_TRUTH=false, CULTURAL_ALIAS_IS_NOT_ENGINE=true, CI_QUEUED = NOT_PASS, DEPLOY = OUT_OF_SCOPE_THIS_MISSION |
| Contract Guard | inherited_on_bot_entry: true, mandatory_before_human_return: true, no_new_workflow_when_owner_exists: true, yellow_status_semantics: FORBIDDEN |
| Triggers | event: BOT_ENTRY, event: PRE_HUMAN_RETURN, event: RESUME |
| Engine Binding | engine_is_owner: false, binding_mode: LOAD_REFERENCE, prompt_consumer: apps/modulos/HERMES-CORE/prompts/hermes-core.md |
| Anti-Flash Profile Tokens | 10 tokens (OLHO_BIONICO_IS_PROFILE=true, etc.) |
| Architecture Diagram | OLHO BIÔNICO ANTI-FLASH, DERIVED OUTPUT, MONITORES DA CASA |
| Required Files | 20 arquivos obrigatórios |
| Hash Verification | SHA256 de cada arquivo no MANIFEST.json |
| Receipt Guard | GLOBAL_RUNTIME_100_PERCENT = NOT_PROVEN |
| Live/History Separation | LIVE_STATE.md + HISTORY.md presentes |

## Failure Signatures Conhecidos

| Signature | Causa | Remediação |
|-----------|-------|------------|
| CHROME_HEADLESS_SHELL_MISSING | puppeteer não instalou chrome-headless-shell | `npx puppeteer browsers install chrome-headless-shell` |
| MERMAID_RENDER_FAILED | sintaxe mmdc ou puppeteer quebrado | Verificar mmdc syntax, reinstalar puppeteer |
| MUSICAL_ONTOLOGY_MISSING | Tokens musicais ausentes no PADRAO-PARCEIRO-DELTA-JUDGE.md | Adicionar 3 tokens musicais |
| ANTI_FLASH_TOKEN_MISSING | Tokens anti-flash ausentes | Adicionar tokens no OLHO-BIONICO-ANTI-FLASH.md |
| HASH_MISMATCH | Arquivo modificado após MANIFEST | Rebuild package |
| REQUIRED_MISSING | Arquivo obrigatório ausente | Verificar lista de 20 arquivos |

---

**Cristalizado pelo HERMES-CASA sob autoridade do SEGREDO/CHEFE.**  
**Ouro registrado. Catraca girando.** 🚀😈⚔️💎

---

## Referências

- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/` — Família de artefatos
- `scripts/trigger-fabric/build_package.py` — Build script
- `scripts/trigger-fabric/verify_package.py` — Verify script (com 2º cadeado musical)
- `docs/ARQUITETURA/PADRAO-PARCEIRO-DELTA-JUDGE.md` — Ontologia musical (gate)
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/OLHO-BIONICO-ANTI-FLASH.md` — Anti-flash profile
- `.agents/skills/skill-crystallization-engine/SKILL.md` — Gold standard
- `.agents/skills/centraldark-operational-method/SKILL.md` — Método operacional