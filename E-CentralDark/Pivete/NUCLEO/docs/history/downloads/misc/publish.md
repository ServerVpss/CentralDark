# OUTRO - publish.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\json-schema-traverse@1.0.0@@@1\.github\workflows\publish.yml
**SHA:** 56cbec53748d486f
**Timestamp:** 2026-08-28T02:24:44.618871
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: npm install
- - run: npm test
- run: npm publish --tag beta
- run: npm publish

### Ouro Bruto (primeiros 5000 chars)
```
name: publish

on:
  release:
    types: [published]

jobs:
  publish-npm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
        with:
          node-version: 14
          registry-url: https://registry.npmjs.org/
      - run: npm install
      - run: npm test
      - name: Publish beta version to npm
        if: "github.event.release.prerelease"
        run: npm publish --tag beta
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - name: Publish to npm
        if: "!github.event.release.prerelease"
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

```

---

# OUTRO - publish.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\simd-adler32-0.3.10\.github\workflows\publish.yaml
**SHA:** 1acd215e1e86cba8
**Timestamp:** 2026-08-28T02:35:42.947987
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: publish

on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Configure git user
        run: |
          git config user.name "GitHub Actions"
          git config user.email noreply@github.com

      - name: Install cargo-release
        uses: actions-rs/install@v0.1
        with:
          crate: cargo-release
          version: latest

      - name: Publish
        run: |
          echo "${{ secrets.CRATES_IO_TOKEN }}" | cargo login
          cargo --locked release --no-confirm --no-push -x

      - name: Push changes
        uses: ad-m/github-push-action@master
        with:
          tags: true
          force: true
          branch: ${{ github.ref }}
          github_token: ${{ secrets.GITHUB_TOKEN }}

```