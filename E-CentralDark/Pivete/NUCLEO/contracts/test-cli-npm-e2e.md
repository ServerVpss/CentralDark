# CONTRATO - test-cli-npm-e2e.yml
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\.github\workflows\test-cli-npm-e2e.yml
**SHA:** 48311dc15beedf47
**Timestamp:** 2026-08-23T14:15:49.493949
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: cd packages/cli && bun run test:payload
- run: cd packages/cli && bun run build
- run: cd packages/cli && bun run test

### Ouro Bruto (primeiros 5000 chars)
```
name: Test CLI npm e2e

on:
  pull_request:
    paths:
      - "packages/cli/**"
      - ".github/workflows/release-cli.yml"
      - ".github/workflows/test-cli-npm-e2e.yml"
  push:
    branches:
      - main
    paths:
      - "packages/cli/**"
      - ".github/workflows/release-cli.yml"
      - ".github/workflows/test-cli-npm-e2e.yml"

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  npm-e2e:
    runs-on: macos-latest
    timeout-minutes: 60
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1
        with:
          toolchain: stable
          override: true
          cache: true
          target: aarch64-apple-darwin
          rustflags: ""

      - name: Set up Bun
        uses: oven-sh/setup-bun@v2

      - name: Install native build dependencies
        run: |
          brew unlink pkg-config@0.29.2 || true
          brew install ffmpeg pkg-config
          brew link --overwrite pkg-config

      - name: Test Linux package payload contract
        run: cd packages/cli && bun run test:payload

      - name: Build screenpipe CLI binary
        run: cd packages/cli && bun run build

      - name: Run npm e2e tests
        run: cd packages/cli && bun run test

      - name: Upload e2e logs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: npm-e2e-logs
          path: packages/cli/npm-e2e/.work/logs
          if-no-files-found: ignore

```

---

# CONTRATO - test-cli-npm-e2e.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\.github\workflows\test-cli-npm-e2e.yml
**SHA:** 48311dc15beedf47982544a15ae9758a1d2f381fd0f856fcc8755316d530f2b0
**Timestamp:** 2026-08-23T23:43:05.248070
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: cd packages/cli && bun run test:payload
- run: cd packages/cli && bun run build
- run: cd packages/cli && bun run test

### Ouro Bruto (primeiros 5000 chars)
```
name: Test CLI npm e2e

on:
  pull_request:
    paths:
      - "packages/cli/**"
      - ".github/workflows/release-cli.yml"
      - ".github/workflows/test-cli-npm-e2e.yml"
  push:
    branches:
      - main
    paths:
      - "packages/cli/**"
      - ".github/workflows/release-cli.yml"
      - ".github/workflows/test-cli-npm-e2e.yml"

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  npm-e2e:
    runs-on: macos-latest
    timeout-minutes: 60
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1
        with:
          toolchain: stable
          override: true
          cache: true
          target: aarch64-apple-darwin
          rustflags: ""

      - name: Set up Bun
        uses: oven-sh/setup-bun@v2

      - name: Install native build dependencies
        run: |
          brew unlink pkg-config@0.29.2 || true
          brew install ffmpeg pkg-config
          brew link --overwrite pkg-config

      - name: Test Linux package payload contract
        run: cd packages/cli && bun run test:payload

      - name: Build screenpipe CLI binary
        run: cd packages/cli && bun run build

      - name: Run npm e2e tests
        run: cd packages/cli && bun run test

      - name: Upload e2e logs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: npm-e2e-logs
          path: packages/cli/npm-e2e/.work/logs
          if-no-files-found: ignore

```