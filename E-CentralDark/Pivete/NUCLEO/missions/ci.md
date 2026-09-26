# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\fast-uri\.github\workflows\ci.yml
**SHA:** a5f799b1fd846548
**Timestamp:** 2026-08-26T19:32:09.117841
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: |
- run: npx playwright install winldd
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
    branches:
     - main
     - next
     - 'v*'
    paths-ignore:
      - 'docs/**'
      - '*.md'
  pull_request:
    paths-ignore:
      - 'docs/**'
      - '*.md'

# This allows a subsequently queued workflow run to interrupt previous runs
concurrency:
    group: "${{ github.workflow }}-${{ github.event.pull_request.head.label || github.head_ref || github.ref }}"
    cancel-in-progress: true

permissions:
  contents: read

jobs:
  test-regression-check-node10:
    name: Test compatibility with Node.js 10
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v6
        with:
          persist-credentials: false

      - uses: actions/setup-node@v6
        with:
          node-version: '10'
          cache: 'npm'
          cache-dependency-path: package.json
          check-latest: true

      - name: Install
        run: |
          npm install --ignore-scripts

      - name: Copy project as fast-uri to node_node_modules
        run: |
          rm -rf ./node_modules/fast-uri/lib &&
          rm -rf ./node_modules/fast-uri/index.js &&
          cp -r ./lib ./node_modules/fast-uri/lib &&
          cp ./index.js ./node_modules/fast-uri/index.js

      - name: Run tests
        run: |
          npm run test:unit
        env:
          NODE_OPTIONS: no-network-family-autoselection

  test-browser:
    name: Test browser compatibility
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: ['ubuntu-latest', 'windows-latest', 'macos-latest']
        browser: ['chromium', 'firefox', 'webkit']
        exclude:
          - os: ubuntu-latest
            browser: webkit
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v6
        with:
          persist-credentials: false

      - uses: actions/setup-node@v6
        with:
          node-version: '24'
          cache: 'npm'
          cache-dependency-path: package.json
          check-latest: true

      - name: Install dependencies
        run: |
          npm install --ignore-scripts

      - if: ${{ matrix.os == 'windows-latest' }}
        run: npx playwright install winldd

      - name: Run browser tests
        run: |
          npm run test:browser:${{ matrix.browser }}

  test:
    needs:
      - test-regression-check-node10
    permissions:
      contents: write
      pull-requests: write
    uses: fastify/workflows/.github/workflows/plugins-ci.yml@v6
    with:
      license-check: true
      lint: true
      node-versions: '["16", "18", "20", "22", "24"]'

