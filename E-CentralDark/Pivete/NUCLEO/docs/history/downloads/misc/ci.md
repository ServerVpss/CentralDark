# OUTRO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cookie-0.18.1\.github\workflows\ci.yml
**SHA:** fc082274e11b6a98
**Timestamp:** 2026-08-28T02:33:27.739272
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: "cargo update && ./scripts/test.sh"
- run: cargo update -Z minimal-versions
- run: ./scripts/test.sh

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on: [push, pull_request]

env:
  CARGO_TERM_COLOR: always
  MSRV: "1.56"

jobs:
  test:
    name: "${{ matrix.os.name }} (${{ matrix.toolchain }})"
    continue-on-error: false
    runs-on: ${{ matrix.os.distro }}

    strategy:
      fail-fast: false
      matrix:
        os:
          - { name: Linux, distro: ubuntu-latest }
          - { name: Windows, distro: windows-latest }
        toolchain: [stable, beta, nightly]

    steps:
      - name: Checkout Sources
        uses: actions/checkout@v4

      - name: Install Rust
        uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{ matrix.toolchain }}

      - name: Run Tests
        run: "cargo update && ./scripts/test.sh"
        shell: bash

  msrv:
    name: Check MSRV
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Sources
        uses: actions/checkout@v4

      - name: Install Rust Nightly
        uses: dtolnay/rust-toolchain@nightly

      - name: Downgrade Dependencies to Minimal Versions
        run: cargo update -Z minimal-versions

      - name: Install MSRV (${{ env.MSRV }})
        uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{ env.MSRV }}

      - name: Run Tests
        run: ./scripts/test.sh

```

---

# OUTRO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\crc32fast-1.5.0\.github\workflows\ci.yml
**SHA:** 91dae73a4a05df74
**Timestamp:** 2026-08-28T02:33:31.225569
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: rustup update stable --no-self-update
- run: cargo test --no-fail-fast
- run: cargo test --no-fail-fast --release
- run: cargo check --no-default-features
- run: rustup update nightly
- run: cargo +nightly test --no-fail-fast
- run: cargo +nightly test --no-fail-fast --release
- run: cargo +nightly check --no-default-features
- run: cargo +nightly build --benches --all
- run: echo "version=$(grep '^rust-version' Cargo.toml | sed 's/rust-version = "\(.*\)"/\1/')" >> $GITHUB_OUTPUT

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  pull_request:
    branches:
      - master
  push:
    branches:
      - master

jobs:
  stable:
    name: stable
    strategy:
      matrix:
        os:
          - ubuntu-latest
          - macos-latest
          - windows-latest
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - name: Install Rust
        run: rustup update stable --no-self-update
      - name: Test in debug mode
        run: cargo test --no-fail-fast
      - name: Test in release mode
        run: cargo test --no-fail-fast --release
      - name: Check with no default features
        run: cargo check --no-default-features
  nightly:
    name: nightly
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Rust
        run: rustup update nightly
      - name: Test in debug mode
        run: cargo +nightly test --no-fail-fast
      - name: Test in release mode
        run: cargo +nightly test --no-fail-fast --release
      - name: Check with no default features
        run: cargo +nightly check --no-default-features
      - name: Build benches
        run: cargo +nightly build --benches --all
  msrv:
    name: msrv
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Get MSRV from Cargo.toml
        id: msrv
        run: echo "version=$(grep '^rust-version' Cargo.toml | sed 's/rust-version = "\(.*\)"/\1/')" >> $GITHUB_OUTPUT
      - name: Install Rust
        run: rustup update ${{ steps.msrv.outputs.version }} && rustup default ${{ steps.msrv.outputs.version }}
      - name: Test in debug mode
        run: cargo test --no-fail-fast
      - name: Test in release mode
        run: cargo test --no-fail-fast --release
      - name: Check with no default features
        run: cargo check --no-default-features
  asan:
    name: asan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Rust
        run: rustup update nightly --no-self-update
      - name: Run address sanitizer
        run: RUSTFLAGS="-Z sanitizer=address" cargo +nightly test --lib --target x86_64-unknown-linux-gnu
        env:
          ASAN_OPTIONS: "detect_odr_violation=0 detect_leaks=0"
          RUST_BACKTRACE: "1"
  cross-test:
    name: cross-test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        target:
          - i686-unknown-linux-gnu
          - aarch64-unknown-linux-gnu
    steps:
      - uses: actions/checkout@v4
      - name: Install Rust
        run: rustup update --no-self-update
      - name: Install Cross
        run: cargo install --force cross
      - name: Test
        run: cross test --target=${{ matrix.target }}
      - name: Check with no default features
        run: cross check --target=${{ matrix.target }} --no-default-features
  cross-check:
    name: cross-check
    runs-on: ubuntu-latest
    strategy:
      matrix:
        target:
          - wasm32-unknown-unknown
    steps:
      - uses: actions/checkout@v4
      - name: Install Rust
        run: rustup update --no-self-update
      - name: Add target
        run: rustup target add ${{ matrix.target }}
      - name: Check
        run: cargo check --target=${{ matrix.target }}
      - name: Check with no default features
        run: cargo check --target=${{ matrix.target }} --no-default-features
  cross-check-nightly-feature:
    name: cross-check-nightly-features
    runs-on: ubuntu-latest
    strategy:
      matrix:
        target:
          - aarch64-unknown-linux-gnu
    steps:
      - uses: actions/checkout@v4
      - name: Install Rust
        run: rustup update nightly --no-self-update && rustup default nightly
      - name: Add target
        run: rustup target add ${{ matrix.target }}
      - name: Check
        run: cargo check --target=${{ matrix.target }} --features=nightly
      - name: Check with no default features
        run: cargo check --target=${{ matrix.target }} --no-default-features --features=nightly

```

