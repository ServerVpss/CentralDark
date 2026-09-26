---
name: prettier
description: Opinionated code formatter for JavaScript, TypeScript, CSS, JSON, and more
category: tools
difficulty: basic
version: 1.0.0
author: mjcuadrado-net-sdk
tags: [prettier, formatting, javascript, typescript, react]
related_skills: [frontend/typescript, frontend/react, tools/eslint]
---

# Prettier - Opinionated Code Formatter

**Formatter automático con opiniones fuertes sobre estilo de código.**

---

## 📋 Overview

Prettier es un code formatter opinionated que soporta múltiples lenguajes:
- **JavaScript** (.js, .jsx)
- **TypeScript** (.ts, .tsx)
- **CSS/SCSS** (.css, .scss)
- **JSON** (.json)
- **Markdown** (.md)
- **HTML** (.html)

**Benefits:**
- Elimina debates sobre formatting style
- Consistencia automática en codebase
- Integración con ESLint
- Format on save en IDEs

**Philosophy:** "You press save and code is formatted. No need to discuss style in code review."

---

## 🚀 Installation

### npm

```bash
# Install como dev dependency
npm install --save-dev prettier

# Verify installation
npx prettier --version
# Output: 3.1.0
```

### yarn

```bash
# Install con yarn
yarn add --dev prettier

# Verify
yarn prettier --version
```

### Global (not recommended)

```bash
npm install --global prettier
prettier --version
```

---

## 💻 Basic Usage

### Format All Files

```bash
# Format todos los archivos soportados
npx prettier --write .

# Output:
#   src/App.tsx
#   src/components/Button.tsx
#   src/utils/api.ts
#   Formatted 42 files in 1.2s
```

### Format Specific File

```bash
# Format archivo específico
npx prettier --write src/App.tsx

# Output:
#   src/App.tsx 150ms
```

### Format Multiple Patterns

```bash
# Format TypeScript y JSON files
npx prettier --write "src/**/*.{ts,tsx,json}"

# Output:
#   Formatted 28 files in 0.8s
```

### Check Without Formatting (CI Mode)

```bash
# Check si formatting needed (no modifica archivos)
npx prettier --check .

# Exit code:
#   0 - All files formatted correctly
#   1 - Some files need formatting
```

### List Files That Need Formatting

```bash
# List files sin formatting correcto
npx prettier --list-different .

# Output:
#   src/App.tsx
#   src/components/Button.tsx
```

---

## ⚙️ Configuration (.prettierrc)

### Basic Configuration

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Configuration Options Explained

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `semi` | true/false | true | Print semicolons |
| `singleQuote` | true/false | false | Use single quotes |
| `tabWidth` | number | 2 | Spaces per indentation level |
| `trailingComma` | "none"/"es5"/"all" | "all" | Trailing commas |
| `printWidth` | number | 80 | Line length wrap |
| `arrowParens` | "avoid"/"always" | "always" | Arrow function parens |
| `endOfLine` | "lf"/"crlf"/"auto" | "lf" | Line endings |

### TypeScript-Specific Configuration

```json
// .prettierrc
{
  "parser": "typescript",
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid",
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "jsxBracketSameLine": false
}
```

### Override Configuration per File Type

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "overrides": [
    {
      "files": "*.json",
      "options": {
        "printWidth": 120,
        "tabWidth": 2
      }
    },
    {
      "files": "*.md",
      "options": {
        "proseWrap": "always"
      }
    }
  ]
}
```

---

## 🔗 Integration con TypeScript

### TypeScript Project Setup

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

### Format TypeScript Files

```bash
# Format .ts y .tsx files
npx prettier --write "src/**/*.{ts,tsx}"
```

### Example: Before/After

**Before:**
```typescript
const user:{name:string,age:number}={name:"John",age:30};
function greet(user:{name:string}){console.log(`Hello, ${user.name}`);}
```

**After:**
```typescript
const user: { name: string; age: number } = { name: 'John', age: 30 };

function greet(user: { name: string }) {
  console.log(`Hello, ${user.name}`);
}
```

---

## 🔗 Integration con ESLint

### Install eslint-config-prettier

```bash
# Disable ESLint formatting rules que conflictúan con prettier
npm install --save-dev eslint-config-prettier
```

### Configure ESLint

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"  // Must be last!
  ],
  "rules": {
    // Your custom rules
  }
}
```

**Important:** `"prettier"` debe ser el último extend para deshabilitar conflicting rules.

### Run ESLint + Prettier

```bash
# 1. Run prettier first
npx prettier --write .

# 2. Then run ESLint
npx eslint --fix .
```

---

## 🛠️ Common Options

### Write vs Check

```bash
# Write: format and save
npx prettier --write src/

# Check: verify without modifying
npx prettier --check src/
```

