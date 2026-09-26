# OUTRO - rust.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\bit-set-0.8.0\.github\workflows\rust.yml
**SHA:** eb99f7eac4bf67c1
**Timestamp:** 2026-08-28T02:32:52.726975
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: cargo build --verbose
- run: cargo test --verbose
- run: cargo test --features serde --verbose
- run: |
- run: MIRIFLAGS=-Zmiri-strict-provenance cargo miri test
- run: MIRIFLAGS=-Zmiri-strict-provenance cargo miri test --features serde

### Ouro Bruto (primeiros 5000 chars)
```
name: Rust

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

env:
  CARGO_TERM_COLOR: always

jobs: 
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Build
      run: cargo build --verbose
    - name: Run tests
      run: cargo test --verbose
    - name: Run tests for serde feature
      run: cargo test --features serde --verbose
      
  miri:
    name: "Miri"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Miri
        run: |
          rustup toolchain install nightly --component miri
          rustup override set nightly
          cargo miri setup
      - name: Test with Miri
        run: MIRIFLAGS=-Zmiri-strict-provenance cargo miri test
      - name: Run tests for serde feature
        run: MIRIFLAGS=-Zmiri-strict-provenance cargo miri test --features serde
  
  fmt:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          profile: minimal
          components: rustfmt
          override: true
      - uses: actions-rs/cargo@v1
        with:
          command: fmt
          args: --all -- --check
          
          
  clippy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
            toolchain: stable
            profile: minimal
            components: clippy
            override: true
      - uses: actions-rs/clippy-check@v1
        env:
          PWD: ${{ env.GITHUB_WORKSPACE }}
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          args: --workspace --tests --examples
          
          
  docs:
    runs-on: ubuntu-latest
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          profile: minimal
          components: rust-docs
          override: true
      - uses: swatinem/rust-cache@v1
      - uses: actions-rs/cargo@v1
        with:
          command: doc
          args: --workspace --no-deps

```

---

# OUTRO - rust.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\bit-vec-0.8.0\.github\workflows\rust.yml
**SHA:** a018e42775dffa86
**Timestamp:** 2026-08-28T02:32:53.332728
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: cargo build --verbose
- run: cargo test --verbose
- run: cargo test --tests --verbose
- run: |
- run: MIRIFLAGS=-Zmiri-strict-provenance cargo miri test

### Ouro Bruto (primeiros 5000 chars)
```
name: Rust

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

env:
  CARGO_TERM_COLOR: always

jobs: 
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Build
      run: cargo build --verbose
    - name: Run tests
      run: cargo test --verbose
    - name: Run tests (gecko-ffi)
      run: cargo test --tests --verbose
      
  miri:
    name: "Miri"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Miri
        run: |
          rustup toolchain install nightly --component miri
          rustup override set nightly
          cargo miri setup
      - name: Test with Miri
        run: MIRIFLAGS=-Zmiri-strict-provenance cargo miri test
  
  fmt:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          profile: minimal
          components: rustfmt
          override: true
      - uses: actions-rs/cargo@v1
        with:
          command: fmt
          args: --all -- --check
          
          
  clippy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
            toolchain: stable
            profile: minimal
            components: clippy
            override: true
      - uses: actions-rs/clippy-check@v1
        env:
          PWD: ${{ env.GITHUB_WORKSPACE }}
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          args: --workspace --tests --examples
          
          
  docs:
    runs-on: ubuntu-latest
    env:
      RUSTDOCFLAGS: -Dwarnings
    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          profile: minimal
          components: rust-docs
          override: true
      - uses: swatinem/rust-cache@v1
      - uses: actions-rs/cargo@v1
        with:
          command: doc
          args: --workspace --no-deps

```

---

# OUTRO - rust.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\dirs-6.0.0\.github\workflows\rust.yml
**SHA:** d6c05c80a75420c1
**Timestamp:** 2026-08-28T02:34:02.455092
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: cargo build --verbose
- run: cargo test --verbose -- --nocapture

