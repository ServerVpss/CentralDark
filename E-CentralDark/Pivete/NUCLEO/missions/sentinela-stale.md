# MISSAO - sentinela-stale.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.github\workflows\sentinela-stale.yml
**SHA:** 6806e550e82366ad
**Timestamp:** 2026-08-26T19:30:49.532427
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: node scripts/sentinela/stale.mjs

### Ouro Bruto (primeiros 5000 chars)
```
name: sentinela-stale

# Varre Issues abertas com label `sentinela` que passaram do TTL (7 dias)
# sem PR linkado. Marca como `stale` e escala severidade.

on:
  schedule:
    - cron: '0 12 * * *'
  workflow_dispatch:

permissions:
  issues: write
  contents: read

jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '20'
      - name: Marcar stale e escalar
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          REPO_ALVO: ${{ github.repository }}
          TTL_DIAS: '7'
        run: node scripts/sentinela/stale.mjs

```

---

# MISSAO - sentinela-stale.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\sentinela-stale.yml
**SHA:** 079fcb6c48bc7f5d
**Timestamp:** 2026-08-28T02:56:03.945407
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: node scripts/sentinela/stale.mjs

### Ouro Bruto (primeiros 5000 chars)
```
name: sentinela-stale

# Varre Issues abertas com label `sentinela` que passaram do TTL (7 dias)
# sem PR linkado. Marca como `stale` e escala severidade.

on:
  schedule:
    - cron: '0 12 * * *'
  workflow_dispatch:

permissions:
  issues: write
  contents: read

jobs:
  stale:
    runs-on: [self-hosted, Linux]
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: '24'
      - name: Marcar stale e escalar
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          REPO_ALVO: ${{ github.repository }}
          TTL_DIAS: '7'
        run: node scripts/sentinela/stale.mjs

```