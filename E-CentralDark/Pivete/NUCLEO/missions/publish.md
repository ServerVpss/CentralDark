# MISSAO - publish.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cfg-if-1.0.4\.github\workflows\publish.yaml
**SHA:** 1417805078704eec
**Timestamp:** 2026-08-28T02:33:23.454388
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: rustup update nightly --no-self-update && rustup default nightly

### Ouro Bruto (primeiros 5000 chars)
```
name: Release-plz

permissions:
  pull-requests: write
  contents: write

on:
  push: { branches: [main] }

jobs:
  release-plz:
    name: Release-plz
    runs-on: ubuntu-24.04
    steps:
      - name: Checkout repository
        uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - name: Install Rust (rustup)
        run: rustup update nightly --no-self-update && rustup default nightly
      - name: Run release-plz
        uses: MarcoIeni/release-plz-action@v0.5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CARGO_REGISTRY_TOKEN: ${{ secrets.CARGO_REGISTRY_TOKEN }}

```

---

# MISSAO - publish.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\glob-0.3.4\.github\workflows\publish.yml
**SHA:** 208b5ae6f23c636e
**Timestamp:** 2026-08-28T02:34:11.933434
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: rustup update nightly --no-self-update && rustup default nightly

### Ouro Bruto (primeiros 5000 chars)
```
name: Release-plz

permissions:
  pull-requests: write
  contents: write

on:
  push:
    branches:
      - master

jobs:
  release-plz:
    name: Release-plz
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v7
        with:
          fetch-depth: 0
      - name: Install Rust (rustup)
        run: rustup update nightly --no-self-update && rustup default nightly
      - name: Run release-plz
        uses: MarcoIeni/release-plz-action@v0.5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CARGO_REGISTRY_TOKEN: ${{ secrets.CARGO_REGISTRY_TOKEN }}

```