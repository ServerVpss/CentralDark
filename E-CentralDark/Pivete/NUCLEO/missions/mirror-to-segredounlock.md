# MISSAO - mirror-to-segredounlock.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\mirror-to-segredounlock.yml
**SHA:** 6a1f20030d1262e7
**Timestamp:** 2026-08-26T19:31:31.014643
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Mirror to segredounlock backup

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: mirror-to-segredounlock-main
  cancel-in-progress: false

jobs:
  mirror:
    name: Mirror ServerVpss/CentralDark to segredounlock/clone-deck
    runs-on: ubuntu-latest
    steps:
      - name: Validate MIRROR_PAT
        env:
          MIRROR_PAT: ${{ secrets.MIRROR_PAT }}
        shell: bash
        run: |
          set -euo pipefail
          if [ -z "${MIRROR_PAT:-}" ]; then
            echo "::error::Secret MIRROR_PAT ausente no repo principal. Crie em Settings -> Secrets and variables -> Actions."
            exit 1
          fi

      - name: Clone principal as mirror
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        shell: bash
        run: |
          set -euo pipefail
          git clone --mirror "https://x-access-token:${GH_TOKEN}@github.com/ServerVpss/CentralDark.git" centraldark.git

      - name: Push mirror to backup repository
        env:
          MIRROR_PAT: ${{ secrets.MIRROR_PAT }}
        shell: bash
        run: |
          set -euo pipefail
          cd centraldark.git
          git remote set-url --push origin "https://x-access-token:${MIRROR_PAT}@github.com/segredounlock/clone-deck.git"
          echo "Sincronizando mirror: ServerVpss/CentralDark -> segredounlock/clone-deck"
          git push --mirror origin

      - name: Summary
        if: always()
        shell: bash
        run: |
          {
            echo "## Mirror para backup"
            echo ""
            echo "- Origem: ServerVpss/CentralDark"
            echo "- Destino: segredounlock/clone-deck"
            echo "- Modo: git clone --mirror + git push --mirror"
            echo "- Branch/evento: ${{ github.ref_name }} / ${{ github.event_name }}"
            echo "- Commit: ${{ github.sha }}"
            echo "- Observação: o repositório espelho deve permanecer com Actions desativadas nas configurações."
          } >> "$GITHUB_STEP_SUMMARY"

```

---

# MISSAO - mirror-to-segredounlock.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\mirror-to-segredounlock.yml
**SHA:** cdeefbda60002fc5
**Timestamp:** 2026-08-26T19:33:14.447249
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: mirror-to-segredounlock.yml manual

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
          echo "Arquivo: mirror-to-segredounlock.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```