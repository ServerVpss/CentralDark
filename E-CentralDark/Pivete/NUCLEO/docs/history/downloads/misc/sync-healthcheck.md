# OUTRO - sync-healthcheck.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\sync-healthcheck.yml
**SHA:** b794e425a056ef63
**Timestamp:** 2026-08-26T19:31:32.657488
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Sync healthcheck

on:
  workflow_dispatch:
    inputs:
      fail_on_drift:
        description: 'Falhar se encontrar drift espelhavel? use true depois de calibrar'
        required: false
        default: 'false'

concurrency:
  group: sync-healthcheck-main
  cancel-in-progress: false

jobs:
  healthcheck:
    runs-on: ubuntu-latest

    steps:
      - name: Validar secret
        run: |
          if [ -z "${{ secrets.SYNC_TOKEN }}" ]; then
            echo "Secret SYNC_TOKEN nao configurado"
            exit 1
          fi

      - name: Clonar origem e destino
        run: |
          git clone --depth 1 "https://x-access-token:${{ secrets.SYNC_TOKEN }}@github.com/ServerVpss/clone-deck.git" /tmp/source-repo
          git clone --depth 1 "https://x-access-token:${{ secrets.SYNC_TOKEN }}@github.com/segredounlock/clone-deck.git" /tmp/target-repo

      - name: Comparar conteudo espelhavel
        id: drift
        run: |
          cd /tmp/source-repo

          if [ ! -f ".github/sync-excludes.txt" ]; then
            echo "Arquivo .github/sync-excludes.txt ausente na origem"
            exit 1
          fi

          rsync -ani --delete --exclude-from=.github/sync-excludes.txt ./ /tmp/target-repo/ > /tmp/drift.txt || true
          DRIFT_COUNT="$(wc -l < /tmp/drift.txt | tr -d ' ')"
          SOURCE_SHA="$(git rev-parse HEAD)"
          TARGET_SHA="$(git -C /tmp/target-repo rev-parse HEAD)"

          echo "drift_count=$DRIFT_COUNT" >> "$GITHUB_OUTPUT"
          echo "source_sha=$SOURCE_SHA" >> "$GITHUB_OUTPUT"
          echo "target_sha=$TARGET_SHA" >> "$GITHUB_OUTPUT"

          echo "Drift espelhavel: $DRIFT_COUNT"
          sed -n '1,120p' /tmp/drift.txt || true

          if [ "$DRIFT_COUNT" != "0" ] && [ "${{ github.event.inputs.fail_on_drift }}" = "true" ]; then
            echo "Drift detectado e fail_on_drift=true."
            exit 1
          fi

      - name: Summary
        if: always()
        run: |
          SOURCE_SHA="${{ steps.drift.outputs.source_sha }}"
          TARGET_SHA="${{ steps.drift.outputs.target_sha }}"
          DRIFT_COUNT="${{ steps.drift.outputs.drift_count }}"
          if [ -z "$SOURCE_SHA" ]; then SOURCE_SHA="indisponivel"; fi
          if [ -z "$TARGET_SHA" ]; then TARGET_SHA="indisponivel"; fi
          if [ -z "$DRIFT_COUNT" ]; then DRIFT_COUNT="erro"; fi
          {
            echo "# Sync healthcheck"
            echo ""
            echo "- Origem: ServerVpss/clone-deck"
            echo "- Destino: segredounlock/clone-deck"
            echo "- SHA origem: \`$SOURCE_SHA\`"
            echo "- SHA destino: \`$TARGET_SHA\`"
            echo "- Drift espelhavel: \`$DRIFT_COUNT\`"
            echo "- Modo fail_on_drift: \`${{ github.event.inputs.fail_on_drift }}\`"
            echo "- Comparacao: conteudo espelhavel via \`rsync --dry-run\`, nao SHA bruto."
            echo ""
            if [ -f /tmp/drift.txt ]; then
              echo "## Primeiros itens de drift"
              echo '```txt'
              sed -n '1,80p' /tmp/drift.txt
              echo '```'
            fi
          } >> "$GITHUB_STEP_SUMMARY"

```