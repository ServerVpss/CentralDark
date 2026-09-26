# MISSAO - auto-pr-memoria.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\auto-pr-memoria.yml
**SHA:** 308a8e019b0d6484
**Timestamp:** 2026-08-26T19:31:26.289085
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Auto PR Memoria Operacional

on:
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"

jobs:
  auto-pr-memoria:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v5

      - name: Executar atualização da memória
        run: |
          chmod +x scripts/ia/auto-update-memoria.sh
          scripts/ia/auto-update-memoria.sh

      - name: Criar PR automático
        uses: peter-evans/create-pull-request@v7
        with:
          branch: auto/memoria-operacional
          title: "docs: atualizar memoria operacional"
          commit-message: "docs: atualizar memoria operacional"
          body: |
            Atualização automática dos arquivos operacionais da IA.

            Arquivos:
            - conexao-ia/MEMORIA_OPERACIONAL_IA.md
            - conexao-ia/CHECKLIST_EXECUCAO.md
            - conexao-ia/SCHEMAS_FERRAMENTAS_GITHUB.md
          base: main
          delete-branch: true
```

---

# MISSAO - auto-pr-memoria.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\auto-pr-memoria.yml
**SHA:** 6017ec6de0d748c7
**Timestamp:** 2026-08-26T19:33:13.642278
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: auto-pr-memoria.yml manual

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
          echo "Arquivo: auto-pr-memoria.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```