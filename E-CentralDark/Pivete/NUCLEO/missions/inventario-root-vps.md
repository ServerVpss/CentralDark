# MISSAO - inventario-root-vps.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\inventario-root-vps.yml
**SHA:** e90ce02d2ea6afbc
**Timestamp:** 2026-08-26T19:33:13.171307
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: inventario-root-vps.yml manual

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  manual_only:
    name: Manual only
    runs-on: ubuntu-latest
    steps:
      - name: Workflow desativado no push
        shell: bash
        run: |
          echo "Workflow tornado manual-only."
          echo "Arquivo: inventario-root-vps.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```