```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\anyhow-1.0.104\.github\workflows\ci.yml
**SHA:** 40e9434834e8ba84
**Timestamp:** 2026-08-28T02:32:24.213936
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
- run: echo RUSTFLAGS=${RUSTFLAGS}\ --cfg=anyhow_nightly_testing >> $GITHUB_ENV
- - run: cargo test
- - run: cargo check --no-default-features
- - run: cargo check
- - run: cargo check --manifest-path tests/crate/Cargo.toml
- - run: cargo check --manifest-path tests/crate/Cargo.toml --no-default-features
- - run: cargo generate-lockfile -Z minimal-versions
- - run: cargo check --locked
- - run: cargo check

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  pre_ci:
    uses: dtolnay/.github/.github/workflows/pre_ci.yml@master

  test:
    name: Rust ${{matrix.rust}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [nightly, beta, stable, 1.85.0]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
          components: rust-src
      - name: Enable type layout randomization
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - name: Enable nightly-only tests
        run: echo RUSTFLAGS=${RUSTFLAGS}\ --cfg=anyhow_nightly_testing >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - run: cargo test
      - run: cargo check --no-default-features
      - run: cargo check
      - uses: actions/upload-artifact@v7
        if: matrix.rust == 'nightly' && always()
        with:
          name: Cargo.lock
          path: Cargo.lock
        continue-on-error: true

  build:
    name: Rust ${{matrix.rust}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [1.68.0]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
          components: rust-src
      - run: cargo check --manifest-path tests/crate/Cargo.toml
      - run: cargo check --manifest-path tests/crate/Cargo.toml --no-default-features

  minimal:
    name: Minimal versions
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
      - run: cargo generate-lockfile -Z minimal-versions
      - run: cargo check --locked

  windows:
    name: Windows
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: windows-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: rust-src
      - run: cargo check

  doc:
    name: Documentation
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
        with:
          components: rust-src
      - uses: dtolnay/install@cargo-docs-rs
      - run: cargo docs-rs

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
        with:
          components: clippy, rust-src
      - run: cargo clippy --tests -- -Dclippy::all -Dclippy::pedantic

  miri:
    name: Miri
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@miri
      - run: cargo miri setup
      - run: cargo miri test
        env:
          MIRIFLAGS: -Zmiri-strict-provenance

  outdated:
    name: Outdated
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@stable
      - uses: dtolnay/install@cargo-outdated
      - run: cargo outdated --workspace --exit-code 1

```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\dtoa-1.0.11\.github\workflows\ci.yml
**SHA:** 8f28f66866512a8e
**Timestamp:** 2026-08-28T02:34:04.770691
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
- - run: cargo build
- - run: cargo test
- - run: cargo build --tests --features no-panic --release
- - run: cargo docs-rs
- - run: cargo miri setup
- - run: cargo miri test
- - run: cargo clippy --tests --benches -- -Dclippy::all -Dclippy::pedantic
- - run: cargo outdated --exit-code 1

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  pre_ci:
    uses: dtolnay/.github/.github/workflows/pre_ci.yml@master

  test:
    name: Rust ${{matrix.rust}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [nightly, beta, stable, 1.86.0, 1.68.0]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
      - name: Enable type layout randomization
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - run: cargo build
      - run: cargo test
        if: matrix.rust != '1.68.0'
      - run: cargo build --tests --features no-panic --release
        if: matrix.rust == 'nightly'
      - uses: actions/upload-artifact@v6
        if: matrix.rust == 'nightly' && always()
        with:
          name: Cargo.lock
          path: Cargo.lock
        continue-on-error: true

  doc:
    name: Documentation
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/install@cargo-docs-rs
      - run: cargo docs-rs

  miri:
    name: Miri
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@miri
      - run: cargo miri setup
      - run: cargo miri test
        env:
          MIRIFLAGS: -Zmiri-strict-provenance

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@clippy
      - run: cargo clippy --tests --benches -- -Dclippy::all -Dclippy::pedantic

  outdated:
    name: Outdated
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@stable
      - uses: dtolnay/install@cargo-outdated
      - run: cargo outdated --exit-code 1

```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\dyn-clone-1.0.20\.github\workflows\ci.yml
**SHA:** 3ed6fdca5c827a7e
**Timestamp:** 2026-08-28T02:34:05.701081
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
- - run: cargo test
- - run: cargo check --target thumbv6m-none-eabi
- - run: cargo check
- - run: cargo docs-rs
- - run: cargo miri setup
- - run: cargo miri test
- - run: cargo clippy --tests -- -Dclippy::all -Dclippy::pedantic

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  pre_ci:
    uses: dtolnay/.github/.github/workflows/pre_ci.yml@master

  test:
    name: Rust ${{matrix.rust}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [nightly, beta, stable, 1.70.0]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
      - name: Enable type layout randomization
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - run: cargo test

  embedded:
    name: No atomic
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          targets: thumbv6m-none-eabi
      - run: cargo check --target thumbv6m-none-eabi

  msrv:
    name: Rust 1.60.0
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@1.60.0
      - run: cargo check

  doc:
    name: Documentation
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/install@cargo-docs-rs
      - run: cargo docs-rs

  miri:
    name: Miri
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@miri
        with:
          toolchain: nightly-2025-05-16  # https://github.com/rust-lang/miri/issues/4323
      - run: cargo miri setup
      - run: cargo miri test
        env:
          MIRIFLAGS: -Zmiri-strict-provenance

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@clippy
      - run: cargo clippy --tests -- -Dclippy::all -Dclippy::pedantic

```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\erased-serde-0.4.10\.github\workflows\ci.yml
**SHA:** 2a6cdca4d0f44c1e
**Timestamp:** 2026-08-28T02:34:06.675647
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
- - run: cargo check
- - run: cargo check --manifest-path tests/crate/Cargo.toml
- - run: cargo check --manifest-path tests/crate/Cargo.toml --no-default-features --features alloc
- - run: cargo test
- - run: cargo generate-lockfile -Z minimal-versions
- - run: cargo check --locked
- - run: cargo docs-rs
- - run: cargo clippy --tests --benches -- -Dclippy::all -Dclippy::pedantic
- - run: cargo miri setup

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  pre_ci:
    uses: dtolnay/.github/.github/workflows/pre_ci.yml@master

  test:
    name: Rust ${{matrix.rust}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [nightly, beta, stable, 1.86.0, 1.68.0]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
      - name: Enable type layout randomization
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - run: cargo check
      - run: cargo check --manifest-path tests/crate/Cargo.toml
      - run: cargo check --manifest-path tests/crate/Cargo.toml --no-default-features --features alloc
      - run: cargo test
        if: matrix.rust != '1.68.0'
      - uses: actions/upload-artifact@v6
        if: matrix.rust == 'nightly' && always()
        with:
          name: Cargo.lock
          path: Cargo.lock
        continue-on-error: true

  minimal:
    name: Minimal versions
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@nightly
      - run: cargo generate-lockfile -Z minimal-versions
      - run: cargo check --locked

  doc:
    name: Documentation
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/install@cargo-docs-rs
      - run: cargo docs-rs

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@clippy
      - run: cargo clippy --tests --benches -- -Dclippy::all -Dclippy::pedantic

  miri:
    name: Miri
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@miri
      - run: cargo miri setup
      - run: cargo miri test
        env:
          MIRIFLAGS: -Zmiri-strict-provenance

  outdated:
    name: Outdated
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@stable
      - uses: dtolnay/install@cargo-outdated
      - run: cargo outdated --workspace --exit-code 1

```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\itoa-1.0.18\.github\workflows\ci.yml
**SHA:** 89c4f60223daf032
**Timestamp:** 2026-08-28T02:34:31.523050
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
- - run: cargo build
- - run: cargo test
- - run: cargo test --release
- - run: cargo build --no-default-features
- - run: cargo test --tests --no-default-features
- - run: cargo test --tests --no-default-features --release
- - run: cargo build --tests --features no-panic --release
- - run: cargo bench --no-run
- - run: cargo build

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  pre_ci:
    uses: dtolnay/.github/.github/workflows/pre_ci.yml@master

  test:
    name: Rust ${{matrix.rust}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [nightly, beta, stable, 1.86.0]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
      - name: Enable type layout randomization
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - run: cargo build
      - run: cargo test
      - run: cargo test --release
      - run: cargo build --no-default-features
      - run: cargo test --tests --no-default-features
      - run: cargo test --tests --no-default-features --release
      - run: cargo build --tests --features no-panic --release
        if: matrix.rust == 'nightly'
      - run: cargo bench --no-run
        if: matrix.rust == 'nightly'
      - uses: actions/upload-artifact@v6
        if: matrix.rust == 'nightly' && always()
        with:
          name: Cargo.lock
          path: Cargo.lock
        continue-on-error: true

  msrv:
    name: Rust 1.68.0
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@1.68
      - run: cargo build
      - run: cargo build --no-default-features

  doc:
    name: Documentation
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/install@cargo-docs-rs
      - run: cargo docs-rs

  miri:
    name: Miri
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@miri
      - run: cargo miri setup
      - run: cargo miri test
        env:
          MIRIFLAGS: -Zmiri-strict-provenance

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@clippy
      - run: cargo clippy --tests --benches -- -Dclippy::all -Dclippy::pedantic

  fuzz:
    name: Fuzz
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/install@cargo-fuzz
      - run: cargo fuzz check

  outdated:
    name: Outdated
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@stable
      - uses: dtolnay/install@cargo-outdated
      - run: cargo outdated --workspace --exit-code 1
      - run: cargo outdated --manifest-path fuzz/Cargo.toml --exit-code 1

```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\plist-1.10.0\.github\workflows\ci.yml
**SHA:** bcfe38f2013b26ce
**Timestamp:** 2026-08-28T02:34:57.811837
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: cargo test --locked --no-default-features
- run: cargo test --locked --no-default-features --features enable_unstable_features_that_may_break_with_minor_version_bumps
- run: cargo test --locked --no-default-features --features serde
- run: cargo test --locked --release --all-features
- run: cargo test --locked --all-features -Z minimal-versions
- run: cargo test --locked macro_expansion -- --ignored
- run: cargo doc --all-features --document-private-items --no-deps
- run: exit 1
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
on:
  push:
    branches:
      - master
  pull_request:
    branches:
      - master

name: CI

permissions:
  contents: read

jobs:
  build_and_test:
    name: Build and Test
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        include:
          - os: ubuntu-22.04
            target: x86_64-unknown-linux-gnu
            channel: msrv
          - os: ubuntu-22.04
            target: x86_64-unknown-linux-gnu
            channel: stable
          - os: ubuntu-22.04
            target: x86_64-unknown-linux-gnu
            channel: beta
          - os: ubuntu-22.04
            target: x86_64-unknown-linux-gnu
            channel: nightly
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Install Rust Toolchain
        run: |
          set -euo pipefail

          if [ "$CHANNEL" = "msrv" ]
          then
            CHANNEL="$(cargo metadata --no-deps --format-version=1 | jq -er '.packages[] | select(.name=="plist") | .rust_version')"
          fi

          TOOLCHAIN="${CHANNEL}-${TARGET}"
          rustup default "$TOOLCHAIN"
          rustup update "$TOOLCHAIN"
        env:
          CHANNEL: ${{ matrix.channel }}
          TARGET: ${{ matrix.target }}

      - name: Build and Test (Debug, No Default Features)
        run: cargo test --locked --no-default-features

      - name: Build and Test (Debug, enable_unstable_features_that_may_break_with_minor_version_bumps)
        run: cargo test --locked --no-default-features --features enable_unstable_features_that_may_break_with_minor_version_bumps

      - name: Build and Test (Debug, serde)
        run: cargo test --locked --no-default-features --features serde

      - name: Build and Test (Release, All Features)
        run: cargo test --locked --release --all-features

      - name: Build and Test (Minimal Versions, All Features)
        if: matrix.channel == 'nightly'
        run: cargo test --locked --all-features -Z minimal-versions

      - name: Install cargo-expand
        if: matrix.channel == 'msrv'
        uses: taiki-e/install-action@v2
        with:
          tool: cargo-expand@1

      - name: Test macro expansion
        if: matrix.channel == 'msrv'
        run: cargo test --locked macro_expansion -- --ignored

  lint:
    name: Lint
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Check for broken intra-doc links
        run: cargo doc --all-features --document-private-items --no-deps

  ci_succeeded:
    name: Build and Test Succeeded
    if: always()
    needs: [build_and_test, lint]
    runs-on: ubuntu-22.04
    outputs:
      release: ${{ steps.release_check.outputs.release }}
      tag_name: ${{ steps.release_check.outputs.tag_name }}
    steps:
      - name: Fail if Any Previous Job Failed
        if: contains(needs.*.result, 'failure')
        run: exit 1

      - name: Checkout
        uses: actions/checkout@v7

      - name: Run cargo-semver-checks
        uses: obi1kenobi/cargo-semver-checks-action@v2

      - name: Check if Release Needed
        id: release_check
        run: |
          set -euo pipefail

          TAG_NAME="v$(cargo metadata --no-deps --format-version=1 | jq -er '.packages[] | select(.name=="plist") | .version')"
          echo "tag_name=$TAG_NAME" >> "$GITHUB_OUTPUT"

          if git ls-remote --exit-code origin "refs/tags/$TAG_NAME"
          then
            echo "release=false" >> "$GITHUB_OUTPUT"
          else
            echo "release=true" >> "$GITHUB_OUTPUT"
          fi

  release:
    name: Release
    needs: ci_succeeded
    if: github.ref == 'refs/heads/master' && needs.ci_succeeded.outputs.release == 'true'
    runs-on: ubuntu-22.04
    environment: release
    permissions:
      contents: write # Required for creating GitHub release
      id-token: write # Required for OIDC token exchange
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Authenticate with crates.io
        uses: rust-lang/crates-io-auth-action@v1
        id: auth

      - name: Publish Crate
        run: |
          cargo publish
        env:
          CARGO_REGISTRY_TOKEN: ${{ steps.auth.outputs.token }}

      - name: Create GitHub Release
        uses: actions/create-release@latest
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ needs.ci_succeeded.outputs.tag_name }}
          release_name: ${{ needs.ci_succeeded.outputs.tag_name }}
          draft: false
          prerelease: false

