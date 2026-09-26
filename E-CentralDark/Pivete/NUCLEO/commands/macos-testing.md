# COMANDO - macos-testing.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.github\workflows\macos-testing.yml
**SHA:** a030653a0a801941
**Timestamp:** 2026-08-28T02:02:28.752377
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: npm ci
- run: chmod +x tests/macos/*.sh
- run: |
- run: |
- run: |
- run: |
- run: |
- run: |
- run: npm ci

### Ouro Bruto (primeiros 5000 chars)
```
name: macOS Testing & Validation
# Story 1.10b - Automated macOS testing across Intel and Apple Silicon
# Story 6.1 - Added concurrency, normalized branches

on:
  push:
    branches: [main]
    paths:
      - 'installer/**'
      - 'tests/macos/**'
      - '.github/workflows/macos-testing.yml'
  pull_request:
    branches: [main]
    paths:
      - 'installer/**'
      - 'tests/macos/**'
  workflow_dispatch:
    inputs:
      test_suite:
        description: 'Test suite to run'
        required: false
        default: 'all'
        type: choice
        options:
          - all
          - installation
          - compatibility
          - performance
          - security

concurrency:
  group: macos-testing-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  # Job 1: Intel Mac Testing
  test-intel-mac:
    name: Test on macOS Intel (x86_64)
    runs-on: macos-13  # Intel runner
    timeout-minutes: 30

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Display system information
        run: |
          echo "=== System Information ==="
          sw_vers
          uname -a
          echo "Architecture: $(uname -m)"
          node --version
          npm --version
          echo "=========================="

      - name: Install dependencies
        run: npm ci

      - name: Make test scripts executable
        run: chmod +x tests/macos/*.sh

      - name: Run Intel-specific tests
        run: |
          cd tests/macos
          ./test-intel-installation.sh || true

      - name: Run compatibility tests
        run: |
          cd tests/macos
          ./test-shell-compatibility.sh
          ./test-path-handling.sh
          ./test-line-endings.sh
          ./test-permissions.sh

      - name: Run integration tests
        run: |
          cd tests/macos
          ./test-homebrew-integration.sh

      - name: Run performance benchmarks
        run: |
          cd tests/macos
          ./test-performance.sh

      - name: Run security tests
        run: |
          cd tests/macos
          ./test-security.sh

      - name: Upload test logs
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-logs-intel
          path: /tmp/aios-test-*.log
          retention-days: 30

  # Job 2: Apple Silicon Testing
  test-apple-silicon:
    name: Test on macOS Apple Silicon (arm64)
    runs-on: macos-14  # M1 runner
    timeout-minutes: 30

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Display system information
        run: |
          echo "=== System Information ==="
          sw_vers
          uname -a
          echo "Architecture: $(uname -m)"
          sysctl -n machdep.cpu.brand_string
          node --version
          npm --version
          file $(which node)
          echo "=========================="

      - name: Install dependencies
        run: npm ci

      - name: Make test scripts executable
        run: chmod +x tests/macos/*.sh

      - name: Run Apple Silicon-specific tests
        run: |
          cd tests/macos
          ./test-apple-silicon-installation.sh || true

      - name: Run compatibility tests
        run: |
          cd tests/macos
          ./test-shell-compatibility.sh
          ./test-path-handling.sh
          ./test-line-endings.sh
          ./test-permissions.sh

      - name: Run integration tests
        run: |
          cd tests/macos
          ./test-homebrew-integration.sh

      - name: Run performance benchmarks
        run: |
          cd tests/macos
          ./test-performance.sh

      - name: Run security tests
        run: |
          cd tests/macos
          ./test-security.sh

      - name: Verify native ARM execution
        run: |
          echo "Checking if Node.js runs natively on ARM..."
          file $(which node) | grep arm64 || echo "WARNING: Node.js not running natively on ARM"

      - name: Upload test logs
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-logs-apple-silicon
          path: /tmp/aios-test-*.log
          retention-days: 30

  # Job 3: Error Recovery Testing
  test-error-recovery:
    name: Test Error Recovery & Rollback
    runs-on: macos-latest
    timeout-minutes: 15

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Make test scripts executable
        run: chmod +x tests/macos/*.sh

      - name: Run error recovery tests
        run: |
          cd tests/macos
          ./test-error-recovery.sh

      - name: U
```