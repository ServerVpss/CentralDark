# DECISAO - fuzz.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\simd-adler32-0.3.10\.github\workflows\fuzz.yaml
**SHA:** 9e23a99373a2dd29
**Timestamp:** 2026-08-28T02:35:42.937595
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run:
- - run: cargo install cargo-fuzz
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: fuzz

on:
  schedule:
    # Run every 24h
    - cron: "0 0 * * *"

defaults:
  run:
    working-directory: fuzz

jobs:
  fuzz:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest]
        target: [avx2, sse2, ssse3]
        include:
          - os: ubuntu-24.04-arm
            target: neon

    steps:
      - uses: actions/checkout@v2
      - name: setup
        uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: nightly
          override: true

      - uses: Swatinem/rust-cache@v1
      - run: cargo install cargo-fuzz

      - name: Download corpus artifact
        run: |
          wget https://nightly.link/mcountryman/simd-adler32/workflows/fuzz.yaml/main/corpus.zip
          mkdir -p corpus
          unzip corpus.zip -d corpus

        # keep going if artifact doesn't exist
        continue-on-error: true

      - name: Run fuzz test (30m)
        run: |
          cargo fuzz run ${{ matrix.target }} -- -max_total_time=1800

      - name: Archive artifacts
        uses: actions/upload-artifact@v2
        if: failure()
        with:
          name: artifacts
          path: fuzz/artifacts

      # big decision.  do we store corpus from failed jobs?  for now we don't..
      - uses: actions/upload-artifact@v2
        with:
          name: corpus
          path: |
            fuzz/corpus/
            fuzz/corpus/${{ matrix.target }}

```