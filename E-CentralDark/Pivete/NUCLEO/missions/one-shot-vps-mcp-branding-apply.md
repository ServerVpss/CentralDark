# MISSAO - one-shot-vps-mcp-branding-apply.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\one-shot-vps-mcp-branding-apply.yml
**SHA:** d694de5ba6c6eea8
**Timestamp:** 2026-08-26T19:31:26.693723
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Padroes
- bloqueado_por_padrao:

### Ouro Bruto (primeiros 5000 chars)
```
name: One-shot VPS MCP branding apply

on:
  workflow_dispatch:
    inputs:
      confirma:
        description: "Digite SIM para aplicar branding no MCP da VPS"
        required: true
        default: "NAO"

permissions:
  contents: read

jobs:
  bloqueado_por_padrao:
    runs-on: ubuntu-latest
    steps:
      - name: "Evitar execução automática"
        shell: bash
        run: |
          set -euo pipefail
          if [ "${{ github.event.inputs.confirma }}" != "SIM" ]; then
            echo "Workflow arquivado em modo manual. Nenhuma ação aplicada."
            exit 0
          fi
          echo "Aplicação real de branding foi arquivada para evitar runs vermelhos automáticos."
          echo "Recrie um workflow novo e revisado quando essa ação for necessária."
          exit 0

```

---

# MISSAO - one-shot-vps-mcp-branding-apply.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\one-shot-vps-mcp-branding-apply.yml
**SHA:** ecbe365e65a88315
**Timestamp:** 2026-08-26T19:33:13.657294
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: one-shot-vps-mcp-branding-apply.yml manual

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
          echo "Arquivo: one-shot-vps-mcp-branding-apply.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```