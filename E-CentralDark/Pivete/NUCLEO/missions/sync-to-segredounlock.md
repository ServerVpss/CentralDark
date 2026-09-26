# MISSAO - sync-to-segredounlock.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.github\workflows\sync-to-segredounlock.yml
**SHA:** c90cf825ed2fd5d4
**Timestamp:** 2026-08-26T19:30:49.614533
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: sync-to-segredounlock.yml manual

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
          echo "Arquivo: sync-to-segredounlock.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```

---

# MISSAO - sync-to-segredounlock.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\sync-to-segredounlock.yml
**SHA:** 3b8e631b7a41342a
**Timestamp:** 2026-08-26T19:31:27.277505
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Sync to segredounlock (DEPRECATED)

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  deprecated:
    runs-on: ubuntu-latest
    steps:
      - name: Deprecated workflow
        run: |
          echo "Este workflow foi desativado."
          echo "Método oficial: .github/workflows/mirror-to-segredounlock.yml"
          echo "Motivo: evitar dois métodos concorrentes de espelhamento."
          echo "O espelho segredounlock/clone-deck deve permanecer com Actions desativadas nas Settings."

```