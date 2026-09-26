# MISSAO - one-shot-mcp-branding.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\one-shot-mcp-branding.yml
**SHA:** a11bc337eef3d1fa
**Timestamp:** 2026-08-26T19:31:26.678845
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: One-shot MCP branding seguro (arquivado)

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
          echo "Workflow antigo arquivado porque continha YAML invalido."
          echo "Use .github/workflows/one-shot-vps-mcp-branding-apply.yml para aplicar branding do MCP."

```

---

# MISSAO - one-shot-mcp-branding.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\one-shot-mcp-branding.yml
**SHA:** fa6acb10b77ac284
**Timestamp:** 2026-08-26T19:33:13.224379
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: one-shot-mcp-branding.yml manual

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
          echo "Arquivo: one-shot-mcp-branding.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```