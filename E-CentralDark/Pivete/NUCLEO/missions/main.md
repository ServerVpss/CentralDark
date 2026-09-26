# MISSAO - main.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cfg-if-1.0.4\.github\workflows\main.yaml
**SHA:** 6612a51b1f1479ea
**Timestamp:** 2026-08-28T02:33:23.442327
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: cargo fmt -- --check

### Ouro Bruto (primeiros 5000 chars)
```
name: CI
on: [push, pull_request]

permissions:
  contents: read

env:
  RUSTDOCFLAGS: -Dwarnings
  RUSTFLAGS: -Dwarnings

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        rust:
          - "1.32" # msrv
          - stable
          - beta
          - nightly
    steps:
      - uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8 # v5.0.0
      - name: Install Rust ${{ matrix.rust }}
        run: |
          rustup self update
          rustup update ${{ matrix.rust }}
          rustup default ${{ matrix.rust }}
          rustc -vV
      - name: Run tests
        run: |
          set -eux
          # Remove `-Dwarnings` at the MSRV since lints may be different
          [ "${{ matrix.rust }}" = "1.32" ] && export RUSTFLAGS="--cfg msrv_test"
          cargo test

  rustfmt:
    name: Rustfmt
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8 # v5.0.0
      - name: Install Rust Stable
        run: |
          rustup update stable
          rustup default stable
          rustup component add rustfmt
      - name: Run rustfmt
        run: cargo fmt -- --check

```

---

# MISSAO - main.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\log-0.4.33\.github\workflows\main.yml
**SHA:** 12ba374d45e4b400
**Timestamp:** 2026-08-28T02:34:46.968539
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: cargo hack test --feature-powerset --exclude-features max_level_off,max_level_error,max_level_warn,max_level_info,max_level_debug,max_level_trace,release_max_level_off,release_max_level_error,r
- - run: cargo run --verbose --manifest-path test_max_level_features/Cargo.toml
- - run: cargo run --verbose --manifest-path test_max_level_features/Cargo.toml --release
- - run: cargo fmt -- --check
- - run: cargo fmt --manifest-path test_max_level_features/Cargo.toml -- --check
- - run: cargo clippy --verbose
- - run: cargo clippy --verbose --manifest-path test_max_level_features/Cargo.toml
- run: cargo doc --verbose --features std,kv,kv_std,kv_sval,kv_serde
- - run: cargo build --verbose -Z avoid-dev-deps --features kv
- - run: cargo build --verbose -Z avoid-dev-deps --features "kv std"

### Ouro Bruto (primeiros 5000 chars)
```
name: CI
on: [push, pull_request]

# Ensure only read permission is granted
permissions:
  contents: read

jobs:
  test:
    name: Test
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        include:
          - build: stable
            os: ubuntu-latest
            rust: stable
          - build: beta
            os: ubuntu-latest
            rust: beta
          - build: nightly
            os: ubuntu-latest
            rust: nightly
          - build: macos
            os: macos-latest
            rust: stable
          - build: win32
            os: windows-latest
            rust: stable-i686-pc-windows-msvc
          - build: win64
            os: windows-latest
            rust: stable-x86_64-pc-windows-msvc
          - build: mingw
            os: windows-latest
            rust: stable-x86_64-pc-windows-gnu
    steps:
    - uses: actions/checkout@0c366fd6a839edf440554fa01a7085ccba70ac98 # v6.0.2
      with:
        persist-credentials: false
    - uses: dtolnay/rust-toolchain@e97e2d8cc328f1b50210efc529dca0028893a2d9 # v1
      with:
        toolchain: ${{ matrix.rust }}
    - uses: taiki-e/install-action@0abfcd587b70a713fdaa7fb502c885e2112acb15 # v2.75.7
      with:
        tool: cargo-hack
    - run: cargo hack test --feature-powerset --exclude-features max_level_off,max_level_error,max_level_warn,max_level_info,max_level_debug,max_level_trace,release_max_level_off,release_max_level_error,release_max_level_warn,release_max_level_info,release_max_level_debug,release_max_level_trace
    - run: cargo run --verbose --manifest-path test_max_level_features/Cargo.toml
    - run: cargo run --verbose --manifest-path test_max_level_features/Cargo.toml --release

  check:
    name: Check Format and Clippy
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@0c366fd6a839edf440554fa01a7085ccba70ac98 # v6.0.2
      with:
        persist-credentials: false
    - uses: dtolnay/rust-toolchain@e97e2d8cc328f1b50210efc529dca0028893a2d9 # v1
      with:
        toolchain: stable
        components: clippy
    - run: cargo fmt -- --check
    - run: cargo fmt --manifest-path test_max_level_features/Cargo.toml -- --check
    - run: cargo clippy --verbose
    - run: cargo clippy --verbose --manifest-path test_max_level_features/Cargo.toml

  doc:
    name: Check Documentation
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@0c366fd6a839edf440554fa01a7085ccba70ac98 # v6.0.2
      with:
        persist-credentials: false
    - uses: dtolnay/rust-toolchain@e97e2d8cc328f1b50210efc529dca0028893a2d9 # v1
      with:
        toolchain: stable
    - name: Run rustdoc
      env:
        RUSTDOCFLAGS: "-D warnings"
      run: cargo doc --verbose --features std,kv,kv_std,kv_sval,kv_serde

  features:
    name: Feature check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@0c366fd6a839edf440554fa01a7085ccba70ac98 # v6.0.2
        with:
          persist-credentials: false
      - uses: dtolnay/rust-toolchain@e97e2d8cc328f1b50210efc529dca0028893a2d9 # v1
        with:
          toolchain: nightly
      - run: cargo build --verbose -Z avoid-dev-deps --features kv
      - run: cargo build --verbose -Z avoid-dev-deps --features "kv std"
      - run: cargo build --verbose -Z avoid-dev-deps --features "kv kv_sval"
      - run: cargo build --verbose -Z avoid-dev-deps --features "kv kv_serde"
      - run: cargo build --verbose -Z avoid-dev-deps --features "kv kv_std"
      - run: cargo build --verbose -Z avoid-dev-deps --features "kv kv_sval kv_serde"

  minimalv:
    name: Minimal versions
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@0c366fd6a839edf440554fa01a7085ccba70ac98 # v6.0.2
        with:
          persist-credentials: false
      - uses: dtolnay/rust-toolchain@e97e2d8cc328f1b50210efc529dca0028893a2d9 # v1
        with:
          toolchain: nightly
      - run: cargo build --verbose -Z minimal-versions --features kv
      - run: cargo build --verbose -Z minimal-versions --features "kv std"
      - run: cargo build --verbose -Z minimal-versions --features "kv kv_sval"
      - run: cargo build --verbose -Z minimal-versions --features "kv kv_serde"
      - run: cargo build --verbose -Z minimal-versions --features "kv kv_std"
      - run: cargo build --verbose -Z minimal-versions --features "kv kv_sval kv_serde"

  msrv:
    name: MSRV
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@0c366fd6a839edf440554fa01a7085ccba70ac98 # v6.0.2
        with:
          persist-credentials: false
      - uses: dtolnay/rust-toolchain@e97e2d8cc328f1b50210efc529dca0028893a2d9 # v1
        with:
          components: clippy
          toolchain: "1.71"
      - uses: taiki-e/install-action@0abfcd587b70a713fdaa7fb502c885e2112acb15 # v2.75.7
        with:
          tool: cargo-hack
      - run: cargo hack test --feature-powerset --exclude-features max_level_off,max_level_error,max_level_warn,max_level_info,max_level_debug,max_level_trace,release_max_le
```