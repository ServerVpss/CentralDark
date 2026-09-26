# OUTRO - msvc.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\embed-resource-3.0.11\.github\workflows\msvc.yml
**SHA:** c1c0c278a2ee4bf8
**Timestamp:** 2026-08-28T02:34:06.214646
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: pip install "pefile==2024.8.26"
- - run: cargo build --verbose --release --target ${{ matrix.target }} --workspace
- run: cargo test --verbose --release --target ${{ matrix.target }}
- run: cargo run --verbose --release --target ${{ matrix.target }} -- empty-resource.rc
- - run: python3 .github/workflows/msvc/test.py "target/${{ matrix.target }}/release/embed-resource-msvc-test.exe"
- run: "target/${{ matrix.target }}/release/embed-resource-msvc-test.exe"

### Ouro Bruto (primeiros 5000 chars)
```
on: [push, pull_request]

name: CI

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  msvc:
    name: MSVC
    strategy:
      fail-fast: false
      matrix:
        rust_version: [stable, 1.76.0]
        target:
          - x86_64-pc-windows-msvc
          - i686-pc-windows-msvc
          - aarch64-pc-windows-msvc

    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{ matrix.rust_version }}
          targets: ${{ matrix.target }}

      - run: pip install "pefile==2024.8.26"
      - run: cargo build --verbose --release --target ${{ matrix.target }} --workspace

      # Runner is x86_64, can only run i686 and x86_64
      - if: contains(matrix.target, '86')
        run: cargo test --verbose --release --target ${{ matrix.target }}
      - if: contains(matrix.target, '86')
        run: cargo run --verbose --release --target ${{ matrix.target }} -- empty-resource.rc

      # Embed resources into a cross-compiled binary, and check.
      - run: python3 .github/workflows/msvc/test.py "target/${{ matrix.target }}/release/embed-resource-msvc-test.exe"
      - if: contains(matrix.target, '86')
        run: "target/${{ matrix.target }}/release/embed-resource-msvc-test.exe"

```