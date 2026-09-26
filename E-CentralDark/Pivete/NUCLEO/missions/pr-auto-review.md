# MISSAO - pr-auto-review.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.github\workflows\pr-auto-review.yml
**SHA:** 7ef43b2a9f9f0dc2
**Timestamp:** 2026-08-26T19:30:49.949461
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |

### Gaps
- echo "missing=$MISS" >> "$GITHUB_OUTPUT"

### Ouro Bruto (primeiros 5000 chars)
```
name: PR auto-review (Codex + checklist)

# Em todo PR pra main:
#  - aplica label `needs-codex-review` (o conector Codex reage a label)
#  - roda checagens automáticas (segredo, trailer Co-authored-by, validadores offline do bot-server)
#  - posta/atualiza checklist em PT-BR com itens já marcados quando o código prova que passou
# Nada destrutivo. Não bloqueia merge — só sinaliza.

on:
  pull_request:
    types: [opened, reopened, ready_for_review, synchronize]
    branches: [main]

permissions:
  contents: read
  pull-requests: write
  issues: write

concurrency:
  group: pr-auto-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  triage:
    name: Triage + checklist auto-marcado
    runs-on: ubuntu-latest
    if: github.repository == 'ServerVpss/CentralDark' && !github.event.pull_request.draft
    steps:
      - name: Checkout do PR
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          ref: ${{ github.event.pull_request.head.sha }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      # ---------- Checagens automáticas ----------

      - name: Detectar arquivos alterados
        id: diff
        run: |
          BASE='${{ github.event.pull_request.base.sha }}'
          HEAD='${{ github.event.pull_request.head.sha }}'
          git fetch origin "$BASE" --depth=1 || true
          CHANGED=$(git diff --name-only "$BASE" "$HEAD" || true)
          echo "$CHANGED" > /tmp/changed.txt
          echo "lista alterada:"; cat /tmp/changed.txt
          if grep -E '^CentralDark/apps/bot-server/' /tmp/changed.txt >/dev/null; then
            echo "touched_bot=true" >> "$GITHUB_OUTPUT"
          else
            echo "touched_bot=false" >> "$GITHUB_OUTPUT"
          fi
          # Padrões "cara de segredo" adicionados no diff
          if git diff "$BASE" "$HEAD" -- . \
              ':(exclude)**/*.md' ':(exclude)**/package-lock.json' \
              | grep -E '^\+' \
              | grep -E '(\.env(\s|$)|secrets/|tokens/|sessions/|\.ssh/|-----BEGIN [A-Z ]*PRIVATE KEY-----|\.pem"|\.key")' \
              >/dev/null; then
            echo "secret_suspect=true" >> "$GITHUB_OUTPUT"
          else
            echo "secret_suspect=false" >> "$GITHUB_OUTPUT"
          fi
          # Paths sensíveis (Docker / WuzAPI / Caddy / WhatsApp / CRM / banco)
          if grep -E '(^|/)(Dockerfile|docker-compose|Caddyfile|wuzapi|whatsapp|crm/|migrations/|prisma/migrations)' /tmp/changed.txt -i >/dev/null; then
            echo "touched_sensitive=true" >> "$GITHUB_OUTPUT"
          else
            echo "touched_sensitive=false" >> "$GITHUB_OUTPUT"
          fi
          # Pastas novas (precisam README + PLANO)
          MISSING_DOCS=""
          for d in $(git diff --diff-filter=A --name-only "$BASE" "$HEAD" | awk -F/ 'NF>1{ for(i=1;i<NF;i++){p=(i==1?$1:p"/"$i); print p} }' | sort -u); do
            [ -d "$d" ] || continue
            case "$d" in node_modules*|.git*|dist*|build*|.github*|.lovable*) continue;; esac
            if [ ! -f "$d/README.md" ] || [ ! -f "$d/PLANO.md" ]; then
              MISSING_DOCS="$MISSING_DOCS $d"
            fi
          done
          if [ -z "$MISSING_DOCS" ]; then
            echo "docs_ok=true" >> "$GITHUB_OUTPUT"
          else
            echo "docs_ok=false" >> "$GITHUB_OUTPUT"
            echo "Pastas sem README/PLANO:$MISSING_DOCS"
          fi
          # Instalador atualizado se mexeu em install.sh ou afins?
          if grep -E '(^install\.sh$|^scripts/(deploy|install)/|^CentralDark/apps/install-callback/)' /tmp/changed.txt >/dev/null; then
            if grep -E '^docs/INSTALADOR/' /tmp/changed.txt >/dev/null; then
              echo "installer_docs=true" >> "$GITHUB_OUTPUT"
            else
              echo "installer_docs=false" >> "$GITHUB_OUTPUT"
            fi
          else
            echo "installer_docs=na" >> "$GITHUB_OUTPUT"
          fi

      - name: Conferir trailer Co-authored-by
        id: trailer
        run: |
          BASE='${{ github.event.pull_request.base.sha }}'
          HEAD='${{ github.event.pull_request.head.sha }}'
          MISS=0; TOTAL=0
          for c in $(git rev-list "$BASE..$HEAD"); do
            TOTAL=$((TOTAL+1))
            if ! git log -1 --format=%B "$c" | grep -qi 'Co-authored-by: SegredoiDev'; then
              MISS=$((MISS+1))
            fi
          done
          echo "total=$TOTAL" >> "$GITHUB_OUTPUT"
          echo "missing=$MISS" >> "$GITHUB_OUTPUT"
          if [ "$TOTAL" -gt 0 ] && [ "$MISS" -eq 0 ]; then
            echo "ok=true" >> "$GITHUB_OUTPUT"
          else
            echo "ok=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Validadores offline do bot-server
        id: validators
        if: steps.diff.outputs.touched_bot == 'true'
        continue-on-error: true
        working-directory: CentralDark/apps/bot-server
        run: |
          npm ci --no-audit --no-fund
          set +e
         
```