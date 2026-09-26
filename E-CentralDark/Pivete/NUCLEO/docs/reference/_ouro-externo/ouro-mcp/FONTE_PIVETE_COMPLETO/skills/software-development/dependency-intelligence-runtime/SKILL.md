---
name: dependency-intelligence-runtime
description: Diagnose/fix missing deps with local-first crystals.
---

# DEPENDENCY INTELLIGENCE RUNTIME

## TRIGGER
- Any build/runtime failure where declared ≠ installed ≠ working
- Dependency missing despite lockfile presence
- Version conflicts, peer dep failures, optional dep omissions

## ARCHITECTURE: THREE PLANES

```text
DEPENDENCY KNOWLEDGE PLANE (cabeça)
  → Crystals: failure_signatures, compat_matrix, remediation_procedures
  → Source: official docs + proven receipts
  → Local-first retrieval, small context

DEPENDENCY EXECUTION PLANE (corpo)
  → Runtime measurement: manifest, lockfile, installed, binaries
  → Reality Judge: build/test/execution validates

CONFIG ORIGIN PLANE
  → Track where config came from (project/user/global/env)
  → Fix at right layer, not symptoms
```

## THREE DIMENSIONS (cristalizáveis)

| Dimension | Definition | When to Reopen |
|-----------|------------|----------------|
| **DEPENDÊNCIA** | What runtime/project requires | manifest/lockfile change |
| **DECADÊNCIA** | Knowledge/compat became stale | version change, test failure, source change |
| **CADÊNCIA** | When to revalidate | event-driven: mission_start, build_fail, version_change |

## CORE LOOP (obrigatório para toda missão técnica)

```text
INTENT
  → DETECT ECOSYSTEM (npm/pip/cargo/docker/gha)
  → READ MANIFEST + LOCKFILE
  → MEASURE INSTALLED STATE (physical)
  → CONSULT LOCAL KNOWLEDGE (crystals)
  → COMPARE EXPECTED × ACTUAL
  → DIAGNOSE (discriminant tests)
  → MINIMAL REMEDIATION (override flags > config fix > nuclear)
  → RETEST (4 post-conditions)
  → COUNTERPROOF (clean reinstall)
  → RECEIPT + CRYSTALLIZE
  → LEARN (update knowledge plane)
```

## PREFLIGHT OBRIGATÓRIO (antes de build/dev/test/runtime)

```bash
# Measure
MANIFEST_DECLARED    # package.json, requirements.txt, Cargo.toml
LOCKFILE_STATE       # package-lock, poetry.lock, Cargo.lock
INSTALLED_STATE      # node_modules, site-packages, target/
BINARY_RESOLUTION    # vite, esbuild, rollup, pytest, cargo
ACTUAL_VERSION       # npx vite --version, python -c "import x; print(x.__version__)"
EXPECTED_VERSION     # from lockfile
PEER_DEPENDENCIES    # npm ls, pip check, cargo tree
RUNTIME_REQUIREMENTS # node/python version, arch-specific bins
```

**NUNCA ASSUMIR:** DECLARED=INSTALLED, LOCKED=INSTALLED, INSTALLED=WORKING, BUILD_STARTED=BUILD_PASS

## KNOWLEDGE LOOKUP (local first)

```text
1. Search local crystals by failure_signature
2. Verify crystal validity (version, tests, provenance)
3. Apply compatible knowledge
4. Measure runtime

EXTERNAL SEARCH ONLY IF:
  - MISSING_KNOLEDGE
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

## CRYSTALLIZATION FORMAT (cada crystal reutilizável)

```yaml
failure_signature: OMIT_DEV_CAUSES_VITE_ABSENCE
ecosystem: npm
knowledge:
  source_type: official
  source_version: "npm@12+"
  last_verified: "2026-08-24T06:XX:XXZ"
  stale_after: "version_change"
compatibility:
  node: [">=18"]
  package_manager: [npm, pnpm]
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
  - signature: VITE_MISSING_IN_NODE_MODULES
    candidates:
      - install_or_extraction_failure
      - dependency_tree_failure
      - package_manager_cache_problem
      - omit_dev_active  # ← THIS CASE
remediation:
  first: minimal
  destructive_last_resort: true
