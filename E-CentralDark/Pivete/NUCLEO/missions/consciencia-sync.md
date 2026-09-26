# MISSAO - consciencia-sync.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\consciencia-sync.yml
**SHA:** 1ac166c094bc68da
**Timestamp:** 2026-08-26T19:31:26.324134
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Consciência - Sync da skill

# Regenera arquivos derivados da skill `centraldark-consciencia` sempre que
# a fonte muda (PENDENCIAS.md, CONSCIENCIA.md). Mantém a skill sempre alinhada
# com a fonte da verdade — sem duplicação manual.

on:
  push:
    branches: [main]
    paths:
      - 'docs/PENDENCIAS.md'
      - 'docs/CONSCIENCIA/**'
      - 'skills/centraldark-consciencia/SKILL.md'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  regenerar-pendencias-ativas:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Regenerar pendencias-ativas.md
        run: |
          DEST="skills/centraldark-consciencia/pendencias-ativas.md"
          SRC="docs/PENDENCIAS.md"

          if [ ! -f "$SRC" ]; then
            echo "::warning::$SRC não existe — pulando."
            exit 0
          fi

          AGORA=$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M:%S %Z')

          {
            echo "# Pendências ativas — auto-gerado"
            echo ""
            echo "> Espelho automático de \`docs/PENDENCIAS.md\` mantido pelo workflow \`.github/workflows/consciencia-sync.yml\`."
            echo ">"
            echo "> **Não editar à mão.** Atualize \`docs/PENDENCIAS.md\` direto."
            echo ""
            echo "Última sincronização: $AGORA"
            echo ""
            echo "---"
            echo ""
            cat "$SRC"
          } > "$DEST"

      - name: Detectar mudanças
        id: diff
        run: |
          if git diff --quiet skills/centraldark-consciencia/pendencias-ativas.md; then
            echo "mudou=false" >> $GITHUB_OUTPUT
          else
            echo "mudou=true" >> $GITHUB_OUTPUT
          fi

      - name: Commitar regeneração
        if: steps.diff.outputs.mudou == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add skills/centraldark-consciencia/pendencias-ativas.md
          git commit -m "skill(consciencia): sync pendencias-ativas.md

          Co-authored-by: SegredoiDev <segredounlock@users.noreply.github.com>"
          git push

```

---

# MISSAO - consciencia-sync.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\.github\workflows\consciencia-sync.yml
**SHA:** 4c6f672d8f4ce0d9
**Timestamp:** 2026-08-26T19:33:13.521417
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: consciencia-sync.yml manual

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
          echo "Arquivo: consciencia-sync.yml"
          echo "Motivo: limpeza dos workflows vermelhos e pausa de automações antigas."
          echo "Este workflow não roda mais em push."

```