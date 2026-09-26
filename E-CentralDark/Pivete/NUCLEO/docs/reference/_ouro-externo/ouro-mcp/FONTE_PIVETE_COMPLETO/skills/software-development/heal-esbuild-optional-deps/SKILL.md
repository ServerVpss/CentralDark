---
name: heal-esbuild-optional-deps
description: Fix esbuild missing platform binary from omit=optional.
---

# HEAL-ESBUILD-OPTIONAL-DEPS

## TRIGGER
- Build fails with: `The package "@esbuild/win32-x64" could not be found`
- `optionalDependencies` in esbuild not installed
- `npm config get omit` returns `optional` or `dev`

## PHASES

### 1. MEASURE
```bash
npm ls @esbuild/win32-x64 --depth=0
npm config get omit --location=project --location=user --location=global
cat package.json | grep -A 5 '"optionalDependencies"'
```

### 2. DIAGNOSE
If `omit=optional` AND esbuild in deps → **CAUSA CONFIRMADA**
npm omits optionalDependencies, esbuild uses optionalDependencies for platform binaries.

### 3. MINIMAL REMEDIATION
```bash
# Override omit for this install
npm install --include=optional --legacy-peer-deps

# Or single package
npm install @esbuild/win32-x64 --legacy-peer-deps
```

### 4. RETEST
```bash
npm ls @esbuild/win32-x64 --depth=0 && npx vite --version && npm run build
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
Generate JSON with failure_signature: `OPTIONAL_DEPS_OMITTED_ESBUILD`

## SIGNATURE
```yaml
failure_signature: OPTIONAL_DEPS_OMITTED_ESBUILD
ecosystem: npm
indicators:
  - esbuild in deps
  - omit=optional in npm config
  - @esbuild/win32-x64 missing
  - build fails: "package @esbuild/win32-x64 could not be found"
remediation: npm install --include=optional --legacy-peer-deps
config_fix: npm config set omit=dev --location=user
```