---

# OUTRO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\dirs-sys-0.5.0\.github\workflows\ci.yml
**SHA:** 905b81ce1ca8866f
**Timestamp:** 2026-08-28T02:34:02.791037
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: cargo build --verbose
- run: cargo test --verbose -- --nocapture

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  CARGO_TERM_COLOR: always
  CARGO_REGISTRIES_CRATES_IO_PROTOCOL: sparse
  RUST_BACKTRACE: full

jobs:
  build-and-test:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: cargo build --verbose
      - name: Test
        run: cargo test --verbose -- --nocapture

```

---

# OUTRO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\equivalent-1.0.2\.github\workflows\ci.yml
**SHA:** 90d216ed7331b2c4
**Timestamp:** 2026-08-28T02:34:06.428422
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: jq --exit-status 'all(.result == "success")' <<< '${{ toJson(needs) }}'

### Ouro Bruto (primeiros 5000 chars)
```
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  merge_group:

name: CI

env:
  CARGO_TERM_COLOR: always
  CARGO_INCREMENTAL: 0

jobs:
  tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - rust: 1.6.0 # MSRV
          - rust: stable
          - rust: beta
          - rust: nightly

    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{ matrix.rust }}
      - name: Tests
        run: |
          cargo build --verbose
          cargo test --verbose

  # One job that "summarizes" the success state of this pipeline. This can then be added to branch
  # protection, rather than having to add each job separately.
  success:
    name: Success
    runs-on: ubuntu-latest
    needs: [tests]
    # Github branch protection is exceedingly silly and treats "jobs skipped because a dependency
    # failed" as success. So we have to do some contortions to ensure the job fails if any of its
    # dependencies fails.
    if: always() # make sure this is never "skipped"
    steps:
      # Manually check the status of all dependencies. `if: failure()` does not work.
      - name: check if any dependency failed
        run: jq --exit-status 'all(.result == "success")' <<< '${{ toJson(needs) }}'

```

---

# OUTRO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\http-1.5.0\.github\workflows\ci.yml
**SHA:** 8aa9b141f338f8a1
**Timestamp:** 2026-08-28T02:34:16.725410
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: exit 0
- - run: cargo fmt --all --check
- run: cargo test
- run: cargo test --benches ${{ matrix.features }}
- run: cargo hack --remove-dev-deps update
- run: cargo update -p itoa --precise 1.0.15
- run: echo "msrv=$(yq '.package.rust-version' Cargo.toml)" >> $GITHUB_OUTPUT
- run: cargo check -p http
- run: cargo check --target wasm32-unknown-unknown
- - run: cargo minimal-versions check

### Ouro Bruto (primeiros 5000 chars)
```
name: CI
on:
  pull_request:
  push:
    branches:
      - master

env:
  RUST_BACKTRACE: 1

jobs:
  ci-pass:
    name: CI is green
    runs-on: ubuntu-latest
    needs:
      - style
      - test
      - msrv
      - wasm
      - minimal-versions
      - miri
      - semver
    steps:
      - run: exit 0

  style:
    name: Check Style
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt

      - run: cargo fmt --all --check

  test:
    name: Test ${{ matrix.rust }}
    #needs: [style]
    strategy:
      matrix:
        rust:
          - stable
          - beta
          - nightly

        include:
          - rust: nightly
            benches: true

    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Install Rust (${{ matrix.rust }})
        uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{ matrix.rust }}

      - name: Test
        run: cargo test

      - name: Test all benches
        if: matrix.benches
        run: cargo test --benches ${{ matrix.features }}

  msrv:
    name: Check MSRV
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - uses: dtolnay/rust-toolchain@stable

      - uses: taiki-e/install-action@cargo-hack

      - name: Remove dev-dependencies
        run: cargo hack --remove-dev-deps update

      - name: Pin deps
        run: cargo update -p itoa --precise 1.0.15

      - name: Get MSRV from package metadata
        id: metadata
        run: echo "msrv=$(yq '.package.rust-version' Cargo.toml)" >> $GITHUB_OUTPUT

      - name: Install Rust (${{ steps.metadata.outputs.msrv }})
        uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{ steps.metadata.outputs.msrv }}

      - name: Test
        run: cargo check -p http

  wasm:
    name: WASM
    #needs: [style]

    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: wasm32-unknown-unknown

      - name: Check
        run: cargo check --target wasm32-unknown-unknown

  minimal-versions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/rust-toolchain@stable
      - uses: taiki-e/install-action@cargo-hack
      - uses: taiki-e/install-action@cargo-minimal-versions
      - run: cargo minimal-versions check

  miri:
    name: Miri
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Install Rust
        uses: dtolnay/rust-toolchain@nightly
        with:
          components: miri

      - name: Test
        run: MIRIFLAGS="-Zmiri-disable-isolation -Zmiri-ignore-leaks" cargo miri test

  semver:
    name: semver
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - name: Check semver
        uses: obi1kenobi/cargo-semver-checks-action@v2
        with:
          release-type: minor

