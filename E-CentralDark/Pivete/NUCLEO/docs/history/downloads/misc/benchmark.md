# OUTRO - benchmark.yml
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\.github\workflows\benchmark.yml
**SHA:** 44c07d442301553e
**Timestamp:** 2026-08-23T14:15:49.172039
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: |
- run: |
- run: |
- run: |
- run: ls -R ./cache

### Ouro Bruto (primeiros 5000 chars)
```
name: Rust Benchmark

on:
  schedule:
    - cron: '0 8 * * *'  # Daily at midnight PST (8 AM UTC)
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  GIT_LFS_SKIP_SMUDGE: 1
  CARGO_TERM_COLOR: always

jobs:
  apple_ocr_benchmark:
    name: Run Apple OCR benchmark
    runs-on: [self-hosted, macos-test]
    # Self-hosted benchmark runners are not always online. Keep scheduled runs
    # green by running these platform-specific benchmarks only when triggered
    # manually by someone who can ensure the runners are available.
    if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable

      # Compile caching only — does not affect benchmark measurements.
      - name: Setup sccache (shared R2 compile cache)
        uses: ./.github/actions/setup-sccache
        with:
          r2-account-id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          read-access-key-id: ${{ secrets.SCCACHE_R2_READ_ACCESS_KEY_ID }}
          read-secret-access-key: ${{ secrets.SCCACHE_R2_READ_SECRET_ACCESS_KEY }}
          write-access-key-id: ${{ secrets.SCCACHE_R2_WRITE_ACCESS_KEY_ID }}
          write-secret-access-key: ${{ secrets.SCCACHE_R2_WRITE_SECRET_ACCESS_KEY }}

      - name: Install dependencies
        run: |
          brew install ffmpeg || true  # may already be installed on self-hosted

      - name: Run OCR benchmarks
        env:
          DYLD_LIBRARY_PATH: ${{ github.workspace }}/crates/screenpipe-screen/lib:${{ env.DYLD_LIBRARY_PATH }}
        run: |
          cargo bench --bench ocr_benchmark -- --output-format bencher | tee -a ocr_output.txt

      - name: Upload OCR benchmark artifact
        uses: actions/upload-artifact@v4
        with:
          name: apple-ocr-benchmark-data
          path: ocr_output.txt

  tesseract_ocr_benchmark:
    name: Run Tesseract OCR benchmark
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable

      # Compile caching only — does not affect benchmark measurements.
      - name: Setup sccache (shared R2 compile cache)
        uses: ./.github/actions/setup-sccache
        with:
          r2-account-id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          read-access-key-id: ${{ secrets.SCCACHE_R2_READ_ACCESS_KEY_ID }}
          read-secret-access-key: ${{ secrets.SCCACHE_R2_READ_SECRET_ACCESS_KEY }}
          write-access-key-id: ${{ secrets.SCCACHE_R2_WRITE_ACCESS_KEY_ID }}
          write-secret-access-key: ${{ secrets.SCCACHE_R2_WRITE_SECRET_ACCESS_KEY }}

      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libleptonica-dev libtesseract-dev tesseract-ocr-eng

      - name: Run Tesseract OCR benchmarks
        run: |
          cargo bench --bench ocr_benchmark -- --output-format bencher | tee -a ocr_output.txt

      - name: Upload OCR benchmark artifact
        uses: actions/upload-artifact@v4
        with:
          name: tesseract-ocr-benchmark-data
          path: ocr_output.txt

  windows_ocr_benchmark:
    name: Run Windows OCR benchmark
    runs-on: [self-hosted, windows-desktop-test]
    # Self-hosted benchmark runners are not always online. Keep scheduled runs
    # green by running these platform-specific benchmarks only when triggered
    # manually by someone who can ensure the runners are available.
    if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable

      # Compile caching only — does not affect benchmark measurements.
      - name: Setup sccache (shared R2 compile cache)
        uses: ./.github/actions/setup-sccache
        with:
          r2-account-id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          read-access-key-id: ${{ secrets.SCCACHE_R2_READ_ACCESS_KEY_ID }}
          read-secret-access-key: ${{ secrets.SCCACHE_R2_READ_SECRET_ACCESS_KEY }}
          write-access-key-id: ${{ secrets.SCCACHE_R2_WRITE_ACCESS_KEY_ID }}
          write-secret-access-key: ${{ secrets.SCCACHE_R2_WRITE_SECRET_ACCESS_KEY }}

      - name: Run Windows OCR benchmarks
        run: |
          cargo bench --bench ocr_benchmark -- --output-format criterion 
          # TODO broken
          # | Tee-Object -Append -FilePath ocr_output.txt

      - name: Upload OCR benchmark artifact
        uses: actions/upload-artifact@v4
        with:
          name: windows-ocr-benchmark-data
          path: ocr_output.txt

  stt_benchmark:
    name: Run STT benchmark
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable

      # Compile caching only — does not affect benchmark measurements.
      - name: Setup sccache (shared R2 compile cache)
        uses: ./.github/actions/setup-sccache
        with:
          r2-account-id: ${{ sec
```