```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\proc-macro2-1.0.107\.github\workflows\ci.yml
**SHA:** f0003fd6c9bd0f92
**Timestamp:** 2026-08-28T02:35:00.098681
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: cargo test
- - run: cargo test --no-default-features
- - run: cargo test --features span-locations
- run: cargo test
- run: cargo test --no-default-features
- run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout\ --cfg=randomize_layout >> $GITHUB_ENV
- - run: cargo check
- - run: cargo test
- - run: cargo test --no-default-features
- - run: cargo test --no-default-features --test features -- --ignored make_sure_no_proc_macro # run the ignored test to make sure the `proc-macro` feature is disabled

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  pre_ci:
    uses: dtolnay/.github/.github/workflows/pre_ci.yml@master

  test:
    name: Rust ${{matrix.rust}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [1.80.0, stable, beta]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
          components: rust-src
      - run: cargo test
      - run: cargo test --no-default-features
      - run: cargo test --features span-locations
      - name: RUSTFLAGS='--cfg procmacro2_semver_exempt' cargo test
        run: cargo test
        env:
          RUSTFLAGS: --cfg procmacro2_semver_exempt ${{env.RUSTFLAGS}}
      - name: RUSTFLAGS='--cfg procmacro2_semver_exempt' cargo test --no-default-features
        run: cargo test --no-default-features
        env:
          RUSTFLAGS: --cfg procmacro2_semver_exempt ${{env.RUSTFLAGS}}

  nightly:
    name: Rust nightly
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
        with:
          components: rust-src
      - name: Enable type layout randomization
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout\ --cfg=randomize_layout >> $GITHUB_ENV
      - run: cargo check
        env:
          RUSTFLAGS: --cfg procmacro2_nightly_testing ${{env.RUSTFLAGS}}
      - run: cargo test
      - run: cargo test --no-default-features
      - run: cargo test --no-default-features --test features -- --ignored make_sure_no_proc_macro # run the ignored test to make sure the `proc-macro` feature is disabled
      - run: cargo test --features span-locations
      - run: cargo test --manifest-path tests/ui/Cargo.toml
      - name: RUSTFLAGS='--cfg procmacro2_semver_exempt' cargo test
        run: cargo test
        env:
          RUSTFLAGS: --cfg procmacro2_semver_exempt ${{env.RUSTFLAGS}}
      - name: RUSTFLAGS='--cfg procmacro2_semver_exempt' cargo test --no-default-features
        run: cargo test --no-default-features
        env:
          RUSTFLAGS: --cfg procmacro2_semver_exempt ${{env.RUSTFLAGS}}
      - name: RUSTFLAGS='-Z allow-features=' cargo test
        run: cargo test
        env:
          RUSTFLAGS: -Z allow-features= --cfg procmacro2_backtrace ${{env.RUSTFLAGS}}
      - uses: actions/upload-artifact@v7
        if: always()
        with:
          name: Cargo.lock
          path: Cargo.lock
        continue-on-error: true

  layout:
    name: Layout
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
        with:
          components: rust-src
      - run: cargo test --test test_size
      - run: cargo test --test test_size --features span-locations
      - run: cargo test --test test_size --no-default-features
      - run: cargo test --test test_size --no-default-features --features span-locations

  msrv:
    name: Rust 1.71.0
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@1.71.0
        with:
          components: rust-src
      - run: cargo check
      - run: cargo check --no-default-features
      - run: cargo check --features span-locations
      - name: RUSTFLAGS='--cfg procmacro2_semver_exempt' cargo check
        run: cargo check
        env:
          RUSTFLAGS: --cfg procmacro2_semver_exempt ${{env.RUSTFLAGS}}
      - name: RUSTFLAGS='--cfg procmacro2_semver_exempt' cargo check --no-default-features
        run: cargo check --no-default-features
        env:
          RUSTFLAGS: --cfg procmacro2_semver_exempt ${{env.RUSTFLAGS}}

  minimal:
    name: Minimal versions
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
      - run: cargo generate-lockfile -Z minimal-versions
      - run: cargo check --locked

  webassembly:
    name: WebAssembly
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
        with:
          target: wasm32-unknown-unknown
          components: rust-src
      - name: Ignore WebAssembly linker warning
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Alinker_messages >> $GITHUB_ENV
      - run: cargo test --target wasm32-unknown-unknown --no-run

  fuzz:
    name: Fuzz
    needs: pre_ci
    if: needs.pre
```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quote-1.0.47\.github\workflows\ci.yml
**SHA:** fb61965972f379db
**Timestamp:** 2026-08-28T02:35:01.814567
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
- - run: cargo check
- - run: cargo test
- - run: cargo run --manifest-path benches/Cargo.toml
- - run: cargo generate-lockfile -Z minimal-versions
- - run: cargo check --locked
- - run: cargo docs-rs
- - run: cargo clippy --tests --workspace -- -Dclippy::all -Dclippy::pedantic
- - run: cargo miri setup
- - run: cargo miri test

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  pre_ci:
    uses: dtolnay/.github/.github/workflows/pre_ci.yml@master

  test:
    name: Rust ${{matrix.rust}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [nightly, stable, beta, 1.85.0, 1.71.0]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
          components: rust-src
      - name: Enable type layout randomization
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - run: cargo check
      - run: cargo test
        if: matrix.rust != '1.71.0'
      - run: cargo run --manifest-path benches/Cargo.toml
      - uses: actions/upload-artifact@v7
        if: matrix.rust == 'nightly' && always()
        with:
          name: Cargo.lock
          path: Cargo.lock
        continue-on-error: true

  minimal:
    name: Minimal versions
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
      - run: cargo generate-lockfile -Z minimal-versions
      - run: cargo check --locked

  doc:
    name: Documentation
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
        with:
          components: rust-src
      - uses: dtolnay/install@cargo-docs-rs
      - run: cargo docs-rs

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
        with:
          components: clippy, rust-src
      - run: cargo clippy --tests --workspace -- -Dclippy::all -Dclippy::pedantic

  miri:
    name: Miri
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@miri
      - run: cargo miri setup
      - run: cargo miri test
        env:
          MIRIFLAGS: -Zmiri-strict-provenance

  outdated:
    name: Outdated
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@stable
      - uses: dtolnay/install@cargo-outdated
      - run: cargo outdated --workspace --exit-code 1

```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\ref-cast-1.0.26\.github\workflows\ci.yml
**SHA:** ff589179ef0c3c18
**Timestamp:** 2026-08-28T02:35:03.436874
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
- - run: cargo test --workspace
- - run: cargo check
- - run: cargo generate-lockfile -Z minimal-versions
- - run: cargo check --locked
- - run: cargo docs-rs
- - run: cargo miri setup
- - run: cargo miri test
- - run: cargo clippy --workspace --tests -- -Dclippy::all -Dclippy::pedantic
- - run: cargo outdated --workspace --exit-code 1

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  pre_ci:
    uses: dtolnay/.github/.github/workflows/pre_ci.yml@master

  test:
    name: Rust ${{matrix.rust}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [nightly, beta, stable, 1.85.0]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
      - name: Enable type layout randomization
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - run: cargo test --workspace
      - uses: actions/upload-artifact@v7
        if: matrix.rust == 'nightly' && always()
        with:
          name: Cargo.lock
          path: Cargo.lock
        continue-on-error: true

  msrv:
    name: Rust 1.71.0
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@1.71.0
      - run: cargo check

  minimal:
    name: Minimal versions
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
      - run: cargo generate-lockfile -Z minimal-versions
      - run: cargo check --locked

  doc:
    name: Documentation
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/install@cargo-docs-rs
      - run: cargo docs-rs

  miri:
    name: Miri
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@miri
      - run: cargo miri setup
      - run: cargo miri test
        env:
          MIRIFLAGS: -Zmiri-strict-provenance

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@clippy
      - run: cargo clippy --workspace --tests -- -Dclippy::all -Dclippy::pedantic

  outdated:
    name: Outdated
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@stable
      - uses: dtolnay/install@cargo-outdated
      - run: cargo outdated --workspace --exit-code 1

```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\semver-1.0.28\.github\workflows\ci.yml
**SHA:** 5aa1651149da2153
**Timestamp:** 2026-08-28T02:35:26.567461
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
- - run: cargo test
- - run: cargo check --no-default-features
- - run: cargo check --features serde
- - run: cargo check --no-default-features --features serde
- - run: npm install semver
- - run: cargo test
- - run: cargo generate-lockfile -Z minimal-versions
- - run: cargo check --locked --features serde
- - run: cargo docs-rs

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  pre_ci:
    uses: dtolnay/.github/.github/workflows/pre_ci.yml@master

  test:
    name: Rust ${{matrix.rust}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [nightly, beta, stable, 1.86.0, 1.68.0]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
      - name: Enable type layout randomization
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - run: cargo test
        if: matrix.rust != '1.68.0'
      - run: cargo check --no-default-features
      - run: cargo check --features serde
      - run: cargo check --no-default-features --features serde
      - uses: actions/upload-artifact@v6
        if: matrix.rust == 'nightly' && always()
        with:
          name: Cargo.lock
          path: Cargo.lock
        continue-on-error: true

  node:
    name: Node
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@stable
      - run: npm install semver
      - run: cargo test
        env:
          RUSTFLAGS: --cfg test_node_semver ${{env.RUSTFLAGS}}

  minimal:
    name: Minimal versions
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@nightly
      - run: cargo generate-lockfile -Z minimal-versions
      - run: cargo check --locked --features serde

  doc:
    name: Documentation
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/install@cargo-docs-rs
      - run: cargo docs-rs

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@clippy
      - run: cargo clippy --tests --benches -- -Dclippy::all -Dclippy::pedantic

  miri:
    name: Miri
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    env:
      MIRIFLAGS: -Zmiri-strict-provenance
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@miri
      - name: Run cargo miri test (64-bit little endian)
        run: cargo miri test --target x86_64-unknown-linux-gnu
      - name: Run cargo miri test (64-bit big endian)
        run: cargo miri test --target powerpc64-unknown-linux-gnu
      - name: Run cargo miri test (32-bit little endian)
        run: cargo miri test --target i686-unknown-linux-gnu
      - name: Run cargo miri test (32-bit big endian)
        run: cargo miri test --target mips-unknown-linux-gnu

  fuzz:
    name: Fuzz
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/install@cargo-fuzz
      - run: cargo fuzz check

  outdated:
    name: Outdated
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@stable
      - uses: dtolnay/install@cargo-outdated
      - run: cargo outdated --workspace --exit-code 1
      - run: cargo outdated --manifest-path fuzz/Cargo.toml --exit-code 1

```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\serde-untagged-0.1.9\.github\workflows\ci.yml
**SHA:** 0a9dde66f8d985b5
**Timestamp:** 2026-08-28T02:35:27.969005
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
- - run: cargo test
- - run: cargo check --manifest-path tests/crate/Cargo.toml
- - run: cargo generate-lockfile -Z minimal-versions
- - run: cargo check --locked
- - run: cargo docs-rs
- - run: cargo clippy --tests -- -Dclippy::all -Dclippy::pedantic
- - run: cargo miri setup
- - run: cargo miri test
- - run: cargo outdated --workspace --exit-code 1

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  pre_ci:
    uses: dtolnay/.github/.github/workflows/pre_ci.yml@master

  test:
    name: Rust ${{matrix.rust}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [nightly, beta, stable, 1.70.0]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v5
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
      - name: Enable type layout randomization
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - run: cargo test
      - uses: actions/upload-artifact@v4
        if: matrix.rust == 'nightly' && always()
        with:
          name: Cargo.lock
          path: Cargo.lock
        continue-on-error: true

  msrv:
    name: Rust 1.61.0
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v5
      - uses: dtolnay/rust-toolchain@1.61.0
      - run: cargo check --manifest-path tests/crate/Cargo.toml

  minimal:
    name: Minimal versions
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v5
      - uses: dtolnay/rust-toolchain@nightly
      - run: cargo generate-lockfile -Z minimal-versions
      - run: cargo check --locked

  doc:
    name: Documentation
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v5
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/install@cargo-docs-rs
      - run: cargo docs-rs

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v5
      - uses: dtolnay/rust-toolchain@clippy
      - run: cargo clippy --tests -- -Dclippy::all -Dclippy::pedantic

  miri:
    name: Miri
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v5
      - uses: dtolnay/rust-toolchain@miri
      - run: cargo miri setup
      - run: cargo miri test
        env:
          MIRIFLAGS: -Zmiri-strict-provenance

  outdated:
    name: Outdated
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v5
      - uses: dtolnay/rust-toolchain@stable
      - uses: dtolnay/install@cargo-outdated
      - run: cargo outdated --workspace --exit-code 1

```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\serde_json-1.0.151\.github\workflows\ci.yml
**SHA:** c34145e098a9d189
**Timestamp:** 2026-08-28T02:35:31.719651
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: cargo test
- - run: cargo test --features preserve_order --tests -- --skip ui --exact
- - run: cargo test --features float_roundtrip --tests -- --skip ui --exact
- - run: cargo test --features arbitrary_precision --tests -- --skip ui --exact
- - run: cargo test --features float_roundtrip,arbitrary_precision --tests -- --skip ui --exact
- - run: cargo test --features raw_value --tests -- --skip ui --exact
- - run: cargo test --features unbounded_depth --tests -- --skip ui --exact
- - run: cargo check --manifest-path tests/crate/Cargo.toml
- - run: cargo check --manifest-path tests/crate/Cargo.toml --features float_roundtrip
- - run: cargo check --manifest-path tests/crate/Cargo.toml --features arbitrary_precision

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  test:
    name: Rust nightly ${{matrix.os == 'windows' && '(windows)' || ''}}
    runs-on: ${{matrix.os}}-latest
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu, windows]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
      - run: cargo test
      - run: cargo test --features preserve_order --tests -- --skip ui --exact
      - run: cargo test --features float_roundtrip --tests -- --skip ui --exact
      - run: cargo test --features arbitrary_precision --tests -- --skip ui --exact
      - run: cargo test --features float_roundtrip,arbitrary_precision --tests -- --skip ui --exact
      - run: cargo test --features raw_value --tests -- --skip ui --exact
      - run: cargo test --features unbounded_depth --tests -- --skip ui --exact
      - uses: actions/upload-artifact@v7
        if: matrix.os == 'ubuntu' && always()
        with:
          name: Cargo.lock
          path: Cargo.lock
        continue-on-error: true

  build:
    name: Rust ${{matrix.rust}} ${{matrix.os == 'windows' && '(windows)' || ''}}
    runs-on: ${{matrix.os}}-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [beta, 1.85.0, 1.71.0]
        os: [ubuntu]
        include:
          - rust: stable
            os: ubuntu
            target: aarch64-unknown-none
          - rust: stable
            os: windows
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
          targets: ${{matrix.target}}
      - run: cargo check --manifest-path tests/crate/Cargo.toml
      - run: cargo check --manifest-path tests/crate/Cargo.toml --features float_roundtrip
      - run: cargo check --manifest-path tests/crate/Cargo.toml --features arbitrary_precision
      - run: cargo check --manifest-path tests/crate/Cargo.toml --features raw_value
      - run: cargo check --manifest-path tests/crate/Cargo.toml --features unbounded_depth
      - run: cargo check --manifest-path tests/crate/Cargo.toml --no-default-features --features alloc
      - run: cargo check --manifest-path tests/crate/Cargo.toml --no-default-features --features alloc,arbitrary_precision
      - run: cargo check --manifest-path tests/crate/Cargo.toml --no-default-features --features alloc,raw_value
      - run: cargo check --manifest-path tests/crate/Cargo.toml --features serde_json/preserve_order
        if: matrix.rust != '1.71.0'
      - run: cargo check --manifest-path tests/crate/Cargo.toml --no-default-features --features alloc,serde_json/preserve_order
        if: matrix.rust != '1.71.0'
      - name: Build without std
        run: cargo check --manifest-path tests/crate/Cargo.toml --target
          ${{matrix.target}} --no-default-features --features alloc
        if: matrix.target

  minimal:
    name: Minimal versions
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
      - run: cargo generate-lockfile -Z minimal-versions
      - run: cargo check --locked

  miri:
    name: Miri (${{matrix.name}})
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        include:
          - name: 64-bit little endian
            target: x86_64-unknown-linux-gnu
          - name: 64-bit big endian
            target: powerpc64-unknown-linux-gnu
          - name: 32-bit little endian
            target: i686-unknown-linux-gnu
          - name: 32-bit big endian
            target: mips-unknown-linux-gnu
    env:
      MIRIFLAGS: -Zmiri-strict-provenance
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@miri
      - run: cargo miri setup
      - run: cargo miri test --target ${{matrix.target}}
      - run: cargo miri test --target ${{matrix.target}} --features preserve_order,float_roundtrip,arbitrary_precision,raw_value

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@clippy
      - run: cargo clippy --tests -- -Dclippy::all -Dclippy::pedantic
      - run: cargo clippy --all-features --tests -- -Dclippy::all -Dclippy::pedantic

  doc:
    name: Documentation
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/install@cargo-docs-rs
      - run: cargo docs-rs

  fuzz:
    name: Fuzz
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/install@c
```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\serde_repr-0.1.21\.github\workflows\ci.yml
**SHA:** b533debcd780acd2
**Timestamp:** 2026-08-28T02:35:33.330159
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
- - run: cargo check
- - run: cargo test
- - run: cargo generate-lockfile -Z minimal-versions
- - run: cargo check --locked
- - run: cargo docs-rs
- - run: cargo clippy --tests -- -Dclippy::all -Dclippy::pedantic
- - run: cargo miri setup
- - run: cargo miri test
- - run: cargo outdated --workspace --exit-code 1

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  pre_ci:
    uses: dtolnay/.github/.github/workflows/pre_ci.yml@master

  test:
    name: Rust ${{matrix.rust}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [nightly, beta, stable, 1.85.0, 1.71.0]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
      - name: Enable type layout randomization
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - run: cargo check
      - run: cargo test
        if: matrix.rust != '1.71.0'
      - uses: actions/upload-artifact@v7
        if: matrix.rust == 'nightly' && always()
        with:
          name: Cargo.lock
          path: Cargo.lock
        continue-on-error: true

  minimal:
    name: Minimal versions
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
      - run: cargo generate-lockfile -Z minimal-versions
      - run: cargo check --locked

  doc:
    name: Documentation
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/install@cargo-docs-rs
      - run: cargo docs-rs

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@clippy
      - run: cargo clippy --tests -- -Dclippy::all -Dclippy::pedantic

  miri:
    name: Miri
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@miri
      - run: cargo miri setup
      - run: cargo miri test
        env:
          MIRIFLAGS: -Zmiri-strict-provenance

  outdated:
    name: Outdated
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@stable
      - uses: dtolnay/install@cargo-outdated
      - run: cargo outdated --workspace --exit-code 1

```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\thiserror-1.0.69\.github\workflows\ci.yml
**SHA:** ceb51b32344425a8
**Timestamp:** 2026-08-28T02:36:01.897571
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
- run: echo RUSTFLAGS=${RUSTFLAGS}\ --cfg=thiserror_nightly_testing >> $GITHUB_ENV
- - run: cargo test --all
- - run: cargo generate-lockfile -Z minimal-versions
- - run: cargo check --locked
- - run: cargo docs-rs
- - run: cargo clippy --tests --workspace -- -Dclippy::all -Dclippy::pedantic
- - run: cargo miri setup
- - run: cargo miri test
- - run: cargo outdated --workspace --exit-code 1

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  pre_ci:
    uses: dtolnay/.github/.github/workflows/pre_ci.yml@master

  test:
    name: Rust ${{matrix.rust}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [nightly, beta, stable, 1.70.0, 1.61.0]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
          components: rust-src
      - name: Enable type layout randomization
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - name: Enable nightly-only tests
        run: echo RUSTFLAGS=${RUSTFLAGS}\ --cfg=thiserror_nightly_testing >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - run: cargo test --all
        if: matrix.rust != '1.61.0'
      - uses: actions/upload-artifact@v4
        if: matrix.rust == 'nightly' && always()
        with:
          name: Cargo.lock
          path: Cargo.lock

  minimal:
    name: Minimal versions
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@nightly
      - run: cargo generate-lockfile -Z minimal-versions
      - run: cargo check --locked

  doc:
    name: Documentation
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@nightly
        with:
          components: rust-src
      - uses: dtolnay/install@cargo-docs-rs
      - run: cargo docs-rs

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@nightly
        with:
          components: clippy, rust-src
      - run: cargo clippy --tests --workspace -- -Dclippy::all -Dclippy::pedantic

  miri:
    name: Miri
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@miri
      - run: cargo miri setup
      - run: cargo miri test
        env:
          MIRIFLAGS: -Zmiri-strict-provenance

  outdated:
    name: Outdated
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: dtolnay/install@cargo-outdated
      - run: cargo outdated --workspace --exit-code 1

```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\thiserror-2.0.20\.github\workflows\ci.yml
**SHA:** df3ef5359a2543e5
**Timestamp:** 2026-08-28T02:36:03.527358
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
- run: echo RUSTFLAGS=${RUSTFLAGS}\ --cfg=thiserror_nightly_testing >> $GITHUB_ENV
- - run: cargo test --workspace --exclude thiserror_no_std_test
- - run: cargo test --manifest-path tests/no-std/Cargo.toml
- - run: cargo test --no-default-features
- - run: cargo check
- - run: cargo generate-lockfile -Z minimal-versions
- - run: cargo check --locked
- - run: cargo docs-rs
- - run: cargo clippy --tests --workspace -- -Dclippy::all -Dclippy::pedantic

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  pre_ci:
    uses: dtolnay/.github/.github/workflows/pre_ci.yml@master

  test:
    name: Rust ${{matrix.rust}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [nightly, beta, stable, 1.88.0]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
          components: rust-src
      - name: Enable type layout randomization
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - name: Enable nightly-only tests
        run: echo RUSTFLAGS=${RUSTFLAGS}\ --cfg=thiserror_nightly_testing >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - run: cargo test --workspace --exclude thiserror_no_std_test
      - run: cargo test --manifest-path tests/no-std/Cargo.toml
      - run: cargo test --no-default-features
      - uses: actions/upload-artifact@v7
        if: matrix.rust == 'nightly' && always()
        with:
          name: Cargo.lock
          path: Cargo.lock
        continue-on-error: true

  msrv:
    name: Rust 1.71.0
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@1.71.0
        with:
          components: rust-src
      - run: cargo check

  minimal:
    name: Minimal versions
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
      - run: cargo generate-lockfile -Z minimal-versions
      - run: cargo check --locked

  doc:
    name: Documentation
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
        with:
          components: rust-src
      - uses: dtolnay/install@cargo-docs-rs
      - run: cargo docs-rs

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
        with:
          components: clippy, rust-src
      - run: cargo clippy --tests --workspace -- -Dclippy::all -Dclippy::pedantic

  miri:
    name: Miri
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@miri
      - run: cargo miri setup
      - run: cargo miri test
        env:
          MIRIFLAGS: -Zmiri-strict-provenance

  outdated:
    name: Outdated
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@stable
      - uses: dtolnay/install@cargo-outdated
      - run: cargo outdated --workspace --exit-code 1

```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\unicode-ident-1.0.24\.github\workflows\ci.yml
**SHA:** 7cd19596c9178c43
**Timestamp:** 2026-08-28T02:36:32.620233
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo "version=$(grep 'ucd-generate [0-9]\+\.[0-9]\+\.[0-9]\+' tests/tables/tables.rs --only-matching)" >> $GITHUB_OUTPUT
- - run: cargo install ucd-generate
- - run: curl https://www.unicode.org/Public/latest/ucd/UCD.zip --location --remote-name --silent --show-error --fail --retry 2
- - run: unzip UCD.zip -d UCD
- - run: ucd-generate property-bool UCD --include XID_Start,XID_Continue > tests/tables/tables.rs
- - run: ucd-generate property-bool UCD --include XID_Start,XID_Continue --fst-dir tests/fst
- - run: ucd-generate property-bool UCD --include XID_Start,XID_Continue --trie-set > tests/trie/trie.rs
- - run: cargo run --manifest-path generate/Cargo.toml
- - run: sed --in-place 's/ucd-generate [0-9]\+\.[0-9]\+\.[0-9]\+/${{steps.ucd-generate.outputs.version}}/' tests/tables/tables.rs tests/trie/trie.rs
- - run: git diff --exit-code

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  pre_ci:
    uses: dtolnay/.github/.github/workflows/pre_ci.yml@master

  unicode:
    name: latest Unicode
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@stable
      - id: ucd-generate
        run: echo "version=$(grep 'ucd-generate [0-9]\+\.[0-9]\+\.[0-9]\+' tests/tables/tables.rs --only-matching)" >> $GITHUB_OUTPUT
      - run: cargo install ucd-generate
      - run: curl https://www.unicode.org/Public/latest/ucd/UCD.zip --location --remote-name --silent --show-error --fail --retry 2
      - run: unzip UCD.zip -d UCD
      - run: ucd-generate property-bool UCD --include XID_Start,XID_Continue > tests/tables/tables.rs
      - run: ucd-generate property-bool UCD --include XID_Start,XID_Continue --fst-dir tests/fst
      - run: ucd-generate property-bool UCD --include XID_Start,XID_Continue --trie-set > tests/trie/trie.rs
      - run: cargo run --manifest-path generate/Cargo.toml
      - run: sed --in-place 's/ucd-generate [0-9]\+\.[0-9]\+\.[0-9]\+/${{steps.ucd-generate.outputs.version}}/' tests/tables/tables.rs tests/trie/trie.rs
      - run: git diff --exit-code

  test:
    name: Rust ${{matrix.rust}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        rust: [nightly, beta, stable, 1.86.0]
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
      - name: Enable type layout randomization
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - run: cargo test
      - run: cargo check --benches
      - uses: actions/upload-artifact@v6
        if: matrix.rust == 'nightly' && always()
        with:
          name: Cargo.lock
          path: Cargo.lock
        continue-on-error: true

  msrv:
    name: Rust 1.71.0
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@1.71.0
      - run: cargo check --manifest-path tests/crate/Cargo.toml

  doc:
    name: Documentation
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    timeout-minutes: 45
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/install@cargo-docs-rs
      - run: cargo docs-rs

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@clippy
      - run: cargo clippy --tests --benches --workspace -- -Dclippy::all -Dclippy::pedantic

  outdated:
    name: Outdated
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@stable
      - uses: dtolnay/install@cargo-outdated
      - run: cargo outdated --workspace --exit-code 1

```

---

# MISSAO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\zmij-1.0.23\.github\workflows\ci.yml
**SHA:** 2d9a2289aa97a6f2
**Timestamp:** 2026-08-28T02:37:46.726675
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
- - run: cargo check
- - run: cargo build --tests --features no-panic --release
- - run: cargo test
- - run: cargo test --release
- - run: cargo check --target=wasm32-unknown-unknown
- - run: cargo check
- - run: cargo build --tests --features no-panic --release
- - run: cargo test
- - run: cargo test --release

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:
  schedule: [cron: "40 1 * * *"]

permissions:
  contents: read

env:
  RUSTFLAGS: -Dwarnings

jobs:
  pre_ci:
    uses: dtolnay/.github/.github/workflows/pre_ci.yml@master

  test:
    name: ${{matrix.os == 'macos' && 'macOS' || format('Rust {0} ({1})', matrix.rust, matrix.arch)}}
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ${{matrix.os == 'macos' && 'macos-latest' || matrix.arch == 'x86_64' && 'ubuntu-latest' || 'ubuntu-24.04-arm'}}
    strategy:
      fail-fast: false
      matrix:
        rust: [nightly, beta, stable, 1.86.0, 1.71.0]
        arch: [x86_64, aarch64]
        os: [ubuntu]
        include:
          - rust: nightly
            os: macos
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{matrix.rust}}
          targets: wasm32-unknown-unknown
      - name: Enable type layout randomization
        run: echo RUSTFLAGS=${RUSTFLAGS}\ -Zrandomize-layout >> $GITHUB_ENV
        if: matrix.rust == 'nightly'
      - run: cargo check
      - run: cargo build --tests --features no-panic --release
        if: matrix.rust == 'nightly'
      - run: cargo test
        if: matrix.rust != '1.71.0'
      - run: cargo test --release
        if: matrix.rust != '1.71.0'
      - run: cargo check --target=wasm32-unknown-unknown
      - run: cargo check
        env:
          RUSTFLAGS: ${{env.RUSTFLAGS}} -Ctarget-cpu=native
      - run: cargo build --tests --features no-panic --release
        if: matrix.rust == 'nightly'
        env:
          RUSTFLAGS: ${{env.RUSTFLAGS}} -Ctarget-cpu=native
      - run: cargo test
        if: matrix.rust != '1.71.0'
        env:
          RUSTFLAGS: ${{env.RUSTFLAGS}} -Ctarget-cpu=native
      - run: cargo test --release
        if: matrix.rust != '1.71.0'
        env:
          RUSTFLAGS: ${{env.RUSTFLAGS}} -Ctarget-cpu=native
      - run: cargo --config='profile.dev.opt-level="s"' check
      - run: cargo --config='profile.release.opt-level="s"' build --tests --features no-panic --release
        if: matrix.rust == 'nightly'
      - run: cargo --config='profile.dev.opt-level="s"' test
        if: matrix.rust != '1.71.0'
      - run: cargo --config='profile.release.opt-level="s"' test --release
        if: matrix.rust != '1.71.0'
      - run: cargo --config='profile.release.opt-level="s"' check --target=wasm32-unknown-unknown
      - uses: actions/upload-artifact@v7
        if: matrix.rust == 'nightly' && matrix.arch == 'x86_64' && matrix.os == 'ubuntu' && always()
        with:
          name: Cargo.lock
          path: Cargo.lock
        continue-on-error: true

  doc:
    name: Documentation
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    env:
      RUSTDOCFLAGS: -Dwarnings
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/install@cargo-docs-rs
      - run: cargo docs-rs

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@clippy
        with:
          targets: aarch64-unknown-linux-gnu
      - run: cargo clippy --tests --benches -- -Dclippy::all -Dclippy::pedantic
      - run: cargo clippy --target=aarch64-unknown-linux-gnu -- -Dclippy::all -Dclippy::pedantic
      - run: cargo clippy -- -Dclippy::all -Dclippy::pedantic
        env:
          RUSTFLAGS: ${{env.RUSTFLAGS}} -Ctarget-cpu=native

  miri:
    name: Miri (${{matrix.name}})
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        include:
          - name: 64-bit little endian
            target: x86_64-unknown-linux-gnu
          - name: 64-bit little endian, NEON
            target: aarch64-unknown-linux-gnu
          - name: 64-bit big endian
            target: powerpc64-unknown-linux-gnu
          - name: 32-bit little endian
            target: i686-unknown-linux-gnu
          - name: 32-bit big endian
            target: mips-unknown-linux-gnu
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@miri
      - run: cargo miri setup
      - run: cargo miri test --target ${{matrix.target}}
        env:
          MIRIFLAGS: -Zmiri-strict-provenance

  outdated:
    name: Outdated
    runs-on: ubuntu-latest
    if: github.event_name != 'pull_request'
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v7
      - uses: dtolnay/rust-toolchain@stable
      - uses: dtolnay/install@cargo-outdated
      - run: cargo outdated --exit-code 1
      - run: cargo outdated --manifest-path fuzz/Cargo.toml --exit-code 1

  fuzz:
    name: Fuzz
    needs: pre_ci
    if: needs.pre_ci.outputs.continue
    runs-on: ubuntu-latest
```