```

---

# OUTRO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\indexmap-1.9.3\.github\workflows\ci.yml
**SHA:** 3412a9d9f6b548ee
**Timestamp:** 2026-08-28T02:34:29.791843
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: cargo test -v --benches
- run: |
- - run: cargo clippy
- - run: cargo miri test

### Ouro Bruto (primeiros 5000 chars)
```
on:
  push:
    branches: [ master, indexmap-1.x ]
  pull_request:
    branches: [ master, indexmap-1.x ]

name: Continuous integration

env:
  CARGO_TERM_COLOR: always
  CARGO_INCREMENTAL: 0

jobs:
  tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - rust: 1.56.0 # MSRV
            features:
          - rust: stable
            features: arbitrary
          - rust: stable
            features: quickcheck
          - rust: stable
            features: rayon
          - rust: stable
            features: rustc-rayon
          - rust: stable
            features: serde
          - rust: stable
            features: std
          - rust: beta
            features:
          - rust: nightly
            bench: test build benchmarks
          - rust: nightly
            features: test_low_transition_point

    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: ${{ matrix.rust }}
          override: true
      - name: Tests
        run: |
          cargo build --verbose --features "${{ matrix.features }}"
          cargo doc --verbose --features "${{ matrix.features }}"
          cargo test --verbose --features "${{ matrix.features }}"
          cargo test --release --verbose --features "${{ matrix.features }}"
      - name: Tests (serde)
        if: matrix.features == 'serde'
        run: |
          cargo test --verbose -p test-serde
      - name: Test run benchmarks
        if: matrix.bench != ''
        run: cargo test -v --benches

  nostd_build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - rust: 1.56.0
            target: thumbv6m-none-eabi
          - rust: stable
            target: thumbv6m-none-eabi

    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: ${{ matrix.rust }}
          override: true
          target: ${{ matrix.target }}
      - name: Tests
        run: |
          cargo build -vv --target=${{ matrix.target }}
          cargo build -v -p test-nostd --target=${{ matrix.target }}

  clippy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        rust:
          - beta
    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: ${{ matrix.rust }}
          override: true
          components: clippy
      - run: cargo clippy

  miri:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        rust:
          - nightly
    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: ${{ matrix.rust }}
          override: true
          components: miri
      - run: cargo miri test

```

---

# OUTRO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\indexmap-2.14.0\.github\workflows\ci.yml
**SHA:** f3271ea1cd81e367
**Timestamp:** 2026-08-28T02:34:30.167361
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: cargo test -v --benches
- run: |
- - run: cargo clippy --all-features
- - run: cargo miri nextest run
- - run: cargo miri test --doc
- run: cargo +nightly hack generate-lockfile --remove-dev-deps -Z direct-minimal-versions
- run: cargo +nightly build --verbose --all-features

### Ouro Bruto (primeiros 5000 chars)
```
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  merge_group:

name: CI

env:
  CARGO_TERM_COLOR: always
  CARGO_INCREMENTAL: 0

