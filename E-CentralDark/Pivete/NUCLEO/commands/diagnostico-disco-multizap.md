# COMANDO - diagnostico-disco-multizap.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\.github\workflows\diagnostico-disco-multizap.yml
**SHA:** 7cdd7deb12a10c00
**Timestamp:** 2026-08-26T19:31:26.495671
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Diagnóstico disco Multizap

on:
  workflow_dispatch:

permissions:
  contents: write

env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"

jobs:
  diagnostico:
    runs-on: ubuntu-latest
    timeout-minutes: 12
    steps:
      - name: Checkout
        uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - name: Reconstruir chave SSH da VPS
        env:
          VPS_SSH_KEY_LOVABLE: ${{ secrets.VPS_SSH_KEY_LOVABLE }}
        run: |
          set -euo pipefail
          if [ -z "${VPS_SSH_KEY_LOVABLE:-}" ]; then
            echo "::error::secret VPS_SSH_KEY_LOVABLE vazia"
            exit 1
          fi
          python3 - <<'PY'
          import os, re, base64, textwrap
          raw = os.environ["VPS_SSH_KEY_LOVABLE"]
          s = raw.replace("\\n", "\n")
          if "BEGIN" in s and s.count("\n") > 3:
              key = s.strip() + "\n"
          else:
              m = re.search(r"(-----BEGIN [^-]+-----)(.*?)(-----END [^-]+-----)", s, re.S)
              if m:
                  header, body, footer = m.group(1), m.group(2), m.group(3)
                  body = re.sub(r"\s+", "", body)
                  wrapped = "\n".join(textwrap.wrap(body, 70))
                  key = f"{header}\n{wrapped}\n{footer}\n"
              else:
                  b64 = re.sub(r"\s+", "", s)
                  key = base64.b64decode(b64).decode("utf-8").strip() + "\n"
          with open("/tmp/vps_key", "w") as f:
              f.write(key)
          os.chmod("/tmp/vps_key", 0o600)
          print(f"chave reconstruida: {len(key)} bytes")
          PY
          ssh-keygen -y -f /tmp/vps_key >/dev/null
          echo "chave SSH válida"

      - name: Rodar diagnóstico somente leitura na VPS
        env:
          VPS_HOST: ${{ secrets.VPS_HOST_LOVABLE }}
          VPS_USER: ${{ secrets.VPS_USER_LOVABLE }}
        run: |
          set +e
          : "${VPS_USER:=root}"
          SSH_OPTS="-i /tmp/vps_key -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR"
          ssh $SSH_OPTS "$VPS_USER@$VPS_HOST" 'bash -s' > /tmp/diagnostico-remote.out 2>&1 <<'REMOTE'
          set +e
          TASK="diagnostico-disco-multizap"
          TS="$(date +%Y%m%d-%H%M%S)"
          BASE="/root/Multizap"
          OUT="/root/Multizap/revisoes/$TS/$TASK"
          mkdir -p "$OUT" 2>/dev/null || OUT="/tmp/$TASK-$TS"
          mkdir -p "$OUT" 2>/dev/null || true
          REPORT="$OUT/resumo.md"
          sanitize() {
            sed -E 's/(token|password|authorization|apikey|api_key|secret|bearer|client_secret|connection|string)[=: ]+[^[:space:]]+/\1=***OCULTO***/Ig'
          }
          human_find() {
            awk -F '\t' '{ cmd="numfmt --to=iec --suffix=B " $1; cmd | getline h; close(cmd); $1=h; print }'
          }
          {
            echo "# Diagnóstico de disco — /root/Multizap"
            echo
            echo "Data BRT: $(TZ=America/Sao_Paulo date '+%Y-%m-%d %H:%M:%S %Z')"
            echo "Ação: somente leitura. Nada foi apagado."
            echo
            echo "## Espaço geral"
            echo '```txt'
            df -h / 2>/dev/null
            echo
            df -ih / 2>/dev/null
            echo '```'
            echo
            echo "## Tamanho total de /root/Multizap"
            echo '```txt'
            timeout 60 du -sh "$BASE" 2>/dev/null || echo "TIMEOUT/ERRO: medição total passou de 60s ou falhou"
            echo '```'
            echo
            echo "## Tamanho das pastas/arquivos diretos em /root/Multizap"
            echo '```txt'
            if [ -d "$BASE" ]; then
              find "$BASE" -mindepth 1 -maxdepth 1 -print0 2>/dev/null | while IFS= read -r -d '' p; do
                size="$(timeout 25 du -sh "$p" 2>/dev/null | awk '{print $1}')"
                [ -n "$size" ] || size="TIMEOUT/ERRO"
                printf '%-14s %s\n' "$size" "$p"
              done | sort -h
            else
              echo "ERRO: $BASE não existe"
            fi
            echo '```'
            echo
            echo "## Arquivos grandes acima de 100 MB, ignorando node_modules"
            echo '```txt'
            timeout 140 find "$BASE" -xdev \( -path '*/node_modules' -o -path '*/node_modules/*' \) -prune -o -type f -size +100M -printf '%s\t%TY-%Tm-%Td %TH:%TM\t%p\n' 2>/dev/null \
              | sort -nr | head -80 | human_find | sanitize || echo "TIMEOUT/ERRO na busca de arquivos grandes"
            echo '```'
            echo
            echo "## Suspeitos scan-secrets / secret scan"
            echo '```txt'
            timeout 140 find "$BASE" -xdev \( -path '*/node_modules' -o -path '*/node_modules/*' \) -prune -o -type f \( -iname '*scan*secret*' -o -iname '*secret*scan*' -o -iname '*scan-secrets*' -o -iname '*secrets*.log' \) -printf '%s\t%TY-%Tm-%Td %TH:%TM\t%p\n' 2>/dev/null \
              | sort -nr | head -80 | human_find | sanitize || echo "TIMEOUT/ERRO na busca de scan-secrets"
            echo '```'
            echo
            echo "## node_modules en
```