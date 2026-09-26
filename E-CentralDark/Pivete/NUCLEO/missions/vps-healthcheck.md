# MISSAO - vps-healthcheck.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.github\workflows\vps-healthcheck.yml
**SHA:** 354e5926c469388f
**Timestamp:** 2026-08-26T19:30:49.937934
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: node scripts/bots/vps-healthcheck.mjs
- run: |
- run: rm -f ~/.ssh/vps_key

### Ouro Bruto (primeiros 5000 chars)
```
name: vps-healthcheck

# Bot read-only: roda 10 checks na VPS via SSH e abre/atualiza 1 Issue consolidada.
# NUNCA reinicia serviço, NUNCA edita Caddy/Docker/WuzAPI, NUNCA toca em sessão WhatsApp.
# Severidade automática (p0/p1/p2/p3). Issue se atualiza no lugar — não duplica.

on:
  workflow_dispatch:
  schedule:
    - cron: '0 */6 * * *' # a cada 6h
  push:
    branches: [main]
    paths:
      - 'scripts/bots/vps-healthcheck.mjs'
      - 'scripts/bots/lib/gh.mjs'
      - '.github/workflows/vps-healthcheck.yml'

permissions:
  issues: write
  contents: write


concurrency:
  group: vps-healthcheck
  cancel-in-progress: false

jobs:
  healthcheck:
    runs-on: ubuntu-latest
    if: github.repository == 'ServerVpss/CentralDark'
    timeout-minutes: 8
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Preparar chave SSH (somente leitura)
        env:
          VPS_SSH_KEY_LOVABLE: ${{ secrets.VPS_SSH_KEY_LOVABLE }}
        run: |
          set -e
          if [ -z "${VPS_SSH_KEY_LOVABLE:-}" ]; then
            echo "::warning::secret VPS_SSH_KEY_LOVABLE ausente — pulando healthcheck"
            echo "SKIP=1" >> $GITHUB_ENV
            exit 0
          fi
          mkdir -p ~/.ssh
          printf '%s\n' "$VPS_SSH_KEY_LOVABLE" > ~/.ssh/vps_key
          chmod 600 ~/.ssh/vps_key
          # Valida chave sem expor conteúdo
          if ! ssh-keygen -y -f ~/.ssh/vps_key >/dev/null 2>&1; then
            echo "::warning::chave SSH inválida (provável corte no transporte da secret) — pulando healthcheck."
            echo "SKIP=1" >> $GITHUB_ENV
            exit 0
          fi
          echo "VPS_SSH_KEY_FILE=$HOME/.ssh/vps_key" >> $GITHUB_ENV

      - name: Rodar vps-healthcheck
        if: env.SKIP != '1'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPOSITORY: ${{ github.repository }}
          VPS_HOST: ${{ secrets.VPS_HOST_LOVABLE }}
          VPS_USER: ${{ secrets.VPS_USER_LOVABLE }}
        run: node scripts/bots/vps-healthcheck.mjs

      - name: Commitar histórico atualizado (se mudou)
        if: env.SKIP != '1'
        run: |
          set -e
          FILE="CentralDark/apps/projeto-dashboard/healthcheck-history.json"
          if git diff --quiet -- "$FILE"; then
            echo "[history] sem mudanças no histórico — nada a commitar"
            exit 0
          fi
          git config user.name  "vps-healthcheck-bot"
          git config user.email "vps-healthcheck@users.noreply.github.com"
          git add "$FILE"
          git commit -m "chore(painel): atualiza histórico do vps-healthcheck" -m "Co-authored-by: SegredoiDev <segredounlock@users.noreply.github.com>"

          # Push idempotente com retry simples (rebase se outro push aconteceu no meio)
          for i in 1 2 3; do
            if git push; then break; fi
            echo "[history] push falhou, rebase + retry ($i)"
            git pull --rebase --autostash || true
            sleep 2
          done

      - name: Limpar chave
        if: always()
        run: rm -f ~/.ssh/vps_key


```

---

