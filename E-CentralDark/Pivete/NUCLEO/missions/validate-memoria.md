# MISSAO - validate-memoria.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.github\workflows\validate-memoria.yml
**SHA:** 4364d98a67a61fc2
**Timestamp:** 2026-08-26T19:30:49.625303
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: validate-memoria.yml manual

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
          echo "Arquivo: validate-memoria.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```

---

# MISSAO - validate-memoria.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\validate-memoria.yml
**SHA:** a32df7a1db4b1c64
**Timestamp:** 2026-08-26T19:31:27.429880
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: python conexao-ia/validate_memoria_checklist.py

### Ouro Bruto (primeiros 5000 chars)
```
name: Validate Memoria Operacional

on:
  push:
    branches:
      - main
    paths:
      - 'conexao-ia/MEMORIA_OPERACIONAL_IA.md'
      - 'conexao-ia/CHECKLIST_EXECUCAO.md'
      - 'conexao-ia/validate_memoria_checklist.py'
      - '.github/workflows/validate-memoria.yml'
  pull_request:
    paths:
      - 'conexao-ia/**'
      - '.github/workflows/validate-memoria.yml'

permissions:
  contents: read

env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Validate memoria e checklist
        run: python conexao-ia/validate_memoria_checklist.py

```