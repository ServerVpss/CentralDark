---
name: eslint
description: Pluggable JavaScript and TypeScript linter for code quality
category: tools
difficulty: intermediate
version: 1.0.0
author: mjcuadrado-net-sdk
tags: [eslint, linting, javascript, typescript, react]
related_skills: [frontend/typescript, frontend/react, tools/prettier]
---

# ESLint - Pluggable JavaScript Linter

**Find and fix problems in JavaScript/TypeScript code.**

---

## 📋 Overview

ESLint es un linter pluggable para JavaScript y TypeScript que:
- **Encuentra problemas** - Detecta bugs, code smells, anti-patterns
- **Aplica estilo** - Enforce coding standards
- **Auto-fix** - Corrige problemas automáticamente
- **Extensible** - Plugins para React, TypeScript, etc.

**Supports:**
- JavaScript (ES6+)
- TypeScript
- React/JSX
- Vue, Angular, etc.

---

## 🚀 Installation

### For TypeScript Projects

```bash
# Install ESLint + TypeScript plugins
npm install --save-dev \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin

# Verify installation
npx eslint --version
# Output: v8.56.0
```

### For React + TypeScript Projects

```bash
# Install ESLint + TypeScript + React plugins
npm install --save-dev \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks

# With Prettier integration
npm install --save-dev \
  eslint-config-prettier \
  eslint-plugin-prettier
```

---

## 💻 Basic Usage

### Lint All Files

```bash
# Lint todos los archivos
npx eslint .

# Output:
#   /src/App.tsx
#     12:7  error  'useState' is defined but never used  @typescript-eslint/no-unused-vars
#     23:5  warning  Missing return type on function  @typescript-eslint/explicit-function-return-type
#
#   ✖ 2 problems (1 error, 1 warning)
```

### Lint Specific Files

```bash
# Lint archivo específico
npx eslint src/App.tsx

# Lint con pattern
npx eslint "src/**/*.{ts,tsx}"
```

### Auto-fix Issues

```bash
# Auto-fix todos los fixable issues
npx eslint --fix .

# Output:
#   ✔ 15 problems fixed
#   ✖ 2 problems remaining (not auto-fixable)
```

### Output JSON Format (CI)

```bash
# JSON output para parsear en CI
npx eslint --format json . > eslint-report.json
```

---

## ⚙️ Configuration (.eslintrc.json)

### Basic TypeScript Configuration

```json
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "warn"
  }
}
```

### React + TypeScript Configuration

```json
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    },
    "project": "./tsconfig.json"
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "plugins": [
    "@typescript-eslint",
    "react",
    "react-hooks"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

### With Prettier Integration

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier"  // MUST be last!
  ]
}
```

---

## 🔧 TypeScript-Specific Setup

### tsconfig.json Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "build"]
}
```

### Common TypeScript Rules

```json
{
  "rules": {
    // Prevent unused variables
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],

    // Require explicit return types on functions
    "@typescript-eslint/explicit-function-return-type": ["warn", {
      "allowExpressions": true
    }],

    // Prevent usage of 'any' type
    "@typescript-eslint/no-explicit-any": "warn",

    // Require consistent type assertions
    "@typescript-eslint/consistent-type-assertions": ["error", {
      "assertionStyle": "as",
      "objectLiteralTypeAssertions": "never"
    }],

    // Enforce naming conventions
    "@typescript-eslint/naming-convention": ["error",
      {
        "selector": "interface",
        "format": ["PascalCase"],
        "prefix": ["I"]
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"]
      }
    ]
  }
}
```

---

## 🔗 Auto-fix Capabilities

### What ESLint Can Auto-fix

- ✅ Import ordering
- ✅ Spacing and indentation
- ✅ Quote style (single vs double)
- ✅ Semicolons (add/remove)
- ✅ Unused imports
- ✅ Trailing commas
- ✅ Arrow function syntax

### What ESLint CANNOT Auto-fix

- ❌ Unused variables (requires manual removal)
- ❌ Missing return statements
- ❌ Type errors
- ❌ Logic errors
- ❌ Complex refactoring

### Example: Auto-fix in Action

**Before:**
```typescript
import React, {useState} from "react";
import {useEffect} from "react"

const App = () => {
  const [count, setCount] = useState(0)
  const unused = "test"
  return <div>{count}</div>
}
```

**After** `npx eslint --fix`:
```typescript
import React, { useState } from 'react';

const App = () => {
  const [count, setCount] = useState(0);
  const unused = 'test'; // ERROR: unused variable (not auto-fixable)
  return <div>{count}</div>;
};
```

---

## 🛠️ Common Rules Reference

### General JavaScript Rules

```json
{
  "rules": {
    "no-console": "warn",                    // Warn on console.log
    "no-debugger": "error",                  // Error on debugger statements
    "no-var": "error",                       // Use const/let, not var
    "prefer-const": "error",                 // Prefer const over let
    "eqeqeq": ["error", "always"],          // Require === and !==
    "curly": ["error", "all"],              // Require curly braces
    "no-unused-expressions": "error",        // Disallow unused expressions
    "no-duplicate-imports": "error"          // No duplicate imports
  }
}
```

### TypeScript-Specific Rules

```json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/prefer-optional-chain": "warn"
  }
}
```

### React-Specific Rules

```json
{
  "rules": {
    "react/react-in-jsx-scope": "off",           // Not needed in React 18+
    "react/prop-types": "off",                   // Use TypeScript instead
    "react/jsx-uses-react": "off",               // Not needed in React 18+
    "react/jsx-uses-vars": "error",              // Prevent unused imports
    "react-hooks/rules-of-hooks": "error",       // Enforce hooks rules
    "react-hooks/exhaustive-deps": "warn"        // Warn on missing deps
  }
}
```

---

## ✅ Best Practices

### 1. Use TypeScript-ESLint Plugin

```bash
# Essential for TypeScript projects
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### 2. Integrate with Prettier

