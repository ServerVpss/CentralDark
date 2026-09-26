# OUTRO - stale.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\.github\workflows\stale.yml
**SHA:** b4137d5bbe6d7e68
**Timestamp:** 2026-08-28T02:56:10.491134
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- operations-per-run: 75 # Limits the number of actions per run to avoid API rate limits

### Ouro Bruto (primeiros 5000 chars)
```
name: Mark Stale Issues and Pull Requests

on:
  schedule:
    - cron: '0 2 * * *' # Runs daily at 2:00 AM UTC
  workflow_dispatch: # Allows manual triggering of the workflow

jobs:
  stale:
    runs-on: ubuntu-latest

    steps:
      - name: Mark stale issues and pull requests
        uses: actions/stale@v11
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          stale-issue-message: 'This issue has been marked as stale due to inactivity. If no further activity occurs, it will be closed in 7 days.'
          stale-pr-message: 'This pull request has been marked as stale due to inactivity. If no further activity occurs, it will be closed in 7 days.'
          days-before-stale: 10 # Number of days before marking an issue or PR as stale
          days-before-close: 4 # Number of days after being marked stale before closing
          stale-issue-label: 'stale' # Label to apply to stale issues
          stale-pr-label: 'stale' # Label to apply to stale pull requests
          exempt-issue-labels: 'pinned,important' # Issues with these labels won't be marked stale
          exempt-pr-labels: 'pinned,important' # PRs with these labels won't be marked stale
          operations-per-run: 75 # Limits the number of actions per run to avoid API rate limits

```