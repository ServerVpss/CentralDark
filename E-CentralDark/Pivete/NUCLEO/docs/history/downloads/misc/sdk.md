# OUTRO - sdk.yml
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\.github\workflows\sdk.yml
**SHA:** 4aa8387e2293505a
**Timestamp:** 2026-08-23T14:15:49.248997
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run:
- run: cargo test --locked --workspace --lib --target ${{ matrix.settings.target }}
- run: cargo test --locked -p screenpipe-recorder --test sqlite_coordinator --target ${{ matrix.settings.target }}
- run:
- run: bun install --frozen-lockfile
- run: bun run build --target ${{ matrix.settings.target }} --cargo-flags="--locked"
- run:
- run: |
- run: |
- run: bun install --frozen-lockfile

### Ouro Bruto (primeiros 5000 chars)
```
# screenpipe - AI that knows everything you've seen, said, or heard
# https://screenpi.pe
#
# CI for the standalone SDK in packages/sdk. It intentionally stays outside the root
# Cargo workspace so SDK releases and the core build remain independent.

name: SDK

on:
  push:
    branches: [main]
    paths:
      - "packages/sdk/**"
      - "Cargo.toml"
      - "rust-toolchain.toml"
      - "crates/screenpipe-a11y/**"
      - "crates/screenpipe-capture/**"
      - "crates/screenpipe-config/**"
      - "crates/screenpipe-connect/**"
      - "crates/screenpipe-core/**"
      - "crates/screenpipe-db/**"
      - "crates/screenpipe-events/**"
      - "crates/screenpipe-screen/**"
      - "crates/screenpipe-secrets/**"
      - "crates/screenpipe-sqlite-coordinator/**"
      - "crates/screenpipe-vault/**"
      - ".github/workflows/sdk.yml"
  pull_request:
    paths:
      - "packages/sdk/**"
      - "Cargo.toml"
      - "rust-toolchain.toml"
      - "crates/screenpipe-a11y/**"
      - "crates/screenpipe-capture/**"
      - "crates/screenpipe-config/**"
      - "crates/screenpipe-connect/**"
      - "crates/screenpipe-core/**"
      - "crates/screenpipe-db/**"
      - "crates/screenpipe-events/**"
      - "crates/screenpipe-screen/**"
      - "crates/screenpipe-secrets/**"
      - "crates/screenpipe-sqlite-coordinator/**"
      - "crates/screenpipe-vault/**"
      - ".github/workflows/sdk.yml"
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.event_name }}-${{ github.ref }}
  # Only the newest push or PR revision can describe the current tree.
  cancel-in-progress: true

env:
  DEBUG: napi:*
  MACOSX_DEPLOYMENT_TARGET: "11.0"

jobs:
  cargo-test:
    name: cargo test ${{ matrix.settings.target }}
    strategy:
      fail-fast: false
      matrix:
        settings:
          - host: macos-latest
            target: aarch64-apple-darwin
          - host: windows-latest
            target: x86_64-pc-windows-msvc
    runs-on: ${{ matrix.settings.host }}
    timeout-minutes: 30
    defaults:
      run:
        working-directory: packages/sdk
    steps:
      - uses: actions/checkout@v4
      - name: Install Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.settings.target }}
      - name: Cache cargo
        uses: Swatinem/rust-cache@v2
        with:
          key: sdk-cargo-test-${{ matrix.settings.target }}
          workspaces: packages/sdk -> target
          cache-bin: false
      - name: Test Rust library
        run: cargo test --locked --workspace --lib --target ${{ matrix.settings.target }}
      - name: Test SQLite runtime and coordinator
        run: cargo test --locked -p screenpipe-recorder --test sqlite_coordinator --target ${{ matrix.settings.target }}

  build:
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
          key: sdk-build-${{ matrix.settings.target }}
          workspaces: packages/sdk -> target
          cache-bin: false
      - name: Install deps
        run: bun install --frozen-lockfile
      - name: Build
        run: bun run build --target ${{ matrix.settings.target }} --cargo-flags="--locked"
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: sdk-bindings-${{ matrix.settings.target }}
          path: |
            packages/sdk/*.node
            packages/sdk/index.js
            packages/sdk/index.d.ts
          if-no-files-found: error
          retention-days: 7

  test:
    name: integration ${{ matrix.host }}
    needs: build
    strategy:
      fail-fast: false
      matrix:
        host: [macos-latest, windows-latest]
    runs-on: ${{ matrix.host }}
    timeout-minutes: 30
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
      - name: Install ffmpeg (macOS)
        if: runner.os == 'macOS'
        run: |
          if ! command -v ffmpeg >/d
```

