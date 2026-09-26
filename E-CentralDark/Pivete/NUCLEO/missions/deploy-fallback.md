# MISSAO - deploy-fallback.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\deploy-fallback.yml
**SHA:** 5cf45fecb0dce1f5
**Timestamp:** 2026-08-26T19:33:13.179314
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: deploy-fallback.yml manual

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
          echo "Arquivo: deploy-fallback.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```