jobs:
  tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - rust: 1.85.0 # MSRV
            features:
          - rust: stable
            features: arbitrary
          - rust: stable
            features: quickcheck
          - rust: stable
            features: rayon
          - rust: stable
            features: serde
          - rust: stable
            features: sval
          - rust: stable
            features: borsh
          - rust: stable
            features: std
          - rust: beta
            features:
          - rust: nightly
            bench: test build benchmarks

    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{ matrix.rust }}
      - name: Tests
        run: |
          cargo build --verbose --features "${{ matrix.features }}"
          cargo doc --verbose --features "${{ matrix.features }}"
          cargo test --verbose --features "${{ matrix.features }}"
          cargo test --release --verbose --features "${{ matrix.features }}"
      - name: Tests (serde)
        if: matrix.features == 'serde'
        run: |
          cargo test --verbose -p test-serde
      - name: Tests (sval)
        if: matrix.features == 'sval'
        run: |
          cargo test --verbose -p test-sval
      - name: Test run benchmarks
        if: matrix.bench != ''
        run: cargo test -v --benches

  nostd_build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - rust: 1.85.0
            target: thumbv6m-none-eabi
          - rust: stable
            target: thumbv6m-none-eabi

    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{ matrix.rust }}
          target: ${{ matrix.target }}
      - name: Tests
        run: |
          cargo build -vv --target=${{ matrix.target }} --no-default-features
          cargo build -v -p test-nostd --target=${{ matrix.target }}

  clippy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@beta
        with:
          components: clippy
      - run: cargo clippy --all-features

  miri:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@nightly
        with:
          components: miri, rust-src
      - uses: taiki-e/install-action@v2
        with:
          tool: cargo-nextest
        if: github.event_name == 'merge_group'
      - run: cargo miri nextest run
        if: github.event_name == 'merge_group'
      - run: cargo miri test --doc

  minimal-versions:
    name: Check MSRV and minimal-versions
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@nightly
      - uses: dtolnay/rust-toolchain@1.85.0 # MSRV
      - uses: taiki-e/install-action@v2
        with:
          tool: cargo-hack
      - name: Lock minimal direct dependencies
        run: cargo +nightly hack generate-lockfile --remove-dev-deps -Z direct-minimal-versions
      - name: Build (nightly)
        run: cargo +nightly build --verbose --all-features
      - name: Build (MSRV)
        run: cargo build --verbose --features arbitrary,quickcheck,serde,sval,rayon

  # One job that "summarizes" the success state of this pipeline. This can then be added to branch
  # protection, rather than having to add each job separately.
  success:
    name: Success
    runs-on: ubuntu-latest
    needs: [tests, nostd_build, clippy, miri, minimal-versions]
    # Github branch protection is exceedingly silly and treats "jobs skipped because a dependency
    # failed" as success. So we have to do some contortions to ensure the job fails if any of its
    # dependencies fails.
    if: always() # make sure this is never "skipped"
    steps:
      # Manually check the status of all dependencies. `if: failure()` does not work.
      - name: check if any dependency failed
        run: jq --exit-status 'all(.result == "success")' <<< '${{ toJson(needs) }}'

```

---

# OUTRO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\keyboard-types-0.7.0\.github\workflows\ci.yml
**SHA:** 8b3b4ec302c7afcf
**Timestamp:** 2026-08-28T02:34:32.985709
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: cargo check --all-targets
- - run: cargo test
- - run: cargo check --all-targets --no-default-features
- - run: cargo test --no-default-features
- - run: cargo clippy --all-targets -- -D warnings
- - run: cargo fmt --check

### Ouro Bruto (primeiros 5000 chars)
```
on: [push, pull_request]

name: Continuous integration

jobs:
  check-test:
    name: Check and test crate
    runs-on: ubuntu-latest
    strategy:
      matrix:
        toolchain:
          - stable
          - "1.60"
    steps:
      - uses: actions/checkout@v3
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{ matrix.toolchain }}
      # Default features
      - run: cargo check --all-targets
      - run: cargo test
      # No default features
      - run: cargo check --all-targets --no-default-features
      - run: cargo test --no-default-features

  clippy-fmt:
    name: Run Clippy and format code
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: clippy, rustfmt
      - run: cargo clippy --all-targets -- -D warnings
      - run: cargo fmt --check

```

---

# OUTRO - ci.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\once_cell-1.21.4\.github\workflows\ci.yaml
**SHA:** b1c9b12babf51fca
**Timestamp:** 2026-08-28T02:34:53.465892
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: cargo run -p xtask -- ci

### Ouro Bruto (primeiros 5000 chars)
```
name: CI
on:
  pull_request:
  push:
    branches: ["master", "staging", "trying"]

env:
  CARGO_INCREMENTAL: 0
  CARGO_NET_RETRY: 10
  CI: 1
  RUST_BACKTRACE: short
  RUSTFLAGS: -D warnings
  RUSTUP_MAX_RETRIES: 10

jobs:
  test:
    name: Rust
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
      with:
        fetch-depth: 0 # fetch tags for publish
    - uses: Swatinem/rust-cache@359a70e43a0bb8a13953b04a90f76428b4959bb6
    - run: cargo run -p xtask -- ci
      env:
        CARGO_REGISTRY_TOKEN: ${{ secrets.CRATES_IO_TOKEN }}
        MIRIFLAGS: -Zmiri-strict-provenance

