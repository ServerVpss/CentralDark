# COMANDO - patch-install-landing-design.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\patch-install-landing-design.yml
**SHA:** 98f1a3f88262b230
**Timestamp:** 2026-08-26T19:31:26.850231
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: python3 scripts/workflows/patch-landing-design.py
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Patch install landing design

on:
  workflow_dispatch:

permissions:
  contents: write

jobs:
  patch:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Aplicar melhoria visual no comando da landing
        run: python3 scripts/workflows/patch-landing-design.py

      - name: Commit se mudou
        run: |
          if git diff --quiet; then
            echo "Sem mudancas para commit."
            exit 0
          fi
          git config user.name "CentralDark Bot"
          git config user.email "actions@users.noreply.github.com"
          git add CentralDark/apps/install-callback/server.js
          git commit -m "style(install): melhorar bloco de comando da landing" -m "Co-authored-by: SegredoiDev <segredounlock@users.noreply.github.com>"
          git pull --rebase origin main
          git push origin HEAD:main

```