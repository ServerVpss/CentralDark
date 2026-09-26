---
name: heal-rollup-optional-deps
description: Fix rollup missing native binary from omit=optional config.
---

# HEAL-ROLLUP-OPTIONAL-DEPS

## TRIGGER
- Build fails with: `Cannot find module '@rollup/rollup-win32-x64-msvc'`
- `optionalDependencies` in rollup not installed
- `npm config get omit` returns `optional` or `dev`

## PHASES

### 1. MEASURE
```bash
npm ls @rollup/rollup-win32-x64-msvc --depth=0
npm config get omit --location=project --location=user --location=global
cat package.json | grep -A 5 '"optionalDependencies"'
```

### 2. DIAGNOSE
If `omit=optional` AND rollup in deps → **CAUSA CONFIRMADA**
npm omits optionalDependencies, rollup uses optionalDependencies for native binaries.

### 3. MINIMAL REMEDIATION
```bash
# Override omit for this install
npm install --include=optional --legacy-peer-deps

# Or single package
npm install @rollup/rollup-win32-x64-msvc --legacy-peer-deps
```

### 4. RETEST
```bash
npm ls @rollup/rollup-win32-x64-msvc --depth=0 && npx vite --version && npm run build
```

### 5. COUNTERPROOF
```bash
rm -rf node_modules && npm install --legacy-peer-deps
npx vite --version && npm run build
```

### 6. ROOT CAUSE FIX
```bash
npm config set omit=dev --location=user  # or omit="" to install all
```

### 7. RECEIPT
Generate JSON with failure_signature: `OPTIONAL_DEPS_OMITTED_ROLLUP`

## SIGNATURE
```yaml
failure_signature: OPTIONAL_DEPS_OMITTED_ROLLUP
ecosystem: npm
indicators:
  - rollup in deps
  - omit=optional in npm config
  - @rollup/rollup-win32-x64-msvc missing
  - build fails: "Cannot find module '@rollup/rollup-win32-x64-msvc'"
remediation: npm install --include=optional --legacy-peer-deps
config_fix: npm config set omit=dev --location=user
```