```

---

# OUTRO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\raw-window-handle-0.6.2\.github\workflows\ci.yml
**SHA:** f948bb1c5c525b0e
**Timestamp:** 2026-08-28T02:35:02.703955
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: cargo fmt --all -- --check
- run: typos
- - run: rustup target add wasm32-unknown-unknown
- run: |
- run: cargo doc --no-deps --document-private-items
- run: cargo hack test --feature-powerset
- run: cargo hack check --target wasm32-unknown-unknown --feature-powerset

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  pull_request:
  push:
    branches: [master]

env:
  RUST_BACKTRACE: 1
  CARGO_INCREMENTAL: 0
  RUSTFLAGS: "-Cdebuginfo=0 --deny=warnings"
  RUSTDOCFLAGS: "--deny=warnings"

jobs:
  fmt:
    name: Tidy Code
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: hecrj/setup-rust-action@v1
        with:
          rust-version: stable
          components: rustfmt
      - uses: taiki-e/install-action@v2
        with:
          tool: typos-cli
      - name: Check Formatting
        run: cargo fmt --all -- --check
      - name: Run Typos
        run: typos

  tests:
    name: Tests
    needs: fmt
    # `raw-window-handle` only has `cfg` guards for Android, so we just run Ubuntu
    # and manually test Android
    runs-on: ubuntu-latest
    strategy:
      matrix:
        rust_version: ["1.64", stable, nightly]

    steps:
      - uses: actions/checkout@v2

      - uses: hecrj/setup-rust-action@v1
        with:
          rust-version: ${{ matrix.rust_version }}
      - run: rustup target add wasm32-unknown-unknown

      - name: Pin deps that break MSRV
        if: matrix.rust_version == '1.64'
        run: |
          cargo update -p bumpalo --precise 3.14.0

      - name: Check documentation
        run: cargo doc --no-deps --document-private-items

      - uses: taiki-e/install-action@cargo-hack

      - name: Run tests
        run: cargo hack test --feature-powerset

      - name: Run tests for wasm32-unknown-unknown
        run: cargo hack check --target wasm32-unknown-unknown --feature-powerset

```

---

# OUTRO - ci.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\scopeguard-1.2.0\.github\workflows\ci.yaml
**SHA:** 6c1ab92eb3ea22bf
**Timestamp:** 2026-08-28T02:35:26.035919
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: cargo build
- run: cargo test
- run: cargo test --no-default-features
- run: |
- run: cargo fmt -- --check

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  - push
  - pull_request

env:
  CARGO_TERM_COLOR: always

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        rust:
          - stable
          - beta
          - nightly
          - 1.20.0 # MSRV
    steps:
      - uses: actions/checkout@v2
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: ${{ matrix.rust }}
          override: true
      - name: Build
        run: cargo build
      - name: Run tests
        run: cargo test
      - name: Run tests (without default features)
        run: cargo test --no-default-features

  no_std:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Test no_std support
        run: |
          rustup target add thumbv6m-none-eabi
          cargo build --no-default-features --target thumbv6m-none-eabi

  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check formatting
        run: cargo fmt -- --check

