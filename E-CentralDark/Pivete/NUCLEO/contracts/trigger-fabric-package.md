# CONTRATO - trigger-fabric-package.yml
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_CentralDark-Pombo-Owner-FailClosed-20260824\CentralDark-Pombo-Owner-FailClosed-20260824\PATCH_TREE\.github\workflows\trigger-fabric-package.yml
**SHA:** 990caec16f62e1ce
**Timestamp:** 2026-08-26T19:43:49.348396
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

### Contratos
- grep -q '^BOT_ENTRY_CONTRACT=PASS$' docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/VERIFY-RESULT.txt
- grep -q '^OUTPUT_GUARD_CONTRACT=PASS$' docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/VERIFY-RESULT.txt
- grep -q '^BOT_ENTRY_CONTRACT=PASS$' .artifacts/trigger-fabric/extracted-verify-result.txt
- grep -q '^OUTPUT_GUARD_CONTRACT=PASS$' .artifacts/trigger-fabric/extracted-verify-result.txt

### Ouro Bruto (primeiros 5000 chars)
```
name: Trigger Fabric Full Package

on:
  pull_request:
    paths:
      - 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/**'
      - 'scripts/trigger-fabric/**'
      - '.github/workflows/trigger-fabric-package.yml'
      - 'LEIA-ME-IA.md'
      - 'AGENTS.md'
      - 'docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md'
      - 'docs/CONSCIENCIA/MULTIBUSSOLA.md'
      - 'docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md'
      - 'docs/CONSCIENCIA/APRENDIZADOS/2026-08-24-pombo-correio-com-checksum.md'
      - '.agents/skills/meta-lupa/**'
      - 'apps/modulos/HERMES-CORE/**'
      - 'scripts/memory-linker/**'
      - '.agents/skills/session-intelligence-harvester/**'
      - '.agents/skills/knowledge-compiler/**'
      - '.agents/skills/vector-memory/**'
      - 'docs/CONSCIENCIA/GITHUB-LABELS-OPERACIONAIS.md'
      - '.github/workflows/autonomia-promocao.yml'
      - '.github/workflows/porta-de-entrada.yml'
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: trigger-fabric-package-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  build-counterproof-package:
    runs-on: [self-hosted, Linux]
    timeout-minutes: 15
    steps:
      - name: Checkout exact PR state
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Prove checkout HEAD
        if: github.event_name == 'pull_request'
        shell: bash
        env:
          EXPECTED_HEAD: ${{ github.event.pull_request.head.sha }}
        run: |
          set -euo pipefail
          actual="$(git rev-parse HEAD)"
          test "$actual" = "$EXPECTED_HEAD"
          echo "HEAD_SHA=$actual"

      - name: Setup Node
        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: '22'

      - name: Verify repository contract facts
        shell: bash
        run: |
          set -euo pipefail
          python scripts/trigger-fabric/verify_repo_contract.py . \
            | tee docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/VERIFY-RESULT.txt
          grep -q '^REPO_CONTRACT_VERIFY=PASS$' docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/VERIFY-RESULT.txt
          grep -q '^BOT_ENTRY_CONTRACT=PASS$' docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/VERIFY-RESULT.txt
          grep -q '^OUTPUT_GUARD_CONTRACT=PASS$' docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/VERIFY-RESULT.txt
          grep -q '^POMBO_CANONICAL_HANDOFF_OWNER=PASS$' docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/VERIFY-RESULT.txt

      - name: Counterproof canonical Pombo handoff owner
        shell: bash
        run: |
          set -euo pipefail
          python scripts/trigger-fabric/test_pombo_handoff_counterproof.py . \
            | tee .artifacts-pombo-counterproof.txt
          grep -q '^DELETE_OWNER_FAILS_CLOSED=PASS$' .artifacts-pombo-counterproof.txt
          grep -q '^REGRESSED_OWNER_FAILS_CLOSED=PASS$' .artifacts-pombo-counterproof.txt
          grep -q '^POMBO_OWNER_COUNTERPROOF=PASS$' .artifacts-pombo-counterproof.txt

      - name: Render architecture PNG from canonical Mermaid
        shell: bash
        run: |
          set -euo pipefail
          npx -y @mermaid-js/mermaid-cli@11.9.0 \
            -i docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARCHITECTURE.mmd \
            -o docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARCHITECTURE.png \
            -b transparent
          test -s docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARCHITECTURE.png

      - name: Build deterministic full ZIP
        shell: bash
        run: |
          set -euo pipefail
          python scripts/trigger-fabric/build_package.py | tee .artifacts/trigger-fabric/build-result.txt
          test -s .artifacts/trigger-fabric/CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE.zip

      - name: Fresh-extraction counterproof
        shell: bash
        run: |
          set -euo pipefail
          rm -rf /tmp/trigger-fabric-verify
          mkdir -p /tmp/trigger-fabric-verify
          python - <<'PY'
          import zipfile
          z='.artifacts/trigger-fabric/CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE.zip'
          with zipfile.ZipFile(z) as f:
              f.extractall('/tmp/trigger-fabric-verify')
          PY
          python scripts/trigger-fabric/verify_package.py \
            /tmp/trigger-fabric-verify/CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE \
            | tee .artifacts/trigger-fabric/extracted-verify-result.txt
          grep -q '^VERIFY=PASS$' .artifacts/trigger-fabric/extracted-verify-result.txt
          grep -q '^BOT_ENTRY_CONTRACT=PASS$' .artifacts/trigger-fabric/extracted-verify-result.txt
          grep -q '^OUTPUT_GUARD_CONTRACT=PASS$' .artifacts/trigger-fabric/extracted-verify-result.txt
          grep -q '^POMBO_CANONICAL_HANDOFF_OWNER=PASS$' .artifacts/trigger-fabric/extracted-verify-result.txt
          grep -q '^POMBO_OWNER_COUNTERPROOF_WIRED=PASS$' .artifacts/trigger-fabric/extracted-verify
```

