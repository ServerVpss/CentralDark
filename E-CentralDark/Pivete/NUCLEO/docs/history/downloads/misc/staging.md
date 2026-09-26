# OUTRO - staging.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\bs58-0.5.1\.github\workflows\staging.yml
**SHA:** 6bd697e2dd67bf61
**Timestamp:** 2026-08-28T02:33:08.955194
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
  staging:
    uses: Nullus157/.github/.github/workflows/staging.yml@main
  success:
    runs-on: ubuntu-latest
    needs: [pull_request, staging]
    if: ${{ always() }}
    steps:
    - if: ${{ contains(needs.*.result, 'failure')  }}
      run: exit 1
    - if: ${{ contains(needs.*.result, 'cancelled')  }}
      run: exit 1
    - if: ${{ contains(needs.*.result, 'skipped')  }}
      run: exit 1

on:
  merge_group:
    type: [checks_requested]

```