```

---

# OUTRO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\softbuffer-0.4.8\.github\workflows\ci.yml
**SHA:** ecd55f21143109f8
**Timestamp:** 2026-08-28T02:35:44.440981
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: cargo +stable fmt --all -- --check
- run: cargo fmt --all -- --check
- run: typos
- run: RUSTC_BOOTSTRAP=1 cargo -Zminimal-versions generate-lockfile
- run: cargo check --verbose --target ${{ matrix.target }} ${{ matrix.features && '--no-default-features --features' }} ${{ matrix.features }}
- run: sudo apt-get update && sudo apt-get install libwayland-dev
- run: sudo apt-get install gcc-multilib
- run: cargo $CMD build --verbose --target ${{ matrix.platform.target }} $OPTIONS --features $FEATURES
- run: cargo $CMD test --no-run --verbose --target ${{ matrix.platform.target }} $OPTIONS --features $FEATURES
- run: cargo $CMD test --verbose --target ${{ matrix.platform.target }} $OPTIONS --features $FEATURES

### Gaps
- # TODO: wait for https://github.com/microsoft/windows-rs/issues/2614#issuecomment-1684152597
- # TODO: We should also be using Wayland for testing here.

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  pull_request:
  push:
    branches: [master]

jobs:
  fmt:
    name: Tidy Code
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v6
    - uses: hecrj/setup-rust-action@v2
      with:
        rust-version: stable
        components: rustfmt
    - name: Check Formatting
      run: cargo +stable fmt --all -- --check
    - uses: taiki-e/install-action@v2
      with:
        tool: typos-cli
    - name: Check Formatting
      run: cargo fmt --all -- --check
    - name: Run Typos
      run: typos

  msrv:
    name: MSRV
    needs: fmt
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        include:
        # Android
        - target: aarch64-linux-android

        # CoreGraphics
        - target: aarch64-apple-darwin
        - target: x86_64-apple-ios

        # Orbital (doesn't follow MSRV)
        # - target: x86_64-unknown-redox

        # Wayland, KMS/DRM, X11
        - target: i686-unknown-linux-gnu
        - target: x86_64-unknown-linux-gnu
        - target: x86_64-unknown-linux-gnu
          features: "x11,x11-dlopen"
        - target: x86_64-unknown-linux-gnu
          features: "wayland,wayland-dlopen"
        - target: x86_64-unknown-linux-gnu
          features: "kms"
        - target: x86_64-unknown-freebsd
        - target: x86_64-unknown-netbsd
          features: "x11,x11-dlopen,wayland,wayland-dlopen"

        # Web
        - target: wasm32-unknown-unknown

        # Win32
        - target: x86_64-pc-windows-msvc
        - target: x86_64-pc-windows-gnu

    steps:
    - uses: actions/checkout@v6
    - uses: hecrj/setup-rust-action@v2
      with:
        rust-version: '1.71.1'
        targets: ${{ matrix.target }}

    - name: Use minimal dependency versions
      # By downgrading all our dependency versions, we ensure that our minimum
      # version bounds are actually adequate (i.e. users can build `softbuffer`
      # with minimal versions themselves) and opt-out of any unexpected MSRV
      # bumps in semver-compatible releases of downstream crates.
      #
      # RUSTC_BOOTSTRAP=1 is kind of a hack, but it's cumbersome and slow to
      # install the nightly toolchain.
      run: RUSTC_BOOTSTRAP=1 cargo -Zminimal-versions generate-lockfile

    - name: Check that crate compiles
      run: cargo check --verbose --target ${{ matrix.target }} ${{ matrix.features && '--no-default-features --features' }} ${{ matrix.features }}

  tests:
    name: Tests
    needs: fmt
    strategy:
      fail-fast: false
      matrix:
        rust_version: [stable, nightly]
        platform:
          - { target: x86_64-pc-windows-msvc,   os: windows-latest,  }
          - { target: i686-pc-windows-msvc,     os: windows-latest,  }
          # TODO: wait for https://github.com/microsoft/windows-rs/issues/2614#issuecomment-1684152597
          #       to be resolved before re-enabling these
          # - { target: x86_64-pc-windows-gnu,    os: windows-latest, host: -x86_64-pc-windows-gnu }
          # - { target: i686-pc-windows-gnu,      os: windows-latest, host: -i686-pc-windows-gnu }
          - { target: i686-unknown-linux-gnu,   os: ubuntu-latest,   }
          - { target: x86_64-unknown-linux-gnu, os: ubuntu-latest,   }
          - { target: x86_64-unknown-linux-gnu, os: ubuntu-latest, options: --no-default-features, features: "x11,x11-dlopen" }
          - { target: x86_64-unknown-linux-gnu, os: ubuntu-latest, options: --no-default-features, features: "wayland,wayland-dlopen" }
          - { target: x86_64-unknown-linux-gnu, os: ubuntu-latest, options: --no-default-features, features: "kms" }
          - { target: x86_64-unknown-redox,     os: ubuntu-latest,   }
          - { target: x86_64-unknown-freebsd,   os: ubuntu-latest,   }
          - { target: x86_64-unknown-netbsd,    os: ubuntu-latest, options: --no-default-features, features: "x11,x11-dlopen,wayland,wayland-dlopen"  }
          - { target: aarch64-apple-darwin,     os: macos-latest,    }
          - { target: wasm32-unknown-unknown,   os: ubuntu-latest,   }
        include:
          - rust_version: nightly
            platform: { target: wasm32-unknown-unknown, os: ubuntu-latest, options: "-Zbuild-std=panic_abort,std", rustflags: "-Ctarget-feature=+atomics,+bulk-memory" }
          # Mac Catalyst is only Tier 2 since Rust 1.81
          - rust_version: 'nightly'
            platform: { target: aarch64-apple-ios-macabi, os: macos-latest }

    env:
      RUST_BACKTRACE: 1
      CARGO_INCREMENTAL: 0
      RUSTFLAGS: "-C debuginfo=0 --deny warnings ${{ matrix.platform.rustflags }}"
      # Disable doc tests on Rust 1.83, since some path handling regressed there.
      # This has been fixed in Rust 1.84 beta.
      # https://github.com/rust-lang/rust/issues/132203
      OPTIONS: ${{ matrix.platform.options }} ${{ matrix.rust_version == 'stable' && '--lib' || '' }}
      FEATURES: ${{ format(',{0}', matrix.platform.features ) }}
      CMD: ${{ matrix.platform.cmd }}
      RUSTDOCFLAGS: -Dw
```

---

# OUTRO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\string_cache-0.9.0\.github\workflows\ci.yml
**SHA:** 1455424ec6b0a00c
**Timestamp:** 2026-08-28T02:35:45.280890
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: exit 0
- run: exit 1

