# MISSAO - github-bot-controller.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\github-bot-controller.yml
**SHA:** b9599924406f9578
**Timestamp:** 2026-08-26T19:33:13.535454
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dry_run:
- run: node --version
- DRY_RUN: ${{ github.event_name == 'workflow_dispatch' && github.event.inputs.dry_run || 'auto' }}
- run: node CentralDark/scripts/github-bot-controller.mjs

### Ouro Bruto (primeiros 5000 chars)
```
name: GitHub Bot Controller

on:
  workflow_dispatch:
    inputs:
      dry_run:
        description: "Rodar em dry-run?"
        required: true
        default: "true"
        type: choice
        options:
          - "true"
          - "false"
      merged_pr:
        description: "PR consolidada mergeada que substituiu outras PRs"
        required: false
        default: ""
      supersedes:
        description: "Lista de PRs substituídas. Exemplo: #14 #16 #11"
        required: false
        default: ""
  pull_request:
    types:
      - closed
  schedule:
    - cron: "17 9 * * *"

permissions:
  contents: read
  pull-requests: write
  issues: write
  actions: read

concurrency:
  group: github-bot-controller-${{ github.ref }}
  cancel-in-progress: false

jobs:
  controller:
    name: Auditar PRs e fechar substituídas com segurança
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Validar runtime Node
        run: node --version

      - name: Executar GitHub Bot Controller
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BOT_EXPECTED_REPOSITORY: ServerVpss/CentralDark
          DRY_RUN: ${{ github.event_name == 'workflow_dispatch' && github.event.inputs.dry_run || 'auto' }}
          BOT_MERGED_PR: ${{ github.event_name == 'workflow_dispatch' && github.event.inputs.merged_pr || '' }}
          BOT_SUPERSEDES: ${{ github.event_name == 'workflow_dispatch' && github.event.inputs.supersedes || '' }}
        run: node CentralDark/scripts/github-bot-controller.mjs

```

---

# MISSAO - github-bot-controller.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\github-bot-controller.yml
**SHA:** 705aeefc8e6c498b
**Timestamp:** 2026-08-28T02:56:03.244050
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dry_run:
- run: node --version
- DRY_RUN: ${{ github.event_name == 'workflow_dispatch' && github.event.inputs.dry_run || 'auto' }}
- run: node scripts/github-bot-controller.mjs

### Ouro Bruto (primeiros 5000 chars)
```
name: GitHub Bot Controller

on:
  workflow_dispatch:
    inputs:
      dry_run:
        description: "Rodar auditoria legada em dry-run?"
        required: true
        default: "true"
        type: choice
        options:
          - "true"
          - "false"
      merged_pr:
        description: "PR consolidada mergeada que substituiu outras PRs"
        required: false
        default: ""
      supersedes:
        description: "Lista de PRs substituídas. Exemplo: #14 #16 #11"
        required: false
        default: ""
  pull_request:
    types: [closed]
  repository_dispatch:
    types: [centraldark_post_merge]
  schedule:
    - cron: "17 9 * * *"

permissions:
  contents: read
  pull-requests: write
  issues: write
  actions: read

concurrency:
  group: github-bot-controller-${{ github.ref }}
  cancel-in-progress: false

jobs:
  controller:
    name: Auditar PRs e fechar substituídas com segurança
    runs-on: [self-hosted, Linux]
    timeout-minutes: 10

    steps:
      - name: Checkout confiável da main
        uses: actions/checkout@v7
        with:
          ref: main
          persist-credentials: false

      - name: Validar runtime Node
        run: node --version

      - name: Executar GitHub Bot Controller legado
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BOT_EXPECTED_REPOSITORY: ServerVpss/CentralDark
          BOT_EVENT_NAME: ${{ github.event_name }}
          DRY_RUN: ${{ github.event_name == 'workflow_dispatch' && github.event.inputs.dry_run || 'auto' }}
          BOT_MERGED_PR: ${{ github.event_name == 'workflow_dispatch' && github.event.inputs.merged_pr || '' }}
          BOT_SUPERSEDES: ${{ github.event_name == 'workflow_dispatch' && github.event.inputs.supersedes || '' }}
        run: node scripts/github-bot-controller.mjs

```