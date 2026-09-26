# MISSAO - run-once-monitor-tarefas.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.github\workflows\run-once-monitor-tarefas.yml
**SHA:** 9ac3769d38b09ac1
**Timestamp:** 2026-08-26T19:30:49.531368
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: run-once-monitor-tarefas.yml manual

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
          echo "Arquivo: run-once-monitor-tarefas.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```

---

# MISSAO - run-once-monitor-tarefas.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\run-once-monitor-tarefas.yml
**SHA:** 877984f9c1e00665
**Timestamp:** 2026-08-26T19:31:27.077234
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: "Arquivado - run-once monitor tarefas"
run-name: "Arquivado - run-once monitor tarefas"

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  arquivado:
    name: "Workflow antigo arquivado"
    runs-on: ubuntu-latest
    steps:
      - name: "Resumo"
        run: |
          echo "Este workflow antigo foi arquivado para não gerar falhas vermelhas recorrentes."
          echo "Use o conector MCP/ferramentas VPS controladas para validar monitor_tarefas."
          echo "Nenhuma ação foi executada na VPS."

```