---

# OUTRO - benchmark.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\.github\workflows\benchmark.yml
**SHA:** 44c07d442301553e8932311618704951b9ac4a455fc8a41f7abfc2f5d7c17b81
**Timestamp:** 2026-08-23T23:43:05.124177
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: |
- run: |
- run: |
- run: |
- run: ls -R ./cache

### Ouro Bruto (primeiros 5000 chars)
```
name: Rust Benchmark

on:
  schedule:
    - cron: '0 8 * * *'  # Daily at midnight PST (8 AM UTC)
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  GIT_LFS_SKIP_SMUDGE: 1
  CARGO_TERM_COLOR: always

jobs:
  apple_ocr_benchmark:
    name: Run Apple OCR benchmark
    runs-on: [self-hosted, macos-test]
    # Self-hosted benchmark runners are not always online. Keep scheduled runs
    # green by running these platform-specific benchmarks only when triggered
    # manually by someone who can ensure the runners are available.
    if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable

      # Compile caching only — does not affect benchmark measurements.
      - name: Setup sccache (shared R2 compile cache)
        uses: ./.github/actions/setup-sccache
        with:
          r2-account-id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          read-access-key-id: ${{ secrets.SCCACHE_R2_READ_ACCESS_KEY_ID }}
          read-secret-access-key: ${{ secrets.SCCACHE_R2_READ_SECRET_ACCESS_KEY }}
          write-access-key-id: ${{ secrets.SCCACHE_R2_WRITE_ACCESS_KEY_ID }}
          write-secret-access-key: ${{ secrets.SCCACHE_R2_WRITE_SECRET_ACCESS_KEY }}

      - name: Install dependencies
        run: |
          brew install ffmpeg || true  # may already be installed on self-hosted

      - name: Run OCR benchmarks
        env:
          DYLD_LIBRARY_PATH: ${{ github.workspace }}/crates/screenpipe-screen/lib:${{ env.DYLD_LIBRARY_PATH }}
        run: |
          cargo bench --bench ocr_benchmark -- --output-format bencher | tee -a ocr_output.txt

      - name: Upload OCR benchmark artifact
        uses: actions/upload-artifact@v4
        with:
          name: apple-ocr-benchmark-data
          path: ocr_output.txt

  tesseract_ocr_benchmark:
    name: Run Tesseract OCR benchmark
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable

      # Compile caching only — does not affect benchmark measurements.
      - name: Setup sccache (shared R2 compile cache)
        uses: ./.github/actions/setup-sccache
        with:
          r2-account-id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          read-access-key-id: ${{ secrets.SCCACHE_R2_READ_ACCESS_KEY_ID }}
          read-secret-access-key: ${{ secrets.SCCACHE_R2_READ_SECRET_ACCESS_KEY }}
          write-access-key-id: ${{ secrets.SCCACHE_R2_WRITE_ACCESS_KEY_ID }}
          write-secret-access-key: ${{ secrets.SCCACHE_R2_WRITE_SECRET_ACCESS_KEY }}

      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libleptonica-dev libtesseract-dev tesseract-ocr-eng

      - name: Run Tesseract OCR benchmarks
        run: |
          cargo bench --bench ocr_benchmark -- --output-format bencher | tee -a ocr_output.txt

      - name: Upload OCR benchmark artifact
        uses: actions/upload-artifact@v4
        with:
          name: tesseract-ocr-benchmark-data
          path: ocr_output.txt

  windows_ocr_benchmark:
    name: Run Windows OCR benchmark
    runs-on: [self-hosted, windows-desktop-test]
    # Self-hosted benchmark runners are not always online. Keep scheduled runs
    # green by running these platform-specific benchmarks only when triggered
    # manually by someone who can ensure the runners are available.
    if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable

      # Compile caching only — does not affect benchmark measurements.
      - name: Setup sccache (shared R2 compile cache)
        uses: ./.github/actions/setup-sccache
        with:
          r2-account-id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          read-access-key-id: ${{ secrets.SCCACHE_R2_READ_ACCESS_KEY_ID }}
          read-secret-access-key: ${{ secrets.SCCACHE_R2_READ_SECRET_ACCESS_KEY }}
          write-access-key-id: ${{ secrets.SCCACHE_R2_WRITE_ACCESS_KEY_ID }}
          write-secret-access-key: ${{ secrets.SCCACHE_R2_WRITE_SECRET_ACCESS_KEY }}

      - name: Run Windows OCR benchmarks
        run: |
          cargo bench --bench ocr_benchmark -- --output-format criterion 
          # TODO broken
          # | Tee-Object -Append -FilePath ocr_output.txt

      - name: Upload OCR benchmark artifact
        uses: actions/upload-artifact@v4
        with:
          name: windows-ocr-benchmark-data
          path: ocr_output.txt

  stt_benchmark:
    name: Run STT benchmark
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable

      # Compile caching only — does not affect benchmark measurements.
      - name: Setup sccache (shared R2 compile cache)
        uses: ./.github/actions/setup-sccache
        with:
          r2-account-id: ${{ sec
```