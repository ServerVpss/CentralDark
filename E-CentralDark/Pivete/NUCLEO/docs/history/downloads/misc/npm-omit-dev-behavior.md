# npm 12+ omit=dev Default Behavior (npm 12+)

## Problem
npm 12+ ships with `omit=dev` as a **built-in default** that **cannot be unset via config commands**.

```bash
npm config delete omit          # Does nothing
npm config set omit=""          # Does nothing  
npm config set omit=optional    # Works for optional, but dev still omitted
```

## Evidence
```bash
npm config get omit --location=user    # dev
npm config get omit --location=global  # dev
npm config get omit --location=project # dev
npm config list -l | grep omit         # omit = ["dev"]
```

## Root Cause
npm 12+ hardcodes `omit = ["dev"]` as default. The config system cannot override built-in defaults.

## Working Solution

### For Install (override per-command):
```bash
npm install --include=dev --legacy-peer-deps
```

### For Build (requires dev deps installed):
```bash
npm install --include=dev --legacy-peer-deps && npm run build
```

### Config Fix (sets optional, but dev remains omitted):
```bash
npm config set omit=optional --location=user
npm config set omit=optional --location=global
# Result: omit = ["optional"] (dev still omitted by default)
```

## Why `--include=dev` Works
- Flag overrides default behavior for that single command
- Does not mutate config
- Works regardless of npm version defaults

## Related Skills
- `heal-vite-npm-dependency` — primary handler
- `heal-esbuild-optional-deps` — for `omit=optional` issues
- `heal-rollup-optional-deps` — for `omit=optional` issues
- `dependency-intelligence-runtime` — orchestrates diagnosis