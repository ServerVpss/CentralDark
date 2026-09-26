---
name: heal-vite-npm-dependency
description: Fix npm missing devDependencies from omit=dev config.
---

# HEAL-VITE-NPM-DEPENDENCY

## TRIGGER
- `vite` declared in package.json/lockfile but missing from node_modules
- `npm ls vite` empty, `npm install` says "up to date"
- Build fails with `ERR_MODULE_NOT_FOUND: Cannot find package 'vite'`

## PHASES

### 1. MEASURE
```bash
npm ls vite --depth=0
npm config get omit --location=project --location=user --location=global
cat package.json | grep -A 20 '"devDependencies"'
```

### 2. DIAGNOSE
If `omit=dev` in any config level AND vite in devDependencies → **CAUSA CONFIRMADA**
npm omits devDependencies intentionally, lockfile matches but node_modules incomplete.

### 3. MINIMAL_REMEDIATION
```bash
# Override omit for this install (no config mutation)
npm install --include=dev --legacy-peer-deps

# If optional deps also missing (esbuild, rollup binaries):
npm install @rollup/rollup-win32-x64-msvc @esbuild/win32-x64 --legacy-peer-deps
```

### 4. RETEST (4 POST-CONDITIONS)
```bash
ls node_modules/vite/package.json && npx vite --version && npm run build
# All 4 must pass
```

### 5. COUNTERPROOF
```bash
rm -rf node_modules && npm install --legacy-peer-deps
npx vite --version && npm run build
# Clean reinstall works without --include=dev
```

### 6. ROOT CAUSE FIX (persist)
```bash
npm config set omit=optional --location=user
npm config set omit=optional --location=global
# Verify:
npm config get omit --location=user --location=global --location=project
# Should show: optional / optional / optional
```

### 7. RECEIPT
Generate JSON with:
- timestamp, sha256, cause_signature: "OMIT_DEV_CAUSES_VITE_ABSENCE"
- measure_sha256, diagnosis_sha256, remediation_sha256, retest_sha256
- counterproof_sha256, overall_success, fixed_point_contribution

## KEY PRINCIPLES
- `DECLARED != INSTALLED` — measure physical state
- `LOCKED != INSTALLED` — lockfile lies when omit active
- `INSTALLED != WORKING` — build is Reality Judge
- Minimal override first (`--include=dev`), config fix only after proven
- Preserve lockfile, never delete node_modules+lockfile together
- Counterproof = clean reinstall without flags works

## SIGNATURE
```yaml
failure_signature: OMIT_DEV_CAUSES_VITE_ABSENCE
indicators:
  - vite in devDependencies
  - omit=dev in npm config
  - npm says "up to date"
  - node_modules/vite missing
  - build ERR_MODULE_NOT_FOUND vite
remediation: npm install --include=dev --legacy-peer-deps
config_fix: npm config set omit=optional --location=user --location=global
```