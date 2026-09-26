# OUTRO - release.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cargo_metadata-0.19.2\.github\workflows\release.yml
**SHA:** c195a66766f906e5
**Timestamp:** 2026-08-28T02:33:17.512707
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: cargo publish
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Release new version

on:
  workflow_dispatch:
    secrets:
      CARGO_REGISTRY_TOKEN:
        required: true

env:
  RUST_BACKTRACE: 1
  CARGO_TERM_COLOR: always

jobs:
  create-release:
    name: Create release
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          persist-credentials: true

      - name: Install rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          profile: minimal
          override: true

      - uses: Swatinem/rust-cache@v2

      # Determine which version we're about to publish, so we can tag it appropriately.
      # If the tag already exists, then we've already published this version.
      - name: Determine current version
        id: version-check
        run: |
          # Fail on first error, on undefined variables, and on errors in pipes.
          set -euo pipefail
          export VERSION="$(cargo metadata --format-version 1 | \
            jq --arg crate_name cargo_metadata --exit-status -r \
                '.packages[] | select(.name == $crate_name) | .version')"
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          if [[ "$(git tag -l "$VERSION")" != '' ]]; then
            echo "Aborting: Version $VERSION is already published, we found its tag in the repo."
            exit 1
          fi

      - name: Semver-check
        uses: obi1kenobi/cargo-semver-checks-action@v2
        with:
          rust-toolchain: manual  # we've already installed Rust, don't install a new one

      - name: Publish
        run: cargo publish
        env:
          CARGO_REGISTRY_TOKEN: ${{ secrets.CARGO_REGISTRY_TOKEN }}

      - name: Tag the version
        run: |
          # Fail on first error, on undefined variables, and on errors in pipes.
          set -euo pipefail
          git tag "${{ steps.version-check.outputs.version }}"
          git push origin "${{ steps.version-check.outputs.version }}"

      - uses: taiki-e/create-gh-release-action@v1
        name: Create GitHub release
        with:
          branch: main
          ref: refs/tags/${{ steps.version-check.outputs.version }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

```

---

# OUTRO - release.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\infer-0.19.0\.github\workflows\release.yml
**SHA:** 205242ef8dfd618d
**Timestamp:** 2026-08-28T02:34:30.937833
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: rustup component add rustfmt
- run: rustup component add clippy
- run: cargo fmt --all -- --check
- run: cargo clippy --all-targets --all-features -- -D clippy::all
- run: cargo clippy --all-targets --no-default-features --features alloc -- -D clippy::all
- run: cargo clippy --all-targets --no-default-features -- -D clippy::all
- run: cargo test --verbose
- run: cargo test --no-default-features --features alloc --verbose
- run: cargo test --no-default-features --verbose
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: release

on:
  push:
    tags:
      - v*

jobs:
  
  github_build:
    name: GitHub Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Install rustfmt
        run: rustup component add rustfmt
      - name: Install clippy
        run: rustup component add clippy
      - name: Check format
        run: cargo fmt --all -- --check
      - name: Lint (all features)
        run: cargo clippy --all-targets --all-features -- -D clippy::all
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

  github_release:
    name: Create GitHub Release
    needs: github_build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Generate release notes
        run: |
          export PATH=$PATH:$(go env GOPATH)/bin
          go install github.com/git-chglog/git-chglog/cmd/git-chglog@latest
          git-chglog -c .chglog/config.yml $(git describe --tags) > RELEASE.md
      - name: Create GitHub release ${{ matrix.target }}
        uses: softprops/action-gh-release@v1
        with:
          body_path: RELEASE.md
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # Publish to Crates.io
  cargo_publish:
    name: Publish Cargo Package
    needs: github_build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout  
        uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: stable
          override: true
      - run: cargo login $CRATES_IO_TOKEN
      - run: cargo publish
    env:
      CRATES_IO_TOKEN: ${{ secrets.CRATES_IO_TOKEN }}
```