### Ignore Files (.prettierignore)

```
# .prettierignore
node_modules/
build/
dist/
coverage/
*.min.js
*.bundle.js
```

### Config File Path

```bash
# Use specific config file
npx prettier --config /path/to/.prettierrc --write .
```

### Debug Mode

```bash
# Show which files are formatted
npx prettier --write --loglevel debug .
```

---

## ✅ Best Practices

### 1. Add .prettierrc to Repository

```bash
# Versionado en git
# Compartido por todo el team
git add .prettierrc .prettierignore
git commit -m "Add prettier configuration"
```

**Benefits:**
- Same formatting para todos los devs
- Single source of truth
- No debates sobre style

### 2. Format on Save in IDE

**VS Code:**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

**WebStorm/Rider:**
- Settings → Languages & Frameworks → JavaScript → Prettier
- Enable "On save"

### 3. Run in Pre-commit Hook

```bash
# Using husky + lint-staged
npm install --save-dev husky lint-staged
npx husky install
npx husky add .git/hooks/pre-commit "npx lint-staged"
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,css,md}": "prettier --write"
  }
}
```

### 4. Run in CI/CD

```yaml
# .github/workflows/ci.yml
- name: Check code formatting
  run: npx prettier --check .
```

**Benefits:**
- Bloquea PRs con código no formateado
- Enforce formatting automáticamente

### 5. Use with ESLint Properly

```bash
# Order matters:
# 1. prettier (formatting)
npx prettier --write .

# 2. eslint (linting)
npx eslint --fix .
```

---

## 🎯 Examples

### Example 1: Format React Project

```bash
# Format React app completo
npx prettier --write "src/**/*.{ts,tsx,css,json}"

# Output:
#   src/App.tsx
#   src/components/Button.tsx
#   src/styles/App.css
#   Formatted 35 files
```

### Example 2: CI Check

```bash
# CI script que falla si formatting needed
npx prettier --check . || {
  echo "Code formatting errors found. Run 'npx prettier --write .'"
  exit 1
}
```

### Example 3: Format Staged Files Only

```bash
# Get staged files
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$')

# Format solo staged
if [ -n "$STAGED" ]; then
  npx prettier --write $STAGED
  git add $STAGED
fi
```

### Example 4: Format with Custom Config

```bash
# Use custom .prettierrc
npx prettier --config .prettierrc.production --write src/
```

### Example 5: Integration with npm Scripts

```json
// package.json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint --fix .",
    "lint:check": "eslint ."
  }
}
```

Usage:
```bash
npm run format        # Format all files
npm run format:check  # Check formatting (CI)
npm run lint          # Lint and auto-fix
```

---

## 🐛 Troubleshooting

### Issue 1: Prettier and ESLint Conflicts

**Problem:** ESLint auto-fix revierte prettier formatting.

**Solution:**
```bash
# Install eslint-config-prettier
npm install --save-dev eslint-config-prettier

# Add "prettier" as last extend in .eslintrc.json
{
  "extends": ["...", "prettier"]
}
```

---

### Issue 2: Files Not Being Formatted

**Problem:** `npx prettier --write .` no formatear algunos archivos.

**Solution:**
```bash
# Check .prettierignore
cat .prettierignore

# Ensure files not ignored
# Remove from .prettierignore si necessary

# Or specify explicit pattern:
npx prettier --write "src/**/*.{ts,tsx}"
```

---

### Issue 3: Different Results Between IDE and CLI

**Problem:** IDE formatting differs from CLI prettier.

**Solution:**
```bash
# Ensure IDE uses project's .prettierrc
# VS Code: Check "Prettier: Config Path" setting

# Or force reload VS Code window
# Cmd+Shift+P → "Reload Window"

# Verify versions match:
npx prettier --version  # CLI version
# VS Code: Check Prettier extension version
```

---

### Issue 4: Performance Slow on Large Projects

**Problem:** prettier takes >10s to format.

**Solution:**
```bash
# Format only specific folders
npx prettier --write src/components/ src/utils/

# Or use parallel processing
npx prettier --write "src/**/*.ts" --write "tests/**/*.ts" &

# Or exclude large folders
# Add to .prettierignore:
# **/node_modules/
# **/build/
```

---

## 📚 Additional Resources

- **Official Docs:** https://prettier.io/docs/en/
- **Playground:** https://prettier.io/playground/
- **Configuration:** https://prettier.io/docs/en/configuration.html
- **Options:** https://prettier.io/docs/en/options.html
- **eslint-config-prettier:** https://github.com/prettier/eslint-config-prettier

---

**Version:** 1.0.0
**Last Updated:** 2024-11-24
**Maintainer:** mjcuadrado-net-sdk
