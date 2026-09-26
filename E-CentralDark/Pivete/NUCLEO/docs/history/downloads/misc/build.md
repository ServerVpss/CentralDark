# Task: Build (Autonomous)

> **Command:** `*build {story-id}`
> **Agent:** @dev
> **Story:** 8.5 - Build Orchestrator
> **AC:** AC2

---

## Purpose

Execute a complete autonomous build for a story with a single command.

This is the **main entry point** for autonomous development. It orchestrates all components:

- Worktree isolation
- Plan generation/loading
- Subtask execution via Claude CLI
- QA verification (lint, tests)
- Merge to main
- Cleanup and reporting

---

## Usage

```bash
*build {story-id}
*build {story-id} --dry-run
*build {story-id} --verbose
*build {story-id} --no-merge --keep-worktree
```

### Arguments

| Argument | Required | Description                          |
| -------- | -------- | ------------------------------------ |
| story-id | Yes      | Story identifier (e.g., "story-8.5") |

### Flags (AC4)

| Flag            | Description                                        |
| --------------- | -------------------------------------------------- |
| --dry-run       | Show what would happen without executing           |
| --no-merge      | Skip merge phase (keep changes in worktree branch) |
| --keep-worktree | Don't cleanup worktree after build                 |
| --no-worktree   | Execute in main directory (no isolation)           |
| --no-qa         | Skip QA phase                                      |
| --verbose, -v   | Enable verbose output                              |
| --timeout <ms>  | Global timeout (default: 2700000 = 45min)          |

---

## Pipeline (AC3)

```
┌─────────────┐    ┌─────────┐    ┌─────────────┐    ┌──────┐    ┌─────────┐    ┌─────────────┐
│  WORKTREE   │ ─► │  PLAN   │ ─► │   EXECUTE   │ ─► │  QA  │ ─► │  MERGE  │ ─► │   CLEANUP   │
│   Create    │    │  Load/  │    │   Claude    │    │ Lint │    │ To main │    │  Worktree   │
│  isolated   │    │ Generate│    │    CLI      │    │ Test │    │         │    │   Remove    │
└─────────────┘    └─────────┘    └─────────────┘    └──────┘    └─────────┘    └─────────────┘
```

### Phase Details

1. **WORKTREE** - Creates isolated git worktree at `.aios/worktrees/{story-id}`
2. **PLAN** - Loads `plan/implementation.yaml` or generates from story ACs
3. **EXECUTE** - Runs each subtask using Claude CLI with retry loop
4. **QA** - Runs lint, tests, typecheck (AC8)
5. **MERGE** - Merges worktree branch to main
6. **CLEANUP** - Removes worktree and generates report

---

## Output (AC6)

Final report generated at `plan/build-report-{story-id}.md`:

```markdown
# Build Report: story-8.5

> **Status:** ✅ SUCCESS
> **Duration:** 15m 32s

## Phases

| Phase    | Status       | Duration |
| -------- | ------------ | -------- |
| worktree | ✅ completed | 1200ms   |
| plan     | ✅ completed | 500ms    |
| execute  | ✅ completed | 845000ms |
| qa       | ✅ completed | 32000ms  |
| merge    | ✅ completed | 2100ms   |
| cleanup  | ✅ completed | 800ms    |
```

---

## Examples

```bash
# Standard build (recommended)
*build story-8.5

# Preview what would happen
*build story-8.5 --dry-run

# Debug mode with verbose output
*build story-8.5 --verbose

# Build without merging (review changes first)
*build story-8.5 --no-merge --keep-worktree

# Quick build without QA (not recommended)
*build story-8.5 --no-qa --no-merge
```

---

## Integration

- **Uses:**
  - `BuildOrchestrator` from `core/execution/build-orchestrator.js`
  - `AutonomousBuildLoop` from `core/execution/autonomous-build-loop.js`
  - `WorktreeManager` from `infrastructure/scripts/worktree-manager.js`
  - `GotchasMemory` from `core/memory/gotchas-memory.js`
- **Invokes:** Claude CLI for subtask execution
- **Outputs:** `plan/build-report-{story-id}.md`

---

## Related Commands

- `*build-autonomous {story-id}` - Lower-level build loop (no worktree/merge)
- `*build-resume {story-id}` - Resume failed build from checkpoint
- `*build-status {story-id}` - Check build progress
- `*worktree-list` - List active worktrees

---

_Task file for Story 8.5 - Build Orchestrator_


---

# OUTRO - build.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\json-schema-traverse@1.0.0@@@1\.github\workflows\build.yml
**SHA:** f0f23bb3b380800e
**Timestamp:** 2026-08-28T02:24:44.598680
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: npm install
- - run: npm test

### Ouro Bruto (primeiros 5000 chars)
```
name: build

on:
  push:
    branches: [master]
  pull_request:
    branches: ["*"]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [10.x, 12.x, 14.x]

    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm install
      - run: npm test
      - name: Coveralls
        uses: coverallsapp/github-action@master
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

```

---

# OUTRO - build.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\infer-0.19.0\.github\workflows\build.yml
**SHA:** 4db5de0e19c05296
**Timestamp:** 2026-08-28T02:34:30.928706
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: rustup component add rustfmt
- run: rustup component add clippy
- run: cargo fmt --all -- --check
- run: cargo clippy --all-targets --all-features --examples -- -D clippy::all
- run: cargo clippy --all-targets --no-default-features --features alloc -- -D clippy::all
- run: cargo clippy --all-targets --no-default-features -- -D clippy::all
- run: cargo test --verbose
- run: cargo test --no-default-features --features alloc --verbose
- run: cargo test --no-default-features --verbose