```bash
# Disable conflicting rules
npm install --save-dev eslint-config-prettier

# Add "prettier" as last extend
{
  "extends": [..., "prettier"]
}
```

### 3. Run in CI/CD

```yaml
# .github/workflows/ci.yml
- name: Lint code
  run: npx eslint . --max-warnings 0
```

### 4. Use with Pre-commit Hooks

```bash
# Using husky + lint-staged
npm install --save-dev husky lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### 5. Configure Ignore Files (.eslintignore)

```
# .eslintignore
node_modules/
build/
dist/
coverage/
*.config.js
*.min.js
```

---

## 🎯 Examples

### Example 1: Lint React Project

```bash
# Lint React app
npx eslint src/

# Output:
#   src/App.tsx
#     12:7  error  'useState' is defined but never used
#     23:5  warning  Prefer using optional chain
#
#   ✖ 2 problems (1 error, 1 warning)
#   1 error and 0 warnings potentially fixable with --fix
```

### Example 2: Auto-fix and Report

```bash
# Fix issues y generar report
npx eslint --fix . --format json > eslint-report.json

# View report
cat eslint-report.json | jq '.[] | {file: .filePath, errors: .errorCount}'
```

### Example 3: Lint Only Changed Files

```bash
# Get changed TypeScript files
CHANGED=$(git diff --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$')

# Lint solo changed
if [ -n "$CHANGED" ]; then
  npx eslint $CHANGED
fi
```

### Example 4: Integration with npm Scripts

```json
// package.json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint --fix .",
    "lint:check": "eslint . --max-warnings 0"
  }
}
```

Usage:
```bash
npm run lint         # Lint all files
npm run lint:fix     # Lint and auto-fix
npm run lint:check   # Lint with zero warnings (CI)
```

### Example 5: Complex Rule Configuration

```json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", {
      "vars": "all",
      "args": "after-used",
      "ignoreRestSiblings": true,
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "no-console": ["warn", {
      "allow": ["warn", "error", "info"]
    }]
  }
}
```

---

## 🐛 Troubleshooting

### Issue 1: "Parsing error: Cannot read file tsconfig.json"

**Error:**
```
Parsing error: Cannot read file 'tsconfig.json'
ESLint couldn't find a TypeScript config file
```

**Solution:**
```json
// .eslintrc.json
{
  "parserOptions": {
    "project": "./tsconfig.json"  // Ensure correct path
  }
}
```

```bash
# Verify tsconfig.json exists
ls tsconfig.json

# Or use tsconfig.eslint.json
# Create tsconfig.eslint.json extending tsconfig.json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*", "tests/**/*"]
}
```

---

### Issue 2: ESLint and Prettier Conflicts

**Problem:** ESLint auto-fix conflicts with prettier.

**Solution:**
```bash
# Install eslint-config-prettier
npm install --save-dev eslint-config-prettier

# Add as LAST extend
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"  // Must be last!
  ]
}

# Run prettier first, then ESLint
npx prettier --write . && npx eslint --fix .
```

---

### Issue 3: "Definition for rule was not found"

**Error:**
```
Definition for rule '@typescript-eslint/no-unused-vars' was not found
```

**Solution:**
```bash
# Ensure plugin installed
npm install --save-dev @typescript-eslint/eslint-plugin

# Add to plugins array
{
  "plugins": ["@typescript-eslint"]
}
```

---

### Issue 4: Performance Slow on Large Projects

**Problem:** ESLint takes >30s to lint.

**Solution:**
```bash
# Lint only specific folders
npx eslint src/ tests/

# Or use caching
npx eslint --cache .

# Exclude large folders in .eslintignore
node_modules/
build/
dist/
```

---

### Issue 5: React Hooks Warnings False Positives

**Problem:** `react-hooks/exhaustive-deps` warnings en custom hooks.

**Solution:**
```json
{
  "rules": {
    "react-hooks/exhaustive-deps": ["warn", {
      "additionalHooks": "(useMyCustomHook|useAnotherHook)"
    }]
  }
}
```

---

## 📚 Additional Resources

- **Official Docs:** https://eslint.org/docs/latest/
- **TypeScript-ESLint:** https://typescript-eslint.io/
- **Rules Reference:** https://eslint.org/docs/latest/rules/
- **Playground:** https://eslint.org/play/
- **Awesome ESLint:** https://github.com/dustinspecker/awesome-eslint

---

**Version:** 1.0.0
**Last Updated:** 2024-11-24
**Maintainer:** mjcuadrado-net-sdk
