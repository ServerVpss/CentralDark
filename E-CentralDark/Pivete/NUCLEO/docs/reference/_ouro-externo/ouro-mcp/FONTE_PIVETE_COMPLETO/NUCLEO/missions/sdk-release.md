# MISSAO - sdk-release.yml
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\.github\workflows\sdk-release.yml
**SHA:** 5f6d1c7612e6395e
**Timestamp:** 2026-08-23T14:15:49.386958
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run:
- run: bun install --frozen-lockfile
- run: bun run build --target ${{ matrix.settings.target }}
- run:
- run: bun install --frozen-lockfile
- run: bun x napi create-npm-dir -t .
- run: |
- run: |

### Padroes
- pattern: sdk-bindings-*

### Ouro Bruto (primeiros 5000 chars)
```
# screenpipe - AI that knows everything you've seen, said, or heard
# https://screenpi.pe
#
# Manual SDK npm release workflow. This workflow defaults to dry-run packaging.
# To publish public npm packages, a human must set publish_npm=true and provide
# the matching confirmation string when dispatching the workflow.

name: Release SDK

on:
  workflow_dispatch:
    inputs:
      version:
        description: "SDK semver version already committed in packages/sdk/package.json"
        required: true
        default: "0.1.0"
      npm_tag:
        description: "npm dist-tag to publish under"
        required: true
        default: "latest"
      publish_npm:
        description: "Publish public npm packages instead of dry-run only"
        required: true
        type: boolean
        default: false
      confirm:
        description: "Required when publishing: publish-sdk-VERSION"
        required: true
        default: "dry-run"

concurrency:
  # Serialize releases — aborting a release mid-flight is worse than waiting.
  group: ${{ github.workflow }}
  cancel-in-progress: false

permissions:
  contents: read
  id-token: write

env:
  DEBUG: napi:*
  MACOSX_DEPLOYMENT_TARGET: "11.0"

jobs:
  validate:
    runs-on: ubuntu-latest
    outputs:
      publish_npm: ${{ steps.mode.outputs.publish_npm }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Validate requested version
        working-directory: packages/sdk
        env:
          VERSION: ${{ inputs.version }}
        run: |
          node - <<'NODE'
          const fs = require("node:fs");
          const version = process.env.VERSION;
          const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
          if (pkg.version !== version) {
            throw new Error(`package.json version ${pkg.version} does not match requested ${version}`);
          }
          for (const [name, depVersion] of Object.entries(pkg.optionalDependencies || {})) {
            if (depVersion !== version) {
              throw new Error(`${name} optional dependency is ${depVersion}, expected ${version}`);
            }
          }
          // All three Rust manifests in the SDK workspace must move
          // together. recorder-core got missed during the 0.4.x bumps
          // and silently sat at 0.3.0 — caught only because someone
          // grepped versions by hand. Validate every workspace member.
          const cargoManifests = [
            "Cargo.toml",
            "recorder-core/Cargo.toml",
            "tauri/rust/Cargo.toml",
          ];
          for (const path of cargoManifests) {
            const cargo = fs.readFileSync(path, "utf8");
            if (!cargo.includes(`version = "${version}"`)) {
              throw new Error(`${path} does not contain version = "${version}"`);
            }
          }
          NODE
      - id: mode
        name: Validate publish confirmation
        env:
          VERSION: ${{ inputs.version }}
          PUBLISH_NPM: ${{ inputs.publish_npm }}
          CONFIRM: ${{ inputs.confirm }}
        run: |
          if [[ "$PUBLISH_NPM" == "true" ]]; then
            expected="publish-sdk-${VERSION}"
            if [[ "$CONFIRM" != "$expected" ]]; then
              echo "::error::Publishing requires confirm=${expected}"
              exit 1
            fi
          fi
          echo "publish_npm=${PUBLISH_NPM}" >> "$GITHUB_OUTPUT"

  build:
    needs: validate
    name: build ${{ matrix.settings.target }}
    strategy:
      fail-fast: false
      matrix:
        settings:
          - host: macos-latest
            target: x86_64-apple-darwin
          - host: macos-latest
            target: aarch64-apple-darwin
          - host: windows-latest
            target: x86_64-pc-windows-msvc
          - host: windows-11-arm
            target: aarch64-pc-windows-msvc
    runs-on: ${{ matrix.settings.host }}
    timeout-minutes: 45
    defaults:
      run:
        working-directory: packages/sdk
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: "1.3.10"
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.settings.target }}
      - name: Cache cargo
        uses: Swatinem/rust-cache@v2
        with:
          key: sdk-release-${{ matrix.settings.target }}
          workspaces: packages/sdk -> target
          cache-bin: false
      - name: Install deps
        run: bun install --frozen-lockfile
      - name: Build native binding
        run: bun run build --target ${{ matrix.settings.target }}
      - name: Upload binding
        uses: actions/upload-artifact@v4
        with:
          name: sdk-bindings-${{ matrix.settings.target }}
          path: packages/sdk/*.node
          if-no-files-found: error
          retention-days: 
```

