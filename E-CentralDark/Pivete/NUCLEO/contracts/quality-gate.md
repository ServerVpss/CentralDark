# CONTRATO - quality-gate.yml
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_agi-self-improvement-main\agi-self-improvement-main\.github\workflows\quality-gate.yml
**SHA:** 6c55f48763887cac
**Timestamp:** 2026-08-26T19:43:44.647632
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |

### Contratos
- quality-gate:

### Ouro Bruto (primeiros 5000 chars)
```
name: Quality Gate

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip setuptools wheel
          python -m pip install -r requirements.txt
          python -m pip install ruff mypy

      - name: Run Hermes quality gate
        env:
          PYTHONPATH: .
          OLLAMA_HOST: http://192.168.1.111:11434
          HERMES_DEFAULT_MODEL: qwen2.5:32b
        run: |
          python scripts/quality_gate.py --json-output quality-gate-report.json

      - name: Upload quality gate report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: quality-gate-report
          path: quality-gate-report.json
          if-no-files-found: ignore

```