# OUTRO - dead-code-detection.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design-studio\tasks\dead-code-detection.md
**SHA:** 675be07c5344d80e
**Timestamp:** 2026-08-28T13:25:11.525882
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- After cleanup, run:

### Padroes
- gold) pattern="studio-primary\|primary-color" ;;
- gold_dark) pattern="studio-primary-dark\|primary-dark" ;;
- base) pattern="bg-background\|studio-bg" ;;
- *) pattern="$token" ;;

### Ouro Bruto (primeiros 5000 chars)
```
# Task: Dead Code Detection

> Command: `*dead-code [path]`
> Purpose: Find unused tokens, components, exports, and styles

## Overview

This task identifies dead code in the design system:
- Unused design tokens
- Unexported/unused components
- Dead CSS classes
- Orphaned files
- Unused exports

## Prerequisites

- Target path (default: `app/components/`)
- Design tokens spec (for token analysis)

## Execution Steps

### Step 1: Unused Components

Find components that are never imported elsewhere.

```bash
# Get all component exports
exports=$(grep -rh --include="*.tsx" "^export \(const\|function\|default\)" {path}/ \
  | grep -oP "(?<=export (const|function) )\w+|(?<=export default )\w+" \
  | sort -u)

# Check each export for usage
for component in $exports; do
  # Count imports of this component (excluding its own file)
  imports=$(grep -rn --include="*.tsx" "import.*$component\|from.*$component" {path}/ \
    | grep -v "export.*$component" | wc -l)

  if [ "$imports" -eq 0 ]; then
    echo "UNUSED COMPONENT: $component"
  fi
done
```

**Output:**
```
Unused Components Detected
==========================
UNUSED: LegacyButton (app/components/ui/legacy-button.tsx)
UNUSED: OldModal (app/components/shared/old-modal.tsx)
UNUSED: TestComponent (app/components/test-component.tsx)

Total: 3 unused components (~450 lines, ~22KB)
```

### Step 2: Unused Exports

Find named exports that are never imported.

```bash
# Find all named exports from index.ts files
for index in $(find {path}/ -name "index.ts"); do
  dir=$(dirname "$index")
  exports=$(grep "^export" "$index" | grep -oP "(?<=export { )[\w, ]+(?= })" | tr ',' '\n' | tr -d ' ')

  for exp in $exports; do
    # Check if exported item is imported anywhere
    imports=$(grep -rn "import.*{[^}]*\b$exp\b" {path}/ --include="*.tsx" --include="*.ts" \
      | grep -v "$index" | wc -l)

    if [ "$imports" -eq 0 ]; then
      echo "UNUSED EXPORT: $exp from $index"
    fi
  done
done
```

### Step 3: Unused CSS Classes

Find Tailwind classes defined but never used (from tailwind.config.ts extend).

```bash
# Extract custom classes from tailwind.config.ts
custom_classes=$(grep -oP "(?<=')\w+(?=':)" app/tailwind.config.ts)

for class in $custom_classes; do
  usage=$(grep -rn "\b$class\b" {path}/ --include="*.tsx" | wc -l)
  if [ "$usage" -eq 0 ]; then
    echo "UNUSED CSS: $class"
  fi
done
```

### Step 4: Orphaned Files

Find files not imported anywhere.

```bash
# Get all .tsx files
for file in $(find {path}/ -name "*.tsx" -type f); do
  filename=$(basename "$file" .tsx)

  # Skip index files and test files
  [[ "$filename" == "index" || "$filename" == *".test"* ]] && continue

  # Check if file is imported anywhere
  imports=$(grep -rn "from.*$filename\|import.*$filename" {path}/ \
    --include="*.tsx" --include="*.ts" | grep -v "^$file" | wc -l)

  if [ "$imports" -eq 0 ]; then
    lines=$(wc -l < "$file")
    echo "ORPHAN: $file ($lines lines)"
  fi
done
```

### Step 5: Unused Design Tokens

Cross-reference tokens spec with actual usage.

```bash
# Load tokens from spec
tokens=$(grep -oP "^\s{4}\w+:" design-tokens-spec.yaml | tr -d ' :')

for token in $tokens; do
  # Map token name to CSS class pattern
  case $token in
    gold) pattern="studio-primary\|primary-color" ;;
    gold_dark) pattern="studio-primary-dark\|primary-dark" ;;
    base) pattern="bg-background\|studio-bg" ;;
    *) pattern="$token" ;;
  esac

  usage=$(grep -rn "$pattern" {path}/ --include="*.tsx" | wc -l)
  if [ "$usage" -eq 0 ]; then
    echo "UNUSED TOKEN: $token"
  fi
done
```

### Step 6: Unused Types/Interfaces

Find type definitions never referenced.

```bash
# Find all type/interface definitions
types=$(grep -rh "^export \(type\|interface\)" {path}/ --include="*.ts" \
  | grep -oP "(?<=export (type|interface) )\w+")

for type in $types; do
  # Check usage (excluding definition)
  usage=$(grep -rn "\b$type\b" {path}/ --include="*.tsx" --include="*.ts" \
    | grep -v "export type $type\|export interface $type" | wc -l)

  if [ "$usage" -eq 0 ]; then
    echo "UNUSED TYPE: $type"
  fi
done
```

### Step 7: Generate Dead Code Report

```markdown
# Dead Code Detection Report
Generated: {timestamp}
Path: {path}

## Summary

| Category | Count | Lines | Est. Size |
|----------|-------|-------|-----------|
| Unused Components | 3 | 450 | 22KB |
| Unused Exports | 12 | - | - |
| Orphaned Files | 2 | 180 | 9KB |
| Unused Tokens | 9 | - | - |
| Unused Types | 8 | 45 | 2KB |
| **Total** | **34** | **675** | **33KB** |

## Unused Components

| Component | File | Lines | Last Modified |
|-----------|------|-------|---------------|
| LegacyButton | ui/legacy-button.tsx | 120 | 2024-08-15 |
| OldModal | shared/old-modal.tsx | 230 | 2024-06-22 |
| TestComponent | test-component.tsx | 100 | 2024-09-01 |

**Action:** Delete or archive these files

## Unused Exports

| Export | Source | Recommendation |
|--------|--------|----------------|
| formatLegacyDate | utils/date.ts | Remove from barrel |
| 
```