provenance:
  sources: ["npm docs", "npm cli issues #4828"]
  tests: ["clean_reinstall_without_flags"]
  receipts: ["2026-08-24_heal_vite_001"]
```

## MINIMAL REMEDIATION ESCADA (ordem fixa)

```text
1. OVERRIDE FLAGS (--include=dev, --no-optional, etc.) — no config mutation
2. SINGLE PACKAGE INSTALL (vite@x, @rollup/rollup-win32-x64-msvc) — preserves lock
3. CONFIG FIX AT RIGHT LAYER (user > global > project) — after proven
4. NODE_MODULES REBUILD (preserve lockfile) — single variable change
5. LOCKFILE REGENERATION (npm install) — last resort
6. NUCLEAR (rm node_modules + lockfile) — ONLY with proven cause + rollback
```

## ECOSYSTEM ADAPTERS (interface comum)

| Ecosystem | Manifest | Lockfile | Installed | Binary Check |
|-----------|----------|----------|-----------|--------------|
| npm | package.json | package-lock.json | node_modules/ | npx cmd --version |
| pnpm | package.json | pnpm-lock.yaml | node_modules/ | pnpm exec cmd --version |
| pip | requirements.txt / pyproject.toml | poetry.lock / uv.lock | site-packages/ | python -c "import x" |
| uv | pyproject.toml | uv.lock | .venv/ | uv run cmd --version |
| cargo | Cargo.toml | Cargo.lock | target/ | cargo run --version |
| docker | Dockerfile | image digest | container fs | docker run --version |
| gha | workflow.yml | N/A | runner tools | action --version |

## DEPENDENCY GRAPH (relações cristalizáveis)

```text
PROJECT → DEPENDS_ON → PACKAGE → VERSION
PACKAGE → REQUIRES → RUNTIME
PACKAGE → COMPATIBLE_WITH → PLUGIN
PACKAGE → CONFLICTS_WITH → PACKAGE
FAILURE_SIGNATURE → INDICATES → CAUSE_CANDIDATE
CAUSE_CANDIDATE → REMEDIATED_BY → PROCEDURE
PROCEDURE → PROVEN_BY → TEST
```

## REALITY JUDGE (validação final)

```text
POST-CONDITIONS (ecosystem-specific):
npm:   ls dep --depth=0 && npx dep --version && npm run build
pip:   pip show dep && python -c "import dep" && pytest
cargo: cargo tree -p dep && cargo build
docker: docker run dep --version && docker build
```

## CONFIG ORIGIN TRACKING

```bash
npm config get omit --location=project --location=user --location=global
npm config get userconfig
npm config get globalconfig
$env:NPM_CONFIG_OMIT
# Fix at most specific layer that introduced the issue
```

## VISTA SOL (health panel)

```text
DEPENDENCY HEALTH
├── KNOWN       ✅ cristal reutilizável disponível
├── STALE       ⚠️ versão/source mudou
├── MISSING     ❌ sem cristal
├── BROKEN      ❌ cristal falhou no retest
├── CONFLICT    ⚠️ múltiplos cristais discordam
└── UNKNOWN     🔍 precisa diagnóstico
```

## FIRST CRYSTALS (já cristalizados neste ciclo)

| Crystal | Signature | Ecosystem | Status |
|---------|-----------|-----------|--------|
| Vite missing from omit=dev | OMIT_DEV_CAUSES_VITE_ABSENCE | npm | ✅ CRYSTALLIZED |
| Esbuild optional deps | OPTIONAL_DEPS_OMITTED_ESBuild | npm | ⚠️ PENDING |
| Rollup native missing | OPTIONAL_DEPS_OMITTED_ROLLUP | npm | ⚠️ PENDING |

## DOGFOOD LOOP (prova de aprendizado)

```text
FIRST_OCCURRENCE:
  learns → crystal created → receipt saved

SECOND_OCCURRENCE:
  recognizes signature → reuses crystal → no external search
  → proves: LEARNING = future behavior changed
```

## NÃO FAZER

- `npm install` global por conveniência
- Deletar lockfile/node_modules/cache automaticamente
- Usar `--force`/`--legacy-peer-deps` por padrão
- Criar biblioteca paralela de dependências
- Copiar documentação inteira no contexto
- Cristalizar UNKNOWN
- Considerar pesquisa = aprendizado

## MANTRA

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