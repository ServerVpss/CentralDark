# MISSAO - docs.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\Bolt\source\.github\workflows\docs.yaml
**SHA:** d11a466870bebe72
**Timestamp:** 2026-08-28T02:56:10.254107
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run:
- run: |
- - run: echo "cache_id=$(date --utc '+%V')" >> $GITHUB_ENV
- - run: pip install mkdocs-material
- - run: mkdocs gh-deploy --force

### Ouro Bruto (primeiros 5000 chars)
```
name: Docs CI/CD

on:
  push:
    branches:
      - main
    paths:
      - 'docs/**' # This will only trigger the workflow when files in docs directory change
permissions:
  contents: write
jobs:
  build_docs:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./docs
    steps:
      - uses: actions/checkout@v7
      - name: Configure Git Credentials
        run: |
          git config user.name github-actions[bot]
          git config user.email 41898282+github-actions[bot]@users.noreply.github.com
      - uses: actions/setup-python@v7
        with:
          python-version: 3.x
      - run: echo "cache_id=$(date --utc '+%V')" >> $GITHUB_ENV
      - uses: actions/cache@v5
        with:
          key: mkdocs-material-${{ env.cache_id }}
          path: .cache
          restore-keys: |
            mkdocs-material-

      - run: pip install mkdocs-material
      - run: mkdocs gh-deploy --force

```