### Ouro Bruto (primeiros 5000 chars)
```
name: CI
on:
  push:
    branches: ["main"]
  pull_request:
  merge_group:
    types: [checks_requested]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

env:
  RUST_BACKTRACE: 1
  SHELL: /bin/bash

jobs:
  ci:
    name: Build and Test
    runs-on: ubuntu-latest

    strategy:
      matrix:
        rust: [1.70.0, nightly, beta, stable]

    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 2
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: ${{ matrix.rust }}
          default: true
          override: true
      - name: Build
        run: |
          cargo build --no-default-features
          cargo build
          cargo build --features malloc_size_of
      - uses: actions-rs/cargo@v1
        with:
          command: test
          args: --all
      - name: Build codegen
        run: |
          cd string-cache-codegen && cargo build && cd ..

          if [ ${{ matrix.rust }} = nightly ]; then
            cd integration-tests && cargo test --features unstable && cd ..;
          fi


  build_result:
    name: Result
    runs-on: ubuntu-latest
    needs:
      - "ci"

    steps:
      - name: Mark the job as successful
        run: exit 0
        if: success()
      - name: Mark the job as unsuccessful
        run: exit 1
        if: "!success()"

```

---

# OUTRO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-winres-0.3.6\.github\workflows\ci.yml
**SHA:** 2290db49ca8ac2f8
**Timestamp:** 2026-08-28T02:36:01.275511
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: cargo build
- run: |
- run: cargo fmt --all -- --check
- run: cargo clippy

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  workflow_dispatch:
  pull_request:
  push:

jobs:
  rust:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4

      - uses: dtolnay/rust-toolchain@1.76

      - name: Build
        run: cargo build

      - name: Build example
        run: |
          cd example
          cargo build

      - uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt, clippy

      - name: Format
        run: cargo fmt --all -- --check

      - name: Lints
        run: cargo clippy

```

---

# OUTRO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\urlpattern-0.3.0\.github\workflows\ci.yml
**SHA:** 34d15c6bf641ddce
**Timestamp:** 2026-08-28T02:36:33.503048
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: rustfmt --check src/lib.rs
- run: cargo build --release --all-targets --all-features
- run: cargo test --release --all-targets --all-features
- run: cargo clippy --all-targets --all-features --release -- -D clippy::all
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on: [push, pull_request]

env:
  CARGO_TERM_COLOR: always

jobs:
  test:
    name: test
    runs-on: ubuntu-20.04-xl
    timeout-minutes: 30

    steps:
      - name: Checkout repo
        uses: actions/checkout@v2

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          rust-version: 1.60.0
          components: clippy,rustfmt

      - name: Format
        run: rustfmt --check src/lib.rs

      - name: Build
        run: cargo build --release --all-targets --all-features

      - name: Test
        run: cargo test --release --all-targets --all-features

      - name: Lint
        run: cargo clippy --all-targets --all-features --release -- -D clippy::all

      - name: Publish
        if: |
          github.repository == 'denoland/rust-urlpattern' &&
          startsWith(github.ref, 'refs/tags/')
        env:
          CARGO_REGISTRY_TOKEN: ${{ secrets.CARGO_REGISTRY_TOKEN }}
        run: |
          cargo publish -vv

```

---

# OUTRO - ci.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winreg-0.55.0\.github\workflows\ci.yaml
**SHA:** 4d3557b5cccd59d5
**Timestamp:** 2026-08-28T02:37:41.474545
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: taplo fmt --check --diff