---

# OUTRO - sdk.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\.github\workflows\sdk.yml
**SHA:** 4aa8387e2293505a5939748899fac6f9204308a7e9bade1628ccbb6338afe150
**Timestamp:** 2026-08-23T23:43:06.317681
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run:
- run: cargo test --locked --workspace --lib --target ${{ matrix.settings.target }}
- run: cargo test --locked -p screenpipe-recorder --test sqlite_coordinator --target ${{ matrix.settings.target }}
- run:
- run: bun install --frozen-lockfile
- run: bun run build --target ${{ matrix.settings.target }} --cargo-flags="--locked"
- run:
- run: |
- run: |
- run: bun install --frozen-lockfile

### Ouro Bruto (primeiros 5000 chars)
```
# screenpipe - AI that knows everything you've seen, said, or heard
# https://screenpi.pe
#
# CI for the standalone SDK in packages/sdk. It intentionally stays outside the root
# Cargo workspace so SDK releases and the core build remain independent.

name: SDK

on:
  push:
    branches: [main]
    paths:
      - "packages/sdk/**"
      - "Cargo.toml"
      - "rust-toolchain.toml"
      - "crates/screenpipe-a11y/**"
      - "crates/screenpipe-capture/**"
      - "crates/screenpipe-config/**"
      - "crates/screenpipe-connect/**"
      - "crates/screenpipe-core/**"
      - "crates/screenpipe-db/**"
      - "crates/screenpipe-events/**"
      - "crates/screenpipe-screen/**"
      - "crates/screenpipe-secrets/**"
      - "crates/screenpipe-sqlite-coordinator/**"
      - "crates/screenpipe-vault/**"
      - ".github/workflows/sdk.yml"
  pull_request:
    paths:
      - "packages/sdk/**"
      - "Cargo.toml"
      - "rust-toolchain.toml"
      - "crates/screenpipe-a11y/**"
      - "crates/screenpipe-capture/**"
      - "crates/screenpipe-config/**"
      - "crates/screenpipe-connect/**"
      - "crates/screenpipe-core/**"
      - "crates/screenpipe-db/**"
      - "crates/screenpipe-events/**"
      - "crates/screenpipe-screen/**"
      - "crates/screenpipe-secrets/**"
      - "crates/screenpipe-sqlite-coordinator/**"
      - "crates/screenpipe-vault/**"
      - ".github/workflows/sdk.yml"
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.event_name }}-${{ github.ref }}
  # Only the newest push or PR revision can describe the current tree.
  cancel-in-progress: true

env:
  DEBUG: napi:*
  MACOSX_DEPLOYMENT_TARGET: "11.0"

jobs:
  cargo-test:
    name: cargo test ${{ matrix.settings.target }}
    strategy:
      fail-fast: false
      matrix:
        settings:
          - host: macos-latest
            target: aarch64-apple-darwin
          - host: windows-latest
            target: x86_64-pc-windows-msvc
    runs-on: ${{ matrix.settings.host }}
    timeout-minutes: 30
    defaults:
      run:
        working-directory: packages/sdk
    steps:
      - uses: actions/checkout@v4
      - name: Install Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.settings.target }}
      - name: Cache cargo
        uses: Swatinem/rust-cache@v2
        with:
          key: sdk-cargo-test-${{ matrix.settings.target }}
          workspaces: packages/sdk -> target
          cache-bin: false
      - name: Test Rust library
        run: cargo test --locked --workspace --lib --target ${{ matrix.settings.target }}
      - name: Test SQLite runtime and coordinator
        run: cargo test --locked -p screenpipe-recorder --test sqlite_coordinator --target ${{ matrix.settings.target }}

  build:
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
          key: sdk-build-${{ matrix.settings.target }}
          workspaces: packages/sdk -> target
          cache-bin: false
      - name: Install deps
        run: bun install --frozen-lockfile
      - name: Build
        run: bun run build --target ${{ matrix.settings.target }} --cargo-flags="--locked"
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: sdk-bindings-${{ matrix.settings.target }}
          path: |
            packages/sdk/*.node
            packages/sdk/index.js
            packages/sdk/index.d.ts
          if-no-files-found: error
          retention-days: 7

  test:
    name: integration ${{ matrix.host }}
    needs: build
    strategy:
      fail-fast: false
      matrix:
        host: [macos-latest, windows-latest]
    runs-on: ${{ matrix.host }}
    timeout-minutes: 30
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
      - name: Install ffmpeg (macOS)
        if: runner.os == 'macOS'
        run: |
          if ! command -v ffmpeg >/d
```