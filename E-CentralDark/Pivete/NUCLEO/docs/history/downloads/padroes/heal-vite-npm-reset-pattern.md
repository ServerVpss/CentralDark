# HEAL-VITE-NPM-RESET Pattern — MEASURE → DIAGNOSE → IDENTIFY_CAUSE → MINIMAL_REMEDIATION → RETEST → COUNTERPROOF → RECEIPT

## Overview
Canonical healing workflow for npm/vite extraction failures in CentralDark Windows environment. Follows the Regenerative Self-Refinement Engine pattern: MEASURE → DIAGNOSE → IDENTIFY_CAUSE → MINIMAL_REMEDIATION → RETEST → COUNTERPROOF → RECEIPT.

## When to Use
- vite declared in package.json + package-lock.json but missing from node_modules/
- node_modules/ missing or incomplete
- vite bin not linked in .bin/
- vite build failing with ERR_MODULE_NOT_FOUND

## Script Location
`E:/CentralDark/Pivete/NUCLEO/scripts/heal-vite-npm-reset.mjs`

## Usage
```bash
# 1. Dry-run first (safe, no mutations)
node E:/CentralDark/Pivete/NUCLEO/scripts/heal-vite-npm-reset.mjs --dry-run

# 2. Minimal remediation (npm install --legacy-peer-deps with backup)
node E:/CentralDark/Pivete/NUCLEO/scripts/heal-vite-npm-reset.mjs

# 3. Last resort only (nuclear reset with rollback)
node E:/CentralDark/Pivete/NUCLEO/scripts/heal-vite-npm-reset.mjs --force-last-resort
```

## Pattern Phases

### PHASE 0: MEASURE
- Reads package.json, package-lock.json
- Checks node_modules/, node_modules/vite/, node_modules/.bin/vite
- Verifies package-lock.json has vite version
- Runs `npm cache verify`
- Tests `vite --version` and `npx vite build` (if not dry-run)
- Outputs: `NUCLEO/heal-vite-measure.json`

### PHASE 1: DIAGNOSE
Identifies issues:
- `VITE_MISSING_IN_NODE_MODULES` — vite in pkg/lock but missing from node_modules/
- `NODE_MODULES_MISSING` — node_modules/ doesn't exist
- `VITE_BIN_MISSING` — vite present but .bin/vite not linked
- `BUILD_FAILING` — vite build fails

Severity: critical if vite missing or node_modules missing

### PHASE 2: IDENTIFY_CAUSE
Root cause candidates (prioritized by likelihood):
1. npm cache corruption / extraction failure (high)
2. npm install never ran or was cleaned (high)
3. npm install incomplete / postinstall failed (medium)

Selects primary cause, decides nuclear vs minimal.

### PHASE 3: MINIMAL_REMEDIATION
**Default (minimal):** `npm install --legacy-peer-deps` with package-lock.json backup
**Last resort (--force-last-resort):** nuclear reset with cache clean + rollback

Always backs up package-lock.json before npm install.
Never deletes node_modules/ by default.

### PHASE 4: RETEST
Validates:
1. vite in node_modules/
2. .bin/vite linked
3. `vite --version` runs
4. `npx vite build` compiles
5. dist/ updated recently

### PHASE 5: COUNTERPROOF
Seeks contrary evidence:
- dist is fresh (< 2 min)
- node_modules/vite/package.json valid
- .bin/vite is real file
- dist/assets has JS + CSS

### PHASE 6: RECEIPT
Generates receipt with SHA256 of all phases + Fixed Point contribution tracking.

## Output Files (all in NUCLEO/)
- `heal-vite-measure.json` — Phase 0 measurement
- `heal-vite-diagnose.json` — Phase 1 diagnosis
- `heal-vite-cause.json` — Phase 2 cause analysis
- `heal-vite-remediation.json` — Phase 3 remediation steps
- `heal-vite-retest.json` — Phase 4 test results
- `heal-vite-counterproof.json` — Phase 5 counterproof
- `heal-vite-receipt.json` — Final receipt with SHA256

## Key Principles
1. **NO nuclear reset by default** — minimal remediation first
2. **Delete node_modules/cache/lockfile = LAST RESORT** — only with --force-last-resort
3. **Backup before mutate** — package-lock.json backed up before npm install
4. **Rollback ready** — backup exists for rollback
5. **Receipt with SHA256** — all phases hashed, Fixed Point contribution tracked
6. **NUCLEO_ROOT for outputs** — uses `E:/CentralDark/Pivete/NUCLEO` not PROJECT_ROOT/NUCLEO

## Dry-Run Mode
```bash
node heal-vite-npm-reset.mjs --dry-run
```
Simulates all phases without mutations. Safe for verification.

## Last Resort
```bash
node heal-vite-npm-reset.mjs --force-last-resort
```
Only after minimal remediation fails AND cause justifies it.

## Fixed Point Contribution
Each phase contributes to Fixed Point denominators:
- Phase 0: vite_build_blocked resolved
- Phase 1-8: pending until implemented

## Integration with Regenerative Engine
This pattern IS a Respiração (INSETO — correção cirúrgica) within the Kimetsu framework:
- MEASURE = CONCENTRAÇÃO_TOTAL
- DIAGNOSE = SERPENTE (rastreamento não-linear)
- IDENTIFY_CAUSE = INSETO (correção cirúrgica)
- MINIMAL_REMEDIATION = CHAMAS (persistência orientada por evidência)
- RETEST = SOM (ritmo/sequenciamento)
- COUNTERPROOF = LUA (espelho adversarial)
- RECEIPT = FIXED_POINT (fechamento)