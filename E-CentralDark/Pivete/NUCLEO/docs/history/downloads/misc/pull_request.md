# OUTRO - pull_request.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\bs58-0.5.1\.github\workflows\pull_request.yml
**SHA:** aba74f2382934aa5
**Timestamp:** 2026-08-28T02:33:08.953125
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: exit 1
- run: exit 1
- run: exit 1

### Ouro Bruto (primeiros 5000 chars)
```
jobs:
  pull_request:
    uses: Nullus157/.github/.github/workflows/pull_request.yml@main
  success:
    runs-on: ubuntu-latest
    needs: [pull_request]
    if: ${{ always() }}
    steps:
    - if: ${{ contains(needs.*.result, 'failure')  }}
      run: exit 1
    - if: ${{ contains(needs.*.result, 'cancelled')  }}
      run: exit 1
    - if: ${{ contains(needs.*.result, 'skipped')  }}
      run: exit 1

on:
  pull_request:
    branches: [main]

```