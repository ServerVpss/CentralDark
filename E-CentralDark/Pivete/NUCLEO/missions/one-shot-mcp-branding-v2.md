# MISSAO - one-shot-mcp-branding-v2.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\one-shot-mcp-branding-v2.yml
**SHA:** 3be57b1390a60999
**Timestamp:** 2026-08-26T19:31:31.228937
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: One-shot MCP branding v2 (arquivado)

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  archived:
    runs-on: ubuntu-latest
    steps:
      - name: Workflow substituido
        run: |
          echo "Workflow v2 arquivado porque continha YAML invalido."
          echo "Use .github/workflows/one-shot-vps-mcp-branding-apply.yml para aplicar branding do MCP."

```

---

# MISSAO - one-shot-mcp-branding-v2.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\one-shot-mcp-branding-v2.yml
**SHA:** 0ab428879fd7ca26
**Timestamp:** 2026-08-26T19:33:13.525418
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: one-shot-mcp-branding-v2.yml manual

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
          echo "Arquivo: one-shot-mcp-branding-v2.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```