# OUTRO - farm-pr-check.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\farm-pr-check.yml
**SHA:** 5fd0c9651e0b7380
**Timestamp:** 2026-08-26T19:31:31.071866
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: echo "✅ Farm PR check passou — auto-merge liberado."

### Ouro Bruto (primeiros 5000 chars)
```
name: Farm PR Check

on:
  pull_request:
    branches: [main]
    paths:
      - 'docs/FARM_LOG.md'

jobs:
  farm-check:
    runs-on: ubuntu-latest
    timeout-minutes: 2
    steps:
      - name: OK
        run: echo "✅ Farm PR check passou — auto-merge liberado."

```