# OUTRO - covector-version-or-publish.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\global-hotkey-0.8.0\.github\workflows\covector-version-or-publish.yml
**SHA:** aa361272dba63b2c
**Timestamp:** 2026-08-28T02:34:12.349664
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: cargo login ${{ secrets.ORG_CRATES_IO_TOKEN  }}
- run: |
- run: cargo tree --depth 0

### Ouro Bruto (primeiros 5000 chars)
```
# Copyright 2022-2022 Tauri Programme within The Commons Conservancy
# SPDX-License-Identifier: Apache-2.0
# SPDX-License-Identifier: MIT

name: covector version or publish

on:
  push:
    branches:
      - dev

jobs:
  version-or-publish:
    runs-on: ubuntu-latest
    timeout-minutes: 65
    outputs:
      change: ${{ steps.covector.outputs.change }}
      commandRan: ${{ steps.covector.outputs.commandRan }}
      successfulPublish: ${{ steps.covector.outputs.successfulPublish }}

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: cargo login
        run: cargo login ${{ secrets.ORG_CRATES_IO_TOKEN  }}
        
      - name: git config
        run: |
          git config --global user.name "${{ github.event.pusher.name }}"
          git config --global user.email "${{ github.event.pusher.email }}"

      - name: covector version or publish (publish when no change files present)
        uses: jbolda/covector/packages/action@covector-v0
        id: covector
        env:
          NODE_AUTH_TOKEN: ${{ secrets.ORG_NPM_TOKEN }}
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          command: 'version-or-publish'
          createRelease: true
          recognizeContributors: true

      - name: Sync Cargo.lock
        if: steps.covector.outputs.commandRan == 'version'
        run: cargo tree --depth 0

      - name: Create Pull Request With Versions Bumped
        if: steps.covector.outputs.commandRan == 'version'
        uses: tauri-apps/create-pull-request@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          title: Apply Version Updates From Current Changes
          commit-message: 'apply version updates'
          labels: 'version updates'
          branch: 'release'
          body: ${{ steps.covector.outputs.change }}

```

---

# OUTRO - covector-version-or-publish.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-winres-0.3.6\.github\workflows\covector-version-or-publish.yml
**SHA:** 1992c70d55c82693
**Timestamp:** 2026-08-28T02:36:01.284065
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: cargo login ${{ secrets.ORG_CRATES_IO_TOKEN }}
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: version or publish

on:
  push:
    branches:
      - main

jobs:
  version-or-publish:
    runs-on: ubuntu-latest
    timeout-minutes: 65
    outputs:
      change: ${{ steps.covector.outputs.change }}
      commandRan: ${{ steps.covector.outputs.commandRan }}
      successfulPublish: ${{ steps.covector.outputs.successfulPublish }}

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0 # required for use of git history
      - name: cargo login
        run: cargo login ${{ secrets.ORG_CRATES_IO_TOKEN }}
      - name: git config
        run: |
          git config --global user.name "${{ github.event.pusher.name }}"
          git config --global user.email "${{ github.event.pusher.email }}"
      - name: covector version or publish (publish when no change files present)
        uses: jbolda/covector/packages/action@covector-v0.8
        id: covector
        env:
          CARGO_AUDIT_OPTIONS: ${{ secrets.CARGO_AUDIT_OPTIONS }}
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          command: 'version-or-publish'
          createRelease: true
      - name: Create Pull Request With Versions Bumped
        id: cpr
        uses: peter-evans/create-pull-request@dd2324fc52d5d43c699a5636bcf19fceaa70c284 # 7.0.7
        if: steps.covector.outputs.commandRan == 'version'
        with:
          title: 'Publish New Versions'
          commit-message: 'publish new versions'
          labels: 'version updates'
          branch: 'ci/release'
          body: ${{ steps.covector.outputs.change }}
          sign-commits: true

```

---

# OUTRO - covector-version-or-publish.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\window-vibrancy-0.6.0\.github\workflows\covector-version-or-publish.yml
**SHA:** ce80e28bb9ecced1
**Timestamp:** 2026-08-28T02:36:54.249486
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: cargo login ${{ secrets.ORG_CRATES_IO_TOKEN }}
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: covector version or publish

on:
  push:
    branches:
      - dev

jobs:
  version-or-publish:
    runs-on: ubuntu-latest
    timeout-minutes: 65
    outputs:
      change: ${{ steps.covector.outputs.change }}
      commandRan: ${{ steps.covector.outputs.commandRan }}
      successfulPublish: ${{ steps.covector.outputs.successfulPublish }}

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: cargo login
        run: cargo login ${{ secrets.ORG_CRATES_IO_TOKEN }}
        
      - name: git config
        run: |
          git config --global user.name "${{ github.event.pusher.name }}"
          git config --global user.email "${{ github.event.pusher.email }}"

      - name: covector version or publish (publish when no change files present)
        uses: jbolda/covector/packages/action@covector-v0
        id: covector
        env:
          CARGO_AUDIT_OPTIONS: ${{ secrets.CARGO_AUDIT_OPTIONS }}
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          command: "version-or-publish"
          createRelease: true
          recognizeContributors: true

      - name: Create Pull Request With Versions Bumped
        id: cpr
        uses: tauri-apps/create-pull-request@v3
        if: steps.covector.outputs.commandRan == 'version'
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          title: Apply Version Updates From Current Changes
          commit-message: 'apply version updates'
          labels: 'version updates'
          branch: 'release'
          body: ${{ steps.covector.outputs.change }}

```