# MISSAO - vps-healthcheck.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\vps-healthcheck.yml
**SHA:** fc5535cfd0c5a422
**Timestamp:** 2026-08-28T02:56:04.227736
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: VPS HealthCheck
# Bot de monitoramento — roda direto na VPS via self-hosted runner.
# Sem SSH (runner já é local). Envia relatório pelo canal oficial notify-telegram.

on:
  workflow_dispatch:
  schedule:
    - cron: '0 */6 * * *'

permissions:
  contents: read

concurrency:
  group: vps-healthcheck
  cancel-in-progress: false

jobs:
  healthcheck:
    runs-on: [self-hosted, Linux]
    timeout-minutes: 5
    env:
      NOTIFY_API_KEY: ${{ secrets.NOTIFY_API_KEY }}
    steps:
      - name: Coletar e notificar
        shell: bash
        run: |
          set +e
          HOST=$(hostname)
          UPTIME=$(uptime | sed 's/^ *//')
          LOAD=$(cut -d' ' -f1-3 /proc/loadavg)
          DISK=$(df -h / | awk 'NR==2{print $3"/"$2" ("$5")"}')
          DISK_PCT=$(df / | awk 'NR==2{gsub("%","",$5);print $5+0}')
          MEM=$(free -h | awk '/Mem:/{print $3"/"$2}')
          PM2_JSON=$(pm2 jlist 2>/dev/null || echo "[]")
          PM2_ON=$(echo "$PM2_JSON"  | jq '[.[]|select(.pm2_env.status=="online")]  | length' 2>/dev/null || echo 0)
          PM2_OFF=$(echo "$PM2_JSON" | jq '[.[]|select(.pm2_env.status=="stopped")] | length' 2>/dev/null || echo 0)
          PM2_ERR=$(echo "$PM2_JSON" | jq '[.[]|select(.pm2_env.status=="errored")] | length' 2>/dev/null || echo 0)

          TIPO="sucesso"; EMOJI="✅"; ALERTAS=""
          if [ "${PM2_ERR:-0}" -gt 0 ]; then
            TIPO="erro"; EMOJI="❌"
            ALERTAS="${ALERTAS}\n• PM2 com ${PM2_ERR} processo(s) em erro"
          fi
          if [ "${DISK_PCT:-0}" -ge 90 ]; then
            TIPO="critico"; EMOJI="🚨"
            ALERTAS="${ALERTAS}\n• Disco / em ${DISK_PCT}%"
          elif [ "${DISK_PCT:-0}" -ge 80 ] && [ "$TIPO" = "sucesso" ]; then
            TIPO="aviso"; EMOJI="⚠️"
            ALERTAS="${ALERTAS}\n• Disco / em ${DISK_PCT}%"
          fi

          TITULO="${EMOJI} HealthCheck VPS"
          MSG="<b>Host:</b> ${HOST}\n<b>Uptime:</b> ${UPTIME}\n<b>Load:</b> ${LOAD}\n<b>Disco /:</b> ${DISK}\n<b>Memória:</b> ${MEM}\n<b>PM2:</b> ${PM2_ON} online · ${PM2_OFF} parados · ${PM2_ERR} erro${ALERTAS}"

          echo "==== Relatório ===="
          echo -e "$MSG"
          echo "==================="

          if [ -z "${NOTIFY_API_KEY:-}" ]; then
            echo "::warning::NOTIFY_API_KEY ausente no repo — relatório apenas no log."
            exit 0
          fi

          PAYLOAD=$(jq -nc \
            --arg origem "vps-healthcheck" \
            --arg tipo "$TIPO" \
            --arg titulo "$TITULO" \
            --arg mensagem "$(echo -e "$MSG")" \
            '{origem:$origem, tipo:$tipo, titulo:$titulo, mensagem:$mensagem}')

          curl -sS -X POST "https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/notify-telegram" \
            -H "x-notify-key: ${NOTIFY_API_KEY}" \
            -H "Content-Type: application/json" \
            -d "$PAYLOAD"
          echo

```