### Ouro Bruto (primeiros 5000 chars)
```
name: Rust

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

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

# OUTRO - rust.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\glob-0.3.4\.github\workflows\rust.yml
**SHA:** e67b8a0e9bf20a6f
**Timestamp:** 2026-08-28T02:34:11.945910
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: rustup default ${{ matrix.channel }} && rustup update --no-self-update
- - run: cargo test --all
- run: |
- - run: cargo clippy --all -- -Aclippy::while_let_loop
- - run: |
- run: rustup update "$MSRV" --no-self-update && rustup default "$MSRV"
- - run: cargo build -p glob
- run: |
- - run: cargo fmt -- --check
- run: jq --exit-status 'all(.result == "success")' <<< '${{ toJson(needs) }}'

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

env:
  CARGO_TERM_VERBOSE: true
  RUSTDOCFLAGS: -Dwarnings
  RUSTFLAGS: -Dwarnings

on:
  pull_request:
  push:
    branches:
      - master

jobs:
  test:
    name: Tests
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        channel:
          - stable
          - nightly
          - 1.85.0 # MSRV of test dependencies
        os:
          - macos-26
          - macos-26-intel
          - windows-2025
          - ubuntu-26.04
        include:
          - channel: beta
            os: ubuntu-26.04

    steps:
    - name: Checkout repository
      uses: actions/checkout@v7
    - run: rustup default ${{ matrix.channel }} && rustup update --no-self-update
    - run: cargo test --all

  clippy:
    name: Clippy
    runs-on: ubuntu-26.04
    steps:
    - name: Checkout repository
      uses: actions/checkout@v7

    - name: Update rust
      run: |
        # use beta since it gives us near-latest fixes but isn't as volatile as nightly
        rustup default beta
        rustup component add clippy
        rustup update --no-self-update
    - run: cargo clippy --all -- -Aclippy::while_let_loop

  msrv:
    name: Check building with the MSRV
    runs-on: ubuntu-26.04
    env:
      RUSTFLAGS: "" # No need to check warnings on old MSRV, clear `-Dwarnings`
    steps:
    - name: Checkout repository
      uses: actions/checkout@v7
    - run: |
        msrv="$(
          cargo metadata --format-version 1 |
          jq -r --arg CRATE_NAME glob '.packages | map(select((.name == $CRATE_NAME) and (.id | startswith("path+file")))) | first | .rust_version'
        )"
        echo "MSRV: $msrv"
        echo "MSRV=$msrv" >> "$GITHUB_ENV"
    - name: Install Rust
      run: rustup update "$MSRV" --no-self-update && rustup default "$MSRV"
    - run: cargo build -p glob

  rustfmt:
    name: Rustfmt
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master
    - name: Install Rust
      run: |
        rustup default nightly
        rustup update --no-self-update
        rustup component add rustfmt
    - run: cargo fmt -- --check

  success:
    needs:
      - test
      - clippy
      - msrv
      - rustfmt
    runs-on: ubuntu-latest
    # GitHub branch protection is exceedingly silly and treats "jobs skipped because a dependency
    # failed" as success. So we have to do some contortions to ensure the job fails if any of its
    # dependencies fails.
    if: always() # make sure this is never "skipped"
    steps:
      # Manually check the status of all dependencies. `if: failure()` does not work.
      - name: check if any dependency failed
        run: jq --exit-status 'all(.result == "success")' <<< '${{ toJson(needs) }}'

```

---

# OUTRO - rust.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\hex-0.4.3\.github\workflows\rust.yml
**SHA:** ee65195fe2a52ffe
**Timestamp:** 2026-08-28T02:34:15.284408
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: cargo build --verbose
- run: cargo test --verbose
- run: cargo test --verbose --no-default-features
- run: cargo test --verbose --features serde
- run: cargo bench --all -- --test

### Ouro Bruto (primeiros 5000 chars)
```
name: Test hex
on: [push, pull_request]

env:
  RUST_BACKTRACE: '1'
  RUSTFLAGS: -D warnings

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      # We want the tests to run on all configurations, even if jobs (like on nightly), fail.
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        rust: [stable, beta, nightly]

    steps:
      - uses: actions/checkout@v2
      - uses: hecrj/setup-rust-action@v1
        with:
          rust-version: ${{ matrix.rust }}
      - name: Build
        run: cargo build --verbose
      - name: Run tests
        run: cargo test --verbose
      - name: Run tests [no-default-features]
        run: cargo test --verbose --no-default-features
      - name: Run tests [serde]
        run: cargo test --verbose --features serde
      - name: Validate benches still work
        run: cargo bench --all -- --test

```

---

# OUTRO - rust.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\parking_lot-0.12.5\.github\workflows\rust.yml
**SHA:** 62879e9e9d2ed458
**Timestamp:** 2026-08-28T02:34:54.199503
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: rustup default ${{ matrix.channel }}
- - run: cargo build --all
- - run: cargo test --all
- - run: cargo build --all --features ${{ matrix.feature }}
- - run: cargo test --all --features ${{ matrix.feature }}
- - run: cargo install cargo-msrv
- - run: cargo msrv --workspace verify
- - run: rustup default nightly
- - run: rustup target add ${{ matrix.target }}
- - run: cargo build --workspace --target ${{ matrix.target }} --features nightly

### Ouro Bruto (primeiros 5000 chars)
```
name: Rust

on:
  push:
    branches:
      - trying
      - staging
  pull_request:

env:
  CARGO_INCREMENTAL: 0
  RUST_TEST_THREADS: 1

jobs:
  build_tier_one:
    runs-on: ${{ matrix.os }}-latest
    strategy:
      matrix:
        os: [ubuntu, macos, windows]
        channel: [stable, beta, nightly]
        feature: [arc_lock, serde, deadlock_detection]
        include:
          - channel: nightly
            feature: nightly
            os: ubuntu
          - channel: nightly
            feature: hardware-lock-elision
            os: ubuntu

    steps:
    - uses: actions/checkout@v4
    - run: rustup default ${{ matrix.channel }}
    - run: cargo build --all
    - run: cargo test --all
    - run: cargo build --all --features ${{ matrix.feature }}
    - run: cargo test --all --features ${{ matrix.feature }}
      if: matrix.feature == 'nightly'
    - run: cargo install cargo-msrv
    - run: cargo msrv --workspace verify
  build_other_platforms:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        target:
          - wasm32-unknown-unknown
          - x86_64-fortanix-unknown-sgx
          - x86_64-unknown-redox
          - x86_64-linux-android
    steps:
    - uses: actions/checkout@v4
    - run: rustup default nightly
    - run: rustup target add ${{ matrix.target }}
    - run: cargo build --workspace --target ${{ matrix.target }} --features nightly
  build_docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: rustup default nightly
      - run: cargo doc --workspace --features arc_lock,serde,deadlock_detection --no-deps -p parking_lot -p parking_lot_core -p lock_api
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: rustup default nightly
      - run: |
          cd benchmark
          cargo run --release --bin mutex -- 2 1 0 1 2
          cargo run --release --bin rwlock -- 1 1 1 0 1 2

```