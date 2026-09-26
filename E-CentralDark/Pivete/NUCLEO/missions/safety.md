# MISSAO - safety.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\jsonptr-0.6.3\.github\workflows\safety.yml
**SHA:** 5dd1de3e4dcfab36
**Timestamp:** 2026-08-28T02:34:32.669216
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: |
- run: cargo test --lib --tests --all-features --target x86_64-unknown-linux-gnu
- run: cargo test --all-features --target x86_64-unknown-linux-gnu
- - run: |
- run: cargo miri test -- --skip pointer::tests::qc

### Ouro Bruto (primeiros 5000 chars)
```
# This workflow runs checks for unsafe code. In crates that don't have any unsafe code, this can be
# removed. Runs:
# - miri - detects undefined behavior and memory leaks
# - address sanitizer - detects memory errors
# - leak sanitizer - detects memory leaks
# See check.yml for information about how the concurrency cancellation and workflow triggering works
permissions:
    contents: read
on:
    push:
        branches: [main]
    pull_request:
concurrency:
    group: ${{ github.workflow }}-${{ github.head_ref || github.run_id }}
    cancel-in-progress: true
name: safety
jobs:
    sanitizers:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
              with:
                  submodules: true
            - name: Install nightly
              uses: dtolnay/rust-toolchain@nightly
            - run: |
                  # to get the symbolizer for debug symbol resolution
                  sudo apt install llvm
                  # to fix buggy leak analyzer:
                  # https://github.com/japaric/rust-san#unrealiable-leaksanitizer
                  # ensure there's a profile.dev section
                  if ! grep -qE '^[ \t]*[profile.dev]' Cargo.toml; then
                      echo >> Cargo.toml
                      echo '[profile.dev]' >> Cargo.toml
                  fi
                  # remove pre-existing opt-levels in profile.dev
                  sed -i '/^\s*\[profile.dev\]/,/^\s*\[/ {/^\s*opt-level/d}' Cargo.toml
                  # now set opt-level to 1
                  sed -i '/^\s*\[profile.dev\]/a opt-level = 1' Cargo.toml
                  cat Cargo.toml
              name: Enable debug symbols
            - name: cargo test -Zsanitizer=address
              # only --lib --tests b/c of https://github.com/rust-lang/rust/issues/53945
              run: cargo test --lib --tests --all-features --target x86_64-unknown-linux-gnu
              env:
                  ASAN_OPTIONS: "detect_odr_violation=0:detect_leaks=0"
                  RUSTFLAGS: "-Z sanitizer=address"
            - name: cargo test -Zsanitizer=leak
              if: always()
              run: cargo test --all-features --target x86_64-unknown-linux-gnu
              env:
                  LSAN_OPTIONS: "suppressions=lsan-suppressions.txt"
                  RUSTFLAGS: "-Z sanitizer=leak"
    miri:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
              with:
                  submodules: true
            - run: |
                  echo "NIGHTLY=nightly-$(curl -s https://rust-lang.github.io/rustup-components-history/x86_64-unknown-linux-gnu/miri)" >> $GITHUB_ENV
            - name: Install ${{ env.NIGHTLY }}
              uses: dtolnay/rust-toolchain@master
              with:
                  toolchain: ${{ env.NIGHTLY }}
                  components: miri
            - name: cargo miri test
              run: cargo miri test -- --skip pointer::tests::qc
              env:
                  MIRIFLAGS: ""

```