# MISSAO - run-once-add-mcp-icon.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.github\workflows\run-once-add-mcp-icon.yml
**SHA:** a39b6bfce257511e
**Timestamp:** 2026-08-26T19:30:49.530371
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: run-once-add-mcp-icon.yml manual

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  manual_only:
    name: Manual only
    runs-on: ubuntu-latest
    steps:
      - name: Workflow desativado no push
        shell: bash
        run: |
          echo "Workflow tornado manual-only."
          echo "Arquivo: run-once-add-mcp-icon.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```

---

# MISSAO - run-once-add-mcp-icon.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\run-once-add-mcp-icon.yml
**SHA:** 8793efc8d3304a6e
**Timestamp:** 2026-08-26T19:31:26.783075
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Run once - add MCP icon

on:
  workflow_dispatch:
  push:
    branches:
      - main
    paths:
      - .github/workflows/run-once-add-mcp-icon.yml

permissions:
  contents: write

concurrency:
  group: run-once-add-mcp-icon
  cancel-in-progress: false

jobs:
  add-mcp-icon:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Add CentralDark MCP icon
        shell: bash
        run: |
          set -euo pipefail

          target="CentralDark/apps/mcp/centraldark-mcp-icon.png"
          mkdir -p "$(dirname "$target")"

          cat > /tmp/centraldark-mcp-icon.b64 <<'ICON_B64'
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
```