### Ouro Bruto (primeiros 5000 chars)
```
name: CI
on:
  - push
  - pull_request
  - workflow_dispatch
jobs:
  tests:
    name: CI
    runs-on: windows-latest
    strategy:
      fail-fast: false
      matrix:
        channel: [stable]
        target:
          - x86_64-pc-windows-msvc
          - x86_64-pc-windows-gnu
          - i686-pc-windows-msvc
          - i686-pc-windows-gnu
        include:
          - channel: stable
            target: x86_64-pc-windows-msvc
            lint: true
          - channel: '1.60'
            target: x86_64-pc-windows-msvc
            restrict_deps_versions: true
    env:
      RUST_BACKTRACE: full
    steps:
      - uses: actions/checkout@v4
      - name: Install rust-${{ matrix.channel }}
        uses: actions-rs/toolchain@v1
        with:
          toolchain: ${{ matrix.channel }}
          profile: minimal
          override: true
      - name: Cache cargo registry
        uses: actions/cache@v4
        continue-on-error: true
        with:
          path: |
            ~/.cargo/registry/index/
            ~/.cargo/registry/cache/
          key: ${{ runner.os }}-cargo-${{ matrix.channel }}
          restore-keys: |
            ${{ runner.os }}-cargo-${{ matrix.channel }}
      - name: Create Cargo.lock
        uses: actions-rs/cargo@v1
        with:
          command: generate-lockfile
      - name: Restrict serde version
        if: matrix.restrict_deps_versions
        uses: actions-rs/cargo@v1
        with:
          command: update
          args: --package serde --precise 1.0.210
      - name: Restrict syn version
        if: matrix.restrict_deps_versions
        uses: actions-rs/cargo@v1
        with:
          command: update
          args: --package syn --precise 2.0.67
      - name: Restrict chrono version
        if: matrix.restrict_deps_versions
        uses: actions-rs/cargo@v1
        with:
          command: update
          args: --package chrono --precise 0.4.31
      - name: Restrict libc version
        if: matrix.restrict_deps_versions
        uses: actions-rs/cargo@v1
        with:
          command: update
          args: --package libc --precise 0.2.163
      - name: Restrict memchr version
        if: matrix.restrict_deps_versions
        uses: actions-rs/cargo@v1
        with:
          command: update
          args: --package memchr --precise 2.6.2
      - name: Setup Taplo
        if: matrix.lint
        uses: uncenter/setup-taplo@v1
        with:
          version: "0.8.1"
      - name: Check Cargo.toml formatting
        if: matrix.lint
        run: taplo fmt --check --diff
      - name: Check sourcecode formatting
        if: matrix.lint
        uses: actions-rs/cargo@v1
        with:
          command: fmt
          args: --all -- --check
      - name: Lint
        if: matrix.lint
        uses: actions-rs/cargo@v1
        with:
          command: clippy
          args: --all-features --all-targets
      - name: Run tests (no features)
        uses: actions-rs/cargo@v1
        with:
          command: test
          args: --locked --release --no-fail-fast --no-default-features
      - name: Run tests (all features)
        uses: actions-rs/cargo@v1
        with:
          command: test
          args: --locked --release --no-fail-fast --all-features

```

---

# OUTRO - ci.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\marketplace-cache\94f2c10e177b3171\.github\workflows\ci.yml
**SHA:** 9c5dbeca4a78bb33
**Timestamp:** 2026-08-28T02:53:55.668138
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: pip install debugpy
- run: go test -v -timeout 300s ./...
- run: make build

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  pull_request:
  push:
    branches: [master]
    paths:
      - '**.go'
      - 'go.mod'
      - 'go.sum'

jobs:
  lint:
    name: Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version-file: go.mod

      - name: Check formatting
        run: |
          unformatted=$(gofmt -l .)
          if [ -n "$unformatted" ]; then
            echo "The following files are not formatted:"
            echo "$unformatted"
            exit 1
          fi

      - name: Lint
        uses: golangci/golangci-lint-action@v7
        with:
          version: v2.11.1

  test:
    name: Test (${{ matrix.os }})
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version-file: go.mod

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install debugpy
        run: pip install debugpy

      - name: Unit & E2E tests
        run: go test -v -timeout 300s ./...

      - name: Build
        run: make build

```

---

# OUTRO - ci.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\.github\workflows\ci.yaml
**SHA:** f306848e01496735
**Timestamp:** 2026-08-28T02:56:10.227813
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: pnpm run typecheck
- run: pnpm run lint
- run: pnpm run test
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: CI/CD

on:
  push:
    branches:
      - main
  pull_request:

# Cancel in-progress runs on the same branch/PR
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup and Build
        uses: ./.github/actions/setup-and-build

      - name: Cache TypeScript compilation
        uses: actions/cache@v5
        with:
          path: |
            .tsbuildinfo
            node_modules/.cache
          key: ${{ runner.os }}-typescript-${{ hashFiles('**/tsconfig.json', 'app/**/*.ts', 'app/**/*.tsx') }}
          restore-keys: |
            ${{ runner.os }}-typescript-

      - name: Run type check
        run: pnpm run typecheck

      - name: Cache ESLint
        uses: actions/cache@v5
        with:
          path: node_modules/.cache/eslint
          key: ${{ runner.os }}-eslint-${{ hashFiles('.eslintrc*', 'app/**/*.ts', 'app/**/*.tsx') }}
          restore-keys: |
            ${{ runner.os }}-eslint-

      - name: Run ESLint
        run: pnpm run lint

      - name: Run tests
        run: pnpm run test

      - name: Upload test coverage
        uses: actions/upload-artifact@v7
        if: always()
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7

  docker-validation:
    name: Docker Build Validation
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v4

      - name: Validate Docker production build
        run: |
          echo "🐳 Testing Docker production target..."
          docker build --target bolt-ai-production . --no-cache --progress=plain
          echo "✅ Production target builds successfully"

      - name: Validate Docker development build
        run: |
          echo "🐳 Testing Docker development target..."
          docker build --target development . --no-cache --progress=plain
          echo "✅ Development target builds successfully"

      - name: Validate docker-compose configuration
        run: |
          echo "🐳 Validating docker-compose configuration..."
          docker compose config --quiet
          echo "✅ docker-compose configuration is valid"

```