---

# MISSAO - sdk-release.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\.github\workflows\sdk-release.yml
**SHA:** 5f6d1c7612e6395ef84c9ac1f384984f579a308dc6d9fd22a71190d773aef4e3
**Timestamp:** 2026-08-23T23:43:05.221508
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run:
- run: bun install --frozen-lockfile
- run: bun run build --target ${{ matrix.settings.target }}
- run:
- run: bun install --frozen-lockfile
- run: bun x napi create-npm-dir -t .
- run: |
- run: |

### Padroes
- pattern: sdk-bindings-*

### Ouro Bruto (primeiros 5000 chars)
```
# screenpipe - AI that knows everything you've seen, said, or heard
# https://screenpi.pe
#
# Manual SDK npm release workflow. This workflow defaults to dry-run packaging.
# To publish public npm packages, a human must set publish_npm=true and provide
# the matching confirmation string when dispatching the workflow.

name: Release SDK

on:
  workflow_dispatch:
    inputs:
      version:
        description: "SDK semver version already committed in packages/sdk/package.json"
        required: true
        default: "0.1.0"
      npm_tag:
        description: "npm dist-tag to publish under"
        required: true
        default: "latest"
      publish_npm:
        description: "Publish public npm packages instead of dry-run only"
        required: true
        type: boolean
        default: false
      confirm:
        description: "Required when publishing: publish-sdk-VERSION"
        required: true
        default: "dry-run"

concurrency:
  # Serialize releases — aborting a release mid-flight is worse than waiting.
  group: ${{ github.workflow }}
  cancel-in-progress: false

permissions:
  contents: read
  id-token: write

env:
  DEBUG: napi:*
  MACOSX_DEPLOYMENT_TARGET: "11.0"

jobs:
  validate:
    runs-on: ubuntu-latest
    outputs:
      publish_npm: ${{ steps.mode.outputs.publish_npm }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Validate requested version
        working-directory: packages/sdk
        env:
          VERSION: ${{ inputs.version }}
        run: |
          node - <<'NODE'
          const fs = require("node:fs");
          const version = process.env.VERSION;
          const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
          if (pkg.version !== version) {
            throw new Error(`package.json version ${pkg.version} does not match requested ${version}`);
          }
          for (const [name, depVersion] of Object.entries(pkg.optionalDependencies || {})) {
            if (depVersion !== version) {
              throw new Error(`${name} optional dependency is ${depVersion}, expected ${version}`);
            }
          }
          // All three Rust manifests in the SDK workspace must move
          // together. recorder-core got missed during the 0.4.x bumps
          // and silently sat at 0.3.0 — caught only because someone
          // grepped versions by hand. Validate every workspace member.
          const cargoManifests = [
            "Cargo.toml",
            "recorder-core/Cargo.toml",
            "tauri/rust/Cargo.toml",
          ];
          for (const path of cargoManifests) {
            const cargo = fs.readFileSync(path, "utf8");
            if (!cargo.includes(`version = "${version}"`)) {
              throw new Error(`${path} does not contain version = "${version}"`);
            }
          }
          NODE
      - id: mode
        name: Validate publish confirmation
        env:
          VERSION: ${{ inputs.version }}
          PUBLISH_NPM: ${{ inputs.publish_npm }}
          CONFIRM: ${{ inputs.confirm }}
        run: |
          if [[ "$PUBLISH_NPM" == "true" ]]; then
            expected="publish-sdk-${VERSION}"
            if [[ "$CONFIRM" != "$expected" ]]; then
              echo "::error::Publishing requires confirm=${expected}"
              exit 1
            fi
          fi
          echo "publish_npm=${PUBLISH_NPM}" >> "$GITHUB_OUTPUT"

  build:
    needs: validate
    name: build ${{ matrix.settings.target }}
    strategy:
      fail-fast: false
      matrix:
        settings:
          - host: macos-latest
            target: x86_64-apple-darwin
          - host: macos-latest
            target: aarch64-apple-darwin
          - host: windows-latest
            target: x86_64-pc-windows-msvc
          - host: windows-11-arm
            target: aarch64-pc-windows-msvc
    runs-on: ${{ matrix.settings.host }}
    timeout-minutes: 45
    defaults:
      run:
        working-directory: packages/sdk
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: "1.3.10"
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.settings.target }}
      - name: Cache cargo
        uses: Swatinem/rust-cache@v2
        with:
          key: sdk-release-${{ matrix.settings.target }}
          workspaces: packages/sdk -> target
          cache-bin: false
      - name: Install deps
        run: bun install --frozen-lockfile
      - name: Build native binding
        run: bun run build --target ${{ matrix.settings.target }}
      - name: Upload binding
        uses: actions/upload-artifact@v4
        with:
          name: sdk-bindings-${{ matrix.settings.target }}
          path: packages/sdk/*.node
          if-no-files-found: error
          retention-days: 
```