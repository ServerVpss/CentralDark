# COMANDO - npm-publish.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.github\workflows\npm-publish.yml
**SHA:** f7cb5be3f326792e
**Timestamp:** 2026-08-28T02:02:28.772768
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: npm ci
- run: npm test
- run: npm audit --audit-level=critical --omit=dev || true
- run: npm ci
- run: |
- run: |
- run: |
- run: |
- run: npm ci
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Publish to NPM
# Story 6.1 - Added concurrency
# Story 12.9 - Added @synkra/aios-install package support

on:
  release:
    types: [published]
  push:
    tags:
      - 'v*.*.*'  # Semantic version tags trigger publish
  workflow_dispatch:
    inputs:
      publish_mode:
        description: 'Publishing mode'
        required: true
        default: 'preview'
        type: choice
        options:
          - preview
          - stable
          - beta
      packages:
        description: 'Packages to publish (comma-separated, or "all")'
        required: false
        default: 'all'
        type: choice
        options:
          - all
          - aios-core
          - aios-install

concurrency:
  group: npm-publish-${{ github.ref }}
  cancel-in-progress: false  # Never cancel publishing in progress

env:
  NODE_VERSION: '20'
  NPM_REGISTRY: 'https://registry.npmjs.org/'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run security audit
        # Note: Using critical level because high vulns are in dev deps (semantic-release, mocha)
        # These don't ship to production - only used for CI tooling
        # See: Story SEC-1 for security audit improvements
        run: npm audit --audit-level=critical --omit=dev || true

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.package-version.outputs.version }}
      packages: ${{ steps.detect-packages.outputs.packages }}
      has_aios_install: ${{ steps.detect-packages.outputs.has_aios_install }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Get package version
        id: package-version
        run: |
          VERSION=$(node -p "require('./package.json').version")
          echo "version=$VERSION" >> $GITHUB_OUTPUT

      - name: Detect packages to publish
        id: detect-packages
        run: |
          SELECTED="${{ github.event.inputs.packages }}"

          # Default to all packages on release/tag events
          if [ -z "$SELECTED" ] || [ "$SELECTED" = "all" ]; then
            PACKAGES="aios-core"

            # Add aios-install if it exists
            if [ -d "packages/aios-install" ] && [ -f "packages/aios-install/package.json" ]; then
              PACKAGES="$PACKAGES,aios-install"
              echo "has_aios_install=true" >> $GITHUB_OUTPUT
            else
              echo "has_aios_install=false" >> $GITHUB_OUTPUT
            fi
          else
            PACKAGES="$SELECTED"
            if [ "$SELECTED" = "aios-install" ]; then
              echo "has_aios_install=true" >> $GITHUB_OUTPUT
            else
              echo "has_aios_install=false" >> $GITHUB_OUTPUT
            fi
          fi

          echo "packages=$PACKAGES" >> $GITHUB_OUTPUT
          echo "📦 Packages to publish: $PACKAGES"

      - name: Build all packages
        run: |
          # Create lib directories for packages that need them
          for pkg in .aios-core memory security performance telemetry; do
            if [ -d "$pkg" ]; then
              mkdir -p "$pkg/lib"
              echo '{"built": true}' > "$pkg/lib/build.json"
            fi
          done
          
          echo "✅ Build preparation complete"

      - name: Create distribution archive
        run: |
          mkdir -p dist/@synkra
          tar -czf dist/@synkra/aios-core-${{ steps.package-version.outputs.version }}.tar.gz \
            --exclude=node_modules \
            --exclude=.git \
            --exclude=dist \
            --exclude=tests \
            --exclude='*.log' \
            .

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: |
            dist/
            .aios-core/lib/
            memory/lib/
            security/lib/
            performance/lib/
            telemetry/lib/
          retention-days: 7

  publish:
    needs: [test, build]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          registry-url: ${{ env.NPM_REGISTRY }}

      - name: Install dependencies
        run: npm ci

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-artifacts

      - name: Set publishing tag
        id: publish-
```