---

# CONTRATO - trigger-fabric-package.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\trigger-fabric-package.yml
**SHA:** 06c1414d6d9feb2b
**Timestamp:** 2026-08-28T02:56:04.079932
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: |
- run: |
- run: |

### Contratos
- grep -q '^BOT_ENTRY_CONTRACT=PASS$' docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/VERIFY-RESULT.txt
- grep -q '^OUTPUT_GUARD_CONTRACT=PASS$' docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/VERIFY-RESULT.txt
- grep -q '^BOT_ENTRY_CONTRACT=PASS$' .artifacts/trigger-fabric/extracted-verify-result.txt
- grep -q '^OUTPUT_GUARD_CONTRACT=PASS$' .artifacts/trigger-fabric/extracted-verify-result.txt

### Ouro Bruto (primeiros 5000 chars)
```
name: Trigger Fabric Full Package

on:
  pull_request:
    paths:
      - 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/**'
      - 'scripts/trigger-fabric/**'
      - '.github/workflows/trigger-fabric-package.yml'
      - 'LEIA-ME-IA.md'
      - 'AGENTS.md'
      - 'docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md'
      - 'docs/CONSCIENCIA/MULTIBUSSOLA.md'
      - '.agents/skills/meta-lupa/**'
      - 'apps/modulos/HERMES-CORE/**'
      - 'scripts/memory-linker/**'
      - '.agents/skills/session-intelligence-harvester/**'
      - '.agents/skills/knowledge-compiler/**'
      - '.agents/skills/vector-memory/**'
      - 'docs/CONSCIENCIA/GITHUB-LABELS-OPERACIONAIS.md'
      - '.github/workflows/autonomia-promocao.yml'
      - '.github/workflows/porta-de-entrada.yml'
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: trigger-fabric-package-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  build-counterproof-package:
    runs-on: [self-hosted, Linux]
    timeout-minutes: 15
    steps:
      - name: Checkout exact PR state
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Prove checkout HEAD
        if: github.event_name == 'pull_request'
        shell: bash
        env:
          EXPECTED_HEAD: ${{ github.event.pull_request.head.sha }}
        run: |
          set -euo pipefail
          actual="$(git rev-parse HEAD)"
          test "$actual" = "$EXPECTED_HEAD"
          echo "HEAD_SHA=$actual"

      - name: Setup Node
        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: '22'

      - name: Verify repository contract facts
        shell: bash
        run: |
          set -euo pipefail
          python scripts/trigger-fabric/verify_repo_contract.py . \
            | tee docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/VERIFY-RESULT.txt
          grep -q '^REPO_CONTRACT_VERIFY=PASS$' docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/VERIFY-RESULT.txt
          grep -q '^BOT_ENTRY_CONTRACT=PASS$' docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/VERIFY-RESULT.txt
          grep -q '^OUTPUT_GUARD_CONTRACT=PASS$' docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/VERIFY-RESULT.txt

      - name: Render architecture PNG from canonical Mermaid
        shell: bash
        run: |
          set -euo pipefail
          npx -y @mermaid-js/mermaid-cli@11.9.0 \
            -i docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARCHITECTURE.mmd \
            -o docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARCHITECTURE.png \
            -b transparent
          test -s docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARCHITECTURE.png

      - name: Build deterministic full ZIP
        shell: bash
        run: |
          set -euo pipefail
          mkdir -p .artifacts/trigger-fabric
          python scripts/trigger-fabric/build_package.py | tee .artifacts/trigger-fabric/build-result.txt
          test -s .artifacts/trigger-fabric/CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE.zip

      - name: Fresh-extraction counterproof
        shell: bash
        run: |
          set -euo pipefail
          rm -rf /tmp/trigger-fabric-verify
          mkdir -p /tmp/trigger-fabric-verify
          python - <<'PY'
          import zipfile
          z='.artifacts/trigger-fabric/CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE.zip'
          with zipfile.ZipFile(z) as f:
              f.extractall('/tmp/trigger-fabric-verify')
          PY
          python scripts/trigger-fabric/verify_package.py \
            /tmp/trigger-fabric-verify/CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE \
            | tee .artifacts/trigger-fabric/extracted-verify-result.txt
          grep -q '^VERIFY=PASS$' .artifacts/trigger-fabric/extracted-verify-result.txt
          grep -q '^BOT_ENTRY_CONTRACT=PASS$' .artifacts/trigger-fabric/extracted-verify-result.txt
          grep -q '^OUTPUT_GUARD_CONTRACT=PASS$' .artifacts/trigger-fabric/extracted-verify-result.txt

      - name: Prove one final ZIP only
        shell: bash
        run: |
          set -euo pipefail
          count=$(find .artifacts/trigger-fabric -maxdepth 1 -type f -name '*.zip' | wc -l)
          test "$count" -eq 1
          sha256sum .artifacts/trigger-fabric/CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE.zip \
            | tee .artifacts/trigger-fabric/ZIP-SHA256.txt

      - name: Upload canonical ZIP
        uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        with:
          name: CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE
          path: .artifacts/trigger-fabric/CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE.zip
          if-no-files-found: error
          retention-days: 30

```