### Ouro Bruto (primeiros 5000 chars)
```
name: build

on:
  push:
    branches:
    - master
    paths:
    - 'Cargo*'
    - 'src/**'
    - 'tests/**'
    - 'testdata/**'
  pull_request:
    branches:
    - master
    paths:
    - 'Cargo*'
    - 'src/**'
    - 'tests/**'
    - 'testdata/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: Install rustfmt
      run: rustup component add rustfmt
    - name: Install clippy
      run: rustup component add clippy
    - name: Check format
      run: cargo fmt --all -- --check
    - name: Lint (all features)
      run: cargo clippy --all-targets --all-features --examples -- -D clippy::all
    - name: Lint (no_std)
      run: cargo clippy --all-targets --no-default-features --features alloc -- -D clippy::all
    - name: Lint (no_alloc)
      run: cargo clippy --all-targets --no-default-features -- -D clippy::all
    - name: Test (default)
      run: cargo test --verbose
    - name: Test (no_std)
      run: cargo test --no-default-features --features alloc --verbose
    - name: Test (no_alloc)
      run: cargo test --no-default-features --verbose

```

---

# OUTRO - build.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\simd-adler32-0.3.10\.github\workflows\build.yaml
**SHA:** 13a784264fec68fa
**Timestamp:** 2026-08-28T02:35:42.615551
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: cargo install cargo-deadlinks
- run: cargo deadlinks --ignore-fragments -- --all
- - run: ${{ matrix.deps }}
- run: cargo generate-lockfile -Z minimal-versions
- run: |
- run: cargo install cross || true
- run: |
- run: cargo test --target=x86_64-unknown-linux-gnu --no-default-features --features=std
- run: cargo build --target=thumbv6m-none-eabi --no-default-features
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: build

on:
  push:
  pull_request:
    branches: [main]

jobs:
  clippy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: nightly
          components: clippy
          override: true
      - uses: actions-rs/clippy-check@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          args: --all-features

  test-doc:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install toolchain
        uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: nightly
          override: true
      - uses: Swatinem/rust-cache@v1
      - run: cargo install cargo-deadlinks
      - name: doc
        env:
          RUSTDOCFLAGS: --cfg doc_cfg
        run: cargo deadlinks --ignore-fragments -- --all

  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
            toolchain: stable
          - os: ubuntu-24.04-arm
            target: aarch64-unknown-linux-gnu
            toolchain: stable
          - os: macos-26-intel
            target: x86_64-apple-darwin
            toolchain: stable
          - os: macos-latest
            target: aarch64-apple-darwin
            toolchain: stable
          - os: windows-latest
            target: x86_64-pc-windows-gnu
            toolchain: stable
          - os: windows-latest
            target: x86_64-pc-windows-msvc
            toolchain: beta
            # Test both windows-gnu and windows-msvc; use beta rust on one
          - os: ubuntu-latest
            deps: sudo apt-get update ; sudo apt install gcc-multilib
            target: i686-unknown-linux-gnu
            toolchain: nightly
          - os: macos-latest
            target: aarch64-apple-darwin
            toolchain: nightly
          - os: ubuntu-24.04-arm
            target: aarch64-unknown-linux-gnu
            toolchain: nightly
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
            toolchain: nightly
            variant: minimal_versions

    steps:
      - uses: actions/checkout@v2
      - name: Install toolchain
        uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          target: ${{ matrix.target }}
          toolchain: ${{ matrix.toolchain }}
          override: true
      - uses: Swatinem/rust-cache@v1
      - run: ${{ matrix.deps }}
      - name: Maybe minimal versions
        if: ${{ matrix.variant == 'minimal_versions' }}
        run: cargo generate-lockfile -Z minimal-versions

      - name: Test
        run: |
          cargo test --lib --target ${{ matrix.target }} ${{ matrix.toolchain == 'nightly' && '--features=nightly' || '' }}

        env:
          # Enables address sanitization if supported target and nightly.
          RUSTFLAGS: |
            ${{ 
              (
                matrix.toolchain == 'nightly' && (
                  matrix.target == 'aarch64-apple-darwin' ||
                  matrix.target == 'aarch64-fuchsia' ||
                  matrix.target == 'aarch64-unknown-linux-gnu' ||
                  matrix.target == 'x86_64-apple-darwin' ||
                  matrix.target == 'x86_64-fuchsia' ||
                  matrix.target == 'x86_64-unknown-freebsd' ||
                  matrix.target == 'x86_64-unknown-linux-gnu'
                )
              )
                && '-Z sanitizer=address'
                || ''
            }}

  test-cross:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: ubuntu-latest
            target: arm-unknown-linux-gnueabi
            toolchain: stable
          - os: ubuntu-latest
            target: arm-unknown-linux-gnueabi
            toolchain: nightly
          - os: ubuntu-latest
            target: thumbv7neon-unknown-linux-gnueabihf
            toolchain: stable
          - os: ubuntu-latest
            target: thumbv7neon-unknown-linux-gnueabihf
            toolchain: nightly

    steps:
      - uses: actions/checkout@v2
      - name: Install toolchain
        uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          target: ${{ matrix.target }}
          toolchain: ${{ matrix.toolchain }}
          override: true

      - uses: Swatinem/rust-cache@v1
      - name: Install cross
        run: cargo install cross || true
      - name: Test
        run: |
          cross test --no-fail-fast --target ${{ matrix.target }} ${{ matrix.toolchain == 'nightly' && '--features=nightly' || '' }}

  test-msrv:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install toolchain
        uses: actions-rs/toolchain@v1
        with:
          target: x86_64-unknown-linux-gnu
          toolchain: 1.36.0 # MSRV
      - uses: Swatinem/rust-cache@v1
      - name: Test
        run: cargo
```